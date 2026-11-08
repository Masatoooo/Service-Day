# Service Day — Report Notes (draft material)

Draft material for the BIT306 Web Technologies Assignment 1 report. Every statement below refers to the code in this repository; file paths are relative to the project root. Text in square brackets marked **[ADD …]** or **[COMPLETE …]** must be completed by the author before submission.

Contents: 1. Technologies, frameworks and libraries · 2. MVC architecture · 3. Front-end design evidence · 4. AJAX evidence · 5. Modules and packages evidence · 6. Quality assurance · 7. Rubric cross-reference · 8. Use of generative AI

---

## 1. Technologies, frameworks and libraries

Versions are those installed from `package.json` and recorded in `package-lock.json`.

| Package | Version | Role in Service Day | Rubric link |
|---|---|---|---|
| Angular (`@angular/core`, `common`, `router`, `forms`, `platform-browser`) | 22.2 (CLI 22.2.6) | Single-page application framework: components, NgModules, dependency injection, router, reactive forms, `HttpClient` | MVC, Modules |
| RxJS | 7.8.2 | Observable streams for HTTP results, polling, refresh and derived view models | AJAX |
| TypeScript | 6.0.3 | Typed models (`src/app/core/models/`), compile-time checks | MVC |
| json-server | 1.0.0-beta.15 | Mock REST API over `mock-api/db.json` | AJAX, Modules |
| concurrently | 10.0.6 | Runs the mock API and the dev server with one command (`npm run dev`) | Modules (tooling) |
| `@lucide/angular` | 1.70.0 | Line icon set, imported icon by icon | Front-end, Modules |
| chart.js + ng2-charts (+ `@angular/cdk` peer) | 4.6.1 / 11.0.0 / 22.2.6 | "Fill by NGO" bar chart on the admin Overview | Front-end, Modules |
| date-fns | 4.4.0 | Cut-off, countdown and date formatting in rules and pipes | Client-side logic |
| angularx-qrcode | 22.0.1 | Generates check-in QR codes in the browser | Modules |
| `@fontsource-variable/instrument-sans` | 5.3.0 | Self-hosted variable font (no third-party font request) | Front-end |
| Vitest + jsdom | 5.1.0 / 30.0.0 | Unit tests for rules, filters, validators and presets (73 tests) | Quality |

### 1.1 Justification

**Angular.** Angular provides, in one framework, the features the assignment asks to demonstrate: a component model that separates templates (view) from classes (controller), dependency-injected services for data access, a router with lazy-loaded feature modules, reactive forms with synchronous and asynchronous validators, and `HttpClient` for REST calls. The project deliberately uses the **NgModule** architecture (`ng new --standalone=false`) rather than standalone components, so that the module structure required by the "Modules and packages" criterion is explicit in the code (§5). Official documentation: <https://angular.dev>. [ADD SCHOLARLY SOURCE: component-based single-page application frameworks / Angular]

**RxJS.** Every service method returns an `Observable`. Polling (`timer`), manual refresh (`Subject`), cancellation of outdated requests (`switchMap`) and sharing one request between several views (`shareReplay`) are expressed as stream operators instead of manual timers and callbacks (§4.2). Official documentation: <https://rxjs.dev>. [ADD SCHOLARLY SOURCE: reactive programming / observables for asynchronous UI]

**TypeScript.** Interfaces for `Activity`, `Registration`, `AppNotification` and the other entities (`src/app/core/models/`) form the typed Model layer; the compiler rejects a template or service that uses a field that does not exist. The code contains no `any` types. Official documentation: <https://www.typescriptlang.org/docs/>.

**json-server.** Assignment 1 is front-end only, but the AJAX criterion requires real asynchronous HTTP. json-server exposes `mock-api/db.json` as a REST API with GET, POST, PUT, PATCH and DELETE, filtering by query parameters (`?activityId=…&status=registered`) and generated ids. The front-end therefore uses genuine HTTP requests that will be pointed at the Express API in Assignment 2 by changing `environment.apiUrl` only. Official documentation: <https://github.com/typicode/json-server>.

