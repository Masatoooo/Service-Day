import { Availability } from './availability';
import { Ngo } from './ngo';

export type ServiceType =
  | 'Food & Nutrition'
  | 'Education'
  | 'Environment'
  | 'Animal Welfare'
  | 'Elderly Care'
  | 'Community';

export const SERVICE_TYPES: readonly ServiceType[] = [
  'Food & Nutrition',
  'Education',
  'Environment',
  'Animal Welfare',
  'Elderly Care',
  'Community',
];

export type ActivityStatus = 'draft' | 'published' | 'cancelled';

// Model: one volunteering activity offered by an NGO on a given day.
export interface Activity {
  id: string;
  ngoId: string;
  title: string;
  serviceType: ServiceType;
  description: string;
  location: string;
  /** Local calendar date 'YYYY-MM-DD'. */
  date: string;
  /** Local time 'HH:mm'. */
  startTime: string;
  /** Local time 'HH:mm'. */
  endTime: string;
  maxSlots: number;
  /** ISO 8601 date-time with offset. */
  cutoffAt: string;
  status: ActivityStatus;
  /** 8 characters, set when an admin generates the QR code. */
  checkInCode: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * View model (derived, never stored): the activity joined with its NGO and
 * live slot numbers. `taken` is always counted from registrations.
 */
export interface ActivityView extends Activity {
  ngo: Ngo;
  taken: number;
  remaining: number;
  availability: Availability;
  isRegisteredByMe?: boolean;
}
