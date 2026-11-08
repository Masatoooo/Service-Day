# Service Day — Video Script (user-manual demonstration)

Target length: **about 9 minutes** (8–10 allowed). Style: a user manual on screen. Speak in short sentences; let the screen show the detail. The scenes follow the demonstration scenarios in `docs/PLAN.md` §11.

## Before recording

1. Stop any running servers, then `npm run db:reset` and `npm run dev` (dates are relative to today; the reset makes "today", "closing soon" and "last place" correct). Record **before 14:15** if you want Marcus's check-in to show "On time" (Memory Lane Afternoon starts at 14:00).
2. Open three browser windows at about 1440 px wide, each in its own profile or private window so the sessions don't mix:
   - **Window A — Admin**: signed in as Masato Kaneko (`masato@kaneko.co` / `Admin#2026`).
   - **Window B — Komang**: signed out at `http://localhost:4200/login`.
   - **Window C — Daniel**: signed in as Daniel Koh (`daniel.koh@kaneko.co` / `Volunteer#1`), on **Opportunities → Reading Buddies**.
3. Keep a fourth tab ready for Aisha and Marcus (sign in with the Demo accounts panel).
4. Turn on screen recording with system audio off and microphone on. Hide notifications.

---

## Scene list

| # | Scene | Window / account | Time |
|---|---|---|---|
| 0 | Intro | — (title, then the sign-in page) | 0:30 |
| 1 | Sign in and register (Komang takes the last place) | B · Komang | 1:10 |
| 2 | Live update in a second window | C · Daniel | 0:30 |
| 3 | Switch | C · Daniel | 0:45 |
| 4 | Locked after the cut-off | tab · Aisha | 0:30 |
| 5 | Withdraw | C · Daniel | 0:30 |
| 6 | Admin: create, publish, validate | A · Masato | 1:20 |
| 7 | Monitoring and reminders | A · Masato | 1:00 |
| 8 | Notifications: schedule and broadcast | A · Masato | 0:50 |
| 9 | QR check-in and attendance | tab · Marcus + A · Masato | 1:00 |
| 10 | New employee account + responsive layout | B (signed out) | 0:40 |
| 11 | Outro | — | 0:30 |
| | **Total** | | **≈ 9:15** |

---

## Scene 0 — Intro (0:30)

**Show:** a title card "Service Day — BIT306 Assignment 1", then Window B with the sign-in page.

**Say:**
> This is Service Day, a web app for Kaneko.co's corporate volunteering day.
> Employees pick one NGO activity, can change it until a cut-off, and check in on the day with a QR code.
> Administrators manage NGOs and activities, follow participation, send notices and record attendance.
> I'll show the employee module first, then the administrator module.

## Scene 1 — Sign in and register (1:10) · Window B · Komang

**Click:** open **Demo accounts** → **Use** next to Komang Masato → **Sign in**.
**Say:** "I sign in as Komang. She hasn't picked an activity yet, and Home tells her how many places are still open."

**Click:** **Opportunities** → the **Education** pill.
**Say:** "Each card shows the NGO, the status, a slot meter and the cut-off. The filters live in the address bar."

**Click:** **Reading Buddies** (1 of 12 left).
**Say:** "Reading Buddies has one place left. The page explains the rules: one place per person, changes until the cut-off."

**Click:** **Register** → read the dialog → **Register**.
**Say:** "The dialog repeats the date, the place and the cut-off. After I confirm, the app checks the slots again on the server data right before saving, so the last place can't be taken twice."
**Point at:** the toast, "You're registered here", the slot meter now **Full**, the bell count going up.

## Scene 2 — Live update (0:30) · Window C · Daniel

**Show:** Window C, still on Reading Buddies. Wait until it changes.
**Say:**
> This is a second browser, signed in as Daniel. I haven't touched it.
> Within ten seconds Reading Buddies changes to Full by itself. The app polls the API with AJAX; there's no page reload.

## Scene 3 — Switch (0:45) · Window C · Daniel

**Click:** **Opportunities** → **Lunch Service** (closing soon) → **Switch to this activity**.
**Say:** "Daniel already has a place on Pack and Deliver. The dialog says exactly what changes: he leaves one activity and joins the other."
**Click:** **Switch** → **My registrations**.
**Say:** "His history shows the old place as Switched, with the time."

## Scene 4 — Locked after the cut-off (0:30) · Aisha

**Click:** sign in as Aisha Rahman → **Kennel Refresh Day**.
**Say:**
> Aisha's activity has passed its cut-off.
> Switch and Withdraw are gone, and the page says why: changes closed on that date, her place is confirmed.
> Every disabled action in the app explains itself like this.

## Scene 5 — Withdraw (0:30) · Window C · Daniel

