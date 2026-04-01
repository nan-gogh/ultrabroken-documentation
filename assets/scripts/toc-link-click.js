/**
 * toc-link-click.js — Smooth-scroll for all TOC link clicks
 * ──────────────────────────────────────────────────────────
 * Intercepts clicks on desktop and mobile TOC links, replacing
 * the native anchor jump with a smooth scroll that accounts for
 * the sticky header.  Also handles tab label horizontal centering
 * for tab-toc-heading targets.
 *
 * Registered on `window` in the capture phase — the earliest
 * possible interception point in the DOM event flow:
 *   window (capture) → document → html → … → target → … → bubble
 *
 * This fires before any Material handler, even capture-phase
 * ones on `document`.  We stop propagation so no other handler
 * (including the browser default) processes the click.
 *
 * Reads:
 *   window.__ubRevealTarget(el)        — open tabs/collapsed sections
 *   window.__ubScrollToTarget(el, sm)  — scroll with header offset
 */
(function () {
  'use strict';

  window.addEventListener('click', function (e) {
    var link = e.target.closest(
      '.md-sidebar--secondary .md-nav__link, .ub-toc-header .md-nav__link'
    );
    // TOC links have pointer-events:none (to kill sticky hover), so
    // clicks land on the parent <li> instead.  Find the <a> child.
    if (!link) {
      var item = e.target.closest('.ub-toc-header .md-nav__item');
      if (item) link = item.querySelector('.md-nav__link');
    }
    if (!link) return;

    // Material rewrites href="#foo" to full absolute URLs at runtime,
    // so use the .hash property which always returns just "#fragment".
    var hash = link.hash;
    if (!hash) return;

    // Only intercept same-page anchors (pathname must match current page)
    var linkUrl = new URL(link.href, location.href);
    if (linkUrl.pathname !== location.pathname) return;

    // Kill the event completely
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    var targetId = decodeURIComponent(hash.slice(1));
    var target = document.getElementById(targetId);

    // Activate the correct tab if the target is inside one.
    if (target && window.__ubRevealTarget) {
      window.__ubRevealTarget(target);
    }

    // On mobile, close the drawer first
    var drawer = document.getElementById('__drawer');
    var isMobile = drawer && drawer.checked;
    if (isMobile) drawer.checked = false;

    if (target) {
      var delay = isMobile ? 150 : 0;
      setTimeout(function () {
        if (target.classList.contains('tab-toc-heading')) {
          // After relocation, tab headings sit before their tabbed-set
          // and can be scrolled like regular headings.
          if (window.__ubScrollToTarget) {
            window.__ubScrollToTarget(target, true);
          }
          // Center the active label horizontally
          var radioId = target.dataset && target.dataset.ubTabRadio;
          if (radioId) {
            var radio = document.getElementById(radioId);
            var set = radio ? radio.closest('.tabbed-set') : null;
            var labels = set ? set.querySelector('.tabbed-labels') : null;
            if (labels && radio) {
              setTimeout(function () {
                var activeLabel = labels.querySelector(
                  'label[for="' + CSS.escape(radio.id) + '"]'
                );
                if (activeLabel) {
                  var lr = activeLabel.getBoundingClientRect();
                  var cr = labels.getBoundingClientRect();
                  var left = labels.scrollLeft + lr.left - cr.left
                           - (cr.width - lr.width) / 2;
                  labels.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
                }
              }, 80);
            }
          }
        } else {
          // Regular headings: scrollIntoView with header offset.
          if (window.__ubScrollToTarget) {
            window.__ubScrollToTarget(target, true);
          } else {
            var header = document.querySelector('.md-header');
            var offset = header ? Math.max(0, header.getBoundingClientRect().bottom) : 0;
            target.style.scrollMarginTop = (offset + 4) + 'px';
            target.scrollIntoView({ block: 'start', behavior: 'smooth' });
          }
        }
      }, delay);
    }

    // Update hash without creating a history entry
    history.replaceState(null, '', hash);
  }, true);  // <-- capture phase on window
})();
