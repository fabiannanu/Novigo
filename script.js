/* ═══════════════════════════════════════════════
   NOVIGO — Main JavaScript
═══════════════════════════════════════════════ */

'use strict';

/* ─── FORCE SCROLL TO TOP ON REFRESH ─── */
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.addEventListener('beforeunload', () => { window.scrollTo(0, 0); });
window.scrollTo(0, 0);

/* ─── HERO VIDEO: fade in when playable ─── */
(function initHeroVideo() {
  const video = document.querySelector('.hero__video');
  if (!video) return;
  const markReady = () => video.classList.add('is-ready');
  video.addEventListener('playing', markReady, { once: true });
  video.addEventListener('loadeddata', () => {
    if (video.readyState >= 3) markReady();
  });
})();

/* ─── NAVBAR scroll behaviour ─── */
const navbar = document.getElementById('navbar');

function onScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ─── MOBILE MENU ─── */
const hamburger    = document.getElementById('hamburger');
const navLinks     = document.getElementById('navLinks');     // mobile overlay
const navBackdrop  = document.getElementById('navBackdrop');

function closeMobileNav() {
  // Trigger vacuum effect
  navLinks.classList.add('closing');
  navBackdrop.classList.add('closing');

  setTimeout(() => {
    navLinks.classList.remove('open', 'closing');
    navBackdrop.classList.remove('open', 'closing');
  }, 320);

  hamburger.classList.remove('open');
  document.body.style.overflow = '';
  hamburger.setAttribute('aria-expanded', 'false');
}

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  navLinks.classList.toggle('open', isOpen);
  navBackdrop.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
  hamburger.setAttribute('aria-expanded', isOpen);
});

navBackdrop.addEventListener('click', closeMobileNav);

// Close mobile nav when clicking on the nav overlay itself (the dark area between links)
navLinks.addEventListener('click', e => {
  if (e.target === navLinks) {
    closeMobileNav();
  }
});

// Mobile nav links: close menu, then smooth-scroll
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const href   = link.getAttribute('href');
    const target = href && href !== '#' ? document.querySelector(href) : null;
    closeMobileNav();
    if (target) {
      setTimeout(() => {
        const navH = navbar ? navbar.offsetHeight : 0;
        const top  = target.getBoundingClientRect().top + window.scrollY - navH - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }, 380);
    }
  });
});

/* ─── REVEAL ON SCROLL ─── */
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ─── TEXT REVEAL (per-word scroll animation on headings) ─── */
(function initTextReveal() {
  const headings = document.querySelectorAll('.hero__title, .section__title, .cta-banner h2');
  if (!headings.length) return;

  let wordCounter = 0;

  const wrapTextNode = (textNode, isGradient) => {
    const frag = document.createDocumentFragment();
    const parts = textNode.textContent.split(/(\s+)/);
    parts.forEach(part => {
      if (part === '') return;
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part));
        return;
      }
      const word = document.createElement('span');
      word.className = 'word' + (isGradient ? ' word--gradient' : '');
      word.style.setProperty('--word-i', wordCounter++);
      const inner = document.createElement('span');
      inner.className = 'word__inner';
      inner.textContent = part;
      word.appendChild(inner);
      frag.appendChild(word);
    });
    textNode.parentNode.replaceChild(frag, textNode);
  };

  const splitHeading = (heading) => {
    wordCounter = 0;
    heading.classList.add('text-reveal');
    // Walk direct children; handle <br>, .gradient-text spans, text nodes
    const children = Array.from(heading.childNodes);
    children.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        wrapTextNode(node, false);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === 'BR') return;
        if (node.classList && node.classList.contains('gradient-text')) {
          // Replace the whole gradient span with wrapped words that carry --gradient style
          const innerText = node.textContent;
          const tmp = document.createTextNode(innerText);
          node.parentNode.replaceChild(tmp, node);
          wrapTextNode(tmp, true);
        } else {
          // Fallback: leave as-is
        }
      }
    });
  };

  const textObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          textObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25, rootMargin: '0px 0px -60px 0px' }
  );

  headings.forEach(h => {
    splitHeading(h);
    textObserver.observe(h);
  });
})();

/* ─── SERVICE & PRICING CARDS: mouse-tracked spotlight ─── */
document.querySelectorAll('.service-card, .pricing-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    card.style.setProperty('--my', `${e.clientY - rect.top}px`);
  });
});

