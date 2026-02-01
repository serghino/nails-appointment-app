# Email Notification Setup Guide

## 📧 MVP Email Notification System

This guide will help you set up the email notification system for your nail salon appointment application.

---

## ✅ What's Already Implemented

Your MVP now includes:

1. **Email Notification Service** - Sends confirmation emails to customers
2. **Admin Notification Service** - Notifies you when appointments are booked
3. **Spam Protection** - Prevents bot attacks and abuse with:
   - Rate limiting (max 5 bookings/hour, 10/day per user)
   - Minimum 30 seconds between submissions
   - Form timing validation (prevents instant submissions)
   - Simple honeypot protection
4. **User Feedback** - Loading states and success/error messages

---

## 🚀 Setup Instructions

### Step 1: Create EmailJS Account (5 minutes)

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Click **Sign Up** (it's FREE - 200 emails/month)
3. Verify your email address

### Step 2: Connect Your Email Account

1. In EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider:
   - **Gmail** (recommended for testing)
   - Outlook, Yahoo, etc.
4. Follow the setup wizard to connect your email
5. **Copy the Service ID** (e.g., `service_abc1234`)

### Step 3: Create Customer Confirmation Template

1. Go to **Email Templates** in EmailJS
2. Click **Create New Template**
3. **Template Name**: `Customer Appointment Confirmation`
4. Use this template content:

```html
Subject: Your Appointment Confirmation - {{business_name}}

Hello {{customer_name}},

Thank you for booking your appointment with us!

📅 APPOINTMENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Service(s):     {{services}}
Date:           {{appointment_date}}
Time:           {{appointment_time}}
Duration:       {{total_duration}}
Total Price:    {{total_price}}

{{#notes}}
Notes: {{notes}}
{{/notes}}

📍 LOCATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{{business_name}}
{{business_address}}

View on Google Maps: {{business_maps_url}}

📞 NEED TO RESCHEDULE?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Please contact us at least 12 hours before your appointment.

We look forward to seeing you!

Best regards,
{{business_name}}
```

5. **Save** and **copy the Template ID** (e.g., `template_xyz5678`)

### Step 4: Create Admin Notification Template

1. Create another template: **Create New Template**
2. **Template Name**: `New Appointment - Admin Notification`
3. Use this template content:

```html
Subject: 🔔 New Appointment Booked!

NEW APPOINTMENT ALERT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 CUSTOMER INFORMATION
Name:       {{customer_name}}
Phone:      {{customer_phone}}
Email:      {{customer_email}}

📅 APPOINTMENT DETAILS
Service(s): {{services}}
Date:       {{appointment_date}}
Time:       {{appointment_time}}
Duration:   {{total_duration}}
Price:      {{total_price}}

{{#notes}}
📝 NOTES
{{notes}}
{{/notes}}

⏰ Booked at: {{booking_timestamp}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is an automated notification from your appointment system.
```

4. **Save** and **copy the Template ID** (e.g., `template_admin_123`)

### Step 5: Get Your Public Key

1. In EmailJS dashboard, go to **Account** > **General**
2. Find **Public Key** section
3. **Copy your Public Key** (e.g., `user_aBcDeFgHiJkLmNoPq`)

### Step 6: Update Environment Configuration

1. Open: `src/environments/environment.ts`
2. Fill in the EmailJS configuration:

```typescript
emailjs: {
  publicKey: 'user_aBcDeFgHiJkLmNoPq',        // Your Public Key
  serviceId: 'service_abc1234',               // Your Service ID
  customerTemplateId: 'template_xyz5678',     // Customer template ID
  adminTemplateId: 'template_admin_123'       // Admin template ID
}
```

3. **IMPORTANT**: Also update `src/environments/environment.prod.ts` with the same values

### Step 7: Set Admin Email (Important!)

In EmailJS, go to your **Admin Notification Template** and set the recipient:

1. Edit the admin template
2. In **Settings** tab, set **To Email**: `your-business-email@example.com`
3. Save the template

---

## 🧪 Testing

### Local Testing

1. Start your development server:
```bash
npm start
```

2. Go to `http://localhost:4200/appointments`

3. Complete the booking form:
   - Select services
   - Choose date & time
   - Fill in contact info (use a real email you can check)
   - Click "Confirm Appointment"

4. Check for:
   - ✅ Loading spinner appears
   - ✅ Success message shows
   - ✅ Confirmation email arrives (check spam folder!)
   - ✅ Admin notification arrives

### Test Spam Protection

Try these to verify protection is working:

1. **Rate Limiting**: Submit 2 bookings within 30 seconds
   - Expected: "Please wait XX seconds" message

2. **Hourly Limit**: Try to make 6 bookings in one hour
   - Expected: "Too many appointment requests" message

3. **Form Speed**: Fill form in < 5 seconds and submit
   - Expected: "Please take your time" message

---

## 🌐 Netlify Deployment

### Environment Variables on Netlify

Since your EmailJS config contains keys, you should use environment variables for production:

1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site settings** > **Environment variables**
4. Add these variables:
   - `EMAILJS_PUBLIC_KEY` = your public key
   - `EMAILJS_SERVICE_ID` = your service ID
   - `EMAILJS_CUSTOMER_TEMPLATE` = customer template ID
   - `EMAILJS_ADMIN_TEMPLATE` = admin template ID

5. Update your build command to replace placeholders during build

**OR** (simpler for MVP):

Just hardcode the values in `environment.prod.ts` since the Public Key is meant to be public and the templates are not sensitive.

### Deploy

```bash
git add .
git commit -m "Add email notification system"
git push origin main
```

Netlify will auto-deploy!

---

## 📊 Monitoring

### EmailJS Dashboard

Monitor your email usage:
- Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
- View sent emails
- Check delivery status
- Monitor your 200/month free tier limit

### Check Spam Protection

Check browser console (F12) to see rate limiting logs:
```javascript
localStorage.getItem('appointment_rate_limit')
```

---

## 🔒 Security Features

Your MVP includes:

1. **Client-side Rate Limiting**
   - Max 5 appointments per hour per device
   - Max 10 appointments per day per device
   - 30-second cooldown between submissions

2. **Form Validation**
   - Email format validation
   - Phone number validation
   - All required fields checked
   - Minimum form completion time (5 seconds)

3. **Email Delivery Protection**
   - Max 3 emails per minute per session
   - Graceful failure handling
   - User notified if email fails

---

## 📝 Email Template Variables

Your templates can use these variables:

### Customer Email
- `{{to_email}}` - Customer email
- `{{to_name}}` - Customer full name
- `{{customer_name}}` - First name
- `{{customer_phone}}` - Phone number
- `{{services}}` - List of services
- `{{appointment_date}}` - Formatted date
- `{{appointment_time}}` - Time slot
- `{{total_duration}}` - Duration in minutes
- `{{total_price}}` - Total price
- `{{notes}}` - Customer notes
- `{{business_name}}` - Your business name
- `{{business_address}}` - Full address
- `{{business_maps_url}}` - Google Maps link

### Admin Email
- `{{customer_name}}` - Full name
- `{{customer_phone}}` - Phone
- `{{customer_email}}` - Email
- `{{services}}` - Services with prices
- `{{appointment_date}}` - Date
- `{{appointment_time}}` - Time
- `{{total_duration}}` - Duration
- `{{total_price}}` - Price
- `{{notes}}` - Customer notes
- `{{booking_timestamp}}` - When booked

---

## 🎨 Customization

### Change Rate Limits

Edit `src/app/services/spam-protection.service.ts`:

```typescript
private readonly MAX_REQUESTS_PER_HOUR = 5;  // Change to 10
private readonly MAX_REQUESTS_PER_DAY = 10;  // Change to 20
private readonly MIN_TIME_BETWEEN_REQUESTS_MS = 30 * 1000;  // Change to 60s
```

### Disable Email Temporarily

In `environment.ts`, set empty strings:

```typescript
emailjs: {
  publicKey: '',
  serviceId: '',
  customerTemplateId: '',
  adminTemplateId: ''
}
```

The app will skip email sending gracefully.

---

## 🐛 Troubleshooting

### Emails Not Sending

1. **Check Browser Console** (F12)
   - Look for EmailJS errors
   - Verify API keys are set

2. **Verify EmailJS Dashboard**
   - Check if service is active
   - Verify templates exist
   - Check email quota (200/month)

3. **Check Spam Folder**
   - EmailJS emails often go to spam initially
   - Mark as "Not Spam" to train filters

### "Email service not configured" Message

- Check that all 4 EmailJS values are filled in `environment.ts`
- Restart development server after changes

### Rate Limit Issues

Clear browser storage:
```javascript
// In browser console
localStorage.removeItem('appointment_rate_limit');
sessionStorage.removeItem('email_rate_limit');
```

### EmailJS 403 Forbidden Error

- Your Public Key might be wrong
- Re-copy from EmailJS dashboard
- Make sure you called `emailService.initialize()` in `ngOnInit`

---

## 💰 Cost Analysis

### EmailJS Free Tier
- **200 emails/month FREE**
- ~100 appointments/month (2 emails per booking)
- Perfect for MVP!

### When to Upgrade?
If you get more than 100 appointments/month:
- **EmailJS Personal**: $7/month (1000 emails)
- **EmailJS Pro**: $15/month (5000 emails)

**Alternative**: Switch to backend with SendGrid (100 emails/day FREE)

---

## 🔄 Next Steps (Future Enhancements)

For production, consider:

1. **Backend API Integration**
   - Move email sending to server-side
   - More secure API key management
   - Better rate limiting with database

2. **Google reCAPTCHA v3**
   - Add invisible CAPTCHA
   - Better bot protection
   - Sign up at [Google reCAPTCHA](https://www.google.com/recaptcha/)

3. **Database Integration**
   - Save appointments to Supabase/Firebase
   - Track email delivery status
   - Prevent duplicate bookings

4. **SMS Notifications** (optional)
   - Add Twilio for SMS
   - Costs ~$0.01-0.05 per SMS
   - Better delivery rates

---

## 📞 Support

Need help? Check:
- [EmailJS Documentation](https://www.emailjs.com/docs/)
- [EmailJS Support](https://www.emailjs.com/support/)

---

## ✨ Summary

Your MVP now has:
- ✅ Email notifications (customer + admin)
- ✅ Spam protection
- ✅ Free hosting on Netlify
- ✅ Professional UI with loading states
- ✅ Zero backend required!

**Total Cost**: $0/month (up to 100 appointments)

Ready to launch! 🚀
