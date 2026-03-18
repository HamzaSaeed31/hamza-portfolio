/* =============================================
   PORTFOLIO — Scroll Animations Engine
   ============================================= */

'use strict';

// ─── Always start at top on reload ───────────
history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// ─── Lerp utility ────────────────────────────
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const map = (v, inMin, inMax, outMin, outMax) =>
  ((v - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;

// ─── Glass Morphic Cursor ─────────────────────
const cursor         = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;
let prevMouseX = 0, prevMouseY = 0;

const shimmer = document.createElement('div');
shimmer.classList.add('cf-shimmer');
cursorFollower.appendChild(shimmer);

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
  const dx    = mouseX - prevMouseX;
  const dy    = mouseY - prevMouseY;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  shimmer.style.transform = `rotate(${angle}deg)`;
  prevMouseX = mouseX; prevMouseY = mouseY;
});

(function animateFollower() {
  followerX = lerp(followerX, mouseX, 0.10);
  followerY = lerp(followerY, mouseY, 0.10);
  cursorFollower.style.left = followerX + 'px';
  cursorFollower.style.top  = followerY + 'px';
  requestAnimationFrame(animateFollower);
})();

const hoverEls = document.querySelectorAll(
  'a, button, .skill-pill, .service-card, .proj-card, .social-btn, .chip, .nav-link, .proj-link, .ace-tl-card'
);
hoverEls.forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.classList.add('hover');
    cursorFollower.classList.add('hover');
  });
  el.addEventListener('mouseleave', () => {
    cursor.classList.remove('hover');
    cursorFollower.classList.remove('hover');
  });
});

document.addEventListener('mouseleave', () => {
  cursor.style.opacity         = '0';
  cursorFollower.style.opacity = '0';
});
document.addEventListener('mouseenter', () => {
  cursor.style.opacity         = '1';
  cursorFollower.style.opacity = '1';
});


// ─── Navbar ──────────────────────────────────
const nav = document.getElementById('nav');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
  let current = '';
  sections.forEach(sec => { if (window.scrollY >= sec.offsetTop - 140) current = sec.id; });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
}, { passive: true });


// ─── Mobile Menu ─────────────────────────────
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
let menuOpen = false;

hamburger.addEventListener('click', () => {
  menuOpen = !menuOpen;
  mobileMenu.classList.toggle('open', menuOpen);
  document.body.style.overflow = menuOpen ? 'hidden' : '';
  const spans = hamburger.querySelectorAll('span');
  if (menuOpen) {
    spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
    spans[1].style.opacity   = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    menuOpen = false;
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
    hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  });
});


// ─── Smooth anchor scroll ────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    e.preventDefault();
    if (href === '#hero' || href === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const target = document.querySelector(href);
    if (target) {
      window.scrollTo({ top: target.offsetTop - 72, behavior: 'smooth' });
    }
  });
});


// ─── Intersection Observer — Standard Reveals ─
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el    = entry.target;
    const delay = el.dataset.delay ? parseInt(el.dataset.delay) : 0;
    setTimeout(() => el.classList.add('in-view'), delay);
    revealObs.unobserve(el);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal-text').forEach(el => {
  const inner = document.createElement('span');
  inner.classList.add('inner');
  while (el.firstChild) inner.appendChild(el.firstChild);
  el.appendChild(inner);
  revealObs.observe(el);
});

document.querySelectorAll(
  '.reveal-up, .reveal-fade, .reveal-slide-right, .reveal-card'
).forEach(el => revealObs.observe(el));


// ─── Animated Counters ────────────────────────
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { animateCount(e.target); counterObs.unobserve(e.target); } });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num').forEach(el => counterObs.observe(el));
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const start  = performance.now();
  const dur    = 1600;
  const tick   = now => {
    const t = Math.min((now - start) / dur, 1);
    el.textContent = Math.round(easeOut(t) * target);
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  };
  requestAnimationFrame(tick);
}
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }


// ─── Parallax Orbs ───────────────────────────
const orbs = document.querySelectorAll('.hero-orb');
window.addEventListener('scroll', () => {
  const sy = window.scrollY;
  orbs.forEach((orb, i) => { orb.style.transform = `translateY(${sy * (0.08 + i * 0.04)}px)`; });
}, { passive: true });


