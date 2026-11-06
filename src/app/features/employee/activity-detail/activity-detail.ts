import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { finalize, map, switchMap } from 'rxjs';
import { ActivityService } from '../../../core/services/activity-service';
import { AuthService } from '../../../core/services/auth-service';
import { ActivityActions, RegistrationService } from '../../../core/services/registration-service';
import { DialogCopy, RegistrationAction, RegistrationFlow } from '../registration-flow';

/**
 * Activity detail (UC2/UC3). The action area shows only what the rule
 * functions allow (RegistrationService.actions$, live every 10 s).
 * MVC: the controller opens the confirm dialog and delegates the change to RegistrationFlow.
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
  private readonly flow = inject(RegistrationFlow);
  private readonly destroyRef = inject(DestroyRef);
  private readonly userId = inject(AuthService).session?.userId ?? '';

  protected readonly loadFailed$ = inject(ActivityService).loadFailed$;
  /** Wrapped in an object so "not found" (null) still renders. */
  protected readonly vm$ = this.route.paramMap.pipe(
    switchMap((params) => this.registrations.actions$(this.userId, params.get('id') ?? '')),
    map((state) => ({ state })),
  );
  protected readonly pending = signal<RegistrationAction | null>(null);
  protected readonly busy = signal(false);

  protected dialogCopy(state: ActivityActions, action: RegistrationAction): DialogCopy {
    return this.flow.copy(action, state.view, state.current);
  }

  protected setDialogOpen(open: boolean): void {
    if (!open && !this.busy()) this.pending.set(null);
  }

  /** Runs the change; on success or a blocked rule the dialog closes and the live view refreshes. */
  protected confirm(state: ActivityActions): void {
    const action = this.pending();
    if (!action || this.busy()) return;
    this.busy.set(true);
    this.flow
      .run(action, state.view)
      .pipe(
        finalize(() => {
          this.busy.set(false);
          this.pending.set(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}
