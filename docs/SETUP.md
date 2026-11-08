# Service Day — Installation and Configuration Manual

This guide explains how to install, configure and run the Service Day front-end and its mock REST API on a new computer. It assumes no prior setup. Commands are shown for macOS (Terminal, zsh) and Windows (PowerShell); where they are identical only one version is given.

**What you get:** an Angular 22 single-page application at `http://localhost:4200` and a `json-server` mock REST API at `http://localhost:3000`, started together by one command and pre-filled with demonstration data.

---

## 1. Prerequisites

| Tool | Version used and tested | Why it is needed |
|---|---|---|
| Node.js | 26.12.1 (Angular 22 requires Node `^22.22.3`, `^24.15.0` or `>=26.0.0`) | Runs the Angular CLI, the build and `json-server` |
| npm | 11.20.0 (bundled with Node.js) | Installs the dependencies in `package.json` |
| Git | any recent version | Clones the repository |
| Angular CLI | 22.2.x | Installed locally with the project; a global install is optional |
| A modern browser | Chrome, Edge, Firefox or Safari (current versions) | The app uses the native `<dialog>` element and the Popover API |

### 1.1 Install Node.js and npm

**macOS**

- Option A (installer): download the current LTS or "Current" installer from <https://nodejs.org/> and run it.
- Option B (Homebrew): `brew install node`
- Option C (version manager, recommended when several projects need different versions): install nvm from <https://github.com/nvm-sh/nvm>, then `nvm install 26` and `nvm use 26`.

**Windows**

- Option A (installer): download the Windows installer (`.msi`) from <https://nodejs.org/> and run it; keep "Add to PATH" ticked.
- Option B (winget): `winget install OpenJS.NodeJS`
- Option C (version manager): install nvm-windows from <https://github.com/coreybutler/nvm-windows>, then `nvm install 26` and `nvm use 26`.

Check the installation in a new terminal window:

```bash
node -v    # v22.22 or newer, v24.15 or newer, or v26.x
npm -v     # 11.x
```

### 1.2 Install Git

- **macOS:** `xcode-select --install` (installs Git with the Command Line Tools) or `brew install git`.
- **Windows:** download Git for Windows from <https://git-scm.com/download/win>, or `winget install Git.Git`.

Check with `git --version`.

### 1.3 Angular CLI (optional global install)

The project already lists `@angular/cli` 22.2 as a development dependency, so `npx ng …` works without a global install. To have the `ng` command everywhere:

```bash
npm install -g @angular/cli@22
ng version
```

---

## 2. Get the code

```bash
git clone https://github.com/Masatoooo/Service-Day.git
cd Service-Day
```

If you received the project as a ZIP file instead, unzip it and open a terminal in the unzipped folder (the folder that contains `package.json`).

---

## 3. Install the dependencies

```bash
npm install
```

This downloads every package listed in `package.json` into `node_modules/` (about 1–2 minutes on a normal connection). Do not use `--force` or `--legacy-peer-deps`; every dependency is compatible with Angular 22 as installed.

> npm 11 may print a note that the install scripts of a few packages (esbuild, lmdb, fsevents and similar) were skipped. The build, the development server and the tests work without them.

---

## 4. Run the application

```bash
npm run dev
```

`npm run dev` does three things (see `package.json`):

1. Creates the demonstration database `mock-api/db.json` with `mock-api/seed.mjs` if it does not exist yet.
2. Starts the mock REST API (`json-server`) on **port 3000**.
3. Starts the Angular development server (`ng serve`) on **port 4200**.

When the terminal shows `Local: http://localhost:4200/`, open that address in the browser. Stop both servers with **Ctrl+C**.

| Address | What it is |
|---|---|
| `http://localhost:4200` | The Service Day application |
| `http://localhost:3000` | The mock REST API (e.g. `http://localhost:3000/activities`) |

### 4.1 Other useful scripts

| Command | Purpose |
|---|---|
| `npm run db:reset` | Re-creates `mock-api/db.json` from scratch with dates relative to today (see §5) |
| `npm run api` | Starts only the mock API on port 3000 |
| `npm start` | Starts only the Angular development server on port 4200 |
| `npm run build` | Production build into `dist/service-day/` |
| `npm test` | Runs the unit tests (Vitest, 73 tests) |
| `npm run dev:lan` | Like `dev`, but reachable from other devices on the same Wi-Fi (see §6) |

---

## 5. Demonstration data and accounts

The seed script (`mock-api/seed.mjs`) writes realistic, fictional data: 7 NGOs, 9 activities, 64 employees, 57 registrations and 37 notifications. All dates are **relative to the day the seed runs**: Service Day is always 14 days ahead, one activity always takes place today (for the check-in demonstration), and cut-offs fall before, near and after "now" so every state can be shown.

| Name | Email | Password | Role | Prepared situation |
|---|---|---|---|---|
| Masato Kaneko | `masato@kaneko.co` | `Admin#2026` | Admin | Manages everything in the admin area |
| Aisha Rahman | `aisha.rahman@kaneko.co` | `Volunteer#1` | Employee | Registered for an activity whose cut-off has passed (changes locked); 3 unread notices |
| Daniel Koh | `daniel.koh@kaneko.co` | `Volunteer#1` | Employee | Registered for an open activity (can switch or withdraw) |
| Komang Masato | `komangmasato@kaneko.co` | `Volunteer#1` | Employee | Not registered (can take the last place on *Reading Buddies*) |
| Marcus Tan | `marcus.tan@kaneko.co` | `Volunteer#1` | Employee | Registered for today's activity (check-in code `EQPC2U3D`) |

