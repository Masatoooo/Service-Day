import { Component, DestroyRef, ElementRef, Injector, afterNextRender, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, finalize, take } from 'rxjs';
import { ActivityView, SERVICE_TYPES } from '../../../core/models';
import { HasUnsavedChanges } from '../../../core/guards/unsaved-changes-guard';
import { ActivityAdminService } from '../../../core/services/activity-admin-service';
import { ActivityService } from '../../../core/services/activity-service';
import { AuthService } from '../../../core/services/auth-service';
import { NgoService } from '../../../core/services/ngo-service';
import { ToastService } from '../../../core/services/toast-service';
import {
  cutoffBeforeStartValidator,
  endAfterStartValidator,
  maxSlotsNotBelowTakenValidator,
} from '../../../core/validators/activity-validators';
import { whenSettled } from '../../../core/validators/when-settled';
import { TEXT_LIMITS, requiredText } from '../../../core/validators/text-validators';
import { buildActivityInput, formValueFrom, messageFor } from './activity-form-model';

/**
 * Create / edit an activity (UC1). Controller: builds the reactive form, loads the
 * activity when editing, and delegates saving to ActivityAdminService.
 */
@Component({
  selector: 'app-activity-form',
  standalone: false,
  templateUrl: './activity-form.html',
  styleUrl: './activity-form.css',
})
export class ActivityForm implements HasUnsavedChanges {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly admin = inject(ActivityAdminService);
  private readonly toast = inject(ToastService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly adminId = inject(AuthService).session?.userId ?? '';
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly id = this.route.snapshot.paramMap.get('id');
  protected readonly loadFailed$ = inject(ActivityService).loadFailed$;
  protected readonly ngos$ = inject(NgoService).list();
  protected readonly serviceTypes = SERVICE_TYPES;
  protected readonly existing = signal<ActivityView | null>(null);
  protected readonly loading = signal(this.id !== null);
  protected readonly saving = signal(false);
  protected readonly submitted = signal(false);

  protected readonly form = this.fb.group(
    {
      ngoId: ['', Validators.required],
      title: ['', [requiredText, Validators.maxLength(TEXT_LIMITS.activityTitle)]],
      serviceType: ['', Validators.required],
      description: ['', [requiredText, Validators.minLength(20), Validators.maxLength(TEXT_LIMITS.activityDescription)]],
      location: ['', [requiredText, Validators.maxLength(TEXT_LIMITS.location)]],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      maxSlots: this.fb.control(10, {
        validators: [Validators.required, Validators.min(1), Validators.max(500)],
        asyncValidators: this.id ? [maxSlotsNotBelowTakenValidator(this.admin, this.id)] : [],
      }),
      cutoffDate: ['', Validators.required],
      cutoffTime: ['17:00', Validators.required],
      status: this.fb.control<'draft' | 'published'>('draft'),
    },
    { validators: [endAfterStartValidator, cutoffBeforeStartValidator] },
  );

  constructor() {
    if (this.id) {
      inject(ActivityService)
        .getView(this.id)
        .pipe(filter((view): view is ActivityView => view !== null), take(1), takeUntilDestroyed())
        .subscribe((view) => {
          this.existing.set(view);
          this.form.reset(formValueFrom(view));
          this.loading.set(false);
        });
    }
  }

  hasUnsavedChanges(): boolean {
    return this.form.dirty && !this.saving();
  }

  protected error(field: keyof typeof this.form.controls): string | null {
    const control = this.form.controls[field];
    if (!control.errors || !(control.touched || this.submitted())) return null;
    return messageFor(field, control.errors);
  }

  protected save(): void {
    if (this.saving()) return; // a second click while saving
    this.submitted.set(true);
    if (this.form.pending) {
      // The max-slots check is still asking the API: save once it has an answer.
      whenSettled(this.form).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.save());
      return;
    }
    if (this.form.invalid) {
      // Wait for the error messages to render, then focus the first invalid field.
      afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), { injector: this.injector });
      return;
    }
    const existing = this.existing();
    const input = buildActivityInput(this.form.getRawValue());
    // A cancelled activity can be corrected but never silently re-opened by the form.
    if (existing?.status === 'cancelled') input.status = 'cancelled';
    this.saving.set(true);
    this.admin
      .save(input, existing, this.adminId)
      .pipe(finalize(() => this.saving.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe((saved) => {
        this.form.markAsPristine();
        const notified = existing?.status === 'published' && existing.taken > 0 ? ' Participants were notified of the changes.' : '';
        this.toast.success(existing ? `Saved ${saved.title}.${notified}` : `Created ${saved.title} as ${saved.status === 'draft' ? 'a draft' : 'a published activity'}.`);
        this.router.navigate(['/admin/activities', saved.id]);
      });
  }
}
