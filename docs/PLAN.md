# Service Day — Build Plan (Assignment 1, Front-end)

Blueprint for the whole front-end. `CLAUDE.md` holds the rules; this file holds the *what*. Keep both in sync if a decision changes (log it in `PROGRESS.md`).

---

## 1. Scope

| Use case | Actor | Assignment 1 (this build) | Left for Assignment 2 |
|---|---|---|---|
| UC1 Manage NGO availability | Admin | Full CRUD of NGOs and their activities through the mock API, publish/unpublish | Real persistence, server validation |
| UC2 View opportunities | Employee | Full: list, filters, detail, live slot counts | — |
| UC3 Register / edit / cancel | Employee | Full: register, switch, withdraw, slot + cut-off rules, overbooking guard | Server-side enforcement |
| UC4 Monitor participation | Admin | Full: KPIs, charts, distribution, unregistered staff, manual reminders | — |
| UC5 Notifications & reminders | Admin / System | **UI + simulated:** reminder schedule settings, broadcast composer, history, employee inbox, auto "system" notices created by the client after each action | Real email (Nodemailer), scheduled jobs |
| UC6 QR check-in | Employee / Admin | **UI + simulated:** generate QR per activity, check-in by link or code, live check-in list, attendance CSV | Real scan endpoint, server-side time stamping |

Out of scope: real email, real security, file uploads, multi-tenant.

---

## 2. Roles and demo accounts

| Role | Can do |
|---|---|
| **Employee** | Browse published activities, register (one active registration), switch, withdraw before cut-off, check in on the day, read notifications |
| **Admin** | Everything in the Admin area: NGOs, activities, monitoring, notifications, check-ins |

Self-registration creates **Employee** accounts only. Admins exist in seed data.

Seeded accounts (shown in a collapsible "Demo accounts" panel on the login page):

| Name | Email | Password | Role | Seeded situation |
|---|---|---|---|---|
| Nadia Halim | `admin@halden.co` | `Admin#2026` | Admin | — |
| Aisha Rahman | `aisha.rahman@halden.co` | `Volunteer#1` | Employee | Registered for an activity whose cut-off **has passed** (edit locked) |
| Daniel Koh | `daniel.koh@halden.co` | `Volunteer#1` | Employee | Registered for an **open** activity (can switch / withdraw) |
| Priya Menon | `priya.menon@halden.co` | `Volunteer#1` | Employee | **Not registered** (used to take the last slot in the demo) |
| Marcus Tan | `marcus.tan@halden.co` | `Volunteer#1` | Employee | Registered for **today's** activity (check-in demo) |

Plus ~20 more employees across departments so charts look real.

Departments: Finance, Engineering, Marketing, People & Culture, Operations, Legal, Customer Success.

---

## 3. Sitemap

All app pages sit inside the shell (sidebar + top bar). Auth pages use a split layout without the shell.

### Public (`AuthModule`, lazy, `guestGuard`)
| Route | Page | Notes |
|---|---|---|
| `/login` | Sign in | Email + password, demo-accounts panel, link to register |
| `/register` | Create account | Full name, work email (must end with `@halden.co`), department, password + confirm (min 8 chars, one number). Email uniqueness checked via API. Auto sign-in → `/app` |

### Employee (`EmployeeModule`, lazy, `authGuard` + `roleGuard('employee')`, prefix `/app`)
| Route | Page | UC | Content |
|---|---|---|---|
| `/app` | Home | 2,3 | Greeting; **"Your Service Day" card** (current registration, cut-off countdown, Switch / Withdraw, Check in on the day); small KPIs (open activities, slots still available, days until Service Day); "Closing soon" list; latest 3 notifications |
| `/app/opportunities` | Opportunities | 2 | Search, service-type pills, date filter, "Show full & closed" toggle; activity cards with slot meter, cut-off label, status pill |
| `/app/opportunities/:id` | Activity detail | 2,3 | Full info, NGO block, slot meter, rules explanation, primary action (Register / Switch here / Withdraw / disabled with reason) with confirm dialog |
| `/app/registrations` | My registrations | 3 | Current registration + history (switched / withdrawn), actions with reasons when locked |
| `/app/inbox` | Notifications | 5 | List with type icon, unread state, mark read / mark all read |
| `/app/check-in/:code` | Check in | 6 | Landing page reached from the QR link; validates and records arrival time |
| `/app/check-in` | Check in (manual) | 6 | Enter the 8-char code shown under the QR |

