/**
 * Background rune
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * Displays the Ultrabroken rune as a centred, pulsing SVG watermark behind
 * all page content.  Pure HTML/CSS â€” no <canvas>, no animation loop, no DPR
 * tracking, no resize handler.
 *
 * HOW IT AVOIDS VERTICAL JUMPING
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * â€¢ The image is positioned at a fixed pixel distance from the physical screen
 *   top (screen.height / 2 minus half the image height).
 * â€¢ Physical screen dimensions (screen.width/height) are immutable â€” they never
 *   change when address bars appear/disappear or viewports shift.
 * â€¢ Thus the rune stays vertically locked regardless of viewport changes.
 * â€¢ On orientation change (portrait â†” landscape), screen.w/h swap, so we
 *   re-measure and reposition via orientationchange listener.
 * â€¢ The opacity pulse is a CSS @keyframes animation â€” the compositor runs
 *   it off the main thread.
 *
 * Three background modes (driven by motion-toggle.js via data-ub-bg):
 *   'animate' â†’ rune pulse animates via CSS @keyframes
 *   'frozen'  â†’ rune visible at static mid-opacity (CSS pauses animation)
 *   'hidden'  â†’ rune container hidden entirely (CSS display:none)
 *
 * 404 detection: flips the rune upside-down on 404 pages via a body class.
 */
(function () {
  'use strict';

  /* â”€â”€ Site-root detection (for asset URL) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  var scriptEl = document.currentScript;
  var siteRoot = (scriptEl && scriptEl.src)
    ? scriptEl.src.replace(/assets\/scripts\/[^/]+$/, '')
    : location.href.replace(/\/[^/]*$/, '/');

  /* â”€â”€ Create DOM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  var wrapper = document.createElement('div');
  wrapper.className = 'ub-rune-bg';

  var img = document.createElement('img');
  img.className = 'ub-rune-img';
  img.alt = '';
  img.draggable = false;
  img.src = siteRoot + 'assets/images/graphics/ultrabroken_rune.svg';
  img.style.visibility = 'hidden'; // Hide until positioned


  wrapper.appendChild(img);

  // Append immediately (MkDocs loads extra_javascript at end of <body>).
  if (document.body) {
    document.body.appendChild(wrapper);
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      document.body.appendChild(wrapper);
    });
  }

  /* â”€â”€ 404 detection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

  /* â”€â”€ 404 observer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function attach404Observer() {
    // MkDocs Material provides an observable (document$) that emits on layout swap
    if (typeof document$ !== 'undefined') {
      document$.subscribe(function() {
        // Defer to ensure new .md-content is in place before detecting
        setTimeout(function() {
          refresh404();
          lockImageVerticalPosition();
        }, 0);
      });
    } else {
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
  }

  /* â”€â”€ Fixed distance lock (all devices) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  // Position the rune at a fixed pixel distance from the top of the physical
  // screen (screen.height / 2). Since physical screen dimensions never change
  // when address bars appear/disappear or viewports shift, the rune stays
  // vertically locked. Measure the rendered image height and subtract half of
  // it to centre at that pixel point.
  function lockImageVerticalPosition() {
    // Allow layout to settle so we can measure the image
    setTimeout(function () {
      var rect = img.getBoundingClientRect();
      var imgHeight = rect.height || img.offsetHeight;
      if (imgHeight === 0) return; // Not yet rendered, skip

      var screenCenterY = window.screen.height / 2;
      var topPosition = screenCenterY - (imgHeight / 2);

      img.style.position = 'fixed';
      img.style.top = topPosition + 'px';
      img.style.left = '50%';
      // Apply both translateX and scaleY if on 404 page
      var is404 = detect404();
      img.style.transform = is404 ? 'translateX(-50%) scaleY(-1)' : 'translateX(-50%)';
      img.style.zIndex = '-1';
      img.style.pointerEvents = 'none';
      img.style.visibility = 'visible'; // Now reveal after positioning
    }, 0);
  }

  function attachOrientationListener() {
    window.addEventListener('orientationchange', function () {
      // Re-apply lock after orientation change (screen.w/h swap)
      setTimeout(lockImageVerticalPosition, 100);
    });
  }

  /* â”€â”€ Bootstrap â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function init() {
    lockImageVerticalPosition();
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
