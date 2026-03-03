/**
 * Cosmetic URLs
 * Automatically appends the page's title as a URL parameter to the address bar
 * without breaking history or reloading the page. E.g. /wiki/glitchcraft/OO2/ becomes /wiki/glitchcraft/OO2/?Kinematic-Weapons
 */
(function() {
  'use strict';

  function applyCosmeticUrl() {
    // Only apply on glitchcraft detail pages
    var path = window.location.pathname;
    if (path.indexOf('/wiki/glitchcraft/') !== -1 && 
        !path.endsWith('/glitchcraft/') && 
        !path.endsWith('/_glitchcraft-grimoire/')) {

      var h1 = document.querySelector('.md-content h1');
      if (!h1) return;

      // Extract only direct text nodes, ignoring <code> tags (which contain the label and UID)
      var titleText = Array.from(h1.childNodes)
        .filter(function(n) { return n.nodeType === Node.TEXT_NODE; })
        .map(function(n) { return n.textContent; })
        .join('')
        .replace(/¶/g, '')
        .trim();

      if (!titleText) return;

      var niceUrlParam = encodeURIComponent(titleText.replace(/\s+/g, '-'));

      // Use URL fragment (hash) for cosmetic title; preserves search parameters if present
      var finalHash = '#' + niceUrlParam;

      if (window.location.hash !== finalHash) {
        var newUrl = window.location.pathname + window.location.search + finalHash;
        window.history.replaceState(null, '', newUrl);
      }
    }
  }

  // Hook into MkDocs Material instant navigation (document$)
  if (typeof document$ !== 'undefined') {
    document$.subscribe(applyCosmeticUrl);
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyCosmeticUrl);
    } else {
      applyCosmeticUrl();
    }
  }
})();
