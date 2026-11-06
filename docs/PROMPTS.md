# Service Day — Prompt Bertahap untuk Claude Code

## Cara pakai (baca sekali)

1. **Siapkan folder** `~/Documents/stikom dual degree/webtech/webtech-service-day/` dengan isi:
   ```
   CLAUDE.md
   docs/PLAN.md
   docs/PROMPTS.md
   docs/PROGRESS.md
   docs/reference/dashboard-reference.png   ← screenshot referensi desain (Shoplytic)
   ```
2. Buka Terminal:
   ```bash
   cd ~/Documents/"stikom dual degree"/webtech/webtech-service-day
   claude
   ```
3. Jalankan **satu fase per pesan**, berurutan. Copy blok prompt fase itu apa adanya.
   - Fase bertanda **[UI]**: awali pesan dengan `/impeccable ` lalu paste prompt-nya, supaya skill impeccable dipakai.
   - Fase yang berisi perintah slash (misalnya `/impeccable init`, `/impeccable audit`): ketik persis seperti tertulis.
4. Setelah setiap fase: cek di browser (`http://localhost:4200`), baru lanjut. Kalau ada yang kurang, pakai **Prompt Revisi** di bagian bawah.
5. Kalau percakapan sudah panjang, ketik `/clear` lalu mulai fase berikutnya. Konteks tetap aman karena Claude Code membaca ulang `CLAUDE.md`, `PLAN.md`, dan `PROGRESS.md`.
6. Catatan akademik: kebijakan subjek mewajibkan penggunaan AI disitasi (APA, di footnote). Fase 11 menyiapkan bagian pengungkapan itu. Pastikan kamu memahami setiap fitur karena kamu yang akan menjelaskannya di video.

---

## Phase 0 — Bootstrap

```text
Phase 0 — Bootstrap the project.

Read CLAUDE.md, docs/PLAN.md and docs/PROGRESS.md first.

1. Environment check: run `node -v`, `npm -v`, `npx ng version`, `git --version`, `gh --version` (gh is optional). Check angular.dev for: (a) the Node versions Angular 22 supports, (b) the exact `ng new` flags in v22 that give an NgModule-based app (no standalone), a routing module, plain CSS, no SSR, no zoneless surprises. Report findings in 5 lines max before continuing. If Node 26 is unsupported, stop and tell me what to install.
2. Scaffold the Angular app into THIS folder (not a subfolder), app name `service-day`. Keep CLAUDE.md and docs/ untouched. If the CLI refuses a non-empty folder, scaffold into a temporary sibling folder and move everything (including dotfiles) up, then delete the temp folder.
3. Initialise git (if not already). Extend .gitignore with: mock-api/db.json, .angular/, dist/, .DS_Store, *.log.
4. Install runtime deps: lucide-angular, chart.js, ng2-charts, date-fns, angularx-qrcode, @fontsource-variable/instrument-sans. Dev deps: json-server, concurrently. Check each is compatible with Angular 22 (peer deps). If one is not, tell me and propose the fallback from PLAN §8.7 instead of forcing installs with --force/--legacy-peer-deps.
5. Create mock-api/seed.mjs as a minimal placeholder that writes mock-api/db.json with empty collections (users, ngos, activities, registrations, notifications) and a default reminderSettings object. The full seed comes in Phase 2.
6. Add npm scripts exactly as described in PLAN §6.1 (seed, api, dev, db:reset). `dev` must seed only when db.json is missing. Use the json-server CLI flags that match the installed major version.
7. Create src/environments/environment.ts and environment.development.ts with apiUrl ('http://localhost:3000') and mockLatency ({ min: 250, max: 600 }; 0 in production). Wire fileReplacements in angular.json if the CLI did not.
8. Create src/styles/tokens.css, base.css, layout.css, utilities.css (empty with a header comment) and import them plus the Instrument Sans font from src/styles.css.
9. Replace the default app template with a single line "Service Day — bootstrap OK".
10. Create a short README.md (project name, one-line description, `npm install` + `npm run dev`; full guide comes later in docs/SETUP.md).
11. Verify: `npx ng build` passes; `npm run dev` serves the app on 4200 and `curl http://localhost:3000/users` returns []. Stop the processes afterwards.
12. GitHub: if `gh auth status` succeeds, create a PRIVATE repo named webtech-service-day and push. Otherwise print the exact commands for me to run.
13. Update docs/PROGRESS.md and commit: "chore: bootstrap Angular 22 NgModule app with json-server mock API".

