import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/appointments/availability
 * Check available time slots for a given date
 * Query params: date (ISO string), serviceIds (comma-separated)
 */
router.get('/availability', async (req: Request, res: Response) => {
  try {
    const { date, serviceIds } = req.query;

    if (!date || !serviceIds) {
      return res.status(400).json({
        error: 'Missing required parameters: date, serviceIds'
      });
    }

    // Parse date and service IDs
    const selectedDate = new Date(date as string);
    const services = (serviceIds as string).split(',');

    // Get day of week
    const dayOfWeek = selectedDate.getDay();

    // Check if date is valid (not Sunday, not in the past)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today || dayOfWeek === 0) {
      return res.status(400).json({
        error: 'Invalid date: Date must be in the future and not Sunday'
      });
    }

    // Define business hours
    let startHour: number;
    let endHour: number;

    if (dayOfWeek === 6) { // Saturday
      startHour = 10;
      endHour = 17;
    } else { // Monday-Friday
      startHour = 10;
      endHour = 19;
    }

    // Service catalog - should match frontend NAIL_SERVICE_CATALOG
    const serviceCatalog: { [key: string]: string } = {
      '1': '2h 30m',
      '2': '2h',
      '3': '2h',
      '4': '1h 15m',
      '5': '1h',
      '6': '1h',
      '7': '1h',
      '8': '30m',
      '9': '1h',
      '10': '30m'
    };

    // Calculate total duration from actual services
    let totalDurationMinutes = 0;
    for (const serviceId of services) {
      const duration = serviceCatalog[serviceId];
      if (duration) {
        const hoursMatch = duration.match(/(\d+)h/);
        const minutesMatch = duration.match(/(\d+)m/);
        const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
        const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
        totalDurationMinutes += (hours * 60) + minutes;
      }
    }

    // Generate time slots
    const availableSlots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Check if appointment would end before closing
        const slotStartMinutes = hour * 60 + minute;
        const appointmentEndMinutes = slotStartMinutes + totalDurationMinutes;
        const closingTimeMinutes = endHour * 60;

        if (appointmentEndMinutes <= closingTimeMinutes) {
          // TODO: Check database for existing appointments at this time
          const isBooked = false; // Placeholder

          availableSlots.push({
            time,
            available: !isBooked,
            endTime: calculateEndTime(time, totalDurationMinutes)
          });
        }
      }
    }

    res.json({
      date: selectedDate.toISOString(),
      dayOfWeek,
      businessHours: { start: startHour, end: endHour },
      slots: availableSlots
    });

  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/appointments
 * Get all appointments for a user
 * Query params: userId (optional), status (optional)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId, status } = req.query;

    // TODO: Implement authentication and get userId from token
    // TODO: Query database for user's appointments

    res.json({
      appointments: [],
      message: 'Endpoint ready for database integration'
    });

  } catch (error) {
    console.error('Error getting appointments:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/appointments
 * Create a new appointment
 * Body: { services, date, timeSlot, notes, user }
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { services, date, timeSlot, notes, user } = req.body;

    // Validate required fields
    if (!services || !date || !timeSlot || !user) {
      return res.status(400).json({
        error: 'Missing required fields: services, date, timeSlot, user'
      });
    }

    // Validate user contact info
    if (!user.name || !user.lastname || !user.telephone) {
      return res.status(400).json({
        error: 'Missing required user information: name, lastname, telephone'
      });
    }

    // TODO: Check if time slot is still available
    // TODO: Save to database
    // TODO: Send notifications (email/SMS)

    const appointmentData = {
      id: generateId(), // Temporary ID generator
      services,
      date,
      timeSlot,
      notes,
      user,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      appointment: appointmentData,
      message: 'Appointment created successfully (mock data - database integration pending)'
    });

  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * PUT /api/appointments/:id
 * Update an existing appointment
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // TODO: Implement authentication
    // TODO: Check if user owns this appointment
    // TODO: Update in database

    res.json({
      success: true,
      message: `Appointment ${id} updated (endpoint ready for implementation)`
    });

  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * DELETE /api/appointments/:id
 * Cancel an appointment (with 12-hour check)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // TODO: Get appointment from database
    // TODO: Check if appointment exists and user owns it
    
    // Simulate appointment data for 12-hour check
    const appointment = {
      id,
      date: '2026-02-10T14:00:00.000Z',
      timeSlot: '14:00'
    };

    // Check 12-hour cancellation rule
    const appointmentDateTime = new Date(`${appointment.date.split('T')[0]}T${appointment.timeSlot}`);
    const now = new Date();
    const hoursDifference = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDifference < 12) {
      return res.status(400).json({
        error: 'Cannot cancel appointment less than 12 hours before scheduled time',
        hoursRemaining: Math.round(hoursDifference * 10) / 10
      });
    }

    // TODO: Update appointment status to 'cancelled' in database
    // TODO: Send cancellation notifications

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/appointments/admin
 * Get all appointments (admin only)
 * Query params: date (optional), status (optional)
 */
router.get('/admin', async (req: Request, res: Response) => {
  try {
    // TODO: Implement admin authentication
    // TODO: Query all appointments from database

    const { date, status } = req.query;

    res.json({
      appointments: [],
      message: 'Admin endpoint ready for implementation'
    });

  } catch (error) {
    console.error('Error getting admin appointments:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Helper functions
function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const endMinutes = minutes + durationMinutes;
  const endHours = hours + Math.floor(endMinutes / 60);
  const finalMinutes = endMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
}

function generateId(): string {
  return `apt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

export default router;
