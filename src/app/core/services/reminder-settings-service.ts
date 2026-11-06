import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of, tap } from 'rxjs';
import { ReminderSettings } from '../models';
import { ReminderPreview, upcomingReminders } from '../rules';
import { ActivityService } from './activity-service';
import { ApiUrlService } from './api-url-service';
import { ClockService } from './clock-service';

/** Reminder schedule (UC5): the singular /reminderSettings resource and its preview. */
@Injectable({ providedIn: 'root' })
export class ReminderSettingsService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiUrlService);
  private readonly clock = inject(ClockService);
  private readonly activities = inject(ActivityService);

  get(): Observable<ReminderSettings> {
    return this.http.get<ReminderSettings>(this.api.url('reminderSettings'));
  }

  /** Saving may change the "last slots" threshold, so live availability refreshes. */
  save(settings: ReminderSettings): Observable<ReminderSettings> {
    return this.http
      .put<ReminderSettings>(this.api.url('reminderSettings'), settings)
      .pipe(tap(() => this.activities.refresh()));
  }

  /** The next reminders the schedule would send (PLAN §5 rule 9). Pass unsaved settings to preview them. */
  upcoming(limit = 10, settings?: ReminderSettings): Observable<ReminderPreview[]> {
    return forkJoin({ saved: settings ? of(settings) : this.get(), activities: this.activities.list() }).pipe(
      map(({ saved, activities }) => upcomingReminders(activities, saved, this.clock.now(), limit)),
    );
  }
}