**concurrently.** Starts the API and the Angular dev server together and stops both on Ctrl+C (`dev` script in `package.json`). Documentation: <https://github.com/open-cli-tools/concurrently>.

**@lucide/angular.** A consistent family of thin line icons matching the visual direction. Only the 41 icons listed in `src/app/shared/icons.ts` are registered, so unused icons are removed from the bundle by tree-shaking. The package is the official Angular 22 successor of `lucide-angular`, whose peer dependencies stop at Angular 21 (decision recorded in `docs/PROGRESS.md`). Documentation: <https://lucide.dev>.

**chart.js and ng2-charts.** ng2-charts 11 wraps chart.js in an Angular directive (`BaseChartDirective`), used by `FillChart` (`src/app/features/admin/overview/fill-chart/`). Only the five chart.js pieces a horizontal bar chart needs are registered (`provideCharts` in `admin-module.ts`), and the library is part of the lazily loaded admin bundle, so employees never download it. `@angular/cdk` is installed because it is a required peer dependency of ng2-charts 11. Documentation: <https://www.chartjs.org/docs/latest/>, <https://valor-software.com/ng2-charts/>. [ADD SCHOLARLY SOURCE: data visualisation in dashboards]

**date-fns.** Small, tree-shakable date functions used by the business rules (`isSameDay`, `addMinutes`, `differenceInCalendarDays` in `src/app/core/rules/`) and by the display pipes (`cutoff-label-pipe.ts`, `relative-time-pipe.ts`). Angular's `DatePipe` was avoided because it added locale code to the initial bundle. Documentation: <https://date-fns.org>.

**angularx-qrcode.** Renders the check-in QR code on a `<canvas>` in the admin Check-ins page, which also allows exporting a printable PNG poster without a server. Documentation: <https://github.com/Cordobo/angularx-qrcode>.

**@fontsource-variable/instrument-sans.** The variable font is bundled with the application, so the interface looks the same offline during a demonstration and no request is made to a third-party font service. Documentation: <https://fontsource.org>.

**Vitest.** The default unit-test runner generated by Angular CLI 22. The tests cover the pure business rules (availability, check-in, reminders), the filter functions, the form validators and the broadcast presets (§6). Documentation: <https://vitest.dev>.

---

## 2. MVC architecture

### 2.1 Mapping

```
                 ┌─────────────────────────────────────────────────────────────┐
  VIEW           │ Component templates + component CSS (*.html, *.css)          │
  (presentation) │ e.g. features/employee/activity-detail/activity-detail.html │
                 │ shared/components/*  (slot meter, status pill, dialogs …)    │
                 │ shared/pipes/*       (cut-off label, relative time …)        │
                 └───────────────▲───────────────────────────┬─────────────────┘
                     data via async pipe /            user events (click, submit)
                     signals                                  │
                 ┌───────────────┴───────────────────────────▼─────────────────┐
  CONTROLLER     │ Component classes (*.ts) — lean: read streams, handle events,│
                 │ delegate. e.g. ActivityDetail, ActivitiesList, CheckIns      │
                 └───────────────▲───────────────────────────┬─────────────────┘
                       Observables                     method calls
                 ┌───────────────┴───────────────────────────▼─────────────────┐
  SERVICES       │ core/services/* — data access (HttpClient) and orchestration │
  (application)  │ ActivityService, RegistrationService, NotificationService …  │
                 └───────────────▲───────────────────────────┬─────────────────┘
                                 │ uses                       │ HTTP (REST)
                 ┌───────────────┴──────────────┐   ┌─────────▼─────────────────┐
  MODEL          │ core/models/*  (interfaces)  │   │ json-server (mock API)     │
                 │ core/rules/*   (pure rules)  │   │ mock-api/db.json           │
                 └──────────────────────────────┘   └───────────────────────────┘
```

