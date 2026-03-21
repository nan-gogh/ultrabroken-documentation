/**
 * embed-touch-guard.js — Prevent page scroll/zoom when touching embeds
 * ─────────────────────────────────────────────────────────────────────
 * Cross-origin iframes swallow touch events entirely — the parent page
 * never sees them, so neither CSS touch-action on the wrapper nor JS
 * preventDefault on the document can reliably stop the browser from
 * interpreting touches on the iframe as page-level scroll/zoom.
 *
 * Solution: an invisible overlay div sits on top of each embed iframe.
 * Touches land on the overlay (our DOM), where we block default scroll
 * and zoom gestures.  A quick tap (< 300ms, < 10px movement) removes
 * the overlay so the user can interact with the iframe directly.
 * The overlay reappears when the user touches outside or scrolls.
 *
 * Trade-off: first touch on the embed "activates" it (like Google Maps
 * embeds).  Subsequent touches go straight to the iframe.
 */
(function () {
  'use strict';

  var SELECTOR = '.ub-event-embed, .ub-map-embed';
  var TAP_TIMEOUT = 300;
  var TAP_DISTANCE = 10;

  /* ── Create overlay for one embed wrapper ──────────────────── */
  function addOverlay(wrapper) {
    if (wrapper.querySelector('.ub-embed-overlay')) return;

    var overlay = document.createElement('div');
    overlay.className = 'ub-embed-overlay';
    overlay.style.cssText =
      'position:absolute;top:0;left:0;width:100%;height:100%;' +
      'z-index:2;cursor:pointer;touch-action:none;';

    var startTime, startX, startY;

    overlay.addEventListener('touchstart', function (e) {
      startTime = Date.now();
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    overlay.addEventListener('touchmove', function (e) {
      // Block page scroll/zoom while on the overlay
      e.preventDefault();
    }, { passive: false });

    overlay.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (Date.now() - startTime < TAP_TIMEOUT && dist < TAP_DISTANCE) {
        // Quick tap — remove overlay to let user interact with iframe
        overlay.style.display = 'none';
      }
    }, { passive: true });

    // iOS Safari gesture events
    overlay.addEventListener('gesturestart', function (e) { e.preventDefault(); });
    overlay.addEventListener('gesturechange', function (e) { e.preventDefault(); });

    wrapper.appendChild(overlay);
  }

  /* ── Re-show overlays when user touches outside an embed ───── */
  document.addEventListener('touchstart', function (e) {
    if (e.target.closest && e.target.closest(SELECTOR)) return;
    // Restore all hidden overlays
    document.querySelectorAll('.ub-embed-overlay').forEach(function (o) {
      o.style.display = '';
    });
  }, { passive: true });

  /* ── Scan and attach overlays (works with dynamic embeds) ──── */
  function scan() {
    document.querySelectorAll(SELECTOR).forEach(addOverlay);
  }

  // Run on load and on SPA navigation
  if (typeof document$ !== 'undefined') {
    document$.subscribe(scan);
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scan);
  } else {
    scan();
  }

  // Also observe DOM for dynamically injected embeds (details blocks etc.)
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
