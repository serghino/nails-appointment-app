# Nail Salon Appointment Application - Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER (Angular + SSR)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Home Page   │  │   Calendar   │  │    Auth      │  │   Profile    │  │
│  │  Component   │  │  Component   │  │  Component   │  │  Component   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                    │
│  │ Appointments │  │    Admin     │  │ Notifications│                    │
│  │  Component   │  │  Dashboard   │  │  Component   │                    │
│  └──────────────┘  └──────────────┘  └──────────────┘                    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                     Angular Services Layer                          │  │
│  │  • Auth Service  • Appointment Service  • Notification Service      │  │
│  │  • User Service  • Admin Service       • Calendar Service           │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     │ HTTPS/API Calls
                                     │
┌────────────────────────────────────▼────────────────────────────────────────┐
│                          BACKEND LAYER (Node.js/Express)                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │    Auth      │  │ Appointments │  │     User     │  │    Admin     │  │
│  │     API      │  │     API      │  │     API      │  │     API      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                     Middleware Layer                                │  │
│  │  • JWT Authentication  • Input Validation  • Error Handling         │  │
│  │  • Rate Limiting      • CORS              • Logging                 │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     │
┌────────────────────────────────────▼────────────────────────────────────────┐
│                          DATABASE LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │              Firebase / Supabase (Free Tier)                        │  │
│  │                                                                     │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │  │
│  │  │    Users     │  │ Appointments │  │   Services   │            │  │
│  │  │  Collection  │  │  Collection  │  │  Collection  │            │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘            │  │
│  │                                                                     │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │  │
│  │  │Notifications │  │    Config    │  │  Availability│            │  │
│  │  │  Collection  │  │  Collection  │  │  Collection  │            │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘            │  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                    │
│  │   Twilio /   │  │   SendGrid/  │  │   Firebase   │                    │
│  │    SMS API   │  │  Email API   │  │    Cloud     │                    │
│  │              │  │              │  │  Messaging   │                    │
│  └──────────────┘  └──────────────┘  └──────────────┘                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                          HOSTING & DEPLOYMENT                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                    GitHub Pages / Vercel / Netlify                 │   │
│  │                    (Static Frontend + SSR Support)                 │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │              Vercel / Railway / Render (Free Tier)                 │   │
│  │                    (Backend API Hosting)                           │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Frontend Components (Angular with SSR)

#### A. **Home Page Component**
- **Purpose**: Landing page with service showcase
- **Features**:
  - Hero section with nail salon images
  - Services list (manicure, pedicure, nail art, etc.)
  - Call-to-action for booking
  - Contact information
  - SEO optimized with meta tags

#### B. **Calendar Component**
- **Purpose**: Interactive appointment booking
- **Features**:
  - Date picker (restrict past dates)
  - Time slot selector (show available hours)
  - Service selection
  - Duration estimation
  - Real-time availability checking
- **Library**: Angular Material Datepicker or FullCalendar

#### C. **Authentication Component**
- **Purpose**: User registration and login
- **Features**:
  - Phone number input with validation
  - Email input with validation
  - Password/PIN creation
  - OTP verification for phone
  - Social login (optional: Google)
  - JWT token management

#### D. **Profile Component**
- **Purpose**: User account management
- **Features**:
  - View/edit personal information
  - Appointment history
  - Upcoming appointments
  - Cancellation option (12-hour rule enforcement)
  - Notification preferences

#### E. **Admin Dashboard Component**
- **Purpose**: Professional/owner management interface
- **Features**:
  - Today's appointments view
  - Calendar management (set availability)
  - Appointment approval/modification
  - Client list management
  - Service/pricing configuration
  - Reports and analytics
  - Notification settings

#### F. **Notifications Component**
- **Purpose**: Display and manage notifications
- **Features**:
  - In-app notification bell
  - Notification list
  - Mark as read functionality
  - Push notification support

---

### 2. Backend API Services (Node.js/Express)

