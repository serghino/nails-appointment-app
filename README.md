# Nail Salon Appointment Application

A modern, full-featured appointment booking system for nail salons built with Angular 17+ and Material Design.

## ✨ Features

- 📅 **4-Step Booking Process** - Service selection, date/time, contact info, confirmation
- 📧 **Email Notifications** - Automated customer confirmations and admin alerts
- 🛡️ **Spam Protection** - Multi-layer DOS/bot protection
- 💅 **Material Design** - Beautiful, responsive UI
- 🚀 **Zero Backend** - Frontend-only for MVP (EmailJS integration)
- 🆓 **Free Hosting** - Netlify-ready deployment
- 📱 **Mobile Responsive** - Works on all devices

## 🚀 Quick Start

See **[docs/EMAIL_SETUP.md](docs/EMAIL_SETUP.md)** for complete setup instructions!

## 📚 Documentation

All documentation is in the [`docs/`](docs/) folder.

### Essential Documentation

- **[Email Setup Guide](docs/EMAIL_SETUP.md)** - Complete EmailJS configuration and troubleshooting
- **[Architecture](docs/ARCHITECTURE.md)** - System design, components, and technical details

### 📧 Email Templates

Professional HTML email templates ready to use with EmailJS:
- [customer-confirmation.html](docs/email-templates/customer-confirmation.html) - Customer appointment confirmation
- [admin-notification.html](docs/email-templates/admin-notification.html) - Admin booking notification

### 🔗 External Resources

- [EmailJS Documentation](https://www.emailjs.com/docs/)
- [Angular Documentation](https://angular.dev/)
- [Netlify Documentation](https://docs.netlify.com/)

---

## 🛠️ Development

_This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.1._

### Development server

To start a local development server, run:

```bash
npm start
# or
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

### Building

To build the project run:

```bash
npm run build
# or
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

### Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
npm test
# or
ng test
```

---

## 📧 Email Configuration

Update these files with your EmailJS credentials:
- `src/environments/environment.ts` (development)
- `src/environments/environment.prod.ts` (production)

See [docs/EMAIL_SETUP.md](docs/EMAIL_SETUP.md) for detailed instructions.

---

**Built with ❤️ for [Sergio Escobar ](https://github.com/serghino)**
