import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware';
import {
  getSupabaseClient,
  getAppointmentById,
  getAppointmentServices,
  updateAppointmentStatus,
  updateAppointmentDetails,
  replaceAppointmentServices,
  checkTimeSlotAvailability,
  DbAppointment,
  DbAppointmentService
} from '../db/supabase';
import { calculateEndTime } from '../utils/time.utils';
import { IPaginated } from '../types/paginated';

const router = Router();

// All admin routes require a valid JWT
router.use(requireAuth);

/**
 * GET /api/admin/appointments
 * List all appointments, optionally filtered by date and/or status.
 * Query params: date (YYYY-MM-DD), status ('completed' | 'cancelled')
 */
router.get('/appointments', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const date = req.query['date'] as string | undefined;
    const status = req.query['status'] as string | undefined;
    const offsetParam = req.query['offset'];
    const limitParam = req.query['limit'];

    const offset =
      offsetParam === undefined ? 0 : Number(Array.isArray(offsetParam) ? offsetParam[0] : offsetParam);
    const limit =
      limitParam === undefined ? 50 : Number(Array.isArray(limitParam) ? limitParam[0] : limitParam);

    if (!Number.isInteger(offset) || offset < 0) {
      res.status(400).json({ error: 'offset must be a non-negative integer' });
      return;
    }

    if (!Number.isInteger(limit) || limit <= 0) {
      res.status(400).json({ error: 'limit must be a positive integer' });
      return;
    }

    const supabase = getSupabaseClient();

    let countQuery = supabase.from('appointments').select('id', { count: 'exact', head: true });

    if (date) {
      countQuery = countQuery.eq('appointment_date', date);
    }

    if (status) {
      countQuery = countQuery.eq('status', status);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Error fetching appointment count:', countError);
      res.status(500).json({ error: 'Failed to fetch appointments count' });
      return;
    }

    let query = supabase
      .from('appointments')
      .select(`
        *,
        appointment_services (
          service_id,
          service_name,
          service_duration,
          service_price
        )
      `)
      .order('appointment_date', { ascending: false })
      .order('appointment_time', { ascending: false })
      .range(offset, offset + limit - 1);

    if (date) {
      query = query.eq('appointment_date', date);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({ error: 'Failed to fetch appointments' });
      return;
    }

    const paginatedResponse: IPaginated & { appointments: unknown[] } = {
      totalRecords: count ?? 0,
      offset,
      limit,
      appointments: data || []
    };

    res.json(paginatedResponse);
  } catch (error) {
    console.error('Admin GET /appointments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/appointments/:id
 * Get a single appointment with its services.
 */
router.get('/appointments/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params['id'] as string;

    const appointment = await getAppointmentById(id);
    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    const services = await getAppointmentServices(id);

    res.json({ appointment: { ...appointment, services } });
  } catch (error) {
    console.error('Admin GET /appointments/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/admin/appointments/:id
 * Reschedule an appointment and/or change its services.
 * Body: { date: 'YYYY-MM-DD', timeSlot: 'HH:MM', services: [{ id, name, duration, price }], notes? }
 */
router.put('/appointments/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params['id'] as string;
    const { date, timeSlot, services, notes } = req.body;

    const existing = await getAppointmentById(id);
    if (!existing) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    if (!date || !timeSlot) {
      res.status(400).json({ error: 'Missing required fields: date, timeSlot' });
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({ error: 'Invalid date format. Expected YYYY-MM-DD' });
      return;
    }

    if (!/^\d{2}:\d{2}$/.test(timeSlot)) {
      res.status(400).json({ error: 'Invalid time slot format. Expected HH:MM' });
      return;
    }

    if (!Array.isArray(services) || services.length === 0) {
      res.status(400).json({ error: 'Services must be a non-empty array' });
      return;
    }

    // Recompute totals from the submitted services rather than trusting client-sent totals
    let totalDurationMinutes = 0;
    let totalPrice = 0;

    for (const service of services) {
      const hoursMatch = String(service.duration).match(/(\d+)h/);
      const minutesMatch = String(service.duration).match(/(\d+)m/);
      const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
      const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
      totalDurationMinutes += (hours * 60) + minutes;
      totalPrice += parseInt(String(service.price).replace('$', ''));
    }

    const endTime = calculateEndTime(timeSlot, totalDurationMinutes);

    const isAvailable = await checkTimeSlotAvailability(date, timeSlot, endTime, id);
    if (!isAvailable) {
      res.status(409).json({ error: 'Time slot is no longer available' });
      return;
    }

    const updatedAppointment = await updateAppointmentDetails(id, {
      appointment_date: date,
      appointment_time: timeSlot,
      end_time: endTime,
      notes: notes ?? existing.notes,
      total_price: totalPrice,
      total_duration_minutes: totalDurationMinutes
    });

    const appointmentServices: DbAppointmentService[] = services.map((service: any) => ({
      appointment_id: id,
      service_id: service.id,
      service_name: service.name,
      service_duration: service.duration,
      service_price: service.price
    }));

    const updatedServices = await replaceAppointmentServices(id, appointmentServices);

    res.json({ success: true, appointment: { ...updatedAppointment, appointment_services: updatedServices } });
  } catch (error) {
    console.error('Admin PUT /appointments/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/admin/appointments/:id/status
 * Update appointment status (complete or cancel).
 * Body: { status: 'completed' | 'cancelled' }
 */
router.patch('/appointments/:id/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params['id'] as string;
    const { status } = req.body;

    if (!status || !['completed', 'cancelled'].includes(status)) {
      res.status(400).json({ error: "Status must be 'completed' or 'cancelled'" });
      return;
    }

    const appointment = await getAppointmentById(id);
    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    await updateAppointmentStatus(id, status as DbAppointment['status']);

    res.json({ success: true, id, status });
  } catch (error) {
    console.error('Admin PATCH /appointments/:id/status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/admin/appointments/:id
 * Cancel an appointment (sets status = 'cancelled').
 * Admin has no 12-hour restriction — only customers do.
 */
router.delete('/appointments/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params['id'] as string;

    const appointment = await getAppointmentById(id);
    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    await updateAppointmentStatus(id, 'cancelled');

    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (error) {
    console.error('Admin DELETE /appointments/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
