import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { PublicUser, User } from '../models';
import { ApiUrlService } from './api-url-service';
import { ClockService } from './clock-service';

export type NewUser = Omit<User, 'id' | 'createdAt'>;

/** Strips the password before a user leaves this service for display. */
function toPublic({ password: _password, ...user }: User): PublicUser {
  return user;
}

/** Users: lookup by email (sign-in, uniqueness), employee list, sign-up. */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiUrlService);
  private readonly clock = inject(ClockService);

  /** Full record including the mock password: only AuthService should use this. */
  findByEmail(email: string): Observable<User | null> {
    return this.http
      .get<User[]>(this.api.url('users'), { params: { email: email.trim().toLowerCase() } })
      .pipe(map((users) => users[0] ?? null));
  }

  isEmailTaken(email: string): Observable<boolean> {
    return this.findByEmail(email).pipe(map((user) => user !== null));
  }

  employees(): Observable<PublicUser[]> {
    return this.http.get<User[]>(this.api.url('users'), { params: { role: 'employee' } }).pipe(
      map((users) => users.map(toPublic).sort((a, b) => a.name.localeCompare(b.name))),
    );
  }

  get(id: string): Observable<PublicUser> {
    return this.http.get<User>(this.api.url('users', id)).pipe(map(toPublic));
  }

  create(user: NewUser): Observable<User> {
    const body = { ...user, email: user.email.trim().toLowerCase(), createdAt: this.clock.nowIso() };
    return this.http.post<User>(this.api.url('users'), body);
  }
}
