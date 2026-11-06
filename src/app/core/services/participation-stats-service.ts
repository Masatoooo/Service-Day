import { Injectable, inject } from '@angular/core';
import { subDays } from 'date-fns';
import { Observable, combineLatest, map, shareReplay } from 'rxjs';
import { ActivityView, PublicUser, Registration } from '../models';
import { formatCutoff } from '../rules';
import { ActivitySnapshot, ActivityService } from './activity-service';
import { UserService } from './user-service';

/** Below this share of slots taken, an open activity "needs attention". */
const LOW_FILL = 0.25;

export interface Kpis {
  slotsOffered: number;
  slotsTaken: number;
  slotsRemaining: number;
  participationPercent: number;
  registeredStaff: number;
  totalStaff: number;
}

/** Ready for a bar chart: one label per NGO, two series. */
export interface FillByNgoDataset {
  labels: string[];
  taken: number[];
  capacity: number[];
}

export interface DepartmentRow {
  department: string;
  registered: number;
  total: number;
  percent: number;
}

export interface AttentionItem {
  activity: ActivityView;
  reason: string;
}

export interface RecentRegistration {
  name: string;
  department: string;
  activityTitle: string;
  registeredAt: string;
}

export interface ParticipationOverview {
  kpis: Kpis;
  fillByNgo: FillByNgoDataset;
  byDepartment: DepartmentRow[];
  unregistered: PublicUser[];
  utilisation: ActivityView[];
  needsAttention: AttentionItem[];
  recent: RecentRegistration[];
  weekly: { thisWeek: number; lastWeek: number };
}

const percent = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);

/**
 * KPI and chart data for Admin Overview and Participation (UC4).
 * Derived from the live activity snapshot, so it updates with every poll.
 */
@Injectable({ providedIn: 'root' })
export class ParticipationStatsService {
  private readonly activities = inject(ActivityService);
  private readonly users = inject(UserService);

  overview$(): Observable<ParticipationOverview> {
    const employees$ = this.users.employees().pipe(shareReplay(1));
    return combineLatest([this.activities.snapshot$, employees$]).pipe(
      map(([snapshot, employees]) => this.compute(snapshot, employees)),
    );
  }

  private compute(snapshot: ActivitySnapshot, employees: PublicUser[]): ParticipationOverview {
    const views = this.activities.toViews(snapshot);
    const published = views.filter((v) => v.status === 'published');
    const placed = new Set(snapshot.activeRegistrations.map((r) => r.userId));
    const slotsOffered = published.reduce((sum, v) => sum + v.maxSlots, 0);
    const slotsTaken = published.reduce((sum, v) => sum + Math.min(v.taken, v.maxSlots), 0);
    const registeredStaff = employees.filter((e) => placed.has(e.id)).length;

    return {
      kpis: {
        slotsOffered,
        slotsTaken,
        slotsRemaining: slotsOffered - slotsTaken,
        participationPercent: percent(registeredStaff, employees.length),
        registeredStaff,
        totalStaff: employees.length,
      },
      fillByNgo: this.fillByNgo(published),
      byDepartment: this.byDepartment(employees, placed),
      unregistered: employees.filter((e) => !placed.has(e.id)),
      utilisation: [...published].sort((a, b) => b.taken / b.maxSlots - a.taken / a.maxSlots),
      needsAttention: this.needsAttention(published),
      recent: this.recent(snapshot, employees),
      weekly: this.weekly(snapshot.activeRegistrations, snapshot.now),
    };
  }

  private fillByNgo(published: ActivityView[]): FillByNgoDataset {
    const byNgo = new Map<string, { taken: number; capacity: number }>();
    for (const view of published) {
      const entry = byNgo.get(view.ngo.name) ?? { taken: 0, capacity: 0 };
      byNgo.set(view.ngo.name, { taken: entry.taken + view.taken, capacity: entry.capacity + view.maxSlots });
    }
    const labels = [...byNgo.keys()].sort();
    return {
      labels,
      taken: labels.map((label) => byNgo.get(label)!.taken),
      capacity: labels.map((label) => byNgo.get(label)!.capacity),
    };
  }

  private byDepartment(employees: PublicUser[], placed: Set<string>): DepartmentRow[] {
    const departments = [...new Set(employees.map((e) => e.department))].sort();
    return departments.map((department) => {
      const staff = employees.filter((e) => e.department === department);
      const registered = staff.filter((e) => placed.has(e.id)).length;
      return { department, registered, total: staff.length, percent: percent(registered, staff.length) };
    });
  }

  private needsAttention(published: ActivityView[]): AttentionItem[] {
    const items: AttentionItem[] = [];
    for (const view of published) {
      if (view.availability === 'last-slots') {
        items.push({ activity: view, reason: view.remaining === 1 ? '1 slot left' : `${view.remaining} slots left` });
      } else if (view.availability === 'closing-soon') {
        items.push({ activity: view, reason: `Closes ${formatCutoff(view.cutoffAt)}` });
      } else if (view.availability === 'open' && view.taken / view.maxSlots < LOW_FILL) {
        items.push({ activity: view, reason: `Low fill: ${view.taken} of ${view.maxSlots} taken` });
      }
    }
    return items;
  }

  private recent(snapshot: ActivitySnapshot, employees: PublicUser[], limit = 5): RecentRegistration[] {
    const byId = new Map(employees.map((e) => [e.id, e]));
    const titles = new Map(snapshot.activities.map((a) => [a.id, a.title]));
    return [...snapshot.activeRegistrations]
      .sort((a, b) => Date.parse(b.registeredAt) - Date.parse(a.registeredAt))
      .slice(0, limit)
      .map((r) => ({
        name: byId.get(r.userId)?.name ?? 'Unknown employee',
        department: byId.get(r.userId)?.department ?? '',
        activityTitle: titles.get(r.activityId) ?? '',
        registeredAt: r.registeredAt,
      }));
  }

  /** Sign-ups (still active) made in the last 7 days vs the 7 days before. */
  private weekly(registrations: Registration[], now: Date): { thisWeek: number; lastWeek: number } {
    const weekAgo = subDays(now, 7).getTime();
    const twoWeeksAgo = subDays(now, 14).getTime();
    const times = registrations.map((r) => Date.parse(r.registeredAt));
    return {
      thisWeek: times.filter((t) => t > weekAgo).length,
      lastWeek: times.filter((t) => t > twoWeeksAgo && t <= weekAgo).length,
    };
  }
}
