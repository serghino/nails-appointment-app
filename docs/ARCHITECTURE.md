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
│  ┌──────────────────┐  │  Step 4: Confirmation                           │ │
│  │  Admin Login      │  └─────────────────────────────────────────────────┘ │
│  │  + Dashboard      │                                                     │
│  │  (auth-guarded)   │                                                     │
│  └──────────────────┘                                                     │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     Angular Services Layer                          │   │
│  │  • AppointmentService (HTTP calls to API)                           │   │
│  │  • SpamProtectionService (client-side rate limiting)                │   │
│  │  • AuthService (JWT login/logout, token storage)                    │   │
│  │  • AdminService (list/get/update/cancel appointments)                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     │ HTTPS / API calls (/api/*)
                                     │ Authorization: Bearer <JWT> for /api/admin/*
                                     │
┌────────────────────────────────────▼────────────────────────────────────────┐
│                    BACKEND LAYER (Express.js + TypeScript)                  │
│                    Deployed as Netlify Serverless Function                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  GET  /api/health                  — health check                    │  │
│  │  POST /api/auth/login              — admin login, issues JWT         │  │
│  │  GET  /api/appointments/availability — time-slot availability        │  │
│  │  POST /api/appointments            — create & persist appointment    │  │
│  │  GET  /api/admin/appointments       — list (paginated, filterable)    │  │
│  │  GET  /api/admin/appointments/:id   — get one appointment + services  │  │
│  │  PUT  /api/admin/appointments/:id   — reschedule / edit services      │  │
│  │  PATCH /api/admin/appointments/:id/status — mark completed/cancelled │  │
│  │  DELETE /api/admin/appointments/:id — cancel (admin, no time cutoff) │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     Middleware                                       │   │
│  │  • CORS (localhost + Netlify subdomains)                             │   │
│  │  • express.json / urlencoded body parsing                           │   │
│  │  • requireAuth — verifies JWT on all /api/admin/* routes             │   │
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

#### Admin Login (`src/app/pages/admin/login`)
- Username/password form, calls `AuthService.login()` (`POST /api/auth/login`)
- On success, stores the returned JWT and redirects to the admin dashboard

#### Admin Dashboard (`src/app/pages/admin/dashboard`)
- Route-guarded by `authGuard` (redirects to `/admin/login` when not authenticated)
- Lists appointments via `AdminService.getAppointments()` with filters (date, status) and pagination (`MatPaginatorModule`)
- Mark an appointment completed/cancelled (`PATCH /status`), cancel it (`DELETE`), or open the edit dialog
- Uses `MatDialog` to open `EditAppointmentDialogComponent` for rescheduling

#### Edit Appointment Dialog (`src/app/pages/admin/edit-appointment-dialog`)
- `MatDialog` component pre-filled with the selected appointment's date, time slot, services and notes
- Lets the admin change the date/time and the selected services from `NAIL_SERVICE_CATALOG`
- Submits via `AdminService.updateAppointment()` (`PUT /api/admin/appointments/:id`)

#### Angular Services

**AppointmentService** (`src/app/services/appointment.service.ts`)
- `checkAvailability(date, serviceIds)` → `GET /api/appointments/availability`
- `createAppointment(data)` → `POST /api/appointments`

**SpamProtectionService** (`src/app/services/spam-protection.service.ts`)
- Client-side rate limiting: max 5 bookings/hour, 10/day per device
- 30-second minimum cooldown between submissions
- LocalStorage-based tracking

**AuthService** (`src/app/services/auth.service.ts`)
- `login(username, password)` → `POST /api/auth/login`, stores JWT in `localStorage` (signal-based state)
- `logout()`, `getToken()`, `isAuthenticated()`

**AdminService** (`src/app/services/admin.service.ts`)
- `getAppointments(options)` → `GET /api/admin/appointments` (paginated, filterable by date/status)
- `getAppointmentById(id)`, `updateStatus(id, status)`, `updateAppointment(id, payload)`, `cancelAppointment(id)`

#### Route Protection

- `authGuard` (`src/app/guards/auth.guard.ts`) — `CanActivateFn` that blocks access to `/admin` unless `AuthService.isAuthenticated()` is true
- `authInterceptor` (`src/app/interceptors/auth.interceptor.ts`) — attaches `Authorization: Bearer <token>` to every request whose URL includes `/api/admin`, and logs out + redirects to `/admin/login` on a `401` response

---

### 2. Backend API (Express.js + TypeScript)

Runs locally on port 3001. In production, wrapped by `netlify/functions/api.ts` and served via the Netlify Functions redirect defined in `netlify.toml`.

#### `GET /api/health`
Returns `{ status, timestamp, environment }`.

#### `POST /api/auth/login`
- Validates `username`/`password` against `ADMIN_USERNAME` and the bcrypt hash in `ADMIN_PASSWORD_HASH`
- Always runs `bcrypt.compare` (even on unknown usernames) to avoid timing-based user enumeration
- Returns a signed JWT (`JWT_SECRET`, expiry `JWT_EXPIRES_IN`, default `1h`)

#### `GET /api/appointments/availability`
- Validates date (not Sunday, not past)
- Generates 30-minute slots within business hours
- Fetches all booked slots for the date in one query (`getBookedSlotsForDate()`) and checks overlap in memory
- Falls back to "available" if the database is unreachable

#### `POST /api/appointments`
1. Validates all required fields (`services`, `date`, `timeSlot`, `user.name`, `user.lastname`, `user.telephone`)
2. Calculates `endTime` and `totalPrice` from the service list
3. Rechecks availability in Supabase (prevents double-booking)
4. Saves appointment row via `createAppointment()`
5. Saves service rows via `createAppointmentServices()`
6. Calls `sendAllNotifications()` (awaited — required for serverless)
7. Returns the created appointment

#### Admin routes (`/api/admin/*`) — all protected by `requireAuth`
| Route | Purpose |
|---|---|
| `GET /appointments` | Paginated list, optional `date`/`status` filters |
| `GET /appointments/:id` | Single appointment + its services |
| `PUT /appointments/:id` | Reschedule date/time and/or replace services; totals recomputed server-side; rechecks availability excluding itself |
| `PATCH /appointments/:id/status` | Set `'completed'` or `'cancelled'` |
| `DELETE /appointments/:id` | Cancel (no 12-hour cutoff, unlike a customer-initiated cancellation) |

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
- `checkTimeSlotAvailability(date, startTime, endTime, excludeAppointmentId?)` — overlap query, can exclude the appointment being edited
- `getBookedSlotsForDate(date)` — fetches all booked ranges for a date in one query
- `createAppointment(data)` — insert + returning
- `createAppointmentServices(services[])` — bulk insert
- `getAppointmentById(id)` / `getAppointmentServices(id)` — admin lookups
- `updateAppointmentStatus(id, status)` — admin status change
- `updateAppointmentDetails(id, updates)` — admin reschedule (date/time/notes/totals)
- `replaceAppointmentServices(id, services)` — delete + re-insert an appointment's services

Days can also be bulk-blocked directly in Supabase using the standalone script `api/db/helper-Insert-Apppointment.sql` (inserts `'blocked by admin'` appointments) — there is no API endpoint for this.

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
| Auth | JWT (`jsonwebtoken`) + bcrypt password hashing (`bcryptjs`) |
| Hosting | Netlify (frontend + serverless functions) |

---

## Security

- CORS restricted to known origins (localhost dev + any `.netlify.app` subdomain)
- Input validation on all `POST /appointments` required fields
- Time-slot conflict re-checked at write time
- Credentials stored in environment variables only (never committed)
- Admin password stored as a bcrypt hash (`ADMIN_PASSWORD_HASH`); login always runs `bcrypt.compare` to avoid timing-based user enumeration
- `/api/admin/*` routes require a valid JWT, verified by the `requireAuth` middleware; the Angular `authInterceptor` attaches the token and the `authGuard` blocks unauthenticated access to `/admin`
- Non-`GET` requests must send `Content-Type: application/json`

