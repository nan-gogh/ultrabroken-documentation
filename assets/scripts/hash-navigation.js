/**
 * hash-navigation.js — Fragment navigation orchestrator
 * ─────────────────────────────────────────────────────────
 * Owns everything related to URL-fragment (#hash) navigation:
 *
 *   • revealTarget()        — open tabs & collapsed sections for a target
 *   • relocateTabHeadings() — move .tab-toc-heading before .tabbed-set
 *   • scrollToTarget()      — scroll with sticky-header offset
 *   • openForHash()         — full reveal + scroll on page load / hashchange
 *
 * Exposes:
 *   window.__ubRevealTarget(el)        → boolean
 *   window.__ubScrollToTarget(el, sm)  → void
 *   window.__ubOpenForHash(sm)         → void
 *
 * Load order: AFTER collapsible-sections.js (needs sections wrapped),
 *             BEFORE toc-scrollspy.js (relocates headings before spy builds).
 */
(function () {
  'use strict';

  /* ── Reveal a hidden target (tab + collapse) ───────────── */

  /**
   * Walk upward from `target`, activating any inactive Material
   * tabs and opening collapsed sections along the way.
   * If the target itself is a collapsed heading, expand it too.
   * Returns true if anything was actually revealed.
   */
  function revealTarget(target) {
    var revealed = false;

    // Relocated tab heading — activate its tab via stored radio reference.
    if (target.dataset && target.dataset.ubTabRadio) {
      var radio = document.getElementById(target.dataset.ubTabRadio);
      if (radio && !radio.checked) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change'));
        revealed = true;
      }
    }

    var el = target;
    while (el) {
      // Open parent collapsed sections so the target becomes visible.
      if (el.classList && el.classList.contains('ub-collapse-body') && el.hidden) {
        el.hidden = false;
        var hdr = el.previousElementSibling;
        if (hdr && hdr.classList.contains('ub-collapsible')) {
          hdr.classList.remove('ub-collapsed');
        }
        revealed = true;
      }
      if (el.classList && el.classList.contains('tabbed-block')) {
        var content = el.parentElement;
        if (content) {
          var blocks = [].slice.call(content.children);
          var idx = blocks.indexOf(el);
          var set = content.closest('.tabbed-set');
          if (set && idx >= 0) {
            var radios = set.querySelectorAll(':scope > input[type="radio"]');
            if (radios[idx] && !radios[idx].checked) {
              radios[idx].checked = true;
              radios[idx].dispatchEvent(new Event('change'));
              revealed = true;
            }
          }
        }
      }
      el = el.parentElement;
    }
    // If the target itself is a collapsed heading, expand it.
    if (target.classList && target.classList.contains('ub-collapsed')) {
      target.classList.remove('ub-collapsed');
      var nextBody = target.nextElementSibling;
      if (nextBody && nextBody.classList.contains('ub-collapse-body')) {
        nextBody.hidden = false;
      }
      revealed = true;
    }
    if (window.__ubTocSpy) window.__ubTocSpy.refresh();
    return revealed;
  }

  window.__ubRevealTarget = revealTarget;

  /* ── Relocate tab headings before their tabbed-set ─────────
     Moves .tab-toc-heading elements from inside their tab
     content to just before the parent .tabbed-set in the DOM.
     This makes them behave identically to regular headings
     for scroll-to-anchor and scrollIntoView — no special
     scroll logic needed.  The associated radio button ID is
     stored in data-ub-tab-radio so revealTarget() can still
     activate the correct tab. ──────────────────────────────── */
  function relocateTabHeadings() {
    var hs = document.querySelectorAll('.tab-toc-heading[id]');
    for (var i = 0; i < hs.length; i++) {
      var h = hs[i];
      var block = h.closest('.tabbed-block');
      if (!block) continue;
      var content = block.parentElement;
      if (!content || !content.classList.contains('tabbed-content')) continue;
      var set = content.closest('.tabbed-set');
      if (!set) continue;

      var blocks = [].slice.call(content.children);
      var idx = blocks.indexOf(block);
      if (idx < 0) continue;

      var radios = set.querySelectorAll(':scope > input[type="radio"]');
      if (!radios[idx]) continue;

      h.dataset.ubTabRadio = radios[idx].id;
      set.parentNode.insertBefore(h, set);
    }
  }

  /* ── Scroll to element with header offset ──────────────── */

  /**
   * Scroll an element into view, accounting for the sticky header.
   * Uses scrollIntoView + inline scroll-margin-top so the offset
   * exactly matches what the browser does for native hash navigation.
   * @param {Element} el        Element to scroll to.
   * @param {boolean} [smooth]  true → smooth animation; false → instant.
   */
  function scrollToTarget(el, smooth) {
    var header = document.querySelector('.md-header');
    // Visible bottom of the header — correctly accounts for sticky tabs,
    // auto-hide, custom banners, and any other sticky/fixed top elements.
    var offset = header ? Math.max(0, header.getBoundingClientRect().bottom) : 0;
    // For headings, include half the computed top margin so the
    // breathing room above the heading is proportional but not excessive.
    if (/^H[1-6]$/.test(el.tagName)) {
      offset += (parseFloat(getComputedStyle(el).marginTop) || 0) * 0.35;
    }
    el.style.scrollMarginTop = offset + 'px';
    el.scrollIntoView({ block: 'start', behavior: smooth ? 'smooth' : 'auto' });
  }

  /* ── Hash-based navigation (reveal + scroll) ───────────── */

  /**
   * Reveal the hash target and scroll to it.
   *
   * This is the SINGLE scroll authority for permalink / hash
   * navigation — both fresh-load and hashchange are handled here
   * with the same scrollToTarget() call that TOC clicks use.
   * Permalink scroll is always instant (no smooth animation) to
   * override the browser's native scroll-to-anchor cleanly.
   *
   * On a fresh page load the early <head> script has already saved
   * the hash in window.__ubSavedHash and cleared the URL — we read
   * it here.
   */
  function openForHash() {
    var hash = location.hash;
    var fromSaved = false;

    // On fresh loads the <head> script saved + stripped the hash.
    if (!hash && window.__ubSavedHash) {
      hash = window.__ubSavedHash;
      fromSaved = true;
    }
    window.__ubSavedHash = null;

    var id = hash ? hash.replace(/^#/, '') : '';
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;

    var revealed = revealTarget(target);

    // Schedule the scroll.  If a tab or collapsed section was just
    // revealed, CSS transitions need ~120 ms to settle before the
    // heading's final position is reliable.  On a fresh page load
    // the mobile header may not have laid out yet — a short delay
    // ensures getBoundingClientRect() returns its final height.
    // On interactive hashchange with nothing to reveal, one paint
    // frame suffices to override the browser's native scroll.
    var scrollDelay = revealed ? 120 : (fromSaved ? 60 : 0);

    function doScroll() {
      scrollToTarget(target, false);          // always instant
      if (fromSaved) {
        requestAnimationFrame(function () {
          if (location.hash !== '#' + id) {
            history.replaceState(null, '', '#' + id);
          }
        });
      }
    }

    requestAnimationFrame(function () {
      if (scrollDelay) {
        setTimeout(doScroll, scrollDelay);
      } else {
        doScroll();
      }
    });
  }

  // Expose for other scripts.
  window.__ubOpenForHash = openForHash;
  window.__ubScrollToTarget = scrollToTarget;

  window.addEventListener('hashchange', function () { openForHash(); });

  /* ── Lifecycle ─────────────────────────────────────────── */

  function init() {
    relocateTabHeadings();
    openForHash();   // instant scroll on init / SPA navigation
  }

  if (typeof document$ !== 'undefined') {
    document$.subscribe(function () { init(); });
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
