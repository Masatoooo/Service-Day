export type NotificationType =
  | 'registration'
  | 'switch'
  | 'withdrawal'
  | 'activity-update'
  | 'reminder'
  | 'broadcast'
  | 'last-slots';

export type Audience = 'user' | 'all-staff' | 'unregistered' | 'activity' | 'ngo';

// Model: a notice in someone's inbox or in the admin history.
export interface AppNotification {
  id: string;
  type: NotificationType;
  audience: Audience;
  /** Set when audience = 'user'. */
  recipientId: string | null;
  /** Set when audience = 'activity' or the notice is about an activity. */
  activityId: string | null;
  /** Set when audience = 'ngo'. */
  ngoId: string | null;
  title: string;
  message: string;
  urgent: boolean;
  /** 'system' or the admin's userId. */
  sentBy: 'system' | string;
  /** Id of the original broadcast when this is a per-user copy; null on originals. */
  broadcastId: string | null;
  createdAt: string;
  /** userIds who have read it. */
  readBy: string[];
}
