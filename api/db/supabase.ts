import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Database types
export interface DbAppointment {
  id?: string;
  appointment_date: string;
  appointment_time: string;
  end_time: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
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
  endTime: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  // Query for overlapping appointments on the same date
  const { data, error } = await supabase
    .from('appointments')
    .select('id, appointment_time, end_time')
    .eq('appointment_date', date)
    .in('status', ['pending', 'confirmed'])
    .or(`and(appointment_time.lte.${endTime},end_time.gt.${startTime})`);

  if (error) {
    console.error('Error checking availability:', error);
    throw new Error('Failed to check time slot availability');
  }

  // If any appointments found, slot is not available
  return !data || data.length === 0;
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
