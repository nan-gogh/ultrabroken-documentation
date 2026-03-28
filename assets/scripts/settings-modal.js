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
  var toggleRows = {};            // modal: className → { row, update }
  var sidebarWrapper = null;      // .ub-settings-sidebar-wrapper injected into primary nav
  var _vfContainerModal = null;   // modal's vf grid (restored before openModal refreshes)

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
    // obsolete markers
    shown: 'Shown'
    // 'hidden' already defined by motion — same label, shared intentionally
  };

  var TOGGLE_LABELS = {
    'ub-motion-toggle':       'Background',
    'ub-storage-toggle':      'Local storage',
    'ub-font-toggle':         'Font size',
    'ub-editor-toggle':       'Editing tools',
    'ub-deprecation-toggle':  'Obsolete markers'
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

    // --- Version filter ---
    body.appendChild(buildVersionFilter());

    modal.appendChild(body);

    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
  }

  /* ── Build a single toggle row ─────────────────────────────── */
  function buildToggleRow(toggle, toolbar, rowsMap) {
    rowsMap = rowsMap || toggleRows;
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

    rowsMap[toggle.className] = { row: row, update: updateControl };
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
      // Shown → strikethrough icon (horizontal line through text)
      // Hidden → plain text icon (no line)
      var icon = mode === 'shown'
        ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">'
          + '<path fill="currentColor" d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5z"/>'
          + '<rect fill="currentColor" x="3" y="11" width="18" height="2" rx="0.5"/>'
          + '</svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">'
          + '<path fill="currentColor" d="M5 4h14v3h-5v12h-4V7H5V4z"/>'
          + '</svg>';
      control.innerHTML = icon + '<span class="ub-settings-mode">' + (MODE_LABELS[mode] || mode) + '</span>';
      control.setAttribute('title', mode === 'shown' ? 'Obsolete markers: shown — click to hide' : 'Obsolete markers: hidden — click to show');
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

  /* ── Build version filter ──────────────────────────────────── */
  var _versionData = null;   // cached versions.json
  var _vfContainer = null;   // the grid container, for refreshing

  function buildVersionFilter() {
    var wrapper = document.createElement('div');
    wrapper.className = 'ub-vf-wrapper';

    var header = document.createElement('div');
    header.className = 'ub-settings-divider';
    header.textContent = 'Version filter';
    wrapper.appendChild(header);

    var grid = document.createElement('div');
    grid.className = 'ub-vf-grid';
    grid.textContent = 'Loading\u2026';
    wrapper.appendChild(grid);
    _vfContainer = grid;

    // Legend
    var legend = document.createElement('div');
    legend.className = 'ub-vf-legend';
    legend.innerHTML = '<span class="ub-vf-leg-item" data-state="neutral">\u25CB Ignore</span>'
      + '<span class="ub-vf-leg-item" data-state="include">\u25C9 Include</span>';
    wrapper.appendChild(legend);

    // Reset button
    var reset = document.createElement('button');
    reset.className = 'ub-vf-reset';
    reset.setAttribute('type', 'button');
    reset.textContent = '\u21BA Reset filter';
    reset.addEventListener('click', function (e) {
      e.preventDefault();
      if (window.__ubVersionFilter) {
        window.__ubVersionFilter.setState({ include: [] });
      }
      refreshVersionGrid();
    });
    wrapper.appendChild(reset);

    // Fetch versions
    fetchVersions(function () { refreshVersionGrid(); });

    return wrapper;
  }

  function fetchVersions(cb) {
    if (_versionData) { cb(); return; }
    // Derive site root from an absolute stylesheet URL (works with SPA navigation + sub-path deploys)
    var link = document.querySelector('link[rel="stylesheet"][href*="assets/stylesheets/"]');
    var prefix = link ? link.href.split('assets/stylesheets/')[0] : '';
    fetch(prefix + 'assets/data/versions.json').then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    }).then(function (data) {
      _versionData = data;
      cb();
    }).catch(function () {
      if (_vfContainer) _vfContainer.textContent = 'Failed to load versions.';
    });
  }

  function refreshVersionGrid() {
    if (!_vfContainer || !_versionData) return;
    var versions = _versionData.versions || [];
    var state = window.__ubVersionFilter ? window.__ubVersionFilter.getState() : { include: [] };

    _vfContainer.innerHTML = '';
    versions.forEach(function (v) {
      var s = 'neutral';
      if (state.include.indexOf(v) >= 0) s = 'include';

      var btn = document.createElement('button');
      btn.className = 'ub-vf-chip';
      btn.setAttribute('type', 'button');
      btn.setAttribute('data-version', v);
      btn.setAttribute('data-state', s);
      btn.textContent = v;
      btn.setAttribute('title', vfTitle(v, s));
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        cycleVersion(v, btn);
      });
      _vfContainer.appendChild(btn);
    });
  }

  function cycleVersion(v, btn) {
    var state = window.__ubVersionFilter ? window.__ubVersionFilter.getState() : { include: [] };
    var inc = state.include.slice();
    var cur = inc.indexOf(v) >= 0 ? 'include' : 'neutral';

    // neutral -> include -> neutral
    var next;
    if (cur === 'neutral') {
      next = 'include';
      inc.push(v);
    } else {
      next = 'neutral';
      inc.splice(inc.indexOf(v), 1);
    }

    btn.setAttribute('data-state', next);
    btn.setAttribute('title', vfTitle(v, next));

    if (window.__ubVersionFilter) {
      window.__ubVersionFilter.setState({ include: inc });
    }
  }

  function vfTitle(v, state) {
    if (state === 'include') return v + ': included \u2014 click to ignore';
    return v + ': ignored \u2014 click to include';
  }

  /* ════════════════════════════════════════════════════════════
     OPEN / CLOSE
     ════════════════════════════════════════════════════════════ */
  function openModal() {
    if (isOpen) return;
    if (!modal) {
      buildModal();
      _vfContainerModal = _vfContainer; // capture modal's grid after first build
    }
    // Restore _vfContainer to modal's grid (sidebar panel may have changed it)
    if (_vfContainerModal) _vfContainer = _vfContainerModal;

    // Refresh toggle states before showing
    Object.keys(toggleRows).forEach(function (k) {
      toggleRows[k].update();
    });

    // Refresh version filter grid
    refreshVersionGrid();

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

    // Mobile: rebuild sidebar settings panel on each SPA nav
    injectMobileGear();

    return true;
  }

  /* ════════════════════════════════════════════════════════════
     SIDEBAR SETTINGS PANEL
     Uses Material's native checkbox-driven slide panel, exactly
     like mobile-toc.js: a hidden md-nav__toggle checkbox +
     sibling nav.md-nav[data-md-level] that Material animates.
     The gear in .ub-sidebar-toggles is a <label for=checkbox>.
     The back button is the native <label class="md-nav__title">.
     ════════════════════════════════════════════════════════════ */

  var SETTINGS_TOGGLE_ID = '__ub_settings';

  function buildSidebarPanel() {
    var primaryNav = document.querySelector('.md-sidebar--primary .md-nav--primary');
    if (!primaryNav) return;

    // Remove stale wrapper from a previous SPA navigation
    var old = primaryNav.querySelector('.ub-settings-sidebar-wrapper');
    if (old) old.remove();

    sidebarWrapper = document.createElement('div');
    sidebarWrapper.className = 'ub-settings-sidebar-wrapper';

    // Hidden checkbox — Material's CSS animates the sibling nav when checked
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = SETTINGS_TOGGLE_ID;
    checkbox.className = 'md-nav__toggle md-toggle';

    // Inner nav — Material slides this in (position:absolute, translateX)
    var innerNav = document.createElement('nav');
    innerNav.className = 'md-nav';
    innerNav.setAttribute('data-md-level', '1');
    innerNav.setAttribute('aria-label', 'Settings');

    // Back button: clicking this label unchecks the checkbox → panel slides back
    var backLabel = document.createElement('label');
    backLabel.className = 'md-nav__title';
    backLabel.setAttribute('for', SETTINGS_TOGGLE_ID);
    // Material renders the <span class="md-nav__icon md-icon"> as a ‹ chevron
    backLabel.innerHTML = '<span class="md-nav__icon md-icon"></span>Settings';
    innerNav.appendChild(backLabel);

    // Settings content
    var body = document.createElement('div');
    body.className = 'ub-settings-body ub-sidebar-settings-body';

    var toolbar = window.__ubToolbar;
    if (toolbar && toolbar.toggles) {
      toolbar.toggles.forEach(function (toggle) {
        body.appendChild(buildToggleRow(toggle, toolbar, {}));
      });
    }

    var divider = document.createElement('div');
    divider.className = 'ub-settings-divider';
    divider.textContent = 'Filtering';
    body.appendChild(divider);

    body.appendChild(buildDeprecationToggle());
    body.appendChild(buildVersionFilter());
    // buildVersionFilter() sets _vfContainer to this panel's grid

    innerNav.appendChild(body);
    sidebarWrapper.appendChild(checkbox);
    sidebarWrapper.appendChild(innerNav);

    // Append last so this panel sits above all other panels (TOC etc.)
    // in the same stacking context — later DOM order = paints on top.
    primaryNav.appendChild(sidebarWrapper);

    // Refresh the vf chip states each time the panel slides open
    checkbox.addEventListener('change', function () {
      if (!checkbox.checked) return;
      var grid = innerNav.querySelector('.ub-vf-grid');
      if (grid && _versionData) {
        _vfContainer = grid;
        refreshVersionGrid();
      }
    });
  }

  function injectMobileGear() {
    // Only inject on mobile — desktop uses header gear → modal
    if (window.innerWidth >= 1220) return;

    // Rebuild the settings panel in the primary nav (contents are SPA-nav-sensitive)
    buildSidebarPanel();

    // Gear: a <label for=checkbox> so clicking it checks/unchecks the panel
    if (document.querySelector('.ub-sidebar-toggles .ub-settings-gear')) return;
    var sidebar = document.querySelector('.md-sidebar--primary');
    if (!sidebar) return;

    var container = document.querySelector('.ub-sidebar-toggles');
    if (!container) {
      container = document.createElement('div');
      container.className = 'ub-sidebar-toggles';
      sidebar.appendChild(container);
    }

    var gearLabel = document.createElement('label');
    gearLabel.setAttribute('for', SETTINGS_TOGGLE_ID);
    gearLabel.className = 'ub-settings-gear';
    gearLabel.setAttribute('title', 'Settings');
    gearLabel.innerHTML = GEAR_ICON;
    container.appendChild(gearLabel);
  }

  /* ── Listen for storage-toggle to refresh modal if open ───── */
  window.addEventListener('storage-toggle', function (e) {
    if (isOpen && toggleRows['ub-storage-toggle']) {
      toggleRows['ub-storage-toggle'].update();
    }
    // Persist deprecation toggle state when storage is first enabled
    if (e.detail && e.detail.enabled && window.__ubStorage) {
      var shown = !document.documentElement.classList.contains('ub-hide-deprecated');
      window.__ubStorage.set('deprecated-shown', shown ? 'true' : 'false');
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
