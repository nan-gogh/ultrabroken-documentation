/**
 * storage-toggle.js — Local storage consent toggle
 * ─────────────────────────────────────────────────
 * Controls whether the site is allowed to persist user preferences
 * (font size, background mode, etc.) in localStorage.
 *
 * Two states:
 *   enabled  → preferences are saved to localStorage
 *   disabled → no localStorage access; all stored data is deleted
 *
 * Other scripts should check window.__ubStorageAllowed() before
 * reading from or writing to localStorage.
 *
 * Must load BEFORE font-size-toggle.js and motion-toggle.js.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'ub-storage-enabled';
  var enabled = false;

  /* ── Check if storage was previously enabled ───────────────── */
  try {
    enabled = localStorage.getItem(STORAGE_KEY) === 'true';
  } catch (e) {}

  /* ── Expose global check function ──────────────────────────── */
  window.__ubStorageAllowed = function () {
    return enabled;
  };

  /* ── SVG icons ─────────────────────────────────────────────── */
  // Enabled: database/disk icon with checkmark
  var ICON_ENABLED = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">'
    + '<ellipse cx="12" cy="6" rx="8" ry="3" fill="none" stroke="currentColor" stroke-width="2"/>'
    + '<path d="M4 6v4c0 1.66 3.58 3 8 3s8-1.34 8-3V6" fill="none" stroke="currentColor" stroke-width="2"/>'
    + '<path d="M4 10v4c0 1.66 3.58 3 8 3s8-1.34 8-3v-4" fill="none" stroke="currentColor" stroke-width="2"/>'
    + '<path d="M4 14v4c0 1.66 3.58 3 8 3s8-1.34 8-3v-4" fill="none" stroke="currentColor" stroke-width="2"/>'
    + '</svg>';

  // Disabled: database with X/slash
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

  /* ── Create button ─────────────────────────────────────────── */
  function createButton() {
    var btn = document.createElement('button');
    btn.className = 'ub-storage-toggle';
    btn.setAttribute('aria-label', 'Toggle local storage');
    btn.setAttribute('title', TITLES[enabled ? 'enabled' : 'disabled']);
    btn.innerHTML = iconForState(enabled);
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggle();
    });
    return btn;
  }

  /* ── Toggle handler with confirmation dialogs ──────────────── */
  function toggle() {
    if (enabled) {
      // Currently enabled → ask to disable
      var confirmDisable = window.confirm(
        'Disable Local Storage?\n\n' +
        'This will:\n' +
        '• Delete all saved preferences (font size, background mode, etc.)\n' +
        '• Stop saving any future preference changes\n' +
        '• Reset all settings to defaults on next page load\n\n' +
        'Your preferences will NOT be remembered between visits.\n\n' +
        'Click OK to disable and clear all stored data, or Cancel to keep storage enabled.'
      );

      if (!confirmDisable) return;

      // Disable and clear all ub-* keys
      enabled = false;
      try {
        var keysToRemove = [];
        for (var i = 0; i < localStorage.length; i++) {
          var key = localStorage.key(i);
          if (key && key.indexOf('ub-') === 0) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(function(key) {
          localStorage.removeItem(key);
        });
      } catch (e) {}

      // Notify other scripts
      window.dispatchEvent(new CustomEvent('storage-toggle', {
        detail: { enabled: false }
      }));

    } else {
      // Currently disabled → ask to enable
      var confirmEnable = window.confirm(
        'Enable Local Storage?\n\n' +
        'This will:\n' +
        '• Save your current preferences (font size, background mode, etc.)\n' +
        '• Remember your settings between visits\n' +
        '• Store data only in your browser (nothing is sent to any server)\n\n' +
        'You can disable this at any time to clear all stored data.\n\n' +
        'Click OK to enable preference saving, or Cancel to keep storage disabled.'
      );

      if (!confirmEnable) return;

      // Enable storage
      enabled = true;
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch (e) {}

      // Notify other scripts to save their current state
      window.dispatchEvent(new CustomEvent('storage-toggle', {
        detail: { enabled: true }
      }));
    }

    // Update button visuals
    updateButton();
  }

  function updateButton() {
    var btn = document.querySelector('.ub-storage-toggle');
    if (btn) {
      btn.innerHTML = iconForState(enabled);
      btn.setAttribute('title', TITLES[enabled ? 'enabled' : 'disabled']);
    }
  }

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
