// Mark external nav links for new-tab opening.
// Uses [data-external] attribute set by tabs-item.html template override.
// The window-level capture listener in main.html handles the actual interception.
function markExternalNavLinks() {
  document.querySelectorAll('.md-tabs__link, .md-nav__link').forEach(function (a) {
    try {
      var u = new URL(a.href);
      if (u.origin === location.origin && u.pathname.replace(/\/$/,'') !== location.pathname.replace(/\/$/,'').split('/').slice(0,2).join('/')) {
        // Same origin but different site path — treat as external
        a.setAttribute('data-external', '');
        a.target = '_blank';
        a.rel = 'noopener';
      } else if (u.origin !== location.origin) {
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
