/**
 * mobile-toc.js — Table of contents in nav drawer + smooth-scroll
 * ──────────────────────────────────────────────────────────────
 * Injects a collapsible "Table of contents" entry at the top of EVERY
 * nav list in the primary sidebar, so it's reachable at any navigation
 * depth.  Uses Material's checkbox expand/collapse pattern with a
 * flattened list of all heading links.
 *
 * Desktop already has the right sidebar TOC, so nothing is injected there.
 *
 * All TOC link clicks (desktop + mobile) are intercepted via event
 * delegation: they smooth-scroll to the heading instead of triggering
 * a native anchor jump, and use replaceState so the browser back
 * button isn't polluted.
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

  /* ── Only run on mobile ──────────────────────────────────── */
  function isMobileView() {
    return window.innerWidth < 1220;
  }

  /* ── Inject TOC into every nav list in the primary sidebar ─── */
  function injectNavToc() {
    // Remove any previous injections (instant-nav rebuilds the page)
    document.querySelectorAll('.ub-toc-nav-item').forEach(function (el) {
      el.remove();
    });

    // Desktop has its own TOC sidebar — skip injection
    if (!isMobileView()) return;

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

  /* ── Reset nav on drawer open ────────────────────────────────
     Capture the initial checked state of every nav toggle after
     injection, then restore it whenever the drawer is OPENED so
     the user always starts at the current page's position.
     (Resetting on close causes a visible header-color flash.) ── */
  var initialStates = {};

  function captureInitialStates() {
    initialStates = {};
    var primary = document.querySelector('.md-sidebar--primary .md-nav--primary');
    if (!primary) return;
    primary.querySelectorAll('input.md-toggle').forEach(function (cb) {
      if (cb.id) initialStates[cb.id] = cb.checked;
    });
  }

  function restoreNavPosition() {
    var primary = document.querySelector('.md-sidebar--primary .md-nav--primary');
    if (!primary) return;

    // Suppress transitions during reset so panels snap instantly
    primary.classList.add('ub-nav-resetting');

    primary.querySelectorAll('input.md-toggle').forEach(function (cb) {
      if (cb.id && cb.id in initialStates) {
        cb.checked = initialStates[cb.id];
      }
    });

    // Double rAF: ensure the browser has painted the reset state
    // before re-enabling transitions
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        primary.classList.remove('ub-nav-resetting');
      });
    });
  }

  // Listen for drawer checkbox changes
  function attachDrawerListener() {
    var drawer = document.getElementById('__drawer');
    if (!drawer || drawer.__ubTocListener) return;
    drawer.addEventListener('change', function () {
      if (drawer.checked) restoreNavPosition();
    });
    drawer.__ubTocListener = true;
  }

  /* ── Smooth-scroll for ALL TOC links (desktop + mobile) ──────
     Registered on `window` in the capture phase — the EARLIEST
     possible interception point in the DOM event flow:
       window (capture) → document → html → … → target → … → bubble

     This fires before any Material handler, even capture-phase
     ones on `document`.  We stop propagation so no other handler
     (including the browser default) processes the click.        ── */
  window.addEventListener('click', function (e) {
    var link = e.target.closest(
      '.md-sidebar--secondary .md-nav__link, .ub-toc-nav-item .md-nav__link'
    );
    if (!link) return;

    // Material rewrites href="#foo" to full absolute URLs at runtime,
    // so use the .hash property which always returns just "#fragment".
    var hash = link.hash;
    if (!hash) return;

    // Only intercept same-page anchors (pathname must match current page)
    var linkUrl = new URL(link.href, location.href);
    if (linkUrl.pathname !== location.pathname) return;

    // Kill the event completely
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    var targetId = decodeURIComponent(hash.slice(1));
    var target = document.getElementById(targetId);

    // On mobile, close the drawer first
    var drawer = document.getElementById('__drawer');
    var isMobile = drawer && drawer.checked;
    if (isMobile) drawer.checked = false;

    if (target) {
      var delay = isMobile ? 150 : 0;
      setTimeout(function () {
        // Measure the header height when it's in its natural position (sticky at top)
        var header = document.querySelector('.md-header');
        var headerHeight = header ? header.offsetHeight : 0;
        
        // Measure the gap between header bottom and main content top
        // to maintain visual harmony with zoom and font-size changes
        var mainContent = document.querySelector('.md-main');
        var gap = 0;
        if (header && mainContent) {
          var headerBottom = header.getBoundingClientRect().bottom;
          var contentTop = mainContent.getBoundingClientRect().top;
          gap = Math.max(0, contentTop - headerBottom);
        }
        
        // Scroll so the target appears below the header with the same gap
        var scrollTarget = target.getBoundingClientRect().top + window.scrollY - headerHeight - gap;
        window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
      }, delay);
    }

    // Update hash without creating a history entry
    history.replaceState(null, '', hash);
  }, true);  // <-- capture phase on window

  /* ── Bootstrap ─────────────────────────────────────────────── */
  if (typeof document$ !== 'undefined') {
    document$.subscribe(function () {
      injectNavToc();
      captureInitialStates();
      attachDrawerListener();
    });
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        injectNavToc();
        captureInitialStates();
        attachDrawerListener();
      });
    } else {
      injectNavToc();
      captureInitialStates();
      attachDrawerListener();
    }
  }
})();
