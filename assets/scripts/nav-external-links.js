// Mark external nav links for new-tab opening.
// Only targets links whose href points outside the current site.
// The tabs-item.html template override handles tab links at build time;
// this script catches the mobile drawer (.md-nav__link) at runtime.
function markExternalNavLinks() {
  document.querySelectorAll('.md-tabs__link, .md-nav__link').forEach(function (a) {
    try {
      var u = new URL(a.href, location.href);
      // Only mark truly external links (different origin, or absolute URL to another site)
      if (u.origin !== location.origin) {
        a.setAttribute('data-external', '');
        a.target = '_blank';
        a.rel = 'noopener';
      }
    } catch (_) {}
  });
}
if (typeof document$ !== 'undefined') {
  document$.subscribe(markExternalNavLinks);
} else {
  document.addEventListener('DOMContentLoaded', markExternalNavLinks);
}
