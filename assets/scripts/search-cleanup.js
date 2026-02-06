/*
 * search-cleanup.js
 * Clears search highlighting when search is emptied or dialog closes.
 * Minimal interference with Material's search state management.
 */
(function() {
  'use strict';

  // Clear highlight parameter from URL
  function clearHighlightFromURL() {
    const url = new URL(window.location.href);
    if (url.searchParams.has('h')) {
      url.searchParams.delete('h');
      history.replaceState(null, '', url.toString());
    }
  }

  // Remove all highlighting marks
  function removeHighlighting() {
    document.querySelectorAll('mark').forEach(mark => {
      const text = mark.textContent;
      mark.replaceWith(text);
    });
  }

  // Clean up marks when search is cleared
  function cleanupSearch() {
    clearHighlightFromURL();
    removeHighlighting();
  }

  // Initialize
  function init() {
    // Clear URL parameter immediately on page load
    clearHighlightFromURL();
    removeHighlighting();

    // Monitor search input for user clearing it
    const searchInput = document.querySelector('.md-search__input');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        if (this.value.trim() === '') {
          removeHighlighting();
        }
      });
    }

    // Clean up when search dialog closes and search is empty
    const searchToggle = document.querySelector('[data-md-toggle="search"]');
    if (searchToggle) {
      searchToggle.addEventListener('change', function() {
        // If dialog is closing (unchecked)
        if (!this.checked) {
          const input = document.querySelector('.md-search__input');
          if (input && input.value.trim() === '') {
            cleanupSearch();
          }
        }
      });
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
