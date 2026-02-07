import { Component, EventEmitter, Input, Output, signal, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Service } from '../../../models/service.model';

interface TimeSlot {
  time: string;
  available: boolean;
}

@Component({
  selector: 'app-date-time-selection',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './date-time-selection.html',
  styleUrl: './date-time-selection.scss'
})
export class DateTimeSelectionComponent implements OnInit, OnChanges {
  @Input() services: Service[] = [];
  @Output() dateTimeSelected = new EventEmitter<any>();
  @Output() back = new EventEmitter<void>();

  dateTimeForm: FormGroup;
  minDate = new Date();
  availableTimeSlots = signal<TimeSlot[]>([]);
  private previousServiceIds: string = '';

  constructor(private fb: FormBuilder) {
    this.dateTimeForm = this.fb.group({
      date: ['', Validators.required],
      timeSlot: ['', Validators.required],
      notes: ['']
    });

    this.dateTimeForm.get('date')?.valueChanges.subscribe(date => {
      this.dateTimeForm.patchValue({ timeSlot: '' });
      
      if (date) {
        this.updateAvailableTimeSlots(date);
      }
    });
  }

  ngOnInit(): void {
    // Enable date field since services are already selected
    // Store initial service IDs
    this.previousServiceIds = this.getServiceIds();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['services'] && !changes['services'].firstChange) {
      const currentServiceIds = this.getServiceIds();
      
      // Check if services actually changed
      if (currentServiceIds !== this.previousServiceIds) {
        console.log('Services changed, recalculating time slots...');
        this.previousServiceIds = currentServiceIds;
        
        // Get the current date
        const currentDate = this.dateTimeForm.get('date')?.value;
        
        // Clear the selected time slot since it may no longer be valid
        const currentTimeSlot = this.dateTimeForm.get('timeSlot')?.value;
        this.dateTimeForm.patchValue({ timeSlot: '' });
        
        // If a date was already selected, recalculate time slots
        if (currentDate) {
          this.updateAvailableTimeSlots(currentDate);
          
          // Check if the previously selected time slot is still valid
          if (currentTimeSlot) {
            const slotStillAvailable = this.availableTimeSlots().find(
              slot => slot.time === currentTimeSlot && slot.available
            );
            
            if (slotStillAvailable) {
              // Restore the time slot if it's still valid
              this.dateTimeForm.patchValue({ timeSlot: currentTimeSlot });
            }
          }
        }
      }
    }
  }

  private getServiceIds(): string {
    return this.services.map(s => s.id).sort().join(',');
    this.dateTimeForm.get('date')?.enable();
  }

  private updateAvailableTimeSlots(date: Date): void {
    const slots: TimeSlot[] = [];
    const selectedDate = new Date(date);
    const today = new Date();
    const dayOfWeek = selectedDate.getDay();
    
    let startHour: number;
    let endHour: number;
    
    if (dayOfWeek === 0) {
      this.availableTimeSlots.set(slots);
      return;
    } else if (dayOfWeek === 6) {
      startHour = 10;
      endHour = 17;
    } else {
      startHour = 10;
      endHour = 19;
    }
    
    let totalDurationMinutes = 0;
    this.services.forEach(service => {
      const hoursMatch = service.duration.match(/(\d+)h/);
      const minutesMatch = service.duration.match(/(\d+)m/);
      const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
      const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
      totalDurationMinutes += (hours * 60) + minutes;
    });
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        let available = true;
        
        if (totalDurationMinutes > 0) {
          const slotStartMinutes = hour * 60 + minute;
          const appointmentEndMinutes = slotStartMinutes + totalDurationMinutes;
          const closingTimeMinutes = endHour * 60;
          
          if (appointmentEndMinutes > closingTimeMinutes) {
            available = false;
          }
        }
        
        if (available && selectedDate.toDateString() === today.toDateString()) {
          const slotTime = new Date(selectedDate);
          slotTime.setHours(hour, minute, 0, 0);
          available = slotTime > today;
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
    
    // Block specific dates: February 7, 2026 (today) and February 9, 2026 (Monday)
    const blockedDates = [
      new Date(2026, 1, 7), // February 7, 2026 (month is 0-indexed)
      new Date(2026, 1, 9)  // February 9, 2026
    ];
    
    const dateStr = date.toDateString();
    const isBlocked = blockedDates.some(blocked => blocked.toDateString() === dateStr);
    
    // Disable Sundays (0) and blocked dates
    return date >= today && dayOfWeek !== 0 && !isBlocked;
  };

  onContinue(): void {
    if (this.dateTimeForm.valid) {
      const formValue = this.dateTimeForm.value;
      this.dateTimeSelected.emit({
        date: formValue.date,
        timeSlot: formValue.timeSlot,
        notes: formValue.notes
      });
    } else {
      Object.keys(this.dateTimeForm.controls).forEach(key => {
        this.dateTimeForm.get(key)?.markAsTouched();
      });
    }
  }

  onBack(): void {
    this.back.emit();
  }

  getEstimatedEndTime(startTime: string): string {
    if (this.services.length === 0) return '';
    
    let totalDurationMinutes = 0;
    this.services.forEach(service => {
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
