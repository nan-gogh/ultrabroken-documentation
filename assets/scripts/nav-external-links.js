// Open external links in the navigation tabs in a new tab
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.md-tabs__link, .md-nav__link').forEach(function (a) {
    if (a.hostname && a.hostname !== location.hostname) {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    }
  });
});
