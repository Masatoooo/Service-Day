import { Component, DestroyRef, ElementRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Session } from '../../../core/models';
import { AuthError, AuthService } from '../../../core/services/auth-service';
import { DEMO_ACCOUNTS, DemoAccount } from './demo-accounts';

type Field = 'email' | 'password';

/**
 * Sign-in page. Controller: builds the reactive form, delegates the check to
 * AuthService and shows each failure under the field it belongs to.
 */
@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: '../auth-form.css',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly demoAccounts = DEMO_ACCOUNTS;
  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  protected readonly showPassword = signal(false);
  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  /** Not tied to a field, e.g. the API can't be reached. */
  protected readonly formError = signal<string | null>(null);

  protected useAccount(account: DemoAccount): void {
    this.form.setValue({ email: account.email, password: account.password });
    this.formError.set(null);
    this.focus('login-submit');
  }

  protected submit(): void {
    if (this.submitting()) return; // a second click while the request runs
    this.submitted.set(true);
    this.formError.set(null);
    this.clearServerErrors();
    if (this.form.invalid) {
      this.focus(this.form.controls.email.invalid ? 'login-email' : 'login-password');
      return;
    }
    const { email, password } = this.form.getRawValue();
    this.submitting.set(true);
    this.auth
      .login(email, password)
      .pipe(
        finalize(() => this.submitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (session) => this.router.navigateByUrl(this.returnUrl(session)),
        error: (error: unknown) => this.showFailure(error),
      });
  }

  /** The message to show under a field, or null. */
  protected error(field: Field): string | null {
    const control = this.form.controls[field];
    if (!control.errors || !(control.touched || this.submitted())) return null;
    if (control.errors['server']) return control.errors['server'];
    if (control.errors['required']) return field === 'email' ? 'Enter your work email.' : 'Enter your password.';
    if (control.errors['email']) return 'Enter an email address like aisha.rahman@halden.co.';
    return null;
  }

  /** A previous "that password doesn't match" must not block a new attempt with a different email. */
  private clearServerErrors(): void {
    Object.values(this.form.controls).forEach((control) => control.errors?.['server'] && control.updateValueAndValidity());
  }

  private showFailure(error: unknown): void {
    if (error instanceof AuthError) {
      this.form.controls[error.field].setErrors({ server: error.message });
      this.focus(`login-${error.field}`);
    } else {
      this.formError.set("We couldn't sign you in right now. Check that the Service Day server is running, then try again.");
    }
  }

  /** Back to where they were going, if it's an in-app path; otherwise their home. */
  private returnUrl(session: Session): string {
    const target = this.route.snapshot.queryParamMap.get('returnUrl');
    return target && target.startsWith('/') && !target.startsWith('//') ? target : this.auth.homePath(session);
  }

  private focus(id: string): void {
    queueMicrotask(() => this.host.nativeElement.querySelector<HTMLElement>(`#${id}`)?.focus());
  }
}
