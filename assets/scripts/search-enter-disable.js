/*
 * search-enter-fix.js
 * Fixes Material theme bug where pressing Enter in search corrupts the dialog's
 * visibility state (clicking into it no longer expands it until you click away first).
 * 
 * Instead of blocking Enter entirely, we let it fire but immediately blur+refocus
 * the input to reset Material's internal state machine.
 */
(function() {
  'use strict';

  function fixSearchEnter() {
    const searchInput = document.querySelector('.md-search__input');
    if (!searchInput) return;

    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        
        // Blur and refocus to reset Material's state machine
        // The microtask delay ensures the state corruption is avoided
        const input = this;
        input.blur();
        requestAnimationFrame(() => {
          input.focus();
        });
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixSearchEnter);
  } else {
    fixSearchEnter();
  }
})();
