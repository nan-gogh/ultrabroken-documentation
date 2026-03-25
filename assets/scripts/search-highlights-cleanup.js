/*
 * search-cleanup.js
 * Sophisticated solution for clearing search highlighting when search is cleared.
 * Integrates with MkDocs Material's search system and instant navigation.
 */
(function() {
  'use strict';

  // Clear highlight parameter from URL immediately (before Material processes it).
  // Uses regex instead of URLSearchParams.toString() to avoid corrupting the
  // cosmetic slug (e.g. ?Despawn-Interrupt) which has no '=' sign —
  // URLSearchParams normalizes it to "Despawn-Interrupt=" which is unwanted.
  function clearHighlightFromURL() {
    var search = window.location.search;
    if (!search || search.indexOf('h=') === -1) return false;
    // Remove &h=... or the leading ?h=...& or a lone ?h=...
    var cleaned = search
      .replace(/[&?]h=[^&]*/g, '')
      .replace(/[&?]q=[^&]*/g, '');
    // Restore leading '?' if params remain, otherwise drop query string entirely
    if (cleaned && cleaned.charAt(0) !== '?') cleaned = '?' + cleaned;
    if (cleaned === '?') cleaned = '';
    // Reattach the cosmetic slug prefix if it was stripped
    var newUrl = window.location.pathname + cleaned + window.location.hash;
    if (newUrl !== window.location.pathname + search + window.location.hash) {
      history.replaceState(null, '', newUrl);
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
