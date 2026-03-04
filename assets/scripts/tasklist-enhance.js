/**
 * Tasklist Click Enhancement
 * 
 * Makes entire task-list item clickable to toggle its checkbox,
 * not just the checkbox itself. Uses event capture to intercept
 * clicks early and avoid interfering with inner interactive elements.
 */

(function() {
  'use strict';

  function enhanceTasklistClickable() {
    try {
      // Click handler (capture) to run early and avoid interfering with inner interactive elements
      document.body.addEventListener('click', function (ev) {
        const li = ev.target.closest && ev.target.closest('li.task-list-item, li.task-list');
        if (!li) return;
        
        // If the click target is an interactive element, skip (allow native behavior)
        const interactive = ev.target.closest && ev.target.closest('a, button, input, textarea, select, label');
        if (interactive && interactive !== li) return;

        // Only proceed if click is on text or text-containing inline elements
        // Skip clicks on empty space or non-text child elements
        if (ev.target !== li) {
          // Allow clicks on common inline text elements (span, strong, em, code, etc.)
          const textInlineElements = ['SPAN', 'STRONG', 'EM', 'CODE', 'I', 'B', 'MARK', 'SUB', 'SUP'];
          if (!textInlineElements.includes(ev.target.tagName)) {
            return; // Skip clicks on other elements
          }
        }

        const checkbox = li.querySelector('input[type="checkbox"]');
        if (!checkbox) return;
        if (checkbox.disabled) return;

        ev.preventDefault();
        ev.stopPropagation();

        // Toggle and emit events so other listeners react
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('input', { bubbles: true }));
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      }, true);
    } catch (e) {}
  }

  try { enhanceTasklistClickable(); } catch (e) {}
})();