/* ─── MAGNETIC BUTTONS (primary CTAs) ─── */
document.querySelectorAll('.btn--primary').forEach(btn => {
  const strength = 14;
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top  - rect.height / 2;
    btn.style.transform = `translate(${(x / rect.width) * strength}px, ${(y / rect.height) * strength - 2}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

/* ─── HERO PARALLAX (gradient orbs follow mouse) ─── */
(function initHeroParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const gradA = hero.querySelector('.hero__grad--tl');
  const gradB = hero.querySelector('.hero__grad--br');
  if (!gradA && !gradB) return;

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    if (gradA) gradA.style.translate = `${x * 30}px ${y * 30}px`;
    if (gradB) gradB.style.translate = `${x * -40}px ${y * -40}px`;
  });
  hero.addEventListener('mouseleave', () => {
    if (gradA) gradA.style.translate = '';
    if (gradB) gradB.style.translate = '';
  });
})();

/* ─── ANIMATED COUNTERS ─── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const start    = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }

  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll('.stat__number[data-target]').forEach(el => counterObserver.observe(el));

/* ─── PORTFOLIO FILTERS ─── */
const filterBtns      = document.querySelectorAll('.filter-btn');
const portfolioItems  = document.querySelectorAll('.portfolio-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('filter-btn--active'));
    btn.classList.add('filter-btn--active');

    const filter = btn.dataset.filter;

    portfolioItems.forEach(item => {
      const show = filter === 'all' || item.dataset.category === filter;
      item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

      if (show) {
        item.classList.remove('hidden');
        requestAnimationFrame(() => {
          item.style.opacity = '1';
          item.style.transform = '';
        });
      } else {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.95)';
        setTimeout(() => item.classList.add('hidden'), 300);
      }
    });
  });
});

/* ─── PORTFOLIO CAROUSEL ─── */
(function initPortfolioCarousel() {
  const track    = document.getElementById('portfolioTrack');
  const viewport = document.getElementById('portfolioViewport');
  const prevBtn  = document.getElementById('portfolioPrev');
  const nextBtn  = document.getElementById('portfolioNext');
  const dots     = document.querySelectorAll('.portfolio__dot');
  if (!track || !prevBtn || !nextBtn) return;

  const items = track.querySelectorAll('.portfolio-item');
  const total = items.length;
  let current = 0;

  function getVisible() {
    return window.innerWidth <= 640 ? 1 : 2;
  }

  function maxIndex() {
    return Math.max(0, total - getVisible());
  }

  function update(animate) {
    const visible = getVisible();
    const itemW   = viewport.offsetWidth / visible;
    const offset  = current * (itemW + 28);
    if (animate === false) {
      track.style.transition = 'none';
    } else {
      track.style.transition = 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)';
    }
    track.style.transform = `translateX(-${offset}px)`;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current >= maxIndex();
    dots.forEach((d, i) => d.classList.toggle('portfolio__dot--active', i === current));
  }

  prevBtn.addEventListener('click', () => {
    if (current > 0) { current--; update(); }
  });
  nextBtn.addEventListener('click', () => {
    if (current < maxIndex()) { current++; update(); }
  });
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      current = Math.min(parseInt(dot.dataset.index, 10), maxIndex());
      update();
    });
  });

  let touchStartX = 0;
  viewport.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  viewport.addEventListener('touchend', e => {
    const dx = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) {
      if (dx > 0 && current < maxIndex()) { current++; update(); }
      else if (dx < 0 && current > 0)    { current--; update(); }
    }
  });

  window.addEventListener('resize', () => {
    current = Math.min(current, maxIndex());
    update(false);
    requestAnimationFrame(() => update());
  });

  update(false);
})();

/* ─── PROCESS TIMELINE: scroll-driven connecting line ─── */
(function initProcessTimeline() {
  const timeline = document.querySelector('.process__timeline');
  if (!timeline) return;
  const steps = Array.from(timeline.querySelectorAll('.process-step'));
  if (!steps.length) return;

  const update = () => {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const timelineRect = timeline.getBoundingClientRect();
    const timelineTop = timelineRect.top + window.scrollY;
    const timelineBottom = timelineTop + timelineRect.height;
    const viewportCenter = window.scrollY + vh * 0.5;

    steps.forEach((step, idx) => {
      const num = step.querySelector('.process-step__number');
      if (!idx) step.classList.add('is-active'); // Always show first step active

      // Calculate progress for this step's line
      const stepRect = step.getBoundingClientRect();
      const stepTop = stepRect.top + window.scrollY;
      const stepBottom = stepTop + stepRect.height;
      const nextStepTop = idx < steps.length - 1 ? steps[idx + 1].getBoundingClientRect().top + window.scrollY : stepBottom;

      // Smooth progress from when this step appears until next step reaches center
      const progress = Math.max(0, Math.min(1, (viewportCenter - stepTop) / (nextStepTop - stepTop)));
      step.style.setProperty('--progress', progress);

      // Mark step active if it's past center
      const numCenter = stepTop + 40;
      if (numCenter <= viewportCenter) {
        step.classList.add('is-active');
      } else {
        step.classList.remove('is-active');
      }
    });
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

/* ─── PRICING TOGGLE (removed — only one-time pricing) ─── */

/* ─── FAQ ACCORDION ─── */
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const question = item.querySelector('.faq-item__question');
  question.setAttribute('aria-expanded', 'false');

  question.addEventListener('click', () => {
    const willOpen = !item.classList.contains('open');

    faqItems.forEach(i => {
      i.classList.remove('open');
      const q = i.querySelector('.faq-item__question');
      if (q) q.setAttribute('aria-expanded', 'false');
    });

    if (willOpen) {
      item.classList.add('open');
      question.setAttribute('aria-expanded', 'true');
    }
  });
});

/* ─── CONTACT FORM ─── */
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();

    const btn     = contactForm.querySelector('.btn');
    const btnText = btn.querySelector('.btn__text');
    const btnLoad = btn.querySelector('.btn__loading');

    // Basic validation
    const required = contactForm.querySelectorAll('[required]');
    let valid = true;
    let firstInvalid = null;

    required.forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = '#f87171';
        valid = false;
        if (!firstInvalid) firstInvalid = field;
      }
    });

    if (!valid) {
      firstInvalid.focus();
      return;
    }

    // Submit via Formspree
    btn.disabled = true;
    btnText.hidden = true;
    btnLoad.hidden = false;

    try {
      const response = await fetch('https://formspree.io/f/xeevkgyb', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(contactForm),
      });

      if (response.ok) {
        contactForm.hidden        = true;
        formSuccess.hidden        = false;
        formSuccess.style.display = 'block';
      } else {
        const data = await response.json();
        const msg = data?.errors?.map(e => e.message).join(', ') || 'Eroare la trimitere. Încearcă din nou.';
        alert(msg);
        btn.disabled   = false;
        btnText.hidden = false;
        btnLoad.hidden = true;
      }
    } catch {
      alert('Eroare de rețea. Verifică conexiunea și încearcă din nou.');
      btn.disabled   = false;
      btnText.hidden = false;
      btnLoad.hidden = true;
    }
  });

  // Live validation reset
  contactForm.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => {
      field.style.borderColor = '';
    });
    field.addEventListener('change', () => {
      field.style.borderColor = '';
    });
  });

  // Reset form to show it again
  const formReset = document.getElementById('formReset');
  if (formReset) {
    formReset.addEventListener('click', () => {
      contactForm.reset();
      contactForm.querySelectorAll('input, select, textarea').forEach(f => {
        f.style.borderColor = '';
      });
      const btn     = contactForm.querySelector('.btn');
      const btnText = btn.querySelector('.btn__text');
      const btnLoad = btn.querySelector('.btn__loading');
      btn.disabled   = false;
      btnText.hidden = false;
      btnLoad.hidden = true;
      formSuccess.hidden = true;
      formSuccess.style.display = '';
      contactForm.hidden = false;
    });
  }
}

/* ─── COOKIE BANNER ─── */
const cookieBanner  = document.getElementById('cookieBanner');
const cookieAccept  = document.getElementById('cookieAccept');
const cookieDecline = document.getElementById('cookieDecline');

const COOKIE_KEY     = 'novigo_cookie_consent';
const COOKIE_VERSION = 'v2'; // bump this to re-show banner after updates

function hideCookieBanner() {
  cookieBanner.classList.remove('visible');
  setTimeout(() => { cookieBanner.style.display = 'none'; }, 400);
}

// Show banner if never answered OR answered on an older version
const stored = localStorage.getItem(COOKIE_KEY);
if (!stored || !stored.endsWith('_' + COOKIE_VERSION)) {
  cookieBanner.style.display = ''; // reset any inline display:none from a previous hide
  setTimeout(() => cookieBanner.classList.add('visible'), 800);
}

cookieAccept.addEventListener('click', () => {
  localStorage.setItem(COOKIE_KEY, 'accepted_' + COOKIE_VERSION);
  hideCookieBanner();
});

cookieDecline.addEventListener('click', () => {
  localStorage.setItem(COOKIE_KEY, 'declined_' + COOKIE_VERSION);
  hideCookieBanner();
});

/* ─── SMOOTH ANCHOR SCROLL ─── */
function smoothScrollToTarget(target) {
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    smoothScrollToTarget(target);
  });
});

/* ─── ACTIVE NAV LINK on scroll ─── */
const googleReviewsBtn = document.getElementById('googleReviewsBtn');

if (googleReviewsBtn) {
  const googleReviewsUrl = googleReviewsBtn.dataset.googleReviewsUrl;

  const openGoogleReviews = event => {
    if (!googleReviewsUrl) return;
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    window.location.href = googleReviewsUrl;
  };

  googleReviewsBtn.addEventListener('click', openGoogleReviews);
  googleReviewsBtn.addEventListener('touchend', openGoogleReviews, { passive: false });
  googleReviewsBtn.addEventListener('pointerup', openGoogleReviews);
}

const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav__links--desktop a:not(.btn)');

const sectionObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navAnchors.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);

sections.forEach(s => sectionObserver.observe(s));

/* ─── HERO SCROLL BUTTON ─── */
const heroScrollBtn = document.getElementById('heroScrollBtn');
if (heroScrollBtn) {
  heroScrollBtn.addEventListener('click', () => {
    const nextSection = document.querySelector('#hero + section') || document.querySelector('section:nth-of-type(2)');
    if (nextSection) {
      const navH = navbar ? navbar.offsetHeight : 0;
      const top = nextSection.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
}

/* ─── LEGAL MODALS ─── */
function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  // focus trap — focus close button
  const closeBtn = modal.querySelector('.legal-modal__close');
  if (closeBtn) closeBtn.focus();
}

function closeModal(modal) {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

// Open via footer legal links
document.querySelectorAll('.legal-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    openModal(link.dataset.modal);
  });
});

// Open from cookie banner "Află mai mult"
document.querySelectorAll('[data-modal]').forEach(el => {
  if (el.classList.contains('legal-link')) return; // already handled
  el.addEventListener('click', e => {
    e.preventDefault();
    openModal(el.dataset.modal);
  });
});

// Close via × button
document.querySelectorAll('.legal-modal__close').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.closest('.legal-modal')));
});

// Close via backdrop click
document.querySelectorAll('.legal-modal__backdrop').forEach(backdrop => {
  backdrop.addEventListener('click', () => closeModal(backdrop.closest('.legal-modal')));
});

// Close via Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.legal-modal.open').forEach(m => closeModal(m));
  }
});

// Inline links inside modal bodies (e.g. link to cookies from privacy)
document.querySelectorAll('.legal-inline-link').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    // close current modal first, then open target
    document.querySelectorAll('.legal-modal.open').forEach(m => closeModal(m));
    openModal(btn.dataset.modal);
  });
});

/* ─── TILT EFFECT on cards (desktop only) ─── */
if (window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.service-card, .pricing-card, .testimonial-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const cx     = rect.width  / 2;
      const cy     = rect.height / 2;
      const rotateX = ((y - cy) / cy) * -4;
      const rotateY = ((x - cx) / cx) *  4;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ─── TESTIMONIALS CAROUSEL ─── */
(function () {
  const track  = document.getElementById('tcTrack');
  const dotsEl = document.getElementById('tcDots');
  const btnPrev = document.getElementById('tcPrev');
  const btnNext = document.getElementById('tcNext');
  if (!track) return;

  const slides = track.querySelectorAll('.tc__slide');
  const total  = slides.length;
  let current  = 0;
  let autoTimer;

  // build dots
  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'tc__dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Slide ' + (i + 1));
    d.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(d);
  });

  function goTo(idx) {
    current = (idx + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsEl.querySelectorAll('.tc__dot').forEach((d, i) =>
      d.classList.toggle('active', i === current)
    );
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }

  btnNext.addEventListener('click', () => { goTo(current + 1); startAuto(); });
  btnPrev.addEventListener('click', () => { goTo(current - 1); startAuto(); });

  // swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) { goTo(current + (dx < 0 ? 1 : -1)); startAuto(); }
  }, { passive: true });

  startAuto();
})();
