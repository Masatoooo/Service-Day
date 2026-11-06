import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '../models';
import { AuthService } from '../services/auth-service';
import { ToastService } from '../services/toast-service';

const AREA_NAME: Record<Role, string> = { admin: 'Service Day admins', employee: 'employees' };

/**
 * Only the given role may enter. Someone with the other role is sent to
 * their own home page with an explanation (used after authGuard).
 */
export function roleGuard(role: Role): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const session = auth.session;
    if (!session) {
      return router.createUrlTree(['/login']);
    }
    if (session.role === role) {
      return true;
    }
    inject(ToastService).info(`That area is for ${AREA_NAME[role]}. Here's your home page instead.`);
    return router.parseUrl(auth.homePath(session));
  };
}
