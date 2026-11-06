import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { SERVICE_TYPES, ServiceType } from '../../../core/models';
import { ActivityService } from '../../../core/services/activity-service';
import { AuthService } from '../../../core/services/auth-service';
import { PillOption } from '../../../shared/components/pill-filter/pill-filter';
import {
  OpportunityCriteria,
  SortKey,
  applyCriteria,
  bestSuggestion,
  countByType,
  criteriaFromParams,
  criteriaToParams,
  dateOptions,
  visibleToEmployees,
} from './opportunity-filters';

/** Pill value for "no service type filter". */
const ALL_TYPES = 'all';

/**
 * Opportunities (UC2). Controller: reads the filters from the URL, combines
 * them with the live activity stream (10 s) and writes filter changes back to the URL.
 */
@Component({
  selector: 'app-opportunities',
  standalone: false,
  templateUrl: './opportunities.html',
  styleUrl: './opportunities.css',
})
export class Opportunities {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly activities = inject(ActivityService);
  private readonly userId = inject(AuthService).session?.userId;

  protected readonly loadFailed$ = this.activities.loadFailed$;

  protected readonly vm$ = combineLatest([
    this.activities.liveWithTime$(this.userId),
    this.route.queryParamMap.pipe(map(criteriaFromParams)),
  ]).pipe(
    map(([{ views, now }, criteria]) => {
      const published = visibleToEmployees(views);
      const results = applyCriteria(published, criteria);
      const counts = countByType(published, criteria);
      const typeOptions: PillOption[] = [
        { value: ALL_TYPES, label: 'All types', count: applyCriteria(published, { ...criteria, type: null }).length },
        ...SERVICE_TYPES.map((type) => ({ value: type, label: type, count: counts.get(type) ?? 0 })),
      ];
      return {
        now,
        criteria,
        results,
        typeOptions,
        selectedType: criteria.type ?? ALL_TYPES,
        dates: dateOptions(published),
        suggestion: results.length ? null : bestSuggestion(published, criteria),
      };
    }),
  );

  protected setQuery(query: string): void {
    this.update({ query });
  }

  protected setType(value: string | null): void {
    this.update({ type: !value || value === ALL_TYPES ? null : (value as ServiceType) });
  }

  protected setDate(event: Event): void {
    this.update({ date: (event.target as HTMLSelectElement).value || null });
  }

  protected setSort(event: Event): void {
    this.update({ sort: (event.target as HTMLSelectElement).value as SortKey });
  }

  protected setShowAll(event: Event): void {
    this.update({ showAll: (event.target as HTMLInputElement).checked });
  }

  protected retry(): void {
    this.activities.refresh();
  }

  /** Merge a change into the current filters and write them to the URL (no new history entry). */
  protected update(patch: Partial<OpportunityCriteria>): void {
    const current = criteriaFromParams(this.route.snapshot.queryParamMap);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: criteriaToParams({ ...current, ...patch }),
      replaceUrl: true,
    });
  }
}
