/**
 * toolbar.js — Unified header / sidebar toggle toolbar
 * ─────────────────────────────────────────────────────
 * Consolidates motion, storage, font-size, and editor toggles into a
 * single data-driven registry.  One resize listener, one document$
 * subscription, one inject pass — no more drift between toggles.
 *
 * Button order (left → right):  motion · storage · font-size · editor
 *
 * Relies on storage-manager.js (must load first).
 * Must load BEFORE background-rune.js (motion toggle sets globals it reads).
 */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════
     TOGGLE DEFINITIONS
     Each toggle is a plain config object.  The shared framework
     handles inject / resize / boot / document$ / storage-toggle.
     ═══════════════════════════════════════════════════════════════ */

  /* ── Motion toggle ─────────────────────────────────────────── */
  var motionMode = 'animate';
  (function () {
    if (window.__ubStorage) {
      var stored = window.__ubStorage.get('bg-mode');
      if (stored && ['animate', 'frozen', 'hidden'].indexOf(stored) !== -1)
        motionMode = stored;
    }
    window.__ubBgMode = motionMode;
    window.__ubReducedMotion = motionMode !== 'animate';
    document.documentElement.setAttribute('data-ub-bg', motionMode);
  })();

  var MOTION_ICONS = {
    animate: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">'
      + '<rect fill="currentColor" x="6" y="4" width="4" height="16" rx="1"/>'
      + '<rect fill="currentColor" x="14" y="4" width="4" height="16" rx="1"/>'
      + '</svg>',
    frozen: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">'
      + '<rect fill="currentColor" x="5" y="5" width="14" height="14" rx="1.5"/>'
      + '</svg>',
    hidden: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">'
      + '<polygon fill="currentColor" points="6,4 20,12 6,20"/>'
      + '</svg>'
  };
  var MOTION_TITLES = {
    animate: 'Background: animated — click to freeze',
    frozen:  'Background: frozen — click to hide',
    hidden:  'Background: hidden — click to animate'
  };

  var motionToggle = {
    key: 'bg-mode',
    className: 'ub-motion-toggle',
    ariaLabel: 'Toggle background mode',
    modes: ['animate', 'frozen', 'hidden'],
    defaultMode: 'animate',
    getMode: function () { return motionMode; },
    icon: function (m) { return MOTION_ICONS[m]; },
    title: function (m) { return MOTION_TITLES[m]; },
    onCycle: function (m) {
      motionMode = m;
      window.__ubBgMode = m;
      window.__ubReducedMotion = m !== 'animate';
      document.documentElement.setAttribute('data-ub-bg', m);
      window.dispatchEvent(new CustomEvent('motion-toggle', {
        detail: { mode: m }
      }));
    },
    onStorageEnabled: function () {
      if (window.__ubStorage) window.__ubStorage.set('bg-mode', motionMode);
    }
  };

  /* ── Storage toggle ────────────────────────────────────────── */
  var STORAGE_ICON_ENABLED = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">'
    + '<ellipse cx="12" cy="6" rx="8" ry="3" fill="none" stroke="currentColor" stroke-width="2"/>'
    + '<path d="M4 6v4c0 1.66 3.58 3 8 3s8-1.34 8-3V6" fill="none" stroke="currentColor" stroke-width="2"/>'
    + '<path d="M4 10v4c0 1.66 3.58 3 8 3s8-1.34 8-3v-4" fill="none" stroke="currentColor" stroke-width="2"/>'
    + '<path d="M4 14v4c0 1.66 3.58 3 8 3s8-1.34 8-3v-4" fill="none" stroke="currentColor" stroke-width="2"/>'
    + '</svg>';
  var STORAGE_ICON_DISABLED = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">'
    + '<ellipse cx="12" cy="6" rx="8" ry="3" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5"/>'
    + '<path d="M4 6v4c0 1.66 3.58 3 8 3s8-1.34 8-3V6" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5"/>'
    + '<path d="M4 10v4c0 1.66 3.58 3 8 3s8-1.34 8-3v-4" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5"/>'
    + '<path d="M4 14v4c0 1.66 3.58 3 8 3s8-1.34 8-3v-4" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5"/>'
    + '<line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" stroke-width="2"/>'
    + '</svg>';

  function storageIsEnabled() {
    return window.__ubStorage && window.__ubStorage.allowed();
  }

  var storageToggle = {
    key: null,  // storage toggle doesn't use the standard storage key pattern
    className: 'ub-storage-toggle',
    ariaLabel: 'Toggle local storage',
    modes: ['enabled', 'disabled'],
    defaultMode: 'enabled',
    getMode: function () { return storageIsEnabled() ? 'enabled' : 'disabled'; },
    icon: function (m) { return m === 'enabled' ? STORAGE_ICON_DISABLED : STORAGE_ICON_ENABLED; },
    title: function (m) {
      return m === 'enabled'
        ? 'Local storage: enabled — click to disable and clear data'
        : 'Local storage: disabled — click to enable preference saving';
    },
    onCycle: function () {
      if (window.__ubStorage) window.__ubStorage.toggle();
    },
    // Storage toggle updates its own visuals via the storage-toggle event
    onStorageEnabled: null,
    // Custom: doesn't cycle modes — delegates to storage manager
    customCycle: true
  };

  /* ── Font-size toggle ──────────────────────────────────────── */
  var fontMode = 'regular';
  (function () {
    if (window.__ubStorage) {
      var stored = window.__ubStorage.get('font-size');
      if (stored && ['regular', 'large'].indexOf(stored) !== -1)
        fontMode = stored;
    }
    document.documentElement.setAttribute('data-ub-font', fontMode);
  })();

  var FONT_ICON_REGULAR = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">'
    + '<text x="10" y="18" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="currentColor" text-anchor="middle">A</text>'
    + '<text x="19" y="10" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="currentColor" text-anchor="middle">+</text>'
    + '</svg>';
  var FONT_ICON_LARGE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">'
    + '<text x="12" y="18" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="currentColor" text-anchor="middle">A</text>'
    + '</svg>';

  var fontToggle = {
    key: 'font-size',
    className: 'ub-font-toggle',
    ariaLabel: 'Toggle font size',
    modes: ['regular', 'large'],
    defaultMode: 'regular',
    getMode: function () { return fontMode; },
    icon: function (m) { return m === 'large' ? FONT_ICON_LARGE : FONT_ICON_REGULAR; },
    title: function (m) {
      return m === 'regular'
        ? 'Font size: regular (A+) — click to enlarge'
        : 'Font size: large (A) — click to reduce';
    },
    onCycle: function (m) {
      fontMode = m;
      document.documentElement.setAttribute('data-ub-font', m);
    },
    onStorageEnabled: function () {
      if (window.__ubStorage) window.__ubStorage.set('font-size', fontMode);
    }
  };

  /* ── Editor toggle ─────────────────────────────────────────── */
  var editorMode = 'off';
  (function () {
    if (window.__ubStorage) {
      var stored = window.__ubStorage.get('editor');
      if (stored && ['off', 'on'].indexOf(stored) !== -1)
        editorMode = stored;
    }
    document.documentElement.setAttribute('data-ub-editor', editorMode);
  })();

  var EDITOR_ICON_OFF = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">'
    + '<path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z'
    + 'M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>'
    + '</svg>';
  var EDITOR_ICON_ON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">'
    + '<path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z'
    + 'M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>'
    + '<line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" stroke-width="2"/>'
    + '</svg>';

  var editorToggle = {
    key: 'editor',
    className: 'ub-editor-toggle',
    ariaLabel: 'Toggle editor links',
    modes: ['off', 'on'],
    defaultMode: 'off',
    getMode: function () { return editorMode; },
    icon: function (m) { return m === 'on' ? EDITOR_ICON_ON : EDITOR_ICON_OFF; },
    title: function (m) {
      return m === 'off'
        ? 'Editor links: hidden — click to show'
        : 'Editor links: visible — click to hide';
    },
    onCycle: function (m) {
      editorMode = m;
      document.documentElement.setAttribute('data-ub-editor', m);
    },
    onStorageEnabled: function () {
      if (window.__ubStorage) window.__ubStorage.set('editor', editorMode);
    }
  };

  /* ═══════════════════════════════════════════════════════════════
     TOGGLE REGISTRY — order here = left-to-right in header
     ═══════════════════════════════════════════════════════════════ */
  var TOGGLES = [motionToggle, storageToggle, fontToggle, editorToggle];

  /* ── Public API for settings modal ─────────────────────────── */
  window.__ubToolbar = {
    toggles: TOGGLES,
    cycle: function (toggle) { cycle(toggle); },
    updateButton: function (toggle) { updateButton(toggle); }
  };

  /* ═══════════════════════════════════════════════════════════════
     SHARED FRAMEWORK
     ═══════════════════════════════════════════════════════════════ */

  function isMobileView() {
    return window.innerWidth < 1220;
  }

  /* ── Cycle a toggle to its next mode ───────────────────────── */
  function cycle(toggle) {
    if (toggle.customCycle) {
      toggle.onCycle();
      // Storage toggle updates via the storage-toggle event below
      return;
    }
    var modes = toggle.modes;
    var idx = modes.indexOf(toggle.getMode());
    var next = modes[(idx + 1) % modes.length];

    if (window.__ubStorage && toggle.key) {
      window.__ubStorage.set(toggle.key, next);
    }

    toggle.onCycle(next);
    updateButton(toggle);
  }

  /* ── Update a single button's icon + title ─────────────────── */
  function updateButton(toggle) {
    var btn = document.querySelector('.' + toggle.className);
    if (btn) {
      var m = toggle.getMode();
      btn.innerHTML = toggle.icon(m);
      btn.setAttribute('title', toggle.title(m));
    }
  }

  /* ── Create a button element for one toggle ────────────────── */
  function createButton(toggle) {
    var m = toggle.getMode();
    var btn = document.createElement('button');
    btn.className = toggle.className;
    btn.setAttribute('aria-label', toggle.ariaLabel);
    btn.setAttribute('title', toggle.title(m));
    btn.setAttribute('data-ub-live', '');
    btn.innerHTML = toggle.icon(m);
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      cycle(toggle);
    });
    return btn;
  }

  /* ── Inject all toggle buttons into the correct container ────
     NOTE: Button injection is now handled by settings-modal.js (gear
     button + modal).  This function is kept as a no-op so the boot
     sequence doesn't error.  The state-management IIFEs above still
     run and set data attributes / globals on load.
     ─────────────────────────────────────────────────────────────── */
  function inject() {
    return true;  // no-op — modal handles UI
  }

  /* ── Resize: no-op (modal handles responsive layout) ─────── */

  /* ── Listen for storage-toggle event (storage enabled/disabled) ── */
  window.addEventListener('storage-toggle', function (e) {
    // Update storage toggle button visuals
    updateButton(storageToggle);

    // When storage is enabled, persist all current toggle states
    if (e.detail && e.detail.enabled) {
      TOGGLES.forEach(function (toggle) {
        if (toggle.onStorageEnabled) toggle.onStorageEnabled();
      });
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
    document$.subscribe(function () { boot(); });
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
  }
})();
