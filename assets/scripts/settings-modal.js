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
    off: 'Hidden', on: 'Visible'
  };

  var TOGGLE_LABELS = {
    'ub-motion-toggle':  'Background',
    'ub-storage-toggle': 'Local storage',
    'ub-font-toggle':    'Font size',
    'ub-editor-toggle':  'Editing tools'
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

    // --- Version filter placeholder (Phase 1) ---
    var divider = document.createElement('div');
    divider.className = 'ub-settings-divider';
    divider.textContent = 'Version filter';
    body.appendChild(divider);

    var placeholder = document.createElement('div');
    placeholder.className = 'ub-settings-placeholder';
    placeholder.textContent = 'Coming soon';
    body.appendChild(placeholder);

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
