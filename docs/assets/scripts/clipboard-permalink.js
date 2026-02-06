/**
 * Clipboard Permalink Script
 * Click any heading to copy its permalink to clipboard
 * Uses event delegation for instant navigation compatibility
 */

(function() {
  // Use event delegation - attach ONE listener that works for all headings, 
  // present and future (handles instant navigation automatically)
  document.addEventListener('click', function(e) {
    // Check if the clicked element is a heading within .md-content
    const heading = e.target.closest('.md-content h1, .md-content h2, .md-content h3, .md-content h4, .md-content h5, .md-content h6');
    
    if (heading && heading.id) {
      const id = heading.id;
      const permalink = window.location.href.split('#')[0] + '#' + id;
      
      navigator.clipboard.writeText(permalink).then(() => {
        // Show brief visual feedback
        const originalText = heading.textContent;
        const originalColor = heading.style.color;
        
        heading.textContent = '✓ Copied!';
        heading.style.color = 'var(--md-accent-fg-color)';
        
        setTimeout(() => {
          heading.textContent = originalText;
          heading.style.color = originalColor;
        }, 1500);
      }).catch(err => {
        console.error('Failed to copy permalink:', err);
      });
    }
  });
})();
