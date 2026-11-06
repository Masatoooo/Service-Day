import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ActivityView } from '../../../core/models';
import { ActivityService } from '../../../core/services/activity-service';
import { AuthService } from '../../../core/services/auth-service';
import { EmployeeHomeService } from '../../../core/services/employee-home-service';
import { DialogCopy, RegistrationFlow } from '../registration-flow';

/**
 * My registrations (/app/registrations, UC3): the current place with its
 * actions and the full history. Live: refreshes after every change and poll.
 */
@Component({
  selector: 'app-my-registrations',
  standalone: false,
  templateUrl: './my-registrations.html',
  styleUrl: './my-registrations.css',
})
export class MyRegistrations {
  private readonly flow = inject(RegistrationFlow);
  private readonly destroyRef = inject(DestroyRef);
  private readonly userId = inject(AuthService).session?.userId ?? '';

  protected readonly vm$ = inject(EmployeeHomeService).registrations$(this.userId);
  protected readonly loadFailed$ = inject(ActivityService).loadFailed$;
  protected readonly withdrawOpen = signal(false);
  protected readonly busy = signal(false);

  protected withdrawCopy(view: ActivityView): DialogCopy {
    return this.flow.copy('withdraw', view, view);
  }

  protected confirmWithdraw(view: ActivityView): void {
    if (this.busy()) return;
    this.busy.set(true);
    this.flow
      .run('withdraw', view)
      .pipe(
        finalize(() => {
          this.busy.set(false);
          this.withdrawOpen.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}
