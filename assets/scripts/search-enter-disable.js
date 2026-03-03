/*
 * search-enter-fix.js
 * Fixes Material theme bug where pressing Enter in search corrupts the dialog's
 * visibility state by intercepting the keydown event.
 * 
 * Instead of completely killing the Enter key (which felt unresponsive), 
 * this script intercepts it, prevents the bug, and automatically simulates 
 * "I'm Feeling Lucky" by clicking the VERY FIRST available search result
 * while explicitly closing the search overlay.
 */
(function() {
  'use strict';

  function fixSearchEnter() {
    const searchInput = document.querySelector('.md-search__input');
    const searchToggle = document.getElementById('__search');
    if (!searchInput) return;

    // Use capture phase so we get the event BEFORE Material's internal listeners
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        // Prevent Material from submitting the invisible form and breaking state
        e.preventDefault();
        e.stopPropagation();

        // Find the first actual article result (skipping suggestions if present)
        const firstResult = document.querySelector('.md-search-result__link');
        
        // Explicitly tear down the search UI state
        searchInput.blur();
        if (searchToggle) {
          searchToggle.checked = false;
        }

        if (firstResult && firstResult.href) {
          // If a result exists, navigate to it!
          firstResult.click();
        }
      }
    }, true);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixSearchEnter);
  } else {
    fixSearchEnter();
  }
})();
