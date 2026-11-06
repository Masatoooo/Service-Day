import { ActivityStatus, ActivityView, ServiceType } from '../../../core/models';

/** Pure filter for the admin activities table (no HTTP, no DOM). */
export interface AdminActivityFilters {
  query: string;
  status: ActivityStatus | 'all';
  ngoId: string | 'all';
  type: ServiceType | 'all';
}

export const NO_FILTERS: AdminActivityFilters = { query: '', status: 'all', ngoId: 'all', type: 'all' };

export function filterAdminActivities(views: ActivityView[], f: AdminActivityFilters): ActivityView[] {
  const query = f.query.trim().toLowerCase();
  return views.filter(
    (v) =>
      (f.status === 'all' || v.status === f.status) &&
      (f.ngoId === 'all' || v.ngoId === f.ngoId) &&
      (f.type === 'all' || v.serviceType === f.type) &&
      (!query || [v.title, v.ngo.name, v.location].some((text) => text.toLowerCase().includes(query))),
  );
}

export function isFiltered(f: AdminActivityFilters): boolean {
  return f.query.trim() !== '' || f.status !== 'all' || f.ngoId !== 'all' || f.type !== 'all';
}
