/**
 * toc-scrollspy.js — Unified scroll spy for desktop & mobile TOC
 * ────────────────────────────────────────────────────────────────
 * Replaces Material for MkDocs' built-in scroll spy with a custom
 * implementation that correctly handles hidden headings inside
 * collapsed sections and inactive Material tabs.
 *
 * Prerequisite: data-md-component="toc" stripped from the TOC
 * <ul> via a template override so Material's native spy never
 * mounts.
 *
 * Provides:
 *   • Active heading detection (skips hidden headings)
 *   • .md-nav__link--active on the desktop TOC
 *   • Desktop TOC sidebar auto-scroll  (replaces toc.follow)
 *   • navigation.tracking hash updates (replaces native feature)
 *   • TOC entry visibility management  (hides hidden headings)
 *   • 'ub:toc-active' CustomEvent for mobile TOC sync
 *   • window.__ubTocSpy.refresh() for external callers
 */
(function () {
  'use strict';

  var ACTIVE_CLASS = 'md-nav__link--active';

  /* ── State ─────────────────────────────────────────────── */
  var headings     = [];   // [{ id, el }] in document order
  var tocLinks     = {};   // id → desktop <a.md-nav__link>
  var lastActiveId = null;
  var scrollRAF    = 0;
  var trackingTimer = 0;

  /* ── Helpers ───────────────────────────────────────────── */

  function getHeaderOffset() {
    var header = document.querySelector('.md-header');
    var h = header ? header.offsetHeight : 0;
    return h + Math.max(8, Math.round(h * 0.5));
  }

  /** Element (or an ancestor) is display:none → offsetParent null */
  function isVisible(el) {
    return el.offsetParent !== null;
  }

  /** Accumulated offsetTop through the offsetParent chain */
  function absoluteTop(el) {
    var top = 0;
    while (el) { top += el.offsetTop; el = el.offsetParent; }
    return top;
  }

  /* ── Build heading + link maps ─────────────────────────── */

  function buildHeadingList() {
    headings = [];
    tocLinks = {};

    var article = document.querySelector('.md-content__inner');
    if (!article) return;

    var hEls = article.querySelectorAll(
      'h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]'
    );
    for (var i = 0; i < hEls.length; i++) {
      headings.push({ id: hEls[i].id, el: hEls[i] });
    }

    var tocNav = document.querySelector(
      '.md-sidebar--secondary .md-nav--secondary'
    );
    if (!tocNav) return;

    var links = tocNav.querySelectorAll('a.md-nav__link');
    for (var j = 0; j < links.length; j++) {
      var href = links[j].getAttribute('href');
      if (!href || href.charAt(0) !== '#') continue;
      tocLinks[decodeURIComponent(href.slice(1))] = links[j];
    }
  }

  /* ── TOC entry visibility ──────────────────────────────── */

  function syncTocVisibility() {
    for (var id in tocLinks) {
      var heading = document.getElementById(id);
      var hidden  = !heading || !isVisible(heading);
      var li = tocLinks[id].closest('li');
      if (li) li.style.display = hidden ? 'none' : '';
    }
  }

  /* ── Compute active heading ────────────────────────────── */

  function computeActive() {
    var threshold = window.scrollY + getHeaderOffset();
    var active = null;

    for (var i = 0; i < headings.length; i++) {
      var h = headings[i];
      if (!isVisible(h.el)) continue;
      if (absoluteTop(h.el) <= threshold) {
        active = h;
      } else {
        break;
      }
    }

    // Bottom-of-page: last visible heading wins
    if (window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2) {
      for (var j = headings.length - 1; j >= 0; j--) {
        if (isVisible(headings[j].el)) { active = headings[j]; break; }
      }
    }
    return active;
  }

  /* ── Apply active class to desktop TOC ─────────────────── */

  function applyActive(activeHeading) {
    var newId = activeHeading ? activeHeading.id : null;
    if (newId === lastActiveId) return;
    lastActiveId = newId;

    // Clear previous
    for (var id in tocLinks) tocLinks[id].classList.remove(ACTIVE_CLASS);

    // Set new
    if (newId && tocLinks[newId]) tocLinks[newId].classList.add(ACTIVE_CLASS);

    autoScrollSidebar();

    // Notify mobile TOC
    var href = newId ? '#' + newId : null;
    window.dispatchEvent(
      new CustomEvent('ub:toc-active', { detail: { href: href, id: newId } })
    );

    // navigation.tracking — debounced hash update
    if (newId) {
      clearTimeout(trackingTimer);
      trackingTimer = setTimeout(function () {
        if (location.hash !== '#' + newId) {
          history.replaceState(null, '', '#' + newId);
        }
      }, 250);
    }
  }

  /* ── Auto-scroll desktop TOC sidebar (replaces toc.follow) */

  function autoScrollSidebar() {
    if (!lastActiveId) return;
    var link = tocLinks[lastActiveId];
    if (!link) return;

    var scrollwrap = link.closest('.md-sidebar__scrollwrap');
    if (!scrollwrap) return;

    // Offset of link relative to scrollwrap
    var top = 0, el = link;
    while (el && el !== scrollwrap) {
      top += el.offsetTop;
      el = el.offsetParent;
    }

    var half = scrollwrap.clientHeight / 2;
    scrollwrap.scrollTo({ top: Math.max(0, top - half), behavior: 'smooth' });
  }

  /* ── Scroll handler (rAF-throttled) ────────────────────── */

  function onScroll() {
    if (scrollRAF) return;
    scrollRAF = requestAnimationFrame(function () {
      scrollRAF = 0;
      applyActive(computeActive());
    });
  }

  /* ── Public API ────────────────────────────────────────── */

  function refresh() {
    syncTocVisibility();
    lastActiveId = null;
    applyActive(computeActive());
  }

  window.__ubTocSpy = {
    refresh: refresh,
    getActiveHref: function () {
      return lastActiveId ? '#' + lastActiveId : null;
    }
  };

  /* ── Lifecycle ─────────────────────────────────────────── */

  function init() {
    buildHeadingList();
    syncTocVisibility();
    applyActive(computeActive());
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function cleanup() {
    window.removeEventListener('scroll', onScroll);
    if (scrollRAF) { cancelAnimationFrame(scrollRAF); scrollRAF = 0; }
    clearTimeout(trackingTimer);
    lastActiveId = null;
  }

  if (typeof document$ !== 'undefined') {
    document$.subscribe(function () { cleanup(); init(); });
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
