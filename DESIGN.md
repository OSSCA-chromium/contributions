# DESIGN.md — Google I/O theme

## Overview

Google I/O's marketing design is confident but clean. Pages sit on a white canvas (`{colors.background}`) with deep Google-grey ink (`{colors.on-surface}` — #202124), and colour arrives through the four-colour Google chord — blue, green, yellow, red — used as accents, chart hues, and gradient washes, never as heavy colour fields. The signature atmospheric move is a soft pastel mesh of the four brand colours behind the hero, and a Chromium-blue gradient (`#1767d1 → #679ef5`, from the official Chromium logo blues) on marquee text.

The brand anchor is **Google Blue** (`{colors.primary}` — #1a73e8 for actions, #4285f4 in charts/gradients). It owns every CTA, active filter, link… the other three colours support: green for success/merged, yellow for drafts/warnings, red strictly for deadlines/errors. Dark mode mirrors Google's dark theme: near-black grey surfaces (#202124 / #292a2d) with the softened accent set (#8ab4f8, #81c995, #fdd663, #f28b82).

Geometry is friendly and pill-first: buttons and chips are fully rounded (`{rounded.pill}`), cards round at 16–32px, and the hero panel bows out at 32px+. Type is Google Sans in spirit — headlines in a geometric grotesque at 500–700, **sentence case, never all-caps** — over a quiet grotesque body face.

**Key Characteristics:**

- White canvas, grey ink; colour comes from the four-colour chord as accents, not fields.
- One action colour: Google Blue `{colors.primary}` for every CTA, active state, and link.
- Pastel four-colour gradient mesh behind the hero; Chromium-blue gradient on display text.
- Sentence-case headlines in `{typography.display}` (Outfit 600–700 as the Google Sans stand-in).
- Pill buttons and chips everywhere; cards at `{rounded.lg}`–`{rounded.xl}`.
- Dark mode is Google-dark: #202124 canvas, #8ab4f8 blue, softened accents.

## Colors

> Source: io.google/2025 markup + global.css (verified hexes: #4285f4, #34a853, #ea4335, #fbbc04, #1a73e8, body ink rgb(32 33 36), pill radius 100px, gradient #34a853→#4285f4).

### Brand & Accent

- **Google Blue (action)** (`{colors.primary}` — light #1a73e8 / dark #8ab4f8): every CTA, active filter, link, focus ring.
- **Chart Blue** (`{chart.bar}` — #4285f4 light / #8ab4f8 dark): charts and gradients.
- **Green** (`{colors.success}` — light #188038 text · #34a853 fills / dark #81c995): merged status, success stats.
- **Yellow** (`{colors.warning}` — light #f9ab00 / dark #fdd663): draft status, caution badges — always with dark ink text.
- **Red** (`{colors.error}` — light #d93025 / dark #f28b82): deadlines only. Never decorative.

### Surface

- **Canvas** (`{colors.background}` — light #ffffff / dark #202124): the page base.
- **Surface** (`{colors.surface}` — light #f8f9fa / dark #292a2d): cards, rows, inputs.
- **Surface Variant** (`{colors.surface-variant}` — light #f1f3f4 / dark #3c4043): inactive chips, hovers.
- **Outline** (`{colors.outline}` — light #dadce0 / dark #5f6368): hairline borders.

### Text

- **Ink** (`{colors.on-surface}` — light #202124 / dark #e8eaed): headlines and body.
- **Muted Ink** (`{colors.on-surface-variant}` — light #5f6368 / dark #9aa0a6): secondary copy, captions.
- **On Primary** (`{colors.on-primary}` — light #ffffff / dark #202124): text on blue fills.

### Containers

- **Blue Container** (`{colors.primary-container}` — light #e8f0fe / dark #28374e): label chips, active sidebar items, soft-blue tints.

### Brand Gradient & Mesh

- Display-text gradient: Chromium blues, left to right — light `#1767d1 → #679ef5`, dark `#8ab4f8 → #c6dafc`.
- Hero mesh: soft radial washes of pastel blue/green/yellow/red on the canvas — light and airy in light mode, dimmed to ~15% over the dark canvas in dark mode.

## Typography

### Font Family

- **Display**: Google Sans → open substitute **Outfit** (500/600/700). Geometric, round, unmistakably Google-flavoured.
- **Body/UI**: Google Sans Text → open substitute **Roboto** (400/500). Korean text falls back to system sans.

### Hierarchy

| Token                   | Size    | Weight | Case          | Use                                   |
| ----------------------- | ------- | ------ | ------------- | ------------------------------------- |
| `{typography.display}`  | 44–60px | 700    | Sentence case | Hero headline (gradient text allowed) |
| `{typography.headline}` | 28–32px | 600    | Sentence case | Page/section titles                   |
| `{typography.title}`    | 20–24px | 600    | Sentence case | Card/sub-section titles               |
| `{typography.body-lg}`  | 18px    | 400    | —             | Lead paragraph                        |
| `{typography.body}`     | 16px    | 400    | —             | Default copy                          |
| `{typography.label}`    | 14px    | 500    | —             | Buttons, nav links, chips             |
| `{typography.caption}`  | 12px    | 500    | —             | Badges, fine print                    |

### Principles

- Headlines are sentence case — **never all-caps** — with normal tracking.
- Hierarchy comes from size and the display face, not from weight extremes.
- One gradient headline per page maximum (the hero).

## Layout

- **Spacing base**: 8px. Card interiors 24–32px; buttons pad 10–12px vertical × 24px horizontal.
- Centered max-width column (~1200px) on the full-bleed canvas.
- Sections breathe with generous white space; separation via hairline `{colors.outline}` borders, not colour bands.
- Responsive: single column < 768px; pills and CTAs stay pill-shaped at every width.

## Elevation & Depth

| Level       | Treatment                                         | Use                |
| ----------- | ------------------------------------------------- | ------------------ |
| 0 — Flat    | Hairline border, no shadow                        | Cards, rows, chips |
| 1 — Hover   | Border darkens to `{colors.primary}` or shadow-sm | Interactive cards  |
| 2 — Overlay | `shadow-lg` + border                              | Popovers, menus    |

Depth comes from borders and subtle tint changes — Google I/O barely uses shadows.

## Shapes

| Token            | Value   | Use                                 |
| ---------------- | ------- | ----------------------------------- |
| `{rounded.sm}`   | 8px     | Inputs' inner elements, small chips |
| `{rounded.md}`   | 12px    | Selects, compact controls           |
| `{rounded.lg}`   | 16px    | Cards, popovers, media              |
| `{rounded.xl}`   | 24–32px | Hero panel, stat cards, chart cards |
| `{rounded.pill}` | 9999px  | Buttons, filter chips, badges       |
| `{rounded.full}` | 100%    | Avatars, icon buttons               |

## Components

### Buttons

- **`button-primary`** — blue pill CTA: bg `{colors.primary}`, text `{colors.on-primary}`, `{rounded.pill}`, padding 10–12px × 24px.
- **`button-outline`** — secondary pill: transparent bg, 1px `{colors.outline}` border, ink text; hover tints `{colors.surface-variant}`.

### Chips & Badges

- **`filter-chip`** — pill; active = blue fill + on-primary text, inactive = `{colors.surface-variant}` + muted ink.
- **`status-badge`** — pill, caption type: merged = green fill (+white/dark-ink per mode), in review = blue fill, draft = yellow fill + dark ink.
- **`label-chip`** — `{colors.primary-container}` fill + blue text.

### Cards & Containers

- **`hero`** — canvas panel at `{rounded.xl}` washed by the four-colour pastel mesh; sentence-case display headline (gradient text), lead paragraph, primary + outline CTA pair.
- **`stat-card`** — `{colors.surface}` card, hairline border, `{rounded.xl}`; big display number coloured blue/green/amber per metric.
- **`content-card`** — surface card, `{rounded.lg}`, hover raises border to blue.
- **`chart-card`** — surface card, `{rounded.xl}`, tooltip follows surface tokens.

### Navigation

- **`nav-bar`** — white/canvas bar, hairline bottom border, ink links, one blue pill CTA (GitHub), sticky.
- **`footer`** — hairline top border; a Chromium-logo strip of three blues (#1a74e7 / #679ef5 / #afccf9 segments, from the official Chromium logo) as the brand signature; link row + copyright. No giant wordmark.

## Do's and Don'ts

### Do

- Keep the canvas white (light) / Google-grey #202124 (dark); let whitespace carry the layout.
- Use `{colors.primary}` blue for every action; the other three colours are semantic accents only.
- Round buttons and chips fully; round cards generously.
- Use the Chromium-blue gradient on at most the hero headline.
- Set headlines in sentence case with the display face.

### Don't

- Don't use all-caps headlines or heavy 800 weights — that's not Google's voice.
- Don't paint large surfaces in brand colours; colour is an accent, not a field.
- Don't introduce colours outside the four-colour chord (+ grey ramp).
- Don't use red for anything except deadlines/errors.
- Don't lean on drop shadows; hairline borders and tints do the separation.
