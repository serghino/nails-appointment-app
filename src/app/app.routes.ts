import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Calendar } from './pages/calendar/calendar';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    title: 'Home - Nail Salon Montreal'
  },
  {
    path: 'book',
    component: Calendar,
    title: 'Book Appointment - Nail Salon Montreal'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
