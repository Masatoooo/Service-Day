import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map, switchMap } from 'rxjs';
import { ActivityAdminService } from '../../../core/services/activity-admin-service';
import { ActivityService } from '../../../core/services/activity-service';

/**
 * Admin view of one activity (UC1, UC4, UC6): details, fill, live participant list,
 * and shortcuts to edit, notify participants and open check-in.
 */
@Component({
  selector: 'app-activity-admin-detail',
  standalone: false,
  templateUrl: './activity-admin-detail.html',
  styleUrl: './activity-admin-detail.css',
})
export class ActivityAdminDetail {
  private readonly activities = inject(ActivityService);
  private readonly admin = inject(ActivityAdminService);

  protected readonly loadFailed$ = this.activities.loadFailed$;
  protected readonly vm$ = inject(ActivatedRoute).paramMap.pipe(
    map((params) => params.get('id') ?? ''),
    switchMap((id) =>
      combineLatest([this.activities.liveWithTime$(), this.admin.participants$(id)]).pipe(
        map(([{ views, now }, participants]) => ({
          now,
          view: views.find((v) => v.id === id) ?? null,
          participants,
          checkedIn: participants.filter((p) => p.checkedInAt).length,
        })),
      ),
    ),
  );
}
