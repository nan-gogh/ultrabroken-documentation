/**
 * back-to-top.js — Custom scroll-to-top button
 * ────────────────────────────────────────────
 * Creates and manages a custom back-to-top button that appears
 * when the user scrolls down the page. Clicking it smoothly
 * scrolls back to the top.
 *
 * Uses the back-to-top icon SVG for consistency with the theme.
 */
(function () {
  'use strict';

  var button = null;
  var isVisible = false;

  /**
   * Create the back-to-top button element
   */
  function createButton() {
    var btn = document.createElement('button');
    btn.className = 'ub-back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.setAttribute('type', 'button');
    
    btn.addEventListener('click', scrollToTop);
    return btn;
  }

  /**
   * Smooth scroll to top
   */
  function scrollToTop(e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Update button visibility based on scroll position
   */
  function updateButtonVisibility() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var shouldBeVisible = scrollTop > 300; // Show after scrolling 300px

    if (shouldBeVisible && !isVisible) {
      button.classList.add('visible');
      isVisible = true;
    } else if (!shouldBeVisible && isVisible) {
      button.classList.remove('visible');
      isVisible = false;
    }
  }

  /**
   * Inject the button into the page
   */
  function inject() {
    if (!button) {
      button = createButton();
      document.body.appendChild(button);
    }
    updateButtonVisibility();
  }

  /**
   * Bootstrap — inject on page load
   */
  function boot() {
    inject();
    window.addEventListener('scroll', updateButtonVisibility);
    window.addEventListener('resize', updateButtonVisibility);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
