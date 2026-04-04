/**
 * Cosmetic URLs
 * Automatically appends the page's title as a URL parameter to the address bar
 * without breaking history or reloading the page.
 * E.g. /wiki/OO2/ becomes /wiki/OO2/?Kinematic-Weapons
 * Works for all UID-routed wiki pages (flat /wiki/{uid}/ structure).
 */
(function() {
  'use strict';

  function applyCosmeticUrl() {
    // Apply on all flat UID-routed wiki pages: /wiki/XYZ/
    // Matches exactly /…/wiki/<3-char-uid>/ — excludes the grimoire index and non-UID paths.
    var path = window.location.pathname;
    var uidSegment = path.match(/\/wiki\/([A-Z0-9]{3})\/?$/);
    if (!uidSegment) return;

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

    // Keep MkDocs built-in parameters like 'h' (search highlight) or 'q' (search query) if present
    var params = new URLSearchParams(window.location.search);
    var preserved = [];

    try {
      var entries = params.entries();
      for (var pair = entries.next(); !pair.done; pair = entries.next()) {
        var k = pair.value[0];
        var v = pair.value[1];
        if (k === 'h' || k === 'q') {
          preserved.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
        }
      }
    } catch(e) {}

    // Combine: "?Cosmetic-Title&h=searchterm"
    var finalSearch = '?' + niceUrlParam + (preserved.length > 0 ? '&' + preserved.join('&') : '');

    if (window.location.search !== finalSearch) {
      var newUrl = window.location.pathname + finalSearch + window.location.hash;
      window.history.replaceState(null, '', newUrl);
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
