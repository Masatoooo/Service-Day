// Seeds the json-server mock database (mock-api/db.json) for Service Day.
//
// Every date is relative to the day the script runs (T = today), so the demo
// scenarios in PLAN §6.3 (A–I) stay valid whenever the seed is run. Apart from
// dates, the output is deterministic: a seeded PRNG picks names and assignments.
//
// Usage:
//   node mock-api/seed.mjs              -> always (re)writes db.json   (npm run seed / db:reset)
//   node mock-api/seed.mjs --if-missing -> only writes db.json when it does not exist (npm run dev)
//
// NOTE: passwords are stored in plain text. Acceptable ONLY for this mock API;
// Assignment 2 replaces it with a real server that hashes passwords.

import { existsSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dbPath = join(dirname(fileURLToPath(import.meta.url)), 'db.json');

if (process.argv.includes('--if-missing') && existsSync(dbPath)) {
  console.log('[seed] mock-api/db.json already exists, skipping (use "npm run db:reset" to re-seed).');
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Deterministic randomness (mulberry32) and date helpers (local time)
// ---------------------------------------------------------------------------

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(20261201);
const between = (min, max) => min + Math.floor(random() * (max - min + 1));
const pick = (list) => list[Math.floor(random() * list.length)];
function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const NOW = new Date();
const TODAY = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());
const pad = (n) => String(n).padStart(2, '0');

/** Local date T+days at hh:mm. */
function at(days, hh = 0, mm = 0) {
  return new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + days, hh, mm);
}

