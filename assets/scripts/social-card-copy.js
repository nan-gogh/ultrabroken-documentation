/**
 * Social Card Copy
 * Adds a subtle copy-card button to pages that have a social card.
 * Reads the card URL from body[data-ub-social-card] (injected by social_cards.py).
 */
(function () {
  function init() {
    var url = document.body.getAttribute('data-ub-social-card');
    if (!url) return;

    // Find the page's h1 inside .md-content
    var h1 = document.querySelector('.md-content h1');
    if (!h1) return;

    // Don't double-inject
    if (h1.querySelector('.ub-card-copy')) return;

    var btn = document.createElement('button');
    btn.className = 'ub-card-copy';
    btn.type = 'button';
    btn.title = 'Copy social card URL';
    btn.setAttribute('aria-label', 'Copy social card URL');

    // Inline SVG — small image/photo icon (16×16)
    btn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">' +
        '<rect x="1.5" y="3" width="13" height="10" rx="1.5"/>' +
        '<circle cx="5.5" cy="6.5" r="1.25"/>' +
        '<path d="M1.5 11l3-3 2.5 2.5L10 8l4.5 4.5"/>' +
      '</svg>';

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      navigator.clipboard.writeText(url).then(function () {
        btn.classList.add('ub-card-copy--ok');
        try { showCopiedToast('Card URL copied'); } catch (_) {}
        setTimeout(function () { btn.classList.remove('ub-card-copy--ok'); }, 1400);
      }).catch(function () {
        try { showCopiedToast('Copy failed'); } catch (_) {}
      });
    });

    h1.appendChild(btn);
  }

  // Run on initial load and on instant-navigation page switches
  document.addEventListener('DOMContentLoaded', init);
  if (typeof document$ !== 'undefined') {
    document$.subscribe(init);
  }
})();
