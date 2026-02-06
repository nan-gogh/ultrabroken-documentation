/*
 * search-cleanup.js
 * Sophisticated solution for clearing search highlighting when search is cleared.
 * Integrates with MkDocs Material's search system and instant navigation.
 */
(function() {
  'use strict';

  // Remove all highlighting marks from the page
  function removeHighlighting() {
    document.querySelectorAll('mark[data-md-highlight]').forEach(mark => {
      const text = mark.textContent;
      mark.replaceWith(text);
    });
  }

  // Clear highlight parameter from URL without triggering navigation
  function clearHighlightFromURL() {
    const url = new URL(window.location.href);
    if (url.searchParams.has('h')) {
      url.searchParams.delete('h');
      // Use replaceState to update URL without triggering navigation
      history.replaceState(null, '', url.toString());
    }
  }

  // Main cleanup function
  function cleanupSearch() {
    removeHighlighting();
    clearHighlightFromURL();
  }

  // Set up monitoring of search input
  function monitorSearchInput() {
    // Wait for search input to be available
    const checkInterval = setInterval(() => {
      const searchInput = document.querySelector('.md-search__input');
      if (searchInput) {
        clearInterval(checkInterval);
        
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
    }, 100);

    // Stop checking after 5 seconds
    setTimeout(() => clearInterval(checkInterval), 5000);
  }

  // Handle instant navigation
  function setupInstantNavHandler() {
    // Listen for Material's instant navigation events
    document$.subscribe(() => {
      monitorSearchInput();
    });
  }

  // Initialize on page load
  function init() {
    // Clean up on initial load if search is empty
    const searchInput = document.querySelector('.md-search__input');
    if (searchInput && searchInput.value.trim() === '') {
      cleanupSearch();
    }

    monitorSearchInput();

    // Try to hook into Material's document$ observable if available
    if (typeof document$ !== 'undefined') {
      setupInstantNavHandler();
    } else {
      // Fallback: use MutationObserver for instant navigation
      const observer = new MutationObserver(() => {
        monitorSearchInput();
      });
      observer.observe(document.body, { 
        childList: true, 
        subtree: false 
      });
    }
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
