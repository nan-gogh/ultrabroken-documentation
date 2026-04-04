/**
 * Ensure window.__ub_base (site root URL with trailing slash) is always
 * available, even during instant navigation or after a mid-session deployment.
 *
 * The <head> template injects it from site_url on fresh loads.
 * This body script provides a runtime fallback that re-runs on every
 * Material instant-navigation page swap.
 */
(function () {
  if (window.__ub_base) return;
  var c = document.querySelector('link[rel="canonical"]');
  if (c && c.href && c.href.indexOf('/wiki/') > -1) {
    window.__ub_base = c.href.replace(/\/wiki\/.*$/, '/');
  } else {
    var s = document.querySelector('link[rel="stylesheet"][href*="assets/stylesheets/"]');
    window.__ub_base = s ? s.href.replace(/assets\/stylesheets\/.*$/, '') : '/';
  }
})();
