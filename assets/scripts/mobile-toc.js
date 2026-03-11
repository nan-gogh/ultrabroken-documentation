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

  /* ── Inject TOC into a single nav panel's header area ──────── */
  function injectIntoNav(parentNav, level, id, tocNav) {
    var flatList = buildTocList(tocNav);
    if (!flatList) return;

    // Find the panel's title and list — insert between them
    var title = parentNav.querySelector(':scope > .md-nav__title');
    var list  = parentNav.querySelector(':scope > .md-nav__list');
    if (!title || !list) return;

    // Wrapper: flex child between title and scrollable list
    var wrapper = document.createElement('div');
    wrapper.className = 'ub-toc-header';

    // Hidden checkbox — Material's .md-nav__toggle ~ .md-nav drives the slide
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;
    checkbox.className = 'md-nav__toggle md-toggle';

    // Visible label: looks like a nav list entry
    var labelId = id + '_label';
    var label = document.createElement('label');
    label.className = 'ub-toc-header__label';
    label.setAttribute('for', id);
    label.id = labelId;
    label.tabIndex = 0;
    label.innerHTML =
      '<span class="md-ellipsis">Table of contents</span>' +
      '<span class="md-nav__icon md-icon"></span>';

    // Inner nav — Material's CSS makes this a full slide-in panel
    // (position:absolute, height:100%, translateX(100%) → translateX(0))
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

    wrapper.appendChild(checkbox);
    wrapper.appendChild(label);
    wrapper.appendChild(innerNav);

    parentNav.insertBefore(wrapper, list);
  }

  /* ── toc.follow for mobile ─────────────────────────────────
     Two independent concerns:

     1. HIGHLIGHT: MutationObserver mirrors the desktop TOC's
        active-link class into every mobile clone.

     2. SCROLL: A proportional mapping from page scroll position
        to TOC list scroll position — continuous, not snapping to
        discrete headings.  If the page is 40% scrolled, the TOC
        list is 40% scrolled.

     Manual-scroll respect: touchmove/wheel on the TOC list
     pauses auto-scroll for a cooldown, then resumes.          ── */
  var tocObserver = null;
  var tocFollowCleanups = [];

  var MANUAL_SCROLL_COOLDOWN = 3000; // ms to pause after manual scroll

  function startTocFollow(tocNav) {
    stopTocFollow();

    var clones = document.querySelectorAll('.ub-toc-header nav.md-nav');
    if (!clones.length) return;

    // ── 1. Highlight sync (active class) ────────────────────

    function syncHighlight() {
      var activeDesktop = tocNav.querySelector('.md-nav__link--active');
      var activeHref = activeDesktop
        ? activeDesktop.getAttribute('href')
        : null;

      clones.forEach(function (clone) {
        clone.querySelectorAll('.md-nav__link--active').forEach(function (el) {
          el.classList.remove('md-nav__link--active');
        });
        if (!activeHref) return;
        var match = clone.querySelector(
          'a.md-nav__link[href="' + CSS.escape(activeHref) + '"]'
        );
        if (match) match.classList.add('md-nav__link--active');
      });
    }

    syncHighlight();

    tocObserver = new MutationObserver(syncHighlight);
    tocObserver.observe(tocNav, {
      attributes: true,
      subtree: true,
      attributeFilter: ['class']
    });

    // ── 2. Proportional scroll with active-entry clamping ──
    //    Primary driver: page scroll ratio → TOC scroll ratio
    //    (continuous, analog motion between headings).
    //    Constraint: the active/highlighted entry must stay
    //    visible — ideally centered.  If the proportional
    //    position would push it out of view, the target is
    //    clamped to keep it centered.
    //
    //    After a manual-scroll cooldown expires the TOC glides
    //    back smoothly; otherwise tracking is instant.

    var scrollPanels = []; // { checkbox, scrollList, manualUntil }

    clones.forEach(function (clone) {
      var wrapper = clone.closest('.ub-toc-header');
      if (!wrapper) return;
      var checkbox = wrapper.querySelector('input.md-nav__toggle');
      if (!checkbox) return;

      var scrollList = clone.querySelector('.md-nav__list');
      if (!scrollList) return;

      var panel = { checkbox: checkbox, scrollList: scrollList, manualUntil: 0 };
      scrollPanels.push(panel);

      // Detect manual scroll: touch or wheel on the TOC list
      function onManualScroll() {
        panel.manualUntil = Date.now() + MANUAL_SCROLL_COOLDOWN;
      }
      scrollList.addEventListener('touchmove', onManualScroll, { passive: true });
      scrollList.addEventListener('wheel', onManualScroll, { passive: true });

      // When panel opens, jump to position
      function onPanelOpen() {
        if (!checkbox.checked) return;
        panel.manualUntil = 0;
        setTimeout(function () { syncScroll(panel, 'instant'); }, 300);
      }
      checkbox.addEventListener('change', onPanelOpen);

      tocFollowCleanups.push(function () {
        scrollList.removeEventListener('touchmove', onManualScroll);
        scrollList.removeEventListener('wheel', onManualScroll);
        checkbox.removeEventListener('change', onPanelOpen);
      });
    });

    // Page scroll ratio (0 → 1)
    function getPageRatio() {
      var scrollable = document.documentElement.scrollHeight - window.innerHeight;
      return scrollable > 0 ? window.scrollY / scrollable : 0;
    }

    function syncScroll(panel, behavior) {
      if (!panel.checkbox.checked) return;

      var now = Date.now();
      if (now < panel.manualUntil) return;

      // Pick behavior: smooth glide-back after cooldown, else instant
      if (!behavior) {
        if (panel.manualUntil > 0) {
          behavior = 'smooth';
          panel.manualUntil = 0;
        } else {
          behavior = 'instant';
        }
      }

      var list = panel.scrollList;
      var maxScroll = list.scrollHeight - list.clientHeight;
      if (maxScroll <= 0) return;

      // Proportional target: continuous analog motion
      var proportional = getPageRatio() * maxScroll;

      // Clamp: keep the active entry visible (centered when possible)
      var activeLink = list.querySelector('.md-nav__link--active');
      if (activeLink) {
        var item = activeLink.closest('li') || activeLink;
        // Item's offset from the top of the list's scroll content
        var itemTop = item.offsetTop;
        var itemH = item.offsetHeight;
        var listH = list.clientHeight;

        // Ideal: center the item vertically in the list viewport
        var center = itemTop + itemH / 2 - listH / 2;

        // Allowable scrollTop range that keeps the item fully visible
        var minOk = itemTop + itemH - listH; // item just at bottom edge
        var maxOk = itemTop;                  // item just at top edge
        if (minOk < 0) minOk = 0;
        if (maxOk > maxScroll) maxOk = maxScroll;

        // If proportional target keeps the item in view, use it as-is
        // for smooth continuous motion.  Otherwise clamp toward center.
        if (proportional < minOk || proportional > maxOk) {
          proportional = Math.max(0, Math.min(maxScroll, center));
        }
      }

      list.scrollTo({ top: proportional, behavior: behavior });
    }

    // Scroll handler: rAF-throttled
    var rafId = 0;
    function onPageScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(function () {
        rafId = 0;
        scrollPanels.forEach(function (p) { syncScroll(p); });
      });
    }
    window.addEventListener('scroll', onPageScroll, { passive: true });

    tocFollowCleanups.push(function () {
      window.removeEventListener('scroll', onPageScroll);
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    });
  }

  function stopTocFollow() {
    if (tocObserver) {
      tocObserver.disconnect();
      tocObserver = null;
    }
    tocFollowCleanups.forEach(function (fn) { fn(); });
    tocFollowCleanups = [];
  }

  /* ── Inject TOC into every nav panel in the primary sidebar ── */
  function injectHeaderToc() {
    // Remove any previous injections (SPA nav rebuilds the page)
    stopTocFollow();
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
    // Exclude our own injected navs (.ub-toc-header nav) to avoid recursion
    primary.querySelectorAll(
      'nav.md-nav:not(.md-nav--primary):not(.md-nav--secondary)'
    ).forEach(function (nav) {
      if (nav.closest('.ub-toc-header')) return;
      var level = parseInt(nav.getAttribute('data-md-level') || '1', 10) + 1;
      injectIntoNav(nav, level, TOGGLE_PREFIX + '_' + counter++, tocNav);
    });

    // Start mirroring the desktop TOC's active link into mobile clones
    startTocFollow(tocNav);
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
