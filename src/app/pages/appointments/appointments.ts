import { Component, signal, ViewChild, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ServiceSelectionComponent } from './service-selection/service-selection';
import { DateTimeSelectionComponent } from './date-time-selection/date-time-selection';
import { UserInfoComponent } from './user-info/user-info';
import { ConfirmationComponent } from './confirmation/confirmation';
import { AppointmentData, DateTimeData, Service, UserInfo } from '../../models/appointment-data.model';
import { AppointmentService } from '../../services/appointment.service';
import { SpamProtectionService } from '../../services/spam-protection.service';

@Component({
  selector: 'app-appointments',
  imports: [
    CommonModule,
    ServiceSelectionComponent,
    DateTimeSelectionComponent,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    UserInfoComponent,
    ConfirmationComponent
  ],
  templateUrl: './appointments.html',
  styleUrl: './appointments.scss'
})
export class AppointmentsComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;

  private appointmentService = inject(AppointmentService);
  private spamProtection = inject(SpamProtectionService);
  private snackBar = inject(MatSnackBar);

  isSubmitting = signal(false);
  formStartTime = Date.now();

  // Step completion signals - set BEFORE calling stepper.next()
  step1Complete = signal(false);
  step2Complete = signal(false);
  step3Complete = signal(false);

  appointmentData = signal<AppointmentData>({
    services: [],
    date: null,
    timeSlot: null,
    notes: '',
    user: {
      name: '',
      lastname: '',
      telephone: '',
      email: ''
    }
  });

  selectedServices = signal<Service[]>([]);

  ngOnInit(): void {
    this.formStartTime = Date.now();
  }

  onServicesSelected(services: Service[]) {
    this.selectedServices.set(services);
    this.appointmentData.update(data => ({
      ...data,
      services: services
    }));
    this.step1Complete.set(true);
    // Mark current step as completed directly before navigation
    this.stepper.selected!.completed = true;
    this.stepper.next();
  }

  onDateTimeSelected(dateTimeData: DateTimeData) {
    this.appointmentData.update(data => ({
      ...data,
      date: dateTimeData.date,
      timeSlot: dateTimeData.timeSlot,
      notes: dateTimeData.notes
    }));
    this.step2Complete.set(true);
    // Mark current step as completed directly before navigation
    this.stepper.selected!.completed = true;
    this.stepper.next();
  }

  onUserInfoCompleted(userData: UserInfo) {
    this.appointmentData.update(data => ({
      ...data,
      user: userData
    }));
    this.step3Complete.set(true);
    // Mark current step as completed directly before navigation
    this.stepper.selected!.completed = true;
    this.stepper.next();
  }

  async onConfirmAppointment() {
    // Prevent double submission
    if (this.isSubmitting()) {
      return;
    }

    // Validate that all required fields are present
    const data = this.appointmentData();
    
    // Check services
    if (!data.services || data.services.length === 0) {
      this.snackBar.open('Please select at least one service.', 'OK', {
        duration: 5000,
        panelClass: ['warning-snackbar']
      });
      this.stepper.selectedIndex = 0; // Go back to service selection
      return;
    }
    
    // Check date and time
    if (!data.date || !data.timeSlot || !data.timeSlot.time) {
      this.snackBar.open('Please select a date and time.', 'OK', {
        duration: 5000,
        panelClass: ['warning-snackbar']
      });
      this.stepper.selectedIndex = 1; // Go back to date/time selection
      return;
    }
    
    // Check user information
    if (!data.user.name || !data.user.lastname || !data.user.telephone) {
      this.snackBar.open('Please complete your contact information.', 'OK', {
        duration: 5000,
        panelClass: ['warning-snackbar']
      });
      this.stepper.selectedIndex = 2; // Go back to user info
      return;
    }
    
    // Validate phone number format (basic check)
    if (data.user.telephone.length < 10) {
      this.snackBar.open('Please enter a valid phone number.', 'OK', {
        duration: 5000,
        panelClass: ['warning-snackbar']
      });
      this.stepper.selectedIndex = 2;
      return;
    }
    
    // Validate email format if provided
    if (data.user.email && !this.isValidEmail(data.user.email)) {
      this.snackBar.open('Please enter a valid email address.', 'OK', {
        duration: 5000,
        panelClass: ['warning-snackbar']
      });
      this.stepper.selectedIndex = 2;
      return;
    }

    // Validate form timing (spam protection)
    if (!this.spamProtection.validateFormTiming(this.formStartTime)) {
      this.snackBar.open('Please take your time filling out the form.', 'OK', {
        duration: 5000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    // Check rate limiting
    const rateLimitCheck = this.spamProtection.canSubmitAppointment();
    if (!rateLimitCheck.allowed) {
      this.snackBar.open(rateLimitCheck.message, 'OK', {
        duration: 5000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    this.isSubmitting.set(true);

    try {
      // Record the appointment submission for rate limiting
      this.spamProtection.recordAppointmentSubmission();

      // Prepare appointment data for backend
      const appointmentRequest = {
        services: this.appointmentData().services,
        date: this.appointmentData().date!,
        timeSlot: this.appointmentData().timeSlot!.time,
        notes: this.appointmentData().notes,
        user: {
          name: this.appointmentData().user.name,
          lastname: this.appointmentData().user.lastname,
          telephone: this.appointmentData().user.telephone,
          email: this.appointmentData().user.email
        }
      };

      // Save appointment to database via backend API
      const response = await firstValueFrom(this.appointmentService.createAppointment(appointmentRequest));

      // Show success message
      let message = 'Appointment confirmed successfully!';
      // Email notifications will be sent by backend
      if (this.appointmentData().user.email) {
        message += ' You will receive a confirmation email shortly.';
      }

      this.snackBar.open(message, 'OK', {
        duration: 8000,
        panelClass: ['success-snackbar']
      });

      // Refresh the page after successful appointment creation
      setTimeout(() => {
        window.location.reload();
      }, 3000); // Wait 3 seconds so user can see success message
      
    } catch (error) {
      console.error('Failed to confirm appointment:', error);
      
      // Check if it's a time slot conflict
      if (error && typeof error === 'object' && 'status' in error && error.status === 409) {
        this.snackBar.open(
          'This time slot is no longer available. Please select another time.',
          'OK',
          { duration: 8000, panelClass: ['error-snackbar'] }
        );
      } else {
        this.snackBar.open(
          'Failed to create appointment. Please try again.',
          'OK',
          { duration: 8000, panelClass: ['error-snackbar'] }
        );
      }
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onEditStep(stepIndex: number) {
    this.stepper.selectedIndex = stepIndex;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
