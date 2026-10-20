---
name: Salas UC Operational Intelligence
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#444651'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#747683'
  outline-variant: '#c4c6d3'
  surface-tint: '#3d5aad'
  primary: '#001851'
  on-primary: '#ffffff'
  primary-container: '#002b7f'
  on-primary-container: '#7c97ef'
  inverse-primary: '#b5c4ff'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#00240a'
  on-tertiary: '#ffffff'
  tertiary-container: '#003c16'
  on-tertiary-container: '#2eb156'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b5c4ff'
  on-primary-fixed: '#00174c'
  on-primary-fixed-variant: '#224194'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#7ffc97'
  tertiary-fixed-dim: '#62df7d'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005320'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-hero:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-base:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-mono:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  badge-status:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system defines a high-density, real-time spatial status platform for the Pontificia Universidad Católica de Chile across major academic sectors (A, B, BC, C, and K). Drawing aesthetic and functional cues from modern enterprise benchmarks like Linear, Notion, and Stripe, the aesthetic marries institutional academic prestige with the crisp utility of developer-grade operations tools.

The interface communicates immediacy, absolute operational clarity, and reliability. Designed primarily for students, faculty, and administrative staff who need to determine classroom availability in seconds, the platform rejects decorative noise, interactive booking workflows, and complex spatial mapping in favor of scannable data grids, explicit typographic hierarchy, and unmistakable state signaling. The visual tone is structured, calm, and rigorous, pairing deep university navy with modern slate neutrals and high-contrast accessibility tags.

## Colors

The color architecture is built around the institutional authority of UC Blue, supported by an expressive operational spectrum that guarantees WCAG AAA legibility across all ambient lighting conditions found on campus.

### Brand & Interactive Foundation
- **Primary Navy (`#002B7F` / `#0038A8`):** The institutional anchor. Used for primary navigation states, structural headers, high-importance counters, and active structural filters.
- **Vibrant Accent (`#2563EB` / `#1D4ED8`):** The digital workhorse. Applied to keyboard focus rings, active tab segments, interactive row indicators, and link hovers.
- **Neutral Scale:** Grounded in cool slate tones:
  - Surface Canvas: `#F8FAFC`
  - Elevated Card Background: `#FFFFFF`
  - Subtle Borders & Dividers: `#E2E8F0`
  - Muted Detail / Metadata: `#64748B`
  - Secondary Typography / Body: `#334155`
  - Deep Display Ink: `#0F172A`

### Room Status Tokens
Status indicators must strictly adhere to a high-contrast container-and-ink pairing:
- **Disponible (Available):** Text `#15803D`, Surface `#DCFCE7`, Border `#86EFAC`
- **Disponible próximamente (Free Soon / Transitioning):** Text `#B45309`, Surface `#FEF3C7`, Border `#FDE68A`
- **Ocupada (Occupied):** Text `#BE123C`, Surface `#FFE4E6`, Border `#FDA4AF`
- **Sin datos (No Data / Out of Schedule):** Text `#475569`, Surface `#F1F5F9`, Border `#CBD5E1`

## Typography

Typography relies entirely on the precise, mechanical rhythm of `Geist`. Engineered for density, tabular numeric balance, and fast scanning, it creates a modern academic operating tool.

### Typographic Hierarchy
- **Sector Displays & Room Keys:** Display headers and Sector IDs (A, B, BC, C, K) leverage tighter negative letter spacing and medium-to-bold weights to anchor visual hierarchy quickly.
- **Numbers & Metrics:** Tabular numeric features (`tnum`) must be enforced across all room numbers, occupancy timestamps, countdown intervals, and capacity counts.
- **Status Text:** Status badges use uppercase rendering with positive letter tracking (+0.04em) at compact sizes (11px) to preserve immediate readability without overwhelming the core room code.

## Layout & Spacing

The structural layout utilizes a fluid-responsive responsive model designed mobile-first for on-the-go room discovery, scaling effortlessly to high-density desktop monitoring dashboards for campus facilities administrators.

