import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import ROUTES from '../models/routes';

/**
 * Attaches the admin JWT to every /api/admin request and redirects to login on 401 responses.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAdminRequest = req.url.includes('/api/admin');
  const token = authService.getToken();

  const authReq = isAdminRequest && token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError(error => {
      if (isAdminRequest && error.status === 401) {
        authService.logout();
        router.navigate([`/${ROUTES.adminLogin}`]);
      }
      return throwError(() => error);
    })
  );
};
