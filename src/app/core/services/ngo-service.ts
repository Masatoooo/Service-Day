import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, Subject, map, tap } from 'rxjs';
import { Ngo } from '../models';
import { ApiUrlService } from './api-url-service';

export type NewNgo = Omit<Ngo, 'id'>;

/** NGOs CRUD (UC1). Emits `changed$` after every write so activity views refresh. */
@Injectable({ providedIn: 'root' })
export class NgoService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiUrlService);
  private readonly changedSubject = new Subject<void>();
  /** ActivityService listens to this (NGO names appear in every activity view). */
  readonly changed$ = this.changedSubject.asObservable();

  list(): Observable<Ngo[]> {
    return this.http
      .get<Ngo[]>(this.api.url('ngos'))
      .pipe(map((ngos) => [...ngos].sort((a, b) => a.name.localeCompare(b.name))));
  }

  get(id: string): Observable<Ngo> {
    return this.http.get<Ngo>(this.api.url('ngos', id));
  }

  create(ngo: NewNgo): Observable<Ngo> {
    return this.http.post<Ngo>(this.api.url('ngos'), ngo).pipe(tap(() => this.changedSubject.next()));
  }

  update(ngo: Ngo): Observable<Ngo> {
    return this.http.put<Ngo>(this.api.url('ngos', ngo.id), ngo).pipe(tap(() => this.changedSubject.next()));
  }

  /** The caller checks canDeleteNgo() first (an NGO with activities can't be deleted). */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.api.url('ngos', id)).pipe(tap(() => this.changedSubject.next()));
  }
}
