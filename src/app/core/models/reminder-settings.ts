// Model: the singular reminder schedule resource (GET/PUT /reminderSettings).
export interface ReminderSettings {
  enabled: boolean;
  /** Days before the activity, default [7, 3, 1]. */
  offsetsDays: number[];
  /** 'HH:mm', default '09:00'. */
  sendTime: string;
  /** Remaining slots at or below this count are "last slots", default 2. */
  lastSlotsThreshold: number;
}
