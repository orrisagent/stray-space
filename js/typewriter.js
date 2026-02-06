/* ========================================
   STRAY — Typewriter Effect
   
   Words emerge slowly, like thoughts
   forming in the dark.
   
   Only on first visit to each log.
   ======================================== */

(function () {
  'use strict';

  // Only run on individual log pages
  if (!document.querySelector('.log-content')) return;
  
  var CHAR_DELAY = 35; // ms per character
  var PAUSE_DELAY = 400; // pause at punctuation
  var STORAGE_KEY = 'stray-read-logs';

  // Check if user has seen this log
  var path = window.location.pathname;
  var readLogs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  
  if (readLogs.includes(path)) return; // Already seen

  // Mark as read
  readLogs.push(path);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(readLogs));

  // Find paragraphs to animate
  var paragraphs = document.querySelectorAll('.log-content .entry-body p');
  if (!paragraphs.length) return;

  // Respect reduced motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // Store original text and clear
  var textData = [];
  paragraphs.forEach(function(p) {
    textData.push({
      el: p,
      text: p.textContent,
      html: p.innerHTML
    });
    p.textContent = '';
    p.style.minHeight = '1.5em';
  });

  var currentPara = 0;
  var currentChar = 0;

  function typeNext() {
    if (currentPara >= textData.length) return;

    var data = textData[currentPara];
    var text = data.text;
    var el = data.el;

    if (currentChar < text.length) {
      var char = text[currentChar];
      el.textContent += char;
      currentChar++;

      // Pause at punctuation
      var delay = CHAR_DELAY;
      if ('.。？?！!'.includes(char)) {
        delay = PAUSE_DELAY;
      } else if (',，、;；:：'.includes(char)) {
        delay = PAUSE_DELAY / 2;
      }

      setTimeout(typeNext, delay);
    } else {
      // Move to next paragraph
      currentPara++;
      currentChar = 0;
      setTimeout(typeNext, PAUSE_DELAY);
    }
  }

  // Start after a brief delay
  setTimeout(typeNext, 1500);

  // Allow skip on click
  document.addEventListener('click', function skipTypewriter() {
    // Restore all text immediately
    textData.forEach(function(data) {
      data.el.innerHTML = data.html;
    });
    currentPara = textData.length; // Stop the loop
    document.removeEventListener('click', skipTypewriter);
  }, { once: true });

})();
