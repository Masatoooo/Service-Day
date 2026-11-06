import { Component, inject } from '@angular/core';
import { Observable, catchError, combineLatest, map, of } from 'rxjs';
import { Availability } from '../../../core/models';
import { ActivityService } from '../../../core/services/activity-service';
import { CheckInService } from '../../../core/services/check-in-service';
import { ClockService } from '../../../core/services/clock-service';
import { NgoService } from '../../../core/services/ngo-service';
import { NotificationService } from '../../../core/services/notification-service';
import { ParticipationStatsService } from '../../../core/services/participation-stats-service';
import { ReminderSettingsService } from '../../../core/services/reminder-settings-service';

/** What the seed promises for scenarios A–I (PLAN §6.3), to compare with the live result. */
const EXPECTED: Record<string, Availability> = {
  'act-pack-deliver': 'open',
  'act-reading-buddies': 'last-slots',
  'act-mangrove': 'full',
  'act-kennel-refresh': 'closed',
  'act-lunch-service': 'closing-soon',
  'act-memory-lane': 'closed',
  'act-beach-cleanup': 'open',
  'act-stem-craft': 'draft',
  'act-garden-build': 'cancelled',
};

interface ApiCounts {
  employees: number;
  registered: number;
  participation: number;
  ngos: number;
  notices: number;
  upcomingReminders: number;
  aishaUnread: number;
}

/**
 * Dev-only proof of the data layer: every number below comes from a service
 * (never HttpClient in a component), and the table updates with live polling.
 */
@Component({
  selector: 'app-api-check',
  standalone: false,
  templateUrl: './api-check.html',
  styleUrl: './api-check.css',
})
export class ApiCheck {
  private readonly activityService = inject(ActivityService);
  private readonly checkIn = inject(CheckInService);
  protected readonly now = inject(ClockService).now();
  protected readonly expected = EXPECTED;

  protected readonly views$ = this.activityService.live$();

  protected readonly counts$: Observable<ApiCounts | 'error'> = combineLatest({
    overview: inject(ParticipationStatsService).overview$(),
    ngos: inject(NgoService).list(),
    history: inject(NotificationService).history(),
    reminders: inject(ReminderSettingsService).upcoming(50),
    aishaUnread: inject(NotificationService).unreadCount$('u-aisha-rahman'),
  }).pipe(
    map(({ overview, ngos, history, reminders, aishaUnread }) => ({
      employees: overview.kpis.totalStaff,
      registered: overview.kpis.registeredStaff,
      participation: overview.kpis.participationPercent,
      ngos: ngos.length,
      notices: history.length,
      upcomingReminders: reminders.length,
      aishaUnread,
    })),
    catchError(() => of('error' as const)),
  );

  protected checkInUrl(code: string): string {
    return this.checkIn.checkInUrl(code);
  }
}
