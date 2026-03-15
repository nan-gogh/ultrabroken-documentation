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

    var scriptEl = document.currentScript || document.querySelector('script[src*="social-card-copy.js"]');
    var siteRoot = (scriptEl && scriptEl.src)
      ? scriptEl.src.replace(/assets\/scripts\/[^/]+$/, '')
      : location.href.replace(/\/[^/]*$/, '/');
    var img = document.createElement('img');
    img.src = siteRoot + 'assets/images/icons/social-card-icon.svg';
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    btn.appendChild(img);

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
