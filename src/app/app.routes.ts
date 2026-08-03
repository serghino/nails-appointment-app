import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { AppointmentsComponent } from './pages/appointments/appointments';
import { authGuard } from './guards/auth.guard';
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
    path: ROUTES.adminLogin,
    loadComponent: () => import('./pages/admin/login/login').then(m => m.AdminLoginComponent),
    title: 'Admin Login'
  },
  {
    path: ROUTES.admin,
    loadComponent: () => import('./pages/admin/dashboard/dashboard').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard],
    title: 'Admin - Appointments'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
