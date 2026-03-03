/*
 * search-enter-navigate.js
 * Fixes Material theme bug where pressing Enter in search corrupts the dialog's
 * visibility state by intercepting the keydown event.
 * 
 * When Enter is pressed, this script:
 * 1. Prevents the Material form submission that causes the bug
 * 2. Closes the search overlay (unchecks the __search toggle)
 * 3. Blurs the search input
 * 4. Navigates to the first search result ("I'm Feeling Lucky" behavior)
 */
(function() {
  'use strict';

  function handleSearchEnter() {
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
          // Navigate to the first result ("I'm Feeling Lucky" behavior)
          firstResult.click();
        }
      }
    }, true);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleSearchEnter);
  } else {
    handleSearchEnter();
  }
})();
