import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NAIL_SERVICE_CATALOG, Service } from '../../../models/appointment-data.model';
import { AdminAppointment, UpdateAppointmentPayload } from '../../../services/admin.service';

export interface EditAppointmentDialogData {
  appointment: AdminAppointment;
}

@Component({
  selector: 'app-edit-appointment-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './edit-appointment-dialog.html',
  styleUrl: './edit-appointment-dialog.scss'
})
export class EditAppointmentDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditAppointmentDialogComponent>);
  private data = inject<EditAppointmentDialogData>(MAT_DIALOG_DATA);

  serviceCatalog: Service[] = NAIL_SERVICE_CATALOG;
  isSubmitting = signal(false);

  editForm = this.fb.group({
    date: [this.parseDate(this.data.appointment.appointment_date), Validators.required],
    time: [this.data.appointment.appointment_time.slice(0, 5), [Validators.required, Validators.pattern(/^\d{2}:\d{2}$/)]],
    serviceIds: [(this.data.appointment.appointment_services || []).map(s => s.service_id), Validators.required],
    notes: [this.data.appointment.notes || '']
  });

  get selectedServices(): Service[] {
    const ids = this.editForm.get('serviceIds')?.value || [];
    return this.serviceCatalog.filter(service => ids.includes(service.id));
  }

  get totalPrice(): number {
    return this.selectedServices.reduce((sum, service) => sum + parseInt(service.price.replace('$', '')), 0);
  }

  get totalDurationMinutes(): number {
    return this.selectedServices.reduce((sum, service) => sum + this.parseDurationMinutes(service.duration), 0);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const { date, time, serviceIds, notes } = this.editForm.getRawValue();
    const services = this.serviceCatalog.filter(service => (serviceIds || []).includes(service.id));

    const payload: UpdateAppointmentPayload = {
      date: this.formatDate(date as Date),
      timeSlot: time as string,
      services: services.map(service => ({
        id: service.id,
        name: service.name,
        duration: service.duration,
        price: service.price
      })),
      notes: notes || ''
    };

    this.dialogRef.close(payload);
  }

  private parseDate(dateString: string): Date {
    return new Date(`${dateString}T00:00:00`);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private parseDurationMinutes(duration: string): number {
    const hoursMatch = duration.match(/(\d+)h/);
    const minutesMatch = duration.match(/(\d+)m/);
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
    return hours * 60 + minutes;
  }
}
