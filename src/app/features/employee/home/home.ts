import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ActivityView } from '../../../core/models';
import { ActivityService } from '../../../core/services/activity-service';
import { AuthService } from '../../../core/services/auth-service';
import { EmployeeHomeService } from '../../../core/services/employee-home-service';
import { DialogCopy, RegistrationFlow } from '../registration-flow';

/**
 * Employee home (/app). Controller: subscribes to the prepared home view
 * (EmployeeHomeService, live) and delegates Withdraw to RegistrationFlow.
 */
@Component({
  selector: 'app-employee-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class EmployeeHome {
  private readonly flow = inject(RegistrationFlow);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly userId = inject(AuthService).session?.userId ?? '';
  protected readonly home$ = inject(EmployeeHomeService).home$(this.userId);
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
