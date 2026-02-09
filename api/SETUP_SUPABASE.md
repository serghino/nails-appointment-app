# Supabase Setup Guide

Follow these steps to set up Supabase database for your Nails Appointment App.

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or login
3. Click "New Project"
4. Fill in:
   - **Name**: `nails-appointment-app` (or your preferred name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Start with Free tier
5. Click "Create new project" and wait for setup (1-2 minutes)

## Step 2: Get Your API Credentials

1. Once project is created, go to **Settings** (gear icon in sidebar)
2. Click on **API** in the settings menu
3. You'll see:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **Project API keys**
     - `anon` `public` key (this is what you need)
4. Copy these values - you'll need them for `.env` file

## Step 3: Create Database Tables

1. In your Supabase dashboard, click **SQL Editor** in the sidebar
2. Click **New query**
3. Copy and paste the following SQL:

```sql
-- Create appointments table
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

-- Create indexes for performance
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_customer_telephone ON appointments(customer_telephone);
CREATE INDEX idx_appointments_datetime ON appointments(appointment_date, appointment_time);

-- Create appointment_services table
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

-- Create indexes
CREATE INDEX idx_appointment_services_appointment_id ON appointment_services(appointment_id);
CREATE INDEX idx_appointment_services_service_id ON appointment_services(service_id);

-- Enable Row Level Security
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_services ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing public access for now - will add auth later)
CREATE POLICY "Anyone can create appointments" ON appointments
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view appointments" ON appointments
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update appointments" ON appointments
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete appointments" ON appointments
  FOR DELETE
  USING (true);

CREATE POLICY "Anyone can create appointment services" ON appointment_services
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view appointment services" ON appointment_services
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can delete appointment services" ON appointment_services
  FOR DELETE
  USING (true);
```

4. Click **Run** (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned"

## Step 4: Verify Tables Created

1. Click **Table Editor** in the sidebar
2. You should see two tables:
   - `appointments`
   - `appointment_services`
3. Click on each table to see the columns

## Step 5: Configure Backend Environment

1. In your project, navigate to: `nails-appointment-app/api/`
2. Create a `.env` file (if it doesn't exist):
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and add your Supabase credentials:
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:4200

   # Supabase Configuration
   SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   SUPABASE_ANON_KEY=your_anon_public_key_here
   ```

## Step 6: Test the Connection

1. Start your backend server:
   ```bash
   npm run dev
   ```

2. The server should start without errors

3. Try creating a test appointment through your frontend

4. Check Supabase Table Editor to see if data was saved:
   - Go to **Table Editor** > **appointments**
   - You should see your test appointment

## Step 7: View Your Data

You can view and manage appointments directly in Supabase:

1. **Table Editor**: View/edit data in a spreadsheet-like interface
2. **SQL Editor**: Run custom queries
3. **Database** > **Backups**: Automatic backups (on paid plans)

## Troubleshooting

### Error: "Missing Supabase configuration"
- Make sure `.env` file exists in `api/` folder
- Check that `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set
- Restart your server after updating `.env`

### Error: "relation 'appointments' does not exist"
- Tables weren't created properly
- Go back to Step 3 and run the SQL again
- Check for any error messages in SQL Editor

### Error: "new row violates row-level security policy"
- RLS policies aren't set up correctly
- Run the policy creation SQL from Step 3 again

### Can't see test data
- Make sure the status filter isn't hiding your data
- Check that the appointment was created (look for success message)
- View browser console for any errors

## Next Steps

Once everything is working:

1. **Add Authentication**: 
   - Implement user login/signup
   - Update RLS policies to restrict access

2. **Add Admin Panel**:
   - Create admin user in Supabase Auth
   - Build admin interface to manage appointments

3. **Set Up Backups**:
   - Upgrade to paid plan for automatic backups
   - Or set up manual backup scripts

4. **Add Email Notifications**:
   - Implement server-side email sending
   - Set up email templates

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## Support

If you encounter issues:
1. Check Supabase Dashboard > **Project Settings** > **API** for connection details
2. View logs in **Logs** section
3. Join [Supabase Discord](https://discord.supabase.com/)
4. Check [GitHub Issues](https://github.com/supabase/supabase/issues)
