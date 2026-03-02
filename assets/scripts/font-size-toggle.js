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
 * State is persisted in localStorage('ub-font-size').
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
    btn.className = 'ub-font-toggle';
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

  /* ── Inject into header ────────────────────────────────────── */
  function inject() {
    // Find the palette toggle button in the header
    var paletteToggle = document.querySelector('label[for^="__palette_"]');
    if (!paletteToggle) return false;

    // Don't double-inject
    if (document.querySelector('.ub-font-toggle')) return true;

    // Create or find the toggle container
    var container = document.querySelector('.ub-header-toggles');
    if (!container) {
      container = document.createElement('div');
      container.className = 'ub-header-toggles';
      // Insert after the palette toggle
      paletteToggle.parentNode.insertBefore(container, paletteToggle.nextSibling);
    }

    container.appendChild(createButton());
    return true;
  }

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
