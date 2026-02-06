/*
 * search-enter-fix.js
 * Fixes Material's search dialog state when Enter is pressed instead of clicking a result.
 * When user presses Enter, Material navigates to the first result but doesn't reset dialog state.
 */
(function() {
  'use strict';

  function fixSearchEnterState() {
    const searchInput = document.querySelector('.md-search__input');
    if (!searchInput) return;

    searchInput.addEventListener('keydown', function(e) {
      // Only handle Enter key
      if (e.key !== 'Enter') return;

      // After material handles the navigation, reset the search box and dialog
      setTimeout(() => {
        // Clear the search input entirely
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Try to close the search dialog
        const searchToggle = document.querySelector('[data-md-toggle="search"]');
        if (searchToggle && searchToggle.checked) {
          // Uncheck to close dialog
          searchToggle.checked = false;
          searchToggle.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, 100);
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixSearchEnterState);
  } else {
    fixSearchEnterState();
  }
})();
