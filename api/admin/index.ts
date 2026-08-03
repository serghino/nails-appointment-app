import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware';
import {
  getSupabaseClient,
  getAppointmentById,
  getAppointmentServices,
  updateAppointmentStatus,
  DbAppointment
} from '../db/supabase';
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
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true })
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
