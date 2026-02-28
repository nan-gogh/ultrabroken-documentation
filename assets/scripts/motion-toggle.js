/**
 * motion-toggle.js — In-page background mode toggle
 * ──────────────────────────────────────────────────
 * Injects a triple-cycling toggle into the MkDocs Material header
 * (to the left of the search icon) that controls the canvas background.
 *
 * Three modes (cycle on click):
 *   'animate' → full animation (particles move, rune/glow pulse)
 *   'frozen'  → single static frame (no rAF loop)
 *   'hidden'  → canvas hidden entirely, plain background colour
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
    btn.className = 'md-header__button ub-motion-toggle';
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

  /* ── Inject into header ────────────────────────────────────── */
  function inject() {
    // MkDocs Material header structure:
    //   .md-header__inner > [ logo, title/topic, spacer, search-label, ... ]
    // We want our button just before the search label.
    var searchLabel = document.querySelector('label.md-header__button[for="__search"]');
    if (!searchLabel) return false;

    // Don't double-inject (instant navigation re-runs scripts)
    if (document.querySelector('.ub-motion-toggle')) return true;

    var btn = createButton();
    searchLabel.parentNode.insertBefore(btn, searchLabel);
    return true;
  }

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
