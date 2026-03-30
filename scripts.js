'use strict';

/* ============================================================
   UTILITIES
   ============================================================ */
const lerp  = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* ─── Shared scroll state ────────────────────────────────────
   ONE passive listener updates scrollY. Every feature reads
   from this variable — zero competing layout reads per frame.
   ─────────────────────────────────────────────────────────── */
let scrollY = window.scrollY;
window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

/* ─── Cached viewport — updated on resize ─────────────────── */
let vpW = window.innerWidth;
let vpH = window.innerHeight;
let isMobile = vpW <= 1024;
window.addEventListener('resize', () => {
  vpW      = window.innerWidth;
  vpH      = window.innerHeight;
  isMobile = vpW <= 1024;
}, { passive: true });

/* ─── Always start at top ──────────────────────────────────── */
history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isLowEnd = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 2;
const reducedMode = prefersReducedMotion || isLowEnd;

/* Pause all RAF loops when tab is not visible */
let pageVisible = true;
document.addEventListener('visibilitychange', () => { pageVisible = !document.hidden; }, { passive: true });


/* ============================================================
   CURSOR  (pointer devices only)
   ============================================================ */
const cursorEl    = document.getElementById('cursor');
const cursorFollow = document.getElementById('cursorFollower');

if (!isTouchDevice && cursorEl && cursorFollow) {
  let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;
  let prevMX = 0, prevMY = 0;

  const shimmer = document.createElement('div');
  shimmer.classList.add('cf-shimmer');
  cursorFollow.appendChild(shimmer);

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursorEl.style.left = mouseX + 'px';
    cursorEl.style.top  = mouseY + 'px';
    const angle = Math.atan2(mouseY - prevMY, mouseX - prevMX) * (180 / Math.PI);
    shimmer.style.transform = `rotate(${angle}deg)`;
    prevMX = mouseX; prevMY = mouseY;
  });

  (function animateFollower() {
    if (pageVisible) {
      followerX = lerp(followerX, mouseX, 0.10);
      followerY = lerp(followerY, mouseY, 0.10);
      cursorFollow.style.left = followerX + 'px';
      cursorFollow.style.top  = followerY + 'px';
    }
    requestAnimationFrame(animateFollower);
  })();

  document.querySelectorAll(
    'a, button, input, textarea, select, .skill-pill, .service-card, .proj-card, .social-btn, .chip, .nav-link, .proj-link, .ace-tl-card'
  ).forEach(el => {
    el.addEventListener('mouseenter', () => { cursorEl.classList.add('hover'); cursorFollow.classList.add('hover'); });
    el.addEventListener('mouseleave', () => { cursorEl.classList.remove('hover'); cursorFollow.classList.remove('hover'); });
  });

  document.addEventListener('mouseleave', () => { cursorEl.style.opacity = cursorFollow.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursorEl.style.opacity = cursorFollow.style.opacity = '1'; });
}


/* ============================================================
   AMBIENT CURSOR GLOW  (uses transform — no layout triggers)
   ============================================================ */
if (!isTouchDevice) {
  const glow = document.createElement('div');
  glow.style.cssText = [
    'position:fixed', 'width:400px', 'height:400px', 'border-radius:50%',
    'background:radial-gradient(circle,rgba(217,119,6,0.06) 0%,transparent 70%)',
    'pointer-events:none', 'z-index:0',
    'left:0', 'top:0',
    'transform:translate(-200px,-200px)',
    'transition:transform 0.8s ease',
    'will-change:transform',
  ].join(';');
  document.body.appendChild(glow);
  document.addEventListener('mousemove', e => {
    glow.style.transform = `translate(${e.clientX - 200}px,${e.clientY - 200}px)`;
  });
}


/* ============================================================
   NAVBAR
   ============================================================ */
const nav      = document.getElementById('nav');
const sections = Array.from(document.querySelectorAll('section[id]'));
const navLinks = Array.from(document.querySelectorAll('.nav-link'));

