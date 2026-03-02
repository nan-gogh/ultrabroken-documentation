/**
 * font-size-toggle.js — In-page font size toggle
 * ───────────────────────────────────────────────
 * Injects a toggle into the MkDocs Material header (next to the motion toggle)
 * that switches between regular and large font sizes.
 *
 * Two modes (cycle on click):
 *   'regular' → default font sizes
 *   'large'   → 125% font size on content areas
 *
 * The header is excluded from font scaling — only content changes.
 * State is persisted in localStorage('ub-font-size').
 *
 * Also blocks browser zoom (Ctrl+scroll, pinch) since this toggle provides
 * the accessibility function that zoom normally serves.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'ub-font-size';
  var MODES = ['regular', 'large'];

  /* ── Read persisted state (default: regular) ───────────────── */
  var mode = 'regular';
  try {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored && MODES.indexOf(stored) !== -1) mode = stored;
  } catch (e) {}

  /* ── Stamp html element immediately ────────────────────────── */
  document.documentElement.setAttribute('data-ub-font', mode);

  /* ── SVG icons ─────────────────────────────────────────────── */
  // Regular: small A
  var ICON_REGULAR = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">'
    + '<text x="12" y="18" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="currentColor" text-anchor="middle">A</text>'
    + '</svg>';

  // Large: large A with plus
  var ICON_LARGE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">'
    + '<text x="10" y="18" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="currentColor" text-anchor="middle">A</text>'
    + '<text x="19" y="10" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="currentColor" text-anchor="middle">+</text>'
    + '</svg>';

  var TITLES = {
    regular: 'Font size: regular — click for large',
    large:   'Font size: large — click for regular'
  };

  function iconForMode(m) {
    return m === 'large' ? ICON_LARGE : ICON_REGULAR;
  }

  /* ── Create button ─────────────────────────────────────────── */
  function createButton() {
    var btn = document.createElement('button');
    btn.className = 'md-header__button ub-font-toggle';
    btn.setAttribute('aria-label', 'Toggle font size');
    btn.setAttribute('title', TITLES[mode]);
    btn.innerHTML = iconForMode(mode);
    btn.addEventListener('click', cycle);
    return btn;
  }

  /* ── Cycle handler ─────────────────────────────────────────── */
  function cycle() {
    var idx = MODES.indexOf(mode);
    mode = MODES[(idx + 1) % MODES.length];

    try { localStorage.setItem(STORAGE_KEY, mode); } catch (e) {}

    document.documentElement.setAttribute('data-ub-font', mode);

    var btn = document.querySelector('.ub-font-toggle');
    if (btn) {
      btn.innerHTML = iconForMode(mode);
      btn.setAttribute('title', TITLES[mode]);
    }
  }

  /* ── Block browser zoom ────────────────────────────────────── */
  function blockZoom() {
    // Block Ctrl+scroll / Ctrl+plus/minus on desktop
    document.addEventListener('wheel', function (e) {
      if (e.ctrlKey) e.preventDefault();
    }, { passive: false });

    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
        e.preventDefault();
      }
    });

    // Block pinch-zoom on touch devices. This is tricky, especially during
    // momentum scroll. We need multiple layers of prevention.
    
    // Layer 1: Early-exit listener on window capture phase.
    // This fires before the event even reaches the target element, giving us
    // the best chance to cancel it.
    window.addEventListener('touchmove', function (e) {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false, capture: true });

    // Layer 2: Dynamically toggle a CSS class on the body to set
    // `touch-action: none`, a direct hint to the compositor.
    document.addEventListener('touchstart', function (e) {
      if (e.touches.length > 1) {
        document.body.classList.add('ub-no-zoom');
        e.preventDefault();
      }
    }, { passive: false });

    document.addEventListener('touchend', function (e) {
      if (e.touches.length < 2) {
        document.body.classList.remove('ub-no-zoom');
      }
    });

    // Layer 3: Redundant gesture event blocking for Safari.
    document.addEventListener('gesturestart', function (e) { e.preventDefault(); }, { passive: false });
    document.addEventListener('gesturechange', function (e) { e.preventDefault(); }, { passive: false });
    document.addEventListener('gestureend', function (e) { e.preventDefault(); }, { passive: false });
  }

  /* ── Inject into header ────────────────────────────────────── */
  function inject() {
    // Find the header nav (where search icon lives)
    var headerNav = document.querySelector('.md-header__inner > nav.md-header__source, .md-header__inner .md-header__source');
    if (!headerNav) {
      // Fallback: place before the search form
      var searchForm = document.querySelector('.md-search');
      if (searchForm && searchForm.parentNode) {
        searchForm.parentNode.insertBefore(createButton(), searchForm);
        return;
      }
    }
    // Place before the source link/nav if present
    if (headerNav && headerNav.parentNode) {
      headerNav.parentNode.insertBefore(createButton(), headerNav);
      return;
    }
    // Final fallback: append to header inner
    var headerInner = document.querySelector('.md-header__inner');
    if (headerInner) {
      headerInner.appendChild(createButton());
    }
  }

  /* ── Bootstrap ─────────────────────────────────────────────── */
  blockZoom();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
