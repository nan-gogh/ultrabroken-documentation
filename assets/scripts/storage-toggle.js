/**
 * storage-toggle.js — Local storage consent toggle (UI)
 * ──────────────────────────────────────────────────────
 * Injects a toggle button into the header/sidebar that controls
 * whether the site is allowed to persist user preferences.
 *
 * Relies on storage-manager.js (must load first) for all storage logic.
 *
 * Two visual states:
 *   enabled  → preferences are saved to localStorage
 *   disabled → no localStorage access; all stored data is deleted
 */
(function () {
  'use strict';

  /* ── SVG icons ─────────────────────────────────────────────── */
  // Enabled: database/disk icon
  var ICON_ENABLED = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">'
    + '<ellipse cx="12" cy="6" rx="8" ry="3" fill="none" stroke="currentColor" stroke-width="2"/>'
    + '<path d="M4 6v4c0 1.66 3.58 3 8 3s8-1.34 8-3V6" fill="none" stroke="currentColor" stroke-width="2"/>'
    + '<path d="M4 10v4c0 1.66 3.58 3 8 3s8-1.34 8-3v-4" fill="none" stroke="currentColor" stroke-width="2"/>'
    + '<path d="M4 14v4c0 1.66 3.58 3 8 3s8-1.34 8-3v-4" fill="none" stroke="currentColor" stroke-width="2"/>'
    + '</svg>';

  // Disabled: database with slash
  var ICON_DISABLED = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">'
    + '<ellipse cx="12" cy="6" rx="8" ry="3" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5"/>'
    + '<path d="M4 6v4c0 1.66 3.58 3 8 3s8-1.34 8-3V6" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5"/>'
    + '<path d="M4 10v4c0 1.66 3.58 3 8 3s8-1.34 8-3v-4" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5"/>'
    + '<path d="M4 14v4c0 1.66 3.58 3 8 3s8-1.34 8-3v-4" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5"/>'
    + '<line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" stroke-width="2"/>'
    + '</svg>';

  var TITLES = {
    enabled:  'Local storage: enabled — click to disable and clear data',
    disabled: 'Local storage: disabled — click to enable preference saving'
  };

  function iconForState(isEnabled) {
    return isEnabled ? ICON_ENABLED : ICON_DISABLED;
  }

  function isEnabled() {
    return window.__ubStorage && window.__ubStorage.allowed();
  }

  /* ── Create button ─────────────────────────────────────────── */
  function createButton() {
    var btn = document.createElement('button');
    btn.className = 'ub-storage-toggle';
    btn.setAttribute('aria-label', 'Toggle local storage');
    btn.setAttribute('title', TITLES[isEnabled() ? 'enabled' : 'disabled']);
    btn.innerHTML = iconForState(isEnabled());
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (window.__ubStorage) {
        window.__ubStorage.toggle();
      }
    });
    return btn;
  }

  function updateButton() {
    var btn = document.querySelector('.ub-storage-toggle');
    if (btn) {
      btn.innerHTML = iconForState(isEnabled());
      btn.setAttribute('title', TITLES[isEnabled() ? 'enabled' : 'disabled']);
    }
  }

  /* ── Listen for storage state changes ──────────────────────── */
  window.addEventListener('storage-toggle', function() {
    updateButton();
  });

  /* ── Detect if we're in mobile/compact view ───────────────── */
  function isMobileView() {
    return window.innerWidth < 1220;
  }

  /* ── Inject into header (desktop) or sidebar (mobile) ──────── */
  function inject() {
    if (document.querySelector('.ub-storage-toggle')) return true;

    if (isMobileView()) {
      var navTitle = document.querySelector('.md-nav--primary > .md-nav__title');
      if (!navTitle) return false;

      var sidebarContainer = document.querySelector('.ub-sidebar-toggles');
      if (!sidebarContainer) {
        sidebarContainer = document.createElement('div');
        sidebarContainer.className = 'ub-sidebar-toggles';
        navTitle.appendChild(sidebarContainer);
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

  /* ── Handle window resize ──────────────────────────────────── */
  var wasMobile = isMobileView();
  window.addEventListener('resize', function() {
    var isMobile = isMobileView();
    if (isMobile !== wasMobile) {
      wasMobile = isMobile;
      var toggle = document.querySelector('.ub-storage-toggle');
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

  if (typeof document$ !== 'undefined') {
    document$.subscribe(function() {
      boot();
    });
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
  }
})();
