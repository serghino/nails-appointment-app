import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppointmentData } from '../models/appointment-data.model';

@Component({
  selector: 'app-confirmation',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './confirmation.html',
  styleUrl: './confirmation.scss'
})
export class ConfirmationComponent {
  @Input() appointmentData!: AppointmentData;
  @Input() isSubmitting = false;
  @Output() confirm = new EventEmitter<void>();
  @Output() edit = new EventEmitter<number>();
  @Output() back = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onEdit(stepIndex: number) {
    this.edit.emit(stepIndex);
  }

  onBack() {
    this.back.emit();
  }

  formatDate(date: Date | null): string {
    if (!date) return 'Not selected';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getTotalDuration(): number {
    let totalMinutes = 0;
    this.appointmentData.services.forEach(service => {
      const hoursMatch = service.duration.match(/(\d+)h/);
      const minutesMatch = service.duration.match(/(\d+)m/);
      const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
      const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
      totalMinutes += (hours * 60) + minutes;
    });
    return totalMinutes;
  }

  getTotalPrice(): number {
    let total = 0;
    this.appointmentData.services.forEach(service => {
      const price = parseInt(service.price.replace('$', ''));
      total += price;
    });
    return total;
  }
}
