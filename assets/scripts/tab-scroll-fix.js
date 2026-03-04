/**
 * Tab Scroll Overshoot Fix
 * 
 * Material's default tab scroll buttons scroll by the full container width,
 * which causes overshooting when near the scroll boundaries. This script
 * intercepts button clicks and clamps the scroll distance to prevent
 * scrolling past the limits.
 */
(function() {
  'use strict';

  document.addEventListener('click', function(e) {
    // Check if click was on a tab scroll button
    const button = e.target.closest('.tabbed-button');
    if (!button) return;

    const control = button.closest('.tabbed-control');
    if (!control) return;

    // Determine direction: prev (-1) or next (+1)
    const isPrev = control.classList.contains('tabbed-control--prev');
    const direction = isPrev ? -1 : 1;

    // Find the tabbed-labels container (sibling of controls)
    const tabbedSet = control.closest('.tabbed-set');
    if (!tabbedSet) return;

    const labels = tabbedSet.querySelector('.tabbed-labels');
    if (!labels) return;

    // Prevent Material's default handler
    e.stopPropagation();
    e.preventDefault();

    // Calculate scroll limits
    const currentScroll = labels.scrollLeft;
    const maxScroll = labels.scrollWidth - labels.clientWidth;
    const containerWidth = labels.clientWidth;

    let scrollAmount;
    if (direction === -1) {
      // Scrolling left: don't go below 0
      scrollAmount = Math.min(containerWidth, currentScroll);
    } else {
      // Scrolling right: don't go past maxScroll
      const remainingScroll = maxScroll - currentScroll;
      scrollAmount = Math.min(containerWidth, remainingScroll);
    }

    // Only scroll if there's actually distance to travel
    if (scrollAmount > 0) {
      labels.scrollBy({
        left: scrollAmount * direction,
        behavior: 'smooth'
      });
    }
  }, true); // Use capture phase to intercept before Material's handler
})();