// ─── Service Card Tilt ────────────────────────
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r  = card.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
    const dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
    card.style.transform   = `translateY(-6px) rotateX(${-dy * 6}deg) rotateY(${dx * 6}deg)`;
    card.style.transition  = 'none';
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; card.style.transition = ''; });
});


// ─── Profile Card Reveal ──────────────────────
const profileCard = document.querySelector('.profile-card');
if (profileCard) {
  const profileCardObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      profileCard.classList.add('in-view');
      profileCardObs.disconnect();
    }
  }, { threshold: 0.3 });
  profileCardObs.observe(profileCard);
}


// ─── Scroll Progress Bar ─────────────────────
const progressBar = document.createElement('div');
progressBar.style.cssText = 'position:fixed;top:0;left:0;height:2px;z-index:1001;background:linear-gradient(90deg,#d97706,#ea580c,#f59e0b);width:0%;pointer-events:none;transition:width 0.05s linear;';
document.body.appendChild(progressBar);
window.addEventListener('scroll', () => {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = `${(window.scrollY / total) * 100}%`;
}, { passive: true });



// ══════════════════════════════════════════════
//  1. HORIZONTAL SCROLL — PROJECTS
// ══════════════════════════════════════════════
function initHorizontalScroll() {
  const outer = document.querySelector('.h-scroll-outer');
  const track = document.getElementById('hScrollTrack');
  const bar   = document.getElementById('hScrollBar');
  if (!outer || !track) return;

  const isMobile = () => window.innerWidth <= 1024;

  let hTarget  = 0;
  let hCurrent = 0;
  let maxX     = 0;
  let outerTop = 0; // cached document offset — no DOM reads in hot paths

  // ── Setup ─────────────────────────────────────────────────────────────────
  function setup() {
    if (isMobile()) {
      outer.style.height    = '';
      track.style.transform = 'none';
      hCurrent = hTarget = 0;
      return;
    }
    // clientHeight matches 100dvh — excludes mobile browser chrome on Safari/Mac
    const vh = document.documentElement.clientHeight;
    maxX     = track.scrollWidth - window.innerWidth + 60;
    outer.style.height = (maxX + vh) + 'px';
    // Cache the document-absolute top of the outer div
    outerTop = outer.getBoundingClientRect().top + window.scrollY;
  }

  // Pure arithmetic — zero DOM reads
  function inZone() {
    const sy = window.scrollY;
    return sy >= outerTop - 2 && sy <= outerTop + maxX + 2;
  }

  // ── Wheel interception ────────────────────────────────────────────────────
  // Consume delta into hTarget and keep scrollY in sync so the section
  // exits the instant horizontal scroll completes.
  // At boundaries: pass through so vertical resumes naturally.
  window.addEventListener('wheel', e => {
    if (isMobile() || !inZone()) return;

    let delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 40;
    if (e.deltaMode === 2) delta *= document.documentElement.clientHeight;

    if (delta < 0 && hTarget <= 0)    return; // at start → let page scroll up
    if (delta > 0 && hTarget >= maxX) return; // at end   → let page scroll down

    e.preventDefault();
    hTarget = clamp(hTarget + delta, 0, maxX);

    // Sync page scroll so the section exits when horizontal finishes
    window.scrollTo(0, outerTop + hTarget);

    if (bar) bar.style.width = `${(hTarget / maxX) * 100}%`;
  }, { passive: false });

  // ── Keyboard / anchor-link fallback ──────────────────────────────────────
  window.addEventListener('scroll', () => {
    if (isMobile() || !inZone()) return;
    const scrolled = window.scrollY - outerTop;
    hTarget = clamp(scrolled, 0, maxX);
    if (bar) bar.style.width = `${(hTarget / maxX) * 100}%`;
  }, { passive: true });

  // ── rAF loop — zero DOM reads, one conditional write ─────────────────────
  function tick() {
    if (!isMobile()) {
      const diff = hTarget - hCurrent;
      if (Math.abs(diff) > 0.05) {
        hCurrent += diff * 0.09;
        track.style.transform = `translate3d(${-hCurrent}px, 0, 0)`;
      }
    } else if (hCurrent !== 0) {
      track.style.transform = 'none';
      hCurrent = hTarget = 0;
    }
    requestAnimationFrame(tick);
  }

  setup();
  window.addEventListener('load',   setup);                    // recompute after fonts/images settle
  window.addEventListener('resize', setup, { passive: true });
  tick();
}
initHorizontalScroll();


