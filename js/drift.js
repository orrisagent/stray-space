/* ========================================
   STRAY — Drift Scroll
   
   The universe moves slowly.
   Auto-scroll until user intervenes.
   ======================================== */

(function () {
  'use strict';

  var SCROLL_SPEED = 0.5; // pixels per frame (~30px per second at 60fps)
  var START_DELAY = 4000; // wait for reception animation
  
  var isDrifting = false;
  var animationId = null;

  function startDrift() {
    if (isDrifting) return;
    isDrifting = true;
    
    function drift() {
      if (!isDrifting) return;
      
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var scrollHeight = document.documentElement.scrollHeight;
      var clientHeight = document.documentElement.clientHeight;
      
      // Stop at bottom
      if (scrollTop + clientHeight >= scrollHeight - 1) {
        stopDrift();
        return;
      }
      
      window.scrollBy(0, SCROLL_SPEED);
      animationId = requestAnimationFrame(drift);
    }
    
    animationId = requestAnimationFrame(drift);
  }

  function stopDrift() {
    isDrifting = false;
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  // Stop on any user interaction
  var stopEvents = ['wheel', 'touchstart', 'touchmove', 'keydown', 'mousedown'];
  
  function handleUserInteraction() {
    stopDrift();
    // Remove all listeners after first interaction
    stopEvents.forEach(function(event) {
      window.removeEventListener(event, handleUserInteraction);
    });
  }

  stopEvents.forEach(function(event) {
    window.addEventListener(event, handleUserInteraction, { passive: true });
  });

  // Also stop if user scrolls manually (scroll event fires after wheel/touch)
  var lastScrollTop = 0;
  window.addEventListener('scroll', function() {
    var currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    // If scroll position changed more than drift speed, user is scrolling
    if (Math.abs(currentScrollTop - lastScrollTop) > SCROLL_SPEED * 2) {
      stopDrift();
    }
    lastScrollTop = currentScrollTop;
  }, { passive: true });

  // Start drifting after reception animation
  setTimeout(function() {
    // Only start if user hasn't scrolled yet
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop < 10) {
      startDrift();
    }
  }, START_DELAY);

  // Respect reduced motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    stopDrift();
  }

})();
