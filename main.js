/* ── ARGUS LEADS — main.js ─────────────────────────────────────────────────── */
'use strict';

(function () {

  /* ── 1. Sticky nav ─────────────────────────────────────────────────────── */
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  function onScroll() {
    const y = window.scrollY;
    if (y > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = y;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load


  /* ── 2. Mobile menu ────────────────────────────────────────────────────── */
  const hamburger  = document.getElementById('hamburger');
  const navDrawer  = document.getElementById('navDrawer');
  let menuOpen = false;

  function openMenu() {
    menuOpen = true;
    navDrawer.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    navDrawer.setAttribute('aria-hidden', 'false');
    // Swap to X icon
    hamburger.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <line x1="4" y1="4" x2="18" y2="18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="18" y1="4" x2="4" y2="18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`;
  }

  function closeMenu() {
    menuOpen = false;
    navDrawer.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    navDrawer.setAttribute('aria-hidden', 'true');
    // Restore hamburger icon
    hamburger.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <line x1="2" y1="5" x2="20" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="2" y1="11" x2="20" y2="11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="2" y1="17" x2="20" y2="17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`;
  }

  hamburger.addEventListener('click', () => {
    if (menuOpen) closeMenu(); else openMenu();
  });

  // Close on any drawer link click
  navDrawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (menuOpen && !nav.contains(e.target)) closeMenu();
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) closeMenu();
  });


  /* ── 3. Smooth scroll for all anchor links ─────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = nav.offsetHeight;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  /* ── 4. Fade-up Intersection Observer ─────────────────────────────────── */
  const fadeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target); // once only
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));


  /* ── 5. Count-up animation ─────────────────────────────────────────────── */
  let statsAnimated = false;
  const statsRow = document.getElementById('statsRow');

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateStat(el) {
    const type     = el.dataset.type;
    const fromVal  = parseFloat(el.dataset.from) || 0;
    const toVal    = parseFloat(el.dataset.to)   || 0;
    const duration = 2200;
    const start    = performance.now();

    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease     = easeOut(progress);

      if (type === 'time') {
        // Count down from 60 → 2, display as "< N min"
        const val = Math.round(fromVal - (fromVal - toVal) * ease);
        el.textContent = '< ' + val + ' min';
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = '< 2 min';

      } else if (type === 'ratio') {
        // Count 0 → 24, then reveal "/7"
        const val = Math.round(toVal * ease);
        el.textContent = val < toVal ? val + '...' : '24/7';
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = '24/7';

      } else if (type === 'zero') {
        // Count down from 15 → 0 (dramatic)
        const val = Math.round(fromVal - fromVal * ease);
        el.textContent = val;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = '0';

      } else {
        // Normal count-up
        const val = Math.round(fromVal + (toVal - fromVal) * ease);
        el.textContent = val;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = Math.round(toVal);
      }
    }

    requestAnimationFrame(tick);
  }

  function triggerStats() {
    if (statsAnimated) return;
    statsAnimated = true;
    statsRow.querySelectorAll('.stat-num').forEach(el => animateStat(el));
  }

  if (statsRow) {
    const statsObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          triggerStats();
          statsObserver.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    statsObserver.observe(statsRow);
  }


  /* ── 6. Active nav link highlighting ──────────────────────────────────── */
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === '#' + id) {
              link.style.color = 'var(--gold)';
            } else {
              link.style.color = '';
            }
          });
        }
      });
    },
    { threshold: 0.35, rootMargin: '-60px 0px 0px 0px' }
  );

  sections.forEach(s => sectionObserver.observe(s));


  /* ── 7. Form submit feedback ───────────────────────────────────────────── */
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      const btn = contactForm.querySelector('.contact-submit');
      if (btn) {
        btn.textContent = 'Sending…';
        btn.disabled = true;
        // Re-enable after short delay (mailto opens native client)
        setTimeout(() => {
          btn.textContent = 'Send Message';
          btn.disabled = false;
        }, 2000);
      }
    });
  }

})();
