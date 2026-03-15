/**
 * editor-toggle.js — Toggle editor links (edit / view-source / card-copy)
 * ───────────────────────────────────────────────────────────────────────
 * Controls visibility of the .ub-page-actions row via a data attribute
 * on <html>.  Hidden by default for regular visitors; editors can
 * turn it on via the pencil button in the header.
 *
 * Two modes (cycle on click):
 *   'off' → page-actions row hidden (default)
 *   'on'  → page-actions row visible
 *
 * Relies on storage-manager.js for persisting state.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'editor';  // Will be prefixed with 'ub-' by storage manager
  var MODES = ['off', 'on'];

  /* ── Read persisted state (default: off) ───────────────────── */
  var mode = 'off';
  if (window.__ubStorage) {
    var stored = window.__ubStorage.get(STORAGE_KEY);
    if (stored && MODES.indexOf(stored) !== -1) mode = stored;
  }

  /* ── Stamp html element immediately ────────────────────────── */
  document.documentElement.setAttribute('data-ub-editor', mode);

  /* ── SVG icons ─────────────────────────────────────────────── */
  // Off: pencil (can turn on)
  var ICON_OFF = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">'
    + '<path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z'
    + 'M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>'
    + '</svg>';

  // On: pencil with slash (can turn off)
  var ICON_ON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">'
    + '<path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z'
    + 'M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>'
    + '<line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" stroke-width="2"/>'
    + '</svg>';

  var TITLES = {
    off: 'Editor links: hidden — click to show',
    on:  'Editor links: visible — click to hide'
  };

  function iconForMode(m) {
    return m === 'on' ? ICON_ON : ICON_OFF;
  }

  /* ── Create button ─────────────────────────────────────────── */
  function createButton() {
    var btn = document.createElement('button');
    btn.className = 'ub-editor-toggle';
    btn.setAttribute('aria-label', 'Toggle editor links');
    btn.setAttribute('title', TITLES[mode]);
    btn.innerHTML = iconForMode(mode);
    btn.addEventListener('click', function (e) {
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

    document.documentElement.setAttribute('data-ub-editor', mode);

    var btn = document.querySelector('.ub-editor-toggle');
    if (btn) {
      btn.innerHTML = iconForMode(mode);
      btn.setAttribute('title', TITLES[mode]);
    }
  }

  /* ── Listen for storage toggle events ──────────────────────── */
  window.addEventListener('storage-toggle', function (e) {
    if (e.detail && e.detail.enabled && window.__ubStorage) {
      window.__ubStorage.set(STORAGE_KEY, mode);
    }
  });

  /* ── Detect if we're in mobile/compact view ───────────────── */
  function isMobileView() {
    return window.innerWidth < 1220;
  }

  /* ── Inject into header (desktop) or sidebar (mobile) ──────── */
  function inject() {
    var existing = document.querySelector('.ub-editor-toggle');
    if (existing) {
      if (!existing._ubBound) {
        existing.addEventListener('click', function (e) {
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

  /* ── Handle resize to move toggles between header/sidebar ──── */
  var wasMobile = isMobileView();
  window.addEventListener('resize', function () {
    var isMobile = isMobileView();
    if (isMobile !== wasMobile) {
      wasMobile = isMobile;
      var toggle = document.querySelector('.ub-editor-toggle');
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