#### A. **Authentication API**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-phone` - Phone verification
- `POST /api/auth/verify-email` - Email verification
- `GET /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout

#### B. **Appointments API**
- `GET /api/appointments` - Get user appointments
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment (with 12hr check)
- `GET /api/appointments/availability` - Check available time slots
- `GET /api/appointments/admin` - Admin view all appointments

#### C. **User API**
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get specific user (admin)
- `GET /api/users` - List all users (admin)

#### D. **Admin API**
- `POST /api/admin/availability` - Set availability schedule
- `GET /api/admin/availability` - Get availability schedule
- `PUT /api/admin/services` - Update services/prices
- `GET /api/admin/reports` - Get analytics/reports
- `GET /api/admin/notifications` - Get pending notifications

#### E. **Notifications API**
- `POST /api/notifications/send` - Send notification
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/subscribe` - Subscribe to push notifications

---

### 3. Database Schema (Firebase/Supabase)

#### **Users Collection**
```json
{
  "id": "uuid",
  "phoneNumber": "string (unique, indexed)",
  "email": "string (unique, indexed)",
  "name": "string",
  "password": "string (hashed)",
  "role": "enum (client, admin)",
  "isPhoneVerified": "boolean",
  "isEmailVerified": "boolean",
  "notificationPreferences": {
    "sms": "boolean",
    "email": "boolean",
    "push": "boolean"
  },
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### **Appointments Collection**
```json
{
  "id": "uuid",
  "userId": "string (foreign key)",
  "serviceType": "string",
  "appointmentDate": "date",
  "appointmentTime": "time",
  "duration": "number (minutes)",
  "status": "enum (pending, confirmed, completed, cancelled)",
  "notes": "string",
  "cancellationReason": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "cancelledAt": "timestamp"
}
```

#### **Services Collection**
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "duration": "number (minutes)",
  "price": "number",
  "isActive": "boolean",
  "imageUrl": "string",
  "createdAt": "timestamp"
}
```

#### **Availability Collection**
```json
{
  "id": "uuid",
  "dayOfWeek": "number (0-6)",
  "startTime": "time",
  "endTime": "time",
  "isActive": "boolean",
  "maxAppointments": "number",
  "breakTimes": [
    {
      "startTime": "time",
      "endTime": "time"
    }
  ]
}
```

#### **Notifications Collection**
```json
{
  "id": "uuid",
  "userId": "string",
  "type": "enum (appointment_confirmed, appointment_reminder, appointment_cancelled)",
  "title": "string",
  "message": "string",
  "isRead": "boolean",
  "sentAt": "timestamp",
  "appointmentId": "string (optional)"
}
```

---

### 4. External Services Integration

#### A. **SMS Notifications (Twilio)**
- Send appointment confirmation
- Send appointment reminders (24h before)
- Send cancellation confirmations
- Send OTP for phone verification

#### B. **Email Notifications (SendGrid)**
- Welcome email on registration
- Appointment confirmation email
- Appointment reminder email (24h before)
- Cancellation confirmation email
- Admin notifications for new appointments

#### C. **Push Notifications (Firebase Cloud Messaging)**
- Browser push notifications
- Real-time appointment updates
- Admin alerts for new bookings

---

### 5. Hosting Strategy

#### **Frontend Hosting** (Choose one)
- **Vercel** (Recommended for Angular SSR)
  - Free tier
  - Automatic SSR support
  - GitHub integration
  - Custom domains
  
- **Netlify**
  - Free tier
  - GitHub integration
  - Good for static sites

- **GitHub Pages**
  - Completely free
  - Static site only (SSR limitations)

#### **Backend Hosting** (Choose one)
- **Vercel** (Serverless Functions)
  - Free tier
  - Easy integration with frontend
  
- **Railway**
  - Free tier ($5 monthly credit)
  - PostgreSQL database included
  
- **Render**
  - Free tier
  - Auto-deploy from GitHub
  - PostgreSQL database included

---

### 6. Key Features Implementation

#### **Requirement 1: Free Cloud Database**
- **Solution**: Firebase Firestore (Free tier: 1GB storage, 50K reads/day, 20K writes/day)
- **Alternative**: Supabase (Free tier: 500MB storage, unlimited API requests)

#### **Requirement 2: Calendar for Date/Time Selection**
- **Solution**: Angular Material Datepicker + Custom time slot component
- **Library**: `@angular/material` or `fullcalendar`

