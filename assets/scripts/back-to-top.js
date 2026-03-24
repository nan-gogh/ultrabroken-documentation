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

  // Configuration
  var FOOTER_SWITCH_NUDGE = 0; // extra px to shift swap point (positive = earlier, negative = later)

  var fixedBtn = null;
  var footerBtn = null;
  var isVisible = false;
  var wasNearBottom = false;
  var footerHeight = 0;
  // Swap offset = fixed button CSS bottom (1.5rem=24px) minus footer button margin-bottom (0.75rem=12px)
  var SWAP_OFFSET = 12;

  /**
   * Create the back-to-top button element
   */
  function createButton(className) {
    var btn = document.createElement('button');
    btn.className = className;
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
   * Update button visibility based on scroll position.
   * Crossfades between the fixed button and the footer-anchored button.
   */
  function updateButtonVisibility() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var shouldBeVisible = scrollTop > 300;

    // Switch when the footer button would be at the same position as the fixed button.
    // Both buttons align when: scrollTop + innerHeight == scrollHeight - footerHeight + swapOffset
    var nearBottom = scrollTop + window.innerHeight >=
      document.documentElement.scrollHeight - footerHeight + SWAP_OFFSET + FOOTER_SWITCH_NUDGE;

    var visibilityChanged = shouldBeVisible !== isVisible;
    var nearBottomChanged = nearBottom !== wasNearBottom;

    isVisible = shouldBeVisible;
    wasNearBottom = nearBottom;

    // Suppress the fixed button's fade transition when only swapping
    // between fixed/footer (button already visible) — instant positional swap.
    // Keep the fade only for true appear/disappear (isVisible changing).
    if (!visibilityChanged && nearBottomChanged) {
      fixedBtn.classList.add('ub-no-transition');
    } else {
      fixedBtn.classList.remove('ub-no-transition');
    }

    // Fixed button: visible when scrolled down AND not near footer
    fixedBtn.classList.toggle('visible', isVisible && !nearBottom);
    // Footer button: visible when scrolled down AND near footer
    footerBtn.classList.toggle('visible', isVisible && nearBottom);
  }

  /**
   * Cache footer height (recalculated on resize)
   */
  function measureFooter() {
    var footer = document.querySelector('.md-footer');
    footerHeight = footer ? footer.offsetHeight : 0;
  }

  /**
   * Inject the button into the page
   */
  function inject() {
    if (!fixedBtn) {
      fixedBtn = createButton('ub-back-to-top');
      document.body.appendChild(fixedBtn);
    }
    if (!footerBtn) {
      var footer = document.querySelector('.md-footer');
      if (footer) {
        footerBtn = createButton('ub-back-to-top ub-back-to-top--footer');
        footer.insertBefore(footerBtn, footer.firstChild);
      }
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
