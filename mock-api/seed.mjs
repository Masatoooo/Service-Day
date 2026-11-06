// Seeds the json-server mock database (mock-api/db.json).
// Phase 0 placeholder: empty collections + default reminder settings.
// The full, date-relative seed (NGOs, activities, registrations, ...) comes in Phase 2.
//
// Usage:
//   node mock-api/seed.mjs              -> always (re)writes db.json
//   node mock-api/seed.mjs --if-missing -> only writes db.json when it does not exist yet
//
// Note: the real seed stores plain-text passwords. That is acceptable ONLY for this mock API.

import { existsSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dbPath = join(here, 'db.json');

if (process.argv.includes('--if-missing') && existsSync(dbPath)) {
  console.log('[seed] mock-api/db.json already exists, skipping (use "npm run db:reset" to re-seed).');
  process.exit(0);
}

const db = {
  users: [],
  ngos: [],
  activities: [],
  registrations: [],
  notifications: [],
  // Singular resource: GET/PUT /reminderSettings
  reminderSettings: {
    enabled: true,
    offsetsDays: [7, 3, 1],
    sendTime: '09:00',
    lastSlotsThreshold: 2,
  },
};

writeFileSync(dbPath, JSON.stringify(db, null, 2) + '\n');
console.log('[seed] wrote mock-api/db.json');
