/**
 * embed-touch-guard.js — Prevent page scroll/zoom when touching embeds
 * ─────────────────────────────────────────────────────────────────────
 * Cross-origin iframes swallow touch events — the parent page can't
 * intercept them.  This causes two problems on mobile:
 *   1. Scrolling past the embed accidentally pans/zooms the iframe
 *   2. Pinch gestures on the embed zoom the whole page
 *
 * Solution: a transparent overlay sits on top of each embed iframe.
 * Touches land on the overlay (our DOM), so we can block page-level
 * scroll/zoom gestures.  Tapping the overlay dismisses it so the user
 * can interact with the iframe directly.  The overlay reappears when
 * the user touches outside the embed.
 *
 * Desktop: overlay uses pointer-events:none so mouse clicks pass
 * straight through — no tap-to-activate needed.
 *
 * Note: once the overlay is dismissed and the user interacts directly
 * with the iframe, page scroll/zoom may resume — this is an inherent
 * limitation of cross-origin iframes using D3 v3.
 */
(function () {
  'use strict';

  var SELECTOR = '.ub-event-embed, .ub-map-embed';
  var TAP_TIMEOUT = 400;
  var TAP_DISTANCE = 12;
  var HINT_TEXT = 'Tap to interact';

  /* ── Create overlay for one embed wrapper ──────────────────── */
  function addOverlay(wrapper) {
    if (wrapper.querySelector('.ub-embed-overlay')) return;

    // Ensure wrapper is a positioning context
    if (getComputedStyle(wrapper).position === 'static') {
      wrapper.style.position = 'relative';
    }

    var overlay = document.createElement('div');
    overlay.className = 'ub-embed-overlay';

    var hint = document.createElement('span');
    hint.className = 'ub-embed-hint';
    hint.textContent = HINT_TEXT;
    overlay.appendChild(hint);

    var startTime, startX, startY;

    overlay.addEventListener('touchstart', function (e) {
      startTime = Date.now();
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    overlay.addEventListener('touchend', function (e) {
      var t = e.changedTouches[0];
      var dx = t.clientX - startX;
      var dy = t.clientY - startY;
      if (Date.now() - startTime < TAP_TIMEOUT &&
          Math.sqrt(dx * dx + dy * dy) < TAP_DISTANCE) {
        dismiss(overlay);
      }
    }, { passive: true });

    wrapper.appendChild(overlay);
  }

  function dismiss(overlay) {
    overlay.classList.add('ub-embed-overlay--active');
  }

  function restoreAll() {
    document.querySelectorAll('.ub-embed-overlay--active').forEach(function (o) {
      o.classList.remove('ub-embed-overlay--active');
    });
  }

  /* ── Restore overlays when user touches outside any embed ──── */
  document.addEventListener('touchstart', function (e) {
    if (e.target.closest && e.target.closest(SELECTOR)) return;
    restoreAll();
  }, { passive: true });

  /* ── Restore overlays on scroll (user scrolled away) ───────── */
  var scrollTimer;
  window.addEventListener('scroll', function () {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(restoreAll, 800);
  }, { passive: true });

  /* ── Scan and attach overlays ──────────────────────────────── */
  function scan() {
    document.querySelectorAll(SELECTOR).forEach(addOverlay);
  }

  if (typeof document$ !== 'undefined') {
    document$.subscribe(scan);
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scan);
  } else {
    scan();
  }

  // Observe DOM for dynamically injected embeds (details blocks)
  new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      for (var j = 0; j < mutations[i].addedNodes.length; j++) {
        var node = mutations[i].addedNodes[j];
        if (node.nodeType === 1) {
          if (node.matches && node.matches(SELECTOR)) addOverlay(node);
          else if (node.querySelectorAll) {
            node.querySelectorAll(SELECTOR).forEach(addOverlay);
          }
        }
      }
    }
  }).observe(document.body, { childList: true, subtree: true });
})();
