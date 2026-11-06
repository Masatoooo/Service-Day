// Model: who is signed in. This is what lives in localStorage (never the password).
export type Role = 'admin' | 'employee';

export interface Session {
  userId: string;
  name: string;
  role: Role;
  department: string;
}
