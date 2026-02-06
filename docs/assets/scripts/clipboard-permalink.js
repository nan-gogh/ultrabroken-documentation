/**
 * Clipboard Permalink Script
 * Click any heading to copy its permalink to clipboard
 * Works with MkDocs instant navigation via MutationObserver
 */

function attachPermalinkListeners() {
  const headings = document.querySelectorAll(
    '.md-content h1, ' +
    '.md-content h2, ' +
    '.md-content h3, ' +
    '.md-content h4, ' +
    '.md-content h5, ' +
    '.md-content h6'
  );
  
  headings.forEach(heading => {
    // Skip if already attached
    if (heading.dataset.permalinkAttached === 'true') return;
    
    heading.style.cursor = 'pointer';
    heading.title = 'Click to copy permalink';
    heading.dataset.permalinkAttached = 'true';
    
    heading.addEventListener('click', function(e) {
      const id = heading.id;
      if (id) {
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
  });
}

// Attach on initial load
document.addEventListener('DOMContentLoaded', function() {
  attachPermalinkListeners();
  
  // Watch for content changes (handles MkDocs instant navigation)
  const contentContainer = document.querySelector('.md-content');
  if (contentContainer) {
    const observer = new MutationObserver(function(mutations) {
      // Check if headings were added or content structure changed
      const hasContentChange = mutations.some(mutation => 
        mutation.addedNodes.length > 0 || 
        mutation.removedNodes.length > 0
      );
      if (hasContentChange) {
        attachPermalinkListeners();
      }
    });
    
    observer.observe(contentContainer, {
      childList: true,
      subtree: true
    });
  }
});
