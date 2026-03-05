/**
 * Mobile TOC button — shows a floating "TOC" button on small screens
 * for pages that aren't in the nav tree (e.g. individual glitch pages).
 * Toggles the existing md-sidebar--secondary into view.
 */
(function () {
  var BREAKPOINT = 76.1875; // em — Material hides right sidebar below this

  function shouldActivate() {
    // Only on screens where the right sidebar is hidden
    if (window.matchMedia('(min-width: ' + (BREAKPOINT + 0.0625) + 'em)').matches) return false;
    // Only if a TOC exists
    var toc = document.querySelector('.md-sidebar--secondary .md-nav--secondary');
    if (!toc || !toc.querySelector('.md-nav__list li')) return false;
    return true;
  }

  function init() {
    if (!shouldActivate()) return;

    var sidebar = document.querySelector('.md-sidebar--secondary');
    if (!sidebar) return;

    // Create floating button
    var btn = document.createElement('button');
    btn.className = 'ub-toc-fab';
    btn.setAttribute('aria-label', 'Table of contents');
    btn.innerHTML = '<span class="md-nav__icon md-icon"></span>';
    document.body.appendChild(btn);

    // Create backdrop
    var backdrop = document.createElement('div');
    backdrop.className = 'ub-toc-backdrop';
    document.body.appendChild(backdrop);

    var open = false;

    function toggle() {
      open = !open;
      sidebar.classList.toggle('ub-toc-open', open);
      backdrop.classList.toggle('ub-toc-open', open);
      btn.classList.toggle('ub-toc-open', open);
    }

    btn.addEventListener('click', toggle);
    backdrop.addEventListener('click', toggle);

    // Close on TOC link click
    sidebar.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        if (open) toggle();
      }
    });
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
