export type RegistrationStatus = 'registered' | 'switched' | 'withdrawn';

// Model: an employee's place on an activity. Only status 'registered' takes a slot.
export interface Registration {
  id: string;
  userId: string;
  activityId: string;
  status: RegistrationStatus;
  registeredAt: string;
  updatedAt: string;
  checkedInAt: string | null;
}
