# Nail Salon Appointment Application - Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER (Angular + SSR)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐  ┌─────────────────────────────────────────────────┐ │
│  │   Home Page      │  │              Appointments (4-step stepper)      │ │
│  │   Component      │  │  Step 1: Service Selection                      │ │
│  └──────────────────┘  │  Step 2: Date & Time Selection                  │ │
│                        │  Step 3: User Information                       │ │
│                        │  Step 4: Confirmation                           │ │
│                        └─────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     Angular Services Layer                          │   │
│  │  • AppointmentService (HTTP calls to API)                           │   │
│  │  • SpamProtectionService (client-side rate limiting)                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     │ HTTPS / API calls (/api/*)
                                     │
┌────────────────────────────────────▼────────────────────────────────────────┐
│                    BACKEND LAYER (Express.js + TypeScript)                  │
│                    Deployed as Netlify Serverless Function                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  GET  /api/health                  — health check                    │  │
│  │  GET  /api/appointments/availability — time-slot availability        │  │
│  │  POST /api/appointments            — create & persist appointment    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     Middleware                                       │   │
│  │  • CORS (localhost + Netlify subdomains)                             │   │
│  │  • express.json / urlencoded body parsing                           │   │
│  │  • 404 and error-handler middleware                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└──────┬──────────────────────────────────────────┬───────────────────────────┘
       │                                          │
       │ Supabase client                          │ Nodemailer (Gmail SMTP)
       ▼                                          ▼
┌─────────────────────────┐          ┌────────────────────────────┐
│  DATABASE (Supabase /   │          │  EMAIL (Gmail SMTP)         │
│  PostgreSQL)            │          │                            │
│                         │          │  • Customer confirmation    │
│  appointments           │          │  • Admin notification      │
│  appointment_services   │          │                            │
└─────────────────────────┘          └────────────────────────────┘
```

---

## Component Breakdown

### 1. Frontend (Angular with SSR)

#### Home Page Component
- Hero section, services showcase, booking call-to-action
- SEO-optimized with meta tags and Angular SSR

#### Appointments Component — 4-step linear stepper

**Step 1: Service Selection**
- Multiple services selectable from a catalog of 10 services
- Real-time total duration and price calculation

**Step 2: Date & Time Selection**
- Date picker — excludes Sundays and past dates
- Calls `GET /api/appointments/availability` to load real-time slots
- Falls back to client-side generation when the API is unavailable
- 30-minute slot grid with business hours:
  - Monday–Friday 10:00–19:00
  - Saturday 10:00–17:00
- Optional notes field

**Step 3: User Information**
- First name, last name, telephone (required + validated)
- Email (optional, format-validated)

**Step 4: Confirmation**
- Full summary: services, date/time, contact info
- Edit buttons to jump back to any previous step
- Submits via `POST /api/appointments` and shows a success screen

#### Angular Services

**AppointmentService** (`src/app/services/appointment.service.ts`)
- `checkAvailability(date, serviceIds)` → `GET /api/appointments/availability`
- `createAppointment(data)` → `POST /api/appointments`

**SpamProtectionService** (`src/app/services/spam-protection.service.ts`)
- Client-side rate limiting: max 5 bookings/hour, 10/day per device
- 30-second minimum cooldown between submissions
- LocalStorage-based tracking

---

### 2. Backend API (Express.js + TypeScript)

Runs locally on port 3001. In production, wrapped by `netlify/functions/api.ts` and served via the Netlify Functions redirect defined in `netlify.toml`.

#### `GET /api/health`
Returns `{ status, timestamp, environment }`.

#### `GET /api/appointments/availability`
- Validates date (not Sunday, not past)
- Generates 30-minute slots within business hours
- Filters each slot against Supabase via `checkTimeSlotAvailability()`
- Falls back to "available" if the database is unreachable

#### `POST /api/appointments`
1. Validates all required fields (`services`, `date`, `timeSlot`, `user.name`, `user.lastname`, `user.telephone`)
2. Calculates `endTime` and `totalPrice` from the service list
3. Rechecks availability in Supabase (prevents double-booking)
4. Saves appointment row via `createAppointment()`
5. Saves service rows via `createAppointmentServices()`
6. Calls `sendAllNotifications()` (awaited — required for serverless)
7. Returns the created appointment

---

### 3. Database (Supabase — PostgreSQL)

Schema defined in `api/db/SCHEMA.md`.

**`appointments` table**
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| appointment_date | DATE | |
| appointment_time | TIME | |
| end_time | TIME | |
| notes | TEXT | Optional |
| status | VARCHAR | `'completed'` \| `'cancelled'` |
| customer_name | VARCHAR | |
| customer_lastname | VARCHAR | |
| customer_telephone | VARCHAR | |
| customer_email | VARCHAR | Optional |
| total_price | DECIMAL | |
| total_duration_minutes | INTEGER | |
| created_at / updated_at | TIMESTAMPTZ | |

**`appointment_services` table**
Junction table linking one appointment to its selected services (appointment_id FK → appointments.id CASCADE).

**Implemented query helpers (`api/db/supabase.ts`)**
- `checkTimeSlotAvailability(date, startTime, endTime)` — overlap query
- `createAppointment(data)` — insert + returning
- `createAppointmentServices(services[])` — bulk insert

---

### 4. Email Notifications (Gmail SMTP)

Implemented in `api/email/email.service.ts` using Nodemailer.

`sendAllNotifications(data: AppointmentEmailData)` sends two emails in parallel:
- **Customer confirmation** — full appointment details, business address, Google Maps link
- **Admin notification** — customer contact info + all booking details

Both emails use inline HTML templates built as strings inside the service.

---

### 5. Hosting & Deployment

| Layer | Platform |
|---|---|
| Frontend (Angular SSR) | Netlify (`@netlify/angular-runtime`) |
| Backend API | Netlify Functions (`netlify/functions/api.ts`) |
| Database | Supabase (managed PostgreSQL) |
| Repository | GitHub |

All `/api/*` requests are redirected to the serverless function via `netlify.toml`.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 17+ with SSR, Angular Material, SCSS, RxJS |
| Backend | Node.js 20+, Express.js, TypeScript |
| Database | Supabase (PostgreSQL) |
| Email | Nodemailer with Gmail SMTP |
| Hosting | Netlify (frontend + serverless functions) |

---

## Security

- CORS restricted to known origins (localhost dev + any `.netlify.app` subdomain)
- Input validation on all `POST /appointments` required fields
- Time-slot conflict re-checked at write time
- Credentials stored in environment variables only (never committed)

