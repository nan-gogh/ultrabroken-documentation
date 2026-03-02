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

  /* ── Address-bar + screen-center lock ──────────────────────────── */
  // Keep rune centred on the physical screen even as the address bar
  // appears/disappears. visualViewport.offsetTop/offsetLeft give the
  // displacement between layout viewport (where CSS layout happens) and
  // visual viewport (what the user sees). We counteract this offset with
  // a transform so the rune stays visually centred on the screen.
  function attachScreenCenterLock() {
    function lockToScreenCenter() {
      var vv = window.visualViewport;
      if (!vv) return;

      var offsetX = vv.offsetLeft || 0;
      var offsetY = vv.offsetTop || 0;

      if (Math.abs(offsetX) < 0.5 && Math.abs(offsetY) < 0.5) {
        // No meaningful offset—clear the correction.
        img.style.transform = 'translate(-50%, -50%)';
        return;
      }

      // Push the rune by the offset so it visually stays at screen centre.
      img.style.transform =
        'translate(calc(-50% - ' + offsetX + 'px), calc(-50% - ' + offsetY + 'px))';
    }

    var vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', lockToScreenCenter);
      vv.addEventListener('scroll', lockToScreenCenter);
    }
    window.addEventListener('resize', lockToScreenCenter);
  }

  /* ── Bootstrap ─────────────────────────────────────────────────── */
  function init() {
    refresh404();
    attach404Observer();
    attachScreenCenterLock();
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 0);
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
