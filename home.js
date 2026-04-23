/**
 * CONGLOMERAO — home.js
 * Intro screen logic + Hero carousel
 */
'use strict';

/* ============================================================
   INTRO SCREEN
   ============================================================ */
(function initIntro() {
  const introScreen = document.getElementById('intro-screen');
  const introBtn    = document.getElementById('intro-btn');
  const siteWrapper = document.getElementById('site-wrapper');
  const heroName    = document.querySelector('.hero-name');

  if (!introScreen || !introBtn || !siteWrapper) return;

  /* Check if user already dismissed the intro this session */
  const seen = sessionStorage.getItem('cgIntroSeen');

  if (seen) {
    /* Skip intro on back-navigation */
    introScreen.classList.add('hidden');
    introScreen.addEventListener('transitionend', () => {
      introScreen.style.display = 'none';
    }, { once: true });
    siteWrapper.classList.add('visible');
    if (heroName) setTimeout(() => heroName.classList.add('visible'), 200);
    return;
  }

  /* Dismiss intro on button click */
  introBtn.addEventListener('click', dismissIntro);

  /* Also allow spacebar / Enter */
  introBtn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') dismissIntro();
  });

  function dismissIntro() {
    sessionStorage.setItem('cgIntroSeen', '1');

    /* 1. Fade out intro */
    introScreen.classList.add('hidden');

    /* 2. Show site */
    siteWrapper.classList.add('visible');

    /* 3. Animate artist name */
    if (heroName) {
      setTimeout(() => heroName.classList.add('visible'), 400);
    }

    /* 4. Remove from DOM after fade */
    introScreen.addEventListener('transitionend', () => {
      introScreen.style.display = 'none';
    }, { once: true });
  }
})();


/* ============================================================
   HERO CAROUSEL
   Auto-advances every 5 s. Pause on hover/focus.
   ============================================================ */
(function initCarousel() {
  const slides      = document.querySelectorAll('.carousel-slide');
  const dotsWrap    = document.getElementById('carousel-dots');
  const prevBtn     = document.getElementById('carousel-prev');
  const nextBtn     = document.getElementById('carousel-next');
  const progressBar = document.getElementById('carousel-progress-bar');
  const carousel    = document.getElementById('carousel');

  if (!slides.length || !dotsWrap) return;

  const TOTAL       = slides.length;
  const AUTO_MS     = 5000;  // 5 seconds per slide
  let   current     = 0;
  let   timer       = null;
  let   progressRaf = null;
  let   startTime   = null;
  let   paused      = false;

  /* ---------- Build dots ---------- */
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Diapositiva ${i + 1}`);
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  const dots = dotsWrap.querySelectorAll('.carousel-dot');

  /* ---------- Show a slide ---------- */
  function goTo(index, restart = true) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    dots[current].setAttribute('aria-selected', 'false');

    current = (index + TOTAL) % TOTAL;

    slides[current].classList.add('active');
    dots[current].classList.add('active');
    dots[current].setAttribute('aria-selected', 'true');

    if (restart) restartAuto();
  }

  /* ---------- Auto-play + progress bar ---------- */
  function startAuto() {
    if (paused) return;
    startTime = performance.now();
    progressBar.style.transition = `width ${AUTO_MS}ms linear`;
    progressBar.style.width = '100%';

    timer = setTimeout(() => {
      goTo(current + 1);
    }, AUTO_MS);
  }

  function stopAuto() {
    clearTimeout(timer);
    cancelAnimationFrame(progressRaf);
    /* Freeze bar at current position */
    const elapsed = performance.now() - (startTime || performance.now());
    const pct = Math.min((elapsed / AUTO_MS) * 100, 100);
    progressBar.style.transition = 'none';
    progressBar.style.width = pct + '%';
  }

  function restartAuto() {
    stopAuto();
    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';
    /* Force reflow */
    void progressBar.offsetWidth;
    startAuto();
  }

  /* ---------- Controls ---------- */
  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  /* ---------- Keyboard on carousel ---------- */
  carousel.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(current - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
  });

  /* ---------- Pause on hover / focus ---------- */
  carousel.addEventListener('mouseenter', () => { paused = true;  stopAuto(); });
  carousel.addEventListener('mouseleave', () => { paused = false; restartAuto(); });
  carousel.addEventListener('focusin',    () => { paused = true;  stopAuto(); });
  carousel.addEventListener('focusout',   () => { paused = false; restartAuto(); });

  /* ---------- Touch swipe ---------- */
  let touchStartX = 0;

  carousel.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  carousel.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) goTo(dx < 0 ? current + 1 : current - 1);
  }, { passive: true });

  /* ---------- Init ---------- */
  slides[0].classList.add('active');

  /* Start auto only after intro finishes (or immediately if skipped) */
  const introBtn = document.getElementById('intro-btn');
  const introScreen = document.getElementById('intro-screen');

  if (introScreen && !sessionStorage.getItem('cgIntroSeen')) {
    /* Wait for intro dismiss */
    introBtn && introBtn.addEventListener('click', () => {
      setTimeout(startAuto, 600);
    }, { once: true });
  } else {
    setTimeout(startAuto, 400);
  }

})();
