---
name: Service Day
description: Halden & Co.'s volunteering-day dashboard — warm, calm, and exact about slots and deadlines.
colors:
  canvas: "#F4F3F1"
  surface: "#FFFFFF"
  surface-sunken: "#F7F6F4"
  hairline: "#ECEAE6"
  ink: "#1C1B19"
  ink-muted: "#6B6965"
  ink-faint: "#73716C"
  accent: "#E8692C"
  accent-strong: "#B24D19"
  accent-soft: "#FDEDE4"
  success: "#1A7B45"
  success-soft: "#E5F4EA"
  warning: "#986000"
  warning-soft: "#FBF1DC"
  danger: "#C2352C"
  danger-soft: "#FBE9E7"
  info: "#2F5FC4"
  info-soft: "#E8EFFB"
typography:
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
---

<!-- SEED: established with the user before implementation; re-run $impeccable document once there's code to capture the actual tokens and components. -->

# Design System: Service Day

## Overview

**Creative North Star: "Morning of Service Day"**

The light just before volunteers head out: a warm, quiet room, everything prepared, one clear thing to do next. Service Day sits on a warm light-grey canvas with white cards laid on it like sheets on a table: large soft corners, almost no lines, no shadows at rest. A single terracotta accent shows up the way morning sun does, on a few things only: the active place in the navigation, the bars of a chart, a KPI that matters. Everything else is ink on white.

This is a working dashboard (Operate). Ambition shows as precision and restraint: confident numbers set large in tabular figures, medium-weight headings, small muted labels, and generous but never empty spacing. Pill-shaped controls and thin line icons keep the surface soft without making it cute. Taste and typography follow `docs/reference/dashboard-reference.png`; its content, layout specifics and orange-on-everything usage do not carry over.

The scene that sets the theme: office staff at a desk in daylight, and on the day itself a phone outdoors. So the default is light and warm. A dark theme comes later as an equal alternative (Phase 10), not a restyle.

**Key Characteristics:**
- Warm light-grey canvas, white cards, flat at rest; depth only on overlays.
- One accent, used sparingly and only for large marks; text in the accent always uses the stronger tone.
- Large tabular numerals for anything counted: slots, participation, days left.
- Status is shown with the same small vocabulary everywhere (open, last slots, closing soon, full, closed, cancelled, draft).
- Signature details carry the identity: the segmented **slot meter**, the relative + absolute **cut-off label**, the bar-built **participation gauge**, and **initials avatars** on deterministic soft tints for NGOs.

## Colors

Restrained: warm neutrals carry the surface, one terracotta accent marks what matters, and four status hues each come with a soft tint.

### Primary
- **Morning Terracotta** (`accent`): large marks only — chart bars, icons, the active-nav marker, KPI accents, gauge bars. Never body text (3.24:1 on white).
- **Fired Clay** (`accent-strong`): every accent-coloured text, links, filled primary buttons with white text, the Sign out link. Meets 4.5:1 on white and on `accent-soft`.
- **Apricot Wash** (`accent-soft`): active nav background, icon tiles, selected pill.

### Neutral
- **Linen Canvas** (`canvas`): the app background behind all cards.
- **Paper White** (`surface`): cards, sidebar, top bar.
- **Sunken Linen** (`surface-sunken`): inputs, table header row, inner tiles inside cards.
- **Hairline** (`hairline`): dividers only, never card outlines.
- **Ink** (`ink`): primary text and numbers.
- **Muted Ink** (`ink-muted`): secondary text, labels, captions.
- **Faint Ink** (`ink-faint`): placeholders and chart axis labels, on `surface` or `surface-sunken` only.

### Status
- **Field Green** (`success` / `success-soft`): open, checked in, positive delta.
- **Harvest Amber** (`warning` / `warning-soft`): last slots, closing soon.
- **Brick Red** (`danger` / `danger-soft`): full, destructive actions, errors; cancelled uses a danger outline.
- **Clear Blue** (`info` / `info-soft`): neutral information, draft.
- Closed uses neutral: `ink-muted` on `surface-sunken`.

