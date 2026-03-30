# Hamza Saeed Portfolio

> Personal portfolio and showcase, built with zero dependencies, maximum craft.

**Live:** [www.hamzasaeed.me](https://www.hamzasaeed.me)

---

## Tech Stack

| Layer | Details |
|---|---|
| Markup | Semantic HTML5 |
| Styles | Vanilla CSS, design tokens, custom properties, no utility classes |
| Logic | Vanilla JavaScript, no frameworks, no bundler |
| Fonts | Inter (UI) · JetBrains Mono (code elements) |
| Deploy | Vercel, push to `master` triggers deploy |

---

## Features

**Animations & Interactions**
- Frosted-glass intro sequence on load with spinning amber ring
- Custom cursor with lerp-smoothed follower and ambient glow
- Scroll progress bar (amber gradient, top of viewport)
- Intersection Observer reveal animations on every section
- Animated stat counters on scroll-enter
- 3D card tilt on hover (service cards + project cards)

**Scroll Techniques**
- Hero parallax, canvas orb layer + content fades/lifts as you scroll out
- Horizontal scroll project showcase, sticky pin, scroll mapped to `translateX` via lerp
- Scrollytelling process section, sticky panel, active step tracks scroll position
- Word-by-word reveal on large statement text

**Canvas Background**
- Amber particle constellation with proximity connecting lines and mouse repulsion
- Ghost code glyphs drifting in the background (`{}`, `</>`, `=>`, `[]`)
- Grain texture overlay (SVG feTurbulence)
- Portrait blurred at very low opacity as an ambient background element

**Other**
- Mobile-responsive with hamburger nav
- Contact form with client-side validation
- Scroll-to-top button (fixed, fades in after first scroll)

---

## Project Structure

```
portfolio/
├── index.html          # Full page, all sections in one file
├── styles.css          # All styles, design tokens at :root
├── scripts.js          # All JS, single DOMContentLoaded block
├── hamza-avatar.png    # Portrait (used in intro + hero bg)
└── Hamza-Saeed-CV.pdf  # Downloadable CV
```

No `package.json`. No build step. No node_modules.

---

## Running Locally

```bash
git clone https://github.com/HamzaSaeed31/hamza-portfolio.git
cd hamza-portfolio
open index.html        # macOS
start index.html       # Windows
```

---

## Contact

[Hamzasaeed31@gmail.com](mailto:Hamzasaeed31@gmail.com) · [LinkedIn](https://www.linkedin.com/in/hamza-saeed-548a2a219/) · [GitHub](https://github.com/HamzaSaeed31)
