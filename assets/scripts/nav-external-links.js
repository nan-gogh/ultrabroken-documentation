// Open external links in navigation tabs/drawer in a new tab.
// Material's instant-loading intercepts clicks before target="_blank" takes
// effect, so we capture the click ourselves and use window.open().
document.addEventListener('click', function (e) {
  var a = e.target.closest('.md-tabs__link, .md-nav__link');
  if (!a) return;
  try {
    var url = new URL(a.href, location.href);
    if (url.hostname !== location.hostname) {
      e.preventDefault();
      e.stopPropagation();
      window.open(a.href, '_blank', 'noopener');
    }
  } catch (_) {}
}, true);
