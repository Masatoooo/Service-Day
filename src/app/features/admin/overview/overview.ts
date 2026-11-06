import { Component, inject } from '@angular/core';
import { map } from 'rxjs';
import { ActivityService } from '../../../core/services/activity-service';
import { AttentionKind, ParticipationStatsService } from '../../../core/services/participation-stats-service';
import { PillTone } from '../../../shared/components/status-pill/status-pill';

/** The one-click follow-up for each kind of "needs attention" item: a prefilled broadcast. */
const ATTENTION_ACTION: Record<AttentionKind, { label: string; pill: string; tone: PillTone }> = {
  'closing-soon': { label: 'Remind unregistered staff', pill: 'Closing soon', tone: 'warning' },
  'last-slots': { label: 'Announce last places', pill: 'Last slots', tone: 'warning' },
  'low-fill': { label: 'Promote to all staff', pill: 'Low fill', tone: 'info' },
};

/**
 * Admin overview (/admin, UC4). Controller: reads the live participation stats
 * (re-computed on every 10 s poll) and adds the presentation extras the view needs.
 */
@Component({
  selector: 'app-admin-overview',
  standalone: false,
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})
export class AdminOverview {
  private readonly activities = inject(ActivityService);
  protected readonly attentionAction = ATTENTION_ACTION;
  protected readonly loadFailed$ = this.activities.loadFailed$;

  protected readonly vm$ = inject(ParticipationStatsService)
    .overview$()
    .pipe(map((overview) => ({ ...overview, weeklyDelta: overview.weekly.thisWeek - overview.weekly.lastWeek })));
}