// ══════════════════════════════════════════════
//  2. SCROLLYTELLING — PROCESS SECTION
// ══════════════════════════════════════════════
function initScrollytelling() {
  const section = document.querySelector('.story-section');
  const sticky  = document.getElementById('storySticky');
  if (!section || !sticky) return;

  const isMobile = () => window.innerWidth <= 1024;

  const visualItems = document.querySelectorAll('.story-visual-item');
  const steps       = document.querySelectorAll('.story-step');
  const dots        = document.querySelectorAll('.story-dot');

  const NUM_STEPS = steps.length;
  let lastStep = -1;

  function activateStep(idx) {
    if (idx === lastStep) return;
    lastStep = idx;
    visualItems.forEach((v, i) => v.classList.toggle('active', i === idx));
    steps.forEach((s, i)       => s.classList.toggle('active', i === idx));
    dots.forEach((d, i)        => d.classList.toggle('active', i === idx));
  }

  function onScroll() {
    if (isMobile()) return;
    const rect     = section.getBoundingClientRect();
    const outerH   = section.offsetHeight;
    const scrolled = -rect.top;
    const progress = clamp(scrolled / (outerH - window.innerHeight), 0, 1);
    const rawIdx   = Math.floor(progress * NUM_STEPS);
    activateStep(clamp(rawIdx, 0, NUM_STEPS - 1));
  }

  activateStep(0);
  window.addEventListener('scroll', onScroll, { passive: true });

  // Amber particle spawner
  function spawnParticles(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const colors = [
      'rgba(217,119,6,',
      'rgba(234,88,12,',
      'rgba(245,158,11,',
      'rgba(16,185,129,'
    ];
    const idx = parseInt(containerId.replace('svp', ''));
    const c = colors[idx] || colors[0];
    for (let i = 0; i < 12; i++) {
      const p    = document.createElement('div');
      const size = 3 + Math.random() * 5;
      const x    = 20 + Math.random() * 60;
      const y    = 20 + Math.random() * 60;
      const dur  = 3 + Math.random() * 4;
      const del  = Math.random() * 4;
      p.style.cssText = `
        position:absolute; left:${x}%; top:${y}%;
        width:${size}px; height:${size}px; border-radius:50%;
        background:${c}0.5)`;
      p.style.animation = `particleFloat ${dur}s ease-in-out ${del}s infinite`;
      container.appendChild(p);
    }
  }

  if (!document.getElementById('particle-style')) {
    const style = document.createElement('style');
    style.id = 'particle-style';
    style.textContent = `
      @keyframes particleFloat {
        0%,100% { transform: translateY(0) scale(1); opacity:0.4; }
        50%      { transform: translateY(-20px) scale(1.3); opacity:0.8; }
      }
    `;
    document.head.appendChild(style);
  }
  ['svp0','svp1','svp2','svp3'].forEach(spawnParticles);
}
initScrollytelling();


