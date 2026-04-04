/**
 * Cosmetic URLs
 * Automatically appends the page's source filename as a URL parameter to the
 * address bar without breaking history or reloading the page.
 * E.g. /wiki/OO2/ becomes /wiki/OO2/?kinematic-weapons
 * Works for all UID-routed wiki pages (flat /wiki/{uid}/ structure).
 * The slug is injected at build time via <meta name="page-slug"> in main.html.
 */
(function() {
  'use strict';

  function applyCosmeticUrl() {
    // Apply on all flat UID-routed wiki pages: /wiki/XYZ/
    // Matches exactly /…/wiki/<3-char-uid>/ — excludes the grimoire index and non-UID paths.
    var path = window.location.pathname;
    var uidSegment = path.match(/\/wiki\/([A-Z0-9]{3})\/?$/);
    if (!uidSegment) return;

    var slugEl = document.querySelector('.ub-page-actions[data-slug]');
    var slug = slugEl ? slugEl.getAttribute('data-slug') : '';
    if (!slug || slug === 'index' || slug === 'wiki') return;

    var niceUrlParam = encodeURIComponent(slug);

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