#### **Requirement 3: User Registration with Phone & Email**
- **Solution**: Custom auth form with validators
- **Phone verification**: Twilio SMS OTP
- **Email verification**: SendGrid email with token

#### **Requirement 4: User Notification on Registration**
- **Solution**: Trigger notification service after successful booking
- **Methods**: SMS (Twilio), Email (SendGrid), Push (FCM)

#### **Requirement 5: Professional Notification on Booking**
- **Solution**: Admin notification system
- **Methods**: SMS, Email, Push, In-app notification

#### **Requirement 6: Cancellation 12 Hours Before**
- **Solution**: Backend validation checking appointment time
- **Logic**: `if (appointmentTime - currentTime < 12 hours) reject cancellation`

#### **Requirement 7: Admin Schedule Management**
- **Solution**: Admin dashboard with CRUD operations
- **Features**: Set working hours, manage availability, view bookings

#### **Requirement 8: SEO Optimization**
- **Solution**: Angular SSR enabled
- **Implementation**: Meta tags, Open Graph, structured data, sitemap

#### **Requirement 9: Free Hosting with GitHub**
- **Solution**: GitHub repository + Vercel/Netlify deployment
- **CI/CD**: Automatic deployment on git push

---

## Technology Stack Summary

### **Frontend**
- Angular 17+ (with SSR enabled)
- Angular Material UI / Bootstrap
- SCSS for styling
- RxJS for reactive programming
- TypeScript

### **Backend**
- Node.js 20+
- Express.js
- JWT for authentication
- TypeScript

### **Database**
- Firebase Firestore OR
- Supabase (PostgreSQL)

### **External Services**
- Twilio (SMS)
- SendGrid (Email)
- Firebase Cloud Messaging (Push)

### **Hosting**
- Frontend: Vercel/Netlify
- Backend: Vercel/Railway/Render
- Repository: GitHub

### **DevOps**
- GitHub Actions for CI/CD
- Environment variables for secrets
- Automated testing

---

## Next Steps

1. ✅ Install nvm and Node.js
2. ✅ Install Angular CLI
3. ✅ Create Angular project base with SSR
4. ✅ Create architecture diagram
5. ✅ Set up project structure
6. ✅ Implement appointments component with stepper
7. ✅ **Implement email notification system (MVP)**
8. ✅ **Implement Appointments API backend (Express.js)**
9. ✅ **Create Angular appointment service**
10. ✅ **Update date-time component to consume API**
11. **Set up database (Supabase or Firebase)**
12. **Implement authentication component**
13. **Integrate notification services**
14. **Implement admin dashboard**
15. **Deploy to production**

---

## Implemented Components

### **Appointments Component** ✅
A complete 4-step booking system with the following structure:

```
src/app/pages/appointments/
├── appointments.ts                    # Main stepper container
├── appointments.html
├── appointments.scss
├── models/
│   └── appointment-data.model.ts     # TypeScript interfaces
├── service-selection/                # Step 1: Service Selection
│   ├── service-selection.ts
│   ├── service-selection.html
│   └── service-selection.scss
├── date-time-selection/              # Step 2: Date & Time Selection
│   ├── date-time-selection.ts
│   ├── date-time-selection.html
│   └── date-time-selection.scss
├── user-info/                        # Step 3: Contact Information
│   ├── user-info.ts
│   ├── user-info.html
│   └── user-info.scss
└── confirmation/                     # Step 4: Review & Confirm
    ├── confirmation.ts
    ├── confirmation.html
    └── confirmation.scss
```

**Features:**
- **Step 1: Service Selection**
  - Multiple service selection from catalog
  - Real-time service details display
  - Total duration and price calculation
  - Selected services summary with expandable details
  - Validation before proceeding to next step

- **Step 2: Date & Time Selection**
  - Date picker (excludes Sundays and past dates)
  - Dynamic time slot generation based on:
    - Business hours (Mon-Fri: 10AM-7PM, Sat: 10AM-5PM)
    - Total service duration
    - Real-time availability
  - Time slot grid with visual indicators (available/unavailable/selected)
  - Estimated end time calculation per selected slot
  - Optional notes field
  - Back button to return to service selection
  - Validation before proceeding

