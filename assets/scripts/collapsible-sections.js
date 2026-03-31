/**
 * Collapsible Sections — attr_list { .collapse } on headings
 * ────────────────────────────────────────────────────────────
 * Headings marked with `.collapse` become clickable toggles.
 * Their section content (everything until the next heading of
 * equal or higher level) is wrapped in a plain <div> whose
 * visibility is toggled on click.
 *
 * No <details>/<summary> — avoids Material for MkDocs hijacking
 * the element with admonition styling.
 *
 *   ## Section Title { .collapse }
 *   Content here, no special indentation needed...
 *
 *   ## Starts Open { .collapse .open }
 *   This section is expanded on load.
 *
 * Exposes window.__ubRevealTarget(el) so other scripts (e.g.
 * TOC click handlers) can reveal hidden tab/collapse content.
 */
(function () {
  'use strict';

  /* ── Site root for chevron SVG ─────────────────────────── */
  var scriptEl = document.currentScript || document.querySelector('script[src*="collapsible-sections"]');
  var SITE_ROOT = (scriptEl && scriptEl.src)
    ? scriptEl.src.replace(/assets\/scripts\/[^/]+$/, '')
    : location.href.replace(/\/[^/]*$/, '/');

  /* ── Reveal a hidden target (tab + collapse) ───────────── */

  /**
   * Walk upward from `target`, activating any inactive Material
   * tabs and opening any collapsed sections along the way.
   * If the target itself is a collapsed heading, expand it.
   * Returns true if anything was actually revealed.
   */
  function revealTarget(target) {
    var revealed = false;
    var el = target;
    while (el) {
      if (el.classList && el.classList.contains('ub-collapse-body') && el.hidden) {
        el.hidden = false;
        var hdr = el.previousElementSibling;
        if (hdr && hdr.classList.contains('ub-collapsible')) {
          hdr.classList.remove('ub-collapsed');
        }
        revealed = true;
      }
      if (el.classList && el.classList.contains('tabbed-block')) {
        var content = el.parentElement;
        if (content) {
          var blocks = [].slice.call(content.children);
          var idx = blocks.indexOf(el);
          var set = content.closest('.tabbed-set');
          if (set && idx >= 0) {
            var radios = set.querySelectorAll(':scope > input[type="radio"]');
            if (radios[idx] && !radios[idx].checked) {
              radios[idx].checked = true;
              radios[idx].dispatchEvent(new Event('change'));
              revealed = true;
            }
          }
        }
      }
      el = el.parentElement;
    }
    if (target.classList.contains('ub-collapsed')) {
      target.classList.remove('ub-collapsed');
      var nextBody = target.nextElementSibling;
      if (nextBody && nextBody.classList.contains('ub-collapse-body')) {
        nextBody.hidden = false;
      }
      revealed = true;
    }
    if (window.__ubTocSpy) window.__ubTocSpy.refresh();
    return revealed;
  }

  window.__ubRevealTarget = revealTarget;

  /* ── Collapsible section setup ─────────────────────────── */

  function init() {
    var article = document.querySelector('.md-content__inner');
    if (!article) return;

    // Bottom-to-top so nested sections wrap before their parents
    var headings = [].slice.call(
      article.querySelectorAll('h1.collapse, h2.collapse, h3.collapse, h4.collapse, h5.collapse, h6.collapse')
    ).reverse();

    for (var i = 0; i < headings.length; i++) {
      var h = headings[i];
      if (h.classList.contains('ub-collapsible')) continue;

      var level     = parseInt(h.tagName[1], 10);
      var startOpen = h.classList.contains('open');

      h.classList.remove('collapse', 'open');
      h.classList.add('ub-collapsible');

      // Chevron (right of text, before share icon)
      if (!h.querySelector('.ub-collapse-chevron')) {
        var chev = document.createElement('span');
        chev.className = 'ub-collapse-chevron';
        chev.setAttribute('aria-hidden', 'true');

        var img = document.createElement('img');
        img.src = SITE_ROOT + 'assets/images/icons/vector-icon.svg';
        img.alt = '';
        chev.appendChild(img);

        // Insert before share icon if present, else append
        var shareIcon = h.querySelector('.ub-heading-share');
        if (shareIcon) {
          h.insertBefore(chev, shareIcon);
        } else {
          h.appendChild(chev);
        }
      }

      // Collect following siblings belonging to this section
      var body = document.createElement('div');
      body.className = 'ub-collapse-body';

      var sib = h.nextElementSibling;
      while (sib) {
        if (/^H[1-6]$/i.test(sib.tagName) && parseInt(sib.tagName[1], 10) <= level) break;
        if (sib.classList.contains('ub-collapse-body')) break;
        var next = sib.nextElementSibling;
        body.appendChild(sib);
        sib = next;
      }

      h.parentNode.insertBefore(body, h.nextSibling);

      if (!startOpen) {
        h.classList.add('ub-collapsed');
        body.hidden = true;
      }
    }

    openForHash(false);   // instant scroll on init / SPA navigation
  }

  /* ── Toggle on heading click ───────────────────────────── */
  document.addEventListener('click', function (e) {
    if (e.target.closest('.ub-heading-share')) return;
    var h = e.target.closest('.ub-collapsible');
    if (!h) return;
    var body = h.nextElementSibling;
    if (!body || !body.classList.contains('ub-collapse-body')) return;

    h.classList.toggle('ub-collapsed');
    body.hidden = !body.hidden;
    if (window.__ubTocSpy) window.__ubTocSpy.refresh();
  });

  /* ── Tab changes → re-sync TOC ─────────────────────────── */
  document.addEventListener('change', function (e) {
    if (e.target.closest('.tabbed-set')) {
      setTimeout(function () {
        if (window.__ubTocSpy) window.__ubTocSpy.refresh();
      }, 50);
    }
  });

  /* ── Hash navigation ───────────────────────────────────── */

  /**
   * Scroll an element into view, accounting for the sticky header.
   * Uses scrollIntoView + inline scroll-margin-top so the offset
   * exactly matches what the browser does for native hash navigation.
   * @param {Element} el        Element to scroll to.
   * @param {boolean} [smooth]  true → smooth animation; false → instant.
   */
  function scrollToTarget(el, smooth) {
    var header = document.querySelector('.md-header');
    // Visible bottom of the header — correctly accounts for sticky tabs,
    // auto-hide, custom banners, and any other sticky/fixed top elements.
    var offset = header ? Math.max(0, header.getBoundingClientRect().bottom) : 0;
    el.style.scrollMarginTop = (offset + 4) + 'px';
    el.scrollIntoView({ block: 'start', behavior: smooth ? 'smooth' : 'auto' });
  }

  /**
   * Reveal the hash target and scroll to it.
   * @param {boolean} [smooth]  true → smooth (interactive); false → instant (init / refresh).
   */
  function openForHash(smooth) {
    var id = location.hash.slice(1);
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;

    var revealed = revealTarget(target);
    var isTabHeading = target.classList.contains('tab-toc-heading');

    // For regular headings that didn't need revealing, the browser's
    // native scroll-to-anchor is sufficient — skip to avoid double-scroll
    // on page refresh.
    if (!revealed && !isTabHeading) return;

    // For tab headings, scroll to the visible tab labels bar.
    // For revealed headings, scroll to the heading itself.
    var scrollTarget = target;
    if (isTabHeading) {
      var set = target.closest('.tabbed-set');
      var labels = set ? set.querySelector('.tabbed-labels') : null;
      if (labels) scrollTarget = labels;
    }

    if (smooth) {
      // Interactive navigation — allow layout to settle after tab activation.
      setTimeout(function () { scrollToTarget(scrollTarget, true); }, 120);
    } else {
      // Init / refresh — instant scroll after one paint frame.
      requestAnimationFrame(function () { scrollToTarget(scrollTarget, false); });
    }
  }

  // Expose for other scripts.
  window.__ubOpenForHash = openForHash;
  window.__ubScrollToTarget = scrollToTarget;

  window.addEventListener('hashchange', function () { openForHash(true); });

  /* ── TOC click interceptor for tab headings ─────────────── */
  /* Prevent native scroll-to-anchor (which ignores sticky header
     for zero-height headings) and use openForHash with smooth scroll. */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a.md-nav__link');
    if (!link) return;
    var href = link.getAttribute('href');
    if (!href || href.charAt(0) !== '#') return;
    var target = document.getElementById(href.slice(1));
    if (!target || !target.classList.contains('tab-toc-heading')) return;
    e.preventDefault();
    history.pushState(null, '', href);
    openForHash(true);
  });

  if (typeof document$ !== 'undefined') {
    document$.subscribe(function () { init(); });
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
