/**
 * embed-touch-guard.js — Prevent page scroll/zoom when touching embeds
 * ─────────────────────────────────────────────────────────────────────
 * Cross-origin iframes (event viewer, object map) receive their own
 * independent touch events, but the browser's compositor may still
 * interpret touches on the iframe element as parent-page scroll/zoom
 * gestures.  CSS touch-action alone isn't reliable on all browsers
 * for cross-origin iframes.
 *
 * This script intercepts touch events that land inside embed wrappers
 * and prevents the default browser gesture (page scroll/zoom) while
 * leaving the iframe's own touch handling unaffected.
 *
 * Trade-off: the user must swipe outside the embed area to scroll
 * past it — same UX as Google Maps embeds and other interactive
 * iframe widgets.
 *
 * Uses event delegation — works for dynamically injected embeds.
 */
(function () {
  'use strict';

  var SELECTOR = '.ub-event-embed, .ub-map-embed';

  function isEmbed(e) {
    return e.target.closest && e.target.closest(SELECTOR);
  }

  // Non-passive touchmove — must be able to call preventDefault
  document.addEventListener('touchmove', function (e) {
    if (isEmbed(e)) e.preventDefault();
  }, { passive: false });

  // iOS Safari proprietary gesture events (pinch-zoom)
  document.addEventListener('gesturestart', function (e) {
    if (isEmbed(e)) e.preventDefault();
  });
  document.addEventListener('gesturechange', function (e) {
    if (isEmbed(e)) e.preventDefault();
  });
})();
