import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';

/**
 * Shown for any unknown URL (route `**`): inside the shell when signed in,
 * as a standalone card when signed out (PLAN §3).
 */
@Component({
  selector: 'app-not-found',
  standalone: false,
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly session$ = this.auth.session$;

  protected homePath(): string {
    return this.auth.homePath();
  }

  protected signOut(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
