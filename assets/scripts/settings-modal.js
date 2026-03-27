/**
 * settings-modal.js — Settings gear button + modal dialog
 * ────────────────────────────────────────────────────────
 * Replaces the row of individual toolbar toggle buttons with a single
 * gear icon that opens a settings modal.  The modal surfaces toggles
 * from toolbar.js (via window.__ubToolbar) and will later include
 * the global version filter.
 *
 * Depends on: toolbar.js (must load first — provides __ubToolbar).
 */
(function () {
  'use strict';

  /* ── SVGs ──────────────────────────────────────────────────── */
  var GEAR_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">'
    + '<path fill="currentColor" d="M19.14 12.94a7.07 7.07 0 0 0 .06-.94 7.07 7.07 0 0 0-.06-.94l2.03-1.58'
    + 'a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7.04 7.04 0 0 0-1.62-.94'
    + 'l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.48.48 0 0 0-.48.41l-.36 2.54a7.04 7.04 0 0 0-1.62.94'
    + 'l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87a.48.48 0 0 0 .12.61l2.03 1.58a7.07 7.07 0 0 0-.06.94'
    + ' 7.07 7.07 0 0 0 .06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32a.49.49 0 0 0 .59.22l2.39-.96'
    + 'a7.04 7.04 0 0 0 1.62.94l.36 2.54a.48.48 0 0 0 .48.41h3.84a.48.48 0 0 0 .48-.41l.36-2.54'
    + 'a7.04 7.04 0 0 0 1.62-.94l2.39.96a.49.49 0 0 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.03-1.58z'
    + 'M12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"/>'
    + '</svg>';

  var CLOSE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">'
    + '<line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
    + '<line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
    + '</svg>';

  /* ── State ─────────────────────────────────────────────────── */
  var modal = null;
  var backdrop = null;
  var gearBtn = null;
  var isOpen = false;
  var toggleRows = {};   // className → row element (for updating icons/labels)

  /* ── Human-readable labels for toggle modes ────────────────── */
  var MODE_LABELS = {
    // motion
    animate: 'Animated', frozen: 'Frozen', hidden: 'Hidden',
    // storage
    enabled: 'Enabled', disabled: 'Disabled',
    // font
    regular: 'Regular', large: 'Large',
    // editor
    off: 'Hidden', on: 'Visible',
    // deprecation
    shown: 'Shown', hidden: 'Hidden'
  };

  var TOGGLE_LABELS = {
    'ub-motion-toggle':       'Background',
    'ub-storage-toggle':      'Local storage',
    'ub-font-toggle':         'Font size',
    'ub-editor-toggle':       'Editing tools',
    'ub-deprecation-toggle':  'Obsolete content'
  };

  /* ════════════════════════════════════════════════════════════
     BUILD MODAL DOM
     ════════════════════════════════════════════════════════════ */
  function buildModal() {
    // Backdrop
    backdrop = document.createElement('div');
    backdrop.className = 'ub-settings-backdrop';
    backdrop.addEventListener('click', closeModal);

    // Modal container
    modal = document.createElement('div');
    modal.className = 'ub-settings-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Settings');

    // Header
    var header = document.createElement('div');
    header.className = 'ub-settings-header';

    var title = document.createElement('span');
    title.className = 'ub-settings-title';
    title.textContent = 'Settings';

    var closeBtn = document.createElement('button');
    closeBtn.className = 'ub-settings-close';
    closeBtn.setAttribute('aria-label', 'Close settings');
    closeBtn.innerHTML = CLOSE_ICON;
    closeBtn.addEventListener('click', closeModal);

    header.appendChild(title);
    header.appendChild(closeBtn);
    modal.appendChild(header);

    // Body
    var body = document.createElement('div');
    body.className = 'ub-settings-body';

    // Toggle rows
    var toolbar = window.__ubToolbar;
    if (toolbar && toolbar.toggles) {
      toolbar.toggles.forEach(function (toggle) {
        body.appendChild(buildToggleRow(toggle, toolbar));
      });
    }

    // --- Deprecation toggle ---
    var divider = document.createElement('div');
    divider.className = 'ub-settings-divider';
    divider.textContent = 'Filtering';
    body.appendChild(divider);

    body.appendChild(buildDeprecationToggle());

    modal.appendChild(body);

    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
  }

  /* ── Build a single toggle row ─────────────────────────────── */
  function buildToggleRow(toggle, toolbar) {
    var row = document.createElement('div');
    row.className = 'ub-settings-row';

    var label = document.createElement('span');
    label.className = 'ub-settings-label';
    label.textContent = TOGGLE_LABELS[toggle.className] || toggle.ariaLabel;

    var control = document.createElement('button');
    control.className = 'ub-settings-control';
    control.setAttribute('type', 'button');

    function updateControl() {
      var m = toggle.getMode();
      control.innerHTML = toggle.icon(m)
        + '<span class="ub-settings-mode">' + (MODE_LABELS[m] || m) + '</span>';
      control.setAttribute('title', toggle.title(m));
    }

    control.addEventListener('click', function (e) {
      e.preventDefault();
      toolbar.cycle(toggle);
      updateControl();
      // Also sync the header/sidebar button visuals
      toolbar.updateButton(toggle);
    });

    updateControl();

    row.appendChild(label);
    row.appendChild(control);

    toggleRows[toggle.className] = { row: row, update: updateControl };
    return row;
  }

  /* ── Build deprecation toggle ──────────────────────────────── */
  function buildDeprecationToggle() {
    var row = document.createElement('div');
    row.className = 'ub-settings-row';

    var label = document.createElement('span');
    label.className = 'ub-settings-label';
    label.textContent = TOGGLE_LABELS['ub-deprecation-toggle'];

    var control = document.createElement('button');
    control.className = 'ub-settings-control';
    control.setAttribute('type', 'button');

    function getDeprecationMode() {
      // Check the actual DOM state, not storage — toggle should reflect current state immediately
      return document.documentElement.classList.contains('ub-hide-deprecated') ? 'hidden' : 'shown';
    }

    function updateControl() {
      var mode = getDeprecationMode();
      var icon = mode === 'shown'
        ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 4C7 4 2.73 7.11 1 11.5 2.73 15.89 7 19 12 19s9.27-3.11 11-7.5C21.27 7.11 17 4 12 4m0 13c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7m0-11c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.75-2.84 3.58-4.59-1.73-4.39-6-7.5-11.14-7.5-1.48 0-2.89.2-4.24.56l3.6 3.6c.57-.23 1.18-.36 1.83-.36m0 2c-1.66 0-3 1.34-3 3 0 .29.05.57.13.84l3.87 3.87c.27-.08.55-.13.84-.13 1.66 0 3-1.34 3-3s-1.34-3-3-3zm9.69-5.48l-5.29 5.29c.07.31.11.63.11.97 0 2.21-1.79 4-4 4-.34 0-.66-.04-.97-.11l-5.29 5.29c1.5.92 3.27 1.47 5.16 1.47 6.04 0 11-4.48 12.7-10.39-1.05-1.96-2.65-3.73-4.58-4.87m-6.69.3l.94 1.06c-.26.18-.49.43-.63.73l1.06.94 1.06-1.06c.3-.14.55-.37.73-.63l.94 1.06c.17-.25.3-.54.38-.85l-1.41-1.41c-.31.08-.6.21-.85.38l-1.06-1.06-1.06 1.06c-.17.25-.3.54-.38.85l1.41 1.41c.31-.08.6-.21.85-.38z"/></svg>';
      control.innerHTML = icon + '<span class="ub-settings-mode">' + (MODE_LABELS[mode] || mode) + '</span>';
      control.setAttribute('title', mode === 'shown' ? 'Obsolete content: shown — click to hide' : 'Obsolete content: hidden — click to show');
    }

    control.addEventListener('click', function (e) {
      e.preventDefault();
      var mode = getDeprecationMode();
      var newMode = mode === 'shown' ? 'hidden' : 'shown';
      
      if (window.__ubStorage) {
        window.__ubStorage.set('deprecated-shown', newMode === 'shown' ? 'true' : 'false');
      }
      
      if (newMode === 'shown') {
        document.documentElement.classList.remove('ub-hide-deprecated');
      } else {
        document.documentElement.classList.add('ub-hide-deprecated');
      }
      
      updateControl();
    });

    updateControl();

    row.appendChild(label);
    row.appendChild(control);
    return row;
  }

  /* ════════════════════════════════════════════════════════════
     OPEN / CLOSE
     ════════════════════════════════════════════════════════════ */
  function openModal() {
    if (isOpen) return;
    if (!modal) buildModal();

    // Refresh toggle states before showing
    Object.keys(toggleRows).forEach(function (k) {
      toggleRows[k].update();
    });

    backdrop.classList.add('ub-visible');
    modal.classList.add('ub-visible');
    isOpen = true;

    // Focus trap — focus the close button
    var closeBtn = modal.querySelector('.ub-settings-close');
    if (closeBtn) closeBtn.focus();

    document.addEventListener('keydown', onKeyDown);
  }

  function closeModal() {
    if (!isOpen) return;
    backdrop.classList.remove('ub-visible');
    modal.classList.remove('ub-visible');
    isOpen = false;
    document.removeEventListener('keydown', onKeyDown);

    // Return focus to gear button
    if (gearBtn) gearBtn.focus();
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      closeModal();
      return;
    }
    // Simple focus trap
    if (e.key === 'Tab' && modal) {
      var focusable = modal.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  /* ════════════════════════════════════════════════════════════
     GEAR BUTTON
     ════════════════════════════════════════════════════════════ */
  function attachGear(btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (isOpen) closeModal(); else openModal();
    });
  }

  function createGearButton() {
    var btn = document.createElement('button');
    btn.className = 'ub-settings-gear';
    btn.setAttribute('aria-label', 'Open settings');
    btn.setAttribute('title', 'Settings');
    btn.innerHTML = GEAR_ICON;
    attachGear(btn);
    return btn;
  }

  /* ════════════════════════════════════════════════════════════
     INJECT
     ════════════════════════════════════════════════════════════ */
  function inject() {
    // Desktop: adopt or create gear button in header
    if (!gearBtn || !gearBtn.isConnected) {
      gearBtn = null;
      var existing = document.querySelector('.ub-header-toggles .ub-settings-gear');
      if (existing) {
        gearBtn = existing;
        attachGear(gearBtn);
      } else {
        var searchBtn = document.querySelector('label[for="__search"]');
        if (!searchBtn) return false;

        var container = document.querySelector('.ub-header-toggles');
        if (!container) {
          container = document.createElement('div');
          container.className = 'ub-header-toggles';
          searchBtn.parentNode.insertBefore(container, searchBtn.nextSibling);
        }
        gearBtn = createGearButton();
        container.appendChild(gearBtn);
      }
    }

    // Mobile: re-inject if sidebar gear was destroyed by instant navigation
    injectMobileGear();

    return true;
  }

  function injectMobileGear() {
    if (document.querySelector('.ub-sidebar-toggles .ub-settings-gear')) return;
    var sidebar = document.querySelector('.md-sidebar--primary');
    if (!sidebar) return;

    var container = document.querySelector('.ub-sidebar-toggles');
    if (!container) {
      container = document.createElement('div');
      container.className = 'ub-sidebar-toggles';
      sidebar.appendChild(container);
    }

    var mobileGear = createGearButton();
    container.appendChild(mobileGear);
  }

  /* ── Listen for storage-toggle to refresh modal if open ───── */
  window.addEventListener('storage-toggle', function () {
    if (isOpen && toggleRows['ub-storage-toggle']) {
      toggleRows['ub-storage-toggle'].update();
    }
  });

  /* ════════════════════════════════════════════════════════════
     BOOTSTRAP
     ════════════════════════════════════════════════════════════ */
  function boot() {
    // Initialize deprecation toggle: default is OFF (hidden)
    // Start with ub-hide-deprecated class on the root, remove it if user toggled ON
    document.documentElement.classList.add('ub-hide-deprecated');
    
    if (window.__ubStorage) {
      var deprecationShown = window.__ubStorage.get('deprecated-shown');
      if (deprecationShown === 'true') {
        document.documentElement.classList.remove('ub-hide-deprecated');
      }
    }

    if (!inject()) {
      var tries = 0;
      var timer = setInterval(function () {
        if (inject() || ++tries > 20) clearInterval(timer);
      }, 100);
    }
  }

  if (typeof document$ !== 'undefined') {
    document$.subscribe(function () { boot(); });
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
