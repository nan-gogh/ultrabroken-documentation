// Open external links in navigation tabs/drawer in a new tab.
// Runs on every instant-navigation page change via Material's document$ observable,
// and also via a capturing click handler as a fallback.
function markExternalNavLinks() {
  document.querySelectorAll('.md-tabs__link, .md-nav__link').forEach(function (a) {
    try {
      if (new URL(a.href).hostname !== location.hostname) {
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
document.addEventListener('click', function (e) {
  var a = e.target.closest && e.target.closest('a');
  if (!a) return;
  try {
    if (new URL(a.href).hostname !== location.hostname &&
        (a.classList.contains('md-tabs__link') || a.classList.contains('md-nav__link'))) {
      e.preventDefault();
      e.stopPropagation();
      window.open(a.href, '_blank', 'noopener');
    }
  } catch (_) {}
}, true);
}, true);
