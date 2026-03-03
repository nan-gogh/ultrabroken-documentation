/*
 * search-enter-fix.js
 * Fixes Material theme bug where pressing Enter in search corrupts the dialog's
 * visibility state. By intercepting the form's 'submit' event instead of 'keydown', 
 * we allow users to still use Enter to select search results from the dropdown,
 * while preventing the empty "Enter" press from breaking the search bar state.
 */
(function() {
  'use strict';

  function fixSearchEnter() {
    const searchForm = document.querySelector('.md-search__form');
    const searchInput = document.querySelector('.md-search__input');
    
    if (!searchForm || !searchInput) return;

    searchForm.addEventListener('submit', function(e) {
      // Prevent the browser form submission which causes the state corruption
      e.preventDefault();
      
      // Blur and refocus to safely reset Material's internal focus state machine
      searchInput.blur();
      requestAnimationFrame(() => {
        searchInput.focus();
      });
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixSearchEnter);
  } else {
    fixSearchEnter();
  }
})();