/** 'YYYY-MM-DD' in local time. */
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** ISO 8601 in local time with offset, e.g. 2026-11-16T17:00:00+08:00. */
function iso(d) {
  const offset = -d.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const abs = Math.abs(offset);
  return `${ymd(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "Sat 21 Nov" */
const dayLabel = (d) => `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
/** "16 Nov, 17:00" */
const cutoffLabel = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** A random moment between T+fromDay and T+toDay, during office hours. */
const sometime = (fromDay, toDay) => at(between(fromDay, toDay), between(9, 17), pick([0, 10, 20, 30, 40, 50]));

// ---------------------------------------------------------------------------
// Users: 1 admin, 4 demo employees (PLAN §2), 60 more across 7 departments
// ---------------------------------------------------------------------------

const DEPARTMENTS = ['Finance', 'Engineering', 'Marketing', 'People & Culture', 'Operations', 'Legal', 'Customer Success'];
const EMPLOYEE_PASSWORD = 'Volunteer#1';

const slug = (name) => name.toLowerCase().replace(/[^a-z]+/g, '-').replace(/(^-|-$)/g, '');
const emailFor = (name) => {
  const [first, ...rest] = name.toLowerCase().split(' ');
  return `${first}.${rest.join('')}@halden.co`.replace(/[^a-z.@]/g, '');
};

function makeUser(name, role, department, password, email = emailFor(name)) {
  return { id: `u-${slug(name)}`, name, email, password, role, department, createdAt: iso(sometime(-90, -45)) };
}

const admin = makeUser('Nadia Halim', 'admin', 'People & Culture', 'Admin#2026', 'admin@halden.co');
const aisha = makeUser('Aisha Rahman', 'employee', 'Finance', EMPLOYEE_PASSWORD);
const daniel = makeUser('Daniel Koh', 'employee', 'Engineering', EMPLOYEE_PASSWORD);
const priya = makeUser('Priya Menon', 'employee', 'Marketing', EMPLOYEE_PASSWORD);
const marcus = makeUser('Marcus Tan', 'employee', 'Operations', EMPLOYEE_PASSWORD);

const FIRST_NAMES = [
  'Hafiz', 'Mei Ling', 'Arjun', 'Siti', 'Jason', 'Nurul', 'Kavitha', 'Wei Jie', 'Farah', 'Ethan',
  'Amirah', 'Ravi', 'Chloe', 'Zulkifli', 'Hui Min', 'Sanjay', 'Aaron', 'Yasmin', 'Kelvin', 'Divya',
  'Irfan', 'Grace', 'Adrian', 'Shalini', 'Faisal', 'Joanne', 'Haziq', 'Lavanya', 'Benjamin', 'Sofia',
  'Darren', 'Anis', 'Vikram', 'Rachel', 'Imran', 'Melissa', 'Syafiq', 'Ashwin', 'Natalie', 'Jia Hui',
];
const LAST_NAMES = [
  'Lim', 'Wong', 'Ismail', 'Abdullah', 'Nair', 'Raj', 'Chong', 'Lee', 'Ng', 'Hassan', 'Pillai', 'Yusof',
  'Goh', 'Ong', 'Kumar', 'Teo', 'Rahim', 'Chan', 'Fernandez', 'Low', 'Aziz', 'Subramaniam', 'Ho', 'Sim',
];

const others = [];
const usedNames = new Set([admin, aisha, daniel, priya, marcus].map((u) => u.name));
while (others.length < 60) {
  const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
  if (usedNames.has(name)) continue;
  usedNames.add(name);
  others.push(makeUser(name, 'employee', DEPARTMENTS[others.length % DEPARTMENTS.length], EMPLOYEE_PASSWORD));
}

const employees = [aisha, daniel, priya, marcus, ...others];
const users = [admin, ...employees];

// ---------------------------------------------------------------------------
// NGOs: six with activities + one with none (empty state and delete flow)
// ---------------------------------------------------------------------------

const ngos = [
  {
    id: 'ngo-riverbank',
    name: 'Riverbank Food Collective',
    focusArea: 'Food security',
    description: 'Rescues surplus food from the wholesale markets in Selayang and Pudu and turns it into weekly hampers for about 400 low-income households across Kuala Lumpur.',
    contactName: 'Farid Osman',
    contactEmail: 'farid@riverbankfood.org.my',
    verified: true,
  },
  {
    id: 'ngo-little-readers',
    name: 'Little Readers Library',
    focusArea: "Children's literacy",
    description: 'A community library in Sentul that runs after-school reading clubs for children aged 6 to 10, most of whom are reading in their second language.',
    contactName: 'Joyce Lim',
    contactEmail: 'joyce@littlereaders.org.my',
    verified: true,
  },
  {
    id: 'ngo-greenline',
    name: 'Greenline Coastal Cleanup',
    focusArea: 'Coastal conservation',
    description: 'Volunteers restoring mangrove belts and cleaning beaches along the Selangor coast, from Kuala Selangor to Morib. Every seedling planted is tagged and checked for a year.',
    contactName: 'Hafiz Rahman',
    contactEmail: 'hafiz@greenline.org.my',
    verified: true,
  },
  {
    id: 'ngo-harbour',
    name: 'Harbour Animal Shelter',
    focusArea: 'Animal welfare',
    description: 'A shelter in Port Klang caring for around 120 rescued dogs and cats, with a low-cost neutering clinic and an adoption day every second Saturday.',
    contactName: 'Chee Siew Lan',
    contactEmail: 'siewlan@harbourshelter.org.my',
    verified: true,
  },
  {
    id: 'ngo-open-hands',
    name: 'Open Hands Community Kitchen',
    focusArea: 'Community meals',
    description: 'Serves a free hot lunch six days a week in Chow Kit to anyone who walks in, cooked from donated produce by a rotating volunteer crew.',
    contactName: 'Ramesh Pillai',
    contactEmail: 'ramesh@openhands.org.my',
    verified: true,
  },
  {
    id: 'ngo-silver-years',
    name: 'Silver Years Care Home',
    focusArea: 'Elderly care',
    description: 'A 40-resident care home in Petaling Jaya built around dementia-friendly routines, music sessions and regular family visits.',
    contactName: 'Anita Kaur',
    contactEmail: 'anita@silveryears.org.my',
    verified: true,
  },
  {
    id: 'ngo-brightside',
    name: 'Brightside Repair Café',
    focusArea: 'Community repair',
    description: 'A monthly pop-up in Bangsar where volunteers fix small appliances, clothes and bicycles for free, keeping them out of landfill.',
    contactName: 'Ho Wei Ming',
    contactEmail: 'weiming@brightsiderepair.org',
    verified: false,
  },
];

// ---------------------------------------------------------------------------
// Activities A–I (PLAN §6.3). Service Day is T+14.
// ---------------------------------------------------------------------------

const CHECK_IN_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const checkInCode = () => Array.from({ length: 8 }, () => pick([...CHECK_IN_ALPHABET])).join('');

function activity(key, spec) {
  const created = sometime(-30, -21);
  return {
    key,
    taken: spec.taken,
    day: spec.day,
    id: spec.id,
    ngoId: spec.ngoId,
    title: spec.title,
    serviceType: spec.serviceType,
    description: spec.description,
    location: spec.location,
    date: ymd(at(spec.day)),
    startTime: spec.start,
    endTime: spec.end,
    maxSlots: spec.maxSlots,
    cutoffAt: iso(spec.cutoff),
    status: spec.status ?? 'published',
    checkInCode: spec.checkInCode ?? null,
    createdAt: iso(created),
    updatedAt: iso(spec.status === 'cancelled' ? sometime(-3, -2) : created),
  };
}

const SERVICE_DAY = 14;

const activitySpecs = [
  activity('A', {
    id: 'act-pack-deliver', ngoId: 'ngo-riverbank', title: 'Pack & Deliver Food Hampers', serviceType: 'Food & Nutrition',
    description: 'Sort donated rice, oil, tinned food and fresh produce into family hampers, then ride along with the vans to drop them at 40 homes in Sentul and Kepong. The warehouse gets warm, so bring a water bottle and wear closed shoes.',
    location: 'Riverbank warehouse, Jalan Ipoh, Kuala Lumpur', day: SERVICE_DAY, start: '08:30', end: '12:30',
    maxSlots: 20, taken: 6, cutoff: at(10, 17, 0),
  }),
  activity('B', {
    id: 'act-reading-buddies', ngoId: 'ngo-little-readers', title: 'Reading Buddies', serviceType: 'Education',
    description: 'Pair up with a child aged 6 to 10 to read picture books together, then help them write and illustrate a short story of their own. No teaching experience needed; the library team gives a 20-minute briefing at the start.',
    location: 'Little Readers Library, Jalan Sentul, Kuala Lumpur', day: SERVICE_DAY, start: '09:00', end: '12:00',
    maxSlots: 12, taken: 11, cutoff: at(9, 17, 0),
  }),
  activity('C', {
    id: 'act-mangrove', ngoId: 'ngo-greenline', title: 'Mangrove Planting', serviceType: 'Environment',
    description: "Plant 300 mangrove seedlings in the mudflats at low tide and tag each one for Greenline's survival survey. Expect mud up to your knees; boots and gloves are provided, and the bus leaves the office at 06:15.",
    location: 'Kuala Selangor Nature Park, Kuala Selangor', day: SERVICE_DAY, start: '07:30', end: '11:30',
    maxSlots: 15, taken: 15, cutoff: at(9, 17, 0),
  }),
  activity('D', {
    id: 'act-kennel-refresh', ngoId: 'ngo-harbour', title: 'Kennel Refresh Day', serviceType: 'Animal Welfare',
    description: "Repaint twelve kennels, fix the shade nets over the exercise yard and take the dogs on their weekend walk. The shelter asks for volunteers who are comfortable around large dogs.",
    location: 'Harbour Animal Shelter, Jalan Pelabuhan, Port Klang', day: SERVICE_DAY, start: '09:00', end: '13:00',
    maxSlots: 10, taken: 8, cutoff: at(-1, 17, 0),
  }),
  activity('E', {
    id: 'act-lunch-service', ngoId: 'ngo-open-hands', title: 'Lunch Service', serviceType: 'Food & Nutrition',
    description: "Help the kitchen crew prep vegetables, serve a hot lunch to around 250 guests and clean down afterwards. Aprons and hair ties are provided; please skip perfume on the day.",
    location: 'Open Hands Kitchen, Lorong Haji Taib, Chow Kit', day: SERVICE_DAY, start: '10:30', end: '14:00',
    maxSlots: 12, taken: 4, cutoff: at(1, 12, 0),
  }),
  activity('F', {
    id: 'act-memory-lane', ngoId: 'ngo-silver-years', title: 'Memory Lane Afternoon', serviceType: 'Elderly Care',
    description: 'Spend the afternoon with residents looking through old photographs, playing carrom and singing along to P. Ramlee and 70s pop. Staff pair each volunteer with two residents and stay close by throughout.',
    location: 'Silver Years Care Home, Jalan 14/22, Petaling Jaya', day: 0, start: '14:00', end: '17:00',
    maxSlots: 8, taken: 6, cutoff: at(-2, 17, 0), checkInCode: checkInCode(),
  }),
  activity('G', {
    id: 'act-beach-cleanup', ngoId: 'ngo-greenline', title: 'Beach Cleanup Sprint', serviceType: 'Environment',
    description: "Clear the high-tide line along 1.5 km of Morib beach and sort what you collect, so Greenline can report it to the national marine debris survey. Bags, gloves and grabbers are provided; bring a hat and sunscreen.",
    location: 'Pantai Morib, Banting', day: 21, start: '08:00', end: '11:00',
    maxSlots: 25, taken: 0, cutoff: at(18, 17, 0),
  }),
  activity('H', {
    id: 'act-stem-craft', ngoId: 'ngo-little-readers', title: 'STEM Craft Workshop', serviceType: 'Education',
    description: 'Build paper circuits and balloon-powered cars with children from the reading club. The library is still confirming the materials list, so this one stays a draft for now.',
    location: 'Little Readers Library, Jalan Sentul, Kuala Lumpur', day: SERVICE_DAY, start: '13:00', end: '16:00',
    maxSlots: 10, taken: 0, cutoff: at(10, 17, 0), status: 'draft',
  }),
  activity('I', {
    id: 'act-garden-build', ngoId: 'ngo-open-hands', title: 'Community Garden Build', serviceType: 'Community',
    description: "Build raised beds and a drip-irrigation line for the kitchen's rooftop herb garden. Cancelled: the building owner has paused rooftop access for safety checks.",
    location: 'Open Hands rooftop, Chow Kit, Kuala Lumpur', day: 7, start: '08:00', end: '12:00',
    maxSlots: 10, taken: 3, cutoff: at(4, 17, 0), status: 'cancelled',
  }),
];

const byKey = Object.fromEntries(activitySpecs.map((a) => [a.key, a]));
// key, taken and day are seed bookkeeping only; they are not stored in db.json.
const activities = activitySpecs.map(({ key, taken, day, ...rest }) => rest);
const ngoName = (id) => ngos.find((n) => n.id === id).name;
const startOf = (a) => new Date(`${a.date}T${a.startTime}:00`);

// ---------------------------------------------------------------------------
// Registrations: active counts match "taken" exactly; plus history rows
// ---------------------------------------------------------------------------

const registrations = [];
let regCounter = 0;
function register(user, act, status = 'registered', extra = {}) {
  // Registered some time before the activity's cut-off (and before today).
  const cutoffDay = Math.round((new Date(act.cutoffAt) - TODAY) / 86400000);
  const registeredAt = extra.registeredAt ?? sometime(-20, Math.min(-1, cutoffDay - 1));
  const row = {
    id: `reg-${String(++regCounter).padStart(3, '0')}`,
    userId: user.id,
    activityId: act.id,
    status,
    registeredAt: iso(registeredAt),
    updatedAt: iso(extra.updatedAt ?? registeredAt),
    checkedInAt: extra.checkedInAt ? iso(extra.checkedInAt) : null,
  };
  registrations.push(row);
  return row;
}

// Demo accounts first (PLAN §2): Aisha on D (locked), Daniel on A (open), Marcus on F (today).
register(aisha, byKey.D);
register(daniel, byKey.A);
register(marcus, byKey.F);

const pool = shuffle(others);
const fill = { A: 5, B: 11, C: 15, D: 7, E: 4, F: 5, I: 3 }; // remaining slots after the demo accounts
for (const [key, count] of Object.entries(fill)) {
  for (let i = 0; i < count; i++) {
    const user = pool.shift();
    const extra = {};
    // F: two volunteers have already arrived today (QR check-in demo).
    if (key === 'F' && i < 2) {
      const earliest = at(0, 0, 5).getTime();
      extra.checkedInAt = new Date(Math.max(earliest, NOW.getTime() - (i === 0 ? 35 : 8) * 60000));
    }
    register(user, byKey[key], 'registered', extra);
  }
}
const cancelledParticipants = registrations.filter((r) => r.activityId === byKey.I.id).map((r) => r.userId);

// History: Daniel switched from C to A; two people withdrew; one switched G → B (already counted on B).
register(daniel, byKey.C, 'switched', { registeredAt: sometime(-14, -12), updatedAt: sometime(-7, -6) });
const [withdrawerE, withdrawerB] = pool;
register(withdrawerE, byKey.E, 'withdrawn', { registeredAt: sometime(-12, -10), updatedAt: sometime(-5, -4) });
register(withdrawerB, byKey.B, 'withdrawn', { registeredAt: sometime(-16, -13), updatedAt: sometime(-9, -8) });
const switcherToB = registrations.find((r) => r.activityId === byKey.B.id && r.status === 'registered' && r.userId !== aisha.id);
register(users.find((u) => u.id === switcherToB.userId), byKey.G, 'switched', { registeredAt: sometime(-18, -17), updatedAt: sometime(-15, -15) });

// ---------------------------------------------------------------------------
// Notifications: every type, some read, some unread for Aisha
// ---------------------------------------------------------------------------

const notifications = [];
let ntfCounter = 0;
function notice(spec) {
  const row = {
    id: `ntf-${String(++ntfCounter).padStart(3, '0')}`,
    type: spec.type,
    audience: spec.audience,
    recipientId: spec.recipientId ?? null,
    activityId: spec.activityId ?? null,
    ngoId: spec.ngoId ?? null,
    title: spec.title,
    message: spec.message,
    urgent: spec.urgent ?? false,
    sentBy: spec.sentBy ?? 'system',
    broadcastId: spec.broadcastId ?? null,
    createdAt: iso(spec.at),
    readBy: spec.readBy ?? [],
  };
  notifications.push(row);
  return row;
}

/** Stores the original once, then one audience 'user' copy per recipient (PLAN §6.2 inbox rule). */
function broadcastTo(recipients, spec, readers = []) {
  const original = notice(spec);
  for (const userId of recipients) {
    notice({ ...spec, audience: 'user', recipientId: userId, broadcastId: original.id, readBy: readers.includes(userId) ? [userId] : [] });
  }
  return original;
}

const youreIn = (a) => `You're in: ${ngoName(a.ngoId)} — ${a.title}, ${dayLabel(startOf(a))}, ${a.startTime}.`;
const A = byKey.A, B = byKey.B, C = byKey.C, D = byKey.D, E = byKey.E, F = byKey.F, I = byKey.I;
const activeIds = new Set(
  registrations.filter((r) => r.status === 'registered' && r.activityId !== I.id).map((r) => r.userId),
);
const unregistered = employees.filter((u) => !activeIds.has(u.id)).map((u) => u.id);
const someReaders = (n) => shuffle(employees.map((u) => u.id).filter((id) => id !== aisha.id)).slice(0, n);

notice({ type: 'registration', audience: 'user', recipientId: aisha.id, activityId: D.id, title: `You're in: ${D.title}`, message: youreIn(D), at: sometime(-16, -15), readBy: [aisha.id] });
notice({ type: 'registration', audience: 'user', recipientId: daniel.id, activityId: C.id, title: `You're in: ${C.title}`, message: youreIn(C), at: sometime(-13, -12), readBy: [daniel.id] });
notice({
  type: 'switch', audience: 'user', recipientId: daniel.id, activityId: A.id, title: `You switched to ${A.title}`,
  message: `Your place moved from ${C.title} to ${ngoName(A.ngoId)} — ${A.title}, ${dayLabel(startOf(A))}, ${A.startTime}.`, at: sometime(-7, -6),
});
notice({ type: 'registration', audience: 'user', recipientId: marcus.id, activityId: F.id, title: `You're in: ${F.title}`, message: youreIn(F), at: sometime(-10, -9), readBy: [marcus.id] });
notice({
  type: 'withdrawal', audience: 'user', recipientId: withdrawerE.id, activityId: E.id, title: `You've withdrawn from ${E.title}`,
  message: `Your place on ${ngoName(E.ngoId)} — ${E.title} has been released. You can still register for another activity before its cut-off.`, at: sometime(-5, -4), readBy: [withdrawerE.id],
});
broadcastTo(
  registrations.filter((r) => r.activityId === D.id && r.status === 'registered').map((r) => r.userId),
  {
    type: 'activity-update', audience: 'activity', activityId: D.id, sentBy: admin.id, at: sometime(-3, -2),
    title: `${D.title}: wear old clothes`,
    message: "Harbour Animal Shelter will provide paint, brushes and gloves. Please wear clothes you don't mind getting paint on, and closed shoes for the yard.",
  },
  someReaders(4),
);
broadcastTo(cancelledParticipants, {
  type: 'activity-update', audience: 'activity', activityId: I.id, sentBy: admin.id, at: at(-3, 11, 15),
  title: `${I.title} is cancelled`,
  message: `Open Hands has paused rooftop access for safety checks, so the garden build on ${dayLabel(startOf(I))} won't go ahead. Your place has been released and you can register for another activity.`,
}, cancelledParticipants.slice(0, 1));
notice({
  type: 'broadcast', audience: 'all-staff', sentBy: admin.id, at: at(-3, 10, 0), readBy: someReaders(18),
  title: 'Service Day T-shirts are ready',
  message: `Collect your Service Day T-shirt from the People & Culture desk on level 12 any weekday before ${dayLabel(at(SERVICE_DAY))}. Sizes S to XXL.`,
});
broadcastTo(unregistered, {
  type: 'reminder', audience: 'unregistered', sentBy: admin.id, at: at(-1, 9, 0),
  title: 'Pick your Service Day activity',
  message: `There are still places on Pack & Deliver, Lunch Service and Beach Cleanup Sprint. Lunch Service closes first, on ${cutoffLabel(new Date(E.cutoffAt))}.`,
});
notice({
  type: 'last-slots', audience: 'all-staff', sentBy: admin.id, urgent: true, at: at(0, 8, 30), readBy: someReaders(6),
  title: `${B.title}: 1 slot left`,
  message: `${ngoName(B.ngoId)} has one place left on ${dayLabel(startOf(B))}, ${B.startTime}–${B.endTime}. Registration closes ${cutoffLabel(new Date(B.cutoffAt))}.`,
});
notice({
  type: 'reminder', audience: 'user', recipientId: marcus.id, activityId: F.id, at: at(0, 7, 0),
  title: `${F.title} is today`,
  message: `See you at ${F.location} at ${F.startTime}. Check in at the door by scanning the QR code, or type the code under it.`,
});
notice({
  type: 'broadcast', audience: 'ngo', ngoId: A.ngoId, sentBy: admin.id, at: at(-2, 15, 0),
  title: `Volunteer numbers for ${dayLabel(at(SERVICE_DAY))}`,
  message: `Hi Farid, ${A.title} has ${byKey.A.taken} Halden & Co. volunteers confirmed so far. We'll send the final list after the cut-off on ${cutoffLabel(new Date(A.cutoffAt))}.`,
});

// ---------------------------------------------------------------------------
// Write db.json and print the summary
// ---------------------------------------------------------------------------

const db = {
  users,
  ngos,
  activities,
  registrations,
  notifications,
  // Singular resource: GET/PUT /reminderSettings
  reminderSettings: { enabled: true, offsetsDays: [7, 3, 1], sendTime: '09:00', lastSlotsThreshold: 2 },
};

writeFileSync(dbPath, JSON.stringify(db, null, 2) + '\n');

/** Same order as core/rules getAvailability (PLAN §5 rule 1). */
function expectedAvailability(a, taken) {
  if (a.status === 'cancelled') return 'cancelled';
  if (a.status === 'draft') return 'draft';
  const cutoff = new Date(a.cutoffAt);
  if (NOW >= cutoff) return 'closed';
  const remaining = a.maxSlots - taken;
  if (remaining <= 0) return 'full';
  if (remaining <= db.reminderSettings.lastSlotsThreshold) return 'last-slots';
  if (cutoff - NOW <= 48 * 3600 * 1000) return 'closing-soon';
  return 'open';
}

const rows = activitySpecs.map((a) => {
  const taken = registrations.filter((r) => r.activityId === a.id && r.status === 'registered').length;
  if (taken !== a.taken) throw new Error(`Seed bug: ${a.title} has ${taken} registrations, expected ${a.taken}`);
  const relativeDay = a.day === 0 ? 'T' : `T+${a.day}`;
  return [a.key, a.title, `${a.date} (${relativeDay})`, `${taken}/${a.maxSlots}`, cutoffLabel(new Date(a.cutoffAt)), expectedAvailability(a, taken)];
});
const header = ['#', 'Activity', 'Date', 'Taken', 'Cut-off', 'Expected availability'];
const widths = header.map((h, i) => Math.max(h.length, ...rows.map((r) => r[i].length)));
const line = (cells) => '| ' + cells.map((c, i) => c.padEnd(widths[i])).join(' | ') + ' |';

console.log(`[seed] wrote mock-api/db.json (today = ${ymd(TODAY)}, Service Day = ${ymd(at(SERVICE_DAY))})`);
console.log(`[seed] ${users.length} users (${employees.length} employees, ${employees.length - unregistered.length} with an active place), ${ngos.length} NGOs, ${activities.length} activities, ${registrations.length} registrations, ${notifications.length} notifications`);
console.log(line(header));
console.log('|' + widths.map((w) => '-'.repeat(w + 2)).join('|') + '|');
rows.forEach((r) => console.log(line(r)));
console.log(`[seed] check-in code for ${F.title}: ${F.checkInCode}`);

// json-server keeps the database in memory and saves it with an atomic rename, after
// which it no longer notices outside changes to db.json. If the API is running, the
// new data is only loaded after a restart (and its next write would overwrite this seed).
try {
  await fetch('http://localhost:3000/reminderSettings', { signal: AbortSignal.timeout(500) });
  console.log('\n[seed] The mock API is running on :3000. Stop "npm run dev" (Ctrl+C) and start it again so it loads this data.');
} catch {
  // API not running: nothing to do.
}
