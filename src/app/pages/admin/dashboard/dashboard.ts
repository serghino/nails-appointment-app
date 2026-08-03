import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService, AdminAppointment, AppointmentStatus } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';
import ROUTES from '../../../models/routes';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  appointments = signal<AdminAppointment[]>([]);
  totalRecords = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);
  isLoading = signal(false);
  expandedId = signal<string | null>(null);
  processingId = signal<string | null>(null);

  filterForm = this.fb.group({
    date: [null as Date | null],
    status: ['' as AppointmentStatus | '']
  });

  ngOnInit(): void {
    this.loadAppointments();

    this.filterForm.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.pageIndex.set(0);
      this.loadAppointments();
    });
  }

  loadAppointments(): void {
    this.isLoading.set(true);
    const { date, status } = this.filterForm.getRawValue();

    this.adminService.getAppointments({
      date: date ? this.formatDate(date) : undefined,
      status: status || undefined,
      offset: this.pageIndex() * this.pageSize(),
      limit: this.pageSize()
    }).subscribe({
      next: (response) => {
        this.appointments.set(response.appointments);
        this.totalRecords.set(response.totalRecords);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.snackBar.open(error.message || 'Failed to load appointments', 'Close', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadAppointments();
  }

  toggleExpand(id: string): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  markCompleted(appointment: AdminAppointment): void {
    this.updateStatus(appointment, 'completed');
  }

  cancelAppointment(appointment: AdminAppointment): void {
    if (!confirm(`Cancel the appointment for ${appointment.customer_name} ${appointment.customer_lastname}?`)) {
      return;
    }
    this.updateStatus(appointment, 'cancelled');
  }

  private updateStatus(appointment: AdminAppointment, status: AppointmentStatus): void {
    this.processingId.set(appointment.id);
    this.adminService.updateStatus(appointment.id, status).subscribe({
      next: () => {
        this.processingId.set(null);
        this.snackBar.open('Appointment updated', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
        this.loadAppointments();
      },
      error: (error) => {
        this.processingId.set(null);
        this.snackBar.open(error.message || 'Failed to update appointment', 'Close', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  clearFilters(): void {
    this.filterForm.reset({ date: null, status: '' });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate([`/${ROUTES.adminLogin}`]);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
