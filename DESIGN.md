# Design System — FisioLux

## Mood

Quiet clinical instrument — cool teal signal of care on a pure dark workspace for long clinic days.

## Color strategy

Restrained. Neutrals carry the UI; primary teal ≤10% for actions, selection and brand mark.

## Colors (OKLCH)

### Dark (default)

| Token | Value | Role |
| --- | --- | --- |
| `--bg` | `oklch(0.145 0 0)` | App background |
| `--surface` | `oklch(0.185 0.004 160)` | Sidebar / panels |
| `--surface-raised` | `oklch(0.215 0.005 160)` | Elevated panels |
| `--border` | `oklch(0.28 0.008 160)` | Hairlines |
| `--ink` | `oklch(0.96 0.005 160)` | Body text |
| `--muted` | `oklch(0.68 0.015 160)` | Secondary text |
| `--subtle` | `oklch(0.52 0.012 160)` | Tertiary / placeholders |
| `--primary` | `oklch(0.72 0.12 160)` | Brand / CTA |
| `--primary-fg` | `oklch(0.16 0.02 160)` | Text on primary |
| `--accent` | `oklch(0.70 0.09 220)` | Links / info |
| `--danger` | `oklch(0.63 0.19 25)` | Errors |
| `--success` | `oklch(0.72 0.14 155)` | Success |

### Light

| Token | Value |
| --- | --- |
| `--bg` | `oklch(0.99 0 0)` |
| `--surface` | `oklch(0.97 0.004 160)` |
| `--surface-raised` | `oklch(1 0 0)` |
| `--border` | `oklch(0.88 0.008 160)` |
| `--ink` | `oklch(0.22 0.02 160)` |
| `--muted` | `oklch(0.45 0.02 160)` |
| `--subtle` | `oklch(0.55 0.015 160)` |
| `--primary` | `oklch(0.45 0.11 160)` |
| `--primary-fg` | `oklch(0.99 0 0)` |
| `--accent` | `oklch(0.48 0.12 220)` |

## Typography

- Family: **Plus Jakarta Sans** (única família)
- Scale ratio ~1.2: 12 / 14 / 16 / 18 / 20 / 24
- Labels and nav: medium weight; body: regular

## Layout

- App shell: sidebar 240px + top header 56px
- Content max readable width for prose; full width for lists
- Mobile: sidebar → drawer

## Components

- Buttons: default, primary, ghost, danger — all with hover/focus/disabled
- Inputs with visible focus ring (primary)
- Nav items: idle / hover / active
- Breadcrumb subtle separators
- Cards only when they contain interaction or a clear panel job

## Motion

- 150–200ms ease-out on sidebar/drawer and hover states
- Respect `prefers-reduced-motion`
