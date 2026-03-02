/**
 * Background rune
 * ───────────────
 * Displays the Ultrabroken rune as a centred, pulsing SVG watermark behind
 * all page content.  Pure HTML/CSS — no <canvas>, no animation loop, no DPR
 * tracking, no resize handler.
 *
 * WHY THIS WORKS WITHOUT ZOOM BUGS
 * ─────────────────────────────────
 * • The rune img uses position:fixed + top:50% + left:50%, so it is always
 *   centred in the CSS-pixel viewport.
 * • CSS `transition: top 999999s` on the img freezes any viewport-height-
 *   driven recomputation: when the mobile address bar shows/hides the browser
 *   resizes the viewport and re-evaluates top/left percentages, which would
 *   normally make the element jump.  The near-infinite transition duration
 *   makes that movement invisible (it would take ~11 days to complete).
 * • On genuine orientation changes, a JS orientationchange listener removes
 *   the transition for two frames so the rune snaps to the correct position
 *   immediately, then the freeze is re-applied.
 * • Desktop Ctrl+zoom shrinks the CSS-pixel viewport proportionally; fixed
 *   elements stay at the same screen position — no JS needed.
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

  /* ── Orientation-change handler ───────────────────────────────── */
  // The CSS uses `transition: top 999999s` to freeze the rune against the
  // micro-resize that address-bar show/hide causes.  That transition must
  // be removed for actual orientation changes (portrait ↔ landscape) so
  // the rune snaps into the correct position immediately.
  function attachOrientationReset() {
    window.addEventListener('orientationchange', function () {
      // Remove the freeze transition so the element snaps on orientation change.
      img.style.transition = 'none';
      // Re-enable after the browser has had one frame to repaint.
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          img.style.transition = '';
        });
      });
    });
  }

  /* ── Bootstrap ─────────────────────────────────────────────────── */
  function init() {
    refresh404();
    attach404Observer();
    attachOrientationReset();
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 0);
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
