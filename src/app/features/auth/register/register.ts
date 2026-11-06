import { Component, DestroyRef, ElementRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { filter, finalize, take } from 'rxjs';
import { DEPARTMENTS } from '../../../core/models';
import { AuthError, AuthService } from '../../../core/services/auth-service';
import { ToastService } from '../../../core/services/toast-service';
import { UserService } from '../../../core/services/user-service';
import {
  containsNumberValidator,
  emailAvailableValidator,
  matchingFieldsValidator,
  workEmailValidator,
} from '../../../core/validators/account-validators';

type Field = 'name' | 'email' | 'department' | 'password' | 'confirm';

/** One sentence per validation error, per field (sentence case, says how to fix it). */
const MESSAGES: Record<Field, Record<string, string>> = {
  name: { required: 'Enter your full name.', minlength: 'Enter your full name.' },
  email: {
    required: 'Enter your work email.',
    email: 'Enter an email address like aisha.rahman@halden.co.',
    workEmail: 'Use your Halden & Co. email, ending in @halden.co.',
    emailTaken: 'An account with this email already exists. Sign in instead.',
  },
  department: { required: 'Choose your department.' },
  password: { required: 'Choose a password.', minlength: 'Use at least 8 characters.', needsNumber: 'Add at least one number.' },
  confirm: { required: 'Type the password again.', mismatch: "The passwords don't match." },
};

/** Sign-up page: creates an employee account, signs in and opens /app. */
@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: '../auth-form.css',
})
export class Register {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly departments = DEPARTMENTS;
  protected readonly form = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: this.fb.control('', {
        validators: [Validators.required, Validators.email, workEmailValidator],
        asyncValidators: [emailAvailableValidator(inject(UserService))],
      }),
      department: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8), containsNumberValidator]],
      confirm: ['', Validators.required],
    },
    { validators: matchingFieldsValidator('password', 'confirm') },
  );
  protected readonly showPassword = signal(false);
  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected submit(): void {
    this.submitted.set(true);
    this.formError.set(null);
    if (this.form.pending) {
      // The email check is still running: submit again once it has an answer.
      this.form.statusChanges
        .pipe(filter((s) => s !== 'PENDING'), take(1), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.submit());
      return;
    }
    if (this.form.invalid) {
      const firstInvalid = (Object.keys(this.form.controls) as Field[]).find((f) => this.form.controls[f].invalid);
      this.focus(`register-${firstInvalid}`);
      return;
    }
    const { confirm: _confirm, ...input } = this.form.getRawValue();
    this.submitting.set(true);
    this.auth
      .register(input)
      .pipe(finalize(() => this.submitting.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (session) => {
          this.toast.success(`Welcome to Service Day, ${session.name.split(' ')[0]}. Your account is ready.`);
          this.router.navigateByUrl('/app');
        },
        error: (error: unknown) => this.showFailure(error),
      });
  }

  protected error(field: Field): string | null {
    const control = this.form.controls[field];
    if (!control.errors || !(control.touched || this.submitted())) return null;
    if (control.errors['server']) return control.errors['server'];
    const key = Object.keys(control.errors).find((k) => MESSAGES[field][k]);
    return key ? MESSAGES[field][key] : null;
  }

  private showFailure(error: unknown): void {
    if (error instanceof AuthError) {
      this.form.controls[error.field].setErrors({ server: error.message });
      this.focus(`register-${error.field}`);
    } else {
      this.formError.set("We couldn't create your account right now. Check that the Service Day server is running, then try again.");
    }
  }

  private focus(id: string): void {
    queueMicrotask(() => this.host.nativeElement.querySelector<HTMLElement>(`#${id}`)?.focus());
  }
}
