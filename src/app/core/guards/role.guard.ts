import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Factory function — returns a guard configured for specific roles
// Usage: canActivate: [roleGuard(['ADMIN', 'SUPER_ADMIN'])]
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const userRole = authService.getUserRole();

    if (userRole && allowedRoles.includes(userRole)) {
      return true;
    }

    // Role not allowed — redirect to dashboard with no error
    return router.createUrlTree(['/dashboard']);
  };
};