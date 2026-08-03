import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import ROUTES from '../models/routes';

/**
 * Protects admin routes — redirects to the admin login page when no valid token is present.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.parseUrl(`/${ROUTES.adminLogin}`);
};
