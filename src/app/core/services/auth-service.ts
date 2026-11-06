import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, switchMap, throwError } from 'rxjs';
import { HOME_BY_ROLE, Role, Session, User } from '../models';
import { UserService } from './user-service';

const STORAGE_KEY = 'service-day.session';

/** A sign-in or sign-up problem tied to one form field, with a sentence to show under it. */
export class AuthError extends Error {
  constructor(
    readonly field: 'email' | 'password',
    message: string,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export interface RegisterInput {
  name: string;
  email: string;
  department: string;
  password: string;
}

/** Reads the saved session, ignoring anything malformed (edited by hand, old format). */
function readStoredSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const value: Partial<Session> | null = raw ? JSON.parse(raw) : null;
    const roles: Role[] = ['admin', 'employee'];
    if (value && typeof value.userId === 'string' && typeof value.name === 'string' && roles.includes(value.role as Role)) {
      return { userId: value.userId, name: value.name, role: value.role as Role, department: value.department ?? '' };
    }
  } catch {
    // Storage blocked or corrupted: start signed out.
  }
  return null;
}

/**
 * Mock authentication (Assignment 1). Compares the password against the mock
 * API's plain-text value; Assignment 2 replaces this with a real login endpoint.
 * Only the Session (id, name, role, department) is kept in localStorage — never the password.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly users = inject(UserService);
  private readonly sessionSubject = new BehaviorSubject<Session | null>(readStoredSession());
  /** The signed-in person, restored on page load; null when signed out. */
  readonly session$ = this.sessionSubject.asObservable();

  get session(): Session | null {
    return this.sessionSubject.value;
  }

  homePath(session: Session | null = this.session): string {
    return session ? HOME_BY_ROLE[session.role] : '/login';
  }

  login(email: string, password: string): Observable<Session> {
    return this.users.findByEmail(email).pipe(
      map((user) => {
        if (!user) {
          throw new AuthError('email', "We couldn't find an account with that email.");
        }
        if (user.password !== password) {
          throw new AuthError('password', "That password doesn't match.");
        }
        return this.start(user);
      }),
    );
  }

  /** Self-registration always creates an employee (admins are seeded). */
  register(input: RegisterInput): Observable<Session> {
    return this.users.isEmailTaken(input.email).pipe(
      switchMap((taken) =>
        taken
          ? throwError(() => new AuthError('email', 'An account with this email already exists. Sign in instead.'))
          : this.users.create({ ...input, name: input.name.trim(), role: 'employee' }),
      ),
      map((user) => this.start(user)),
    );
  }

  logout(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing stored.
    }
    this.sessionSubject.next(null);
  }

  private start(user: User): Session {
    const session: Session = { userId: user.id, name: user.name, role: user.role, department: user.department };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Private mode: the session still works until the tab closes.
    }
    this.sessionSubject.next(session);
    return session;
  }
}
