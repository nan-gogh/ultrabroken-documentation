/**
 * version-highlight.js — Global version filter highlighting
 * ──────────────────────────────────────────────────────────
 * Reads the global version filter state and applies visual classes to
 * method tabs, section headings, and any version-annotated content on
 * wiki pages.
 *
 * Visual treatment is purely additive (color-based, not opacity-based)
 * so it composes with strikethrough from obsolete markers.
 *
 * Classes applied:
 *   .ub-version-match    — version-included content (teal glow)
 *   .ub-version-mismatch — version-excluded content (muted)
 *
 * Depends on: storage-manager.js (loads before this).
 * Reacts to:  'version-filter' custom events on window.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'version-filter';
  var EVENT_NAME  = 'version-filter';

  /* ══════════════════════════════════════════════════════════════
     State
     ══════════════════════════════════════════════════════════════ */
  var filterState = { include: [], exclude: [] };

  function loadState() {
    if (window.__ubStorage && window.__ubStorage.allowed()) {
      var s = window.__ubStorage.getJSON(STORAGE_KEY);
      if (s && typeof s === 'object') {
        filterState = {
          include: Array.isArray(s.include) ? s.include : [],
          exclude: Array.isArray(s.exclude) ? s.exclude : []
        };
        return;
      }
    }
    filterState = { include: [], exclude: [] };
  }

  function saveState() {
    if (window.__ubStorage && window.__ubStorage.allowed()) {
      window.__ubStorage.setJSON(STORAGE_KEY, filterState);
    }
  }

  function isActive() {
    return filterState.include.length > 0 || filterState.exclude.length > 0;
  }

  /** Classify a versions array against the current filter.
   *  Returns 'match' | 'mismatch' | 'neutral'. */
  function classify(versions) {
    if (!versions || !versions.length || !isActive()) return 'neutral';
    var hasInclude = filterState.include.length > 0;
    var hasExclude = filterState.exclude.length > 0;

    if (hasInclude) {
      for (var i = 0; i < filterState.include.length; i++) {
        if (versions.indexOf(filterState.include[i]) >= 0) return 'match';
      }
    }

    if (hasExclude) {
      var allExcluded = true;
      for (var j = 0; j < versions.length; j++) {
        if (filterState.exclude.indexOf(versions[j]) < 0) {
          allExcluded = false;
          break;
        }
      }
      if (allExcluded) return 'mismatch';
    }

    return hasInclude ? 'mismatch' : 'neutral';
  }

  /* ══════════════════════════════════════════════════════════════
     DOM highlighting — wiki pages
     ══════════════════════════════════════════════════════════════ */

  /** Walk all .ub-method-meta divs and classify their parent contexts. */
  function highlightPage() {
    var metas = document.querySelectorAll('.ub-method-meta[data-versions]');
    if (!metas.length) return;

    // Collect tabbed-set info for mapping blocks → labels
    var tabbedSets = [];
    document.querySelectorAll('.tabbed-set').forEach(function (set) {
      var labels = [];
      set.querySelectorAll(':scope > input + .tabbed-labels label').forEach(function (l) {
        labels.push(l);
      });
      // If the above selector doesn't work (varying DOM), try broader
      if (!labels.length) {
        var labelsContainer = set.querySelector('.tabbed-labels');
        if (labelsContainer) {
          labelsContainer.querySelectorAll(':scope > label').forEach(function (l) {
            labels.push(l);
          });
        }
      }
      var blocks = [];
      set.querySelectorAll(':scope > .tabbed-content > .tabbed-block').forEach(function (b) {
        blocks.push(b);
      });
      tabbedSets.push({ el: set, labels: labels, blocks: blocks });
    });

    metas.forEach(function (meta) {
      var versions;
      try { versions = JSON.parse(meta.getAttribute('data-versions')); }
      catch (e) { versions = []; }

      var cls = classify(versions);

      // Determine context: is this meta inside a tabbed-block?
      var block = meta.closest('.tabbed-block');
      if (block) {
        // Find the parent tabbed-set and mark the corresponding label
        for (var i = 0; i < tabbedSets.length; i++) {
          var ts = tabbedSets[i];
          var idx = ts.blocks.indexOf(block);
          if (idx >= 0 && idx < ts.labels.length) {
            applyClass(ts.labels[idx], cls);
            break;
          }
        }
      }

      // Also check if there's a heading directly before this meta
      var prev = meta.previousElementSibling;
      // Walk past version badge paragraphs
      while (prev && prev.tagName === 'P') {
        prev = prev.previousElementSibling;
      }
      if (prev && /^H[1-6]$/.test(prev.tagName)) {
        applyClass(prev, cls);
      }
    });
  }

  function applyClass(el, cls) {
    el.classList.remove('ub-version-match', 'ub-version-mismatch');
    if (cls === 'match') el.classList.add('ub-version-match');
    else if (cls === 'mismatch') el.classList.add('ub-version-mismatch');
  }

  function clearHighlights() {
    document.querySelectorAll('.ub-version-match, .ub-version-mismatch').forEach(function (el) {
      el.classList.remove('ub-version-match', 'ub-version-mismatch');
    });
  }

  /* ══════════════════════════════════════════════════════════════
     Public API — consumed by settings-modal and grimoire-filter
     ══════════════════════════════════════════════════════════════ */
  window.__ubVersionFilter = {
    getState: function () { return filterState; },
    setState: function (newState) {
      filterState = {
        include: Array.isArray(newState.include) ? newState.include : [],
        exclude: Array.isArray(newState.exclude) ? newState.exclude : []
      };
      saveState();
      broadcast();
      apply();
    },
    classify: classify,
    isActive: isActive,
    apply: apply
  };

  function broadcast() {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, {
      detail: { include: filterState.include, exclude: filterState.exclude }
    }));
  }

  function apply() {
    clearHighlights();
    if (isActive()) highlightPage();
  }

  /* ══════════════════════════════════════════════════════════════
     Bootstrap
     ══════════════════════════════════════════════════════════════ */
  function boot() {
    loadState();
    apply();
  }

  if (typeof document$ !== 'undefined') {
    document$.subscribe(function () { boot(); });
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Re-apply when storage is enabled/disabled
  window.addEventListener('storage-toggle', function (e) {
    if (e.detail && e.detail.enabled) {
      saveState();
    } else {
      loadState();
      apply();
    }
  });
})();
