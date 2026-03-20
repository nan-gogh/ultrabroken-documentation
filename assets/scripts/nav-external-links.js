// Mark external nav links for new-tab opening.
// Checks the raw href attribute for absolute URLs (http:// or https://).
// This catches same-origin cross-repo links (e.g. ultrabroken-media on the
// same GitHub Pages domain) that Material's instant navigation would otherwise
// intercept as internal SPA navigations.
function markExternalNavLinks() {
  document.querySelectorAll('.md-tabs__link, .md-nav__link').forEach(function (a) {
    var raw = a.getAttribute('href') || '';
    if (/^https?:\/\//i.test(raw)) {
      a.setAttribute('data-external', '');
      a.target = '_blank';
      a.rel = 'noopener';
    }
  });
}
if (typeof document$ !== 'undefined') {
  document$.subscribe(markExternalNavLinks);
} else {
  document.addEventListener('DOMContentLoaded', markExternalNavLinks);
}
