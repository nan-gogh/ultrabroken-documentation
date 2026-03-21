/**
 * embed-touch-guard.js — Prevent page scroll/zoom when touching embeds
 * ─────────────────────────────────────────────────────────────────────
 * Cross-origin iframes get their own touch event stream, but the
 * browser may still initiate page-level scroll/zoom gestures.
 *
 * CSS touch-action:none on the wrapper and iframe handles this at the
 * compositor level.  This script reinforces it by intercepting any
 * touchmove events that DO reach our document from the wrapper area
 * (e.g. touches on the caption or padding around the iframe).
 */
(function () {
  'use strict';

  var SELECTOR = '.ub-event-embed, .ub-map-embed';

  document.addEventListener('touchmove', function (e) {
    if (e.target.closest && e.target.closest(SELECTOR)) {
      e.preventDefault();
    }
  }, { passive: false });
})();
