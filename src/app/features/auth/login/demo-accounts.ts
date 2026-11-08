/**
 * Seeded demo accounts (PLAN §2), listed on the sign-in page for the demo.
 * Mock only: these passwords exist in mock-api/db.json in plain text.
 */
export interface DemoAccount {
  name: string;
  email: string;
  password: string;
  role: 'Admin' | 'Employee';
  situation: string;
}

export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  { name: 'Masato Kaneko', email: 'masato@kaneko.co', password: 'Admin#2026', role: 'Admin', situation: 'Runs Service Day for People & Culture' },
  { name: 'Aisha Rahman', email: 'aisha.rahman@kaneko.co', password: 'Volunteer#1', role: 'Employee', situation: 'Registered; cut-off has passed, so changes are locked' },
  { name: 'Daniel Koh', email: 'daniel.koh@kaneko.co', password: 'Volunteer#1', role: 'Employee', situation: 'Registered for an open activity; can switch or withdraw' },
  { name: 'Komang Masato', email: 'komangmasato@kaneko.co', password: 'Volunteer#1', role: 'Employee', situation: 'Not registered yet; can take the last slot' },
  { name: 'Marcus Tan', email: 'marcus.tan@kaneko.co', password: 'Volunteer#1', role: 'Employee', situation: "Registered for today's activity; can check in" },
];
