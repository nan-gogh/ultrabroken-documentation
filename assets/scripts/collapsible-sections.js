/**
 * Collapsible Sections — attr_list { .collapse } on headings
 * ────────────────────────────────────────────────────────────
 * Wraps headings marked with `.collapse` (via attr_list) and all
 * their section content in native <details>/<summary> elements.
 *
 * Editors write standard markdown with no indentation overhead:
 *
 *   ## Section Title { .collapse }
 *   Content here, no special indentation needed...
 *
 *   ## Open Section { .collapse .open }
 *   This section starts expanded.
 *
 * A section spans from the marked heading up to (but not including)
 * the next heading of equal or higher level.  Nested collapsibles
 * are supported — an h3.collapse inside an h2.collapse works as
 * expected.
 */
(function () {
  'use strict';

  function init() {
    var article = document.querySelector('.md-content__inner');
    if (!article) return;

    // Bottom-to-top so nested sections wrap before their parents
    var headings = [].slice.call(
      article.querySelectorAll('h1.collapse, h2.collapse, h3.collapse, h4.collapse, h5.collapse, h6.collapse')
    ).reverse();

    for (var i = 0; i < headings.length; i++) {
      var h = headings[i];
      var level = parseInt(h.tagName[1], 10);
      var isOpen = h.classList.contains('open');

      var details = document.createElement('details');
      details.className = 'ub-collapse';
      if (isOpen) details.open = true;

      var summary = document.createElement('summary');

      // Insert <details> where the heading was
      h.parentNode.insertBefore(details, h);

      // Move heading into <summary>
      h.classList.remove('collapse', 'open');
      summary.appendChild(h);
      details.appendChild(summary);

      // Sweep following siblings until the next heading of equal or higher level
      var sib = details.nextElementSibling;
      while (sib) {
        if (/^H[1-6]$/i.test(sib.tagName) && parseInt(sib.tagName[1], 10) <= level) break;
        var next = sib.nextElementSibling;
        details.appendChild(sib);
        sib = next;
      }
    }

    openForHash();
  }

  /* Auto-open collapsed sections when a hash targets content inside */
  function openForHash() {
    var id = location.hash.slice(1);
    if (!id) return;
    var el = document.getElementById(id);
    if (!el) return;
    var d = el.closest('details.ub-collapse');
    while (d) {
      d.open = true;
      d = d.parentElement ? d.parentElement.closest('details.ub-collapse') : null;
    }
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
