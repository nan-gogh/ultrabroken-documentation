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

      // Let Material handle the navigation first
      setTimeout(() => {
        // After navigation, reset search state so dialog works properly again
        const searchToggle = document.querySelector('[data-md-toggle="search"]');
        if (searchToggle && searchToggle.checked) {
          // Force dialog state reset by unchecking and rechecking
          searchToggle.checked = false;
          // Trigger change event to notify Material
          searchToggle.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, 50);
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixSearchEnterState);
  } else {
    fixSearchEnterState();
  }
})();
