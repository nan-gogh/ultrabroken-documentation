/*
 * search-enter-fix.js
 * Disables Enter key on search input to prevent triggering results without clicking.
 * This avoids the Material search dialog state bug that occurs when pressing Enter.
 */
(function() {
  'use strict';

  function disableSearchEnter() {
    const searchInput = document.querySelector('.md-search__input');
    if (!searchInput) return;

    searchInput.addEventListener('keydown', function(e) {
      // Prevent Enter key from doing anything
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', disableSearchEnter);
  } else {
    disableSearchEnter();
  }
})();
