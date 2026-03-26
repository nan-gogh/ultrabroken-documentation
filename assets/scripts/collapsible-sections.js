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
 * TOC fix: headings inside hidden containers (collapsed body,
 * inactive tab) have their `id` moved to `data-ub-id` so
 * Material's scroll-spy excludes them from offset sorting.
 */
(function () {
  'use strict';

  /* ── Site root for chevron SVG ─────────────────────────── */
  var scriptEl = document.currentScript || document.querySelector('script[src*="collapsible-sections"]');
  var SITE_ROOT = (scriptEl && scriptEl.src)
    ? scriptEl.src.replace(/assets\/scripts\/[^/]+$/, '')
    : location.href.replace(/\/[^/]*$/, '/');

  /* ── Heading ID management for TOC scroll-spy ──────────── */

  /**
   * Move `id` → `data-ub-id` for headings inside hidden containers
   * so Material's scroll-spy excludes them from its offset index.
   * Restore `id` when the container becomes visible.
   */
  function syncHeadingIds() {
    var article = document.querySelector('.md-content__inner');
    if (!article) return;
    var headings = article.querySelectorAll(
      'h1[id], h2[id], h3[id], h4[id], h5[id], h6[id], ' +
      'h1[data-ub-id], h2[data-ub-id], h3[data-ub-id], ' +
      'h4[data-ub-id], h5[data-ub-id], h6[data-ub-id]'
    );
    for (var i = 0; i < headings.length; i++) {
      var h = headings[i];
      var hiddenBody = h.closest('.ub-collapse-body[hidden]');
      var tabBlock   = h.closest('.tabbed-block');
      var inactiveTab = tabBlock && tabBlock.offsetHeight === 0;
      var isHidden = !!hiddenBody || inactiveTab;

      if (isHidden && h.id) {
        h.setAttribute('data-ub-id', h.id);
        h.removeAttribute('id');
      } else if (!isHidden && !h.id && h.hasAttribute('data-ub-id')) {
        h.id = h.getAttribute('data-ub-id');
        h.removeAttribute('data-ub-id');
      }
    }
  }

  /** Hide/show sidebar TOC entries for hidden headings */
  function syncToc() {
    var tocNav = document.querySelector('.md-sidebar--secondary .md-nav');
    if (!tocNav) return;
    var links = tocNav.querySelectorAll('a.md-nav__link');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href');
      if (!href || href.charAt(0) !== '#') continue;
      var slug = href.slice(1);
      // If heading's ID was moved to data-ub-id, it's hidden
      var hidden = !document.getElementById(slug) &&
                   !!document.querySelector('[data-ub-id]');
      // More precise: check if this specific slug is in a data-ub-id
      var headings = document.querySelectorAll('[data-ub-id]');
      var isHidden = false;
      for (var j = 0; j < headings.length; j++) {
        if (headings[j].getAttribute('data-ub-id') === slug) {
          isHidden = true;
          break;
        }
      }
      var li = links[i].closest('li');
      if (li) li.style.display = isHidden ? 'none' : '';
    }
  }

  /**
   * Full TOC sync: update heading IDs, hide/show TOC entries,
   * then nudge body height so Material rebuilds its scroll-spy index.
   */
  function rebuildToc() {
    syncHeadingIds();
    syncToc();
    // Force Material's ResizeObserver to fire and rebuild the index
    var bump = document.createElement('div');
    bump.style.height = '1px';
    document.body.appendChild(bump);
    requestAnimationFrame(function () { bump.remove(); });
  }

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

    rebuildToc();
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
    rebuildToc();
  });

  /* ── Tab changes → re-sync TOC ─────────────────────────── */
  document.addEventListener('change', function (e) {
    if (e.target.closest('.tabbed-set')) {
      setTimeout(rebuildToc, 50);
    }
  });

  /* ── Hash navigation ───────────────────────────────────── */
  function openForHash() {
    var id = location.hash.slice(1);
    if (!id) return;

    // Find target — may have ID moved to data-ub-id if hidden
    var target = document.getElementById(id);
    if (!target) {
      var candidates = document.querySelectorAll('[data-ub-id]');
      for (var j = 0; j < candidates.length; j++) {
        if (candidates[j].getAttribute('data-ub-id') === id) {
          target = candidates[j];
          // Restore ID
          target.id = id;
          target.removeAttribute('data-ub-id');
          break;
        }
      }
    }
    if (!target) return;

    // Activate parent Material tab
    var tabbedBlock = target.closest('.tabbed-block');
    if (tabbedBlock) {
      var content = tabbedBlock.parentElement;
      if (content) {
        var blocks = [].slice.call(content.children);
        var idx    = blocks.indexOf(tabbedBlock);
        var set    = content.closest('.tabbed-set');
        if (set && idx >= 0) {
          var radios = set.querySelectorAll(':scope > input[type="radio"]');
          if (radios[idx]) {
            radios[idx].checked = true;
            radios[idx].dispatchEvent(new Event('change'));
          }
        }
      }
    }

    // Open collapsed ancestors
    var body = target.closest('.ub-collapse-body');
    while (body) {
      body.hidden = false;
      var hdr = body.previousElementSibling;
      if (hdr) hdr.classList.remove('ub-collapsed');
      body = body.parentElement ? body.parentElement.closest('.ub-collapse-body') : null;
    }

    // If the target itself is a collapsed heading, expand it
    if (target.classList.contains('ub-collapsed')) {
      target.classList.remove('ub-collapsed');
      var nextBody = target.nextElementSibling;
      if (nextBody && nextBody.classList.contains('ub-collapse-body')) {
        nextBody.hidden = false;
      }
    }

    rebuildToc();
    setTimeout(function () { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80);
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