| Layer | Location | Responsibility | Constraint enforced in the code |
|---|---|---|---|
| Model — data | `src/app/core/models/` (`activity.ts`, `registration.ts`, `notification.ts`, …) | TypeScript interfaces for every entity and view model | No logic |
| Model — rules | `src/app/core/rules/` (`availability.rules.ts`, `check-in.rules.ts`, `reminder.rules.ts`) | Pure functions: availability, can register / switch / withdraw, admin edit validation, check-in window, reminder preview | Take `now: Date` as a parameter; never touch HTTP or the DOM; 51 unit tests |
| Services | `src/app/core/services/` | All HTTP access and the orchestration of business operations | Components never inject `HttpClient`; every URL comes from `ApiUrlService` and `environment.apiUrl` |
| Controller | component classes, e.g. `features/employee/activity-detail/activity-detail.ts` | Read Observables, react to events, call services | Under 120 lines each; manual subscriptions use `takeUntilDestroyed` |
| View | component templates and CSS | Presentation only | No business rules, date maths or filtering in templates; values come prepared from the controller or a pipe |

**Single source of truth.** The number of places taken is never stored on an activity: it is derived from registrations with status `registered` in `ActivityService.toViews()` (`src/app/core/services/activity-service.ts`), so it cannot drift.

### 2.2 Walk-through: an employee registers for an activity

1. **View.** On the activity page, `activity-detail.html` shows the **Register** button only when the rule result `s.register.ok` is true; otherwise it shows a disabled button and the rule's sentence (`aria-describedby="action-reason"`). Clicking it calls `pending.set('register')`, which opens `<app-confirm-dialog>` with text prepared by `RegistrationFlow.copy()`.
2. **Controller.** Confirming calls `ActivityDetail.confirm()` (`activity-detail.ts`). It ignores a second click while busy, sets `busy` (the button shows "Working…"), and delegates to `RegistrationFlow.run('register', view)` (`features/employee/registration-flow.ts`), which calls the service and turns the result into a toast.
3. **Service — overbooking guard.** `RegistrationService.register()` (`core/services/registration-service.ts`) first calls `guard()`, which fetches a fresh snapshot of activities, registrations and settings with `ActivityService.snapshotOnce()` (four parallel GET requests via `forkJoin`) instead of trusting the possibly 10-second-old data on screen.
4. **Model — rules.** It re-runs `canRegister(activity, taken, now, hasActiveRegistration)` (`core/rules/availability.rules.ts`). The rule returns `{ ok: false, code, reason }` for a cancelled, unpublished, closed or full activity, or when the employee already holds a place; the service converts a refusal into a `RuleViolationError` whose message is the human sentence ("Someone just took the last slot. The list has been refreshed." for a place taken meanwhile).
5. **HTTP.** If the rule allows it, `create()` sends `POST /registrations` with `{ userId, activityId, status: 'registered', registeredAt, updatedAt, checkedInAt: null }`, then `NotificationService.notifyRegistered()` sends `POST /notifications` with a specific confirmation ("You're in: Little Readers Library — Reading Buddies, Sun 22 Nov, 09:00.").
6. **Refresh.** `finalize(() => this.activities.refresh())` pushes a value into `ActivityService`'s `refresh$` Subject. The shared `snapshot$` stream restarts its timer and reloads, so every subscribed view — the detail page's slot meter, the Opportunities list, Home, the admin Overview in another browser — updates without a page reload. Other users' views pick the change up on their next 10-second poll.

---

## 3. Front-end design evidence

### 3.1 Flexbox

Every layout uses Flexbox; the stylesheets contain 215 `display: flex` / `inline-flex` declarations and no CSS Grid (`grep "display: grid" src` returns nothing).

- **Application shell** (`src/app/layout/app-shell/app-shell.css`): a flex row of the sticky sidebar and the main column.

