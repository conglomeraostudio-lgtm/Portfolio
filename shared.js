/**
 * CONGLOMERAO — shared.js
 * Runs on every page.
 * Modules: page transitions · navbar · hamburger · scroll reveal
 */
'use strict';

/* ============================================================
   PAGE TRANSITION
   Intercepts internal <a> clicks, plays a black panel wipe,
   then navigates. On load, the panel wipes out.
   ============================================================ */
(function initPageTransitions() {
  const overlay = document.getElementById('page-transition');
  if (!overlay) return;

  /* --- Page enters: slide panel up & reveal body --- */
  function pageIn() {
    document.body.classList.add('page-visible');
    overlay.classList.add('slide-out');
    overlay.addEventListener('animationend', () => {
      overlay.classList.remove('slide-out');
      overlay.style.transform = 'translateY(100%)';
    }, { once: true });
  }

  /* --- Page leaves: slide panel in, then navigate --- */
  function pageOut(href) {
    overlay.style.transform = ''; // reset
    overlay.classList.add('slide-in');
    overlay.addEventListener('animationend', () => {
      window.location.href = href;
    }, { once: true });
  }

  /* Intercept all same-origin anchor clicks */
  document.addEventListener('click', e => {
    const anchor = e.target.closest('a[href]');
    if (!anchor) return;

    const href = anchor.getAttribute('href');

    // Skip: external, hash-only, new tab, download
    if (
      !href ||
      href.startsWith('http') ||
      href.startsWith('mailto') ||
      href.startsWith('tel') ||
      href.startsWith('#') ||
      anchor.target === '_blank' ||
      anchor.hasAttribute('download') ||
      e.metaKey || e.ctrlKey || e.shiftKey
    ) return;

    e.preventDefault();
    pageOut(href);
  });

  /* Kick off page-in on load */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', pageIn);
  } else {
    pageIn();
  }
})();


/* ============================================================
   NAVBAR — scroll state + active page link
   ============================================================ */
(function initNavbar() {
  const navbar    = document.querySelector('.navbar');
  const navLinks  = document.querySelectorAll('.nav-link');
  if (!navbar) return;

  /* Mark current page link as active */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  navLinks.forEach(link => {
    const linkPage = link.getAttribute('href').split('/').pop();
    if (linkPage === currentPage) link.classList.add('active');
  });

  /* Scroll-based border */
function onScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
})();


/* ============================================================
   HAMBURGER MENU
   ============================================================ */
(function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navLinks.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  /* Close on link click */
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
})();


/* ============================================================
   SCROLL REVEAL
   ============================================================ */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
})();
