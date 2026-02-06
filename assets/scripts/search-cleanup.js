/*
 * search-cleanup.js
 * Clears search highlighting when the search input is emptied
 * or when instant navigation occurs. Also clears search on page refresh.
 */
(function() {
  function removeSearchHighlighting() {
    // Remove all <mark> tags (standard Material search highlight)
    const marks = document.querySelectorAll('mark');
    marks.forEach(mark => {
      const parent = mark.parentNode;
      while (mark.firstChild) {
        parent.insertBefore(mark.firstChild, mark);
      }
      parent.removeChild(mark);
    });

    // Also remove any search-highlight classes that might be applied
    const highlighted = document.querySelectorAll('[class*="search-highlight"], [class*="highlight"]');
    highlighted.forEach(el => {
      el.classList.remove('search-highlight', 'highlight');
    });
  }

  // Clear search input on page load/refresh
  function clearSearchOnLoad() {
    const searchInput = document.querySelector('.md-search__input');
    if (searchInput) {
      searchInput.value = '';
      removeSearchHighlighting();
    }
  }

  // Monitor search input for clearing
  function setupSearchListener() {
    const searchInput = document.querySelector('.md-search__input');
    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
      // If search input is empty, remove highlighting
      if (this.value.trim() === '') {
        removeSearchHighlighting();
      }
    });
  }

  // Listen for instant navigation page transitions
  function setupInstantNavigationListener() {
    // Material instant navigation uses history.pushState
    // Listen for navigation events
    document.addEventListener('click', function(e) {
      // Check if click was on a link (navigation)
      const link = e.target.closest('a');
      if (link && link.href && !link.target && link.hostname === window.location.hostname) {
        // Small delay to ensure Material processes the navigation
        setTimeout(removeSearchHighlighting, 100);
      }
    });
  }

  // Run on page load
  clearSearchOnLoad();
  setupSearchListener();
  setupInstantNavigationListener();

  // Re-setup listeners after instant navigation (page content changes)
  const observer = new MutationObserver(function() {
    setupSearchListener();
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
