import { Injectable, inject } from '@angular/core';
import { format } from 'date-fns';
import { Observable, catchError, map, of } from 'rxjs';
import { ActivityView } from '../../core/models';
import { RuleViolationError, formatCutoff } from '../../core/rules';
import { AuthService } from '../../core/services/auth-service';
import { RegistrationService } from '../../core/services/registration-service';
import { ToastService } from '../../core/services/toast-service';

export type RegistrationAction = 'register' | 'switch' | 'withdraw';

export interface DialogCopy {
  heading: string;
  message: string;
  confirmLabel: string;
  tone: 'default' | 'danger';
}

/** "Friday 20 November, 08:30–12:30" */
function when(view: ActivityView): string {
  return `${format(new Date(`${view.date}T00:00:00`), 'EEEE d MMMM')}, ${view.startTime}–${view.endTime}`;
}

/**
 * The register / switch / withdraw flow shared by Home, Activity detail and
 * My registrations: what the confirm dialog says, the call to RegistrationService
 * and the feedback afterwards. Provided by EmployeeModule.
 */
@Injectable()
export class RegistrationFlow {
  private readonly registrations = inject(RegistrationService);
  private readonly toast = inject(ToastService);
  private readonly userId = inject(AuthService).session?.userId ?? '';

  /** Exactly what will change, in the person's words. */
  copy(action: RegistrationAction, view: ActivityView, current: ActivityView | null): DialogCopy {
    const until = formatCutoff(view.cutoffAt);
    switch (action) {
      case 'register':
        return {
          heading: `Register for ${view.title}?`,
          message: `${when(view)} at ${view.location}. You can switch or withdraw until ${until}.`,
          confirmLabel: 'Register',
          tone: 'default',
        };
      case 'switch':
        return {
          heading: `Switch to ${view.title}?`,
          message: `You'll leave ${current?.title ?? 'your current activity'} and join ${view.title} (${when(view)}). Your old place goes to someone else. You can change again until ${until}.`,
          confirmLabel: 'Switch',
          tone: 'default',
        };
      case 'withdraw':
        return {
          heading: `Withdraw from ${view.title}?`,
          message: `Your place on ${view.title} will be released for someone else. You can still register for another activity before its cut-off.`,
          confirmLabel: 'Withdraw',
          tone: 'danger',
        };
    }
  }

  /**
   * Runs the action. Emits true on success, false when a rule blocked it
   * (the person sees why in a toast and stays on the page; views refresh).
   */
  run(action: RegistrationAction, view: ActivityView): Observable<boolean> {
    const call$ =
      action === 'register'
        ? this.registrations.register(this.userId, view.id)
        : action === 'switch'
          ? this.registrations.switch(this.userId, view.id)
          : this.registrations.withdraw(this.userId);
    return call$.pipe(
      map(() => {
        this.toast.success(this.successMessage(action, view));
        return true;
      }),
      catchError((error: unknown) => {
        // Network/HTTP failures already got a toast from ErrorInterceptor.
        if (error instanceof RuleViolationError) {
          if (error.code === 'full') this.toast.info(error.message);
          else this.toast.error(error.message);
        }
        return of(false);
      }),
    );
  }

  private successMessage(action: RegistrationAction, view: ActivityView): string {
    const day = format(new Date(`${view.date}T00:00:00`), 'EEE d MMM');
    switch (action) {
      case 'register':
        return `You're in: ${view.title}, ${day} at ${view.startTime}. Details are in your notifications.`;
      case 'switch':
        return `Switched. You're now on ${view.title}, ${day} at ${view.startTime}.`;
      case 'withdraw':
        return `You've withdrawn from ${view.title}. Your place is free for someone else.`;
    }
  }
}
