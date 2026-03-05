/**
 * Mobile TOC in nav drawer — injects the page's table of contents as a
 * collapsible section at the TOP of the nav drawer on small screens,
 * replicating Material's full nested-nav structure (checkbox toggle,
 * forward icon, back-arrow title bar) so it is indistinguishable from
 * a native nav section.
 *
 * Hooks into Material's document$ observable so it re-runs after
 * instant (SPA) navigation and search result clicks.
 */
(function () {
  var BREAKPOINT = 76.1875; // em — Material hides right sidebar below this
  var TOGGLE_ID = '__ub_toc';

  function inject() {
    // Remove any previous injection (instant-nav rebuilds the page)
    var old = document.getElementById(TOGGLE_ID);
    if (old) old.closest('.ub-toc-nav-item').remove();

    if (window.matchMedia('(min-width: ' + (BREAKPOINT + 0.0625) + 'em)').matches) return;

    var tocNav = document.querySelector('.md-sidebar--secondary .md-nav--secondary');
    if (!tocNav || !tocNav.querySelector('.md-nav__list li')) return;

    var navList = document.querySelector('.md-sidebar--primary .md-nav--primary > .md-nav__list');
    if (!navList) return;

    // --- Build the full Material nested-nav structure ---
    // <li class="md-nav__item md-nav__item--nested ub-toc-nav-item">
    //   <input class="md-nav__toggle md-toggle" type="checkbox" id="__ub_toc">
    //   <label class="md-nav__link" for="__ub_toc" id="__ub_toc_label" tabindex="0">
    //     <span class="md-ellipsis">Table of contents</span>
    //     <span class="md-nav__icon md-icon"></span>      ← forward chevron
    //   </label>
    //   <nav class="md-nav" data-md-level="1" aria-labelledby="__ub_toc_label" aria-expanded="false">
    //     <label class="md-nav__title" for="__ub_toc">    ← back arrow
    //       <span class="md-nav__icon md-icon"></span>
    //       Table of contents
    //     </label>
    //     <ul class="md-nav__list" data-md-scrollfix>
    //       … cloned TOC items …
    //     </ul>
    //   </nav>
    // </li>

    var item = document.createElement('li');
    item.className = 'md-nav__item md-nav__item--nested ub-toc-nav-item';

    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = TOGGLE_ID;
    checkbox.className = 'md-nav__toggle md-toggle md-toggle--indeterminate';

    var label = document.createElement('label');
    label.className = 'md-nav__link';
    label.setAttribute('for', TOGGLE_ID);
    label.id = TOGGLE_ID + '_label';
    label.tabIndex = 0;
    label.innerHTML =
      '<span class="md-ellipsis">Table of contents</span>' +
      '<span class="md-nav__icon md-icon"></span>';

    // Inner <nav> that slides in on mobile
    var innerNav = document.createElement('nav');
    innerNav.className = 'md-nav';
    innerNav.setAttribute('data-md-level', '1');
    innerNav.setAttribute('aria-labelledby', TOGGLE_ID + '_label');
    innerNav.setAttribute('aria-expanded', 'false');

    // Back-arrow title bar
    var backLabel = document.createElement('label');
    backLabel.className = 'md-nav__title';
    backLabel.setAttribute('for', TOGGLE_ID);
    backLabel.innerHTML =
      '<span class="md-nav__icon md-icon"></span> Table of contents';

    // Clone the TOC list (not the whole nav, just the <ul>)
    var tocList = tocNav.querySelector('.md-nav__list');
    if (!tocList) return;
    var listClone = tocList.cloneNode(true);
    listClone.setAttribute('data-md-scrollfix', '');
    // Strip duplicate IDs
    listClone.querySelectorAll('[id]').forEach(function (el) { el.removeAttribute('id'); });

    innerNav.appendChild(backLabel);
    innerNav.appendChild(listClone);

    item.appendChild(checkbox);
    item.appendChild(label);
    item.appendChild(innerNav);

    // Insert at the TOP of the nav list
    navList.insertBefore(item, navList.firstChild);
  }

  // Hook into Material's instant-loading observable (re-runs on SPA nav)
  if (typeof document$ !== 'undefined') {
    document$.subscribe(inject);
  } else {
    // Fallback for non-instant or first load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', inject);
    } else {
      inject();
    }
  }
})();
