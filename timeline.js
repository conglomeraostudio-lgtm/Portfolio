/**
 * CONGLOMERAO — timeline.js
 * Drag-to-scroll horizontal timeline
 * Progress bar · Drag hint hide on first scroll
 */
'use strict';

(function initTimeline() {
  const wrap     = document.getElementById('timeline-scroll-wrap');
  const track    = document.getElementById('timeline-track');
  const progress = document.getElementById('timeline-progress-fill');
  const hint     = document.getElementById('drag-hint');

  if (!wrap || !track) return;

  /* ---- State ---- */
  let isDragging  = false;
  let startX      = 0;
  let currentX    = 0;       // current translate offset
  let velX        = 0;       // velocity for momentum
  let lastX       = 0;
  let lastTime    = 0;
  let rafId       = null;
  let hintHidden  = false;

  /* ---- Max scroll ---- */
  function getMaxScroll() {
    return Math.max(0, track.scrollWidth - wrap.clientWidth);
  }

  /* ---- Apply transform ---- */
  function setX(x) {
    currentX = Math.max(-getMaxScroll(), Math.min(0, x));
    track.style.transform = `translateX(${currentX}px)`;
    updateProgress();
  }

  /* ---- Progress bar ---- */
  function updateProgress() {
    const max = getMaxScroll();
    const pct = max > 0 ? (-currentX / max) * 100 : 0;
    if (progress) progress.style.width = pct + '%';
  }

  /* ---- Hide drag hint on first interaction ---- */
  function hideHint() {
    if (hintHidden || !hint) return;
    hintHidden = true;
    hint.classList.add('hidden');
  }

  /* ---- Momentum animation ---- */
  function momentum() {
    if (Math.abs(velX) < 0.5) return;
    velX *= 0.92;
    setX(currentX + velX);
    rafId = requestAnimationFrame(momentum);
  }

  /* ============================================================
     MOUSE drag
     ============================================================ */
  wrap.addEventListener('mousedown', e => {
    isDragging = true;
    startX  = e.clientX - currentX;
    lastX   = e.clientX;
    lastTime = performance.now();
    velX    = 0;
    wrap.classList.add('dragging');
    cancelAnimationFrame(rafId);
    hideHint();
    e.preventDefault();
  });

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const now = performance.now();
    const dt  = now - lastTime;
    velX = dt > 0 ? ((e.clientX - lastX) / dt) * 16 : 0;
    lastX    = e.clientX;
    lastTime = now;
    setX(e.clientX - startX);
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    wrap.classList.remove('dragging');
    rafId = requestAnimationFrame(momentum);
  });

  /* ============================================================
     TOUCH drag
     ============================================================ */
  wrap.addEventListener('touchstart', e => {
    startX   = e.touches[0].clientX - currentX;
    lastX    = e.touches[0].clientX;
    lastTime = performance.now();
    velX     = 0;
    cancelAnimationFrame(rafId);
    hideHint();
  }, { passive: true });

  wrap.addEventListener('touchmove', e => {
    const now = performance.now();
    const dt  = now - lastTime;
    velX = dt > 0 ? ((e.touches[0].clientX - lastX) / dt) * 16 : 0;
    lastX    = e.touches[0].clientX;
    lastTime = now;
    setX(e.touches[0].clientX - startX);
  }, { passive: true });

  wrap.addEventListener('touchend', () => {
    rafId = requestAnimationFrame(momentum);
  });

  /* ============================================================
     WHEEL (horizontal scroll on trackpad / mouse wheel)
     ============================================================ */
  wrap.addEventListener('wheel', e => {
    e.preventDefault();
    cancelAnimationFrame(rafId);
    hideHint();
    const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
    setX(currentX - delta);
  }, { passive: false });

  /* ============================================================
     KEYBOARD arrows
     ============================================================ */
  wrap.setAttribute('tabindex', '0');
  wrap.addEventListener('keydown', e => {
    const step = 200;
    if (e.key === 'ArrowRight') { e.preventDefault(); setX(currentX - step); hideHint(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); setX(currentX + step); hideHint(); }
  });

  /* ---- Init progress ---- */
  updateProgress();

  /* ---- Recalc on resize ---- */
  window.addEventListener('resize', () => {
    setX(currentX); // re-clamp
    updateProgress();
  });

})();
