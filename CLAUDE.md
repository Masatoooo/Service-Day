# Service Day — Project Rules for Claude Code

At the start of every session, read this file, then `docs/PLAN.md` (the blueprint) and `docs/PROGRESS.md` (the log you maintain). If they disagree, PLAN.md wins for *what* to build, this file wins for *how*.

## 1. What this project is

- **Course:** BIT306 Web Technologies, **Assignment 1 (35%)**, front-end only. Due 1 Dec 2026, 17:00.
- **Case study:** "Service Day Dashboard" for corporate CSR volunteering (6 use cases, see PLAN §1).
- **Product name:** **Service Day** · **Company (fictional):** **Halden & Co.** · **UI language:** English.
- **Solo student** (lecturer approved). The report frames work as *Admin module* and *Employee module*.
- **Assignment 2** later adds Node.js/Express/MongoDB behind this same front-end. Switching from the mock API to the real API must only require changing `environment.apiUrl` (plus auth token handling).

## 2. Stack (fixed — do not change without asking)

- Angular CLI **22.x**, Node **26**, npm **11**, macOS arm64.
- **NgModule architecture, NOT standalone.** Project created with `--standalone=false`. Every app component, pipe and directive is declared in an NgModule. Do not migrate to standalone even if the CLI or docs suggest it. Third-party standalone components/directives (QR code, chart directive) may be added to an NgModule's `imports`.
- **Plain CSS only.** No Tailwind, Bootstrap, Angular Material or other UI kits.
- **Flexbox for layout on every page** (graded criterion). Avoid CSS Grid so the Flexbox usage is unambiguous; use `flex-wrap` + `gap` for card collections.
- **Mock backend:** `json-server` serving `mock-api/db.json` at `http://localhost:3000`. `db.json` is **generated** by `mock-api/seed.mjs` with dates relative to *today*, and is git-ignored.
- **Approved packages:** `@lucide/angular` (replaces `lucide-angular`, which does not support Angular 22), `chart.js`, `ng2-charts`, `date-fns`, `angularx-qrcode`, `@fontsource-variable/instrument-sans`, `json-server`, `concurrently`, `@angular/cdk` (peer dependency of `ng2-charts` 11). Adding anything else requires a one-line justification in `docs/PROGRESS.md` → *Decisions*.
- When unsure about an Angular 22 API (HttpClient providers, interceptors, router, zoneless change detection), check the official docs at angular.dev. Do not guess deprecated APIs.

## 3. Architecture rules (MVC — graded, 20 marks)

- **Model** = TypeScript interfaces in `core/models/` + pure rule functions in `core/rules/` (availability, cut-off, check-in window). Rules never touch HTTP or the DOM.
- **View** = component templates + component CSS. Presentation only: no business logic, no date math, no filtering/sorting logic in templates. Use pipes or values prepared by the component.
- **Controller** = component class. Lean: reads streams from services, handles UI events, delegates. Target < 120 lines per component class.
- **Services** in `core/services/` own all data access (HttpClient, typed) and orchestration of business operations. **Components never inject HttpClient. No hard-coded domain data in components.**
- All URLs built from `environment.apiUrl`.
- Async: services return `Observable`s. Components consume with the `async` pipe (or `toSignal`). Any manual `subscribe` uses `takeUntilDestroyed`.
- Every mutation refreshes affected data **without a page reload**. Availability views also poll (see PLAN §6.4).
- Modules: `CoreModule` (singletons, imported once by AppModule, throws if re-imported), `SharedModule` (reusable UI + pipes, exported), `LayoutModule` (app shell), lazy-loaded feature modules `AuthModule`, `EmployeeModule`, `AdminModule`, each with its own routing module.

## 4. Design rules (Front-end Design — graded, 34 marks)

- Use the **/impeccable** skill. `PRODUCT.md` and `DESIGN.md` are created in Phase 0 and are the visual authority after that. Surface mode: **Operate** (a working dashboard).
- Reference screenshot: `docs/reference/dashboard-reference.png`. Match its **taste and typography**, not its content: warm light-grey canvas, white cards with large radius, almost no borders or shadows, one warm accent used sparingly, pill-shaped controls, thin line icons, large KPI numerals, medium-weight headings, small muted labels, roomy sidebar.
- **Tokens** live in `src/styles/tokens.css` as CSS custom properties (PLAN §8). Component CSS never hard-codes hex values, font sizes or radii; it uses tokens.
- **Font:** Instrument Sans Variable (self-hosted via `@fontsource-variable/instrument-sans`). Weights 400 / 500 / 600 only. Numbers use `font-variant-numeric: tabular-nums`.
- **Accent contrast:** `--accent` (#E8692C) is for large marks only (charts, icons, active indicators, KPI accents). Text and filled buttons with white text use `--accent-strong` (#B24D19) to meet 4.5:1 (also on `--accent-soft`).
- **Bans (anti AI-slop):** gradients as decoration, glassmorphism/blur panels, purple-blue palettes, emoji used as icons, heavy drop shadows, lorem ipsum or placeholder names ("Activity 1", "John Doe"), every card identical in size and weight, centered-everything layouts, all-caps shouting headings, an icon on every heading, decorative illustrations that carry no information.
- **States are part of the design:** every data view has loading (skeleton), empty, and error states. Every disabled action says why (e.g. "Registration closed on 18 Nov, 17:00").
- **Responsive:** verify at 1440, 1024, 768 and 390 px wide. No horizontal page scroll. Below 900 px the sidebar becomes an off-canvas drawer; tables become stacked rows.
- **Accessibility:** semantic landmarks (`header`, `nav`, `main`, `section`, `article`, `aside`, `footer`), a label for every input, visible `:focus-visible` ring, 4.5:1 text contrast, `aria-live="polite"` for toasts, buttons are `<button>`, links are `<a>`.

## 5. Working agreement

- Work **one phase at a time** from `docs/PROMPTS.md`. Do not start the next phase unless asked.
- At the start of a phase: restate the plan in a few bullets, then build.
- At the end of a phase:
  1. `npx ng build` passes with no errors (fix warnings you introduced).
  2. Run the app (`npm run dev`) and check the changed screens in a browser if one is available; otherwise say what you could not verify.
  3. Run the phase's "Done when" checklist and report each item.
  4. Append to `docs/PROGRESS.md` (what was built, files touched, decisions, known issues).
  5. Commit with a Conventional Commit message (`feat(employee): …`). Push if a remote exists.
- Code must be **explainable by the student in a video**: meaningful names, short functions, and brief comments that name the graded concept where it applies (e.g. `// MVC: controller delegates to RegistrationService`, `/* Box model: padding inside, gap between cards */`).
- Never commit `node_modules`, `dist`, `.angular`, or `mock-api/db.json`.
- Mock auth stores plain passwords in `db.json`. That is acceptable **only** for this mock; note it in docs. Never store the password in localStorage.
