# Nail Salon Appointment Application

A modern, full-featured appointment booking system for nail salons built with Angular 21+ and Material Design.

## ✨ Features

- 📅 **4-Step Booking Process** - Service selection, date/time, contact info, confirmation
- 📧 **Email Notifications** - Automated customer confirmations and admin alerts (server-side via Gmail SMTP)
- 🛡️ **Spam Protection** - Multi-layer DOS/bot protection
- 💅 **Material Design** - Beautiful, responsive UI
- 🗄️ **Supabase Database** - PostgreSQL with real-time availability checking
- 🆓 **Free Hosting** - Netlify-ready deployment
- 📱 **Mobile Responsive** - Works on all devices

## 🚀 Quick Start

See **[docs/EMAIL_SETUP.md](docs/EMAIL_SETUP.md)** for email configuration and **[api/SETUP_SUPABASE.md](api/SETUP_SUPABASE.md)** for database setup.

## 📚 Documentation

All documentation is in the [`docs/`](docs/) folder.

### Essential Documentation

- **[Email Setup Guide](docs/EMAIL_SETUP.md)** - Gmail SMTP configuration (Nodemailer)
- **[Architecture](docs/ARCHITECTURE.md)** - System design, components, and technical details
- **[Supabase Setup](api/SETUP_SUPABASE.md)** - Database setup guide

### 📧 Email Templates

HTML email templates (used by the backend):
- [customer-confirmation.html](docs/email-templates/customer-confirmation.html) - Customer appointment confirmation
- [admin-notification.html](docs/email-templates/admin-notification.html) - Admin booking notification

### 🔗 External Resources

- [Angular Documentation](https://angular.dev/)
- [Netlify Documentation](https://docs.netlify.com/)
- [Supabase Documentation](https://supabase.com/docs)

---

## 🛠️ Development

_This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.1._

### Development server

To start a local development server (frontend + backend together), run:

```bash
npm run dev
```

- Angular frontend → `http://localhost:4200`
- Express API → `http://localhost:3001`

### Building

```bash
npm run build        # Frontend only
npm run build:all    # Frontend + Backend
```

### Running unit tests

```bash
npm test
```

---

## ⚙️ Environment Variables

Create `api/.env` (see `api/.env.example` for reference):

```env
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
GMAIL_USER=your@gmail.com
GMAIL_APP_PASSWORD=your_app_password
ADMIN_EMAIL=your@gmail.com
```

---

**Built with ❤️ for [Sergio Escobar](https://github.com/serghino)**
