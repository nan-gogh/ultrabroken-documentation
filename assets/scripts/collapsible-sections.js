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
   */
  function revealTarget(target) {
    var el = target;
    while (el) {
      if (el.classList && el.classList.contains('ub-collapse-body') && el.hidden) {
        el.hidden = false;
        var hdr = el.previousElementSibling;
        if (hdr && hdr.classList.contains('ub-collapsible')) {
          hdr.classList.remove('ub-collapsed');
        }
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
    }
    if (window.__ubTocSpy) window.__ubTocSpy.refresh();
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

    openForHash();
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
  function openForHash() {
    var id = location.hash.slice(1);
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;

    revealTarget(target);

    // For tab-toc-heading targets, scroll to the tab labels bar instead
    // of the sr-only hidden heading inside the tab content.
    var scrollTarget = target;
    if (target.classList.contains('tab-toc-heading')) {
      var set = target.closest('.tabbed-set');
      if (set) {
        var labels = set.querySelector('.tabbed-labels');
        if (labels) scrollTarget = labels;
      }
    }

    setTimeout(function () {
      scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  window.addEventListener('hashchange', openForHash);

  if (typeof document$ !== 'undefined') {
    document$.subscribe(function () { init(); });
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
