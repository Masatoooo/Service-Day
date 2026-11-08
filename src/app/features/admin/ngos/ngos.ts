import { Component, DestroyRef, ElementRef, Injector, afterNextRender, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { Observable, finalize } from 'rxjs';
import { Ngo } from '../../../core/models';
import { RuleViolationError, canDeleteNgo } from '../../../core/rules';
import { ActivityAdminService, NgoRow } from '../../../core/services/activity-admin-service';
import { ActivityService } from '../../../core/services/activity-service';
import { NgoService } from '../../../core/services/ngo-service';
import { ToastService } from '../../../core/services/toast-service';
import { TEXT_LIMITS, requiredText } from '../../../core/validators/text-validators';

type Field = 'name' | 'focusArea' | 'description' | 'contactName' | 'contactEmail';

const MESSAGES: Record<Field, Record<string, string>> = {
  name: { required: 'Enter the NGO name.', maxlength: `Keep the name under ${TEXT_LIMITS.ngoName} characters.` },
  focusArea: { required: 'Say what the NGO works on, e.g. "Food security".', maxlength: `Keep it short: under ${TEXT_LIMITS.focusArea} characters.` },
  description: {
    required: 'Add a short description employees will read.',
    minlength: 'Add a little more (at least 20 characters).',
    maxlength: `Keep the description under ${TEXT_LIMITS.ngoDescription} characters.`,
  },
  contactName: { required: 'Who should Halden & Co. contact?', maxlength: `Keep the name under ${TEXT_LIMITS.personName} characters.` },
  contactEmail: {
    required: 'Enter a contact email.',
    email: 'Enter an email address like name@organisation.org.',
    maxlength: `Keep the email under ${TEXT_LIMITS.email} characters.`,
  },
};

/** NGOs (UC1): list with activity counts, create/edit in a drawer, guarded delete. */
@Component({
  selector: 'app-ngos',
  standalone: false,
  templateUrl: './ngos.html',
  styleUrl: './ngos.css',
})
export class Ngos {
  private readonly ngoService = inject(NgoService);
  private readonly admin = inject(ActivityAdminService);
  private readonly toast = inject(ToastService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly rows$ = this.admin.ngoRows$();
  protected readonly loadFailed$ = inject(ActivityService).loadFailed$;
  /** The NGO in the drawer: null = closed, 'new' = create. */
  protected readonly editing = signal<Ngo | 'new' | null>(null);
  protected readonly deleting = signal<NgoRow | null>(null);
  protected readonly busy = signal(false);
  protected readonly submitted = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [requiredText, Validators.maxLength(TEXT_LIMITS.ngoName)]],
    focusArea: ['', [requiredText, Validators.maxLength(TEXT_LIMITS.focusArea)]],
    description: ['', [requiredText, Validators.minLength(20), Validators.maxLength(TEXT_LIMITS.ngoDescription)]],
    contactName: ['', [requiredText, Validators.maxLength(TEXT_LIMITS.personName)]],
    contactEmail: ['', [Validators.required, Validators.email, Validators.maxLength(TEXT_LIMITS.email)]],
    verified: [false],
  });

  protected open(ngo: Ngo | 'new'): void {
    this.submitted.set(false);
    this.form.reset(ngo === 'new' ? undefined : ngo);
    this.editing.set(ngo);
  }

  protected setDrawerOpen(open: boolean): void {
    if (!open) this.editing.set(null);
  }

  protected error(field: Field): string | null {
    const control = this.form.controls[field];
    if (!control.errors || !(control.touched || this.submitted())) return null;
    const key = Object.keys(control.errors).find((k) => MESSAGES[field][k]);
    return key ? MESSAGES[field][key] : null;
  }

  protected save(): void {
    if (this.busy()) return; // a second click while saving
    this.submitted.set(true);
    const editing = this.editing();
    if (this.form.invalid || !editing) {
      // After the error messages render, focus the first invalid field in the drawer.
      afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>('dialog[open] [aria-invalid="true"]')?.focus(), { injector: this.injector });
      return;
    }
    const raw = this.form.getRawValue();
    const value = {
      ...raw,
      name: raw.name.trim(),
      focusArea: raw.focusArea.trim(),
      description: raw.description.trim(),
      contactName: raw.contactName.trim(),
      contactEmail: raw.contactEmail.trim().toLowerCase(),
    };
    const save$ = editing === 'new' ? this.ngoService.create(value) : this.ngoService.update({ ...value, id: editing.id });
    this.run(save$, `${editing === 'new' ? 'Added' : 'Saved'} ${value.name}.`, () => this.editing.set(null));
  }

  /** Delete is only offered when allowed; otherwise the dialog explains why. */
  protected deleteCheck(row: NgoRow): { ok: boolean; reason: string } {
    const result = canDeleteNgo(row.activityCount);
    return { ok: result.ok, reason: result.ok ? '' : result.reason };
  }

  protected confirmDelete(row: NgoRow): void {
    if (!this.deleteCheck(row).ok) {
      this.deleting.set(null);
      return;
    }
    this.run(this.admin.deleteNgo(row), `Deleted ${row.ngo.name}.`, () => this.deleting.set(null));
  }

  protected closeDelete(open: boolean): void {
    if (!open && !this.busy()) this.deleting.set(null);
  }

  private run(action$: Observable<unknown>, success: string, done: () => void): void {
    if (this.busy()) return;
    this.busy.set(true);
    action$
      .pipe(
        finalize(() => this.busy.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.toast.success(success);
          done();
        },
        error: (error: unknown) => {
          if (error instanceof RuleViolationError) this.toast.error(error.message);
          done();
        },
      });
  }
}
