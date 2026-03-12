import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    const user = process.env['GMAIL_USER'];
    const pass = process.env['GMAIL_APP_PASSWORD'];
    if (!user || !pass) {
      throw new Error('GMAIL_USER and GMAIL_APP_PASSWORD must be set in .env');
    }
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
  }
  return transporter;
}

const BUSINESS_NAME = 'Mary Oak';
const BUSINESS_ADDRESS = '2110 Boul. Saint-Laurent, Montreal, Quebec H2X 2T2';
const BUSINESS_MAPS_URL =
  'https://www.google.com/maps/place/2110+Boul.+Saint-Laurent,+Montreal,+Quebec+H2X+2T2';

export interface AppointmentEmailData {
  customerName: string;
  customerLastname: string;
  customerPhone: string;
  customerEmail?: string | null;
  services: Array<{ name: string; price: string; duration: string }>;
  appointmentDate: string;       // YYYY-MM-DD
  appointmentTime: string;       // HH:MM
  totalPrice: number;
  totalDurationMinutes: number;
  notes?: string | null;
  bookingTimestamp: string;
}

export interface EmailResult {
  success: boolean;
  message: string;
}

function formatDate(dateStr: string): string {
  // Append noon UTC to avoid off-by-one from timezone shifts
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function formatTime(timeStr: string): string {
  return timeStr.substring(0, 5);
}

// ---------------------------------------------------------------------------
// HTML builders
// ---------------------------------------------------------------------------

function buildCustomerHtml(data: AppointmentEmailData): string {
  const servicesList = data.services.map(s => s.name).join(', ');
  const notesSection = data.notes
    ? `<div class="section">
        <div class="notes-box">
          <div class="label">📝 Your Notes</div>
          <div class="note-content">${data.notes}</div>
        </div>
      </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Confirmation</title>
  <style>
    body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f5f5f5;color:#333}
    .email-container{max-width:600px;margin:20px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)}
    .header{background:linear-gradient(135deg,#d81b60,#c2185b);color:#fff;padding:40px 20px;text-align:center}
    .header .emoji{font-size:48px;margin-bottom:15px}
    .header h1{margin:0 0 10px;font-size:28px;font-weight:600}
    .header p{margin:0;font-size:16px;opacity:.95}
    .content{padding:30px 20px}
    .greeting{font-size:18px;color:#333;margin-bottom:20px}
    .greeting strong{color:#d81b60}
    .section{margin-bottom:30px}
    .section-title{font-size:18px;font-weight:600;color:#d81b60;margin-bottom:15px;padding-bottom:10px;border-bottom:2px solid #f5f5f5}
    .info-box{background:#fafafa;border-radius:8px;padding:20px;margin-bottom:15px}
    .info-row{display:flex;padding:12px 0;border-bottom:1px solid #e8e8e8}
    .info-row:last-child{border-bottom:none}
    .info-label{font-weight:600;color:#666;min-width:130px;flex-shrink:0}
    .info-value{color:#333;flex:1}
    .highlight-box{background:linear-gradient(135deg,#fce4ec,#f8bbd0);border-radius:8px;padding:20px;margin:15px 0;text-align:center}
    .highlight-box .label{font-size:14px;color:#c2185b;font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px}
    .highlight-box .value{font-size:24px;font-weight:700;color:#d81b60}
    .services-list{background:#fff;border:2px solid #f5f5f5;border-radius:8px;padding:15px}
    .service-item{padding:10px 0;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;gap:10px}
    .service-item:last-child{border-bottom:none}
    .notes-box{background:#fff8e1;border-left:4px solid #ffc107;padding:15px;border-radius:4px}
    .notes-box .label{font-weight:600;color:#f57c00;margin-bottom:8px}
    .note-content{color:#555;line-height:1.6}
    .location-box{background:#e3f2fd;border-radius:8px;padding:20px;margin-top:15px}
    .location-box .address{font-size:16px;color:#333;margin-bottom:15px;line-height:1.6}
    .map-button{display:inline-block;background:#1976d2;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;font-size:14px}
    .warning-box{background:#fff3e0;border-left:4px solid #ff9800;padding:15px;border-radius:4px;margin-top:20px}
    .warning-box .title{font-weight:600;color:#e65100;margin-bottom:8px;font-size:16px}
    .warning-box .text{color:#555;line-height:1.6;font-size:14px}
    .divider{height:2px;background:linear-gradient(to right,transparent,#d81b60,transparent);margin:30px 0}
    .footer{background:#fafafa;padding:25px 20px;text-align:center;border-top:1px solid #e0e0e0}
    .footer .business-name{font-size:18px;font-weight:600;color:#d81b60;margin-bottom:10px}
    .footer .tagline{font-size:14px;color:#666;margin-bottom:15px}
    .footer .disclaimer{font-size:12px;color:#999;margin-top:15px;padding-top:15px;border-top:1px solid #e8e8e8}
    @media(max-width:600px){.info-row{flex-direction:column;gap:5px}.info-label{min-width:unset}}
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="emoji">✨💅</div>
      <h1>Appointment Confirmed!</h1>
      <p>We can't wait to pamper you</p>
    </div>
    <div class="content">
      <div class="greeting">Hello <strong>${data.customerName}</strong>,</div>
      <p style="color:#666;line-height:1.6;margin-bottom:30px">Thank you for booking your appointment with us! Your reservation has been successfully confirmed. We're excited to provide you with exceptional service.</p>

      <div class="section">
        <div class="section-title">📅 Your Appointment Details</div>
        <div class="info-box">
          <div class="info-row">
            <div class="info-label">Date:</div>
            <div class="info-value"><strong>${formatDate(data.appointmentDate)}</strong></div>
          </div>
          <div class="info-row">
            <div class="info-label">Time:</div>
            <div class="info-value"><strong>${formatTime(data.appointmentTime)}</strong></div>
          </div>
          <div class="info-row">
            <div class="info-label">Duration:</div>
            <div class="info-value">${formatDuration(data.totalDurationMinutes)}</div>
          </div>
        </div>
        <div class="highlight-box">
          <div class="label">Total Price</div>
          <div class="value">$${data.totalPrice}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">💆 Selected Services</div>
        <div class="services-list">
          <div class="service-item"><span>✨</span><span>${servicesList}</span></div>
        </div>
      </div>

      ${notesSection}

      <div class="divider"></div>

      <div class="section">
        <div class="section-title">📍 Location</div>
        <div class="location-box">
          <div class="address"><strong>${BUSINESS_NAME}</strong><br>${BUSINESS_ADDRESS}</div>
          <a href="${BUSINESS_MAPS_URL}" class="map-button" target="_blank">🗺️ View on Google Maps</a>
        </div>
      </div>

      <div class="warning-box">
        <div class="title">⏰ Cancellation Policy</div>
        <div class="text">Need to reschedule? Please contact us at least <strong>12 hours before</strong> your appointment time. We appreciate your understanding!</div>
      </div>
    </div>
    <div class="footer">
      <div class="business-name">${BUSINESS_NAME}</div>
      <div class="tagline">Bringing Beauty to Your Fingertips</div>
      <div class="disclaimer">This is an automated confirmation email. Please do not reply to this message.<br>For any questions, please contact us directly.</div>
    </div>
  </div>
</body>
</html>`;
}

function buildAdminHtml(data: AppointmentEmailData): string {
  const servicesList = data.services.map(s => `${s.name} (${s.price})`).join(', ');
  const notesSection = data.notes
    ? `<div class="section">
        <div class="notes-box">
          <div class="label">📝 Customer Notes</div>
          <div class="note-content">${data.notes}</div>
        </div>
      </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Appointment Booked</title>
  <style>
    body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f5f5f5;color:#333}
    .email-container{max-width:600px;margin:20px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)}
    .header{background:linear-gradient(135deg,#d81b60,#c2185b);color:#fff;padding:30px 20px;text-align:center}
    .header h1{margin:0;font-size:24px;font-weight:600}
    .header .emoji{font-size:32px;margin-bottom:10px}
    .content{padding:30px 20px}
    .section{margin-bottom:30px}
    .section-title{font-size:16px;font-weight:600;color:#d81b60;margin-bottom:15px;padding-bottom:8px;border-bottom:2px solid #f5f5f5}
    .info-row{display:flex;padding:10px 0;border-bottom:1px solid #f0f0f0}
    .info-row:last-child{border-bottom:none}
    .info-label{font-weight:600;color:#666;min-width:120px;flex-shrink:0}
    .info-value{color:#333;flex:1}
    .highlight{color:#d81b60;font-weight:600}
    .notes-box{background:#fff8e1;border-left:4px solid #ffc107;padding:15px;border-radius:4px}
    .notes-box .label{font-weight:600;color:#f57c00;margin-bottom:8px}
    .note-content{color:#555;line-height:1.6}
    .timestamp{background:#f5f5f5;padding:15px 20px;text-align:center;font-size:14px;color:#666;border-top:1px solid #e0e0e0}
    .timestamp strong{color:#333}
    .footer{background:#fafafa;padding:20px;text-align:center;font-size:12px;color:#999;border-top:1px solid #e0e0e0}
    @media(max-width:600px){.info-row{flex-direction:column;gap:5px}.info-label{min-width:unset}}
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="emoji">🔔</div>
      <h1>New Appointment Booked!</h1>
    </div>
    <div class="content">
      <div class="section">
        <div class="section-title">👤 Customer Information</div>
        <div class="info-row"><div class="info-label">Name:</div><div class="info-value highlight">${data.customerName} ${data.customerLastname}</div></div>
        <div class="info-row"><div class="info-label">Phone:</div><div class="info-value">${data.customerPhone}</div></div>
        <div class="info-row"><div class="info-label">Email:</div><div class="info-value">${data.customerEmail || 'Not provided'}</div></div>
      </div>
      <div class="section">
        <div class="section-title">📅 Appointment Details</div>
        <div class="info-row"><div class="info-label">Service(s):</div><div class="info-value">${servicesList}</div></div>
        <div class="info-row"><div class="info-label">Date:</div><div class="info-value highlight">${formatDate(data.appointmentDate)}</div></div>
        <div class="info-row"><div class="info-label">Time:</div><div class="info-value highlight">${formatTime(data.appointmentTime)}</div></div>
        <div class="info-row"><div class="info-label">Duration:</div><div class="info-value">${formatDuration(data.totalDurationMinutes)}</div></div>
        <div class="info-row"><div class="info-label">Price:</div><div class="info-value highlight">$${data.totalPrice}</div></div>
      </div>
      ${notesSection}
    </div>
    <div class="timestamp">⏰ Booked at: <strong>${data.bookingTimestamp}</strong></div>
    <div class="footer">This is an automated notification from your appointment system.</div>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function sendCustomerConfirmation(data: AppointmentEmailData): Promise<EmailResult> {
  if (!data.customerEmail) {
    return { success: false, message: 'No customer email provided — skipping' };
  }

  const fromUser = process.env['GMAIL_USER'];

  try {
    await getTransporter().sendMail({
      from: `"${BUSINESS_NAME}" <${fromUser}>`,
      to: data.customerEmail,
      subject: `Appointment Confirmed — ${formatDate(data.appointmentDate)} at ${formatTime(data.appointmentTime)}`,
      html: buildCustomerHtml(data)
    });
    return { success: true, message: 'Customer confirmation sent' };
  } catch (error) {
    console.error('Failed to send customer confirmation:', error);
    return { success: false, message: 'Failed to send customer confirmation' };
  }
}

export async function sendAdminNotification(data: AppointmentEmailData): Promise<EmailResult> {
  const adminEmail = process.env['ADMIN_EMAIL'];
  if (!adminEmail) {
    console.warn('ADMIN_EMAIL not set — skipping admin notification');
    return { success: false, message: 'ADMIN_EMAIL not configured' };
  }

  const fromUser = process.env['GMAIL_USER'];

  try {
    await getTransporter().sendMail({
      from: `"${BUSINESS_NAME} Appointments" <${fromUser}>`,
      to: adminEmail,
      replyTo: data.customerEmail || undefined,
      subject: `New Booking: ${data.customerName} ${data.customerLastname} — ${formatDate(data.appointmentDate)} at ${formatTime(data.appointmentTime)}`,
      html: buildAdminHtml(data)
    });
    return { success: true, message: 'Admin notification sent' };
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    return { success: false, message: 'Failed to send admin notification' };
  }
}

export async function sendAllNotifications(data: AppointmentEmailData): Promise<{
  customer: EmailResult;
  admin: EmailResult;
}> {
  const [customer, admin] = await Promise.all([
    sendCustomerConfirmation(data),
    sendAdminNotification(data)
  ]);
  console.log('Email notifications result:', { customer, admin });
  return { customer, admin };
}
