import { Component, signal, ViewChild, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ServiceSelectionComponent } from './service-selection/service-selection';
import { DateTimeSelectionComponent } from './date-time-selection/date-time-selection';
import { UserInfoComponent } from './user-info/user-info';
import { ConfirmationComponent } from './confirmation/confirmation';
import { AppointmentData } from './models/appointment-data.model';
import { Service } from '../../models/service.model';
import { EmailNotificationService } from '../../services/email-notification.service';
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

  private emailService = inject(EmailNotificationService);
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
    // Initialize email service
    this.emailService.initialize();
    // Record form start time for spam protection
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

  onDateTimeSelected(dateTimeData: any) {
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

  onUserInfoCompleted(userData: any) {
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

      // Send email notifications
      const emailResults = await this.emailService.sendAllNotifications(this.appointmentData());

      // Show success message
      let message = 'Appointment confirmed successfully!';
      if (emailResults.customer.success && this.appointmentData().user.email) {
        message += ' A confirmation email has been sent.';
      }

      this.snackBar.open(message, 'OK', {
        duration: 8000,
        panelClass: ['success-snackbar']
      });

      // Log for debugging (remove in production)
      console.log('Appointment confirmed:', this.appointmentData());
      console.log('Email results:', emailResults);

      // TODO: Save appointment to database when backend is ready
      
    } catch (error) {
      console.error('Failed to confirm appointment:', error);
      this.snackBar.open(
        'Appointment saved but notification failed. We will contact you shortly.',
        'OK',
        { duration: 8000, panelClass: ['warning-snackbar'] }
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onEditStep(stepIndex: number) {
    this.stepper.selectedIndex = stepIndex;
  }
}
