/**
 * Social Card Copy
 * Appends a copy-card button to the .ub-page-actions row
 * (created by the content.html template override).
 * Derives the card URL from the .ub-page-uid element (inside <main>,
 * refreshed on every instant-navigation page switch).
 */
(function () {
  var _iconUrl = window.__ub_base + 'assets/images/icons/card-icon.svg';
  var _mediaBase = 'https://ultrabroken-media.gl1tchcr4vt.workers.dev/social/';

  function init() {
    var row = document.querySelector('.ub-page-actions');
    if (!row) return;

    // Don't double-inject
    if (row.querySelector('.ub-card-copy')) return;

    var uidEl = row.querySelector('.ub-page-uid');
    if (!uidEl) return;
    var uid = uidEl.textContent.trim();
    if (!uid) return;
    var cardUrl = _mediaBase + uid + '.png';

    var btn = document.createElement('button');
    btn.className = 'md-content__button md-icon ub-card-copy';
    btn.type = 'button';
    btn.title = 'Copy social card URL';
    btn.setAttribute('aria-label', 'Copy social card URL');
    // Load icon from external SVG so it can be customized
    fetch(_iconUrl)
      .then(function (r) { return r.ok ? r.text() : ''; })
      .then(function (svg) { if (svg) btn.innerHTML = svg; });
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      navigator.clipboard.writeText(cardUrl).then(function () {
        btn.classList.add('ub-card-copy--ok');
        try { showCopiedToast('Card URL copied'); } catch (_) {}
        setTimeout(function () { btn.classList.remove('ub-card-copy--ok'); }, 1400);
      }).catch(function () {
        try { showCopiedToast('Copy failed'); } catch (_) {}
      });
    });
    // Insert before UID badge so card icon sits left of UID
    var uid = row.querySelector('.ub-page-uid');
    if (uid) {
      row.insertBefore(btn, uid);
    } else {
      row.appendChild(btn);
    }
  }

  // Run on initial load and on instant-navigation page switches
  document.addEventListener('DOMContentLoaded', init);
  if (typeof document$ !== 'undefined') {
    document$.subscribe(init);
  }
})();
