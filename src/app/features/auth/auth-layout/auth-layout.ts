import { Component, inject } from '@angular/core';
import { format } from 'date-fns';
import { Observable, catchError, map, of } from 'rxjs';
import { ParticipationStatsService, SeasonSummary } from '../../../core/services/participation-stats-service';

interface SeasonView extends SeasonSummary {
  /** "Friday 20 November", prepared here so the template has no date logic. */
  serviceDayLabel: string | null;
}

/**
 * Split layout for sign-in and sign-up: a calm brand panel with live season
 * numbers on the left, the form card (router outlet) on the right.
 */
@Component({
  selector: 'app-auth-layout',
  standalone: false,
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
})
export class AuthLayout {
  protected readonly season$: Observable<SeasonView | 'error'> = inject(ParticipationStatsService)
    .seasonSummary()
    .pipe(
      map((summary) => ({
        ...summary,
        serviceDayLabel: summary.serviceDay ? format(new Date(`${summary.serviceDay}T00:00:00`), 'EEEE d MMMM') : null,
      })),
      // The panel is supporting content: if the API is down, it just leaves the numbers out.
      catchError(() => of('error' as const)),
    );
}