- **Step 3: User Information Form**
  - First name (required, validated)
  - Last name (required, validated)
  - Telephone (required, pattern validated)
  - Email (optional, format validated)
  - Real-time validation with error messages
  - Navigation buttons (Back/Continue)

- **Step 4: Confirmation Summary**
  - Complete service list with icons and pricing
  - Total duration and price display
  - Selected date and time slot
  - Contact information review
  - Edit buttons to jump to specific previous steps
  - Final confirmation action

**Material Components Used:**
- Mat Stepper (linear mode, 4 steps)
- Mat Form Fields & Inputs
- Mat Datepicker
- Mat Select (multi-select)
- Mat Cards
- Mat Buttons & Icons
- Reactive Forms with validation

**Routing:**
- `/appointments` - Full 4-step booking experience
- Home page "Book Appointment" button links to `/appointments`

**Component Communication:**
- Service selection emits selected services array
- Date-time selection receives services as input, emits date/time/notes
- User info emits user contact data
- Confirmation displays all collected data with edit capability
- Each step uses signals for reactive state management

---

### **Email Notification System (MVP)** ✅

A complete email notification system with spam protection for the MVP phase.

**Implementation Details:**

**Services Created:**
```
src/app/services/
├── email-notification.service.ts    # EmailJS integration for sending emails
└── spam-protection.service.ts       # Rate limiting and bot protection
```

**Features:**
- **Customer Email Confirmation**
  - Sent automatically on appointment confirmation
  - Includes all appointment details (services, date, time, price)
  - Business address and Google Maps link
  - Professional email template via EmailJS

- **Admin/Owner Notification**
  - Sent simultaneously when customer books
  - Contains customer contact information
  - Full appointment details for scheduling
  - Timestamp of booking

- **Spam Protection System**
  - Rate limiting: Max 5 bookings/hour, 10/day per device
  - 30-second cooldown between submissions
  - Form timing validation (minimum 5 seconds)
  - Email rate limiting: Max 3 emails/minute per session
  - Browser fingerprint hints for validation
  - Honeypot field support (ready for integration)
  - LocalStorage-based tracking

- **User Experience**
  - Loading spinner during submission
  - Success/warning/error snackbar messages
  - Disabled buttons during processing
  - Clear error messages with wait times
  - Graceful degradation if email fails

**Technology Stack:**
- **EmailJS Browser SDK** (@emailjs/browser)
  - Free tier: 200 emails/month
  - Frontend-only (no backend required)
  - Works perfectly with Netlify static hosting
  - Template-based email system

**Configuration:**
- Environment variables in `environment.ts` and `environment.prod.ts`
- Four configuration values needed:
  - publicKey (EmailJS account key)
  - serviceId (Email service ID)
  - customerTemplateId (Customer confirmation template)
  - adminTemplateId (Admin notification template)

**Email Template Variables:**
- Customer: name, services, date, time, price, business info
- Admin: all customer details + booking timestamp

**Security Considerations:**
- Client-side rate limiting (sufficient for MVP)
- All form validation in place
- Email service keys are public-facing (EmailJS design)
- No sensitive data exposure
- Ready for backend migration when needed

**Documentation:**
- Complete setup guide: `EMAIL_SETUP.md`
- Step-by-step EmailJS configuration
- Testing procedures
- Troubleshooting guide
- Deployment instructions for Netlify

**Cost:**
- **$0/month** for MVP (up to ~100 appointments/month)
- Scales to paid tiers when needed

**Next Enhancements:**
- Google reCAPTCHA v3 integration
- Backend API for server-side email sending
- Database integration for appointment persistence
- SMS notifications via Twilio

---

### **Appointments API Backend** ✅

A complete REST API backend built with Express.js and TypeScript for managing appointments and availability.

**Implementation Details:**

**Backend Structure:**
```
api/
├── server.ts              # Main Express application
├── appointments/
│   └── index.ts           # Appointments routes & controllers
├── tsconfig.json          # TypeScript configuration
├── .env                   # Environment variables
├── .env.example           # Environment template
└── README.md              # API documentation
```

