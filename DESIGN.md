# Mert design system

A calm still life on a side table: linen ground, chalk-white ceramic surfaces, smoked green glass for anything secret. Apple-native interaction grammar. Tokens live in `src/styles.css` (`:root`), motion tokens in `src/motion.ts`.

## Color

| Token | Light | Dark | Role |
|---|---|---|---|
| `--ground` | `#f4f1ea` linen | `#161c15` | Page background |
| `--surface` | `#ffffff` | `#212920` | Ceramic panels, buttons |
| `--surface-sunk` | `#ebe8e0` | `#1b2219` | Inputs, rows, unselected tiles |
| `--ink` | `#222b21` | `#eef1ea` | Text |
| `--ink-2` / `--ink-3` | `#4f5a4d` / `#6f786d` | `#c3cbc0` / `#98a395` | Secondary / tertiary text |
| `--accent` | `#3e4a3a` forest | `#d2e0dc` mint | Primary action |
| `--select` | `#d2e0dc` mint | `#34443a` | Selected state fill, ring `--sage` |
| `--sage` | `#7e9e86` | same | Progress, drains, crew verdict flood |
| `--terracotta` | `#a95641` | same | Imposter truth only (peek face, verdict, imposter win) |
| `--honey` | `#b8862f` | same | Timer under 30 seconds |
| glass | `#3f4d3b` to `#26301f` | same | The secret card |

User palette (binding): `#ececec`, `#d2e0dc`, `#a9bcb3`, `#7e9e86`, `#3e4a3a`, plus cream and white.

Rules: terracotta never appears except to reveal imposter truth. Verdict and game-over screens commit color at full-screen scale (flood), never as accents.

## Type

System stack (SF Pro on Apple devices). Display: weight 700 to 750, tracking -0.03em to -0.05em, leading 0.9 to 1.05. Body 17px, weight 400. All changing numbers use tabular numerals.

## Shape and depth

- Interactive controls: full pill radius. Surfaces: 24px. Tiles: 18px. Cards: 26px.
- Shadows are forest-tinted with offset and blur (`--shadow-sm/md/lg`), never pure black.
- Linen grain is a fixed, non-interactive noise layer.

## Motion

- Default: critically damped spring, `bounce: 0`, `duration: 0.45` (`spring`). Small controls: `0.3` (`springSnappy`).
- Bounce (`0.18`) only after momentum (cards dealt on home).
- Press feedback: `scale(0.97)` over 160ms `cubic-bezier(0.23, 1, 0.32, 1)`.
- Screens slide 40px direction-aware with a fade; back navigation reverses.
- Numbers roll vertically inside a fixed cell.
- Signature moments: drag-to-peek glass card (snaps back, secret fades in only once clearly lifted), suspense blur then color flood on verdict.
- `prefers-reduced-motion`: transforms removed, fades kept. `prefers-reduced-transparency`: dock goes solid.

## Components

Button (primary, secondary, ghost, on-color), icon button, ceramic surface, stepper, segmented control with sliding thumb, topic tile, player row, voter tile, glass card, game menu (origin-aware popover with confirm), flood layer.