### Layout Breakpoints
- **Mobile (< 640px):** Single-column layout. Margin set to `margin` (16px), stacked room cards, sticky top sector bar with horizontal chip overflow. Touch targets maintain a minimum 44px height.
- **Tablet (640px - 1023px):** Two-column card grid or full-width dense list view. Margin scales to `margin-tablet` (24px) with `gutter` (16px).
- **Desktop (≥ 1024px):** Three or four-column dynamic grid, or an administrative compact table view. Margin set to `margin-desktop` (40px) with `gutter-desktop` (24px). Sidebar filters remain pinned on the left with an independent scrolling inventory.

### Layout Principles
Spacing between related elements (such as room codes and capacity metrics) adheres strictly to the tighter 4px/8px increments (`space-xs`, `space-sm`), while card padding leverages `space-lg` (20px) to balance density with breathing room.

## Elevation & Depth

To avoid visual fatigue and maintain the lightweight feel of Linear and Notion, this design system limits elevation to low-contrast outlines combined with micro ambient shadows.

### Spatial Layering
1. **Canvas Surface (Base):** `#F8FAFC`. Provides a cool, light-gray baseline contrast for cards to sit upon.
2. **Interactive Cards (Rest):** Pure `#FFFFFF` background bound by a 1px border of `#E2E8F0` and an ultra-soft ambient shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`.
3. **Card Hover & Focus:** The border shifts cleanly to `#CBD5E1` while the shadow rises imperceptibly: `0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`.
4. **Sticky Navigation & Filters:** Translucent `#FFFFFF` at 85% opacity with an active `backdrop-filter: blur(8px)` and a crisp bottom edge border of `#E2E8F0`. No shadow is applied to sticky navigation bars to keep lines architectural and razor-sharp.

## Shapes

The geometric framework balances contemporary software sharpness with ergonomic clarity. 

- **Cards & Data Panels:** Styled with an exact 8px radius (`0.5rem`), matching contemporary enterprise data tools.
- **Badges, Tags & Segment Controls:** Scaled between 4px (`0.25rem`) and 6px (`0.375rem`) to frame status indicators crisply without turning them into full pills, maintaining a systematic, data-dense look.
- **Slight Exceptions:** Status indicator dots within badges are true circles (`rounded-full`), functioning as unambiguous physical status beacons.

## Components

### 1. Room Status Card
- **Structure:** Clean 8px bordered container `#FFFFFF` with 16px internal padding (`space-lg` desktop, `space-md` mobile).
- **Header:** Displays the Sector and Room ID (e.g., `A-102`, `BC-304`) in `headline-sm` (`#0F172A`), paired with the high-contrast status badge in the top right.
- **Body Metadata:** Capacity icon with seat count, air conditioning/projector micro-labels, and current scheduled block timeframe (`08:30 - 10:00`) in `body-sm` (`#64748B`).
- **Footer:** Dynamic operational countdown (e.g., "Disponible por los próximos 45 min" or "Ocupada hasta las 11:20") rendered in bold tabular type.

### 2. Status Badges & Pills
- Small-scale badges (height 22px) pairing an embedded 6px pulsing or solid dot with tracking-adjusted label text.
- **Variants:**
  - *Disponible:* `#DCFCE7` background, `#15803D` text, `#86EFAC` border.
  - *Disponible próximamente:* `#FEF3C7` background, `#B45309` text, `#FDE68A` border.
  - *Ocupada:* `#FFE4E6` background, `#BE123C` text, `#FDA4AF` border.
  - *Sin datos:* `#F1F5F9` background, `#475569` text, `#CBD5E1` border.

### 3. Sector Switcher (Segmented Control)
- Persistent horizontal selector allowing immediate filtering between: `Todos`, `Sector A`, `Sector B`, `Sector BC`, `Sector C`, `Sector K`.
- Inactive segments feature transparent backgrounds with `#475569` text. Active segments take on UC Navy (`#002B7F`) with pure white text and an internal micro-counter badge indicating available rooms per sector.

### 4. Search & Filter Input Bar
- Integrated search field with instantaneous typeahead for quick room lookups.
- Bordered with 1px `#E2E8F0`, shifting to a 2px `#2563EB` ring upon focus. Includes keyboard shortcut hints (e.g., `Cmd + K` or `/`) on desktop screens.

### 5. Density Toggle (Admin & Power-User View)
- A segmented toggle switching between standard "Card Grid" and a high-density "Admin List Table."
- The Admin Table collapses vertical space, prioritizing sortable columns: Sector, Room, Real-Time Status, Current Capacity, Next Transition, and Verified Timestamp.