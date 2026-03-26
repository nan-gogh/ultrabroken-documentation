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
 */
(function () {
  'use strict';

  /* ── TOC sync helpers ──────────────────────────────────── */

  /** Hide/show sidebar TOC entries whose target headings are inside hidden containers */
  function syncToc() {
    var tocNav = document.querySelector('.md-sidebar--secondary .md-nav');
    if (!tocNav) return;
    var links = tocNav.querySelectorAll('a.md-nav__link');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href');
      if (!href || href.charAt(0) !== '#') continue;
      var id = href.slice(1);
      var target = document.getElementById(id);
      if (!target) continue;
      var li = links[i].closest('li');
      if (!li) continue;
      // Hidden if inside a collapsed body or an inactive tab block
      var hiddenBody = target.closest('.ub-collapse-body[hidden]');
      var inactiveTab = target.closest('.tabbed-block');
      var tabHidden = inactiveTab && inactiveTab.offsetHeight === 0;
      if (hiddenBody || tabHidden) {
        li.style.display = 'none';
      } else {
        li.style.display = '';
      }
    }
  }

  function init() {
    var article = document.querySelector('.md-content__inner');
    if (!article) return;

    // Bottom-to-top so nested sections wrap before their parents
    var headings = [].slice.call(
      article.querySelectorAll('h1.collapse, h2.collapse, h3.collapse, h4.collapse, h5.collapse, h6.collapse')
    ).reverse();

    for (var i = 0; i < headings.length; i++) {
      var h = headings[i];
      if (h.classList.contains('ub-collapsible')) continue;   // already processed

      var level = parseInt(h.tagName[1], 10);
      var startOpen = h.classList.contains('open');

      h.classList.remove('collapse', 'open');
      h.classList.add('ub-collapsible');

      if (!h.querySelector('.ub-collapse-chevron')) {
        var chev = document.createElement('span');
        chev.className = 'ub-collapse-chevron';
        chev.setAttribute('aria-hidden', 'true');
        chev.textContent = '\u25BC';   // ▼ (expanded)
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
        if (sib.classList.contains('ub-collapse-body')) {
          // Already-wrapped nested section — peek at its preceding heading
          break;
        }
        var next = sib.nextElementSibling;
        body.appendChild(sib);
        sib = next;
      }

      h.parentNode.insertBefore(body, h.nextSibling);

      if (!startOpen) {
        h.classList.add('ub-collapsed');
        body.hidden = true;
        var chev = h.querySelector('.ub-collapse-chevron');
        if (chev) chev.textContent = '\u25B6';   // ▶ (collapsed)
      }
    }

    syncToc();
    openForHash();
  }

  /* Toggle on heading click */
  document.addEventListener('click', function (e) {
    if (e.target.closest('.ub-heading-share')) return;   // permalink icon has its own handler
    var h = e.target.closest('.ub-collapsible');
    if (!h) return;
    var body = h.nextElementSibling;
    if (!body || !body.classList.contains('ub-collapse-body')) return;

    h.classList.toggle('ub-collapsed');
    body.hidden = !body.hidden;

    // Swap chevron glyph
    var chev = h.querySelector('.ub-collapse-chevron');
    if (chev) chev.textContent = body.hidden ? '\u25B6' : '\u25BC';

    // Update TOC visibility for headings inside this body
    syncToc();
  });

  /* Listen for tab changes to re-sync TOC */
  document.addEventListener('change', function (e) {
    if (e.target.closest('.tabbed-set')) {
      // Defer so Material finishes toggling tab visibility
      setTimeout(syncToc, 50);
    }
  });

  /* Auto-open collapsed sections (and activate parent tabs) when a hash targets content inside */
  function openForHash() {
    var id = location.hash.slice(1);
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;

    // ── Activate any Material tabbed-set ancestor ──
    var tabbedBlock = target.closest('.tabbed-block');
    if (tabbedBlock) {
      var content = tabbedBlock.parentElement;            // .tabbed-content
      if (content) {
        var blocks = [].slice.call(content.children);
        var idx    = blocks.indexOf(tabbedBlock);         // 0-based tab index
        var set    = content.closest('.tabbed-set');
        if (set && idx >= 0) {
          // Material uses <input type="radio" id="__tabbed_X_Y"> to toggle tabs
          var radios = set.querySelectorAll(':scope > input[type="radio"]');
          if (radios[idx]) {
            radios[idx].checked = true;
            // Some Material versions also need a change event
            radios[idx].dispatchEvent(new Event('change'));
          }
        }
      }
    }

    // ── Open collapsed ancestors ──
    var body = target.closest('.ub-collapse-body');
    while (body) {
      body.hidden = false;
      var h = body.previousElementSibling;
      if (h) {
        h.classList.remove('ub-collapsed');
        var chev = h.querySelector('.ub-collapse-chevron');
        if (chev) chev.textContent = '\u25BC';
      }
      body = body.parentElement ? body.parentElement.closest('.ub-collapse-body') : null;
    }

    // Also handle the case where the hash targets a collapsible heading itself
    if (target.classList.contains('ub-collapsed')) {
      target.classList.remove('ub-collapsed');
      var nextBody = target.nextElementSibling;
      if (nextBody && nextBody.classList.contains('ub-collapse-body')) {
        nextBody.hidden = false;
      }
      var chev = target.querySelector('.ub-collapse-chevron');
      if (chev) chev.textContent = '\u25BC';
    }

    // Re-sync TOC after opening sections/tabs
    syncToc();

    // Scroll into view (defer slightly so tab/collapse transitions settle)
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
