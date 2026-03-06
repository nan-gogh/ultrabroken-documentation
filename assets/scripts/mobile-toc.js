/**
 * mobile-toc.js — Table of contents toggle
 * ──────────────────────────────────────────
 * Injects:
 * 1. A TOC icon button into the sidebar header (mobile) or page header
 *    (desktop), alongside the storage/font-size/motion toggles.
 * 2. A collapsible "Table of contents" section inside the nav drawer
 *    using Material's checkbox expand/collapse pattern, with a flattened
 *    list of all heading links.
 *
 * Clicking the header button opens the nav drawer (if closed) and
 * programmatically checks the TOC toggle so the TOC is immediately visible.
 *
 * Hooks into Material's document$ observable for SPA navigation support.
 */
(function () {
  'use strict';

  var BREAKPOINT = 76.1875; // em — Material hides right sidebar below this
  var TOGGLE_ID = '__ub_toc';

  /* ── SVG icon: Material Design "table-of-contents" ─────────── */
  var ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">'
    + '<path fill="currentColor" d="M3 9h14V7H3v2m0 4h14v-2H3v2m0 4h14v-2H3v2'
    + 'm16 0h2v-2h-2v2m0-10v2h2V7h-2m0 6h2v-2h-2v2z"/></svg>';

  /* ── Detect mobile ─────────────────────────────────────────── */
  function isMobileView() {
    return window.innerWidth < 1220;
  }

  /* ── Inject the header/sidebar icon button ─────────────────── */
  function injectButton() {
    if (document.querySelector('.ub-toc-toggle')) return;

    // Only show button if the page has a TOC
    var tocNav = document.querySelector('.md-sidebar--secondary .md-nav--secondary');
    if (!tocNav || !tocNav.querySelector('.md-nav__list li')) return;

    var btn = document.createElement('button');
    btn.className = 'ub-toc-toggle';
    btn.setAttribute('aria-label', 'Table of contents');
    btn.setAttribute('title', 'Table of contents');
    btn.innerHTML = ICON;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      // On mobile: open the nav drawer, then check the TOC toggle
      var drawer = document.getElementById('__drawer');
      if (drawer && isMobileView() && !drawer.checked) {
        drawer.checked = true;
      }

      // Small delay to let the drawer animate open before checking TOC
      setTimeout(function () {
        var tocToggle = document.getElementById(TOGGLE_ID);
        if (tocToggle && !tocToggle.checked) {
          tocToggle.checked = true;
        }
      }, isMobileView() ? 100 : 0);
    });

    if (isMobileView()) {
      var navTitle = document.querySelector('.md-nav--primary > .md-nav__title');
      if (!navTitle) return;
      var sidebarContainer = document.querySelector('.ub-sidebar-toggles');
      if (!sidebarContainer) {
        sidebarContainer = document.createElement('div');
        sidebarContainer.className = 'ub-sidebar-toggles';
        navTitle.appendChild(sidebarContainer);
      }
      sidebarContainer.appendChild(btn);
    } else {
      var searchBtn = document.querySelector('label[for="__search"]');
      if (!searchBtn) return;
      var container = document.querySelector('.ub-header-toggles');
      if (!container) {
        container = document.createElement('div');
        container.className = 'ub-header-toggles';
        searchBtn.parentNode.insertBefore(container, searchBtn.nextSibling);
      }
      container.appendChild(btn);
    }
  }

  /* ── Handle resize to move button between header/sidebar ───── */
  var wasMobile = isMobileView();
  window.addEventListener('resize', function () {
    var mobile = isMobileView();
    if (mobile !== wasMobile) {
      wasMobile = mobile;
      var toggle = document.querySelector('.ub-toc-toggle');
      if (toggle) {
        toggle.parentNode.removeChild(toggle);
        injectButton();
      }
    }
  });

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
  function boot() {
    injectButton();
    injectNavToc();
  }

  if (typeof document$ !== 'undefined') {
    document$.subscribe(function () {
      // Remove stale button on page change so it rebuilds with fresh TOC check
      var oldBtn = document.querySelector('.ub-toc-toggle');
      if (oldBtn) oldBtn.remove();
      boot();
    });
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
  }
})();
