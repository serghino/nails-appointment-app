import { Injectable } from '@angular/core';

interface RateLimitData {
  count: number;
  firstRequestTime: number;
  lastRequestTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class SpamProtectionService {
  private readonly STORAGE_KEY = 'appointment_rate_limit';
  private readonly MAX_REQUESTS_PER_HOUR = 5; // Max 5 appointments per hour
  private readonly MAX_REQUESTS_PER_DAY = 10; // Max 10 appointments per day
  private readonly HOUR_IN_MS = 60 * 60 * 1000;
  private readonly DAY_IN_MS = 24 * 60 * 60 * 1000;
  private readonly MIN_TIME_BETWEEN_REQUESTS_MS = 30 * 1000; // 30 seconds between requests

  /**
   * Check if user can submit a new appointment (rate limiting)
   */
  canSubmitAppointment(): { allowed: boolean; message: string; waitTime?: number } {
    const data = this.getRateLimitData();
    const now = Date.now();

    // Check minimum time between requests
    if (data.lastRequestTime && (now - data.lastRequestTime) < this.MIN_TIME_BETWEEN_REQUESTS_MS) {
      const waitTime = Math.ceil((this.MIN_TIME_BETWEEN_REQUESTS_MS - (now - data.lastRequestTime)) / 1000);
      return {
        allowed: false,
        message: `Please wait ${waitTime} seconds before submitting another appointment.`,
        waitTime
      };
    }

    // Reset if first request was more than a day ago
    if (data.firstRequestTime && (now - data.firstRequestTime) > this.DAY_IN_MS) {
      this.resetRateLimitData();
      return { allowed: true, message: 'OK' };
    }

    // Check daily limit
    if (data.count >= this.MAX_REQUESTS_PER_DAY) {
      return {
        allowed: false,
        message: 'You have reached the maximum number of appointments for today. Please try again tomorrow.'
      };
    }

    // Check hourly limit
    if (data.firstRequestTime && (now - data.firstRequestTime) < this.HOUR_IN_MS) {
      if (data.count >= this.MAX_REQUESTS_PER_HOUR) {
        const waitTime = Math.ceil((this.HOUR_IN_MS - (now - data.firstRequestTime)) / 60000);
        return {
          allowed: false,
          message: `Too many appointment requests. Please wait ${waitTime} minutes.`,
          waitTime: waitTime * 60
        };
      }
    }

    return { allowed: true, message: 'OK' };
  }

  /**
   * Check if email can be sent (separate from appointment rate limit)
   */
  canSendEmail(): boolean {
    const emailData = this.getEmailRateLimitData();
    const now = Date.now();

    // Allow max 3 emails per minute
    if (emailData.count >= 3 && (now - emailData.firstRequestTime) < 60000) {
      return false;
    }

    // Reset if more than a minute has passed
    if (emailData.firstRequestTime && (now - emailData.firstRequestTime) > 60000) {
      this.resetEmailRateLimitData();
    }

    return true;
  }

  /**
   * Record that an appointment was submitted
   */
  recordAppointmentSubmission(): void {
    const data = this.getRateLimitData();
    const now = Date.now();

    // Reset if first request was more than a day ago
    if (data.firstRequestTime && (now - data.firstRequestTime) > this.DAY_IN_MS) {
      this.resetRateLimitData();
    }

    const currentData = this.getRateLimitData();
    
    this.setRateLimitData({
      count: currentData.count + 1,
      firstRequestTime: currentData.firstRequestTime || now,
      lastRequestTime: now
    });
  }

  /**
   * Record that an email was sent
   */
  recordEmailSent(): void {
    const data = this.getEmailRateLimitData();
    const now = Date.now();

    this.setEmailRateLimitData({
      count: data.count + 1,
      firstRequestTime: data.firstRequestTime || now,
      lastRequestTime: now
    });
  }

  /**
   * Validate honeypot field - should be empty if submitted by human
   */
  validateHoneypot(honeypotValue: string | null | undefined): boolean {
    // If honeypot field has a value, it's likely a bot
    return !honeypotValue || honeypotValue.trim() === '';
  }

  /**
   * Check basic timestamp validation (form shouldn't be submitted too fast)
   * Returns true if the time spent is reasonable (> 5 seconds)
   */
  validateFormTiming(formStartTime: number): boolean {
    const now = Date.now();
    const timeSpent = now - formStartTime;
    
    // Form filled in less than 5 seconds is suspicious
    return timeSpent >= 5000;
  }

  /**
   * Get browser fingerprint hints for additional validation
   * This is a simple implementation - not meant for serious fingerprinting
   */
  getBrowserHints(): Record<string, string | number | boolean> {
    return {
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      platform: navigator.platform,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      timezoneOffset: new Date().getTimezoneOffset()
    };
  }

  private getRateLimitData(): RateLimitData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to read rate limit data:', e);
    }
    return { count: 0, firstRequestTime: 0, lastRequestTime: 0 };
  }

  private setRateLimitData(data: RateLimitData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save rate limit data:', e);
    }
  }

  private resetRateLimitData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to reset rate limit data:', e);
    }
  }

  private getEmailRateLimitData(): RateLimitData {
    try {
      const stored = sessionStorage.getItem('email_rate_limit');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to read email rate limit data:', e);
    }
    return { count: 0, firstRequestTime: 0, lastRequestTime: 0 };
  }

  private setEmailRateLimitData(data: RateLimitData): void {
    try {
      sessionStorage.setItem('email_rate_limit', JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save email rate limit data:', e);
    }
  }

  private resetEmailRateLimitData(): void {
    try {
      sessionStorage.removeItem('email_rate_limit');
    } catch (e) {
      console.warn('Failed to reset email rate limit data:', e);
    }
  }
}