Done when: build passes, dev script runs both servers, API answers, repo committed (and pushed if possible), PROGRESS.md updated.
```

---

## Phase 0b — Product & design context (impeccable)

Ketik `/impeccable init` lalu paste teks berikut di pesan yang sama:

```text
/impeccable init

Product: "Service Day" by Halden & Co. (fictional company). An internal web dashboard for the company's annual CSR Service Day. Employees browse NGO volunteering activities, register for one, switch or withdraw before a cut-off, and check in on the day with a QR code. Administrators manage NGOs and activities, monitor slot utilisation and staff participation, send reminders and broadcasts, and track check-ins.

Users: (1) Employees — office staff, 1–3 short visits per season, mostly desktop, sometimes phone on the day. Goal: find a suitable activity quickly and know exactly where they stand. (2) Administrators — CSR/People team, several sessions per week during the season, desktop. Goal: keep activities balanced, avoid overbooking, nudge people who haven't signed up.

Surface mode: Operate (working dashboard). Platform: responsive web (Angular).

Brand feel: warm, calm, competent, human. Generous but not empty. Confident numbers. No hype.

Visual reference (match taste and typography, NOT content): docs/reference/dashboard-reference.png — light warm-grey canvas, white cards with large radius, almost no borders or shadows, one warm accent used sparingly, pill-shaped controls, thin line icons, big KPI numerals, medium-weight headings, small muted labels, roomy sidebar with the sign-out link in the accent colour at the bottom.

Pinned decisions (the brief wins, keep these exact values): font Instrument Sans Variable, weights 400/500/600, tabular numbers; colour tokens, type scale, radii, spacing, elevation and motion exactly as docs/PLAN.md §8; accent #E8692C for large marks only and #B9501A for text and filled buttons; Flexbox-only layouts; plain CSS with custom properties.

Anti-references: generic AI dashboards (purple/blue gradients, glassmorphism, emoji icons, identical card grids, stock illustrations, lorem ipsum), Bootstrap admin templates, Material default look.

Write PRODUCT.md and DESIGN.md consistent with docs/PLAN.md §8 and CLAUDE.md §4. Then commit: "docs: add PRODUCT.md and DESIGN.md via impeccable init".
```

---

## Phase 1 — Design system, modules skeleton, app shell [UI]

```text
Phase 1 — Design system, module skeleton and app shell.

Read CLAUDE.md, docs/PLAN.md (§3, §7, §8), docs/PROGRESS.md, PRODUCT.md and DESIGN.md. Look at docs/reference/dashboard-reference.png.

1. Styles: fill src/styles/tokens.css (all tokens from DESIGN.md / PLAN §8, light theme only for now), base.css (modern reset, body uses --canvas and the font, :focus-visible ring using --accent-strong, prefers-reduced-motion), layout.css (flex helpers used by the shell: .stack, .cluster, .split — all Flexbox), utilities.css (.visually-hidden, .tabular).
2. Modules:
   - CoreModule with the re-import guard (constructor with @Optional() @SkipSelf()). Provide HttpClient here using the Angular 22 way that still supports DI-based class interceptors (verify on angular.dev). Add ToastService.
   - SharedModule exporting CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule.pick({...only icons used}) and these components: page-header, kpi-card, status-pill, slot-meter, empty-state, skeleton, confirm-dialog, toast-stack, avatar, search-field, pill-filter, drawer, tabs, gauge. Pipes: initials, relative-time, cutoff-label, availability-label (use date-fns). Inputs/outputs typed, no business logic inside.
   - LayoutModule: app-shell, sidebar, topbar, not-found. Sidebar nav items come from a typed config constant (employee vs admin lists from PLAN §3). Below 900px the sidebar becomes an off-canvas drawer opened from a menu button in the topbar (focus trapped, Esc closes).
