---
name: Service Day
description: Kaneko.co's volunteering-day dashboard — ink for action, pine for what's filling up, exact about slots and deadlines.
colors:
  canvas: "#F1F3F2"
  surface: "#FFFFFF"
  surface-sunken: "#F6F7F6"
  hairline: "#E5E8E6"
  hairline-strong: "#D2D7D4"
  control-border: "#838A86"
  ink: "#151917"
  ink-muted: "#5C635F"
  ink-faint: "#69706C"
  action: "#151917"
  action-hover: "#2E3531"
  on-action: "#FFFFFF"
  accent: "#2D6E58"
  accent-strong: "#1E5442"
  accent-strong-hover: "#153D30"
  accent-soft: "#E2EEE8"
  on-accent: "#FFFFFF"
  success: "#4A7616"
  success-soft: "#EEF5E1"
  warning: "#986000"
  warning-soft: "#FBF1DC"
  danger: "#C2352C"
  danger-hover: "#A52B23"
  danger-soft: "#FBE9E7"
  info: "#2F5FC4"
  info-soft: "#E8EFFB"
  tint-sage: "#E4EFE5"
  tint-sky: "#E2ECF6"
  tint-clay: "#F3E5DC"
  tint-butter: "#F5EED4"
  tint-rose: "#F4E3E7"
  tint-lilac: "#EBE7F2"
typography:
  display:
    fontFamily: "Instrument Sans Variable, system-ui, sans-serif"
    fontSize: "64px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.01em"
    fontFeature: "tnum"
  kpi:
    fontFamily: "Instrument Sans Variable, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 500
    lineHeight: "44px"
    letterSpacing: "-0.01em"
    fontFeature: "tnum"
  h1:
    fontFamily: "Instrument Sans Variable, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 500
    lineHeight: "34px"
    letterSpacing: "-0.01em"
  h2:
    fontFamily: "Instrument Sans Variable, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 500
    lineHeight: "28px"
  h3:
    fontFamily: "Instrument Sans Variable, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: "24px"
  body:
    fontFamily: "Instrument Sans Variable, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "22px"
  small:
    fontFamily: "Instrument Sans Variable, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "18px"
  micro:
    fontFamily: "Instrument Sans Variable, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "16px"
rounded:
  card: "20px"
  tile: "14px"
  input: "12px"
  control: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "7": "32px"
  "8": "40px"
  "9": "56px"
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.on-action}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
  button-secondary:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "40px"
  button-ghost:
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "40px"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.control}"
    height: "40px"
  button-small:
    typography: "{typography.small}"
    padding: "0 16px"
    height: "32px"
  input:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.ink}"
    rounded: "{rounded.input}"
    padding: "0 16px"
    height: "40px"
  search-field:
    backgroundColor: "{colors.surface-sunken}"
    rounded: "{rounded.control}"
    height: "40px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "24px"
  sunken-tile:
    backgroundColor: "{colors.surface-sunken}"
    rounded: "{rounded.tile}"
    padding: "16px"
  status-pill:
    typography: "{typography.micro}"
    rounded: "{rounded.control}"
    padding: "2px 10px"
    height: "24px"
  filter-pill:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.small}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "36px"
  filter-pill-selected:
    backgroundColor: "{colors.action}"
    textColor: "{colors.on-action}"
  nav-item:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.tile}"
    padding: "0 16px"
    height: "44px"
  nav-item-active:
    backgroundColor: "{colors.action}"
    textColor: "{colors.on-action}"
  tab:
    textColor: "{colors.ink-muted}"
    typography: "{typography.small}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "32px"
  tab-selected:
    backgroundColor: "{colors.action}"
    textColor: "{colors.on-action}"
---

# Design System: Service Day

## Overview

**Creative North Star: "The Volunteer Roster"**

A clean roster on a cool desk on the morning of Service Day: names, places, deadlines, all in ink, and one green mark beside whatever is filling up. Service Day sits on a cool, faintly green-grey canvas with white cards laid on it like sheets: large soft corners, almost no lines, no shadows at rest. Ink does the acting: the primary button, the page you are on, the filter you chose. Pine does the counting: slot meters, chart bars, the participation gauge. Everything else is ink on white.

