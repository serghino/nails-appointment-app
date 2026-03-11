# Nails Appointment App - Backend API

Backend REST API for the Nails Appointment application built with Express.js and TypeScript.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ installed
- npm or yarn package manager

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
npm run api:build
```

Compiled JavaScript will be in `dist/api/`

### Production Server

```bash
npm run api:start
```

---

## 📡 API Endpoints

### Health Check
```
GET /api/health
```
Returns API status and timestamp.

### Appointments

#### Check Availability
```
GET /api/appointments/availability?date=2026-02-10T00:00:00.000Z&serviceIds=svc1,svc2
```
**Query Parameters:**
- `date` (required): ISO date string
- `serviceIds` (required): Comma-separated service IDs

**Response:**
```json
{
  "date": "2026-02-10T00:00:00.000Z",
  "dayOfWeek": 1,
  "businessHours": { "start": 10, "end": 19 },
  "slots": [
    {
      "time": "10:00",
      "available": true,
      "endTime": "11:30"
    }
  ]
}
```

#### Get User Appointments
```
GET /api/appointments?userId=123&status=pending
```
**Query Parameters:**
- `userId` (optional): Filter by user ID
- `status` (optional): Filter by status (pending/confirmed/completed/cancelled)

#### Create Appointment
```
POST /api/appointments
```
**Body:**
```json
{
  "services": [
    { "id": "svc1", "name": "Classic Manicure", "price": 30 }
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

**Response:**
```json
{
  "success": true,
  "appointment": { /* appointment data */ },
  "message": "Appointment created successfully"
}
```

#### Update Appointment
```
PUT /api/appointments/:id
```
**Body:** Partial appointment data to update

#### Cancel Appointment
```
DELETE /api/appointments/:id
```
**Note:** Enforces 12-hour cancellation rule. Returns error if appointment is within 12 hours.

**Error Response (< 12 hours):**
```json
{
  "error": "Cannot cancel appointment less than 12 hours before scheduled time",
  "hoursRemaining": 8.5
}
```

#### Get Admin Appointments
```
GET /api/appointments/admin?date=2026-02-10&status=confirmed
```
**Query Parameters:**
- `date` (optional): Filter by date
- `status` (optional): Filter by status

**Note:** Requires admin authentication (to be implemented)

---

## 🗄️ Database Integration

The API is ready for database integration. Choose one:

### Option 1: Supabase (Recommended)
- Free tier: 500MB storage, unlimited API requests
- PostgreSQL database
- Built-in authentication
- Real-time subscriptions

**Setup:**
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your URL and anon key
4. Add to `api/.env`:
   ```
   SUPABASE_URL=your_url
   SUPABASE_ANON_KEY=your_key
   ```

### Option 2: Firebase Firestore
- Free tier: 1GB storage, 50K reads/day
- NoSQL document database
- Real-time updates
- Good for MVP

**Setup:**
1. Create Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Firestore
3. Get configuration
4. Add to `api/.env`

---

## 🔧 Configuration

### Environment Variables

Create `api/.env` file:

```env
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:4200

# Database (choose one)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_key

# JWT Authentication
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# Email/SMS (optional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@example.com
TWILIO_ACCOUNT_SID=your_sid
```

---

## 🚢 Deployment

### Netlify Functions

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Create `netlify.toml` (already configured):
   ```toml
   [functions]
     directory = "api"
     node_bundler = "esbuild"
   ```

3. Deploy:
   ```bash
   netlify deploy --prod
   ```

### Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

### Railway

1. Connect GitHub repository
2. Set environment variables in dashboard
3. Auto-deploys on push

---

## 📝 TODO for Production

- [x] Implement database layer (Supabase)
- [x] Implement email notifications (Gmail SMTP via Nodemailer)
- [ ] Add authentication (JWT tokens)
- [ ] Add authorization middleware
- [ ] Add SMS notifications (Twilio)
- [ ] Add request validation (express-validator)
- [ ] Add rate limiting
- [ ] Add logging (Winston/Morgan)
- [ ] Add error tracking (Sentry)
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Add API documentation (Swagger)
- [ ] Set up CI/CD pipeline

---

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Test API health
curl http://localhost:3001/api/health

# Test availability endpoint
curl "http://localhost:3001/api/appointments/availability?date=2026-02-10T00:00:00.000Z&serviceIds=svc1,svc2"
```

---

## 🏗️ Project Structure

```
api/
├── server.ts              # Main Express app
├── appointments/
│   └── index.ts           # Appointments routes + email trigger
├── email/
│   └── email.service.ts   # Nodemailer Gmail SMTP — sendAllNotifications()
├── db/
│   └── supabase.ts        # Supabase client and query helpers
├── tsconfig.json          # TypeScript config for API
├── .env                   # Environment variables (gitignored)
└── .env.example           # Example environment file
```

---

## 🛡️ Security Considerations

- ✅ CORS configured
- ✅ Request body parsing
- ⏳ JWT authentication (pending)
- ⏳ Rate limiting (pending)
- ⏳ Input validation (pending)
- ⏳ SQL injection prevention (pending)
- ⏳ XSS protection (pending)

---

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Supabase Documentation](https://supabase.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Vercel Serverless Functions](https://vercel.com/docs/serverless-functions/introduction)

---

## 📞 Support

For issues or questions, please open an issue in the GitHub repository.

---

**Status:** 🟡 In Development (MVP Ready - Needs Database Integration)
