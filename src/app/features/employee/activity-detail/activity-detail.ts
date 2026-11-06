import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { formatCutoff } from '../../../core/rules';
import { ActivityService } from '../../../core/services/activity-service';
import { AuthService } from '../../../core/services/auth-service';
import { ActivityActions, RegistrationService } from '../../../core/services/registration-service';
import { ToastService } from '../../../core/services/toast-service';

type PendingAction = 'register' | 'switch' | 'withdraw';

interface DialogCopy {
  heading: string;
  message: string;
  confirmLabel: string;
  tone: 'default' | 'danger';
}

/**
 * Activity detail (UC2/UC3). The action area shows only what the rule
 * functions allow, via RegistrationService.actions$ (live, 10 s).
 * Phase 4: confirming does not write yet; Phase 5 connects the actions.
 */
@Component({
  selector: 'app-activity-detail',
  standalone: false,
  templateUrl: './activity-detail.html',
  styleUrl: './activity-detail.css',
})
export class ActivityDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly registrations = inject(RegistrationService);
  private readonly toast = inject(ToastService);
  private readonly userId = inject(AuthService).session?.userId ?? '';

  protected readonly loadFailed$ = inject(ActivityService).loadFailed$;
  /** Wrapped in an object so "not found" (null) still renders. */
  protected readonly vm$ = this.route.paramMap.pipe(
    switchMap((params) => this.registrations.actions$(this.userId, params.get('id') ?? '')),
    map((state) => ({ state })),
  );
  protected readonly pending = signal<PendingAction | null>(null);

  protected dialogCopy(state: ActivityActions, action: PendingAction): DialogCopy {
    const { view, current } = state;
    const until = formatCutoff(view.cutoffAt);
    switch (action) {
      case 'register':
        return {
          heading: `Register for ${view.title}?`,
          message: `You'll take 1 of the ${view.remaining} places left. You can switch or withdraw until ${until}.`,
          confirmLabel: 'Register',
          tone: 'default',
        };
      case 'switch':
        return {
          heading: `Switch to ${view.title}?`,
          message: `Your place on ${current?.title} will be released and moved here. You can change again until ${until}.`,
          confirmLabel: 'Switch here',
          tone: 'default',
        };
      case 'withdraw':
        return {
          heading: `Withdraw from ${view.title}?`,
          message: 'Your place goes back to the pool for someone else. You can still register for another activity before its cut-off.',
          confirmLabel: 'Withdraw',
          tone: 'danger',
        };
    }
  }

  protected setDialogOpen(open: boolean): void {
    if (!open) this.pending.set(null);
  }

  /** Phase 4: nothing is saved yet. */
  protected confirm(): void {
    this.pending.set(null);
    this.toast.info('Nothing was saved: registration changes are connected in the next build step.');
  }
}
