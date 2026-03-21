/**
 * touch-scroll-fix.js — Press states & click delegation for mobile sidebar
 * ────────────────────────────────────────────────────────────────────────
 * Mobile sidebar links have  pointer-events: none  (CSS) to prevent
 * :hover and :active from flashing during swipe-scrolling.
 *
 * This script restores interactivity via event delegation:
 *   - Press visual:  touchstart adds .ub-nav-pressed on the link,
 *                    touchmove (> threshold) cancels it
 *   - Click:         clicks land on the parent <li> instead of the
 *                    pointer-events:none link, so we find the child
 *                    <a> or <label> and trigger it programmatically
 */
(function () {
  'use strict';

  var PRESS_CLASS = 'ub-nav-pressed';
  var MOVE_THRESHOLD = 8;
  var activeLink = null;
  var startY = 0;

  /** Find the direct-child link element inside a nav item.
   *  Prefer <a> (navigation) over <label> (section toggle). */
  function findLink(item) {
    return item.querySelector(':scope > a.md-nav__link') ||
           item.querySelector(':scope > label.md-nav__link');
  }

  /** Match sidebar nav items, but skip TOC items (handled by mobile-toc.js). */
  function getItem(target) {
    var item = target.closest('.md-nav--primary .md-nav__item');
    if (!item || item.closest('.ub-toc-header')) return null;
    return item;
  }

  /* ── Press state ── */
  document.addEventListener('touchstart', function (e) {
    var item = getItem(e.target);
    if (!item) return;
    var link = findLink(item);
    if (!link) return;
    startY = e.touches[0].clientY;
    activeLink = link;
    link.classList.add(PRESS_CLASS);
  }, { passive: true });

  document.addEventListener('touchmove', function (e) {
    if (!activeLink) return;
    if (Math.abs(e.touches[0].clientY - startY) > MOVE_THRESHOLD) {
      activeLink.classList.remove(PRESS_CLASS);
      activeLink = null;
    }
  }, { passive: true });

  document.addEventListener('touchend', function () {
    if (activeLink) {
      var el = activeLink;
      setTimeout(function () { el.classList.remove(PRESS_CLASS); }, 120);
      activeLink = null;
    }
  }, { passive: true });

  document.addEventListener('touchcancel', function () {
    if (activeLink) {
      activeLink.classList.remove(PRESS_CLASS);
      activeLink = null;
    }
  }, { passive: true });

  /* ── Click delegation ──
     pointer-events:none means clicks land on <li>, not <a>.
     Find the child link and trigger it programmatically. */
  document.addEventListener('click', function (e) {
    // If the click actually reached a link, let it through as-is
    if (e.target.closest('.md-nav__link')) return;

    var item = getItem(e.target);
    if (!item) return;
    var link = findLink(item);
    if (link) link.click();
  });
})();