```css
.shell { display: flex; align-items: flex-start; gap: var(--shell-inset); min-height: 100dvh; padding: var(--shell-inset); }
.shell__sidebar { position: sticky; top: var(--shell-inset); flex: 0 0 var(--sidebar-width); }
.shell__main { display: flex; flex: 1; flex-direction: column; gap: var(--card-gap); min-width: 0; }
```

- **Reusable layout primitives** (`src/styles/layout.css`): `.stack` (column), `.cluster` (wrapping row), `.split`, and `.card-row`, a wrapping card collection whose children grow from a basis:

```css
.card-row { display: flex; flex-wrap: wrap; gap: var(--card-gap); }
.card-row > .kpi-slot { flex: 1 1 220px; min-width: 0; }   /* 4 → 2 → 1 KPI cards */
.card-row > .col-main { flex: 2 1 560px; min-width: 0; }   /* wide column */
.card-row > .col-side { flex: 1 1 320px; min-width: 0; }   /* narrow column */
```

- **Slot meter** (`src/app/shared/components/slot-meter/slot-meter.css`): one equal flex item per slot.

```css
.meter__track { display: flex; gap: 3px; height: 8px; }
.meter__segment { flex: 1; border-radius: var(--radius-control); }
```

- **Admin activities table** (`src/app/features/admin/activities-list/activities-list.css`): below an 880 px card width each table row becomes a two-line flex row; an empty full-width `::after` item forces the line break.

```css
@container activities (max-width: 880px) {
  .data-table tr { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2) var(--space-4); }
  .data-table tr::after { content: ''; order: 4; flex-basis: 100%; }
}
```

### 3.2 Box model

Spacing follows a single rule: padding inside a component, `gap` between components, no outer margins on cards (comments in the CSS name the concept).

```css
/* src/styles/layout.css — Box model: padding inside the card,
   gap between cards comes from the parent's flex gap, so cards carry no margin. */
.surface-card { background: var(--surface); border-radius: var(--radius-card); padding: var(--card-padding); }

/* src/styles/base.css — Box model: horizontal padding gives the pill its width; no fixed width. */
.btn { min-height: var(--control-height); padding: 0 var(--space-5); border-radius: var(--radius-control); }

/* src/styles/base.css — a 1px border with 3:1 contrast marks the field's edge (WCAG 1.4.11). */
.input { min-height: var(--control-height); padding: 0 var(--space-4); border: var(--border-width) solid var(--control-border); }
```

All measurements come from the 4-px spacing scale and other tokens in `src/styles/tokens.css` (`--space-1` … `--space-9`, `--card-padding` 24 px, 20 px on phones). Component CSS contains no hex colours, font sizes or radii.

### 3.3 Semantic HTML and accessibility

Element counts across the application templates (excluding the developer style guide): `section` 54, `label` 49, `header` 22, `ul` 21, `table` 8 (with `caption`), `aside` 7, `fieldset`/`legend` 6, `article` 5, `footer` 5, `nav` 4, `main` 3 (one per page), native `dialog` 2.

- One `h1` per page (the top bar, `layout/topbar/topbar.html`); card titles are `h2`, sections inside cards `h3`.
- Landmarks: `aside` for the sidebar (named "Sidebar"), `nav` for the main menu and "back" links, `main` with a working **Skip to content** link (`shared/directives/skip-link.ts`).
- Every input has a `<label>`; errors are linked with `aria-describedby` and focus moves to the first invalid field.
- Dialogs and drawers use the native `<dialog>` with `showModal()`; Tab is kept inside (`shared/focus-wrap.ts`), Escape closes them and focus returns to the trigger. Menus use the Popover API with arrow-key navigation (`shared/components/menu-button/`).
- Toasts are announced with `aria-live="polite"`; charts have a visually hidden data table.
- Colour contrast: every text token meets 4.5:1 (WCAG 2.2 AA); form-field edges meet 3:1.
- An automated audit with axe-core (WCAG 2.2 A/AA rules) on 21 routes at four widths reported 0 violations (§6).

