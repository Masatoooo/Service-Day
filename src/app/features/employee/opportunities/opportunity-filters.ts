import { Params, ParamMap } from '@angular/router';
import { format } from 'date-fns';
import { ActivityView, SERVICE_TYPES, ServiceType } from '../../../core/models';
import { BOOKABLE } from '../../../core/services/employee-home-service';

/**
 * Pure filter/sort helpers for the Opportunities page (no HTTP, no DOM).
 * The criteria live in the URL query string, so they survive a refresh.
 */

export type SortKey = 'cutoff' | 'slots';

export interface OpportunityCriteria {
  query: string;
  type: ServiceType | null;
  /** 'YYYY-MM-DD' */
  date: string | null;
  /** Also list full and closed activities. */
  showAll: boolean;
  sort: SortKey;
}

export interface FilterSuggestion {
  /** e.g. "Clear the date filter" */
  label: string;
  /** How many more activities that would show. */
  extra: number;
  patch: Partial<OpportunityCriteria>;
}

export function criteriaFromParams(params: ParamMap): OpportunityCriteria {
  const type = params.get('type');
  return {
    query: params.get('q') ?? '',
    type: SERVICE_TYPES.includes(type as ServiceType) ? (type as ServiceType) : null,
    date: params.get('date'),
    showAll: params.get('all') === '1',
    sort: params.get('sort') === 'slots' ? 'slots' : 'cutoff',
  };
}

/** Defaults are left out (null removes the key), so a clean URL means "no filters". */
export function criteriaToParams(criteria: OpportunityCriteria): Params {
  return {
    q: criteria.query.trim() || null,
    type: criteria.type,
    date: criteria.date,
    all: criteria.showAll ? '1' : null,
    sort: criteria.sort === 'slots' ? 'slots' : null,
  };
}

/** Employees never see drafts or cancelled activities in lists. */
export function visibleToEmployees(views: ActivityView[]): ActivityView[] {
  return views.filter((v) => v.status === 'published');
}

export function applyCriteria(views: ActivityView[], criteria: OpportunityCriteria): ActivityView[] {
  const query = criteria.query.trim().toLowerCase();
  const results = views.filter(
    (v) =>
      (criteria.showAll || v.isRegisteredByMe || BOOKABLE.includes(v.availability)) &&
      (!criteria.type || v.serviceType === criteria.type) &&
      (!criteria.date || v.date === criteria.date) &&
      (!query || [v.title, v.ngo.name, v.location, v.serviceType].some((text) => text.toLowerCase().includes(query))),
  );
  return results.sort((a, b) =>
    criteria.sort === 'slots' ? b.remaining - a.remaining : Date.parse(a.cutoffAt) - Date.parse(b.cutoffAt),
  );
}

/** How many results each service type would give with the other filters unchanged. */
export function countByType(views: ActivityView[], criteria: OpportunityCriteria): Map<ServiceType, number> {
  return new Map(SERVICE_TYPES.map((type) => [type, applyCriteria(views, { ...criteria, type }).length]));
}

/** The distinct activity dates, as select options ("Fri 20 Nov"). */
export function dateOptions(views: ActivityView[]): { value: string; label: string }[] {
  return [...new Set(views.map((v) => v.date))]
    .sort()
    .map((value) => ({ value, label: format(new Date(`${value}T00:00:00`), 'EEE d MMM') }));
}

/**
 * When nothing matches: the smallest change that brings activities back, so the
 * empty state can say exactly what to do next. Options are tried from least to
 * most disruptive, keeping what the person was looking for (the service type) longest:
 * include full/closed → clear the date → clear the search → drop the service type.
 */
export function bestSuggestion(views: ActivityView[], criteria: OpportunityCriteria): FilterSuggestion | null {
  const options: Omit<FilterSuggestion, 'extra'>[] = [];
  if (!criteria.showAll) options.push({ label: 'Include full and closed activities', patch: { showAll: true } });
  if (criteria.date) options.push({ label: 'Clear the date filter', patch: { date: null } });
  if (criteria.query.trim()) options.push({ label: `Clear the search "${criteria.query.trim()}"`, patch: { query: '' } });
  if (criteria.type) options.push({ label: `Show all service types, not just ${criteria.type}`, patch: { type: null } });
  return (
    options
      .map((option) => ({ ...option, extra: applyCriteria(views, { ...criteria, ...option.patch }).length }))
      .find((option) => option.extra > 0) ?? null
  );
}
