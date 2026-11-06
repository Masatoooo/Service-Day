import { Audience, NotificationType } from '../core/models';

/** View concerns for notices: one line icon and a short label per type and audience. */

export const NOTICE_ICON: Record<NotificationType, string> = {
  registration: 'circle-check',
  switch: 'arrow-left-right',
  withdrawal: 'log-out',
  'activity-update': 'info',
  reminder: 'clock',
  broadcast: 'megaphone',
  'last-slots': 'hourglass',
};

export const NOTICE_TYPE_LABEL: Record<NotificationType, string> = {
  registration: 'Registration',
  switch: 'Switch',
  withdrawal: 'Withdrawal',
  'activity-update': 'Activity update',
  reminder: 'Reminder',
  broadcast: 'Broadcast',
  'last-slots': 'Last slots',
};

export const AUDIENCE_LABEL: Record<Audience, string> = {
  user: 'One person',
  'all-staff': 'All staff',
  unregistered: 'Unregistered staff',
  activity: 'Activity participants',
  ngo: 'NGO contact',
};
