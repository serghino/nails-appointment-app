import { Injectable, inject } from '@angular/core';
import emailjs from '@emailjs/browser';
import { environment } from '../../environments/environment';
import { AppointmentData } from '../pages/appointments/models/appointment-data.model';
import { SpamProtectionService } from './spam-protection.service';

export interface EmailResult {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailNotificationService {
  private spamProtection = inject(SpamProtectionService);

  /**
   * Initialize EmailJS with public key
   * Call this once in app initialization
   */
  initialize(): void {
    if (environment.emailjs?.publicKey) {
      emailjs.init(environment.emailjs.publicKey);
    }
  }

  /**
   * Send appointment confirmation email to the customer
   */
  async sendCustomerConfirmation(appointmentData: AppointmentData): Promise<EmailResult> {
    // Check spam protection
    if (!this.spamProtection.canSendEmail()) {
      return {
        success: false,
        message: 'Too many requests. Please wait before trying again.'
      };
    }

    // Only send if email is provided
    if (!appointmentData.user.email) {
      return {
        success: false,
        message: 'No email address provided'
      };
    }

    // Check if EmailJS is configured
    if (!environment.emailjs?.serviceId || !environment.emailjs?.customerTemplateId) {
      console.warn('EmailJS not configured. Skipping email notification.');
      return {
        success: false,
        message: 'Email service not configured'
      };
    }

    try {
      const templateParams = this.buildCustomerEmailParams(appointmentData);
      
      await emailjs.send(
        environment.emailjs.serviceId,
        environment.emailjs.customerTemplateId,
        templateParams
      );

      this.spamProtection.recordEmailSent();

      return {
        success: true,
        message: 'Confirmation email sent successfully'
      };
    } catch (error) {
      console.error('Failed to send customer email:', error);
      return {
        success: false,
        message: 'Failed to send confirmation email'
      };
    }
  }

  /**
   * Send notification email to the business owner/admin
   */
  async sendAdminNotification(appointmentData: AppointmentData): Promise<EmailResult> {
    // Check spam protection
    if (!this.spamProtection.canSendEmail()) {
      return {
        success: false,
        message: 'Too many requests. Please wait before trying again.'
      };
    }

    // Check if EmailJS is configured
    if (!environment.emailjs?.serviceId || !environment.emailjs?.adminTemplateId) {
      console.warn('EmailJS admin template not configured. Skipping admin notification.');
      return {
        success: false,
        message: 'Admin email service not configured'
      };
    }

    try {
      const templateParams = this.buildAdminEmailParams(appointmentData);
      
      await emailjs.send(
        environment.emailjs.serviceId,
        environment.emailjs.adminTemplateId,
        templateParams
      );

      this.spamProtection.recordEmailSent();

      return {
        success: true,
        message: 'Admin notification sent successfully'
      };
    } catch (error) {
      console.error('Failed to send admin notification:', error);
      return {
        success: false,
        message: 'Failed to send admin notification'
      };
    }
  }

  /**
   * Send both customer and admin notifications
   */
  async sendAllNotifications(appointmentData: AppointmentData): Promise<{
    customer: EmailResult;
    admin: EmailResult;
  }> {
    const [customerResult, adminResult] = await Promise.all([
      this.sendCustomerConfirmation(appointmentData),
      this.sendAdminNotification(appointmentData)
    ]);

    return {
      customer: customerResult,
      admin: adminResult
    };
  }

  private buildCustomerEmailParams(data: AppointmentData): Record<string, string> {
    const services = data.services.map(s => s.name).join(', ');
    const totalPrice = data.services.reduce((sum, s) => {
      const price = parseInt(s.price.replace('$', '')) || 0;
      return sum + price;
    }, 0);
    const totalDuration = this.calculateTotalDuration(data.services);

    return {
      to_email: data.user.email || '',
      to_name: `${data.user.name} ${data.user.lastname}`,
      // Template content fields
      customer_name: data.user.name,
      customer_phone: data.user.telephone,
      services: services,
      appointment_date: this.formatDate(data.date),
      appointment_time: data.timeSlot || 'Not specified',
      total_duration: `${totalDuration} minutes`,
      total_price: `$${totalPrice}`,
      notes: data.notes || 'No special notes',
      business_name: environment.business.name,
      business_address: environment.business.address,
      business_maps_url: environment.business.mapsUrl
    };
  }

  private buildAdminEmailParams(data: AppointmentData): Record<string, string> {
    const services = data.services.map(s => `${s.name} (${s.price})`).join(', ');
    const totalPrice = data.services.reduce((sum, s) => {
      const price = parseInt(s.price.replace('$', '')) || 0;
      return sum + price;
    }, 0);
    const totalDuration = this.calculateTotalDuration(data.services);

    return {
      // Reply-to customer's email so admin can respond directly
      reply_to: data.user.email || '',
      // Template content fields
      customer_name: `${data.user.name} ${data.user.lastname}`,
      customer_phone: data.user.telephone,
      customer_email: data.user.email || 'Not provided',
      services: services,
      appointment_date: this.formatDate(data.date),
      appointment_time: data.timeSlot || 'Not specified',
      total_duration: `${totalDuration} minutes`,
      total_price: `$${totalPrice}`,
      notes: data.notes || 'No special notes',
      booking_timestamp: new Date().toLocaleString()
    };
  }

  private formatDate(date: Date | null): string {
    if (!date) return 'Not selected';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private calculateTotalDuration(services: any[]): number {
    return services.reduce((total, service) => {
      const hoursMatch = service.duration.match(/(\d+)h/);
      const minutesMatch = service.duration.match(/(\d+)m/);
      const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
      const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
      return total + (hours * 60) + minutes;
    }, 0);
  }
}
