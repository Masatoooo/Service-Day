import { Injectable, inject } from '@angular/core';
import { differenceInCalendarDays, subDays } from 'date-fns';
import { Observable, combineLatest, map, shareReplay } from 'rxjs';
import { ActivityView, PublicUser, Registration } from '../models';
import { activityStart, formatCutoff } from '../rules';
import { ActivitySnapshot, ActivityService } from './activity-service';
import { UserService } from './user-service';

/** Below this share of slots taken, an open activity "needs attention"… */
const LOW_FILL = 0.25;
/** …but only while there is still time to fill it (PLAN §3: "> 7 days left"). */
const LOW_FILL_MIN_DAYS = 7;

export interface Kpis {
  slotsOffered: number;
  slotsTaken: number;
  slotsRemaining: number;
  participationPercent: number;
  registeredStaff: number;
  totalStaff: number;
  /** Published activities in total, and those still taking sign-ups. */
  publishedActivities: number;
  openActivities: number;
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

export type AttentionKind = 'last-slots' | 'closing-soon' | 'low-fill';

export interface AttentionItem {
  kind: AttentionKind;
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
  /** The snapshot's clock, for relative times ("2 days ago") on the same poll. */
  now: Date;
}

/** Public numbers for the sign-in page: what this season offers. */
export interface SeasonSummary {
  activityCount: number;
  ngoCount: number;
  placesTaken: number;
  placesOffered: number;
  /** The date most published activities share ('YYYY-MM-DD'), or null. */
  serviceDay: string | null;
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

  /** One-off fetch (no polling) for the auth pages' brand panel. */
  seasonSummary(): Observable<SeasonSummary> {
    return this.activities.snapshotOnce().pipe(
      map((snapshot) => {
        const published = this.activities.toViews(snapshot).filter((v) => v.status === 'published');
        const perDate = new Map<string, number>();
        published.forEach((v) => perDate.set(v.date, (perDate.get(v.date) ?? 0) + 1));
        const serviceDay = [...perDate.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
        return {
          activityCount: published.length,
          ngoCount: new Set(published.map((v) => v.ngoId)).size,
          placesTaken: published.reduce((sum, v) => sum + Math.min(v.taken, v.maxSlots), 0),
          placesOffered: published.reduce((sum, v) => sum + v.maxSlots, 0),
          serviceDay,
        };
      }),
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
        publishedActivities: published.length,
        openActivities: published.filter((v) => ['open', 'last-slots', 'closing-soon'].includes(v.availability)).length,
      },
      fillByNgo: this.fillByNgo(published),
      byDepartment: this.byDepartment(employees, placed),
      unregistered: employees.filter((e) => !placed.has(e.id)),
      utilisation: [...published].sort((a, b) => b.taken / b.maxSlots - a.taken / a.maxSlots),
      needsAttention: this.needsAttention(published, snapshot.now),
      recent: this.recent(snapshot, employees),
      weekly: this.weekly(snapshot.activeRegistrations, snapshot.now),
      now: snapshot.now,
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

  /** Last slots, closing soon, and low fill with time left — most urgent first. */
  private needsAttention(published: ActivityView[], now: Date): AttentionItem[] {
    const items: AttentionItem[] = [];
    for (const view of published) {
      if (view.availability === 'last-slots') {
        items.push({ kind: 'last-slots', activity: view, reason: view.remaining === 1 ? '1 place left' : `${view.remaining} places left` });
      } else if (view.availability === 'closing-soon') {
        items.push({ kind: 'closing-soon', activity: view, reason: `Registration closes ${formatCutoff(view.cutoffAt)}` });
      } else if (
        view.availability === 'open' &&
        view.taken / view.maxSlots < LOW_FILL &&
        differenceInCalendarDays(activityStart(view), now) > LOW_FILL_MIN_DAYS
      ) {
        items.push({ kind: 'low-fill', activity: view, reason: `Only ${view.taken} of ${view.maxSlots} places taken` });
      }
    }
    const order: AttentionKind[] = ['closing-soon', 'last-slots', 'low-fill'];
    return items.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));
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
