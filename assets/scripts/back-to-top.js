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
  var footerHeight = 0;
  var MARGIN = 12;

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
   * Update button visibility and position based on scroll.
   * Nudges the button above the footer when near the bottom.
   */
  function updateButtonVisibility() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var shouldBeVisible = scrollTop > 300;

    if (shouldBeVisible && !isVisible) {
      button.classList.add('visible');
      isVisible = true;
    } else if (!shouldBeVisible && isVisible) {
      button.classList.remove('visible');
      isVisible = false;
    }

    var nearBottom = scrollTop + window.innerHeight >= document.documentElement.scrollHeight - footerHeight;
    button.classList.toggle('above-footer', nearBottom);
  }

  /**
   * Measure footer height (changes on resize / orientation)
   */
  function measureFooter() {
    var footer = document.querySelector('.md-footer');
    footerHeight = footer ? footer.offsetHeight : 0;
    if (button) {
      button.style.setProperty('--footer-offset', (footerHeight + MARGIN) + 'px');
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
    measureFooter();
    window.addEventListener('scroll', updateButtonVisibility);
    window.addEventListener('resize', function () {
      measureFooter();
      updateButtonVisibility();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
