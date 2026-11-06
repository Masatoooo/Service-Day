import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

/** Signed-out only (login, register). Signed-in people go to their home page. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.session ? inject(Router).parseUrl(auth.homePath()) : true;
};

/** `/` sends people to their role's home, or to sign in. */
export const homeRedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return inject(Router).parseUrl(auth.homePath());
};