**API Endpoints Implemented:**
- `GET /api/health` - Health check endpoint
- `GET /api/appointments/availability` - Check available time slots for date/services
- `GET /api/appointments` - Get user appointments (filtered by userId, status)
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update existing appointment
- `DELETE /api/appointments/:id` - Cancel appointment (12-hour rule enforced)
- `GET /api/appointments/admin` - Get all appointments (admin only)

**Features:**
- **Business Hours Logic**
  - Monday-Friday: 10:00 AM - 7:00 PM
  - Saturday: 10:00 AM - 5:00 PM
  - Closed on Sundays
  - 30-minute time slot intervals

- **Availability Checking**
  - Dynamic slot generation based on service duration
  - Prevents booking if appointment extends past closing time
  - Filters past time slots on current day
  - Returns available/unavailable status for each slot

- **12-Hour Cancellation Rule**
  - Enforced at API level with validation
  - Returns clear error message with hours remaining
  - Prevents cancellations within 12-hour window

- **CORS Configuration**
  - Configured for local development (localhost:4200)
  - Ready for production URL configuration

- **Error Handling**
  - Comprehensive validation of request parameters
  - Clear error messages with appropriate HTTP status codes
  - Consistent JSON response format

**Technology Stack:**
- Express.js 5.x - Web framework
- TypeScript - Type safety and better DX
- CORS - Cross-origin resource sharing
- Dotenv - Environment variable management
- tsx - TypeScript execution in development

**Development Scripts:**
```bash
npm run api:dev        # Start API in watch mode (port 3001)
npm run api:build      # Compile TypeScript to JavaScript
npm run api:start      # Run compiled production build
npm run dev            # Run frontend + backend concurrently
```

**Angular Integration:**
- Created `AppointmentService` in `src/app/services/`
- HTTP client configured with environment-based API URL
- Reactive service using RxJS Observables
- Error handling with catchError operator
- Type-safe interfaces for requests/responses

**Date-Time Component Updates:**
- Integrated with `AppointmentService` for real-time availability
- Loading state with Material spinner during API calls
- Fallback to client-side calculation if API fails
- Enhanced UX with loading indicators

**Current Status:**
- ✅ API structure and routing complete
- ✅ All endpoints implemented with mock responses
- ✅ TypeScript compilation configured
- ✅ Development environment ready
- ✅ CORS and middleware configured
- ✅ Frontend service integrated
- ✅ Component updated to consume API
- ⏳ Database integration pending (next step)
- ⏳ Authentication pending
- ⏳ Production deployment pending

**Database Integration Plan:**
- **Option 1: Supabase (Recommended)**
  - Free tier: 500MB storage, unlimited requests
  - PostgreSQL with real-time capabilities
  - Built-in authentication
  - Easy TypeScript client library

- **Option 2: Firebase Firestore**
  - Free tier: 1GB storage, 50K reads/day
  - NoSQL document database
  - Real-time listeners
  - Good for rapid prototyping

**Security Considerations:**
- Environment variables for sensitive config
- Request validation at API level
- CORS restricted to known origins
- Ready for JWT authentication integration
- Input sanitization in place

**API Documentation:**
- Complete README in `api/README.md`
- Request/response examples provided
- Setup instructions included
- Deployment guide for Netlify/Vercel/Railway

**Testing:**
- Health check endpoint operational
- Availability endpoint tested with mock data
- Ready for integration testing with database

**Next Steps for Backend:**
1. Choose and set up database (Supabase or Firebase)
2. Implement database models and migrations
3. Create database service layer
4. Replace mock data with real database queries
5. Add authentication middleware
6. Implement rate limiting
7. Add request validation library (express-validator)
8. Set up logging (Winston or Morgan)
9. Write unit tests
10. Deploy to serverless platform

---

## Security Considerations

- JWT tokens with expiration
- Password hashing (bcrypt)
- Input validation and sanitization
- CORS configuration
- Rate limiting on APIs
- HTTPS only
- Environment variables for secrets
- SQL injection prevention (use ORM)
- XSS protection

---

## Testing Strategy

- Unit tests (Jest/Jasmine)
- Integration tests (Supertest)
- E2E tests (Cypress/Playwright)
- Manual testing checklist
- Load testing for booking system