The same list is available on the sign-in page under **Demo accounts**, with a **Use** button that fills the form.

> **Important — reset the data correctly.** `json-server` keeps the data in memory. If you run `npm run db:reset` while `npm run dev` is running, the new data is ignored and later overwritten (the seed script prints a warning). Always: stop `npm run dev` (Ctrl+C) → `npm run db:reset` → `npm run dev`. Do this before every demonstration or recording, because "today" and the cut-offs move with the calendar.

> The mock API stores passwords in plain text inside `mock-api/db.json`. This is acceptable only for this front-end prototype; Assignment 2 replaces it with a real server that hashes passwords. The browser never stores the password (only the user id, name, role and department are kept in `localStorage`).

---

## 6. Optional: scan the check-in QR code with a phone (LAN mode)

The check-in QR code on **Admin → Check-ins** links to the address on which the admin opened the app. To scan it with a phone on the same Wi-Fi network:

1. Find the computer's local IP address:
   - macOS: `ipconfig getifaddr en0` (Wi-Fi), for example `192.168.1.23`
   - Windows: `ipconfig`, then read "IPv4 Address" under the Wi-Fi adapter
2. Stop `npm run dev` and start `npm run dev:lan`. It serves the app and the API on all network interfaces (`0.0.0.0`), ports 4200 and 3000, and uses `src/environments/environment.lan.ts`, which calls the API on the same host the page was loaded from.
3. On the computer, open `http://<IP address>:4200` (not `localhost`), sign in as the admin and open **Check-ins**. The QR code now contains `http://<IP address>:4200/app/check-in/<code>`.
4. Scan the code with the phone's camera, sign in as the registered employee (e.g. Marcus Tan), and the check-in completes.

If the phone cannot connect, allow incoming connections for Node.js in the firewall (macOS: System Settings → Network → Firewall; Windows: Windows Defender Firewall prompt) and make sure both devices are on the same network.

---

## 7. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Error: listen EADDRINUSE :::4200` or `:::3000` | Another program (often an earlier run) uses the port | Stop the other process. macOS: `lsof -ti tcp:4200 -sTCP:LISTEN \| xargs kill` (same for 3000). Windows: `netstat -ano \| findstr :4200`, then `taskkill /PID <pid> /F`. Or run `npx ng serve --port 4300` (the API URL does not change). |
| Red toast "Can't reach the Service Day server. Is `npm run api` running?" and pages that say "We couldn't load …" | The mock API on port 3000 is not running | Start it with `npm run dev` (or `npm run api` in a second terminal). The pages recover by themselves within a few seconds; no reload is needed. |
| `The Angular CLI requires a minimum Node.js version…` or odd build errors right after `npm install` | Node.js is too old | Install Node 22.22+, 24.15+ or 26 (§1.1), delete `node_modules`, run `npm install` again. With nvm: `nvm use 26`. |
| Activities show unexpected states ("Closed" everywhere, no activity today) | The demonstration data was created on an earlier day | Stop the servers, `npm run db:reset`, `npm run dev` (§5). |
| `npm run db:reset` seems to have no effect | The API was still running and kept its in-memory data | Stop `npm run dev` first, then reset, then start again. |
| Login fails with "We couldn't find an account with that email" | Typing error, or the database was replaced | Use the **Demo accounts** panel on the sign-in page; reset the data if needed. |
| Phone cannot open the LAN address | Firewall or different network | See §6. |

---

## 8. Configuration and the switch to the Assignment 2 back-end

All configuration lives in `src/environments/`:

| File | Used by | Key values |
|---|---|---|
| `environment.development.ts` | `ng serve` (default) | `apiUrl: 'http://localhost:3000'`, `mockLatency: { min: 250, max: 600 }`, `publicAppUrl: ''` |
| `environment.ts` | `ng build` (production) | `apiUrl: 'http://localhost:3000'`, no simulated latency |
| `environment.lan.ts` | `npm run dev:lan` | `apiUrl` = the page's host on port 3000 |

- `apiUrl` is the only place the API address is defined. Every request is built by `ApiUrlService` (`src/app/core/services/api-url-service.ts`), so no component or service contains a hard-coded URL.
- `mockLatency` adds a random 250–600 ms delay to every request in development (`LatencyInterceptor`) so loading states are visible. It is `0` in production.
- `publicAppUrl` is the base URL written into check-in QR codes. When empty, the address the admin opened the app on is used.

**Moving to the Express/MongoDB API (Assignment 2).** The front-end already talks to a REST API through Angular's `HttpClient`, using the resource names the Express server will expose (`/users`, `/ngos`, `/activities`, `/registrations`, `/notifications`, `/reminderSettings`). To switch:

1. Change `apiUrl` in `environment.ts` and `environment.development.ts` to the Express server, for example `http://localhost:5000/api`.
2. Register the prepared `AuthInterceptor` (`src/app/core/interceptors/auth-interceptor.ts`, currently a placeholder) in `CoreModule` so it adds the authentication token to each request, and let `AuthService` call the server's login endpoint instead of comparing passwords in the browser.
3. Remove `npm run api` / `json-server` from the `dev` script.

No component, template or business rule needs to change, because components never call `HttpClient` directly (see `docs/REPORT-NOTES.md`, MVC section).
