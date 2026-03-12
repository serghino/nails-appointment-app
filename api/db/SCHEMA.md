# Database Schema - Supabase PostgreSQL

This document describes the database schema for the Nails Appointment App using Supabase (PostgreSQL).

## Tables

### 1. appointments

Main table for storing appointment information.

```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  end_time TIME NOT NULL,
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  
  -- Customer information
  customer_name VARCHAR(100) NOT NULL,
  customer_lastname VARCHAR(100) NOT NULL,
  customer_telephone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),
  
  -- Calculated fields
  total_price DECIMAL(10, 2) NOT NULL,
  total_duration_minutes INTEGER NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_customer_telephone ON appointments(customer_telephone);
CREATE INDEX idx_appointments_datetime ON appointments(appointment_date, appointment_time);
```

### 2. appointment_services

Junction table linking appointments to services (many-to-many relationship).

```sql
CREATE TABLE appointment_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  
  -- Service information (denormalized for historical record)
  service_id INTEGER NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  service_duration VARCHAR(20) NOT NULL,
  service_price VARCHAR(20) NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_appointment_services_appointment_id ON appointment_services(appointment_id);
CREATE INDEX idx_appointment_services_service_id ON appointment_services(service_id);
```

## Row Level Security (RLS)

Enable RLS for security:

```sql
-- Enable RLS on appointments table
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Enable RLS on appointment_services table
ALTER TABLE appointment_services ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert appointments (for public booking)
CREATE POLICY "Anyone can create appointments" ON appointments
  FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can view their own appointments (by phone)
CREATE POLICY "Users can view own appointments" ON appointments
  FOR SELECT
  USING (true);  -- Will add authentication later

-- Policy: Admins can update appointments
CREATE POLICY "Admins can update appointments" ON appointments
  FOR UPDATE
  USING (true);  -- Will add admin role check later

-- Policy: Anyone can delete appointments (for testing/cancellation)
CREATE POLICY "Anyone can delete appointments" ON appointments
  FOR DELETE
  USING (true);  -- Will add proper restrictions later

-- Policy: Anyone can create appointment services
CREATE POLICY "Anyone can create appointment services" ON appointment_services
  FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can view appointment services
CREATE POLICY "Anyone can view appointment services" ON appointment_services
  FOR SELECT
  USING (true);

-- Policy: Anyone can delete appointment services
CREATE POLICY "Anyone can delete appointment services" ON appointment_services
  FOR DELETE
  USING (true);
```

## Setup Instructions

### 1. Create Tables in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the SQL commands above to create tables
4. Enable RLS and create policies

### 2. Alternative: Use Supabase Migration

Create a migration file:

```bash
# In your Supabase project
supabase migration new create_appointments_tables
```

Add the SQL to the migration file and run:

```bash
supabase db push
```

### 3. Verify Tables

After creation, verify in Supabase Dashboard:
- Go to **Table Editor** and confirm both tables exist
- Check **Database** > **Policies** for RLS policies
- Test by inserting a sample row

## Sample Queries

### Check for conflicting appointments
```sql
SELECT id, appointment_time, end_time
FROM appointments
WHERE appointment_date = '2026-02-10'
  AND status IN ('pending', 'confirmed')
  AND (
    (appointment_time <= '14:00' AND end_time > '12:00')
  );
```

### Get appointment with services
```sql
SELECT 
  a.*,
  json_agg(
    json_build_object(
      'id', s.service_id,
      'name', s.service_name,
      'price', s.service_price,
      'duration', s.service_duration
    )
  ) as services
FROM appointments a
LEFT JOIN appointment_services s ON a.id = s.appointment_id
WHERE a.id = 'appointment-uuid'
GROUP BY a.id;
```

### Get daily schedule
```sql
SELECT 
  a.id,
  a.appointment_time,
  a.end_time,
  a.customer_name || ' ' || a.customer_lastname as customer,
  a.status,
  COUNT(s.id) as service_count
FROM appointments a
LEFT JOIN appointment_services s ON a.id = s.appointment_id
WHERE a.appointment_date = '2026-02-10'
  AND a.status != 'cancelled'
GROUP BY a.id
ORDER BY a.appointment_time;
```

## Data Types Mapping

| Frontend | Backend | Database |
|----------|---------|----------|
| Date | Date | DATE |
| timeSlot (string) | string | TIME |
| services[] | Service[] | appointment_services table |
| user.name | string | VARCHAR |
| user.telephone | string | VARCHAR |
| price ($100) | string → number | DECIMAL |
| duration (2h 30m) | string → minutes | INTEGER |
| status | enum | VARCHAR with CHECK |

## Backup and Maintenance

### Automatic Backups
- Supabase automatically backs up your database daily (on paid plan)
- Free tier: Enable Point-in-Time Recovery (PITR) if needed

### Manual Backup
```bash
# Using Supabase CLI
supabase db dump -f backup.sql

# Restore
psql -h db.xxx.supabase.co -U postgres -d postgres -f backup.sql
```

## Future Enhancements

- [ ] Add `users` table for authentication
- [ ] Add foreign key to `users` table
- [ ] Add `services` table (instead of hardcoded catalog)
- [ ] Add `business_hours` table for configurable hours
- [ ] Add `blocked_dates` table for holidays
- [ ] Add `notifications` table for email/SMS tracking
- [ ] Add `payment_transactions` table
- [ ] Add indexes for full-text search on customer names
- [ ] Add triggers for automatic `updated_at` timestamp

## Notes

- **UUID** is used for primary keys (better for distributed systems)
- **Timestamps** use `TIMESTAMP WITH TIME ZONE` for proper timezone handling
- **Service data is denormalized** in appointment_services for historical accuracy
- **Customer info is in appointments table** (normalized to users table later)
- **Status field** uses CHECK constraint for data integrity
- **Indexes** added on frequently queried columns for performance
