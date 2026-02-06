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
  // Default: play (unless user explicitly muted)
  var savedState = localStorage.getItem(STORAGE_KEY);
  var shouldPlay = savedState !== 'muted';
  
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

  // Default behavior: try to play unless user explicitly muted
  if (shouldPlay) {
    // Attempt autoplay immediately
    var playAttempt = audio.play();
    
    if (playAttempt !== undefined) {
      playAttempt.then(function() {
        // Autoplay worked
        isPlaying = true;
        updateToggle();
      }).catch(function() {
        // Autoplay blocked - wait for first interaction
        var attemptAutoplay = function() {
          if (shouldPlay && !isPlaying) {
            play();
          }
          document.removeEventListener('click', attemptAutoplay);
          document.removeEventListener('keydown', attemptAutoplay);
          document.removeEventListener('touchstart', attemptAutoplay);
        };

        document.addEventListener('click', attemptAutoplay);
        document.addEventListener('keydown', attemptAutoplay);
        document.addEventListener('touchstart', attemptAutoplay);
      });
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