### 3.4 Responsive design

| Breakpoint | Where | Change |
|---|---|---|
| ≤ 1279 px | `features/employee/opportunities/opportunities.css` | Activity cards from three to two per row |
| ≤ 899 px | `layout/app-shell/app-shell.css`, `layout/topbar/topbar.css` | Sidebar becomes an off-canvas drawer opened from the menu button |
| ≤ 880 px card width (container query) | `features/admin/activities-list/activities-list.css` | Table rows become two-line flex rows |
| ≤ 599 px | `styles/tokens.css`, `styles/layout.css` and 11 component files | Tighter padding and gaps, tables become stacked rows (label left, value right), filter pills scroll inside their own row, 16 px text in form fields |
| `prefers-reduced-motion` | `styles/base.css` and 4 components | Transitions become instant |

All routes were checked at 1440, 1024, 768 and 390 px with no horizontal page scroll (§6). [ADD screenshots: desktop + phone, e.g. `docs/screenshots/employee-home.png` and `mobile-home.png`]

### 3.5 Visual design system

`DESIGN.md` documents the design system ("Morning of Service Day"): a warm light-grey canvas, white cards with 20 px corners, flat at rest, a single terracotta accent used for large marks only, the Instrument Sans typeface at three weights, and signature components (segmented slot meter, relative + absolute cut-off label, bar-built participation gauge, deterministic initials avatars). The tokens are defined once in `src/styles/tokens.css`. [ADD SCHOLARLY SOURCE: visual hierarchy / dashboard design or usability heuristics]

---

## 4. AJAX evidence

### 4.1 HTTP calls by method

All requests are made with Angular `HttpClient` inside `src/app/core/services/`; URLs are built by `ApiUrlService.url()` from `environment.apiUrl`.

| Method | Endpoint | Service · method | Purpose |
|---|---|---|---|
| GET | `/activities` | `ActivityService.list()` | All activities (live snapshot) |
| GET | `/activities/:id` | `ActivityService.get()` | One activity (check-in arrivals) |
| GET | `/activities?checkInCode=` | `CheckInService.resolve()` | Code → activity |
| POST | `/activities` | `ActivityService.create()` | Create an activity |
| PATCH | `/activities/:id` | `ActivityService.update()` | Edit, publish/unpublish, cancel, set check-in code |
| DELETE | `/activities/:id` | `ActivityService.delete()` | Delete (only without registrations) |
| GET | `/ngos`, `/ngos/:id` | `NgoService.list()`, `get()` | NGOs |
| POST | `/ngos` | `NgoService.create()` | Add an NGO |
| PUT | `/ngos/:id` | `NgoService.update()` | Replace an NGO |
| DELETE | `/ngos/:id` | `NgoService.delete()` | Delete (only without activities) |
| GET | `/registrations?status=registered` | `ActivityService.snapshotOnce()` | Places taken (slot counts) |
| GET | `/registrations?userId=` | `RegistrationService.forUser()` | An employee's history |
| GET | `/registrations?activityId=&status=registered` | `RegistrationService.forActivity()`, `ActivityAdminService.takenCount()` | Participants; async "max slots ≥ taken" validator |
| POST | `/registrations` | `RegistrationService.create()` | Register / switch (new place) |
| PATCH | `/registrations/:id` | `RegistrationService.setStatus()`, `CheckInService.checkIn()` | Switched / withdrawn; `checkedInAt` |
| GET | `/users?email=` | `UserService.findByEmail()` | Sign-in; async "email already taken" validator |
| GET | `/users?role=employee`, `/users?role=admin` | `UserService.employees()`, `NotificationService.historyLive$()` | Staff lists; sender names |
| POST | `/users` | `UserService.create()` | Self-registration |
| GET | `/notifications`, `?recipientId=`, `?audience=all-staff` | `NotificationService.inbox()`, `historyLive$()` | Inbox (two requests merged), history |
| POST | `/notifications` | `NotificationService.create()`, `broadcast()` | System notices, broadcasts, per-user copies |
| PATCH | `/notifications/:id` | `NotificationService.markRead()` | `readBy` |
| GET / PUT | `/reminderSettings` | `ReminderSettingsService.get()`, `save()` | Singular resource |

