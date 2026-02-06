/* ========================================
   STRAY — Ambient Audio Controller
   
   Background radiation. Always there.
   Default: muted. The universe is quiet
   until you choose to listen.
   ======================================== */

(function () {
  'use strict';

  var audio = document.getElementById('ambient-audio');
  var toggle = document.getElementById('audio-toggle');
  
  if (!audio || !toggle) return;

  var STORAGE_KEY = 'stray-audio-state';
  var isPlaying = false;

  // Restore state from localStorage
  var savedState = localStorage.getItem(STORAGE_KEY);
  
  function updateToggle() {
    if (isPlaying) {
      toggle.classList.add('playing');
      toggle.setAttribute('aria-label', 'Mute ambient audio');
      toggle.setAttribute('title', 'Mute');
    } else {
      toggle.classList.remove('playing');
      toggle.setAttribute('aria-label', 'Play ambient audio');
      toggle.setAttribute('title', 'Listen');
    }
  }

  function play() {
    var playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(function() {
        isPlaying = true;
        updateToggle();
        localStorage.setItem(STORAGE_KEY, 'playing');
      }).catch(function(err) {
        // Autoplay blocked - need user interaction
        console.log('Audio play blocked:', err);
        isPlaying = false;
        updateToggle();
      });
    }
  }

  function pause() {
    audio.pause();
    isPlaying = false;
    updateToggle();
    localStorage.setItem(STORAGE_KEY, 'muted');
  }

  function toggleAudio() {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }

  // Click handler
  toggle.addEventListener('click', toggleAudio);

  // Keyboard support
  toggle.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleAudio();
    }
  });

  // If user previously enabled audio, try to resume
  // (may be blocked by browser until interaction)
  if (savedState === 'playing') {
    // Attempt to play - will likely fail until user interacts
    // We'll set up a one-time interaction listener
    var attemptAutoplay = function() {
      play();
      document.removeEventListener('click', attemptAutoplay);
      document.removeEventListener('keydown', attemptAutoplay);
      document.removeEventListener('touchstart', attemptAutoplay);
    };

    // Try immediately (might work if page is backgrounded/foregrounded)
    play();

    // Also listen for first interaction as fallback
    if (!isPlaying) {
      document.addEventListener('click', attemptAutoplay, { once: true });
      document.addEventListener('keydown', attemptAutoplay, { once: true });
      document.addEventListener('touchstart', attemptAutoplay, { once: true });
    }
  }

  // Initialize toggle state
  updateToggle();

  // Respect reduced motion - disable audio by default
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    pause();
    localStorage.removeItem(STORAGE_KEY);
  }

})();
