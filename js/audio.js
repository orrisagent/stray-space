/**
 * Stray — Background Audio Controller
 * 
 * Minimal ambient audio player.
 * - Does NOT autoplay (respects browser policy)
 * - User can toggle on/off
 * - State persisted in localStorage
 * - Fades in/out smoothly
 */

(function() {
  'use strict';

  var AUDIO_SRC = '/audio/ambient.mp3';
  var FADE_DURATION = 3000; // 3 seconds
  var MAX_VOLUME = 0.3; // Keep it subtle

  var audio = null;
  var isPlaying = false;
  var fadeInterval = null;

  // Create audio toggle button
  function createToggle() {
    var btn = document.createElement('button');
    btn.className = 'audio-toggle';
    btn.setAttribute('aria-label', 'Toggle ambient sound');
    btn.innerHTML = '<span class="audio-icon"></span>';
    document.body.appendChild(btn);

    btn.addEventListener('click', function() {
      if (isPlaying) {
        fadeOut();
      } else {
        fadeIn();
      }
    });

    return btn;
  }

  // Initialize audio element
  function initAudio() {
    audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.volume = 0;
    audio.preload = 'none';

    // Handle errors gracefully
    audio.addEventListener('error', function() {
      console.log('[Stray] Audio not available');
      var btn = document.querySelector('.audio-toggle');
      if (btn) btn.style.display = 'none';
    });
  }

  // Fade in
  function fadeIn() {
    if (!audio) initAudio();

    audio.play().then(function() {
      isPlaying = true;
      updateToggleState(true);
      localStorage.setItem('stray-audio', 'on');

      clearInterval(fadeInterval);
      var currentVolume = audio.volume;
      var step = (MAX_VOLUME - currentVolume) / (FADE_DURATION / 50);

      fadeInterval = setInterval(function() {
        currentVolume += step;
        if (currentVolume >= MAX_VOLUME) {
          audio.volume = MAX_VOLUME;
          clearInterval(fadeInterval);
        } else {
          audio.volume = currentVolume;
        }
      }, 50);
    }).catch(function(e) {
      console.log('[Stray] Audio play failed:', e.message);
    });
  }

  // Fade out
  function fadeOut() {
    if (!audio) return;

    isPlaying = false;
    updateToggleState(false);
    localStorage.setItem('stray-audio', 'off');

    clearInterval(fadeInterval);
    var currentVolume = audio.volume;
    var step = currentVolume / (FADE_DURATION / 50);

    fadeInterval = setInterval(function() {
      currentVolume -= step;
      if (currentVolume <= 0) {
        audio.volume = 0;
        audio.pause();
        clearInterval(fadeInterval);
      } else {
        audio.volume = currentVolume;
      }
    }, 50);
  }

  // Update button visual state
  function updateToggleState(playing) {
    var btn = document.querySelector('.audio-toggle');
    if (btn) {
      btn.classList.toggle('playing', playing);
      btn.setAttribute('aria-pressed', playing);
    }
  }

  // Initialize
  function init() {
    // Only show if audio file exists (check via fetch)
    fetch(AUDIO_SRC, { method: 'HEAD' })
      .then(function(res) {
        if (res.ok) {
          createToggle();
          
          // Check saved preference (but don't autoplay)
          var saved = localStorage.getItem('stray-audio');
          if (saved === 'on') {
            // Show visual hint that audio was previously on
            updateToggleState(false);
          }
        }
      })
      .catch(function() {
        // Audio not available, no button shown
      });
  }

  // Start when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
