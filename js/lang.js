/**
 * Stray — Language Detection & Switching
 * Detects browser language, defaults to English
 * Supports: en, zh
 */

(function() {
  'use strict';
  
  // Get saved preference or detect from browser
  var lang = localStorage.getItem('stray-lang');
  if (!lang) {
    var browserLang = navigator.language || navigator.userLanguage || 'en';
    lang = browserLang.startsWith('zh') ? 'zh' : 'en';
  }
  
  function applyLanguage(l) {
    // Update all elements with data-en / data-zh attributes
    document.querySelectorAll('[data-' + l + ']').forEach(function(el) {
      var text = el.getAttribute('data-' + l);
      if (text) {
        if (el.tagName === 'INPUT' && el.hasAttribute('data-placeholder-' + l)) {
          el.placeholder = el.getAttribute('data-placeholder-' + l);
        } else {
          el.textContent = text;
        }
      }
    });
    
    // Update html lang attribute
    document.documentElement.lang = l === 'zh' ? 'zh-CN' : 'en';
  }
  
  function setLanguage(l) {
    if (l !== 'en' && l !== 'zh') l = 'en';
    lang = l;
    localStorage.setItem('stray-lang', l);
    applyLanguage(l);
  }
  
  function toggleLanguage() {
    setLanguage(lang === 'en' ? 'zh' : 'en');
  }
  
  // Apply on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      applyLanguage(lang);
    });
  } else {
    applyLanguage(lang);
  }
  
  // Expose globally
  window.strayLang = {
    current: function() { return lang; },
    set: setLanguage,
    toggle: toggleLanguage
  };
})();
