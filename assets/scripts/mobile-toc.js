/**
 * mobile-toc.js — Table of contents in nav drawer (mobile only)
 * ──────────────────────────────────────────────────────────────
 * Injects a collapsible "Table of contents" section inside the nav drawer
 * using Material's checkbox expand/collapse pattern, with a flattened
 * list of all heading links.
 *
 * Desktop already has the right sidebar TOC, so nothing is injected there.
 *
 * Hooks into Material's document$ observable for SPA navigation support.
 */
(function () {
  'use strict';

  var TOGGLE_ID = '__ub_toc';

  /* ── Inject the nav-drawer TOC section ─────────────────────── */
  function injectNavToc() {
    // Remove any previous injection (instant-nav rebuilds the page)
    var old = document.getElementById(TOGGLE_ID);
    if (old) {
      var wrapper = old.closest('.ub-toc-nav-item');
      if (wrapper) wrapper.remove();
    }

    var tocNav = document.querySelector('.md-sidebar--secondary .md-nav--secondary');
    if (!tocNav || !tocNav.querySelector('.md-nav__list li')) return;

    // Find the deepest active section's nav list in the primary sidebar
    var activeItem = null;
    var candidates = document.querySelectorAll(
      '.md-sidebar--primary .md-nav__item--active'
    );
    for (var i = candidates.length - 1; i >= 0; i--) {
      var childNav = candidates[i].querySelector(':scope > nav:not(.md-nav--secondary) > .md-nav__list');
      if (childNav) { activeItem = candidates[i]; break; }
    }

    var navList, level;
    if (activeItem) {
      navList = activeItem.querySelector(':scope > nav:not(.md-nav--secondary) > .md-nav__list');
      var parentNav = activeItem.querySelector(':scope > nav:not(.md-nav--secondary)');
      level = parentNav ? parseInt(parentNav.getAttribute('data-md-level') || '1', 10) + 1 : 2;
    } else {
      navList = document.querySelector('.md-sidebar--primary .md-nav--primary > .md-nav__list');
      level = 1;
    }
    if (!navList) return;

    // Build the Material nested-nav structure
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

    var innerNav = document.createElement('nav');
    innerNav.className = 'md-nav';
    innerNav.setAttribute('data-md-level', String(level));
    innerNav.setAttribute('aria-labelledby', TOGGLE_ID + '_label');
    innerNav.setAttribute('aria-expanded', 'false');

    var backLabel = document.createElement('label');
    backLabel.className = 'md-nav__title';
    backLabel.setAttribute('for', TOGGLE_ID);
    backLabel.innerHTML =
      '<span class="md-nav__icon md-icon"></span> Table of contents';

    // Flatten all TOC links into a single list
    var tocLinks = tocNav.querySelectorAll('a.md-nav__link');
    if (!tocLinks.length) return;

    var flatList = document.createElement('ul');
    flatList.className = 'md-nav__list';
    flatList.setAttribute('data-md-scrollfix', '');

    tocLinks.forEach(function (a) {
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

    navList.insertBefore(item, navList.firstChild);
  }

  /* ── Bootstrap ─────────────────────────────────────────────── */
  if (typeof document$ !== 'undefined') {
    document$.subscribe(function () {
      injectNavToc();
    });
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectNavToc);
    } else {
      injectNavToc();
    }
  }
})();