function updateNavbar() {
  nav.classList.toggle('scrolled', scrollY > 60);
  let current = '';
  for (const sec of sections) {
    if (scrollY >= sec.offsetTop - 140) current = sec.id;
  }
  const hash = '#' + current;
  for (const link of navLinks) link.classList.toggle('active', link.getAttribute('href') === hash);
}

window.addEventListener('scroll', updateNavbar, { passive: true });


/* ============================================================
   MOBILE MENU
   ============================================================ */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
let menuOpen = false;

function closeMobileMenu() {
  menuOpen = false;
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
  hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
}

hamburger.addEventListener('click', () => {
  menuOpen = !menuOpen;
  mobileMenu.classList.toggle('open', menuOpen);
  document.body.style.overflow = menuOpen ? 'hidden' : '';
  const [s0, s1, s2] = hamburger.querySelectorAll('span');
  if (menuOpen) {
    s0.style.transform = 'rotate(45deg) translate(5px,5px)';
    s1.style.opacity   = '0';
    s2.style.transform = 'rotate(-45deg) translate(5px,-5px)';
  } else {
    closeMobileMenu();
  }
});

document.querySelectorAll('.mobile-link').forEach(link => link.addEventListener('click', closeMobileMenu));


/* ============================================================
   SMOOTH ANCHOR SCROLL
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    e.preventDefault();
    if (href === '#hero' || href === '#') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    const target = document.querySelector(href);
    if (target) window.scrollTo({ top: target.offsetTop - 72, behavior: 'smooth' });
  });
});


/* ============================================================
   SCROLL PROGRESS BAR  (written in RAF, not in scroll handler)
   ============================================================ */
const progressBar = document.createElement('div');
progressBar.style.cssText = 'position:fixed;top:0;left:0;height:2px;z-index:1001;background:linear-gradient(90deg,#d97706,#ea580c,#f59e0b);width:0%;pointer-events:none;will-change:width;';
document.body.appendChild(progressBar);

function updateProgressBar() {
  const total = document.documentElement.scrollHeight - vpH;
  progressBar.style.width = total > 0 ? `${(scrollY / total) * 100}%` : '0%';
}


/* ============================================================
   INTERSECTION OBSERVER — STANDARD REVEALS
   ============================================================ */
const revealObs = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const el    = entry.target;
    const delay = el.dataset.delay ? parseInt(el.dataset.delay) : 0;
    setTimeout(() => el.classList.add('in-view'), delay);
    revealObs.unobserve(el);
  }
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal-text').forEach(el => {
  const inner = document.createElement('span');
  inner.classList.add('inner');
  while (el.firstChild) inner.appendChild(el.firstChild);
  el.appendChild(inner);
  revealObs.observe(el);
});

document.querySelectorAll('.reveal-up, .reveal-fade, .reveal-slide-right, .reveal-card').forEach(el => revealObs.observe(el));


/* ============================================================
   ANIMATED COUNTERS
   ============================================================ */
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const start  = performance.now();
  const dur    = 1600;
  const tick   = now => {
    const t = Math.min((now - start) / dur, 1);
    el.textContent = Math.round(t * target);
    if (t < 1) requestAnimationFrame(tick); else el.textContent = target;
  };
  requestAnimationFrame(tick);
}
const counterObs = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    counterObs.unobserve(e.target);
    const el = e.target;
    // Delay start until the nearest reveal ancestor has finished its entrance transition,
    // so counting is visible rather than completing while the element is still invisible.
    const revealEl = el.closest('.reveal-fade, .reveal-up, .reveal-slide-right, .reveal-card');
    let startDelay = 0;
    if (revealEl) {
      const cs = getComputedStyle(revealEl);
      startDelay = (parseFloat(cs.transitionDelay)    || 0) * 1000
                 + (parseFloat(cs.transitionDuration)  || 0) * 1000 * 0.3;
    }
    setTimeout(() => animateCount(el), startDelay);
  }
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num').forEach(el => counterObs.observe(el));


/* ============================================================
   CARD TILT  (RAF-throttled — no layout reads per mousemove)
   ============================================================ */
