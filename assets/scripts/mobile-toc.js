/**
 * Mobile TOC in nav drawer — injects the page's table of contents as a
 * collapsible section at the bottom of the nav drawer on small screens,
 * using Material's own checkbox expand/collapse pattern so it blends
 * with the native nav UX.
 */
(function () {
  var BREAKPOINT = 76.1875; // em — Material hides right sidebar below this

  function init() {
    if (window.matchMedia('(min-width: ' + (BREAKPOINT + 0.0625) + 'em)').matches) return;

    var tocNav = document.querySelector('.md-sidebar--secondary .md-nav--secondary');
    if (!tocNav || !tocNav.querySelector('.md-nav__list li')) return;

    var navList = document.querySelector('.md-sidebar--primary .md-nav--primary > .md-nav__list');
    if (!navList) return;

    // Build a nav item using Material's own checkbox expand/collapse pattern
    var item = document.createElement('li');
    item.className = 'md-nav__item md-nav__item--nested ub-toc-nav-item';

    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'ub-toc-nav-toggle';
    checkbox.className = 'md-nav__toggle md-toggle';

    var label = document.createElement('label');
    label.className = 'md-nav__link';
    label.setAttribute('for', 'ub-toc-nav-toggle');
    label.innerHTML = 'On this page<span class="md-nav__icon md-icon"></span>';

    var tocClone = tocNav.cloneNode(true);
    // Avoid duplicate IDs in the cloned TOC
    tocClone.querySelectorAll('[id]').forEach(function (el) { el.removeAttribute('id'); });

    item.appendChild(checkbox);
    item.appendChild(label);
    item.appendChild(tocClone);
    navList.appendChild(item);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
