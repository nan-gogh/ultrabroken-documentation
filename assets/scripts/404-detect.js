(function(){
  function is404Content() {
    // Path-based check
    if (window.location.pathname && window.location.pathname.toLowerCase().indexOf('404') !== -1) return true;

    // Title check
    if (document.title && /404|not found|page not found/i.test(document.title)) return true;

    // Heading check (common theme markup)
    const h = document.querySelector('.md-content h1, .md-content h2, .md-content h3');
    if (h && /404|not found|page not found/i.test(h.textContent)) return true;

    return false;
  }

  function showFancy404() {
    if (document.body.dataset.fancy404Shown) return;
    document.body.dataset.fancy404Shown = '1';

    const container = document.createElement('div');
    container.className = 'fancy-404-banner';
    container.innerHTML = `
      <div class="fancy-404-inner">
        <div class="fancy-404-emoji">🛸</div>
        <div class="fancy-404-text">
          <h2>Page lost in the Warp</h2>
          <p>Looks like this page doesn't exist — try the search or return home.</p>
        </div>
        <div class="fancy-404-actions">
          <a class="md-button md-button--primary" href="/">Home</a>
          <button class="md-button" id="fancy-404-search">Search</button>
        </div>
      </div>
    `;

    const main = document.querySelector('.md-main') || document.body;
    main.insertBefore(container, main.firstChild);

    document.getElementById('fancy-404-search').addEventListener('click', function(){
      const searchToggle = document.querySelector('label.md-header__button[for="__search"]');
      if (searchToggle) searchToggle.click();
    });
  }

  function removeFancy404() {
    const el = document.querySelector('.fancy-404-banner');
    if (el) el.remove();
    delete document.body.dataset.fancy404Shown;
  }

  function checkAndToggle() {
    if (is404Content()) showFancy404(); else removeFancy404();
  }

  // Run on initial load
  document.addEventListener('DOMContentLoaded', checkAndToggle);

  // Handle instant navigation: observe content changes
  const content = document.querySelector('.md-content') || document.body;
  const observer = new MutationObserver(function(){ checkAndToggle(); });
  observer.observe(content, { childList: true, subtree: true });
})();