// ══════════════════════════════════════════════
//  3. WORD REVEAL — SCROLL-LINKED
// ══════════════════════════════════════════════
function initWordReveal() {
  const section = document.querySelector('.word-reveal-section');
  const label   = document.querySelector('.word-reveal-label');
  const textEl  = document.getElementById('wordRevealText');
  if (!section || !textEl) return;

  const raw   = textEl.textContent;
  const words = raw.trim().split(/\s+/);
  textEl.innerHTML = '';

  words.forEach((word, i) => {
    const span = document.createElement('span');
    span.classList.add('wr-word');
    span.textContent = word;
    if (['boring','3am.','hate','you.'].includes(word.toLowerCase())) {
      span.dataset.accent = '1';
    }
    textEl.appendChild(span);
    if (i < words.length - 1) textEl.appendChild(document.createTextNode(' '));
  });

  const wordEls = textEl.querySelectorAll('.wr-word');
  const total   = wordEls.length;

  const labelObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { label.classList.add('active'); labelObs.disconnect(); }
  }, { threshold: 0.5 });
  if (label) labelObs.observe(section);

  function onScroll() {
    const rect     = section.getBoundingClientRect();
    const vh       = window.innerHeight;
    const start    = vh * 0.75;
    const end      = vh * 0.05;
    const progress = clamp((start - rect.top) / (start - end), 0, 1);
    const litCount = Math.round(progress * total);
    wordEls.forEach((w, i) => {
      const shouldLit = i < litCount;
      if (shouldLit && w.dataset.accent) {
        w.classList.add('lit-accent'); w.classList.remove('lit');
      } else {
        w.classList.toggle('lit', shouldLit); w.classList.remove('lit-accent');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
initWordReveal();


// ══════════════════════════════════════════════
//  4. HERO — SCROLL EXIT EFFECT
// ══════════════════════════════════════════════
// Hero is now position:sticky — subsequent sections slide over it.
// No fade-out animation needed; the hero stays crisp and still.


// ══════════════════════════════════════════════
//  5. PROJECT CARDS — TILT ON HOVER
// ══════════════════════════════════════════════
function initProjectCards() {
  document.querySelectorAll('.proj-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
      const dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
      card.style.transform  = `translateY(-8px) rotateX(${-dy * 8}deg) rotateY(${dx * 8}deg) scale(1.01)`;
      card.style.transition = 'box-shadow 0.3s, border-color 0.3s';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = '';
    });
  });
}
initProjectCards();


// ══════════════════════════════════════════════
//  6. HERO CANVAS — removed
// ══════════════════════════════════════════════
function initHeroCanvas() { return; // canvas removed
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];
  let heroMX = -9999, heroMY = -9999;

  const COUNT     = 55;
  const MAX_DIST  = 130;
  const REPEL_R   = 90;
  const PALETTE   = [
    'rgba(217,119,6,',
    'rgba(234,88,12,',
    'rgba(245,158,11,',
  ];

  function resize() {
    const hero = canvas.parentElement;
    W = canvas.width  = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  }

  function mkParticle() {
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r:  1.5 + Math.random() * 2,
      col: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      alpha: 0.35 + Math.random() * 0.45,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, mkParticle);
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);

    for (const p of particles) {
      // Mouse repulsion
      const dx   = p.x - heroMX;
      const dy   = p.y - heroMY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < REPEL_R && dist > 0) {
        const f = ((REPEL_R - dist) / REPEL_R) * 0.9;
        p.vx += (dx / dist) * f * 0.06;
        p.vy += (dy / dist) * f * 0.06;
      }

      // Dampen + speed-cap
      p.vx *= 0.99;
      p.vy *= 0.99;
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > 1.4) { p.vx = (p.vx / speed) * 1.4; p.vy = (p.vy / speed) * 1.4; }

      p.x += p.vx;
      p.y += p.vy;

      // Wrap
      if (p.x < -8)  p.x = W + 8;
      if (p.x > W+8) p.x = -8;
      if (p.y < -8)  p.y = H + 8;
      if (p.y > H+8) p.y = -8;

      // Draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.col + p.alpha + ')';
      ctx.fill();
    }

    // Draw connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(217,119,6,${(1 - d / MAX_DIST) * 0.28})`;
          ctx.lineWidth   = 0.7;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(tick);
  }

  init();
  window.addEventListener('resize', init);

  // Track mouse in hero area
  const hero = canvas.parentElement;
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    heroMX  = e.clientX - r.left;
    heroMY  = e.clientY - r.top;
  });
  hero.addEventListener('mouseleave', () => { heroMX = -9999; heroMY = -9999; });

  tick();
}
initHeroCanvas();


