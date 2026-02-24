/**
 * Leaderboard – Glitch Hunters & Contributors
 *
 * Loads pre-computed ranked contributor data from _leaderboard-data.json
 * and renders a table into <div id="leaderboard-root">.
 * Only activates on pages containing that div.
 */
(function () {
  'use strict';

  var APP = 'leaderboard-root';
  var data = null;   // cached between instant navigations

  /* ================================================================
     Helpers
     ================================================================ */

  var MEDALS = { 1: '\uD83E\uDD47', 2: '\uD83E\uDD48', 3: '\uD83E\uDD49' };  // 🥇🥈🥉
  function medal(rank) {
    return MEDALS[rank] || (rank <= 10 ? '\uD83C\uDFC5' + rank : '\uD83D\uDCDC ' + rank);  // 🏅 📜
  }

  function esc(s) {
    var el = document.createElement('span');
    el.textContent = String(s);
    return el.innerHTML;
  }

  /* ================================================================
     Data
     ================================================================ */

  function fetchData(cb) {
    fetch('/assets/scripts/leaderboard-data.json')
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(cb)
      .catch(function () { cb(null); });
  }

  /* ================================================================
     Render
     ================================================================ */

  function render(root, json) {
    var rows = json.entries.map(function (e) {
      var name = e.url
        ? '<a href="' + esc(e.url) + '">' + esc(e.name) + '</a>'
        : esc(e.name);
      return '<tr><td class="cell-rank">' + esc(medal(e.rank)) + '</td><td class="cell-name">' + name + '</td><td class="cell-count">' + e.count + '</td></tr>';
    }).join('');

    root.innerHTML =
      '<p class="lb-meta"><em>' + esc(json.total) + ' contributors \u2014 last updated ' + esc(json.updated) + '</em></p>' +
      '<table class="leaderboard-table">' +
        '<thead><tr><th>Rank</th><th>Contributor</th><th>Glitches</th></tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
      '</table>';
  }

  /* ================================================================
     Init
     ================================================================ */

  function init() {
    var root = document.getElementById(APP);
    if (!root || root._lb) return;
    root._lb = true;

    if (data) { render(root, data); return; }

    root.innerHTML = '<p class="lb-loading">Loading leaderboard\u2026</p>';

    fetchData(function (json) {
      if (!json) {
        root.innerHTML = '<p class="lb-error">Failed to load leaderboard data.</p>';
        root._lb = false;   // allow retry on next navigation
        return;
      }
      data = json;
      render(root, data);
    });
  }

  /* initial page load */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* MkDocs Material instant navigation – re-init when content changes */
  new MutationObserver(function () { init(); })
    .observe(document.body, { childList: true, subtree: true });
})();