This is a working dashboard (Operate). Ambition shows as precision and restraint: confident numbers set large in tabular figures, medium-weight headings, small muted labels, and generous but never empty spacing. Pill-shaped controls and thin line icons keep the surface soft without making it cute. Typography follows `docs/reference/dashboard-reference.png`; the colour mood (ink selection, pale cool canvas, muted pastels for categories) was chosen with the student from a second reference, without its decorative backdrop.

The scene that sets the theme: office staff at a desk in daylight, and on the day itself a phone outdoors, so the default is light. Every value here is the light theme; a dark theme is not part of this build.

**Key Characteristics:**
- Cool light canvas, white cards, flat at rest; depth only on overlays.
- Ink for action and selection; pine for marks that count. Neither is used as decoration.
- Large tabular numerals for anything counted: slots, participation, days left.
- Status is shown with the same small vocabulary everywhere (open, last slots, closing soon, full, closed, cancelled, draft), always with a label.
- Signature details carry the identity: the segmented **slot meter**, the relative + absolute **cut-off label**, the bar-built **participation gauge**, and **initials avatars** on deterministic muted tints for NGOs.

## Colors

Restrained: cool neutrals carry the surface, Ink carries every action and selection, one Pine accent marks what is filling up, and four status hues each come with a soft tint.

### Action
- **Roster Ink** (`action`, same value as `ink`): filled primary buttons, the active navigation item, the selected filter pill and the selected tab, always with white text (`on-action`, 17.8:1). Hover lifts to **Soft Ink** (`action-hover`). There is one dark item per group, so the eye finds where you are and what to press.

### Accent
- **Pine** (`accent`): marks only: chart bars, slot-meter segments, gauge bars, icon tiles, the brand tile. 6.0:1 on white, so it also carries white text on the brand tile.
- **Deep Pine** (`accent-strong`): links, the focus ring, the Sign out link, the bell's unread badge, the checked switch and accent-coloured text. 8.7:1 on white, 7.3:1 on `accent-soft`. Hover darkens to `accent-strong-hover`.
- **Pine Wash** (`accent-soft`): icon tiles, the selected choice card, offset chips, unread notice tiles, text selection.

### Neutral
- **Cool Canvas** (`canvas`): the app background behind all cards.
- **Paper White** (`surface`): cards, sidebar, top bar.
- **Sunken Paper** (`surface-sunken`): inputs, table header row, inner tiles inside cards.
- **Hairline** (`hairline`): dividers, the capacity track in charts and the hover of navigation items; never card outlines.
- **Strong Hairline** (`hairline-strong`): empty slot-meter segments, quiet outlines on secondary buttons, filter pills and the bell.
- **Field Edge** (`control-border`): the 1px edge of text fields, selects and the search pill (3.53:1 on white, 3.29:1 on sunken paper), so a field reads as a field (WCAG 1.4.11).
- **Ink** (`ink`): primary text and numbers.
- **Muted Ink** (`ink-muted`): secondary text, labels, captions (5.5:1 on canvas).
- **Faint Ink** (`ink-faint`): placeholders and chart axis labels, on `surface` or `surface-sunken` only.

### Status
- **Leaf Green** (`success` / `success-soft`): open, checked in, positive delta. Yellow-green, a different hue from Pine, and always shown with a label.
- **Harvest Amber** (`warning` / `warning-soft`): last slots, closing soon.
- **Brick Red** (`danger` / `danger-soft`): full, destructive actions, errors; cancelled uses a danger outline.
- **Clear Blue** (`info` / `info-soft`): neutral information, draft.
- Closed uses neutral: `ink-muted` on `surface-sunken`.

### NGO tints
Six muted tints (**Sage, Sky, Clay, Butter, Rose, Lilac**) behind initials avatars. The tint is picked deterministically from the NGO's id, so an NGO keeps its colour everywhere; initials stay in Ink (at least 14:1).

