/* ========================================
   STRAY — Signal Relay
   
   Share the signal. Pass it on.
   ======================================== */

(function () {
  'use strict';

  // Find relay buttons
  var relayButtons = document.querySelectorAll('.relay-signal');
  
  relayButtons.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      
      var title = document.title;
      var url = window.location.href;
      var text = btn.dataset.text || 'A signal from deep space...';

      // Try native share first (mobile)
      if (navigator.share) {
        navigator.share({
          title: title,
          text: text,
          url: url
        }).catch(function() {
          // User cancelled or error - fallback
          copyToClipboard(url, btn);
        });
      } else {
        // Desktop: copy link
        copyToClipboard(url, btn);
      }
    });
  });

  function copyToClipboard(text, btn) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function() {
        showFeedback(btn, 'Signal copied');
      }).catch(function() {
        fallbackCopy(text, btn);
      });
    } else {
      fallbackCopy(text, btn);
    }
  }

  function fallbackCopy(text, btn) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showFeedback(btn, 'Signal copied');
    } catch (e) {
      showFeedback(btn, 'Copy failed');
    }
    document.body.removeChild(textarea);
  }

  function showFeedback(btn, message) {
    var original = btn.textContent;
    btn.textContent = message;
    btn.style.color = 'var(--accent-glow)';
    
    setTimeout(function() {
      btn.textContent = original;
      btn.style.color = '';
    }, 2000);
  }

})();
