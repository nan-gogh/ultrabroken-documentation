/**
 * font-size-toggle.js — In-page font size toggle
 * ───────────────────────────────────────────────
 * Injects a toggle into the MkDocs Material footer that switches between
 * regular and large font sizes.
 *
 * Two modes (cycle on click):
 *   'regular' → default font sizes
 *   'large'   → 125% font size on content areas
 *
 * The header is excluded from font scaling — only content changes.
 * Relies on storage-manager.js for persisting state.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'font-size';  // Will be prefixed with 'ub-' by storage manager
  var MODES = ['regular', 'large'];

  /* ── Read persisted state (default: regular) ───────────────── */
  var mode = 'regular';
  if (window.__ubStorage) {
    var stored = window.__ubStorage.get(STORAGE_KEY);
    if (stored && MODES.indexOf(stored) !== -1) mode = stored;
  }

  /* ── Stamp html element immediately ────────────────────────── */
  document.documentElement.setAttribute('data-ub-font', mode);

  /* ── SVG icons ─────────────────────────────────────────────── */
  // Regular: A+ (can enlarge)
  var ICON_REGULAR = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">'
    + '<text x="10" y="18" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="currentColor" text-anchor="middle">A</text>'
    + '<text x="19" y="10" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="currentColor" text-anchor="middle">+</text>'
    + '</svg>';

  // Large: A (currently enlarged)
  var ICON_LARGE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">'
    + '<text x="12" y="18" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="currentColor" text-anchor="middle">A</text>'
    + '</svg>';

  var TITLES = {
    regular: 'Font size: regular (A+) — click to enlarge',
    large:   'Font size: large (A) — click to reduce'
  };

  function iconForMode(m) {
    return m === 'large' ? ICON_LARGE : ICON_REGULAR;
  }

  /* ── Create button ─────────────────────────────────────────── */
  function createButton() {
    var btn = document.createElement('button');
    btn.className = 'ub-font-toggle';
    btn.setAttribute('aria-label', 'Toggle font size');
    btn.setAttribute('title', TITLES[mode]);
    btn.innerHTML = iconForMode(mode);
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      cycle();
    });
    return btn;
  }

  /* ── Cycle handler ─────────────────────────────────────────── */
  function cycle() {
    var idx = MODES.indexOf(mode);
    mode = MODES[(idx + 1) % MODES.length];

    if (window.__ubStorage) {
      window.__ubStorage.set(STORAGE_KEY, mode);
    }

    document.documentElement.setAttribute('data-ub-font', mode);

    var btn = document.querySelector('.ub-font-toggle');
    if (btn) {
      btn.innerHTML = iconForMode(mode);
      btn.setAttribute('title', TITLES[mode]);
    }
  }

  /* ── Listen for storage toggle events ──────────────────────── */
  window.addEventListener('storage-toggle', function(e) {
    if (e.detail && e.detail.enabled && window.__ubStorage) {
      // Storage just got enabled, save current state
      window.__ubStorage.set(STORAGE_KEY, mode);
    }
  });

  /* ── Detect if we're in mobile/compact view ───────────────── */
  function isMobileView() {
    // MkDocs Material compact breakpoint is 76.25em (1220px)
    return window.innerWidth < 1220;
  }

  /* ── Inject into header (desktop) or sidebar (mobile) ────────── */
  function inject() {
    var existing = document.querySelector('.ub-font-toggle');
    if (existing) {
      if (!existing._ubBound) {
        existing.addEventListener('click', function(e) {
          e.preventDefault(); e.stopPropagation();
          cycle();
        });
        existing._ubBound = true;
        existing.innerHTML = iconForMode(mode);
        existing.setAttribute('title', TITLES[mode]);
      }
      return true;
    }

    if (isMobileView()) {
      // Mobile: inject into sidebar drawer
      var sidebar = document.querySelector('.md-sidebar--primary');
      if (!sidebar) return false;

      var sidebarContainer = document.querySelector('.ub-sidebar-toggles');
      if (!sidebarContainer) {
        sidebarContainer = document.createElement('div');
        sidebarContainer.className = 'ub-sidebar-toggles';
        sidebar.appendChild(sidebarContainer);
      }
      sidebarContainer.appendChild(createButton());
    } else {
      // Desktop: inject into header
      var searchBtn = document.querySelector('label[for="__search"]');
      if (!searchBtn) return false;

      var container = document.querySelector('.ub-header-toggles');
      if (!container) {
        container = document.createElement('div');
        container.className = 'ub-header-toggles';
        searchBtn.parentNode.insertBefore(container, searchBtn.nextSibling);
      }
      container.appendChild(createButton());
    }
    return true;
  }

  /* ── Handle window resize to move toggles between header/sidebar */
  var wasMobile = isMobileView();
  window.addEventListener('resize', function() {
    var isMobile = isMobileView();
    if (isMobile !== wasMobile) {
      wasMobile = isMobile;
      var toggle = document.querySelector('.ub-font-toggle');
      if (toggle) {
        toggle.parentNode.removeChild(toggle);
        inject();
      }
    }
  });

  /* ── Bootstrap ─────────────────────────────────────────────── */
  function boot() {
    if (!inject()) {
      var tries = 0;
      var timer = setInterval(function () {
        if (inject() || ++tries > 20) clearInterval(timer);
      }, 100);
    }
  }

  // MkDocs Material provides an observable (document$) that emits when the
  // layout is fully swapped on instant navigation, or on standard initial load.
  if (typeof document$ !== 'undefined') {
    document$.subscribe(function() {
      boot();
    });
  } else {
    // Fallback if instant loading / observables aren't active
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
  }
})();
