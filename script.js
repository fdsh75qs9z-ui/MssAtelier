/* ============================================
   MSS ATELIER — script.js
   ============================================ */

const nav = document.querySelector('.nav');
const scrollTopBtn = document.querySelector('.scroll-top');

function onScroll() {
  nav.classList.toggle('scrolled', window.scrollY > 40);
  scrollTopBtn?.classList.toggle('visible', window.scrollY > 500);
}
window.addEventListener('scroll', onScroll, { passive: true });

/* --- Mobile menu --- */
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.nav-mobile');
const mobileClose = document.querySelector('.nav-mobile-close');
const mobileLinks = document.querySelectorAll('.nav-mobile a');

function openMenu() {
  mobileMenu.classList.add('open');
  document.body.style.overflow = 'hidden';
  hamburger.setAttribute('aria-expanded', 'true');
}

function closeMenu() {
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
  hamburger.setAttribute('aria-expanded', 'false');
}

hamburger?.addEventListener('click', openMenu);
mobileClose?.addEventListener('click', closeMenu);
mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});

/* --- Scroll to top --- */
scrollTopBtn?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* --- Fade-up on scroll --- */
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));

/* --- Stagger children --- */
const staggerObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.fade-up').forEach((child, i) => {
        setTimeout(() => child.classList.add('visible'), i * 90);
      });
      staggerObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.services-grid, .promise-grid, .pricing-grid, .about-values, .process-timeline')
  .forEach(grid => staggerObserver.observe(grid));

/* --- Active nav on scroll --- */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle('active-link',
          link.getAttribute('href') === `#${id}`
        );
      });
    }
  });
}, { rootMargin: '-50% 0px -50% 0px' });

sections.forEach(s => sectionObserver.observe(s));

/* --- Contact form --- */
const form = document.querySelector('.contact-form form');
const formSuccess = document.querySelector('.form-success');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const btn = form.querySelector('.form-submit');
  const originalText = btn.textContent;
  btn.textContent = 'Sender...';
  btn.disabled = true;

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      form.style.display = 'none';
      if (formSuccess) formSuccess.style.display = 'block';
    } else {
      throw new Error('Send failed');
    }
  } catch (err) {
    btn.textContent = 'Fejl — prøv igen';
    btn.disabled = false;
    setTimeout(() => { btn.textContent = originalText; }, 3000);
  }
});
