/**
 * Complete Integration Test for Appointment API + Supabase
 * 
 * This script tests:
 * 1. Connection to Supabase
 * 2. Availability check endpoint
 * 3. Creating an appointment
 * 4. Verifying data in database
 */

import dotenv from 'dotenv';
import path from 'path';
import { getSupabaseClient } from './db/supabase';

// Load environment variables from api/.env
dotenv.config({ path: path.join(process.cwd(), 'api', '.env') });

const API_URL = 'http://localhost:3001/api';

// Get next Wednesday from today (always a future, non-Sunday date)
function getNextWednesday(): Date {
  const today = new Date();
  const daysUntilWednesday = (3 - today.getDay() + 7) % 7 || 7;
  const nextWed = new Date(today);
  nextWed.setDate(today.getDate() + daysUntilWednesday);
  nextWed.setHours(0, 0, 0, 0);
  return nextWed;
}

// Test data
const testAppointment = {
  services: [
    {
      id: 2,
      name: 'Manicure + Gel Polish (Shellac)',
      price: '$70',
      duration: '2h'
    },
    {
      id: 11,
      name: 'Gel Polish Removal',
      price: '$20',
      duration: '30m'
    }
  ],
  date: getNextWednesday(), // Always next Wednesday
  timeSlot: '14:00',
  notes: 'Test appointment - please ignore',
  user: {
    name: 'Test',
    lastname: 'User',
    telephone: '+1234567890',
    email: 'test@example.com'
  }
};

async function testSupabaseConnection() {
  console.log('\n🔍 Test 1: Supabase Connection');
  console.log('================================');
  
  try {
    const supabase = getSupabaseClient();
    
    // Try a simple query
    const { data, error } = await supabase
      .from('appointments')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connected successfully!');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return false;
  }
}

async function testCheckAvailability() {
  console.log('\n🔍 Test 2: Check Availability Endpoint');
  console.log('========================================');
  
  try {
    const date = testAppointment.date.toISOString();
    const serviceIds = testAppointment.services.map(s => s.id).join(',');
    const url = `${API_URL}/appointments/availability?date=${date}&serviceIds=${serviceIds}`;
    
    console.log(`📡 GET ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', data);
      return false;
    }
    
    console.log('✅ Availability check successful!');
    console.log(`   Business hours: ${data.businessHours.start}:00 - ${data.businessHours.end}:00`);
    console.log(`   Available slots: ${data.slots.filter((s: any) => s.available).length}`);
    console.log(`   Booked slots: ${data.slots.filter((s: any) => !s.available).length}`);
    
    return true;
  } catch (error) {
    console.error('❌ Availability check failed:', error);
    return false;
  }
}

async function testCreateAppointment() {
  console.log('\n🔍 Test 3: Create Appointment');
  console.log('==============================');
  
  try {
    const url = `${API_URL}/appointments`;
    
    console.log('📡 POST', url);
    console.log('   Data:', {
      services: testAppointment.services.length + ' services',
      date: testAppointment.date.toISOString().split('T')[0],
      timeSlot: testAppointment.timeSlot,
      user: `${testAppointment.user.name} ${testAppointment.user.lastname}`
    });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testAppointment)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', data);
      return null;
    }
    
    console.log('✅ Appointment created successfully!');
    console.log('   ID:', data.appointment.id);
    console.log('   Date:', data.appointment.date);
    console.log('   Time:', data.appointment.timeSlot, '-', data.appointment.endTime);
    console.log('   Total:', '$' + data.appointment.totalPrice);
    console.log('   Duration:', data.appointment.totalDuration + ' minutes');
    
    return data.appointment.id;
  } catch (error) {
    console.error('❌ Create appointment failed:', error);
    return null;
  }
}

async function testVerifyInDatabase(appointmentId: string) {
  console.log('\n🔍 Test 4: Verify in Database');
  console.log('===============================');
  
  try {
    const supabase = getSupabaseClient();
    
    // Get appointment
    const { data: appointment, error: aptError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();
    
    if (aptError) {
      console.error('❌ Failed to fetch appointment:', aptError);
      return false;
    }
    
    console.log('✅ Appointment found in database!');
    console.log('   Customer:', appointment.customer_name, appointment.customer_lastname);
    console.log('   Phone:', appointment.customer_telephone);
    console.log('   Status:', appointment.status);
    
    // Get services
    const { data: services, error: svcError } = await supabase
      .from('appointment_services')
      .select('*')
      .eq('appointment_id', appointmentId);
    
    if (svcError) {
      console.error('❌ Failed to fetch services:', svcError);
      return false;
    }
    
    console.log('✅ Services found:', services?.length);
    services?.forEach((service, i) => {
      console.log(`   ${i + 1}. ${service.service_name} - ${service.service_price} (${service.service_duration})`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Database verification failed:', error);
    return false;
  }
}

async function cleanupTestData(appointmentId: string) {
  console.log('\n🧹 Cleanup: Removing test data');
  console.log('================================');
  
  try {
    const supabase = getSupabaseClient();
    
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId);
    
    if (error) {
      console.error('⚠️ Failed to cleanup:', error);
      return false;
    }
    
    console.log('✅ Test data cleaned up');
    return true;
  } catch (error) {
    console.error('⚠️ Cleanup failed:', error);
    return false;
  }
}

async function runAllTests() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   APPOINTMENT API - FULL INTEGRATION TEST  ║');
  console.log('╚════════════════════════════════════════════╝');
  
  let appointmentId: string | null = null;
  
  try {
    // Clean up any leftover test data first
    console.log('\n🧹 Pre-test cleanup...');
    const supabase = getSupabaseClient();
    await supabase
      .from('appointments')
      .delete()
      .or('customer_email.eq.test@example.com,customer_telephone.eq.+1234567890');
    console.log('✓ Cleanup complete\n');
    
    // Test 1: Supabase connection
    const test1 = await testSupabaseConnection();
    if (!test1) {
      console.log('\n❌ FAILED: Check your .env file for Supabase credentials');
      process.exit(1);
    }
    
    // Test 2: Availability endpoint
    const test2 = await testCheckAvailability();
    if (!test2) {
      console.log('\n❌ FAILED: Availability endpoint not working');
      process.exit(1);
    }
    
    // Test 3: Create appointment
    appointmentId = await testCreateAppointment();
    if (!appointmentId) {
      console.log('\n❌ FAILED: Could not create appointment');
      process.exit(1);
    }
    
    // Test 4: Verify in database
    const test4 = await testVerifyInDatabase(appointmentId);
    if (!test4) {
      console.log('\n❌ FAILED: Data not saved correctly in database');
      process.exit(1);
    }
    
    // Cleanup
    await cleanupTestData(appointmentId);
    
    // Success summary
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║          ✅ ALL TESTS PASSED! ✅           ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log('\n✓ Supabase connection working');
    console.log('✓ Availability endpoint working');
    console.log('✓ Create appointment endpoint working');
    console.log('✓ Data saved to database correctly');
    console.log('\n🎉 Your appointment system is ready to use!');
    
  } catch (error) {
    console.error('\n❌ UNEXPECTED ERROR:', error);
    
    if (appointmentId) {
      console.log('\n🧹 Attempting cleanup...');
      await cleanupTestData(appointmentId);
    }
    
    process.exit(1);
  }
}

// Run tests
runAllTests();
