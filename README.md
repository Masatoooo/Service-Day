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

## Scan the check-in QR code with a phone (LAN demo)

The QR code on **Admin → Check-ins** links to the address the admin opened the app on. To scan it with a phone on the same Wi-Fi:

1. Find the Mac's IP address: `ipconfig getifaddr en0` (Wi-Fi), e.g. `192.168.1.23`.
2. Stop `npm run dev` and start `npm run dev:lan` instead. It serves the app and the mock API on all network interfaces (`0.0.0.0`), ports 4200 and 3000.
3. On the Mac, open `http://<that IP>:4200` (not `localhost`), sign in as the admin and open Check-ins. The QR code now contains `http://<that IP>:4200/app/check-in/<code>`.
4. Scan it with the phone, sign in as the employee (e.g. Marcus Tan) and the check-in completes.

The LAN build (`environment.lan.ts`) calls the API on the same host the page came from, port 3000. If the phone can't connect, allow incoming connections for Node in macOS System Settings → Network → Firewall. To force a fixed address in the QR code, set `publicAppUrl` in the environment file.

A full setup guide will be in `docs/SETUP.md`.
