/**
 * touch-scroll-fix.js — Suppress hover/active glow during swipe-scrolling
 * ────────────────────────────────────────────────────────────────────────
 * On touch devices, swiping through a scrollable list fires :hover and
 * :active on every element the finger passes over.  This causes the teal
 * glow to flash on sidebar nav links during normal scrolling.
 *
 * Solution: detect when a touch gesture becomes a scroll (finger moves
 * beyond a small threshold) and add .ub-touch-scrolling to <html>.
 * Companion CSS rules in glow.css suppress the glow while that class is
 * present.  The class is removed shortly after the finger lifts.
 */
(function () {
  'use strict';

  var CLASS = 'ub-touch-scrolling';
  var THRESHOLD = 10; // px of movement before we call it a scroll

  var startY = 0;
  var isScrolling = false;

  document.addEventListener('touchstart', function (e) {
    startY = e.touches[0].clientY;
    isScrolling = false;
  }, { passive: true });

  document.addEventListener('touchmove', function (e) {
    if (isScrolling) return;
    if (Math.abs(e.touches[0].clientY - startY) > THRESHOLD) {
      isScrolling = true;
      document.documentElement.classList.add(CLASS);
    }
  }, { passive: true });

  document.addEventListener('touchend', function () {
    if (isScrolling) {
      // Brief delay so the final touch position doesn't flash a hover
      setTimeout(function () {
        document.documentElement.classList.remove(CLASS);
      }, 80);
    }
    isScrolling = false;
  }, { passive: true });

  document.addEventListener('touchcancel', function () {
    document.documentElement.classList.remove(CLASS);
    isScrolling = false;
  }, { passive: true });
})();