### 4.2 Live updates without reloading

- **Polling.** `ActivityService.snapshot$` (`core/services/activity-service.ts`) re-fetches activities, NGOs, registrations and settings every **10 s** with `timer(0, POLL_MS)` and `switchMap`, and shares one request between all views with `shareReplay({ bufferSize: 1, refCount: true })`. The inbox and the notification bell share one **15 s** poll (`NotificationService.inboxView$`), and the admin arrivals list polls every **5 s** (`CheckInService.arrivals$`).
- **Refresh after every mutation.** Services call `refresh()` after each write (`tap`/`finalize`), which restarts the poll immediately, so the changed data appears at once on the page that made the change.
- **Demonstration.** With two browser windows (Priya and Daniel), Priya takes the last place on *Reading Buddies*; Daniel's window switches the activity to **Full** within 10 seconds without reloading (verified in testing, see `docs/PROGRESS.md`, Phase 5).
- **Failures do not stop polling.** A failed poll is skipped and the next one retries; pages show an error state while the server is down and recover by themselves (tested by stopping json-server, §6).

### 4.3 Interceptors (`src/app/core/interceptors/`)

- `LatencyInterceptor` delays each request by a random 250–600 ms in development (`environment.mockLatency`) so loading skeletons are visible; 0 in production.
- `ErrorInterceptor` (registered first, so it is outermost) adds a 15-second timeout, turns network and HTTP errors into specific messages ("Can't reach the Service Day server. Is `npm run api` running?", 404, 409, 429, 5xx …), shows each message at most once per 10 seconds, and rethrows so the page can show its own error state.
- `AuthInterceptor` is a documented placeholder for Assignment 2 and is not registered.

### 4.4 Client-side business logic over AJAX

- **Slot and cut-off rules** (`core/rules/availability.rules.ts`): availability (open, last slots, closing soon, full, closed, cancelled, draft), one active place per employee, changes only before the cut-off.
- **Overbooking guard** (`RegistrationService.guard()`): fresh data is fetched and the rule re-checked immediately before every write (§2.2). In Assignment 2 the same check moves to the server, which can make it atomic.
- **System notices**: each register, switch, withdraw, edit and cancellation creates a specific notice (`NotificationService.notify…`, `ActivityAdminService.save()` / `cancel()`).
- **Asynchronous validators**: email availability on sign-up (`core/validators/account-validators.ts`, debounced 400 ms) and "max slots cannot go below the people already registered" (`core/validators/activity-validators.ts`).

---

## 5. Modules and packages evidence

### 5.1 Module graph

```
AppModule  (src/app/app-module.ts, bootstraps App)
 ├─ BrowserModule
 ├─ CoreModule        once: HttpClient + interceptors; throws if imported twice
 ├─ SharedModule      reusable UI, pipes, directive, icons
 ├─ LayoutModule      AppShell, Sidebar, Topbar, NotificationBell, NotFound
 └─ AppRoutingModule  RouterModule.forRoot(routes)
       ├─ ''          → AuthModule      (lazy)  /login, /register
       ├─ 'app'       → EmployeeModule  (lazy)  authGuard + roleGuard('employee')
       ├─ 'admin'     → AdminModule     (lazy)  authGuard + roleGuard('admin')
       ├─ 'styleguide'→ DevModule       (lazy, developer page, not linked)
       └─ '**'        → NotFound
EmployeeModule / AdminModule → AreaShellModule (routed shell) → LayoutModule
```

### 5.2 What each module declares, imports and exports

