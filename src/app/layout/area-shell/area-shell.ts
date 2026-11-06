import { Component, inject } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { Observable, combineLatest, filter, map, of, startWith, switchMap } from 'rxjs';
import { Role, Session } from '../../core/models';
import { AuthService } from '../../core/services/auth-service';
import { NotificationService } from '../../core/services/notification-service';
import { ToastService } from '../../core/services/toast-service';

/** Route `data` read by the shell to fill the top bar. */
export interface ShellRouteData {
  /** Home pages: "Hi, {firstName}. Welcome back." */
  greeting?: boolean;
  heading?: string;
  subheading?: string;
}

const GREETING_SUBHEADING: Record<Role, string> = {
  employee: 'Pick an activity, keep your place, and check in on the day.',
  admin: 'See how Service Day is filling up and who still needs a nudge.',
};

interface TopbarText {
  heading: string;
  subheading?: string;
}

/** The deepest active child route's data (e.g. /app/opportunities → that page's data). */
function deepestData(route: ActivatedRouteSnapshot): ShellRouteData {
  let current = route;
  while (current.firstChild) {
    current = current.firstChild;
  }
  return current.data as ShellRouteData;
}

/**
 * Routed wrapper for the employee and admin areas: puts the signed-in person's
 * shell around <router-outlet>, sets the top bar text from route data, and
 * handles sign out. Controller only: the shell itself is AppShell.
 */
@Component({
  selector: 'app-area-shell',
  standalone: false,
  templateUrl: './area-shell.html',
})
export class AreaShell {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  private readonly notifications = inject(NotificationService);

  protected readonly session$ = this.auth.session$;

  private readonly routeData$ = this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    startWith(null),
    map(() => deepestData(this.route.snapshot)),
  );

  protected readonly topbar$: Observable<TopbarText> = combineLatest([this.session$, this.routeData$]).pipe(
    map(([session, data]) => this.topbarText(session, data)),
  );

  /** Employees see their unread count on the bell (polls every 15 s). */
  protected readonly unread$ = this.session$.pipe(
    switchMap((session) => (session?.role === 'employee' ? this.notifications.unreadCount$(session.userId) : of(0))),
  );

  protected signOut(): void {
    this.auth.logout();
    this.toast.info("You're signed out. See you on Service Day.");
    this.router.navigateByUrl('/login');
  }

  private topbarText(session: Session | null, data: ShellRouteData): TopbarText {
    if (session && data.greeting) {
      const firstName = session.name.split(' ')[0];
      return { heading: `Hi, ${firstName}. Welcome back.`, subheading: GREETING_SUBHEADING[session.role] };
    }
    return { heading: data.heading ?? 'Service Day', subheading: data.subheading };
  }
}