### Admin (`AdminModule`, lazy, `authGuard` + `roleGuard('admin')`, prefix `/admin`)
| Route | Page | UC | Content |
|---|---|---|---|
| `/admin` | Overview | 4 | 4 KPI cards (Slots offered, Slots taken, Slots remaining, Staff participation %); "Fill by NGO" bar chart (taken vs capacity); participation gauge (signature element); "Needs attention" list (last slots, closing soon, low fill); recent registrations table |
| `/admin/activities` | Activities | 1 | Table: title, NGO, date, cut-off, fill, status; filters; actions Edit / Publish / Unpublish / Delete (confirm) |
| `/admin/activities/new`, `/admin/activities/:id/edit` | Activity form | 1 | Reactive form: NGO, title, service type, description, location, date, start/end time, max slots, cut-off date+time, status. Validation: cut-off before start, max slots ≥ current registrations |
| `/admin/activities/:id` | Activity detail | 1,4,6 | Participants list, slot meter, QR panel shortcut, "Notify participants" |
| `/admin/ngos` | NGOs | 1 | List + create/edit drawer: name, focus area, description, contact person, contact email, verified flag. Delete blocked if NGO has activities (explain why) |
| `/admin/participation` | Participation | 4 | Distribution per NGO and per department; table of employees **not registered** with multi-select "Send reminder"; per-activity utilisation table |
| `/admin/notifications` | Notifications | 5 | Tabs: **Schedule** (enable, offsets 7/3/1 days, send time, last-slots threshold, preview of upcoming reminders), **Broadcast** (audience: all staff / unregistered / one activity's participants / NGO contacts; title, message, urgent flag), **History** (all sent notices) |
| `/admin/check-ins` | Check-ins | 6 | Pick activity → QR (generate / regenerate code, download PNG), live arrivals list (polling), present / expected / late counts, export attendance CSV |

Shared: `**` → Not found page inside the shell (or auth layout if signed out). `/` redirects by role.

Dev only: `/styleguide` (shows tokens and shared components). It may stay in the submission but must never be linked from the sidebar or any page.

---

## 4. Data models (`core/models/`)

IDs are **strings** (works with json-server v0 and v1). Dates are ISO 8601 strings in local time with offset.

```ts
export type Role = 'admin' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;          // mock only — never sent to localStorage
  role: Role;
  department: string;
  createdAt: string;
}

export interface Session {     // what lives in localStorage
  userId: string;
  name: string;
  role: Role;
  department: string;
}

export interface Ngo {
  id: string;
  name: string;
  focusArea: string;         // e.g. 'Food security'
  description: string;
  contactName: string;
  contactEmail: string;
  verified: boolean;
}

export type ServiceType =
  'Food & Nutrition' | 'Education' | 'Environment' | 'Animal Welfare' | 'Elderly Care' | 'Community';

export type ActivityStatus = 'draft' | 'published' | 'cancelled';

export interface Activity {
  id: string;
  ngoId: string;
  title: string;
  serviceType: ServiceType;
  description: string;
  location: string;
  date: string;              // 'YYYY-MM-DD'
  startTime: string;         // 'HH:mm'
  endTime: string;           // 'HH:mm'
  maxSlots: number;
  cutoffAt: string;          // ISO date-time
  status: ActivityStatus;
  checkInCode: string | null; // 8 chars, set when admin generates QR
  createdAt: string;
  updatedAt: string;
}

export type RegistrationStatus = 'registered' | 'switched' | 'withdrawn';

export interface Registration {
  id: string;
  userId: string;
  activityId: string;
  status: RegistrationStatus;
  registeredAt: string;
  updatedAt: string;
  checkedInAt: string | null;
}

export type NotificationType =
  'registration' | 'switch' | 'withdrawal' | 'activity-update' | 'reminder' | 'broadcast' | 'last-slots';

export type Audience = 'user' | 'all-staff' | 'unregistered' | 'activity' | 'ngo';

export interface AppNotification {
  id: string;
  type: NotificationType;
  audience: Audience;
  recipientId: string | null; // set when audience = 'user'
  activityId: string | null;  // set when audience = 'activity' or related
  ngoId: string | null;       // set when audience = 'ngo'
  title: string;
  message: string;
  urgent: boolean;
  sentBy: 'system' | string;  // admin userId
  broadcastId: string | null; // id of the original broadcast when this is a per-user copy
  createdAt: string;
  readBy: string[];           // userIds
}

export interface ReminderSettings {  // singular resource
  enabled: boolean;
  offsetsDays: number[];     // default [7, 3, 1]
  sendTime: string;          // 'HH:mm', default '09:00'
  lastSlotsThreshold: number;// default 2
}

// View models (derived, never stored)
export type Availability = 'open' | 'last-slots' | 'closing-soon' | 'full' | 'closed' | 'cancelled' | 'draft';

export interface ActivityView extends Activity {
  ngo: Ngo;
  taken: number;
  remaining: number;
  availability: Availability;
  isRegisteredByMe?: boolean;
}
```

**Single source of truth for slots:** `taken` = count of registrations with `status === 'registered'` for that activity. It is never stored on the activity, so it cannot drift.

---

## 5. Business rules (`core/rules/`, pure functions + unit tests)

All functions take `now: Date` as a parameter (supplied by `ClockService`) so they are testable.

1. **Availability** — `getAvailability(activity, taken, now, threshold)` returns the first match:
   `cancelled` → `draft` → `closed` (now ≥ cutoffAt) → `full` (taken ≥ maxSlots) → `last-slots` (remaining ≤ threshold) → `closing-soon` (cutoff within 48 h) → `open`.
2. **Can register** — activity `published`, not closed, not full, and the employee has **no active registration** (one per Service Day season). Returns `{ ok: true } | { ok: false, reason: string }` with a human sentence for the UI.
3. **Can switch** — the employee's current activity is before its cut-off **and** the target passes rule 2 (ignoring the "already registered" check). Switch marks the old registration `switched` and creates a new `registered` one.
4. **Can withdraw** — current activity before its cut-off. Sets status `withdrawn`.
5. **Overbooking guard** — `RegistrationService` re-fetches the activity and its current registrations **immediately before** writing, re-runs the rule, and only then POSTs. If the slot was taken meanwhile, it fails with "Someone just took the last slot" and the UI refreshes. (Assignment 2 moves this check to the server.)
6. **Admin edits** — `maxSlots` cannot go below current `taken`; `cutoffAt` must be before the activity start; deleting an activity with active registrations is blocked (offer *Cancel activity* instead, which notifies participants).
7. **Check-in window** — allowed on the activity date (local) from 00:00 to 23:59 for the mock, only for employees with an active registration on that activity; second check-in is rejected politely. Arrival after `startTime` + 15 min is shown as **Late**.
8. **System notifications** — after register / switch / withdraw / admin update / cancel, the client creates the matching `AppNotification` (simulating the server). Messages are specific: *"You're in: Riverbank Food Collective — Pack & Deliver, Sat 21 Nov, 08:30."*
9. **Reminder preview** — from `ReminderSettings`, list the next reminders that *would* be sent (activity × offset × send time), so UC5 is demonstrable without a scheduler.

---

## 6. Mock API

### 6.1 json-server

- Scripts in `package.json`:
  - `seed` → `node mock-api/seed.mjs` (writes `mock-api/db.json`)
  - `api` → json-server watching `mock-api/db.json` on port **3000**
  - `dev` → seeds only if `db.json` is missing, then runs `api` + `ng serve` together with `concurrently`
  - `db:reset` → force re-seed (use right before recording the video)
- Check which json-server major version is installed and use matching CLI flags. Do not rely on `_expand`, `_embed`, custom routes or `--delay`; joins are done in services with `forkJoin`/`combineLatest`, latency is simulated by an interceptor.

### 6.2 Collections

| Resource | Example calls used |
|---|---|
| `/users` | `GET ?email=`, `GET ?role=employee`, `POST` |
| `/ngos` | `GET`, `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id` |
| `/activities` | `GET`, `GET ?status=published`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` |
| `/registrations` | `GET ?userId=`, `GET ?activityId=`, `GET ?status=registered`, `POST`, `PATCH /:id` |
| `/notifications` | `GET ?recipientId=`, `GET ?audience=`, `POST`, `PATCH /:id` (readBy) |
| `/reminderSettings` | singular: `GET`, `PUT` |

**Inbox rule.** Broadcasts to *unregistered staff* or to *an activity's participants* are expanded at send time into one `audience: 'user'` notification per recipient (the original broadcast is also stored once with its real audience for the admin History tab, with `readBy` unused). *All-staff* broadcasts stay a single record. NGO notices (`audience: 'ngo'`) only appear in admin History. So a user's inbox = `GET ?recipientId=me` + `GET ?audience=all-staff`, merged and sorted by `createdAt` desc. Admin History = all records except the expanded per-user copies of a broadcast (link them with a `broadcastId` field, `null` on originals).

### 6.3 Seed scenarios (`mock-api/seed.mjs`)

Relative to the day the seed runs (`T` = today). **Service Day** is `T+14` (a Saturday-style day; exact weekday not important). Generate realistic, fictional content. Required scenarios:

| # | Activity (NGO) | Date | Slots | Cut-off | Purpose in demo |
|---|---|---|---|---|---|
| A | Pack & Deliver Food Hampers (Riverbank Food Collective) | T+14 | 6 / 20 taken | T+10 17:00 | Plenty of space |
| B | Reading Buddies (Little Readers Library) | T+14 | **11 / 12** | T+9 17:00 | **Last slot** |
| C | Mangrove Planting (Greenline Coastal Cleanup) | T+14 | **15 / 15** | T+9 17:00 | **Full** |
| D | Kennel Refresh Day (Harbour Animal Shelter) | T+14 | 8 / 10 | **T−1 17:00** | **Cut-off passed** (Aisha registered) |
| E | Lunch Service (Open Hands Community Kitchen) | T+14 | 4 / 12 | **T+1 12:00** | **Closing soon** |
| F | Memory Lane Afternoon (Silver Years Care Home) | **T** (today) | 6 / 8 | T−2 17:00 | **Check-in demo** (Marcus registered, 2 already checked in, QR code generated) |
| G | Beach Cleanup Sprint (Greenline Coastal Cleanup) | T+21 | 0 / 25 | T+18 17:00 | Low fill → "Needs attention" |
| H | STEM Craft Workshop (Little Readers Library) | T+14 | 0 / 10 | T+10 17:00 | **Draft** (hidden from employees) |
| I | Community Garden Build (Open Hands Community Kitchen) | T+7 | 3 / 10 | T+4 17:00 | **Cancelled** (shows the state) |

- 6 NGOs total (the five above + one with no activities yet so the empty state and delete flow can be shown).
- ~25 employees; registrations must exactly match the "taken" numbers; a few `switched` / `withdrawn` history rows.
- 10–15 notifications covering every type, some read, some unread for Aisha.
- `reminderSettings`: enabled, `[7, 3, 1]`, `09:00`, threshold `2`.

### 6.4 Live updates (AJAX criterion)

- `ActivityService.live$()`: `timer(0, 10_000)` + manual `refresh$` Subject → `switchMap` to fetch activities + active registrations → map to `ActivityView[]`. `shareReplay({ bufferSize: 1, refCount: true })`.
- After any mutation, the service calls `refresh()` so every subscribed view updates without reload.
- Check-ins page polls every 5 s. Notification bell polls every 15 s.
- Demo trick for the video: two browser windows (Priya + Daniel). Priya takes the last slot of activity B; Daniel's window flips B to **Full** within 10 s without reload.

### 6.5 HTTP interceptors (`core/interceptors/`)

- `LatencyInterceptor`: adds 250–600 ms random delay in development so skeletons are visible. Configurable via `environment.mockLatency`.
- `ErrorInterceptor`: maps network/HTTP errors to a friendly toast ("Can't reach the Service Day server. Is `npm run api` running?") and rethrows.
- (Assignment 2) `AuthInterceptor` placeholder file with a TODO comment, not registered yet.

---

## 7. Architecture

### 7.1 Module graph

```
AppModule
 ├─ CoreModule        (once) services, guards, interceptors, HttpClient providers
 ├─ LayoutModule      AppShell, Sidebar, Topbar, NotificationBell, NotFound
 └─ AppRoutingModule  lazy → AuthModule | EmployeeModule | AdminModule
                                   └── each imports SharedModule
SharedModule  exports CommonModule, ReactiveFormsModule, RouterModule, the @lucide/angular icons in use,
              shared components, pipes
```

### 7.2 Folder structure

```
webtech-service-day/
├─ CLAUDE.md · PRODUCT.md · DESIGN.md · README.md
├─ docs/  PLAN.md PROMPTS.md PROGRESS.md SETUP.md USER-MANUAL.md REPORT-NOTES.md VIDEO-SCRIPT.md
│  └─ reference/dashboard-reference.png
├─ mock-api/  seed.mjs   db.json (generated, git-ignored)
└─ src/
   ├─ environments/  environment.ts  environment.development.ts   (apiUrl, mockLatency, publicAppUrl)
   ├─ styles/  tokens.css  base.css  layout.css  utilities.css
   ├─ styles.css            (imports the four files + font)
   └─ app/
      ├─ app.module.ts · app-routing.module.ts · root component
      ├─ core/
      │  ├─ core.module.ts
      │  ├─ models/        user · session · ngo · activity · registration · notification · reminder-settings · index
      │  ├─ rules/         availability.rules.ts (+ .spec) · check-in.rules.ts (+ .spec)
      │  ├─ services/      api-url · clock · auth · user · ngo · activity · registration · notification
      │  │                 reminder-settings · check-in · participation-stats · toast · theme (Phase 10)
      │  ├─ guards/        auth · guest · role
      │  └─ interceptors/  latency · error · auth (placeholder)
      ├─ shared/
      │  ├─ shared.module.ts
      │  ├─ components/    page-header · kpi-card · status-pill · slot-meter · activity-card · empty-state
      │  │                 skeleton · confirm-dialog · toast-stack · avatar · search-field · pill-filter
      │  │                 drawer · tabs · gauge
      │  └─ pipes/         cutoff-label · relative-time · initials · availability-label
      ├─ layout/
      │  ├─ layout.module.ts
      │  └─ app-shell · sidebar · topbar · notification-bell · not-found
      └─ features/
         ├─ auth/      auth.module · auth-routing.module · login · register · auth-layout
         ├─ employee/  employee.module · employee-routing.module · home · opportunities · activity-detail
         │             my-registrations · inbox · check-in
         ├─ admin/     admin.module · admin-routing.module · overview · activities-list · activity-form
         │             activity-admin-detail · ngos · participation · notifications-center
         │             (schedule-tab · broadcast-tab · history-tab) · check-ins
         └─ dev/       dev.module · styleguide (route /styleguide, not linked in nav)
```

Follow whatever file-naming convention Angular CLI 22 generates (it may omit the `.component` suffix); stay consistent.

### 7.3 Services (responsibility, one line each)

| Service | Responsibility |
|---|---|
| `ApiUrlService` | Builds URLs from `environment.apiUrl` |
| `ClockService` | `now()` — the only place `new Date()` is called for rules |
| `AuthService` | login, register, logout, `session$`, `currentUser`, role checks, localStorage |
| `UserService` | users CRUD, employees list, email uniqueness |
| `NgoService` | NGOs CRUD |
| `ActivityService` | activities CRUD, `live$()`, `getView(id)`, refresh |
| `RegistrationService` | register / switch / withdraw with overbooking guard, my registrations, history |
| `NotificationService` | create system notices, broadcast expansion, inbox, unread count, mark read |
| `ReminderSettingsService` | get / save settings, upcoming reminder preview |
| `CheckInService` | generate code, resolve code → activity, check in, live arrivals, CSV export |
| `ParticipationStatsService` | KPI and chart data for Overview and Participation |
| `ToastService` | success / error / info toasts |

### 7.4 Guards

- `authGuard` → no session → `/login?returnUrl=…`
- `guestGuard` → signed in → role home
- `roleGuard(role)` → wrong role → own home with an info toast

---

## 8. Design system (Option A — warm terracotta)

Final values are owned by `DESIGN.md` after `/impeccable init`; start from these.

### 8.1 Color tokens (light)

| Token | Value | Use |
|---|---|---|
| `--canvas` | `#F4F3F1` | App background |
| `--surface` | `#FFFFFF` | Cards, sidebar, top bar |
| `--surface-sunken` | `#F7F6F4` | Inputs, table header, inner tiles |
| `--hairline` | `#ECEAE6` | Dividers only |
| `--ink` | `#1C1B19` | Primary text |
| `--ink-muted` | `#6B6965` | Secondary text, labels |
| `--ink-faint` | `#9C9A95` | Placeholders, axis labels |
| `--accent` | `#E8692C` | Charts, icons, active marker, KPI accents (large marks only) |
| `--accent-strong` | `#B9501A` | Primary button bg, links, accent text (≥ 4.5:1 on white) |
| `--accent-soft` | `#FDEDE4` | Active nav bg, icon tiles, selected pill |
| `--success` / `--success-soft` | `#1E8E50` / `#E5F4EA` | Open, checked in, positive delta |
| `--warning` / `--warning-soft` | `#A76A00` / `#FBF1DC` | Closing soon, last slots |
| `--danger` / `--danger-soft` | `#C8372D` / `#FBE9E7` | Full, closed, destructive |
| `--info` / `--info-soft` | `#2F5FC4` / `#E8EFFB` | Neutral info, draft |

Status pill mapping: open → success, last-slots → warning, closing-soon → warning, full → danger, closed → neutral (ink-muted on sunken), cancelled → danger outline, draft → info.

### 8.2 Type (Instrument Sans Variable)

| Token | Size / line-height / weight | Use |
|---|---|---|
| `--text-kpi` | 40 / 44 / 500 | KPI numbers |
| `--text-h1` | 28 / 34 / 500 | Page greeting |
| `--text-h2` | 20 / 28 / 500 | Card titles |
| `--text-h3` | 16 / 24 / 500 | Sub-sections, table titles |
| `--text-body` | 15 / 22 / 400 | Default |
| `--text-small` | 13 / 18 / 400 | Labels, meta, captions |
| `--text-micro` | 12 / 16 / 500 | Pills, deltas |

Letter-spacing: −0.01em on h1/kpi only. Numbers tabular. No uppercase labels; sentence case everywhere.

### 8.3 Shape, space, elevation, motion

- Radius: `--radius-card 20px`, `--radius-tile 14px`, `--radius-control 999px` (pills, search, buttons), `--radius-input 12px`.
- Spacing scale (4-based): 4, 8, 12, 16, 20, 24, 32, 40, 56.
- Card padding 24 (20 on mobile); gap between cards 20 (16 on mobile).
- Elevation: none by default. Only overlays (drawer, dialog, dropdown) get `0 12px 32px rgb(28 27 25 / 0.10)`.
- Motion: 150–200 ms ease-out for hover/press/open; respect `prefers-reduced-motion`.

### 8.4 Layout (Flexbox)

- Shell: `display:flex` row → sidebar (264 px, sticky, own white card with 20 px radius inset 16 px from viewport like the reference) + main column (`flex:1`, column flex: topbar card, then content).
- Top bar: greeting block (h1 + small subtitle) left; right side: notification bell + profile chip (initials avatar, name, role) inside pill groups.
- KPI row: flex-wrap, each card `flex: 1 1 220px`.
- Two-column sections: `flex: 2 1 560px` + `flex: 1 1 320px`.
- Sidebar: logo (wordmark "Service Day" + "by Halden & Co." small), nav items with line icons, active item = accent-soft bg + 3 px accent bar on the left; bottom group: Help (opens a small "How Service Day works" dialog) and Sign out in accent-strong.
- < 900 px: sidebar → off-canvas drawer from a menu button in the top bar; < 600 px: tables → stacked rows, filters → horizontal scroll pills inside their own container (page itself never scrolls sideways).

### 8.5 Signature details (what makes it feel designed, not generated)

- **Slot meter**: a thin segmented bar (one segment per slot up to 20, continuous above) + "3 of 12 left" in tabular numbers. Last slots turn warning; full turns danger.
- **Cut-off label**: relative and absolute together — "Closes in 2 days · 18 Nov, 17:00"; after cut-off — "Closed 18 Nov, 17:00".
- **Participation gauge** on Admin Overview: semicircle built from short rounded bars (inspired by, not copied from, the reference) showing staff participation %, with "This week vs last week" tiles below.
- Initials avatars for NGOs on a soft tint chosen deterministically from the NGO id (from a fixed set of 6 soft tints), so cards are distinguishable without stock images.
- Copy is specific and human: empty states tell the user what to do next ("No activities match 'Elderly Care' on this date. Clear the date filter to see 3 more.").

### 8.6 Icons

`@lucide/angular` (official successor of `lucide-angular`, which only supports Angular ≤ 21), stroke 1.75, size 18 in nav and buttons, 20 in KPI tiles. Its icons are standalone components: import only the icons used into SharedModule's `imports` and re-export them (tree-shakable). Check the package's current API at lucide.dev before Phase 1.

### 8.7 Charts

`chart.js` via `ng2-charts`. If ng2-charts is not compatible with Angular 22, wrap `chart.js` directly in a small `ChartComponent` in SharedModule and log the decision. Colors come from tokens (read with `getComputedStyle`). Bars: taken = `--accent`, remaining capacity = `--surface-sunken`. No 3D, no gradients, gridlines in `--hairline`, legends only when > 1 series.

---

## 9. Packages and justification (feeds the report)

| Package | Why it is here | Rubric link |
|---|---|---|
| `@angular/*` (CLI 22) | SPA framework with components, DI, routing, HttpClient, NgModules | MVC, Modules |
| `rxjs` | Async streams for HTTP, polling, refresh | AJAX |
| `json-server` | Real REST endpoints (GET/POST/PUT/PATCH/DELETE) over a JSON file, so the front-end uses genuine HTTP calls and switches to Express in A2 by changing one URL | AJAX, Modules |
| `concurrently` | Run mock API and dev server with one command | Modules (dev tooling) |
| `@lucide/angular` | Consistent thin line icons matching the visual direction; tree-shakable per-icon imports | Front-end, Modules |
| `chart.js` + `ng2-charts` (+ `@angular/cdk` peer) | Participation and fill-rate charts for UC4 | Front-end, Modules |
| `date-fns` | Reliable cut-off and countdown calculations and formatting | Client-side logic |
| `angularx-qrcode` | Generate check-in QR codes for UC6 in the browser | Modules |
| `@fontsource-variable/instrument-sans` | Self-hosted font, works offline during demo, no third-party request | Front-end |

---

## 10. Rubric mapping (what the marker must be able to see)

| Criterion | Marks | Evidence in the app | Evidence in the report / video |
|---|---|---|---|
| Client/Server tech — MVC | 20 | `core/models` (Model), templates (View), lean components (Controller), services + rules | Diagram of MVC mapping, folder tree, one walk-through (Register flow) |
| Front-end design | 34 | Semantic HTML, tokens, box model (card padding/margins/gaps), Flexbox on every layout, responsive at 4 widths, accessible states | Screenshots at desktop + mobile, CSS snippets for box model and Flexbox |
| AJAX | 23 | HttpClient GET/POST/PUT/PATCH/DELETE, live polling, no reloads, slot + cut-off logic, overbooking guard, latency + error interceptors | Network tab screenshot, two-window "last slot" demo |
| Modules & packages | 23 | Core / Shared / Layout / 3 lazy feature modules, NPM packages above, clean exports | Module graph, `package.json` table with justification |
| Penalties to avoid | — | — | Video present, all 4 items in zip, on time |

---

## 11. Demo scenarios (for testing and the video)

1. **Register** (Priya): Opportunities → filter "Education" → Reading Buddies (1 left) → Register → toast + inbox notice → slot meter shows Full.
2. **Live update** (Daniel, second window): Reading Buddies flips to Full without reload.
3. **Switch** (Daniel): from Pack & Deliver to Lunch Service (closing soon) → old registration shows "Switched".
4. **Locked** (Aisha): Kennel Refresh Day → Switch/Withdraw disabled with "Changes closed on … 17:00".
5. **Withdraw** (Daniel): withdraw before cut-off → slot returned.
6. **Admin CRUD** (Nadia): create activity as draft → publish → appears for employees; edit max slots below taken → validation message.
7. **Monitor**: Overview KPIs and charts; Participation → select unregistered staff → Send reminder → shows in their inbox.
8. **Notifications**: Schedule tab change offsets → preview updates; Broadcast urgent "last slots" to all staff.
9. **Check-in**: Admin opens Memory Lane Afternoon → QR → Marcus opens the link / enters code → arrival appears in admin list within 5 s → export CSV.
10. **Register account**: new employee signs up with `@halden.co` email → lands on Home.

---

## 12. Timeline

| Dates (Nov 2026) | Phases |
|---|---|
| 6–7 | 0 Bootstrap · 1 Design system & shell |
| 8–9 | 2 Data layer · 3 Auth |
| 10–13 | 4 Employee browse · 5 Employee registration |
| 14–17 | 6 Admin activities & NGOs · 7 Monitoring & notifications |
| 18–19 | 8 QR check-in |
| 20–22 | 9 Quality pass · 10 Dark mode |
| 23–26 | 11 Docs (setup, manual, report notes, video script) |
| 27–29 | Write report, record video, Turnitin |
| 30 | 12 Final check & submit (1 day buffer) |
