/* ========================================
   STRAY — Signal Reception & Emergence
   
   Handles:
   - Signal reception overlay fade
   - Hidden navigation reveal
   - Fade-in animation for content
   - Touch support for mobile
   ======================================== */

(function () {
  'use strict';

  // --- Elements ---
  var reception = document.getElementById('reception');
  var nav = document.getElementById('nav');
  var navTrigger = document.getElementById('navTrigger');

  // --- Signal reception: darkness lifts slowly ---
  if (reception) {
    // Delay before the signal arrives
    setTimeout(function () {
      reception.classList.add('received');
    }, 1400);

    // Remove from DOM after transition completes
    setTimeout(function () {
      reception.style.display = 'none';
    }, 7000);
  }

  // --- Hidden nav: appears when approaching top edge ---
  var navTimeout;
  var navVisible = false;

  function showNav() {
    clearTimeout(navTimeout);
    if (!navVisible) {
      nav.classList.add('show');
      navVisible = true;
    }
  }

  function hideNav(delay) {
    clearTimeout(navTimeout);
    navTimeout = setTimeout(function () {
      nav.classList.remove('show');
      navVisible = false;
    }, delay || 1000);
  }

  if (navTrigger && nav) {
    // Mouse events
    navTrigger.addEventListener('mouseenter', showNav);
    nav.addEventListener('mouseenter', function () {
      clearTimeout(navTimeout);
    });
    nav.addEventListener('mouseleave', function () {
      hideNav(800);
    });
    navTrigger.addEventListener('mouseleave', function () {
      hideNav(800);
    });

    // Touch support: tap near top to toggle nav
    var touchStartY = 0;
    var touchStartTime = 0;

    document.addEventListener('touchstart', function (e) {
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
      var touchEndY = e.changedTouches[0].clientY;
      var touchDuration = Date.now() - touchStartTime;
      
      // Quick tap in top 80px
      if (touchStartY < 80 && touchEndY < 100 && touchDuration < 300) {
        if (navVisible) {
          hideNav(0);
        } else {
          showNav();
          hideNav(4000); // Auto-hide after 4s on mobile
        }
      } else if (navVisible && touchStartY > 150) {
        // Tap elsewhere to dismiss
        hideNav(0);
      }
    }, { passive: true });

    // Keyboard support: show nav when tabbing to it
    nav.addEventListener('focusin', showNav);
    nav.addEventListener('focusout', function (e) {
      // Only hide if focus left the nav entirely
      if (!nav.contains(e.relatedTarget)) {
        hideNav(500);
      }
    });
  }

  // --- Fade units: each element emerges independently ---
  var fadeUnits = document.querySelectorAll('.fade-unit');
  var firstEntry = document.getElementById('entry-latest');
  var firstUnits = firstEntry ? firstEntry.querySelectorAll('.fade-unit') : [];

  // IntersectionObserver for scroll-triggered fade
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            // Stagger: paragraphs within same entry fade sequentially
            var parent = entry.target.closest('.entry');
            if (parent) {
              var siblings = parent.querySelectorAll('.fade-unit');
              var index = Array.prototype.indexOf.call(siblings, entry.target);
              setTimeout(function () {
                entry.target.classList.add('visible');
              }, index * 500);
            } else {
              entry.target.classList.add('visible');
            }
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    // Observe all fade units except the first entry (handled separately)
    fadeUnits.forEach(function (el) {
      var isFirst = firstEntry && firstEntry.contains(el);
      if (!isFirst) {
        observer.observe(el);
      }
    });
  } else {
    // Fallback: show all immediately
    fadeUnits.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // First entry emerges after reception signal arrives
  setTimeout(function () {
    firstUnits.forEach(function (el, i) {
      setTimeout(function () {
        el.classList.add('visible');
      }, i * 600);
    });
  }, 2200);

  // --- Smooth scroll for internal links (enhancement) ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '#main') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Focus management for accessibility
        var target = document.getElementById('main') || document.body;
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  });

  // --- Respect reduced motion ---
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Make all fade units visible immediately
    fadeUnits.forEach(function (el) {
      el.classList.add('visible');
    });
    
    // Skip reception animation
    if (reception) {
      reception.style.display = 'none';
    }
  }

})();
