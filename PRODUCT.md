# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Employees** (primary). Office staff of Kaneko.co They visit 1–3 times per Service Day season, briefly, mostly on desktop, and sometimes on a phone on the day itself. Their job: find a volunteering activity that suits them quickly, sign up, and always know exactly where they stand (registered where, until when they can still change it, what happens on the day).

**Administrators**. The CSR / People & Culture team. They work in several sessions per week during the season, on desktop. Their job: keep NGO activities published and balanced, avoid overbooking, see who has not signed up yet and nudge them, and track attendance on the day.

**Assessor** (secondary, evaluating). The product is also BIT306 Web Technologies Assignment 1. A lecturer judges it from a recorded video demo and the report, using seeded demo accounts and scenarios (see Operating Context).

## Product Purpose

Service Day is an internal web dashboard for Kaneko.co's annual corporate social responsibility (CSR) volunteering day. Employees browse NGO volunteering activities, register for one, switch or withdraw before a cut-off, read notices, and check in on the day with a QR code. Administrators manage NGOs and activities, monitor slot use and staff participation, send reminders and broadcasts, and track check-ins.

Success for employees: picking and securing an activity takes a few minutes, and no one is ever unsure whether they are registered or why an action is unavailable. Success for administrators: no activity is overbooked, under-filled activities and unregistered staff are visible early, and attendance on the day is recorded without paperwork.

## Positioning

Service Day covers the whole loop of one company volunteering day in one place: NGO availability, sign-up with slot and cut-off rules, participation monitoring, reminders, and on-the-day check-in. A generic event-signup form or spreadsheet does not enforce one active registration per employee per season or a cut-off for changes, does not explain every locked action in plain words, and does not show live slot counts that cannot drift. Here, slots taken are always derived from actual registrations.

## Operating Context

- Seasonal rhythm: activities are published weeks ahead, registration closes at a per-activity cut-off, and Service Day itself is one day (seed: today + 14 days). Admin activity peaks during the season.
- Employees often arrive from a reminder or broadcast, act once, and leave. On the day they may use a phone to open the QR check-in link or type the 8-character code.
- Administrators keep the dashboard open while monitoring. Availability updates live by polling, without page reloads.
- Assessment context: the work is demonstrated in a recorded video with seeded demo accounts (Masato Kaneko as admin; Aisha, Daniel, Komang and Marcus as employees with prepared situations) and scripted scenarios (PLAN §11), including a two-window "last slot" live-update demo. The graded criteria are MVC structure, front-end design (semantic HTML, box model, Flexbox, responsive), AJAX, and modules and packages. Those concepts should stay visible and explainable in the running app and its code.

## Capabilities and Constraints

- Use cases: UC1 manage NGO availability (admin), UC2 view opportunities, UC3 register / switch / withdraw, UC4 monitor participation (admin), UC5 notifications and reminders, UC6 QR check-in.
- Roles: Employee and Admin. Self-registration creates employees only (work email must end in `@kaneko.co`); admins exist in seed data.
- Rules: one active registration per employee per season; changes only before the activity's cut-off; overbooking guard re-checks slots right before writing; check-in only on the activity date for registered employees, arrivals more than 15 minutes after start are marked Late.
- Front-end only in Assignment 1. The json-server mock API stores plain-text passwords, which is acceptable only for the mock. Real email, schedulers, server-side enforcement and real scan endpoints come in Assignment 2, which must only require changing `environment.apiUrl` (plus auth token handling).
- UC5 and UC6 are UI plus client-simulated behaviour in this build.
- Stack is fixed by the course setup: Angular 22 with NgModules, plain CSS, Flexbox layouts, approved packages only (see CLAUDE.md §2).
- Due 1 December 2026, 17:00. Solo student.

## Brand Commitments

- Product name **Service Day**; company **Kaneko.co** (fictional). UI language English, sentence case.
- Voice: warm, calm, competent, human. Generous but not empty. Confident numbers. No hype. Copy is specific: it names the activity, the date and the reason, and tells people what to do next.
- Binding visual constraints set by the brief (recorded, not expanded here): font Instrument Sans Variable at weights 400/500/600 with tabular numbers; type, radius, spacing, elevation and motion tokens as PLAN §8; colour is the "Ink + Pine" palette chosen with the student (branch `revamp/ink-pine`, values in DESIGN.md): Ink `#151917` for filled primary buttons and the selected nav item, pill and tab, Pine `#2D6E58` for marks, Deep Pine `#1E5442` for links and focus, a leaf-green success hue kept apart from Pine; light mode only; Flexbox-only layouts; plain CSS with custom properties. Reference for taste and typography only, not content: `docs/reference/dashboard-reference.png`.
- Anti-references: generic AI dashboards (purple/blue gradients, glassmorphism, emoji icons, identical card grids, stock illustrations, lorem ipsum), Bootstrap admin templates, Material default look.

## Evidence on Hand

- All people, NGOs, activities, registrations and notifications are fictional seed data generated by `mock-api/seed.mjs` relative to the day it runs (PLAN §2, §6.3). There are no real NGOs, partner logos, testimonials, metrics or photos, and none may be invented as if real.
- Seeded demo accounts and scenarios: PLAN §2 and §11.
- Visual reference screenshot: `docs/reference/dashboard-reference.png` (a third-party dashboard; used for taste only, never copied).

## Product Principles

1. **Always say where someone stands.** Every registration state, slot count and deadline is visible, and every unavailable action explains why in a human sentence.
2. **The numbers are the truth.** Slot counts and participation figures come from real records, update live, and are never estimated or decorated.
3. **Fast for the occasional visitor, thorough for the operator.** Employees finish in a few clicks; admins get the depth they need without the employee view getting heavier.
4. **Rules are enforced, not just displayed.** Cut-offs, one-registration-per-season and overbooking guards are applied consistently everywhere an action exists.
5. **Explainable by design.** The structure (models, rules, services, modules) stays clean enough to walk through in a demo video.

## Accessibility & Inclusion

Target WCAG 2.2 AA. Concretely: semantic landmarks, a label for every input, visible `:focus-visible` rings, full keyboard operation, text contrast at least 4.5:1, adequate target sizes, `aria-live="polite"` for toasts, real `<button>` and `<a>` elements, and `prefers-reduced-motion` respected. Verify layouts at 1440, 1024, 768 and 390 px with no horizontal page scroll.
