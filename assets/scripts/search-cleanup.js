/*
 * search-cleanup.js
 * Sophisticated solution for clearing search highlighting when search is cleared.
 * Integrates with MkDocs Material's search system and instant navigation.
 */
(function() {
  'use strict';

  // Clear highlight parameter from URL immediately (before Material processes it)
  function clearHighlightFromURL() {
    const url = new URL(window.location.href);
    if (url.searchParams.has('h')) {
      url.searchParams.delete('h');
      history.replaceState(null, '', url.toString());
      return true;
    }
    return false;
  }

  // Remove all highlighting marks from the page
  function removeHighlighting() {
    document.querySelectorAll('mark').forEach(mark => {
      const text = mark.textContent;
      mark.replaceWith(text);
    });
  }

  // Main cleanup function
  function cleanupSearch() {
    clearHighlightFromURL();
    removeHighlighting();
  }

  // Set up monitoring of search input
  function monitorSearchInput() {
    const searchInput = document.querySelector('.md-search__input');
    if (searchInput) {
      // Listen for input changes
      searchInput.addEventListener('input', function(e) {
        if (this.value.trim() === '') {
          cleanupSearch();
        }
      });

      // Listen for search dialog close
      const searchToggle = document.querySelector('[data-md-toggle="search"]');
      if (searchToggle) {
        searchToggle.addEventListener('change', function() {
          if (!this.checked && searchInput.value.trim() === '') {
            cleanupSearch();
          }
        });
      }
    }
  }

  // Watch for marks being added and remove them if search is empty
  function watchForMarks() {
    const observer = new MutationObserver(() => {
      const searchInput = document.querySelector('.md-search__input');
      if (!searchInput || searchInput.value.trim() === '') {
        removeHighlighting();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Initialize on page load
  function init() {
    // Clear URL parameter IMMEDIATELY on load
    clearHighlightFromURL();

    // Small delay to let DOM settle, then remove any marks
    setTimeout(() => {
      removeHighlighting();
      monitorSearchInput();
      watchForMarks();
    }, 0);
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
