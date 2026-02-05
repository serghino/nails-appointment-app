import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { AppointmentsComponent } from './pages/appointments/appointments';
import ROUTES from './models/routes';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    title: 'Home - Nail Salon Montreal'
  },
  {
    path: ROUTES.appointments,
    component: AppointmentsComponent,
    title: 'Book Appointment - Nail Salon Montreal'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
