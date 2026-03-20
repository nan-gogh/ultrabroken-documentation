/**
 * touch-scroll-fix.js — Kill hover/active flicker during swipe-scrolling
 * ──────────────────────────────────────────────────────────────────────
 * On touch devices the browser fires :hover and :active on every element
 * the finger passes over while scrolling.  This makes nav-link glows
 * flash and "stick" unpredictably.
 *
 * Fix: set  pointer-events: none  on all nav links the moment a touch
 * gesture turns into a scroll (> small threshold of movement).  With
 * pointer-events disabled the browser literally cannot assign any
 * pseudo-state to those elements.  Re-enable after the finger lifts.
 *
 * pointer-events: none does NOT block scrolling — scroll is handled by
 * the scroll container, not the individual links.
 */
(function () {
  'use strict';

  var THRESHOLD = 8; // px before we call it a scroll
  var startY = 0;
  var scrolling = false;
  var style = null; // injected <style> element

  function inject() {
    if (style) return;
    style = document.createElement('style');
    style.textContent =
      '.md-nav__link,.md-tabs__link{pointer-events:none!important}';
    document.head.appendChild(style);
  }

  function remove() {
    if (!style) return;
    style.remove();
    style = null;
  }

  document.addEventListener('touchstart', function (e) {
    startY = e.touches[0].clientY;
    scrolling = false;
  }, { passive: true });

  document.addEventListener('touchmove', function (e) {
    if (scrolling) return;
    if (Math.abs(e.touches[0].clientY - startY) > THRESHOLD) {
      scrolling = true;
      inject();
    }
  }, { passive: true });

  document.addEventListener('touchend', function () {
    if (scrolling) {
      // Small delay so the lift position doesn't flash a hover
      setTimeout(remove, 100);
    }
    scrolling = false;
  }, { passive: true });

  document.addEventListener('touchcancel', function () {
    remove();
    scrolling = false;
  }, { passive: true });
})();
