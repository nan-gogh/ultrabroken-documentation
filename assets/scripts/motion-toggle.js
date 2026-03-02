/**
 * motion-toggle.js — In-page background mode toggle
 * ──────────────────────────────────────────────────
 * Injects a triple-cycling toggle into the MkDocs Material footer
 * that controls the background rune animation.
 *
 * Three modes (cycle on click):
 *   'animate' → full animation (rune pulse)
 *   'frozen'  → static frame (no animation)
 *   'hidden'  → rune hidden entirely
 *
 * State is persisted in localStorage('ub-bg-mode').
 * Other scripts listen for the 'motion-toggle' CustomEvent on window:
 *   e.detail.mode  — 'animate' | 'frozen' | 'hidden'
 *
 * Must load BEFORE particles-constellations.js in extra_javascript.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'ub-bg-mode';
  var MODES = ['animate', 'frozen', 'hidden'];

  /* ── Read persisted state (default: animate) ───────────────── */
  var mode = 'animate';
  try {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored && MODES.indexOf(stored) !== -1) mode = stored;
  } catch (e) {}

  /* ── Expose global for scripts that load later ─────────────── */
  window.__ubBgMode = mode;

  // Legacy compat — particles-constellations.js checks this on init
  window.__ubReducedMotion = mode !== 'animate';

  /* ── Stamp html element immediately (before rune element is created) ─ */
  // CSS rule hides .ub-rune-bg when this attribute is present,
  // so the rune is never visible even for a single frame on reload.
  document.documentElement.setAttribute('data-ub-bg', mode);

  /* ── SVG icons ─────────────────────────────────────────────── */
  // Animate: pause icon (two vertical bars)
  var ICON_ANIMATE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">'
    + '<rect fill="currentColor" x="6" y="4" width="4" height="16" rx="1"/>'
    + '<rect fill="currentColor" x="14" y="4" width="4" height="16" rx="1"/>'
    + '</svg>';

  // Frozen: stop icon (square)
  var ICON_FROZEN = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">'
    + '<rect fill="currentColor" x="5" y="5" width="14" height="14" rx="1.5"/>'
    + '</svg>';

  // Hidden: play icon (triangle)
  var ICON_HIDDEN = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">'
    + '<polygon fill="currentColor" points="6,4 20,12 6,20"/>'
    + '</svg>';

  var TITLES = {
    animate: 'Background: animated — click to freeze',
    frozen:  'Background: frozen — click to hide',
    hidden:  'Background: hidden — click to animate'
  };

  function iconForMode(m) {
    if (m === 'animate') return ICON_ANIMATE;
    if (m === 'frozen')  return ICON_FROZEN;
    return ICON_HIDDEN;
  }

  /* ── Create button ─────────────────────────────────────────── */
  function createButton() {
    var btn = document.createElement('button');
    btn.className = 'ub-motion-toggle';
    btn.setAttribute('aria-label', 'Toggle background mode');
    btn.setAttribute('title', TITLES[mode]);
    btn.innerHTML = iconForMode(mode);
    btn.addEventListener('click', cycle);
    return btn;
  }

  /* ── Cycle handler ─────────────────────────────────────────── */
  function cycle() {
    var idx = MODES.indexOf(mode);
    mode = MODES[(idx + 1) % MODES.length];
    window.__ubBgMode = mode;
    window.__ubReducedMotion = mode !== 'animate';

    try { localStorage.setItem(STORAGE_KEY, mode); } catch (e) {}

    // Stamp html element so CSS tracks current mode
    document.documentElement.setAttribute('data-ub-bg', mode);

    // Update button visuals
    var btn = document.querySelector('.ub-motion-toggle');
    if (btn) {
      btn.innerHTML = iconForMode(mode);
      btn.setAttribute('title', TITLES[mode]);
    }

    // Notify other scripts
    window.dispatchEvent(new CustomEvent('motion-toggle', {
      detail: { mode: mode }
    }));
  }

  /* ── Detect if we're in mobile/compact view ───────────────── */
  function isMobileView() {
    // MkDocs Material compact breakpoint is 76.25em (1220px)
    return window.innerWidth < 1220;
  }

  /* ── Inject into header (desktop) or sidebar (mobile) ────────── */
  function inject() {
    // Don't double-inject (instant navigation re-runs scripts)
    if (document.querySelector('.ub-motion-toggle')) return true;

    if (isMobileView()) {
      // Mobile: inject into sidebar
      var navDiv = document.querySelector('.md-nav');
      if (!navDiv) return false;

      var sidebarContainer = document.querySelector('.ub-sidebar-toggles-motion');
      if (!sidebarContainer) {
        sidebarContainer = document.createElement('div');
        sidebarContainer.className = 'ub-sidebar-toggles-motion';
        navDiv.parentNode.insertBefore(sidebarContainer, navDiv.nextSibling);
      }
      sidebarContainer.insertBefore(createButton(), sidebarContainer.firstChild);
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
      container.insertBefore(createButton(), container.firstChild);
    }
    return true;
  }

  /* ── Handle window resize to move toggles between header/sidebar */
  function onResize() {
    var toggle = document.querySelector('.ub-motion-toggle');
    if (toggle) {
      // Remove from current location
      toggle.parentNode.removeChild(toggle);
      // Re-inject to correct location
      inject();
    }
  }

  var resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(onResize, 200);
  });

  /* ── Bootstrap ─────────────────────────────────────────────── */
  function boot() {
    if (!inject()) {
      // Header might not be in DOM yet — retry a few times
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

  // MkDocs instant navigation replaces the page content, but the header
  // persists — no need to re-inject on location change.
})();