| Module | Declares | Imports | Exports / provides |
|---|---|---|---|
| `AppModule` (`app-module.ts`) | `App` | `BrowserModule`, `CoreModule`, `SharedModule`, `LayoutModule`, `AppRoutingModule` | Bootstraps `App`; global error listeners, zone change detection |
| `CoreModule` (`core/core-module.ts`) | — | — | `provideHttpClient(withInterceptorsFromDi())`, `ErrorInterceptor`, `LatencyInterceptor`; constructor with `@Optional() @SkipSelf()` throws if re-imported. Services use `providedIn: 'root'` |
| `SharedModule` (`shared/shared-module.ts`) | 17 components (page header, KPI card, status pill, slot meter, activity card, empty state, skeleton, confirm dialog, toast stack, avatar, search field, pill filter, drawer, tabs, gauge, menu button, notice item), 5 pipes, `SkipLink` directive | `CommonModule`, `RouterModule`, `LucideDynamicIcon` | Re-exports all of these; provides the 41 registered icons and the icon defaults |
| `LayoutModule` (`layout/layout-module.ts`) | `AppShell`, `Sidebar`, `Topbar`, `NotificationBell`, `NotFound` | `SharedModule` | `AppShell`, `NotFound` |
| `AreaShellModule` (`layout/area-shell/area-shell-module.ts`) | `AreaShell` | `SharedModule`, `LayoutModule` | `AreaShell` (the routed parent of `/app` and `/admin`) |
| `AuthModule` (`features/auth/auth-module.ts`) | `AuthLayout`, `Login`, `Register` | `SharedModule`, `ReactiveFormsModule`, `AuthRoutingModule` | — |
| `EmployeeModule` (`features/employee/employee-module.ts`) | `EmployeeHome`, `Opportunities`, `ActivityDetail`, `MyRegistrations`, `Inbox`, `CheckIn` | `SharedModule`, `AreaShellModule`, `EmployeeRoutingModule` | Provides `RegistrationFlow` (one instance for the employee pages) |
| `AdminModule` (`features/admin/admin-module.ts`) | `AdminOverview`, `FillChart`, `ActivitiesList`, `ActivityForm`, `ActivityAdminDetail`, `Ngos`, `Participation`, `NotificationsCenter`, `ScheduleTab`, `BroadcastTab`, `HistoryTab`, `CheckIns` | `SharedModule`, `ReactiveFormsModule`, `AreaShellModule`, `AdminRoutingModule`, `BaseChartDirective` (ng2-charts), `QRCodeComponent` (angularx-qrcode) | Provides chart.js with only the bar-chart registerables |
| `DevModule` (`features/dev/dev-module.ts`) | `Styleguide`, `ApiCheck` | `SharedModule`, `LayoutModule`, `DevRoutingModule` | — |

Third-party standalone components (`LucideDynamicIcon`, `BaseChartDirective`, `QRCodeComponent`) are added to an NgModule's `imports`, which is how NgModule applications consume them.

### 5.3 Lazy loading and bundle size

Feature modules are loaded with `loadChildren: () => import(...)` in `app-routing-module.ts`. The production build (`npx ng build`) produces an initial bundle of about 592 kB (≈126 kB transferred) and separate lazy chunks: admin ≈309 kB (including chart.js and the QR library), employee ≈61 kB, auth ≈24 kB. An employee never downloads the admin code. `ReactiveFormsModule` is imported only by the two modules that have forms, which kept `@angular/forms` out of the initial bundle (≈49 kB saved; `docs/PROGRESS.md`, Phase 6).

### 5.4 npm scripts (`package.json`)

`dev` (seed if missing, then API + app via concurrently), `api`, `start`, `build`, `test`, `seed` / `db:reset`, and the LAN variants `api:lan`, `start:lan`, `dev:lan`. See `docs/SETUP.md`.

---

## 6. Quality assurance

