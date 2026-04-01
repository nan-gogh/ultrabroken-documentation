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

  /* ── Scroll offset computation ────────────────────────── */

  /**
   * Compute the correct scroll-margin-top for a heading.
   * .md-tabs is a child of .md-header, so header.offsetHeight
   * already includes the tabs bar — never sum them.
   * Use the outermost sticky bar's offsetHeight as the base.
   */
  function computeScrollMargin(el) {
    var header = document.querySelector('.md-header');
    var base = header ? header.offsetHeight : 0;
    if (/^H[1-6]$/.test(el.tagName)) {
      if (el.classList.contains('tab-toc-heading')) {
        // The tab heading anchor sits right before its .tabbed-set,
        // but multiple tab headings for the same set are stacked —
        // walk forward to find the actual .tabbed-set.
        var sib = el.nextElementSibling;
        while (sib && !sib.classList.contains('tabbed-set')) sib = sib.nextElementSibling;
        if (sib) {
          var cs = getComputedStyle(sib);
          base -= (parseFloat(cs.marginTop) || 0) + (parseFloat(cs.paddingTop) || 0);
        }
      } else {
        base += (parseFloat(getComputedStyle(el).marginTop) || 0) * 0.35;
      }
    }
    return base;
  }

  /**
   * Pre-set inline scroll-margin-top on every heading in the
   * article.  Called once on init (after relocateTabHeadings)
   * and on window resize.  This means the browser's own native
   * scroll-to-anchor (triggered by hashchange) uses our offset
   * — no JS scroll timing race needed.
   */
  function applyScrollMargins() {
    var article = document.querySelector('.md-content__inner');
    if (!article) return;
    var headings = article.querySelectorAll(
      'h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]'
    );
    for (var i = 0; i < headings.length; i++) {
      headings[i].style.scrollMarginTop = computeScrollMargin(headings[i]) + 'px';
    }
  }

  /* ── Scroll to element with header offset ──────────────── */

  /**
   * Scroll an element into view, accounting for the sticky header.
   * Refreshes the inline scroll-margin-top before scrolling.
   * @param {Element} el        Element to scroll to.
   * @param {boolean} [smooth]  true → smooth animation; false → instant.
   */
  function scrollToTarget(el, smooth) {
    el.style.scrollMarginTop = computeScrollMargin(el) + 'px';
    el.scrollIntoView({ block: 'start', behavior: smooth ? 'smooth' : 'auto' });
  }

  /* ── Hash-based navigation (reveal + scroll) ───────────── */

  /**
   * Reveal the hash target and scroll to it.
   *
   * Fresh page load  — <head> script saved + stripped the hash.
   *   We must scroll ourselves (browser has no hash to target).
   *   Double-rAF ensures layout is settled; scrollRestoration
   *   = 'manual' (set in <head>) prevents the browser from
   *   racing us back to 0.
   *
   * Hashchange (same-page URL paste / back-forward) —
   *   The browser does native scroll-to-anchor.  Because
   *   applyScrollMargins() pre-set inline scroll-margin-top on
   *   every heading, the browser uses our offset.  We only
   *   intervene if revealTarget() had to open a tab or section.
   *
   * Reload — hash stays in URL, browser scrolls natively,
   *   applyScrollMargins() already set margins in init().
   *   We reveal tabs/sections if needed.
   */
  function openForHash(fromInit) {
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

    // Restore the hash (stripped on fresh navigate) before scrolling.
    if (location.hash !== '#' + id) {
      history.replaceState(null, '', '#' + id);
    }

    if (fromSaved) {
      // Fresh page load — we must scroll (browser has no hash).
      // Double-rAF lets layout stabilise.
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          if (revealed) {
            setTimeout(function () {
              scrollToTarget(target, false);
              restoreScrollRestoration();
            }, 120);
          } else {
            scrollToTarget(target, false);
            restoreScrollRestoration();
          }
        });
      });
    } else if (revealed) {
      // Hashchange/reload that needed a tab or section revealed.
      // CSS transition needs time before the target is in its
      // final position.
      setTimeout(function () {
        scrollToTarget(target, false);
      }, 120);
    } else if (fromInit) {
      // Reload with hash in URL — browser already scrolled using
      // CSS :target values before applyScrollMargins() ran.
      // Re-scroll now that inline margins are set.
      scrollToTarget(target, false);
    }
    // else: hashchange with nothing to reveal — browser's native
    // scroll already used our pre-set inline scroll-margin-top.
  }

  function restoreScrollRestoration() {
    if (history.scrollRestoration === 'manual') {
      history.scrollRestoration = 'auto';
    }
  }

  // Expose for other scripts.
  window.__ubOpenForHash = openForHash;
  window.__ubScrollToTarget = scrollToTarget;
  window.__ubApplyScrollMargins = applyScrollMargins;

  window.addEventListener('hashchange', function () { openForHash(); });

  // Keep margins correct when viewport changes.
  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(applyScrollMargins, 150);
  });

  /* ── Lifecycle ─────────────────────────────────────────── */

  function init() {
    relocateTabHeadings();
    applyScrollMargins();   // pre-set margins for native hash scroll
    openForHash(true);       // fromInit: re-scroll if reload with hash
  }

  if (typeof document$ !== 'undefined') {
    document$.subscribe(function () { init(); });
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
