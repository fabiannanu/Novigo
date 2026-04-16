/* ═══════════════════════════════════════════════
   NOVIGO — Main JavaScript
═══════════════════════════════════════════════ */

'use strict';

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

/* ─── PRICING TOGGLE (removed — only one-time pricing) ─── */

/* ─── FAQ ACCORDION ─── */
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const question = item.querySelector('.faq-item__question');
  const answer   = item.querySelector('.faq-item__answer');
  const inner    = answer.querySelector('p');

  question.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    // Close all
    faqItems.forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-item__answer').style.height = '0';
    });

    // Toggle clicked
    if (!isOpen) {
      item.classList.add('open');
      answer.style.height = inner.offsetHeight + 'px';
    }
  });

  // Accessibility
  question.setAttribute('aria-expanded', 'false');
  item.addEventListener('transitionend', () => {
    question.setAttribute('aria-expanded', item.classList.contains('open'));
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

    required.forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = '#f87171';
        valid = false;
      }
    });

    if (!valid) {
      contactForm.querySelector('[required]').focus();
      return;
    }

    // Build mailto and open email client
    btn.disabled = true;
    btnText.hidden = true;
    btnLoad.hidden = false;

    const nameVal    = (contactForm.querySelector('#name').value || '').trim();
    const emailVal   = (contactForm.querySelector('#email').value || '').trim();
    const phoneVal   = (contactForm.querySelector('#phone').value || '').trim();
    const businessVal= (contactForm.querySelector('#business').value || '').trim();
    const serviceVal = (contactForm.querySelector('#service').value || '').trim();
    const messageVal = (contactForm.querySelector('#message').value || '').trim();

    const subject = encodeURIComponent(`Cerere website — ${nameVal}`);
    const body = encodeURIComponent(
      `Nume: ${nameVal}\nEmail: ${emailVal}\nTelefon: ${phoneVal}\nTip afacere: ${businessVal}\nServiciu dorit: ${serviceVal}\n\nMesaj:\n${messageVal}`
    );

    window.location.href = `mailto:alexandrunanu23@gmail.com?subject=${subject}&body=${body}`;

    await new Promise(r => setTimeout(r, 800));

    contactForm.hidden    = true;
    formSuccess.hidden    = false;
    formSuccess.style.display = 'block';
  });

  // Live validation reset
  contactForm.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', () => {
      field.style.borderColor = '';
    });
  });
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
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const navH = navbar.offsetHeight;
    const top  = target.getBoundingClientRect().top + window.scrollY - navH - 16;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ─── ACTIVE NAV LINK on scroll ─── */
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