function initTilt(selector, maxDeg = 7, lift = 7) {
  document.querySelectorAll(selector).forEach(card => {
    let rafId = null;
    let lastE = null;

    card.addEventListener('mousemove', e => {
      lastE = e;
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (!lastE) return;
        const r  = card.getBoundingClientRect();
        const dx = (lastE.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
        const dy = (lastE.clientY - (r.top  + r.height / 2)) / (r.height / 2);
        card.style.transform  = `translateY(-${lift}px) rotateX(${-dy * maxDeg}deg) rotateY(${dx * maxDeg}deg)`;
        card.style.transition = 'box-shadow 0.3s, border-color 0.3s';
      });
    });

    card.addEventListener('mouseleave', () => {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      lastE = null;
      card.style.transform  = '';
      card.style.transition = '';
    });
  });
}

if (!reducedMode) {
  initTilt('.proj-card',    8, 8);
  initTilt('.service-card', 6, 6);
}


/* ============================================================
   PROFILE CARD REVEAL
   ============================================================ */
const profileCard = document.querySelector('.profile-card');
if (profileCard) {
  new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      profileCard.classList.add('in-view');
      entries[0].target._obs?.disconnect();
    }
  }, { threshold: 0.3 }).observe(profileCard);
}


/* ============================================================
   SKILL PILLS — STAGGER
   ============================================================ */
document.querySelectorAll('.skill-pill').forEach((pill, i) => {
  pill.style.transitionDelay = `${i * 40}ms`;
});


/* ============================================================
   1. HORIZONTAL SCROLL — PROJECTS
   ============================================================ */
function initHorizontalScroll() {
  const outer = document.querySelector('.h-scroll-outer');
  const track = document.getElementById('hScrollTrack');
  const bar   = document.getElementById('hScrollBar');
  if (!outer || !track) return;

  let hTarget  = 0;
  let hCurrent = 0;
  let maxX     = 0;
  let outerTop = 0;

  function setup() {
    if (isMobile) {
      outer.style.height    = '';
      track.style.transform = 'none';
      hCurrent = hTarget = 0;
      return;
    }
    maxX     = Math.max(0, track.scrollWidth - vpW);
    outer.style.height = (maxX + vpH) + 'px';
    outerTop = outer.getBoundingClientRect().top + window.scrollY;
    // Sync hTarget immediately so position is correct after resize
    hTarget = clamp(window.scrollY - outerTop, 0, maxX);
  }

  window.addEventListener('scroll', () => {
    if (isMobile || maxX <= 0) return;
    hTarget = clamp(scrollY - outerTop, 0, maxX);
    if (bar) bar.style.width = `${(hTarget / maxX) * 100}%`;
  }, { passive: true });

  /* RAF loop — lerp + progress bar update */
  function tick() {
    if (pageVisible) {
      if (!isMobile && maxX > 0) {
        const diff = hTarget - hCurrent;
        if (Math.abs(diff) > 0.05) {
          hCurrent += diff * 0.09;
          track.style.transform = `translate3d(${-hCurrent}px,0,0)`;
        }
      } else if (hCurrent !== 0) {
        track.style.transform = 'none';
        hCurrent = hTarget = 0;
      }
      updateProgressBar();
    }
    requestAnimationFrame(tick);
  }

  setup();
  window.addEventListener('load',   setup);
  window.addEventListener('resize', setup, { passive: true });
  tick();
}
initHorizontalScroll();

const hintText = document.getElementById('hScrollHintText');
if (hintText && isMobile) hintText.textContent = 'Swipe to explore';


/* ============================================================
   2. SCROLLYTELLING — PROCESS SECTION
   ============================================================ */