### Named Rules
**The Morning Sun Rule.** The accent appears on a few large marks per screen, never as a fill behind content areas. If more than one card on a screen is dominated by terracotta, remove it from all but the most important.

**The Strong Tone Rule.** Any text that wants to be terracotta uses `accent-strong`, never `accent`. Every text/background pair in this palette is at least 4.5:1; keep it that way when adding tokens.

**The No Hard-Coding Rule.** Component CSS uses these tokens through CSS custom properties in `src/styles/tokens.css`; no hex values, font sizes or radii in component files.

## Typography

**Display Font:** Instrument Sans Variable (with system-ui, sans-serif)
**Body Font:** Instrument Sans Variable (with system-ui, sans-serif)

**Character:** One self-hosted grotesque doing every job, kept to weights 400, 500 and 600. Its slightly narrow, friendly shapes keep big numbers confident and small labels legible.

### Hierarchy
- **KPI** (500, 40/44px, −0.01em, tabular): slot counts, participation %, days until Service Day.
- **H1** (500, 28/34px, −0.01em): the page greeting or page title in the top bar.
- **H2** (500, 20/28px): card titles.
- **H3** (500, 16/24px): sub-sections, table titles.
- **Body** (400, 15/22px): default text; keep long descriptions to about 70ch.
- **Small** (400, 13/18px): labels, meta, captions, helper text.
- **Micro** (500, 12/16px): status pills and deltas.

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
- **Responsive:** verified at 1440, 1024, 768 and 390px with no horizontal page scroll. Below 900px the sidebar becomes an off-canvas drawer opened from a menu button in the top bar. Below 600px tables become stacked rows and filter pills scroll horizontally inside their own container.

## Elevation & Depth

Flat by default. Depth comes from tone: white cards on the warm canvas, sunken tiles inside cards. Shadows exist only on things that float above the page.

### Shadow Vocabulary
- **Overlay** (`box-shadow: 0 12px 32px rgb(28 27 25 / 0.10)`): drawer, dialog, dropdown, toast. Nothing else.

### Named Rules
**The Flat Table Rule.** Cards never get borders or shadows at rest. If a card needs separation, adjust the surface tone, not a line.

Motion is quiet: 150–200ms ease-out for hover, press and open; overlays fade and slide a few pixels. `prefers-reduced-motion` turns movement off and keeps simple opacity changes.

## Shapes

Soft, generous corners in four sizes, one per kind of object:
- **Cards** (20px): every top-level card, the sidebar and the top bar.
- **Tiles** (14px): inner tiles inside a card, icon tiles, small stat blocks.
- **Inputs** (12px): text fields, selects, text areas.
- **Controls** (fully rounded, 999px): buttons, pills, search field, segmented filters, the profile chip.

Borders are reserved for dividers (`hairline`) and the cancelled-status outline. Icons are Lucide line icons at 1.75 stroke: 18px in nav and buttons, 20px in KPI tiles.

## Do's and Don'ts

### Do:
- **Do** keep the accent on large marks and use `accent-strong` (never `accent`) for any terracotta text.
- **Do** give every data view a loading skeleton, an empty state that says what to do next, and an error state.
- **Do** explain every disabled action in a sentence ("Registration closed on 18 Nov, 17:00").
- **Do** show deadlines relative and absolute together: "Closes in 2 days · 18 Nov, 17:00".
- **Do** let card sizes follow their content and importance; a KPI row and a chart card are not the same weight.
- **Do** keep a visible `:focus-visible` ring on every interactive element.

### Don't:
- **Don't** use decorative gradients, glassmorphism or blur panels, or purple-blue palettes.
- **Don't** use emoji as icons, heavy drop shadows, or decorative illustrations that carry no information.
- **Don't** fill screens with identical cards in a uniform grid, or center everything.
- **Don't** use all-caps headings or put an icon on every heading.
- **Don't** use lorem ipsum or placeholder names ("Activity 1", "John Doe"); seed content is specific and fictional.
- **Don't** reproduce the look of a Bootstrap admin template or Material defaults.
