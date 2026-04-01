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

  /** Element (or an ancestor) is display:none → offsetParent null.
      Inactive tab headings (their tab not checked) are treated as hidden. */
  function isVisible(el) {
    if (el.offsetParent === null) return false;
    if (el.classList.contains('tab-toc-heading') && el.dataset.ubTabRadio) {
      var radio = document.getElementById(el.dataset.ubTabRadio);
      if (radio && !radio.checked) return false;
    }
    return true;
  }

  /** Accumulated offsetTop through the offsetParent chain */
  function absoluteTop(el) {
    var top = 0;
    while (el) { top += el.offsetTop; el = el.offsetParent; }
    return top;
  }

  /* ── Decorate version labels in TOC links ────────────────
     The toc extension strips HTML from headings, so version
     badges injected by method_meta.py become plain text glued
     to the heading title (no space, no <code> tags).  We find
     those trailing version patterns and wrap them in styled
     <code> elements with a preceding space.

     Runs before buildHeadingList / mobile-toc clones so both
     desktop and mobile TOCs get the decoration.           ──── */

  // Matches trailing version patterns:
  //   1.0.0  |  1.0.0+  |  1.0.0-1.1.1  |  All versions
  // Multiple badges separated by optional whitespace.
  var VERSION_TAIL_RE = /(?:\s+(?:\d+\.\d+\.\d+(?:[–-]\d+\.\d+\.\d+)?(?:\+)?|All versions))+$/;

  function decorateTocVersionLabels() {
    var tocNav = document.querySelector('.md-sidebar--secondary .md-nav--secondary');
    if (!tocNav) return;

    var links = tocNav.querySelectorAll('a.md-nav__link');
    for (var i = 0; i < links.length; i++) {
      var span = links[i].querySelector('.md-ellipsis') || links[i];
      var text = (span.textContent || '').trim();
      var match = text.match(VERSION_TAIL_RE);
      if (!match) continue;

      var titlePart = text.slice(0, match.index);
      var versionPart = match[0].trim();

      // Split into individual badges (each may be "1.0.0", "1.0.0+", "1.0.0-1.1.1", "All versions")
      var badges = versionPart.match(/\d+\.\d+\.\d+(?:[–-]\d+\.\d+\.\d+)?(?:\+)?|All versions/g);
      if (!badges) continue;

      var html = titlePart.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      for (var j = 0; j < badges.length; j++) {
        html += ' <code class="ub-toc-vr">' + badges[j] + '</code>';
      }
      span.innerHTML = html;
    }
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
      var hash = links[j].hash;
      if (!hash) continue;
      tocLinks[decodeURIComponent(hash.slice(1))] = links[j];
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
    // H1 maps to the page itself, so clear the hash instead of setting it.
    if (newId) {
      var isH1 = activeHeading && activeHeading.el &&
                 activeHeading.el.tagName === 'H1';
      clearTimeout(trackingTimer);
      trackingTimer = setTimeout(function () {
        if (isH1) {
          if (location.hash) {
            history.replaceState(null, '', location.pathname + location.search);
          }
        } else if (location.hash !== '#' + newId) {
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

    var linkRect = link.getBoundingClientRect();
    var wrapRect = scrollwrap.getBoundingClientRect();
    var linkTopInWrap = linkRect.top - wrapRect.top + scrollwrap.scrollTop;
    var target = linkTopInWrap - scrollwrap.clientHeight / 2 + link.offsetHeight / 2;
    scrollwrap.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
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
    decorateTocVersionLabels();
    buildHeadingList();
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
