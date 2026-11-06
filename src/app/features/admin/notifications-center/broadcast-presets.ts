import { format } from 'date-fns';
import { ActivityView, Audience, NotificationType } from '../../../core/models';
import { activityStart, formatCutoff } from '../../../core/rules';
import { AttentionKind } from '../../../core/services/participation-stats-service';

/** What the composer is filled with when it opens from a "Needs attention" action. */
export interface BroadcastPreset {
  audience: Exclude<Audience, 'user'>;
  activityId: string | null;
  type: NotificationType;
  urgent: boolean;
  title: string;
  message: string;
}

/**
 * Specific, human copy for each follow-up (PLAN §5 rule 8 style): names the
 * activity, the date, the numbers and the deadline. Pure function: no HTTP, no DOM.
 */
export function broadcastPreset(kind: AttentionKind, view: ActivityView): BroadcastPreset {
  const when = `${format(activityStart(view), 'EEE d MMM')}, ${view.startTime}`;
  const closes = formatCutoff(view.cutoffAt);
  const places = (n: number) => (n === 1 ? '1 place' : `${n} places`);
  switch (kind) {
    case 'last-slots':
      return {
        audience: 'all-staff',
        activityId: view.id,
        type: 'last-slots',
        urgent: true,
        title: `${view.title}: ${places(view.remaining)} left`,
        message: `${view.ngo.name} — ${view.title} on ${when} has ${places(view.remaining)} left. Registration closes ${closes}.`,
      };
    case 'closing-soon':
      return {
        audience: 'unregistered',
        activityId: view.id,
        type: 'reminder',
        urgent: false,
        title: `${view.title} closes ${closes}`,
        message: `You don't have a Service Day place yet. ${view.ngo.name} — ${view.title} on ${when} still has ${places(view.remaining)}, and registration closes ${closes}.`,
      };
    case 'low-fill':
      return {
        audience: 'all-staff',
        activityId: view.id,
        type: 'broadcast',
        urgent: false,
        title: `Places open: ${view.title}`,
        message: `${view.ngo.name} — ${view.title} on ${when} at ${view.location} still has ${view.remaining} of ${view.maxSlots} places. Registration is open until ${closes}.`,
      };
  }
}
