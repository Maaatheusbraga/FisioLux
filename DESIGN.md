# Design System — FisioLux

## Mood

Quiet clinical instrument — teal on a light workspace for fluorescent clinic rooms; dark remains available for evening use.

## Color strategy

Restrained. Neutros carregam a UI; teal ≤10% em ação, seleção e marca.

## Colors (OKLCH)

Neutros tintados no hue 160 (teal). Sem branco puro: o workspace tem ar clínico, não papel.

### Light (default)

| Token | Value | Role |
| --- | --- | --- |
| `--bg` | `oklch(0.965 0.014 160)` | App background |
| `--surface` | `oklch(0.948 0.02 160)` | Painéis |
| `--surface-raised` | `oklch(0.985 0.01 160)` | Painéis elevados |
| `--border` | `oklch(0.86 0.024 160)` | Hairlines |
| `--ink` | `oklch(0.22 0.025 160)` | Body text |
| `--muted` | `oklch(0.42 0.03 160)` | Secondary text |
| `--subtle` | `oklch(0.52 0.025 160)` | Tertiary / placeholders |
| `--primary` | `oklch(0.45 0.11 160)` | Brand / CTA |
| `--primary-fg` | `oklch(0.99 0 0)` | Text on primary |
| `--accent` | `oklch(0.48 0.12 220)` | Links / info |
| `--danger` | `oklch(0.55 0.19 25)` | Errors |
| `--success` | `oklch(0.52 0.14 155)` | Success |

### Dark

| Token | Value |
| --- | --- |
| `--bg` | `oklch(0.155 0.014 160)` |
| `--surface` | `oklch(0.19 0.018 160)` |
| `--surface-raised` | `oklch(0.23 0.02 160)` |
| `--border` | `oklch(0.30 0.022 160)` |
| `--ink` | `oklch(0.96 0.012 160)` |
| `--muted` | `oklch(0.70 0.02 160)` |
| `--subtle` | `oklch(0.55 0.018 160)` |
| `--primary` | `oklch(0.72 0.12 160)` |
| `--primary-fg` | `oklch(0.16 0.02 160)` |
| `--accent` | `oklch(0.70 0.09 220)` |

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