// ══════════════════════════════════════════════
//  HERO GRADIENT BLOB — mouse tracking
// ══════════════════════════════════════════════
(function initHeroBlob() {
  const wrap = document.querySelector('.hero-grad-wrap');
  const ptr  = document.getElementById('heroBlobPtr');
  if (!wrap || !ptr) return;
  let curX = 0, curY = 0, tgX = 0, tgY = 0;
  window.addEventListener('mousemove', e => {
    const rect = wrap.getBoundingClientRect();
    tgX = e.clientX - rect.left;
    tgY = e.clientY - rect.top;
  });
  (function tick() {
    curX += (tgX - curX) / 20;
    curY += (tgY - curY) / 20;
    ptr.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`;
    requestAnimationFrame(tick);
  })();
})();


// ══════════════════════════════════════════════
//  7. CONTACT FORM
// ══════════════════════════════════════════════
const form        = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn  = form.querySelector('button[type="submit"]');
    const span = btn.querySelector('span');
    btn.disabled = true; span.textContent = 'Sending...';
    setTimeout(() => {
      span.textContent = 'Send Message'; btn.disabled = false;
      form.reset();
      formSuccess.classList.add('show');
      setTimeout(() => formSuccess.classList.remove('show'), 4000);
    }, 1400);
  });
}


// ══════════════════════════════════════════════
//  8. SKILL PILLS — STAGGER
// ══════════════════════════════════════════════
document.querySelectorAll('.skill-pill').forEach((pill, i) => {
  pill.style.transitionDelay = `${i * 40}ms`;
});


// ══════════════════════════════════════════════
//  9. ACETERNITY TIMELINE — SCROLL-DRIVEN LINE
// ══════════════════════════════════════════════
function initAceTimeline() {
  const wrap = document.getElementById('aceTlWrap');
  const fill = document.getElementById('aceTlLineFill');
  if (!wrap || !fill) return;

  // ── Card slide-in / slide-out on scroll ──
  const cards = Array.from(wrap.querySelectorAll('.ace-tl-card'));
  const cardObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        // Stagger on entry
        const idx = cards.indexOf(e.target);
        e.target.style.transitionDelay = `${idx * 60}ms`;
        e.target.classList.add('card-visible');
      } else {
        // No delay on exit — reverse immediately
        e.target.style.transitionDelay = '0ms';
        e.target.classList.remove('card-visible');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  cards.forEach(c => cardObs.observe(c));

  // ── Dot activation as each entry scrolls into focus ──
  const dotObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      e.target.classList.toggle('dot-active', e.isIntersecting);
    });
  }, { threshold: 0.35 });

  wrap.querySelectorAll('.ace-tl-entry').forEach(e => dotObs.observe(e));

  // ── Scroll-driven vertical line fill ──
  // Mirrors Aceternity's framer-motion useScroll offset ["start 10%", "end 50%"]
  // Start: when wrap top reaches 10% from viewport top
  // End  : when wrap bottom reaches 50% from viewport top
  let fillTarget  = 0;
  let fillCurrent = 0;

  function updateLine() {
    const rect   = wrap.getBoundingClientRect();
    const vh     = window.innerHeight;
    const wrapH  = wrap.offsetHeight;

    // scrolled = how far past the 10% mark the wrap top has moved
    const scrolled = (vh * 0.10) - rect.top;
    // range   = distance from start to end (bottom at 50%)
    const range    = wrapH - vh * 0.40;

    fillTarget = clamp(scrolled / range, 0, 1) * 100;
  }

  // Lerp the fill height each frame for butter-smooth motion
  (function animateLine() {
    fillCurrent = lerp(fillCurrent, fillTarget, 0.08);
    fill.style.height = fillCurrent.toFixed(2) + '%';
    requestAnimationFrame(animateLine);
  })();

  window.addEventListener('scroll', updateLine, { passive: true });
  updateLine(); // initialise
}
initAceTimeline();


// ══════════════════════════════════════════════
//  10. AMBIENT CURSOR GLOW
// ══════════════════════════════════════════════
function initAmbientGlow() {
  const glow = document.createElement('div');
  glow.style.cssText = `
    position:fixed; width:400px; height:400px; border-radius:50%;
    background:radial-gradient(circle, rgba(217,119,6,0.06) 0%, transparent 70%);
    pointer-events:none; z-index:0; transform:translate(-50%,-50%);
    transition:left 0.8s ease, top 0.8s ease; will-change:left,top;
  `;
  document.body.appendChild(glow);
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });
}
initAmbientGlow();


// ══════════════════════════════════════════════
//  11. BACK TO TOP BUTTON
// ══════════════════════════════════════════════
(function initBackToTop() {
  const btn    = document.getElementById('backToTop');
  const footer = document.querySelector('.footer');
  if (!btn || !footer) return;

  function update() {
    const scrolled      = window.scrollY > 400;
    const footerVisible = footer.getBoundingClientRect().top < window.innerHeight;
    btn.classList.toggle('btt-visible', scrolled && !footerVisible);
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();
