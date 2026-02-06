/*
 * 404-detect.js
 * Detects 404 / "page not found" content and toggles
 * the `ultrabroken-404` class on <body> so CSS can show
 * the question-mark overlay only on 404 pages.
 */
(function() {
  function isLikely404() {
    const title = (document.title || '').trim();
    if (/\b404\b|page not found|not found|could not find/i.test(title)) return true;

    const main = document.querySelector('.md-content');
    if (!main) return false;

    // Check primary headings for common 404 markers
    const heading = main.querySelector('h1, h2, h3');
    if (heading && /\b404\b|page not found|not found/i.test(heading.textContent)) return true;

    // Fallback: look for the phrase "page not found" inside the content
    const text = (main.textContent || '').slice(0, 400).toLowerCase();
    if (text.indexOf('page not found') !== -1) return true;

    return false;
  }

  function applyClassFor404() {
    try {
      const is404 = isLikely404();
      document.body.classList.toggle('ultrabroken-404', is404);
      // Manage a dedicated overlay element so we can position the 404 SVG freely
      if (is404) {
        ensure404Overlay();
      } else {
        remove404Overlay();
      }
    } catch (e) {
      // silent
      console.debug('404-detect error', e);
    }
  }

  function ensure404Overlay() {
    if (document.querySelector('.ultrabroken-404-overlay')) return;
    const el = document.createElement('div');
    el.className = 'ultrabroken-404-overlay';
    document.body.appendChild(el);
  }

  function remove404Overlay() {
    const el = document.querySelector('.ultrabroken-404-overlay');
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  // Run on initial load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyClassFor404);
  } else {
    applyClassFor404();
  }

  // Observe content changes (covers Material instant navigation)
  function attachObserver() {
    const target = document.querySelector('.md-content') || document.body;
    if (!target) return;

    const mo = new MutationObserver(() => {
      applyClassFor404();
    });

    mo.observe(target, { childList: true, subtree: true });

    // Also update on history navigation
    window.addEventListener('popstate', applyClassFor404);
  }

  // Attempt to attach observer once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachObserver);
  } else {
    attachObserver();
  }

  // Last-ditch: run again a little later to catch platform quirks
  setTimeout(applyClassFor404, 300);
})();
