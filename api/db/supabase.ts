import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Database types
export interface DbAppointment {
  id?: string;
  appointment_date: string;
  appointment_time: string;
  end_time: string;
  notes?: string;
  status: 'completed' | 'cancelled';
  customer_name: string;
  customer_lastname: string;
  customer_telephone: string;
  customer_email?: string;
  total_price: number;
  total_duration_minutes: number;
  created_at?: string;
  updated_at?: string;
}

export interface DbAppointmentService {
  id?: string;
  appointment_id: string;
  service_id: number;
  service_name: string;
  service_duration: string;
  service_price: string;
  created_at?: string;
}

// Initialize Supabase client
let supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    const supabaseUrl = process.env['SUPABASE_URL'];
    const supabaseKey = process.env['SUPABASE_ANON_KEY'];
    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.'
      );
    }

    supabase = createClient(supabaseUrl, supabaseKey);
  }

  return supabase;
}

// Database query helpers
export async function checkTimeSlotAvailability(
  date: string,
  startTime: string,
  endTime: string,
  excludeAppointmentId?: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  // Query for overlapping appointments on the same date
  let query = supabase
    .from('appointments')
    .select('id, appointment_time, end_time')
    .eq('appointment_date', date)
    .in('status', ['completed'])
    .or(`and(appointment_time.lt.${endTime},end_time.gt.${startTime})`);

  // Exclude the appointment being edited so it doesn't conflict with itself
  if (excludeAppointmentId) {
    query = query.neq('id', excludeAppointmentId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error checking availability:', error);
    throw new Error('Failed to check time slot availability');
  }

  // If any appointments found, slot is not available
  return !data || data.length === 0;
}

/**
 * Fetch all booked time ranges for a given date in a single query.
 * Use this instead of calling checkTimeSlotAvailability in a loop.
 */
export async function getBookedSlotsForDate(
  date: string
): Promise<{ appointment_time: string; end_time: string }[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('appointments')
    .select('appointment_time, end_time')
    .eq('appointment_date', date)
    .in('status', ['completed']);

  if (error) {
    console.error('Error fetching booked slots:', error);
    throw new Error('Failed to fetch booked slots for date');
  }

  return data || [];
}

export async function createAppointment(
  appointmentData: DbAppointment
): Promise<DbAppointment> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('appointments')
    .insert([appointmentData])
    .select()
    .single();

  if (error) {
    console.error('Error creating appointment:', error);
    throw new Error('Failed to create appointment');
  }

  return data;
}

export async function createAppointmentServices(
  services: DbAppointmentService[]
): Promise<DbAppointmentService[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('appointment_services')
    .insert(services)
    .select();

  if (error) {
    console.error('Error creating appointment services:', error);
    throw new Error('Failed to save appointment services');
  }

  return data;
}

export async function getAppointmentById(id: string): Promise<DbAppointment | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching appointment:', error);
    return null;
  }

  return data;
}

export async function getAppointmentServices(
  appointmentId: string
): Promise<DbAppointmentService[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('appointment_services')
    .select('*')
    .eq('appointment_id', appointmentId);

  if (error) {
    console.error('Error fetching appointment services:', error);
    return [];
  }

  return data || [];
}

export async function updateAppointmentStatus(
  id: string,
  status: DbAppointment['status']
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('appointments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error updating appointment status:', error);
    throw new Error('Failed to update appointment status');
  }
}

/**
 * Update an appointment's date/time/services/notes/totals (admin reschedule/edit).
 */
export async function updateAppointmentDetails(
  id: string,
  updates: Partial<
    Pick<
      DbAppointment,
      'appointment_date' | 'appointment_time' | 'end_time' | 'notes' | 'total_price' | 'total_duration_minutes'
    >
  >
): Promise<DbAppointment> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('appointments')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating appointment details:', error);
    throw new Error('Failed to update appointment');
  }

  return data;
}

/**
 * Replace all services linked to an appointment (used when editing an appointment's services).
 */
export async function replaceAppointmentServices(
  appointmentId: string,
  services: DbAppointmentService[]
): Promise<DbAppointmentService[]> {
  const supabase = getSupabaseClient();

  const { error: deleteError } = await supabase
    .from('appointment_services')
    .delete()
    .eq('appointment_id', appointmentId);

  if (deleteError) {
    console.error('Error removing previous appointment services:', deleteError);
    throw new Error('Failed to update appointment services');
  }

  return createAppointmentServices(services);
}
