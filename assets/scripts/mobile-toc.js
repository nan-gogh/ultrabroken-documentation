/**
 * mobile-toc.js — Table of contents in nav drawer header + smooth-scroll
 * ──────────────────────────────────────────────────────────────────────
 * Injects a "Table of contents" button into the header area of EVERY
 * nav panel in the primary sidebar — between the panel's title and its
 * scrollable list.  Because it sits outside the scroll container it is
 * always visible without sticky positioning.
 *
 * Tapping the button opens Material's native slide-in panel — the full
 * TOC with a back button, same UX as navigating into a section.
 *
 * Only injected on mobile (<1220px) and only when the page has headings.
 * Desktop already has the right sidebar TOC.
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
      if (depth > 0) li.classList.add('ub-toc-indent-' + Math.min(depth, 4));

      var link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.className = 'md-nav__link';
      link.innerHTML = a.innerHTML;

      li.appendChild(link);
      flatList.appendChild(li);
    });

    return flatList;
  }

  /* ── Only run on mobile ──────────────────────────────────── */
  function isMobileView() {
    return window.innerWidth < 1220;
  }

  /* ── Inject TOC into a single nav panel ─────────────────────
     Two DOM pieces are created:
       1. A hidden <li> at the top of the panel's .md-nav__list
          (checkbox + inner nav) — gives Material's CSS the exact
          DOM hierarchy it expects for the slide-in panel.
       2. A visible label in the header area (between .md-nav__title
          and .md-nav__list) — always visible, never scrolls away.
     The header label's `for` targets the checkbox inside the <li>,
     so tapping it opens the native slide-in panel.              ── */
  function injectIntoNav(parentNav, level, id, tocNav) {
    var flatList = buildTocList(tocNav);
    if (!flatList) return;

    var title = parentNav.querySelector(':scope > .md-nav__title');
    var list  = parentNav.querySelector(':scope > .md-nav__list');
    if (!title || !list) return;

    // ─── 1. Hidden <li> in the list (drives the slide-in) ───

    var item = document.createElement('li');
    item.className = 'md-nav__item md-nav__item--nested ub-toc-nav-item';

    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;
    checkbox.className = 'md-nav__toggle md-toggle md-toggle--indeterminate';

    // In-list label (hidden by CSS — the header label replaces it)
    var inListLabel = document.createElement('label');
    inListLabel.className = 'md-nav__link';
    inListLabel.setAttribute('for', id);
    inListLabel.innerHTML =
      '<span class="md-ellipsis">Table of contents</span>' +
      '<span class="md-nav__icon md-icon"></span>';

    var labelId = id + '_label';

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
    item.appendChild(inListLabel);
    item.appendChild(innerNav);

    list.insertBefore(item, list.firstChild);

    // ─── 2. Visible header label (between title and list) ───

    var headerLabel = document.createElement('label');
    headerLabel.className = 'ub-toc-header';
    headerLabel.setAttribute('for', id);
    headerLabel.id = labelId;
    headerLabel.tabIndex = 0;
    headerLabel.innerHTML =
      '<span class="md-ellipsis">Table of contents</span>' +
      '<span class="md-nav__icon md-icon"></span>';

    parentNav.insertBefore(headerLabel, list);

    // ─── toc.follow: sync active link when panel opens ───

    checkbox.addEventListener('change', function () {
      if (!checkbox.checked) return;
      syncActiveLink(innerNav, tocNav);
    });
  }

  /* ── toc.follow for mobile ─────────────────────────────────
     Mirror the desktop TOC's active link into our cloned list
     and scroll it into view inside the slide-in panel.        ── */
  function syncActiveLink(innerNav, tocNav) {
    // Clear previous active marks
    innerNav.querySelectorAll('.md-nav__link--active').forEach(function (el) {
      el.classList.remove('md-nav__link--active');
    });

    // Find which link the desktop TOC considers active
    var activeDesktop = tocNav.querySelector('.md-nav__link--active');
    if (!activeDesktop) return;

    var activeHref = activeDesktop.getAttribute('href');
    if (!activeHref) return;

    // Find the matching link in our cloned list
    var match = innerNav.querySelector(
      'a.md-nav__link[href="' + CSS.escape(activeHref) + '"]'
    );
    if (!match) return;

    match.classList.add('md-nav__link--active');

    // Wait for the slide-in transition (250ms) then scroll into view
    setTimeout(function () {
      var list = innerNav.querySelector('.md-nav__list');
      if (list && match.offsetParent) {
        match.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }, 300);
  }

  /* ── Inject TOC into every nav panel in the primary sidebar ── */
  function injectHeaderToc() {
    // Remove any previous injections (SPA nav rebuilds the page)
    document.querySelectorAll('.ub-toc-nav-item').forEach(function (el) {
      el.remove();
    });
    document.querySelectorAll('.ub-toc-header').forEach(function (el) {
      el.remove();
    });

    // Desktop has its own TOC sidebar — skip
    if (!isMobileView()) return;

    var tocNav = document.querySelector('.md-sidebar--secondary .md-nav--secondary');
    if (!tocNav || !tocNav.querySelector('.md-nav__list li')) return;

    var primary = document.querySelector('.md-sidebar--primary .md-nav--primary');
    if (!primary) return;

    var counter = 0;

    // Root nav panel
    injectIntoNav(primary, 1, TOGGLE_PREFIX + '_' + counter++, tocNav);

    // Every nested nav panel (sections the user can navigate into)
    primary.querySelectorAll(
      'nav.md-nav:not(.md-nav--primary):not(.md-nav--secondary)'
    ).forEach(function (nav) {
      var level = parseInt(nav.getAttribute('data-md-level') || '1', 10) + 1;
      injectIntoNav(nav, level, TOGGLE_PREFIX + '_' + counter++, tocNav);
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
        // Get the sticky header height (adapts to zoom, font-size changes, viewport)
        var header = document.querySelector('.md-header');
        var headerHeight = header ? header.offsetHeight : 0;
        
        // Proportional padding: ~25% of header height for visual harmony
        // Scales automatically with zoom, font-size toggles, and everything else
        var padding = Math.max(8, Math.round(headerHeight * 0.5));
        
        var scrollTarget = target.getBoundingClientRect().top + window.scrollY - headerHeight - padding;
        window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
      }, delay);
    }

    // Update hash without creating a history entry
    history.replaceState(null, '', hash);
  }, true);  // <-- capture phase on window

  /* ── Bootstrap ─────────────────────────────────────────────── */
  if (typeof document$ !== 'undefined') {
    document$.subscribe(function () {
      injectHeaderToc();
      captureInitialStates();
      attachDrawerListener();
    });
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        injectHeaderToc();
        captureInitialStates();
        attachDrawerListener();
      });
    } else {
      injectHeaderToc();
      captureInitialStates();
      attachDrawerListener();
    }
  }
})();
