/**
 * Background rune
 * ───────────────
 * Displays the Ultrabroken rune as a centred, pulsing SVG watermark behind
 * all page content.  Pure HTML/CSS — no <canvas>, no animation loop, no DPR
 * tracking, no resize handler.
 *
 * WHY THIS WORKS WITHOUT A CANVAS
 * ─────────────────────────────────
 * • position:fixed + inset:0 fills the current viewport automatically,
 *   including during mobile address-bar transitions.
 * • CSS viewport units (vmin/vw/vh) handle sizing; on desktop Ctrl+zoom
 *   the CSS-pixel viewport shrinks but each pixel scales up proportionally,
 *   so the rune keeps the exact same physical screen size — zero JS needed.
 * • The opacity pulse is a CSS @keyframes animation — the compositor runs
 *   it off the main thread.
 * • Only mobile pinch-zoom (which magnifies fixed elements) requires JS:
 *   a lightweight visualViewport counter-transform, applied synchronously
 *   inside the compositor's own event so there is no inter-frame lag.
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

  /* ── Pinch-zoom compensation ───────────────────────────────────── */
  // Desktop Ctrl+zoom needs no JS: CSS viewport units + position:fixed
  // adapt automatically (physical rune size stays constant).
  //
  // Mobile pinch-zoom magnifies fixed elements because the layout viewport
  // is unchanged — only the visual viewport shrinks.  We counter-transform
  // the wrapper so the rune appears unaffected.
  //
  // The visualViewport events fire synchronously during the compositor's
  // paint cycle, so the correction is applied in the same frame as the
  // zoom gesture — no inter-frame jitter.
  function attachZoomCompensation() {
    var vv = window.visualViewport;
    if (!vv) return;  // graceful degradation for very old browsers

    function compensate() {
      var s = vv.scale;
      if (s < 1.005) {
        // No meaningful zoom — clear any residual transform.
        wrapper.style.transform = '';
        return;
      }
      // Translate to visual-viewport origin, then shrink by 1/scale.
      // With transform-origin:0 0 (set in CSS), this maps the wrapper
      // exactly onto the visible portion of the screen at 1× size.
      wrapper.style.transform =
        'translate(' + vv.offsetLeft + 'px,' + vv.offsetTop + 'px) ' +
        'scale(' + (1 / s) + ')';
    }

    vv.addEventListener('resize', compensate);
    vv.addEventListener('scroll', compensate);
  }

  /* ── Bootstrap ─────────────────────────────────────────────────── */
  function init() {
    refresh404();
    attach404Observer();
    attachZoomCompensation();
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 0);
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