function initScrollytelling() {
  const section     = document.querySelector('.story-section');
  const visualItems = document.querySelectorAll('.story-visual-item');
  const steps       = document.querySelectorAll('.story-step');
  const dots        = document.querySelectorAll('.story-dot');
  if (!section) return;

  const NUM_STEPS = steps.length;
  let lastStep = -1;

  function activateStep(idx) {
    if (idx === lastStep) return;
    lastStep = idx;
    visualItems.forEach((v, i) => v.classList.toggle('active', i === idx));
    steps.forEach((s, i)       => s.classList.toggle('active', i === idx));
    dots.forEach((d, i)        => d.classList.toggle('active', i === idx));
  }

  activateStep(0);
  let sectionTop = section.offsetTop;
  let sectionH   = section.offsetHeight;
  window.addEventListener('resize', () => { sectionTop = section.offsetTop; sectionH = section.offsetHeight; }, { passive: true });
  window.addEventListener('scroll', () => {
    const progress = clamp((scrollY - sectionTop) / (sectionH - vpH), 0, 1);
    activateStep(clamp(Math.floor(progress * NUM_STEPS), 0, NUM_STEPS - 1));
  }, { passive: true });

  // Amber particle spawner — skip on low-end to reduce compositing load
  if (!isLowEnd) {
    const colors = ['rgba(217,119,6,','rgba(234,88,12,','rgba(245,158,11,','rgba(180,83,9,'];
    if (!document.getElementById('particle-style')) {
      const s = document.createElement('style');
      s.id = 'particle-style';
      s.textContent = '@keyframes particleFloat{0%,100%{transform:translateY(0) scale(1);opacity:0.4}50%{transform:translateY(-20px) scale(1.3);opacity:0.8}}';
      document.head.appendChild(s);
    }
    ['svp0','svp1','svp2','svp3'].forEach(id => {
      const container = document.getElementById(id);
      if (!container) return;
      const c = colors[parseInt(id.replace('svp',''))] || colors[0];
      for (let i = 0; i < 8; i++) {
        const p    = document.createElement('div');
        const size = 3 + Math.random() * 5;
        p.style.cssText = `position:absolute;left:${20+Math.random()*60}%;top:${20+Math.random()*60}%;width:${size}px;height:${size}px;border-radius:50%;background:${c}0.5);animation:particleFloat ${3+Math.random()*4}s ease-in-out ${Math.random()*4}s infinite`;
        container.appendChild(p);
      }
    });
  }
}
initScrollytelling();


/* ============================================================
   3. WORD REVEAL — SCROLL-LINKED
   ============================================================ */
function initWordReveal() {
  const section = document.querySelector('.word-reveal-section');
  const label   = document.querySelector('.word-reveal-label');
  const textEl  = document.getElementById('wordRevealText');
  if (!section || !textEl) return;

  const words = textEl.textContent.trim().split(/\s+/);
  textEl.innerHTML = '';
  const accentWords = new Set(['boring','3am.','hate','you.']);

  words.forEach((word, i) => {
    const span = document.createElement('span');
    span.classList.add('wr-word');
    span.textContent = word;
    if (accentWords.has(word.toLowerCase())) span.dataset.accent = '1';
    textEl.appendChild(span);
    if (i < words.length - 1) textEl.appendChild(document.createTextNode(' '));
  });

  const wordEls = Array.from(textEl.querySelectorAll('.wr-word'));
  const total   = wordEls.length;
  let lastLit   = -1;

  if (label) {
    new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { label.classList.add('active'); }
    }, { threshold: 0.5 }).observe(section);
  }

  let sectionTop = section.offsetTop;
  window.addEventListener('resize', () => { sectionTop = section.offsetTop; }, { passive: true });
  window.addEventListener('scroll', () => {
    const progress = clamp((scrollY - sectionTop + vpH * 0.75) / (vpH * 0.70), 0, 1);
    const litCount = Math.round(progress * total);
    if (litCount === lastLit) return;
    lastLit = litCount;
    wordEls.forEach((w, i) => {
      const on = i < litCount;
      if (on && w.dataset.accent) { w.classList.add('lit-accent'); w.classList.remove('lit'); }
      else                        { w.classList.toggle('lit', on); w.classList.remove('lit-accent'); }
    });
  }, { passive: true });
}
initWordReveal();