### Named Rules
**The One Dark Item Rule.** In any group (navigation, filters, tabs, a card's actions) at most one element is filled with Ink: the current or primary one. Hover never fills with Ink; it uses Hairline or Sunken Paper, so the current item stays unmistakable.

**The Pine Counts Rule.** Pine appears on marks that measure something (places, participation, fill), never as a fill behind content areas or as decoration. Success keeps its own leaf-green hue so "open" never reads as "pine".

**The Contrast Rule.** Every text/background pair in this palette is at least 4.5:1 and every control edge at least 3:1; keep it that way when adding tokens.

**The No Hard-Coding Rule.** Component CSS uses these tokens through CSS custom properties in `src/styles/tokens.css`; no hex values, font sizes or radii in component files. Canvas-drawn things (the Fill by NGO chart, the QR code and its PNG poster) read the same tokens with `getComputedStyle`.

**The Field Edge Rule.** Anything you type into gets the `control-border` edge. Buttons and pills don't: their label identifies them, so they keep the quiet `hairline-strong` outline or none.

## Typography

**Display Font:** Instrument Sans Variable (with system-ui, sans-serif)
**Body Font:** Instrument Sans Variable (with system-ui, sans-serif)

**Character:** One self-hosted grotesque doing every job, kept to weights 400, 500 and 600. Its slightly narrow, friendly shapes keep big numbers confident and small labels legible.

### Hierarchy
- **Display** (500, 64px/1, tabular): one place only, the date tile in the employee's "Your Service Day" card.
- **KPI** (500, 40/44px, −0.01em, tabular): slot counts, participation %, days until Service Day.
- **H1** (500, 28/34px, −0.01em): the page greeting or page title in the top bar.
- **H2** (500, 20/28px): card titles.
- **H3** (500, 16/24px): sub-sections, table titles.
- **Body** (400, 15/22px): default text; keep long descriptions to about 70ch.
- **Small** (400, 13/18px): labels, meta, captions, helper text.
- **Micro** (500, 12/16px): status pills, deltas, the "Urgent" label and badge counts.

Text inside form fields is 15px, rising to 16px on phones so iOS Safari doesn't zoom when a field gets focus. The top bar holds the page's only h1; card titles are h2 and sections inside cards h3, with visually hidden h2s where a list has no visible heading.

### Named Rules
**The Sentence Case Rule.** Sentence case everywhere: headings, buttons, labels, pills. No all-caps labels, no tracked-out eyebrows.

**The Tabular Rule.** Every number that can change or be compared uses `font-variant-numeric: tabular-nums`, so live counts don't jitter.

**The Three Weights Rule.** Only 400, 500 and 600. Headings are 500; 600 is reserved for rare emphasis inside text.

## Layout

Flexbox only, on every page (a graded criterion): no CSS Grid. Card collections use `flex-wrap` with `gap`.

- **Shell:** a flex row. The sidebar (264px, sticky) is its own white card with 20px radius, inset 16px from the viewport edge like the reference. The main column (`flex: 1`) is a column flex: the top-bar card, then content.
- **Top bar:** greeting block (H1 + small subtitle) on the left; notification bell and profile chip (initials avatar, name, role) on the right, grouped in pills.
- **KPI row:** wrapping flex, each card `flex: 1 1 220px`.
- **Two-column sections:** `flex: 2 1 560px` beside `flex: 1 1 320px`, wrapping to one column when narrow.
- **Rhythm:** a 4-based spacing scale (4–56px). Card padding 24px (20px on mobile); gap between cards 20px (16px on mobile). More space above a section heading than below it.
- **Single-task pages** (check in, the outcome of a check-in) centre one card at most 560px wide instead of filling the column.
- **Forms** sit in one card, grouped into fieldsets with a hairline between groups; fields share a wrapping row where they belong together (date · start · end).
- **Responsive:** verified at 1440, 1024, 768 and 390px with no horizontal page scroll. Below 900px the sidebar becomes an off-canvas drawer opened from a menu button in the top bar. Below 600px tables become stacked rows (label left, value right) and filter pills scroll horizontally inside their own container. The admin activities table adapts to its card instead of the window: below an 880px card width each row becomes a two-line flex row (title · status · actions, then schedule · fill), and below 520px the title takes its own line.
- **Long content** wraps: `overflow-wrap: break-word` on the body, `anywhere` in flex rows and table titles. Names, NGO titles and locations are never cut off with an ellipsis.

### Named Rules
**The Stacked Row Rule.** A table never makes the page scroll sideways. When it doesn't fit, its rows become stacked blocks; the data stays, the columns go.

## Elevation & Depth

Flat by default. Depth comes from tone: white cards on the cool canvas, sunken tiles inside cards. Shadows exist only on things that float above the page.

### Shadow Vocabulary
- **Overlay** (`box-shadow: 0 12px 32px rgb(21 25 23 / 0.10)`): drawers, dialogs, the row-actions menu, the notification dropdown and toasts. Nothing else.

Dialogs and drawers use the native modal `<dialog>` over an ink scrim (`rgb(21 25 23 / 0.36)`); menus and the notification dropdown are native popovers placed under their trigger.

### Named Rules
**The Flat Table Rule.** Cards never get borders or shadows at rest. If a card needs separation, adjust the surface tone, not a line.

Motion is quiet: 150ms for hover and press, 200ms for opening, on one exponential ease-out (`cubic-bezier(0.22, 1, 0.36, 1)`). Overlays fade in and slide 4–16px; slot meters and distribution bars ease to their new value when a poll changes them. With `prefers-reduced-motion` every transition becomes instant: state still changes, only the movement goes.

## Shapes

Soft, generous corners in four sizes, one per kind of object:
- **Cards** (20px): every top-level card, the sidebar and the top bar.
- **Tiles** (14px): inner tiles inside a card, icon tiles, small stat blocks.
- **Inputs** (12px): text fields, selects, text areas, menu items.
- **Controls** (fully rounded, 999px): buttons, pills, search field, segmented filters, the profile chip.

Borders are reserved for dividers (`hairline`), field edges (`control-border`) and the cancelled-status outline. Icons are Lucide line icons at 1.75 stroke: 18px in nav and buttons, 16px inside small buttons and lists, 20px in KPI tiles.

## Components

Refined and restrained: soft pills and sheets, one filled colour for the primary action, and states that always say what is going on.

### Buttons
- **Shape:** fully rounded pills (999px); 40px tall, 32px for the small size.
- **Primary:** Roster Ink fill with white text, Soft Ink on hover, 20px side padding (16px small). One primary action per card.
- **Secondary:** Sunken Paper with a Strong Hairline inset outline and Ink text; for the second action or a lone action that isn't the main one.
- **Ghost:** no fill, Muted Ink text; Sunken Paper on hover. A lone ghost link in a card header is pulled out by its own padding so its text lines up with the content edge.
- **Danger:** Brick Red fill with white text, only inside a confirm dialog for a destructive step.
- **Disabled:** Sunken Paper with Muted Ink and no outline; always paired with a sentence saying why.
- **Busy:** the label changes ("Saving…", "Working…") and the button is disabled; a second click does nothing.
- **Focus:** a 2px Deep Pine ring, 2px offset, on every interactive element.

### Chips and pills
- **Status pill** (24px, micro type, soft tint with a 6px dot in the status colour): open, last slots, closing soon, full, closed, cancelled (danger outline), draft; also On time, Late, Not arrived, Verified, Checked in.
- **Filter pill** (36px): Sunken Paper with a Strong Hairline outline; Hairline on hover; selected turns Roster Ink with white text. Counts sit inside in tabular figures.
- **Offset chip** (Schedule tab): Pine Wash with Deep Pine text and a small remove button.

### Cards / Containers
- **Corner Style:** 20px.
- **Background:** Paper White on Cool Canvas.
- **Shadow Strategy:** none at rest (see Elevation & Depth).
- **Border:** none.
- **Internal Padding:** 24px (20px on phones); gap between cards 20px (16px).
- **Sunken tile:** Sunken Paper, 14px corners, 16px padding, for numbers and previews inside a card (week tiles, check-in counters, the inbox preview).

### Inputs / Fields
- **Style:** Sunken Paper fill, 1px Field Edge, 12px corners, 40px tall. The search field is a pill with the same edge and a leading icon.
- **Focus:** the edge and ring turn Deep Pine; the search pill shows the ring on the whole pill.
- **Error:** a Brick Red sentence under the field that says what is wrong and how to fix it, linked with `aria-describedby`; focus moves to the first invalid field.
- **Choice cards:** radio options as Sunken Paper tiles (14px corners) with a title and a muted line; selected turns Pine Wash with a Pine edge.
- **Switch:** a 36×20 pill track (Faint Ink, Deep Pine when on) with a white thumb.

### Navigation
- **Sidebar:** its own white card. Items are 44px tall, body type, 14px corners; hover is Hairline; the active item is filled with Roster Ink, white text and icon, medium weight. "How it works" and Sign out (Deep Pine) sit at the bottom.
- **Top bar:** the page h1 and a small subtitle on the left; the notification bell (outlined pill button with a Deep Pine count badge) and the profile chip on the right. Below 900px a menu button opens the same sidebar in a drawer.
- **Tabs:** a segmented pill on Sunken Paper; the selected tab is a Roster Ink pill with white text. Arrow keys move between tabs; the selected tab lives in the URL.

### Slot meter (signature)
A thin bar with one segment per slot (up to 20; a continuous bar above that) and a tabular line under it: "3 of 12 left". Plenty is Pine, last slots Harvest Amber, full Brick Red ("Full · 15 of 15 taken"); closed and draft activities use a muted Faint Ink fill.

### Cut-off label (signature)
Relative and absolute together: "Closes in 2 days · 18 Nov, 17:00", and after the cut-off "Closed 18 Nov, 17:00". Used on cards, tables, the detail page and the Schedule preview.

### Participation gauge (signature)
A semicircle of 20 short rounded bars, filled in Pine in proportion to staff participation, with the percentage in KPI type in its open bottom and two week tiles under it.

### Initials avatar (signature)
Initials in Ink on one of the six NGO tints, chosen from the id. Round for people, a 14px tile for NGOs.

### Notice
A row with a 32px icon tile (Pine Wash when unread, Brick Red tint when urgent), the title (heavier when unread), an optional muted message, the time, and an 8px unread dot. The same row is used in the inbox, the bell dropdown, the broadcast preview and the admin history.

### Empty, loading and error states
Empty states sit start-aligned with a 44px icon tile, a heading, one sentence that says what to do next, and an action. Loading uses skeleton lines in the shape of the content. Error states name the problem and say the page retries on its own (or offer "Try again"); toasts appear once, not on every failed poll.

## Do's and Don'ts

### Do:
- **Do** keep Ink for action and selection, Pine for marks that count, and use `accent-strong` for any pine-coloured text.
- **Do** give every data view a loading skeleton, an empty state that says what to do next, and an error state.
- **Do** explain every disabled action in a sentence ("Registration closed on 18 Nov, 17:00").
- **Do** show deadlines relative and absolute together: "Closes in 2 days · 18 Nov, 17:00".
- **Do** let card sizes follow their content and importance; a KPI row and a chart card are not the same weight.
- **Do** keep a visible `:focus-visible` ring on every interactive element.
- **Do** give text fields the Field Edge (`control-border`) and keep every interactive target at least 24px.
- **Do** put the number in tabular figures and the meaning in a muted label next to it ("50 of 64 staff have a place").

### Don't:
- **Don't** use decorative gradients, glassmorphism or blur panels, or purple-blue palettes.
- **Don't** use emoji as icons, heavy drop shadows, or decorative illustrations that carry no information.
- **Don't** fill screens with identical cards in a uniform grid, or center everything.
- **Don't** use all-caps headings or put an icon on every heading.
- **Don't** use lorem ipsum or placeholder names ("Activity 1", "John Doe"); seed content is specific and fictional.
- **Don't** reproduce the look of a Bootstrap admin template or Material defaults.
- **Don't** cut names, titles or places off with an ellipsis; let them wrap.
- **Don't** line up a column of red "Delete" buttons; destructive actions go in the row's ⋯ menu and through a confirm dialog.
