/**
 * motion-toggle.js — In-page reduced-motion toggle
 * ──────────────────────────────────────────────────
 * Injects a toggle button into the MkDocs Material header (to the left of
 * the search icon) that lets users pause/resume canvas animations.
 *
 * State is persisted in localStorage('ub-reduced-motion').
 * Other scripts listen for the 'motion-toggle' CustomEvent on window:
 *   e.detail.reduced  — true = paused, false = animating
 *
 * Must load BEFORE particles-constellations.js in extra_javascript.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'ub-reduced-motion';

  /* ── Read persisted state (default: animations ON) ─────────── */
  var reduced = false;
  try { reduced = localStorage.getItem(STORAGE_KEY) === '1'; } catch (e) {}

  /* ── Expose global for scripts that load later ─────────────── */
  window.__ubReducedMotion = reduced;

  /* ── SVG icons (play / pause) ──────────────────────────────── */
  // "Running" state icon — pause (two vertical bars)
  var ICON_ON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">'
    + '<rect fill="currentColor" x="6" y="4" width="4" height="16" rx="1"/>'
    + '<rect fill="currentColor" x="14" y="4" width="4" height="16" rx="1"/>'
    + '</svg>';

  // "Paused" state icon — play (triangle)
  var ICON_OFF = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">'
    + '<polygon fill="currentColor" points="6,4 20,12 6,20"/>'
    + '</svg>';

  /* ── Create button ─────────────────────────────────────────── */
  function createButton() {
    var btn = document.createElement('button');
    btn.className = 'md-header__button ub-motion-toggle';
    btn.setAttribute('aria-label', 'Toggle animations');
    btn.setAttribute('title', reduced ? 'Animations paused' : 'Animations running');
    btn.innerHTML = reduced ? ICON_OFF : ICON_ON;
    btn.addEventListener('click', toggle);
    return btn;
  }

  /* ── Toggle handler ────────────────────────────────────────── */
  function toggle() {
    reduced = !reduced;
    window.__ubReducedMotion = reduced;

    try { localStorage.setItem(STORAGE_KEY, reduced ? '1' : '0'); } catch (e) {}

    // Update button visuals
    var btn = document.querySelector('.ub-motion-toggle');
    if (btn) {
      btn.innerHTML = reduced ? ICON_OFF : ICON_ON;
      btn.setAttribute('title', reduced ? 'Animations paused' : 'Animations running');
    }

    // Notify other scripts
    window.dispatchEvent(new CustomEvent('motion-toggle', {
      detail: { reduced: reduced }
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
