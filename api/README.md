# Nails Appointment App - Backend API

Backend REST API for the Nails Appointment application built with Express.js and TypeScript, deployed as a Netlify serverless function.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ installed
- npm package manager

### Installation

```bash
# Install dependencies (from project root)
npm install

# Configure environment variables
cp api/.env.example api/.env
# Edit api/.env with your configuration
```

### Development

Run the API server in development mode with auto-reload:

```bash
npm run api:dev
```

The API will be available at `http://localhost:3001`

### Run Frontend + Backend Together

```bash
npm run dev
```

This command runs both:
- Angular frontend on `http://localhost:4200`
- Express API on `http://localhost:3001`

### Build for Production

```bash
npm run build
```

---

## 📡 API Endpoints

### Health Check
```
GET /api/health
```
Returns API status, timestamp, and current environment.

### Check Availability
```
GET /api/appointments/availability?date=2026-02-10T00:00:00.000Z&serviceIds=1,2
```
**Query Parameters:**
- `date` (required): ISO date string
- `serviceIds` (required): Comma-separated service IDs (1–10)

**Response:**
```json
{
  "date": "2026-02-10T00:00:00.000Z",
  "dayOfWeek": 1,
  "businessHours": { "start": 10, "end": 19 },
  "slots": [
    { "time": "10:00", "available": true, "endTime": "11:30" }
  ]
}
```

Business hours:
- Monday–Friday: 10:00–19:00
- Saturday: 10:00–17:00
- Sunday: closed

Slots are generated every 30 minutes and filtered against existing appointments in Supabase.

### Create Appointment
```
POST /api/appointments
```
**Body:**
```json
{
  "services": [
    { "id": 1, "name": "Classic Manicure", "price": "$30", "duration": "1h" }
  ],
  "date": "2026-02-10T00:00:00.000Z",
  "timeSlot": "14:00",
  "notes": "Optional notes",
  "user": {
    "name": "Jane",
    "lastname": "Doe",
    "telephone": "+1234567890",
    "email": "jane@example.com"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "appointment": {
    "id": "uuid",
    "date": "2026-02-10",
    "timeSlot": "14:00",
    "endTime": "15:00",
    "services": [...],
    "status": "completed",
    "totalPrice": 30,
    "totalDuration": 60
  },
  "message": "Appointment created successfully"
}
```

This endpoint:
1. Validates all required fields and formats
2. Rechecks time-slot availability in Supabase before saving
3. Saves the appointment and its services to Supabase
4. Sends Gmail confirmation emails to both the customer and the admin

---

## 🗄️ Database (Supabase)

The API uses Supabase (PostgreSQL). See `db/SCHEMA.md` for the full SQL schema.

**Tables:**
- `appointments` — stores appointment records
- `appointment_services` — junction table linking appointments to their services

**Implemented helpers (`db/supabase.ts`):**
- `checkTimeSlotAvailability(date, startTime, endTime)` — checks for overlapping bookings
- `createAppointment(data)` — inserts a new appointment row
- `createAppointmentServices(services)` — inserts the associated service rows

---

## 📧 Email Notifications (Gmail SMTP)

Implemented in `email/email.service.ts` using Nodemailer.

`sendAllNotifications(data)` sends two emails simultaneously:
- **Customer confirmation** — appointment details, business address, Google Maps link
- **Admin notification** — customer contact info and full booking details

---

## 🔧 Environment Variables

Create `api/.env`:

```env
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:4200

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key

# Gmail SMTP
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password

# Admin email recipient
ADMIN_EMAIL=admin@example.com
```

---

## 🚢 Deployment (Netlify)

The Express app is wrapped as a Netlify Function in `netlify/functions/api.ts`. All `/api/*` requests are redirected to it via `netlify.toml`.

```bash
netlify deploy --prod
```

Set the environment variables above in the Netlify dashboard under **Site settings → Environment variables**.

---

## 🏗️ Project Structure

```
api/
├── server.ts                  # Express app + CORS + middleware
├── appointments/
│   └── index.ts               # GET /availability and POST / routes
├── email/
│   └── email.service.ts       # Nodemailer Gmail SMTP
├── db/
│   ├── supabase.ts            # Supabase client and query helpers
│   └── SCHEMA.md              # PostgreSQL schema (appointments + appointment_services)
├── utils/
│   └── time.utils.ts          # calculateEndTime()
├── tsconfig.json
└── .env.example

netlify/
└── functions/
    └── api.ts                 # Serverless wrapper for Express
```

---

## 🛡️ Security

- CORS restricted to known origins (localhost dev + Netlify subdomains)
- Input validation on all POST /appointments fields
- Time-slot conflict re-checked at write time (optimistic concurrency)
- Credentials stored in environment variables only
