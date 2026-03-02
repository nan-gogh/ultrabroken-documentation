/**
 * Background rune
 * ───────────────
 * Displays the Ultrabroken rune as a centred, pulsing SVG watermark behind
 * all page content.  Pure HTML/CSS — no <canvas>, no animation loop, no DPR
 * tracking, no resize handler.
 *
 * WHY THIS WORKS WITHOUT ADDRESS-BAR JUMPING
 * ──────────────────────────────────────────────
 * • The wrapper (.ub-rune-bg) gets a FIXED pixel height on page load:
 *   height = window.innerHeight (the initial viewport height in pixels).
 * • This locks the wrapper to a static size, immune to viewport height changes.
 * • When the mobile address bar appears, the viewport shrinks, but the wrapper
 *   keeps its fixed height. The img inside stays centred in the larger wrapper,
 *   which now extends beyond the physical viewport — but that is fine, it is
 *   behind all content (z-index: -1).
 * • A resize listener detects real orientation changes by checking if the
 *   VIEWPORT WIDTH changed. If it did → orientation change → update the
 *   wrapper height to the new window.innerHeight. If width stayed the same →
 *   address bar change → ignore it.
 * • Desktop Ctrl+zoom: the CSS-pixel viewport shrinks proportionally, and
 *   fixed elements stay at CSS-pixel coordinates — no update needed.
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

  /* ── Viewport-height lock with orientation detection ─────────────────── */
  var initialInnerWidth = window.innerWidth;
  var initialInnerHeight = window.innerHeight;

  function setWrapperHeight() {
    wrapper.style.height = window.innerHeight + 'px';
  }

  function attachResizeListener() {
    window.addEventListener('resize', function () {
      var newWidth = window.innerWidth;
      // Only update if the viewport WIDTH changed (orientation change),
      // not on height-only changes (address bar show/hide).
      if (newWidth !== initialInnerWidth) {
        initialInnerWidth = newWidth;
        setWrapperHeight();
      }
    });
  }

  /* ── Bootstrap ─────────────────────────────────────────────────── */
  function init() {
    setWrapperHeight();
    attachResizeListener();
    refresh404();
    attach404Observer();
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 0);
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
