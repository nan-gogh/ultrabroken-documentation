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

    // Find the deepest active nav list in the primary sidebar.
    // On nested pages (e.g. Ultrabroken > Introduction), Material auto-opens
    // the section and the mobile drawer slides into that sub-list.  We must
    // inject there — not at root — so the TOC is visible immediately.
    var activeItem = null;
    var candidates = document.querySelectorAll(
      '.md-sidebar--primary .md-nav__item--active'
    );
    // Take the deepest (last) active item that owns a child nav list
    for (var i = candidates.length - 1; i >= 0; i--) {
      var ul = candidates[i].querySelector(':scope > nav > .md-nav__list');
      if (ul) { activeItem = candidates[i]; break; }
    }

    var navList;
    var level;
    if (activeItem) {
      navList = activeItem.querySelector(':scope > nav > .md-nav__list');
      // Determine nesting depth from the parent <nav data-md-level>
      var parentNav = activeItem.querySelector(':scope > nav');
      level = parentNav ? parseInt(parentNav.getAttribute('data-md-level') || '1', 10) + 1 : 2;
    } else {
      // Fallback: root nav list (top-level pages like glitchcraft)
      navList = document.querySelector('.md-sidebar--primary .md-nav--primary > .md-nav__list');
      level = 1;
    }
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
    innerNav.setAttribute('data-md-level', String(level));
    innerNav.setAttribute('aria-labelledby', TOGGLE_ID + '_label');
    innerNav.setAttribute('aria-expanded', 'false');

    // Back-arrow title bar
    var backLabel = document.createElement('label');
    backLabel.className = 'md-nav__title';
    backLabel.setAttribute('for', TOGGLE_ID);
    backLabel.innerHTML =
      '<span class="md-nav__icon md-icon"></span> Table of contents';

    // Flatten all TOC links into a single list — Material's nested <nav>/<ul>
    // structure hides sub-items in the mobile slide-in, so we extract every
    // anchor and build a flat list with CSS-class depth hints instead.
    var tocLinks = tocNav.querySelectorAll('a.md-nav__link');
    if (!tocLinks.length) return;

    var flatList = document.createElement('ul');
    flatList.className = 'md-nav__list';
    flatList.setAttribute('data-md-scrollfix', '');

    tocLinks.forEach(function (a) {
      // Determine nesting depth by counting ancestor <nav> elements
      var depth = 0;
      var parent = a.parentElement;
      while (parent && parent !== tocNav) {
        if (parent.tagName === 'NAV') depth++;
        parent = parent.parentElement;
      }

      var li = document.createElement('li');
      li.className = 'md-nav__item';
      if (depth > 1) li.classList.add('ub-toc-indent-' + Math.min(depth - 1, 3));

      var link = document.createElement('a');
      // Use only the hash fragment so cosmetic-url params don't leak in
      link.href = a.getAttribute('href');
      link.className = 'md-nav__link';
      link.innerHTML = a.innerHTML;

      li.appendChild(link);
      flatList.appendChild(li);
    });

    innerNav.appendChild(backLabel);
    innerNav.appendChild(flatList);

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
