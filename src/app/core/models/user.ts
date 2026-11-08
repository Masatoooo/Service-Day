import { Role } from './session';

// Model: an account in the mock API.
export interface User {
  id: string;
  name: string;
  email: string;
  /** Mock API only (plain text in db.json). Never sent to localStorage. Assignment 2 hashes it server-side. */
  password: string;
  role: Role;
  department: string;
  createdAt: string;
}

/** A user as shown in lists: everything except the password. */
export type PublicUser = Omit<User, 'password'>;

export const DEPARTMENTS: readonly string[] = [
  'Customer Success',
  'Engineering',
  'Finance',
  'Legal',
  'Marketing',
  'Operations',
  'People & Culture',
];

/** Self-registration is for Kaneko.co staff only. */
export const WORK_EMAIL_DOMAIN = '@kaneko.co';
