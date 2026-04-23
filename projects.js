/**
 * CONGLOMERAO — projects.js
 *
 * Every page load:
 *  1. Shuffles the project list randomly
 *  2. Assigns each card a random column-span (width) and row-span (height)
 *  3. Renders the grid
 *  4. Clicking a card navigates to its own page
 */
'use strict';

/* ============================================================
   PROJECT DATA
   Add / edit projects here. slug → project-[slug].html
   ============================================================ */
const PROJECTS = [
  {
    slug:  'sedimento-i',
    title: 'Sedimento I',
    year:  '2024',
    cat:   'Pintura',
    img:   'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=900&q=80',
    alt:   'Sedimento I — técnica mixta sobre tabla'
  },
  {
    slug:  'acumulacion',
    title: 'Acumulación',
    year:  '2023',
    cat:   'Instalación',
    img:   'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=900&q=80',
    alt:   'Acumulación — instalación site-specific'
  },
  {
    slug:  'ruido-blanco',
    title: 'Ruido Blanco',
    year:  '2023',
    cat:   'Pintura',
    img:   'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=900&q=80',
    alt:   'Ruido Blanco — serie de óleos'
  },
  {
    slug:  'grieta',
    title: 'Grieta',
    year:  '2022',
    cat:   'Fotografía',
    img:   'https://images.unsplash.com/photo-1549490349-8643362247b5?w=900&q=80',
    alt:   'Grieta — fotografía intervenida'
  },
  {
    slug:  'vacio-habitado',
    title: 'Vacío Habitado',
    year:  '2022',
    cat:   'Dibujo',
    img:   'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=900&q=80',
    alt:   'Vacío Habitado — dibujo y collage'
  },
  {
    slug:  'frontera',
    title: 'Frontera',
    year:  '2021',
    cat:   'Videoarte',
    img:   'https://images.unsplash.com/photo-1516981879613-9f5da904015f?w=900&q=80',
    alt:   'Frontera — videoarte 12 min'
  },
  {
    slug:  'residuo',
    title: 'Residuo',
    year:  '2021',
    cat:   'Escultura',
    img:   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80',
    alt:   'Residuo — escultura con materiales encontrados'
  },
  {
    slug:  'umbral',
    title: 'Umbral',
    year:  '2020',
    cat:   'Pintura',
    img:   'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=900&q=80',
    alt:   'Umbral — óleo sobre lienzo'
  },
  {
    slug:  'mapa-roto',
    title: 'Mapa Roto',
    year:  '2020',
    cat:   'Dibujo',
    img:   'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80',
    alt:   'Mapa Roto — tinta sobre papel'
  },
];

/* ============================================================
   SIZE POOLS
   Column spans (out of 12) and row spans.
   Each card picks randomly from these pools.
   ============================================================ */
const COL_SPANS = [3, 3, 4, 4, 5, 6];   // widths: small, medium, large
const ROW_SPANS = [4, 5, 6, 7, 8];       // heights in 40px units = 160–320px

/* ============================================================
   UTILS
   ============================================================ */

/** Fisher-Yates shuffle — returns new shuffled array */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick a random element from an array */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ============================================================
   BUILD GRID
   ============================================================ */
(function buildGrid() {
  const grid      = document.getElementById('projects-grid');
  const countEl   = document.getElementById('projects-count');
  if (!grid) return;

  /* Update count */
  if (countEl) countEl.textContent = `${PROJECTS.length} obras`;

  /* Shuffle order */
  const shuffled = shuffle(PROJECTS);

  /* On mobile we skip random sizing (handled by CSS) */
  const isMobile = window.innerWidth <= 600;

  shuffled.forEach((project, i) => {
    const colSpan = isMobile ? 1 : pick(COL_SPANS);
    const rowSpan = isMobile ? 1 : pick(ROW_SPANS);

    /* Card element */
    const card = document.createElement('article');
    card.className = 'project-card reveal';
    card.style.gridColumn = `span ${colSpan}`;
    card.style.gridRow    = `span ${rowSpan}`;
    card.style.transitionDelay = `${i * 0.04}s`;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Ver proyecto: ${project.title}`);

    card.innerHTML = `
      <img src="${project.img}" alt="${project.alt}" loading="${i < 4 ? 'eager' : 'lazy'}" />
      <div class="card-overlay"></div>
      <div class="card-info">
        <span class="card-year">${project.year}</span>
        <h2 class="card-title">${project.title}</h2>
        <span class="card-cat">${project.cat}</span>
      </div>
      <div class="card-line"></div>
    `;

    /* Navigate to project page */
    function navigate() {
      card.style.pointerEvents = 'none';
      window.location.href = `project-${project.slug}.html`;
    }

    card.addEventListener('click', navigate);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(); }
    });

    grid.appendChild(card);
  });

  /* Trigger scroll-reveal for cards already in viewport */
  requestAnimationFrame(() => {
    document.querySelectorAll('.project-card.reveal').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95) {
        el.classList.add('revealed');
      }
    });
  });

})();


/* ============================================================
   SCROLL REVEAL for cards below fold
   (shared.js handles generic .reveal — this catches dynamic ones)
   ============================================================ */
(function revealOnScroll() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.06 });

  /* Observe after a tick so cards are in DOM */
  setTimeout(() => {
    document.querySelectorAll('.project-card.reveal:not(.revealed)').forEach(el => {
      io.observe(el);
    });
  }, 100);
})();
