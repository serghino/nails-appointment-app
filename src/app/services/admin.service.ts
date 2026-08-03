import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export type AppointmentStatus = 'completed' | 'cancelled';

export interface AdminAppointmentService {
  service_id: number;
  service_name: string;
  service_duration: string;
  service_price: string;
}

export interface AdminAppointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  end_time: string;
  notes?: string;
  status: AppointmentStatus;
  customer_name: string;
  customer_lastname: string;
  customer_telephone: string;
  customer_email?: string;
  total_price: number;
  total_duration_minutes: number;
  created_at?: string;
  updated_at?: string;
  appointment_services?: AdminAppointmentService[];
}

export interface AdminAppointmentsResponse {
  totalRecords: number;
  offset: number;
  limit: number;
  appointments: AdminAppointment[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl || '/api';

  /**
   * List appointments, optionally filtered by date (YYYY-MM-DD) and status, with pagination
   */
  getAppointments(options: {
    date?: string;
    status?: AppointmentStatus | '';
    offset?: number;
    limit?: number;
  } = {}): Observable<AdminAppointmentsResponse> {
    let params = new HttpParams()
      .set('offset', options.offset ?? 0)
      .set('limit', options.limit ?? 50);

    if (options.date) params = params.set('date', options.date);
    if (options.status) params = params.set('status', options.status);

    return this.http.get<AdminAppointmentsResponse>(`${this.apiUrl}/admin/appointments`, { params }).pipe(
      catchError(error => throwError(() => new Error(error.error?.error || 'Failed to load appointments')))
    );
  }

  getAppointmentById(id: string): Observable<{ appointment: AdminAppointment }> {
    return this.http.get<{ appointment: AdminAppointment }>(`${this.apiUrl}/admin/appointments/${id}`).pipe(
      catchError(error => throwError(() => new Error(error.error?.error || 'Failed to load appointment')))
    );
  }

  updateStatus(id: string, status: AppointmentStatus): Observable<{ success: boolean }> {
    return this.http.patch<{ success: boolean }>(`${this.apiUrl}/admin/appointments/${id}/status`, { status }).pipe(
      catchError(error => throwError(() => new Error(error.error?.error || 'Failed to update appointment')))
    );
  }

  cancelAppointment(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/admin/appointments/${id}`).pipe(
      catchError(error => throwError(() => new Error(error.error?.error || 'Failed to cancel appointment')))
    );
  }
}
