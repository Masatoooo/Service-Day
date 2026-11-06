// Model: who is signed in. This is what lives in localStorage (never the password).
export type Role = 'admin' | 'employee';

export interface Session {
  userId: string;
  name: string;
  role: Role;
  department: string;
}

/** Where each role lands after sign-in (and when it opens the wrong area). */
export const HOME_BY_ROLE: Record<Role, string> = {
  employee: '/app',
  admin: '/admin',
};
