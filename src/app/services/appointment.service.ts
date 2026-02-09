import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TimeSlot {
  time: string;
  available: boolean;
  endTime: string;
}

export interface AvailabilityResponse {
  date: string;
  dayOfWeek: number;
  businessHours: {
    start: number;
    end: number;
  };
  slots: TimeSlot[];
}

export interface AppointmentRequest {
  services: any[];
  date: Date;
  timeSlot: string;
  notes: string;
  user: {
    name: string;
    lastname: string;
    telephone: string;
    email?: string;
  };
}

export interface AppointmentResponse {
  success: boolean;
  appointment: any;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl || 'http://localhost:3001/api';

  /**
   * Check available time slots for a given date and services
   */
  checkAvailability(date: Date, serviceIds: string[]): Observable<AvailabilityResponse> {
    const params = new HttpParams()
      .set('date', date.toISOString())
      .set('serviceIds', serviceIds.join(','));

    return this.http.get<AvailabilityResponse>(
      `${this.apiUrl}/appointments/availability`,
      { params }
    ).pipe(
      catchError(error => {
        console.error('Error checking availability:', error);
        return throwError(() => new Error('Failed to check availability'));
      })
    );
  }

  /**
   * Create a new appointment
   */
  createAppointment(appointmentData: AppointmentRequest): Observable<AppointmentResponse> {
    return this.http.post<AppointmentResponse>(
      `${this.apiUrl}/appointments`,
      appointmentData
    ).pipe(
      catchError(error => {
        console.error('Error creating appointment:', error);
        return throwError(() => new Error('Failed to create appointment'));
      })
    );
  }

  /**
   * Get user's appointments
   */
  getUserAppointments(userId?: string): Observable<any> {
    let params = new HttpParams();
    if (userId) {
      params = params.set('userId', userId);
    }

    return this.http.get(`${this.apiUrl}/appointments`, { params }).pipe(
      catchError(error => {
        console.error('Error getting appointments:', error);
        return throwError(() => new Error('Failed to get appointments'));
      })
    );
  }

  /**
   * Cancel an appointment
   */
  cancelAppointment(appointmentId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/appointments/${appointmentId}`).pipe(
      catchError(error => {
        console.error('Error cancelling appointment:', error);
        return throwError(() => new Error(
          error.error?.error || 'Failed to cancel appointment'
        ));
      })
    );
  }

  /**
   * Update an appointment
   */
  updateAppointment(appointmentId: string, updates: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/appointments/${appointmentId}`, updates).pipe(
      catchError(error => {
        console.error('Error updating appointment:', error);
        return throwError(() => new Error('Failed to update appointment'));
      })
    );
  }

  /**
   * Get all appointments (admin only)
   */
  getAdminAppointments(date?: string, status?: string): Observable<any> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    if (status) params = params.set('status', status);

    return this.http.get(`${this.apiUrl}/appointments/admin`, { params }).pipe(
      catchError(error => {
        console.error('Error getting admin appointments:', error);
        return throwError(() => new Error('Failed to get admin appointments'));
      })
    );
  }
}
