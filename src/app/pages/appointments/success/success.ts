import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AppointmentResponse } from '../../../services/appointment.service';

@Component({
  selector: 'app-success',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './success.html',
  styleUrl: './success.scss'
})
export class SuccessComponent {
  @Input() bookingResponse?: AppointmentResponse;

  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/']);
  }
}
