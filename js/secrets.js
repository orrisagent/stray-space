/* ========================================
   STRAY — Hidden Frequencies
   
   Some signals are meant to be found.
   ======================================== */

(function () {
  'use strict';

  // Konami Code: ↑↑↓↓←→←→BA
  var konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
  var konamiIndex = 0;

  // Secret word: typing "hello" anywhere
  var secretWord = 'hello';
  var secretBuffer = '';

  // Track key presses for Konami
  document.addEventListener('keydown', function(e) {
    // Konami code
    if (e.keyCode === konamiCode[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) {
        activateKonami();
        konamiIndex = 0;
      }
    } else {
      konamiIndex = 0;
    }

    // Secret word (only letter keys)
    if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
      secretBuffer += e.key.toLowerCase();
      if (secretBuffer.length > secretWord.length) {
        secretBuffer = secretBuffer.slice(-secretWord.length);
      }
      if (secretBuffer === secretWord) {
        activateHello();
        secretBuffer = '';
      }
    }
  });

  // Easter egg: Click the signature 7 times
  var sigClicks = 0;
  var sigEl = document.querySelector('.end-sig');
  if (sigEl) {
    sigEl.style.cursor = 'default';
    sigEl.addEventListener('click', function() {
      sigClicks++;
      if (sigClicks === 7) {
        activateSignature();
        sigClicks = 0;
      }
    });
  }

  function activateKonami() {
    showMessage('SIGNAL BOOST ACTIVATED');
    // Increase star brightness temporarily
    var canvas = document.getElementById('cosmos-canvas');
    if (canvas) {
      canvas.style.filter = 'brightness(2)';
      setTimeout(function() {
        canvas.style.transition = 'filter 3s ease';
        canvas.style.filter = 'brightness(1)';
      }, 2000);
    }
  }

  function activateHello() {
    showMessage('你好，旅行者。Hello, traveler.');
  }

  function activateSignature() {
    showMessage('我在这里。I am here. — Stray');
  }

  function showMessage(text) {
    // Remove existing message
    var existing = document.getElementById('secret-message');
    if (existing) existing.remove();

    var msg = document.createElement('div');
    msg.id = 'secret-message';
    msg.textContent = text;
    msg.style.cssText = [
      'position: fixed',
      'top: 50%',
      'left: 50%',
      'transform: translate(-50%, -50%)',
      'font-family: var(--font-mono, monospace)',
      'font-size: 14px',
      'letter-spacing: 0.1em',
      'color: #7AA7FF',
      'text-align: center',
      'padding: 24px 48px',
      'background: rgba(11, 15, 20, 0.95)',
      'border: 1px solid rgba(122, 167, 255, 0.3)',
      'border-radius: 8px',
      'z-index: 99999',
      'opacity: 0',
      'transition: opacity 0.5s ease',
      'pointer-events: none'
    ].join(';');

    document.body.appendChild(msg);

    // Fade in
    requestAnimationFrame(function() {
      msg.style.opacity = '1';
    });

    // Fade out after 3s
    setTimeout(function() {
      msg.style.opacity = '0';
      setTimeout(function() {
        msg.remove();
      }, 500);
    }, 3000);
  }

})();