/* ============================================================
   HERO GRADIENT BLOB — mouse tracking (RAF-based lerp)
   ============================================================ */
(function initHeroBlob() {
  if (reducedMode || isTouchDevice) return;
  const wrap = document.querySelector('.hero-grad-wrap');
  const ptr  = document.getElementById('heroBlobPtr');
  if (!wrap || !ptr) return;
  let curX = 0, curY = 0, tgX = 0, tgY = 0;
  window.addEventListener('mousemove', e => {
    const r = wrap.getBoundingClientRect();
    tgX = e.clientX - r.left;
    tgY = e.clientY - r.top;
  });
  (function tick() {
    if (pageVisible) {
      curX += (tgX - curX) / 20;
      curY += (tgY - curY) / 20;
      ptr.style.transform = `translate(${Math.round(curX)}px,${Math.round(curY)}px)`;
    }
    requestAnimationFrame(tick);
  })();
})();


/* ============================================================
   CONTACT FORM
   ============================================================ */
const form        = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn  = form.querySelector('button[type="submit"]');
    const span = btn.querySelector('span');
    btn.disabled = true; span.textContent = 'Sending...';
    try {
      const res = await fetch('https://formspree.io/f/mjgpwvak', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form),
      });
      if (res.ok) {
        form.reset();
        formSuccess.classList.add('show');
        setTimeout(() => formSuccess.classList.remove('show'), 4000);
      } else {
        span.textContent = 'Failed — try again';
        btn.disabled = false;
      }
    } catch {
      span.textContent = 'Failed — try again';
      btn.disabled = false;
    }
    if (!btn.disabled) return;
    span.textContent = 'Send Message';
    btn.disabled = false;
  });
}


/* ============================================================
   9. ACETERNITY TIMELINE — scroll-driven line + card reveals
   ============================================================ */
function initAceTimeline() {
  const wrap = document.getElementById('aceTlWrap');
  const fill = document.getElementById('aceTlLineFill');
  if (!wrap || !fill) return;

  const cards  = Array.from(wrap.querySelectorAll('.ace-tl-card'));
  const isMob  = vpW <= 768;

  const cardObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const idx = cards.indexOf(e.target);
      e.target.style.transitionDelay = e.isIntersecting ? `${idx * 60}ms` : '0ms';
      e.target.classList.toggle('card-visible', e.isIntersecting);
    });
  }, { threshold: isMob ? 0.05 : 0.12, rootMargin: isMob ? '0px 0px -20px 0px' : '0px 0px -50px 0px' });
  cards.forEach(c => cardObs.observe(c));

  const dotObs = new IntersectionObserver(entries => {
    entries.forEach(e => e.target.classList.toggle('dot-active', e.isIntersecting));
  }, { threshold: 0.35 });
  wrap.querySelectorAll('.ace-tl-entry').forEach(e => dotObs.observe(e));

  let fillTarget  = 0;
  let fillCurrent = 0;
  let wrapTop  = wrap.offsetTop;
  let wrapH    = wrap.offsetHeight;
  window.addEventListener('resize', () => { wrapTop = wrap.offsetTop; wrapH = wrap.offsetHeight; }, { passive: true });

  window.addEventListener('scroll', () => {
    const range = wrapH - vpH * 0.40;
    fillTarget = clamp((scrollY - wrapTop + vpH * 0.10) / range, 0, 1) * 100;
  }, { passive: true });

  (function animateLine() {
    if (pageVisible) {
      fillCurrent = lerp(fillCurrent, fillTarget, 0.08);
      fill.style.height = fillCurrent.toFixed(2) + '%';
    }
    requestAnimationFrame(animateLine);
  })();
}
initAceTimeline();


/* ============================================================
   BACK TO TOP
   ============================================================ */
(function initBackToTop() {
  const btn    = document.getElementById('backToTop');
  const footer = document.querySelector('.footer');
  if (!btn || !footer) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('btt-visible', scrollY > 400 && footer.getBoundingClientRect().top >= vpH);
  }, { passive: true });
})();
