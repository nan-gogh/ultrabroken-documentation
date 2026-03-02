/**
 * Background rune
 * ───────────────
 * Displays the Ultrabroken rune as a centred, pulsing SVG watermark behind
 * all page content.  Pure HTML/CSS — no <canvas>, no animation loop, no DPR
 * tracking, no resize handler.
 *
 * WHY THIS WORKS WITHOUT ADDRESS-BAR JUMPING
 * ――――――――――――――――――――――――――――――――――――――――――――
 * The key technique (from proven StackOverflow mobile solutions):
 * • CSS sets body { position: fixed; width: 100vw; height: 100vh; }
 *   This unanchors the body from viewport changes.
 * • When the address bar shows/hides and the viewport height changes,
 *   the body stays at its original size.
 * • The rune wrapper (.ub-rune-bg) is position: fixed; inset: 0, filling
 *   the body (now a stable frame, not the shifting viewport).
 * • The img is position: absolute at top/left: 50% inside the wrapper,
 *   staying perfectly centred. No viewport resizing → no recomputation.
 * • Result: Mobile address bar show/hide does NOT jump the rune.
 *   Desktop Ctrl+zoom does NOT jump the rune.
 *   No JS running on every resize → no lag.
 * • The opacity pulse is a CSS @keyframes animation — the compositor runs
 *   it off the main thread.
 *
 * Three background modes (driven by motion-toggle.js via data-ub-bg):
 *   'animate' → rune pulse animates via CSS @keyframes
 *   'frozen'  → rune visible at static mid-opacity (CSS pauses animation)
 *   'hidden'  → rune container hidden entirely (CSS display:none)
 *
 * 404 detection: flips the rune upside-down on 404 pages via a body class.
 */
(function () {
  'use strict';

  /* ── Site-root detection (for asset URL) ───────────────────────── */
  var scriptEl = document.currentScript;
  var siteRoot = (scriptEl && scriptEl.src)
    ? scriptEl.src.replace(/assets\/scripts\/[^/]+$/, '')
    : location.href.replace(/\/[^/]*$/, '/');

  /* ── Create DOM ────────────────────────────────────────────────── */
  var wrapper = document.createElement('div');
  wrapper.className = 'ub-rune-bg';

  var img = document.createElement('img');
  img.className = 'ub-rune-img';
  img.alt = '';
  img.draggable = false;
  img.src = siteRoot + 'assets/images/ultrabroken_rune.svg';

  wrapper.appendChild(img);

  // Append immediately (MkDocs loads extra_javascript at end of <body>).
  if (document.body) {
    document.body.appendChild(wrapper);
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      document.body.appendChild(wrapper);
    });
  }

  /* ── 404 detection ─────────────────────────────────────────────── */
  function detect404() {
    var title = (document.title || '').trim();
    if (/\b404\b|page not found|could not find/i.test(title)) return true;
    var main = document.querySelector('.md-content');
    if (!main) return false;
    var heading = main.querySelector('h1, h2, h3');
    if (heading && /\b404\b|page not found/i.test(heading.textContent)) return true;
    var text = (main.textContent || '').slice(0, 400).toLowerCase();
    return text.indexOf('page not found') !== -1;
  }

  function refresh404() {
    if (document.body) {
      document.body.classList.toggle('ultrabroken-404', detect404());
    }
  }

  /* ── 404 observer ──────────────────────────────────────────────── */
  function attach404Observer() {
    if (!document.body) return;

    new MutationObserver(function () { refresh404(); })
      .observe(document.body, { childList: true, subtree: true });

    window.addEventListener('popstate', refresh404);

    var _push = history.pushState;
    history.pushState = function () {
      _push.apply(this, arguments);
      setTimeout(refresh404, 50);
    };
  }

  /* Viewport-height lock not needed with body { position: fixed } */
  var initialInnerWidth = window.innerWidth;

  function attachOrientationListener() {
    // Orientation changes trigger a meaningful recalculation of layout
    // (e.g., portrait to landscape), but with body { position: fixed }
    // the rune stays stable even during address-bar changes.
    window.addEventListener('orientationchange', function () {
      // Force a repaint in case MkDocs layout needs adjustment
      document.body.style.display = 'none';
      setTimeout(function () {
        document.body.style.display = '';
      }, 0);
    });
  }

  /* ── Bootstrap ─────────────────────────────────────────────────── */
  function init() {
    refresh404();
    attach404Observer();
    attachOrientationListener();
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 0);
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
