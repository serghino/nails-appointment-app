import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { MatIconModule } from '@angular/material/icon';
import { Service, NAIL_SERVICE_CATALOG } from '../../models/service.model';

interface TimeSlot {
  time: string;
  available: boolean;
}

@Component({
  selector: 'app-calendar',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss'
})
export class Calendar {
  appointmentForm: FormGroup;
  minDate = new Date();
  
  services = signal<Service[]>(NAIL_SERVICE_CATALOG);
  availableTimeSlots = signal<TimeSlot[]>([]);
  selectedServices = signal<Service[]>([]);

  constructor(private fb: FormBuilder) {
    this.appointmentForm = this.fb.group({
      service: [[], Validators.required],
      date: [{ value: '', disabled: true }, Validators.required],
      timeSlot: ['', Validators.required],
      notes: ['']
    });

    this.appointmentForm.get('service')?.valueChanges.subscribe(serviceIds => {
      const selectedServices = this.services().filter(s => serviceIds.includes(s.id));
      this.selectedServices.set(selectedServices);
      
      // Enable/disable date field based on service selection
      if (selectedServices.length > 0) {
        this.appointmentForm.get('date')?.enable();
      } else {
        this.appointmentForm.get('date')?.disable();
      }
    });

    this.appointmentForm.get('date')?.valueChanges.subscribe(date => {
      if (date) {
        this.updateAvailableTimeSlots(date);
      }
    });
  }

  private updateAvailableTimeSlots(date: Date): void {
    const slots: TimeSlot[] = [];
    const selectedDate = new Date(date);
    const today = new Date();
    const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Define hours based on day of week
    // Mon-Fri: 10AM-7PM, Sat: 10AM-5PM, Sun: Closed
    let startHour: number;
    let endHour: number;
    
    if (dayOfWeek === 0) {
      // Sunday - Closed
      this.availableTimeSlots.set(slots);
      return;
    } else if (dayOfWeek === 6) {
      // Saturday: 10AM-5PM
      startHour = 10;
      endHour = 17;
    } else {
      // Monday-Friday: 10AM-7PM
      startHour = 10;
      endHour = 19;
    }
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        let available = true;
        if (selectedDate.toDateString() === today.toDateString()) {
          const slotTime = new Date(selectedDate);
          slotTime.setHours(hour, minute, 0, 0);
          available = slotTime > today;
        }
        
        if (available && Math.random() > 0.7) {
          available = false;
        }
        
        slots.push({ time, available });
      }
    }
    
    this.availableTimeSlots.set(slots);
  }

  dateFilter = (date: Date | null): boolean => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = date.getDay();
    // Disable Sundays (0)
    return date >= today && dayOfWeek !== 0;
  };

  onSubmit(): void {
    if (this.appointmentForm.valid) {
      const formValue = this.appointmentForm.value;
      const appointment = {
        services: this.selectedServices(),
        date: formValue.date,
        timeSlot: formValue.timeSlot,
        notes: formValue.notes
      };
      
      console.log('Booking appointment:', appointment);
      
      const serviceNames = appointment.services.map(s => s.name).join('\n- ');
      alert(`Appointment booked successfully!\n\nServices:\n- ${serviceNames}\n\nDate: ${appointment.date.toLocaleDateString()}\nTime: ${appointment.timeSlot}\nTotal Duration: ${this.getTotalDuration()}\nTotal Price: ${this.getTotalPrice()}`);
      
      this.appointmentForm.reset();
      this.appointmentForm.patchValue({ service: [] });
      this.selectedServices.set([]);
      this.availableTimeSlots.set([]);
    }
  }

  getTotalDuration(): string {
    const services = this.selectedServices();
    if (services.length === 0) return '';
    
    let totalMinutes = 0;
    services.forEach(service => {
      const hoursMatch = service.duration.match(/(\d+)h/);
      const minutesMatch = service.duration.match(/(\d+)m/);
      const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
      const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
      totalMinutes += (hours * 60) + minutes;
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  }

  getTotalPrice(): string {
    const services = this.selectedServices();
    if (services.length === 0) return '';
    
    let total = 0;
    services.forEach(service => {
      const price = parseInt(service.price.replace('$', ''));
      total += price;
    });
    
    return `$${total}`;
  }

  getEstimatedEndTime(startTime: string): string {
    if (this.selectedServices().length === 0) return '';
    
    // Calculate total duration from all selected services
    let totalDurationMinutes = 0;
    this.selectedServices().forEach(service => {
      const hoursMatch = service.duration.match(/(\d+)h/);
      const minutesMatch = service.duration.match(/(\d+)m/);
      const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
      const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
      totalDurationMinutes += (hours * 60) + minutes;
    });
    
    const [hours, minutes] = startTime.split(':').map(Number);
    
    const endMinutes = minutes + totalDurationMinutes;
    const endHours = hours + Math.floor(endMinutes / 60);
    const finalMinutes = endMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
  }
}
