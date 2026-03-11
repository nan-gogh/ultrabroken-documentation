/**
 * mobile-toc.js — Table of contents in nav drawer header + smooth-scroll
 * ──────────────────────────────────────────────────────────────────────
 * Injects a collapsible "Table of contents" row into the PRIMARY sidebar
 * header area — between the drawer title and the scrollable nav list.
 * Because it lives outside the scroll container it is always visible
 * without any sticky CSS tricks, and expanding it pushes the nav list
 * down within the flex column without causing overflow.
 *
 * Only injected once (at the root level). Nested nav panels slide over
 * the entire drawer, including this row, which is expected behaviour.
 *
 * Desktop already has the right sidebar TOC — nothing is injected there.
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

  var TOC_TOGGLE_ID = '__ub_toc_header';

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

  /* ── Inject TOC into the sidebar header area ─────────────────
     Inserts .ub-toc-header between the drawer title and the nav
     list so it lives outside the scroll container and is always
     visible without any sticky positioning tricks.              ── */
  function injectHeaderToc() {
    // Remove any previous injection (SPA nav rebuilds the page)
    var prev = document.querySelector('.ub-toc-header');
    if (prev) prev.remove();

    // Desktop has its own TOC sidebar — skip
    if (!isMobileView()) return;

    var tocNav = document.querySelector('.md-sidebar--secondary .md-nav--secondary');
    if (!tocNav || !tocNav.querySelector('.md-nav__list li')) return;

    var primary = document.querySelector('.md-sidebar--primary .md-nav--primary');
    if (!primary) return;

    // Must have both a drawer title and a nav list to insert between
    var drawerTitle = primary.querySelector(':scope > .md-nav__title[for="__drawer"]');
    var rootList    = primary.querySelector(':scope > .md-nav__list');
    if (!drawerTitle || !rootList) return;

    var flatList = buildTocList(tocNav);
    if (!flatList) return;

    // Wrapper: flex child between title and list
    var wrapper = document.createElement('div');
    wrapper.className = 'ub-toc-header';

    // Hidden checkbox drives open/close
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = TOC_TOGGLE_ID;
    checkbox.className = 'ub-toc-header__toggle';

    // Label: looks and feels like a nav list entry
    var label = document.createElement('label');
    label.className = 'ub-toc-header__label';
    label.setAttribute('for', TOC_TOGGLE_ID);
    label.setAttribute('tabindex', '0');
    label.innerHTML =
      '<span class="md-ellipsis">Table of contents</span>' +
      '<span class="md-nav__icon md-icon"></span>';

    // Collapsible body: grid 0fr→1fr animation via CSS
    var body = document.createElement('div');
    body.className = 'ub-toc-header__body';
    // Inner wrapper required for grid-row 0fr to collapse correctly
    var inner = document.createElement('div');
    inner.className = 'ub-toc-header__inner';
    inner.appendChild(flatList);
    body.appendChild(inner);

    wrapper.appendChild(checkbox);
    wrapper.appendChild(label);
    wrapper.appendChild(body);

    // Insert between title and scrollable nav list
    primary.insertBefore(wrapper, rootList);
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
      // Collapse the TOC header when the drawer closes
      if (!drawer.checked) {
        var toggle = document.getElementById(TOC_TOGGLE_ID);
        if (toggle) toggle.checked = false;
      }
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
      '.md-sidebar--secondary .md-nav__link, .ub-toc-header .md-nav__link'
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
