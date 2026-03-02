/**
 * Background rune
 * ───────────────
 * Displays the Ultrabroken rune as a centred, pulsing SVG watermark behind
 * all page content.  Pure HTML/CSS — no <canvas>, no animation loop, no DPR
 * tracking, no resize handler.
 *
 * WHY THIS WORKS WITHOUT ADDRESS-BAR JUMPING
 * ――――――――――――――――――――――――――――――――――――――――――――
 * screen.width / screen.height are the physical screen dimensions in CSS
 * pixels.  They are FIXED — never affected by address bars, viewport resize,
 * pinch zoom, or Ctrl+zoom.  By sizing the wrapper to exactly screen.width ×
 * screen.height and centering it with CSS transform, the rune is always
 * locked to the physical screen centre.  No body/html hacks needed, so
 * MkDocs scrolling, TOC, anchors and back-to-top all work normally.
 * Orientation change (portrait ↔ landscape) swaps screen.w/h, so a single
 * orientationchange listener re-applies the dimensions.
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

  /* ── Screen-dimension lock ───────────────────────────────────────────── */
  // screen.width/height are immune to address-bar, viewport, and zoom changes.
  function lockToScreen() {
    var sw = window.screen.width;
    var sh = window.screen.height;
    wrapper.style.width  = sw + 'px';
    wrapper.style.height = sh + 'px';
    wrapper.style.top    = '0';
    wrapper.style.left   = '0';
    wrapper.style.transform = 'none';
  }

  function attachOrientationListener() {
    // On orientation change screen.w/h swap — re-apply dimensions.
    window.addEventListener('orientationchange', function () {
      // Briefly defer: some browsers report the old dimensions synchronously.
      setTimeout(lockToScreen, 100);
    });
  }

  /* ── Bootstrap ─────────────────────────────────────────────────── */
  function init() {
    lockToScreen();
    attachOrientationListener();
    refresh404();
    attach404Observer();
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 0);
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
