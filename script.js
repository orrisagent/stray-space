/* ========================================
   STRAY — Signal Reception & Emergence
   ======================================== */

(function () {
  'use strict';

  var reception = document.getElementById('reception');
  var nav = document.getElementById('nav');
  var navTrigger = document.getElementById('navTrigger');

  // --- Signal reception: darkness lifts slowly ---
  setTimeout(function () {
    reception.classList.add('received');
  }, 1200);

  setTimeout(function () {
    reception.style.display = 'none';
  }, 6000);

  // --- Hidden nav: appears only when mouse enters top edge ---
  var navTimeout;

  navTrigger.addEventListener('mouseenter', function () {
    clearTimeout(navTimeout);
    nav.classList.add('show');
  });

  nav.addEventListener('mouseenter', function () {
    clearTimeout(navTimeout);
  });

  nav.addEventListener('mouseleave', function () {
    navTimeout = setTimeout(function () {
      nav.classList.remove('show');
    }, 800);
  });

  navTrigger.addEventListener('mouseleave', function () {
    navTimeout = setTimeout(function () {
      nav.classList.remove('show');
    }, 800);
  });

  // --- Fade units: each paragraph emerges independently ---
  var fadeUnits = document.querySelectorAll('.fade-unit');

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // Stagger: paragraphs within the same entry fade in sequentially
          var parent = entry.target.closest('.entry');
          if (parent) {
            var siblings = parent.querySelectorAll('.fade-unit');
            var index = Array.prototype.indexOf.call(siblings, entry.target);
            setTimeout(function () {
              entry.target.classList.add('visible');
            }, index * 600);
          } else {
            entry.target.classList.add('visible');
          }
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -20px 0px',
    }
  );

  // First entry: delay to sync with reception
  var firstEntry = document.getElementById('entry-latest');
  var firstUnits = firstEntry ? firstEntry.querySelectorAll('.fade-unit') : [];

  fadeUnits.forEach(function (el) {
    var isFirst = firstEntry && firstEntry.contains(el);
    if (isFirst) {
      // These will be triggered manually after reception
      return;
    }
    observer.observe(el);
  });

  // First entry emerges after reception signal arrives
  setTimeout(function () {
    firstUnits.forEach(function (el, i) {
      setTimeout(function () {
        el.classList.add('visible');
      }, i * 700);
    });
  }, 2000);
})();
