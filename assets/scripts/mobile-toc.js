/**
 * mobile-toc.js — Table of contents in nav drawer (mobile only)
 * ──────────────────────────────────────────────────────────────
 * Injects a collapsible "Table of contents" entry at the top of EVERY
 * nav list in the primary sidebar, so it's reachable at any navigation
 * depth.  Uses Material's checkbox expand/collapse pattern with a
 * flattened list of all heading links.
 *
 * Desktop already has the right sidebar TOC, so nothing is injected there.
 *
 * Hooks into Material's document$ observable for SPA navigation support.
 */
(function () {
  'use strict';

  var TOGGLE_PREFIX = '__ub_toc';

  /* ── Build the flattened TOC list from the secondary sidebar ── */
  function buildTocList(tocNav) {
    var tocLinks = tocNav.querySelectorAll('a.md-nav__link');
    if (!tocLinks.length) return null;

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

    return flatList;
  }

  /* ── Inject a TOC entry into a single nav list ─────────────── */
  function injectIntoList(navList, level, id, tocNav) {
    var flatList = buildTocList(tocNav);
    if (!flatList) return;

    var item = document.createElement('li');
    item.className = 'md-nav__item md-nav__item--nested ub-toc-nav-item';

    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;
    checkbox.className = 'md-nav__toggle md-toggle md-toggle--indeterminate';

    var labelId = id + '_label';
    var label = document.createElement('label');
    label.className = 'md-nav__link';
    label.setAttribute('for', id);
    label.id = labelId;
    label.tabIndex = 0;
    label.innerHTML =
      '<span class="md-ellipsis">Table of contents</span>' +
      '<span class="md-nav__icon md-icon"></span>';

    var innerNav = document.createElement('nav');
    innerNav.className = 'md-nav';
    innerNav.setAttribute('data-md-level', String(level));
    innerNav.setAttribute('aria-labelledby', labelId);
    innerNav.setAttribute('aria-expanded', 'false');

    var backLabel = document.createElement('label');
    backLabel.className = 'md-nav__title';
    backLabel.setAttribute('for', id);
    backLabel.innerHTML =
      '<span class="md-nav__icon md-icon"></span> Table of contents';

    innerNav.appendChild(backLabel);
    innerNav.appendChild(flatList);

    item.appendChild(checkbox);
    item.appendChild(label);
    item.appendChild(innerNav);

    navList.insertBefore(item, navList.firstChild);
  }

  /* ── Inject TOC into every nav list in the primary sidebar ─── */
  function injectNavToc() {
    // Remove any previous injections (instant-nav rebuilds the page)
    document.querySelectorAll('.ub-toc-nav-item').forEach(function (el) {
      el.remove();
    });

    var tocNav = document.querySelector('.md-sidebar--secondary .md-nav--secondary');
    if (!tocNav || !tocNav.querySelector('.md-nav__list li')) return;

    var primary = document.querySelector('.md-sidebar--primary .md-nav--primary');
    if (!primary) return;

    // Collect every nav list: root + all nested sections
    var counter = 0;

    // Root nav list (level 0)
    var rootList = primary.querySelector(':scope > .md-nav__list');
    if (rootList) {
      injectIntoList(rootList, 1, TOGGLE_PREFIX + '_' + counter++, tocNav);
    }

    // Every nested nav (level 1+)
    primary.querySelectorAll('nav.md-nav:not(.md-nav--primary):not(.md-nav--secondary)').forEach(function (nav) {
      var list = nav.querySelector(':scope > .md-nav__list');
      if (!list) return;
      var level = parseInt(nav.getAttribute('data-md-level') || '1', 10) + 1;
      injectIntoList(list, level, TOGGLE_PREFIX + '_' + counter++, tocNav);
    });
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