3. Signature components must follow PLAN §8.5 exactly: segmented slot meter, cut-off label (relative + absolute), participation gauge made of short rounded bars, deterministic soft-tint NGO initials avatar.
4. Dev styleguide: create a lazy DevModule at /styleguide (not in the sidebar) that renders every token swatch, the type scale, and every shared component in all its states (e.g. slot meter: plenty / last slot / full; status pill: all 7 availabilities; empty state; skeleton; dialog; toast; tabs; drawer), plus the shell in both nav variants using a fake preview session.
5. Semantic HTML everywhere (header/nav/main/section/article/aside). Add short comments naming Box Model and Flexbox decisions where they matter.
6. Check the styleguide at 1440, 1024, 768 and 390 px. No horizontal scroll. Fix what you see in one batch before re-checking.
7. ng build, update PROGRESS.md, commit "feat(ui): design tokens, shared components and app shell".

Done when: /styleguide shows every token and component state, shell matches the reference's taste at desktop and collapses correctly on mobile, no hex values in component CSS, build passes.
```

---

## Phase 2 — Models, seed data, rules, services

```text
Phase 2 — Data layer and mock API.

Read CLAUDE.md, docs/PLAN.md (§4, §5, §6, §7.3), docs/PROGRESS.md.

1. Models: create core/models/* exactly as PLAN §4 (including broadcastId), with an index.ts barrel.
2. Seed: write mock-api/seed.mjs that generates db.json relative to the day it runs, implementing EVERY scenario in PLAN §6.3 and the demo accounts in PLAN §2. Use a small seeded PRNG so the output is deterministic apart from dates. Content must be realistic and specific (NGO descriptions, locations in a plausible city, activity descriptions of 2–3 sentences). Registrations must match the "taken" numbers exactly. At the end the script prints a table: activity title | date | taken/max | cut-off | expected availability.
3. Rules: core/rules/availability.rules.ts and check-in.rules.ts implementing PLAN §5 as pure functions taking `now: Date`. Write unit specs covering every availability state, can-register / can-switch / can-withdraw reasons, and check-in edge cases. Run the tests headless with the project's default test runner and make them pass.
4. Services (core/services) per PLAN §7.3: ApiUrlService, ClockService, UserService, NgoService, ActivityService (including live$() with timer + refresh$ + shareReplay, and getView(id)), RegistrationService (register / switch / withdraw with the overbooking guard and system notifications), NotificationService (create, broadcast expansion with broadcastId, inbox merge, unread count, mark read), ReminderSettingsService (get/save + upcoming preview), CheckInService (generate 8-char code from an unambiguous alphabet, resolve code, check in, live arrivals, CSV string builder), ParticipationStatsService (KPIs and chart datasets). All typed, all return Observables, no `any`.
5. Interceptors: LatencyInterceptor and ErrorInterceptor as PLAN §6.5, registered in CoreModule. Add an AuthInterceptor file with a TODO for Assignment 2 but do not register it.
6. Add an "API check" panel to /styleguide that shows counts from each service and the live availability of all activities, to prove the wiring.
7. Run `npm run db:reset` and paste the seed summary table in your reply. ng build, update PROGRESS.md, commit "feat(core): models, seed data, business rules and data services".

Done when: tests pass, seed table matches PLAN §6.3 (A–I), API check panel shows correct availabilities, components still never touch HttpClient.
```

---

## Phase 3 — Authentication [UI]

```text
Phase 3 — Login, register, session and guards.

Read CLAUDE.md, docs/PLAN.md (§2, §3 Public, §7.4), docs/PROGRESS.md, DESIGN.md.

1. AuthModule (lazy) with auth-layout (split layout: left a calm brand panel with the wordmark "Service Day — by Halden & Co." and 2–3 lines on what Service Day is, using live numbers from the API such as "9 activities from 6 NGOs this season"; right the form card). No stock images.
2. Login: reactive form, email + password, show/hide password, specific errors ("We couldn't find an account with that email" vs "That password doesn't match"), loading state on the button, collapsible "Demo accounts" panel listing the seeded accounts with a "Use" button that fills the form.
3. Register: full name, work email (custom validator: must end with @halden.co), department select, password (min 8, at least one number) + confirm (cross-field validator), and an ASYNC validator that checks email availability through UserService (debounced). Creates an employee via POST /users, signs in, goes to /app.
4. AuthService: login/register/logout, session$ (BehaviorSubject or signal) restored from localStorage on start, never stores the password. Guards: authGuard (with returnUrl), guestGuard, roleGuard(role). Root redirect by role. Sign out in the sidebar bottom (accent-strong colour). Topbar greeting "Hi, {firstName}. Welcome back." with a small role-specific subtitle.
5. Wire AppRoutingModule: /login, /register, /app (EmployeeModule placeholder home), /admin (AdminModule placeholder overview), ** not-found. Placeholder pages show the shell with a page header only.
6. Test all five demo accounts, a wrong password, a taken email, a new registration, refreshing the page while signed in, and an employee trying to open /admin. Check at 1440 and 390 px.
7. ng build, update PROGRESS.md, commit "feat(auth): login, register, session and role guards".

Done when: every check in step 6 behaves correctly with clear messages, and auth pages look like they belong to the same product as the shell.
```

---

## Phase 4 — Employee: Home, Opportunities, Activity detail [UI]

```text
Phase 4 — Employee browsing (UC2).

Read CLAUDE.md, docs/PLAN.md (§3 Employee, §5, §6.4, §8.5), docs/PROGRESS.md, DESIGN.md.

1. EmployeeModule with EmployeeRoutingModule.
2. Home (/app): greeting from the shell; "Your Service Day" card (if registered: activity, NGO, date/time, location, availability pill, cut-off label, and the action area showing allowed actions or the reason they are locked; if not registered: a clear prompt to browse with the count of open activities); compact KPI row (open activities, slots still available, days until Service Day); "Closing soon" list (next 3 by cut-off); latest 3 notifications. Hierarchy matters: the Service Day card is the hero, KPIs are secondary.
3. Opportunities (/app/opportunities): search, service-type pill filter, date filter, "Show full & closed" toggle (off by default), sort (soonest cut-off / most slots left). Activity cards in a flex-wrap list using activity-card, slot-meter, status-pill, cut-off label. Filter state kept in query params so it survives refresh. Loading skeletons, empty state with a useful next step, error state with retry.
4. Activity detail (/app/opportunities/:id): full description, schedule, location, NGO block (avatar, focus area, short description), slot meter, "How registration works" rules box (one active registration, changes allowed until cut-off), and the action area driven ONLY by the rules functions. In this phase buttons can open the confirm dialog but must not write data yet (Phase 5).
5. All data from ActivityService.live$() so counts refresh every 10 s without reload. Draft and cancelled activities are not listed; a cancelled one opened by URL shows a clear message.
6. Check at 1440, 1024, 768, 390 px; keyboard-only navigation through filters and cards.
7. ng build, update PROGRESS.md, commit "feat(employee): home, opportunities and activity detail".

Done when: scenarios A–G from PLAN §6.3 each display the correct state and message, filters work and persist in the URL, layouts hold at all four widths.
```

---

## Phase 5 — Employee: Register, Switch, Withdraw, My registrations [UI]

```text
Phase 5 — Registration flows (UC3).

Read CLAUDE.md, docs/PLAN.md (§3, §5, §6.4, §11 scenarios 1–5), docs/PROGRESS.md.

1. Wire the action area on Activity detail and Home to RegistrationService:
   - Register: confirm dialog summarising date, time, location and cut-off → loading state on the confirm button → success toast + inbox notice → views refresh.
   - Switch: on another activity's detail page show "Switch to this activity". The dialog states exactly what changes ("You'll leave Pack & Deliver Food Hampers and join Lunch Service"). 
   - Withdraw: destructive-style confirm, explains the slot will be released.
   - Overbooking guard failure: friendly message "Someone just took the last slot", refresh, keep the user on the page.
2. My registrations (/app/registrations): current registration card with actions, history list (switched / withdrawn / registered with timestamps), empty state for new users.
3. Each action creates the system notification described in PLAN §5.8 with specific wording.
4. Run demo scenarios 1–5 from PLAN §11, including the two-window live update (two separate browser profiles or one normal + one private window). Report each result.
5. ng build, update PROGRESS.md, commit "feat(employee): register, switch and withdraw with slot and cut-off rules".

Done when: all five scenarios pass, no page reload is ever needed, locked actions always explain why.
```

---

## Phase 6 — Admin: Activities and NGOs (CRUD) [UI]

```text
Phase 6 — Admin activity and NGO management (UC1).

Read CLAUDE.md, docs/PLAN.md (§3 Admin, §5.6), docs/PROGRESS.md, DESIGN.md.

1. AdminModule with AdminRoutingModule (placeholder Overview stays until Phase 7).
2. Activities list (/admin/activities): table (title, NGO, date, cut-off label, fill as small slot meter, status pill), filters (status, NGO, service type, search), row actions Edit / Publish or Unpublish / Cancel activity / Delete. Delete is blocked when there are active registrations, with the reason and a "Cancel activity instead" option. Cancel activity notifies participants. Stacked rows below 600 px.
3. Activity form (new + edit): reactive form with all fields from PLAN §4, grouped into sections (Basics, Schedule, Capacity & cut-off, Visibility). Validators: required fields, end after start, cut-off before start, maxSlots ≥ current taken (async against registrations when editing). Unsaved-changes guard. On save of a published activity that has participants, create an "activity-update" notification for them.
4. Admin activity detail (/admin/activities/:id): info, slot meter, participants table (name, department, registered at, check-in status), buttons: Edit, Notify participants (opens broadcast composer prefilled for this activity — composer itself is built in Phase 7, link to it for now), Open check-in (Phase 8 route).
5. NGOs (/admin/ngos): list with avatar, focus area, contact, verified badge, number of activities; create/edit in a right-side drawer; delete blocked when the NGO has activities (explain). Show the empty-activities NGO from the seed.
6. Run scenario 6 from PLAN §11. ng build, update PROGRESS.md, commit "feat(admin): activity and NGO management".

Done when: full CRUD works through HTTP for both resources, every validation message is specific, a newly published activity appears for employees within 10 s without reload.
```

---

## Phase 7 — Admin monitoring, notifications, employee inbox [UI]

```text
Phase 7 — Monitoring (UC4) and notifications (UC5).

Read CLAUDE.md, docs/PLAN.md (§3, §5.8–5.9, §6.2 inbox rule, §8.5, §8.7), docs/PROGRESS.md, DESIGN.md. Look at docs/reference/dashboard-reference.png again for the overview composition.

1. Admin Overview (/admin): KPI row (Slots offered, Slots taken, Slots remaining, Staff participation % — each with a small delta or context line), "Fill by NGO" bar chart (taken vs capacity, colours from tokens), participation gauge with "This week / Last week" registration tiles, "Needs attention" list (last slots, closing soon, low fill <25% with >7 days left — each with a one-click action), recent registrations table. Composition: a clear primary row and secondary rows, not a uniform grid.
2. Participation (/admin/participation): distribution by NGO and by department, utilisation table per activity, table of employees NOT registered with search, multi-select and "Send reminder" (creates per-user reminder notices).
3. Notifications center (/admin/notifications) with tabs:
   - Schedule: enable toggle, offsets chips (add/remove days, default 7/3/1), send time, last-slots threshold; save via PUT; live preview list of the next reminders that would go out (from ReminderSettingsService).
   - Broadcast: audience (all staff / unregistered staff / participants of an activity / NGO contacts), title, message with character count, urgent flag, preview of how it will look in the inbox, confirm with recipient count. Accepts a prefilled activity from query params (link from Phase 6).
   - History: all original notices (not per-user copies), filter by type, recipient count, sent by.
4. Employee side: Inbox page (/app/inbox) with type icon, unread dot, urgent style, mark read / mark all read; topbar notification bell with unread badge and a dropdown of the latest 5 (polls every 15 s).
5. Run scenarios 7 and 8 from PLAN §11. ng build, update PROGRESS.md, commit "feat(admin): overview, participation monitoring and notification center".

Done when: KPIs match the seed numbers, charts render from live data and update after a registration elsewhere, broadcasts and reminders land in the right inboxes, bell badge updates without reload.
```

---

## Phase 8 — QR check-in [UI]

```text
Phase 8 — QR check-in and attendance (UC6).

Read CLAUDE.md, docs/PLAN.md (§3, §5.7, §11 scenario 9), docs/PROGRESS.md.

1. Admin Check-ins (/admin/check-ins): activity picker (defaults to today's activities); QR panel using angularx-qrcode encoding `${baseUrl}/app/check-in/${checkInCode}`, the 8-char code shown large under it, Generate / Regenerate (confirm, invalidates old code), Download PNG; live arrivals list polling every 5 s (name, department, arrival time, On time / Late); counters present / expected / not arrived; Export attendance CSV (client-side Blob download, columns: name, email, department, activity, registered at, checked in at, status).
2. Employee: /app/check-in/:code validates (code exists, activity is today, user registered there, not already checked in) and shows a clear success or a specific reason; /app/check-in has a code input for manual entry. On the day, the Home "Your Service Day" card shows a Check in button.
3. LAN demo (optional but useful for the video): add an npm script `dev:lan` that serves Angular on 0.0.0.0 and json-server on 0.0.0.0, and make the QR base URL configurable (environment.publicAppUrl, falling back to window.location.origin) so a phone on the same Wi-Fi can scan it. Document how to find the Mac's IP.
4. Run scenario 9. ng build, update PROGRESS.md, commit "feat(check-in): QR codes, live arrivals and attendance export".

Done when: Marcus can check in via link and via code, a second attempt is politely rejected, the admin list updates within 5 s, the CSV opens correctly in Excel/Numbers.
```

---

## Phase 9 — Quality pass (audit, harden, polish)

Jalankan berurutan, satu per pesan:

```text
/impeccable audit src/app
```

```text
Phase 9b — Fix the audit.

Fix every P0 and P1 finding from the audit above, then:
1. Responsive pass at 1440, 1024, 768, 390 px on every route (both roles). No horizontal scroll, no clipped text, tables become stacked rows below 600 px.
2. Keyboard-only pass: every action reachable, visible focus, dialogs and drawers trap focus and close with Esc, focus returns to the trigger.
3. Semantic HTML check against the Front-end rubric: header/nav/main/section/article/aside used correctly on every page; one h1 per page; labels on all inputs.
4. States check: every list/table has loading, empty and error states; every disabled button explains why.
5. Stop json-server while the app is open and confirm the error toast and retry states are clear; restart it and confirm recovery.
6. No console errors or warnings in the browser; no `any` types; no hex values in component CSS (grep for '#' in *.css under src/app).
7. ng build, run tests, update PROGRESS.md, commit "fix: audit findings, responsive and accessibility pass".
```

```text
/impeccable harden src/app
```

```text
/impeccable polish src/app
```

Setelah `polish`, minta commit: `Commit the polish changes with message "style: final polish pass" and update PROGRESS.md.`

---

## Phase 10 — Dark mode [UI]

```text
Phase 10 — Dark mode.

Read CLAUDE.md, DESIGN.md, docs/PROGRESS.md.

1. Add a dark token set in tokens.css under :root[data-theme="dark"] and under @media (prefers-color-scheme: dark) guarded by :root:not([data-theme="light"]). Warm dark greys, not pure black; keep the terracotta accent but re-check contrast for text and buttons (adjust --accent-strong for dark if needed to keep 4.5:1).
2. ThemeService in core: system / light / dark, persisted in localStorage (wrapped in try/catch), applied on <html> before first paint to avoid a flash.
3. Moon/sun toggle in the topbar (as in the reference), with an accessible label and a 3-state menu (System / Light / Dark).
4. Charts and the gauge re-read token colours when the theme changes.
5. Check every page in dark mode at 1440 and 390 px; fix any hard-coded colour you find.
6. ng build, update PROGRESS.md, commit "feat(ui): dark mode with system preference".

Done when: both themes look intentional on every page, charts follow the theme, no contrast failures.
```

---

## Phase 11 — Documentation for the report and video

```text
Phase 11 — Documentation.

Read CLAUDE.md, docs/PLAN.md (§9, §10, §11), docs/PROGRESS.md and the actual code. Write in clear academic English (the report is marked). Base every statement on the real code; reference files with paths.

1. docs/SETUP.md — installation and configuration manual: prerequisites (Node version, npm, Angular CLI, Git) with how to install each on macOS and Windows; clone; `npm install`; `npm run dev`; ports 4200/3000; demo accounts; `npm run db:reset`; `dev:lan` for phone scanning; troubleshooting (port in use, API not running, wrong Node version); how Assignment 2 will switch environment.apiUrl to the Express API.
2. docs/USER-MANUAL.md — split into "Employee module" and "Administrator module" (these are the "individual functionalities"), plus "Shared functionality" (login, register, notifications, theme). For each use case: purpose, step-by-step instructions, expected result, and a screenshot placeholder `![...](screenshots/<name>.png)`. At the end, list every screenshot I need to capture with the route, account, and data state. If a browser tool is available, capture them yourself into docs/screenshots/.
3. docs/REPORT-NOTES.md — draft material for the report:
   a. Technologies, frameworks and libraries table (from PLAN §9, versions from package.json) with a justification paragraph each. For literature support, list the official documentation URLs you are sure exist and add a clearly marked placeholder `[ADD SCHOLARLY SOURCE: topic]` where an academic citation is needed. NEVER invent authors, titles, journals or DOIs.
   b. MVC mapping section with a text diagram and one end-to-end walk-through (Register flow: template → component → RegistrationService → rules → HTTP → refresh).
   c. Front-end evidence: where the box model and Flexbox are used (file paths + short CSS snippets), semantic elements used, responsive breakpoints.
   d. AJAX evidence: list of HTTP calls by method, polling, refresh, interceptors, overbooking guard.
   e. Modules and packages evidence: module graph, what each module declares/exports/imports, lazy loading.
   f. A section titled "Use of generative AI" with a template paragraph and APA-style citation entries following the course policy (tool name, date, prompt description, [AI-generated code/text], URL), for me to complete.
4. docs/VIDEO-SCRIPT.md — an 8–10 minute user-manual style script following PLAN §11: scene number, window/account, what to click, what to say (short sentences), and approximate duration. Include a 30-second intro and a 30-second outro mentioning the tech stack.
5. Update README.md (overview, features by role, quick start, link to docs).
6. Update PROGRESS.md, commit "docs: setup guide, user manual, report notes and video script".

Done when: a classmate could install and run the app from SETUP.md alone, and every rubric criterion has written evidence in REPORT-NOTES.md.
```

---

## Phase 12 — Final verification and submission bundle

```text
Phase 12 — Final verification.

1. Fresh-clone test: clone this repo into a temporary folder, run `npm ci`, `npm run db:reset`, `npx ng build --configuration production`, and run the tests. Report any failure and fix it in the main repo.
2. Run all 10 demo scenarios from PLAN §11 one last time after `npm run db:reset`. Report pass/fail per scenario.
3. Check .gitignore, remove dead code and leftover TODOs (except the Assignment 2 AuthInterceptor TODO), make sure /styleguide is not linked anywhere.
4. Create submission/source-code.zip from the git tree (git archive, so node_modules/dist/.angular/db.json are excluded) and confirm it runs from SETUP.md.
5. Print the submission checklist: source code zip, video, report (.docx, Times New Roman 12, 1.5 spacing, page numbers, cover sheet signed), Turnitin report — mark which ones are done.
6. Tag the commit `v1.0-assignment1`, push with tags, update PROGRESS.md.
```

---

## Prompt cadangan

**Melanjutkan di sesi baru**
```text
Read CLAUDE.md, docs/PLAN.md and docs/PROGRESS.md. Summarise in 5 bullets where the project stands and what the next phase is. Do not change anything yet.
```

**Revisi tampilan satu halaman** (awali dengan `/impeccable `)
```text
Refine <route or component>. What's wrong: <jelaskan>. Keep behaviour and copy unchanged unless I say so. Check at 1440 and 390 px, then commit.
```

**Ada bug**
```text
Bug: <apa yang terjadi> on <route>, logged in as <account>. Expected: <yang seharusnya>. Find the root cause before changing code, explain it in 2–3 lines, fix it, add or update a test if it is in core/rules or a service, then commit.
```

**Minta penjelasan kode untuk video / presentasi**
```text
Explain <file or feature> to me as if I have to defend it in front of my lecturer: what it does, which graded concept it demonstrates (MVC / box model / Flexbox / AJAX / modules), and the 3 lines of code I should point at. Do not change any code.
```