- **Unit tests:** 73 tests in 8 files with Vitest (`npm test`): availability, check-in and reminder rules (51), opportunity filters (11), check-in options, broadcast presets, the `requiredText` validator, and the root module.
- **Scenario tests:** the ten demonstration scenarios of `docs/PLAN.md` §11 were automated with Playwright during development (results per phase in `docs/PROGRESS.md`), including the two-window live update and the overbooking guard.
- **Accessibility and responsive audit:** axe-core 4.14 (WCAG 2.2 A/AA and best-practice rules) on 21 routes for both roles at 1440, 1024, 768 and 390 px: 0 violations, no horizontal scroll, one `h1` and one `main` per page, no clipped text, no interactive target under 24 px, no console errors (Phase 9).
- **Keyboard pass:** skip link, visible focus on every tab stop, focus kept inside dialogs and returned to the trigger, menus and tabs with arrow keys (21/21 checks).
- **Resilience:** stopping and restarting json-server while the app is open (13/13 checks); long text, emoji and accented names; double-click on save buttons creates one record.

---

## 7. Rubric cross-reference

| Criterion | Marks | Evidence in the application | Section |
|---|---|---|---|
| Client/server technology — MVC | 20 | Models and pure rules in `core/models` and `core/rules`; templates as views; lean component controllers; services own HTTP | §2 |
| Front-end design | 34 | Flexbox on every layout, box-model spacing system, semantic landmarks, four verified breakpoints, WCAG 2.2 AA audit, design system in `DESIGN.md` | §3 |
| AJAX | 23 | `HttpClient` GET/POST/PUT/PATCH/DELETE, 5/10/15 s polling, refresh after every write, interceptors, slot and cut-off rules, overbooking guard | §4 |
| Modules and packages | 23 | Core/Shared/Layout/AreaShell modules, three lazy feature modules with routing modules, ten npm packages with justification | §1, §5 |

---

## 8. Use of generative AI

> **[COMPLETE THIS SECTION]** The course policy requires that use of generative AI is acknowledged and cited in APA style (in a footnote). Replace the bracketed parts with what actually happened, keep only the entries that apply, and check the format against the course's referencing guide.

**Template paragraph.** In preparing this assignment I used Anthropic's Claude Code, an AI coding assistant running the Claude Opus 5.5 model, between [start date] and [end date] 2026. I wrote the project plan, the phase-by-phase instructions and the design brief, and I reviewed, tested and revised the output. The assistant was used to [generate application code (components, services, styles and tests) from my phase prompts / draft documentation / propose fixes for defects I reported]. All generated material was checked by running the application, the automated tests and the accessibility audit, and I can explain each part of the code. Where AI-generated code or text appears in this report it is marked [AI-generated code] or [AI-generated text] and cited below.

**APA-style entries (fill in the brackets).**

- Anthropic. ([year]). *Claude Code* (Claude Opus 5.5) [Large language model]. Prompt: "[short description of the prompt, e.g. Phase 5 — registration flows: register, switch and withdraw with slot and cut-off rules]" ([date of use]). [AI-generated code]. <https://claude.com/claude-code>
- Anthropic. ([year]). *Claude Code* (Claude Opus 5.5) [Large language model]. Prompt: "[e.g. Phase 11 — documentation: setup guide, user manual and report notes]" ([date of use]). [AI-generated text]. <https://claude.com/claude-code>
- Anthropic. ([year]). *Claude Code* (Claude Opus 5.5) [Large language model]. Prompt: "[e.g. Phase 9 — accessibility audit and fixes]" ([date of use]). [AI-generated code]. <https://claude.com/claude-code>

**Footnote example.** ¹ Code in `src/app/core/services/registration-service.ts` was generated with Claude Code (Anthropic, [year]) from the author's prompt "[…]" and reviewed by the author [AI-generated code].

The commit history (`git log`) and `docs/PROMPTS.md` / `docs/PROGRESS.md` record which phase produced which files, which helps to fill in the dates and prompt descriptions accurately.
