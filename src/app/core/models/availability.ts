// Model: derived availability of an activity (computed by core/rules, never stored).
export type Availability =
  | 'open'
  | 'last-slots'
  | 'closing-soon'
  | 'full'
  | 'closed'
  | 'cancelled'
  | 'draft';

export const AVAILABILITIES: readonly Availability[] = [
  'open',
  'last-slots',
  'closing-soon',
  'full',
  'closed',
  'cancelled',
  'draft',
];
