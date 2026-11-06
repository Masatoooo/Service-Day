# Service Day

A dashboard for Halden & Co. staff to find, sign up for and check in to corporate volunteering activities, and for admins to manage NGOs, activities and participation. Built with Angular 22 (front-end only, BIT306 Assignment 1) against a json-server mock API.

## Run it

Requires Node 22.22+, 24.15+ or 26.

```bash
npm install
npm run dev
```

`npm run dev` seeds `mock-api/db.json` if it is missing, then starts the mock API on http://localhost:3000 and the app on http://localhost:4200.

`npm run db:reset` re-seeds the mock database from scratch. Stop `npm run dev` first (or restart it afterwards): the running mock API keeps its data in memory and does not pick up the new file.

A full setup guide will be in `docs/SETUP.md`.
