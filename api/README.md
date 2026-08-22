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

### Admin Login
```
POST /api/auth/login
```
**Body:**
```json
{ "username": "admin", "password": "your_password" }
```

**Response:**
```json
{ "token": "eyJhbGciOi..." }
```
Returns a JWT (default expiry `8h`, configurable via `JWT_EXPIRES_IN`). Send it as `Authorization: Bearer <token>` on all `/api/admin/*` requests.

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

## � Admin Endpoints

All routes below are mounted under `/api/admin` and require a valid JWT (`Authorization: Bearer <token>`), enforced by `middleware/auth.middleware.ts`.

### List Appointments
```
GET /api/admin/appointments?date=2026-02-10&status=completed&offset=0&limit=50
```
Optional filters: `date` (`YYYY-MM-DD`), `status` (`completed` | `cancelled`). Returns a paginated response:
```json
{ "totalRecords": 42, "offset": 0, "limit": 50, "appointments": [...] }
```

### Get Appointment Details
```
GET /api/admin/appointments/:id
```
Returns the appointment row plus its linked `services`.

### Reschedule / Edit Appointment
```
PUT /api/admin/appointments/:id
```
**Body:**
```json
{
  "date": "2026-02-10",
  "timeSlot": "14:00",
  "services": [{ "id": 1, "name": "Classic Manicure", "duration": "1h", "price": "$30" }],
  "notes": "Optional notes"
}
```
Recomputes `totalPrice`/`totalDurationMinutes` from the submitted services, rechecks slot availability (excluding the appointment being edited), then replaces the appointment's date/time/services.

### Update Status
```
PATCH /api/admin/appointments/:id/status
```
**Body:** `{ "status": "completed" | "cancelled" }`

### Cancel Appointment
```
DELETE /api/admin/appointments/:id
```
Sets `status = 'cancelled'`. Unlike the (removed) customer-facing cancellation, admins are not subject to a 12-hour cutoff.

---

## 🗄️ Database (Supabase)

The API uses Supabase (PostgreSQL). See `db/SCHEMA.md` for the full SQL schema.

**Tables:**
- `appointments` — stores appointment records
- `appointment_services` — junction table linking appointments to their services

**Implemented helpers (`db/supabase.ts`):**
- `checkTimeSlotAvailability(date, startTime, endTime, excludeAppointmentId?)` — checks for overlapping bookings; the optional `excludeAppointmentId` skips the appointment being edited
- `getBookedSlotsForDate(date)` — fetches all booked time ranges for a date in a single query (used by the availability endpoint)
- `createAppointment(data)` — inserts a new appointment row
- `createAppointmentServices(services)` — inserts the associated service rows
- `getAppointmentById(id)` / `getAppointmentServices(id)` — fetch a single appointment and its services (admin)
- `updateAppointmentStatus(id, status)` — sets `'completed'` or `'cancelled'` (admin)
- `updateAppointmentDetails(id, updates)` — updates date/time/notes/totals (admin reschedule)
- `replaceAppointmentServices(id, services)` — deletes and re-inserts an appointment's services (admin edit)

See `db/helper-Insert-Apppointment.sql` for a standalone SQL script used to bulk-block whole days (inserts `'blocked by admin'` appointments) directly in Supabase — there is no API endpoint for this.

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

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRES_IN=1h

# Admin Login (single admin user)
ADMIN_USERNAME=user
ADMIN_PASSWORD_HASH=your_bcrypt_hash

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
├── auth/
│   └── index.ts               # POST /login — issues JWT for the admin user
├── admin/
│   ├── index.ts                # Protected CRUD routes for managing appointments
│   └── admin-routes.postman_collection.json
├── appointments/
│   └── index.ts               # GET /availability and POST / routes
├── middleware/
│   └── auth.middleware.ts     # requireAuth — verifies JWT on /api/admin/* routes
├── email/
│   └── email.service.ts       # Nodemailer Gmail SMTP
├── db/
│   ├── supabase.ts            # Supabase client and query helpers
│   ├── helper-Insert-Apppointment.sql  # Manual script to bulk-block days
│   └── SCHEMA.md              # PostgreSQL schema (appointments + appointment_services)
├── types/
│   └── paginated.ts           # IPaginated interface used by admin list endpoint
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
- `/api/admin/*` routes require a valid JWT (`requireAuth` middleware); admin login password is stored as a bcrypt hash, never in plaintext
- Non-`GET` requests must send `Content-Type: application/json`
