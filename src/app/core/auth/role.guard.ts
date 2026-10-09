import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { UserRole } from '../models/user.model';
import { AuthStore } from './auth.store';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const authStore = inject(AuthStore);
    const router = inject(Router);

    const currentUser = authStore.currentUser();

    if (!currentUser) {
      return router.createUrlTree(['/login']);
    }

    if (allowedRoles.includes(currentUser.role)) {
      return true;
    }

    return router.createUrlTree(['/dashboard']);
  };
};

