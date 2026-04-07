/* ============================================================
   TS Controls — main.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initScrollSpy();
  initMobileMenu();
  initAnimations();
  initContactForm();
});

/* ── Scroll Spy + Nav Solid ──────────────────────────────── */
function initScrollSpy() {
  const navbar   = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-links a, .nav-mobile-links a');
  const sections = Array.from(document.querySelectorAll('section[id]'));

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateNav();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  function updateNav() {
    const scrollY = window.scrollY;

    // Solid nav background
    navbar.classList.toggle('navbar--scrolled', scrollY > 60);

    // Active section highlight
    const navHeight = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-height')) || 68;
    const threshold = navHeight + 60;

    let active = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= threshold) {
        active = section;
      }
    }

    navLinks.forEach(a => {
      const matches = a.getAttribute('href') === `#${active.id}`;
      a.classList.toggle('active', matches);
    });
  }

  // Run once on load
  updateNav();
}

/* ── Mobile Menu ─────────────────────────────────────────── */
function initMobileMenu() {
  const hamburger  = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.nav-mobile-menu');
  const mobileLinks = document.querySelectorAll('.nav-mobile-links a');

  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('nav-mobile-menu--open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close on link click
  mobileLinks.forEach(link => {
    link.addEventListener('click', close);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      close();
    }
  });

  function close() {
    mobileMenu.classList.remove('nav-mobile-menu--open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
}

/* ── Scroll-reveal Animations ────────────────────────────── */
function initAnimations() {
  const elements = document.querySelectorAll('[data-animate]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/* ── Contact Form ─────────────────────────────────────────── */
function initContactForm() {
  const form   = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (!form || !status) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Clear previous status
    status.textContent = '';
    status.className = 'form-status';

    // Honeypot check — if filled, silently reject (it's a bot)
    const honeypot = form.querySelector('#website');
    if (honeypot && honeypot.value) {
      status.textContent = "Message received. We'll be in touch shortly.";
      status.className = 'form-status success';
      form.reset();
      return;
    }

    // Validate required fields
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      if (!field.value.trim()) {
        field.focus();
        valid = false;
      }
    });

    if (!valid) {
      status.textContent = 'Please fill in all required fields.';
      status.className = 'form-status error';
      return;
    }

    // Validate email format
    const emailField = form.querySelector('input[type="email"]');
    if (emailField && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
      emailField.focus();
      status.textContent = 'Please enter a valid email address.';
      status.className = 'form-status error';
      return;
    }

    // Show sending state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    status.textContent = '';

    const scriptUrl = 'https://script.google.com/macros/s/AKfycbz6d0fl4qjGe6TYAAmwHKk0u93nvzbzb6ofcpHRkoDW48B9SvoIwebtK0YMOFE6LkmX9w/exec';

    fetch(scriptUrl, {
      method: 'POST',
      body: JSON.stringify({
        name:    form.querySelector('#name').value.trim(),
        email:   form.querySelector('#email').value.trim(),
        company: form.querySelector('#company').value.trim(),
        message: form.querySelector('#message').value.trim(),
      }),
    })
      .then(res => res.json())
      .then(() => {
        status.textContent = "Message received. We'll be in touch shortly.";
        status.className = 'form-status success';
        form.reset();
      })
      .catch(() => {
        status.textContent = 'Something went wrong. Please email us directly at thomas@tscontrols.com.';
        status.className = 'form-status error';
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      });
  });
}
