# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running Locally

No build step. Open `index.html` directly in a browser.

```
open index.html
# or on Windows:
start index.html
```

Deployed on Vercel at [hamzasaeed.vercel.app](https://hamzasaeed.vercel.app). Push to `master` triggers a deploy.

## Stack

Plain HTML/CSS/JS — no frameworks, no bundler, no package.json. Three files contain all the logic:

- `index.html` — full page markup, all sections in one file
- `styles.css` — all styles (design tokens as CSS custom properties at `:root`)
- `scripts.js` — all JS (animations, scroll logic, canvas, interactions)

`hamza-avatar.png` and `Hamza-Saeed-CV.pdf` are static assets that must remain in the root.

## Architecture

**CSS design tokens** (`styles.css` `:root`): amber accent palette (`--accent` #d97706, `--accent-2` #ea580c, `--accent-3` #f59e0b), warm background (`--bg` #fffcf7), Inter + JetBrains Mono fonts.

**JS architecture** (`scripts.js`) — everything runs in a single DOMContentLoaded block with these systems:

| System | How it works |
|---|---|
| Intro sequence | Frosted-glass overlay auto-dismisses after 2s, then hero content reveals |
| Custom cursor | Two divs (`#cursor`, `#cursorFollower`) positioned via mousemove with lerp follower |
| Scroll progress bar | `width` set to `scrollY / (scrollHeight - innerHeight) * 100%` on scroll |
| Reveal animations | `IntersectionObserver` adds `.visible` class; CSS transitions handle entrance |
| Stat counters | Count up when `.stat-number` enters viewport |
| Hero parallax | Canvas orbs + content fade/lift driven by `scrollY` |
| Horizontal scroll projects | Sticky section; `scrollY` mapped to `translateX` via lerp engine |
| Scrollytelling process | Sticky section; active step determined by scroll position within container |
| Word reveal | Each `<span>` in `.word-reveal-text` lights up as scroll progresses |
| 3D card tilt | `mousemove` on `.service-card` / `.project-card` sets CSS `rotateX/Y` |
| Canvas constellation | `requestAnimationFrame` loop draws amber particles + proximity lines + mouse repulsion |

**Lerp engine**: all scroll-driven transforms use `lerp(current, target, 0.1)` inside a `requestAnimationFrame` loop for smooth motion.

## Sections (in DOM order)

`#hero` → `#about` → `#projects` (horizontal scroll) → `#services` → `#process` (scrollytelling) → `#experience` → `#contact` → `footer`

## Design Constraints

- Light mode only — no dark mode toggle
- Amber/orange accent palette — do not introduce other accent colors
- All scroll animations must use the lerp engine for consistency
- Reveal animation classes: `reveal-up`, `reveal-fade`, `reveal-slide-right`, `reveal-card`, `reveal-timeline`, `reveal-text`
