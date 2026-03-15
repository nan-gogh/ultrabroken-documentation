/**
 * Social Card Copy
 * Wraps page-action buttons (edit / view source) into a flex row and
 * appends a copy-card button.
 * Reads the card URL from body[data-ub-social-card] (injected by social_cards.py).
 */
(function () {
  function init() {
    var article = document.querySelector('.md-content__inner');
    if (!article) return;

    // Don't double-inject
    if (article.querySelector('.ub-page-actions')) return;

    var actions = article.querySelectorAll('.md-content__button');
    if (!actions.length) return;

    // Wrap existing buttons into a flex container
    var row = document.createElement('div');
    row.className = 'ub-page-actions';
    actions[0].parentNode.insertBefore(row, actions[0]);
    for (var i = 0; i < actions.length; i++) {
      row.appendChild(actions[i]);
    }

    // Add card-copy button if this page has a social card
    var url = document.body.getAttribute('data-ub-social-card');
    if (url) {
      var btn = document.createElement('button');
      btn.className = 'md-content__button md-icon ub-card-copy';
      btn.type = 'button';
      btn.title = 'Copy social card URL';
      btn.setAttribute('aria-label', 'Copy social card URL');
      btn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
          '<path d="M21 3H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m0 16H3V5h18zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5z"/>' +
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
      row.appendChild(btn);
    }
  }

  // Run on initial load and on instant-navigation page switches
  document.addEventListener('DOMContentLoaded', init);
  if (typeof document$ !== 'undefined') {
    document$.subscribe(init);
  }
})();