**Click:** **My registrations** → **Withdraw** → **Withdraw**.
**Say:** "Withdrawing is a destructive action, so the dialog warns that the place will be released. The slot goes back to Lunch Service straight away, and the history says Withdrawn."

## Scene 6 — Admin: create, publish, validate (1:20) · Window A · Masato

**Click:** **Activities**.
**Say:** "Now the administrator module. The activities table lists every activity of the season, including drafts and cancelled ones."

**Click:** **New activity** → **Create activity** with the form empty.
**Say:** "Every field explains what's missing."

**Fill:** NGO, type, a title such as "Shoreline Bird Count", description, location, date, 10:00–13:00, 8 slots, a cut-off a few days before → keep **Draft** → **Create activity**.
**Say:** "I save it as a draft, so employees don't see it yet."

**Click:** **Activities** → **Publish** on the new row. *(Optional: show Window B's Opportunities picking it up within ten seconds.)*
**Say:** "Publishing makes it visible to employees within ten seconds."

**Click:** **Edit** on Reading Buddies → set **Max slots** to 5.
**Say:** "The form checks the API: max slots can't go below the eleven people already registered. The same rule blocks deleting an activity that has participants and offers to cancel it instead."
**Click:** **Cancel** (leave the form; confirm leaving without saving).

## Scene 7 — Monitoring and reminders (1:00) · Window A · Masato

**Click:** **Overview**.
**Say:**
> The overview shows slots offered, taken and remaining, and staff participation.
> The bar chart compares places taken with capacity per NGO; the gauge shows participation.
> Needs attention lists activities closing soon, at their last places, or under a quarter full.

**Click:** **Participation** → tick three people under "people have no place yet" → **Send reminder** → **Send reminder**.
**Say:** "Here I can see who hasn't signed up. I select three people and send them a reminder. It lands in each of their inboxes immediately."

## Scene 8 — Notifications: schedule and broadcast (0:50) · Window A · Masato

**Click:** **Notifications** → **Schedule** → add **10** days, remove **1** day.
**Say:** "The reminder schedule. When I change the days, the preview of the next reminders updates before I save. In this version reminders are previewed, not sent by a scheduler."

**Click:** **Overview** → **Announce last places** under Needs attention (or **Broadcast** with an urgent message to all staff) → **Review and send** → **Send now**.
**Say:** "A broadcast shows how it will look in the inbox and how many people it reaches. After sending, it appears in History with the number of recipients."
*(Optional: show an employee window's bell count going up within fifteen seconds.)*

## Scene 9 — QR check-in and attendance (1:00) · Marcus + Window A

**Click (Window A):** **Check-ins**.
**Say:** "Memory Lane Afternoon is today. Here is its QR code and the eight-character code under it. I can download a printable poster."

**Click (Marcus tab):** sign in as Marcus Tan → **Check in** on Home → type `eqpc-2u3d` → **Check in**.
**Say:** "Marcus types the code. Lower case and a dash are fine. He's checked in, with his arrival time."
**Click:** open the same link again (or press Check in again).
**Say:** "A second attempt is politely refused."

**Show (Window A):** the arrivals list updates within five seconds → **Export CSV**.
**Say:** "The admin list updates by itself every five seconds. Export CSV downloads the attendance list for Excel or Numbers."

## Scene 10 — New account and responsive layout (0:40) · Window B signed out

**Click:** sign out → **Create an account** → type a Gmail address and a short password → **Create account**.
**Say:** "Sign-up is for Kaneko.co staff only. The form explains each problem: the email must end in kaneko dot co, the password needs eight characters and a number."
**Fill:** a `@kaneko.co` email and a valid password → **Create account**.
**Say:** "With valid details the new employee lands on Home."

**Show:** narrow the window to phone width (or use the browser's device toolbar) → open the menu.
**Say:** "On a phone the sidebar becomes a menu and tables become stacked rows. Every page was checked at four screen widths."

## Scene 11 — Outro (0:30)

**Show:** Window A Overview, then a slide with the stack.
**Say:**
> Service Day is built with Angular 22 using NgModules, with core, shared, layout and three lazy-loaded feature modules.
> It follows MVC: typed models and pure rules, services for all HTTP, lean components and presentation-only templates.
> The layouts use plain CSS with Flexbox and design tokens.
> Data comes from a json-server REST API over AJAX, which Assignment 2 replaces with Express and MongoDB by changing one URL.
> Thank you for watching.

---

## Tips

- Rehearse once with a stopwatch; cut optional lines if a scene runs long.
- Keep the mouse still while speaking; move it to point at the thing you name.
- If something goes wrong on camera, pause, then reset the data (stop → `npm run db:reset` → `npm run dev`) and record the scene again.
