/**
 * version-chart.js — Version Compatibility Chart
 * ================================================
 * Renders a single-table Gantt-style chart showing which game versions
 * each documented glitch is known to work on.  The header row and label
 * column use CSS position: sticky — the browser handles scroll-sync
 * natively with zero lag.
 *
 * Only activates on pages containing <div id="ub-version-chart">.
 * Data is loaded from assets/data/grimoire-data.json and versions.json.
 */

(function () {
  'use strict';

  var CHART_ID = 'ub-version-chart';

  /* ── helpers ────────────────────────────────────────────────── */

  function coveredSet(glitch, versionList) {
    var set = {};
    for (var i = 0; i < glitch.versions.length; i++) {
      var idx = versionList.indexOf(glitch.versions[i]);
      if (idx >= 0) set[idx] = true;
    }
    return set;
  }

  function getRuns(covered, n) {
    var runs  = [];
    var start = -1;
    for (var i = 0; i < n; i++) {
      if (covered[i]) {
        if (start < 0) start = i;
      } else {
        if (start >= 0) { runs.push([start, i - 1]); start = -1; }
      }
    }
    if (start >= 0) runs.push([start, n - 1]);
    return runs;
  }

  function buildCellClasses(covered, n) {
    var classes = new Array(n);
    for (var i = 0; i < n; i++) classes[i] = '';

    var runs = getRuns(covered, n);
    for (var r = 0; r < runs.length; r++) {
      var s = runs[r][0];
      var e = runs[r][1];
      if (s === e) {
        classes[s] = 'ub-vc-fill ub-vc-sg';
      } else {
        classes[s] = 'ub-vc-fill ub-vc-rs';
        classes[e] = 'ub-vc-fill ub-vc-re';
        for (var j = s + 1; j < e; j++) classes[j] = 'ub-vc-fill ub-vc-rm';
      }
    }
    return classes;
  }

  function isUnknown(glitch) {
    return glitch.versions.length === 0 ||
           (glitch.versions.length === 1 && glitch.versions[0] === 'Unknown');
  }

  /* ── render ─────────────────────────────────────────────────── */

  function render(root, glitches, vd) {
    var versionList = vd.versions;
    var n           = versionList.length;

    var sorted = glitches.slice().sort(function (a, b) {
      return a.label.localeCompare(b.label);
    });

    /* ── state ──────────────────────────────── */
    var searchQ  = '';
    var vFilter  = null;

    /* ── controls bar ───────────────────────── */
    var ctrlBar = document.createElement('div');
    ctrlBar.className = 'ub-vc-controls';

    var searchEl = document.createElement('input');
    searchEl.type = 'search';
    searchEl.placeholder = 'Search glitches\u2026';
    searchEl.className   = 'ub-vc-search';
    searchEl.setAttribute('aria-label', 'Search glitches by label, name or tag');

    var countEl = document.createElement('span');
    countEl.className = 'ub-vc-count';

    var clearBtn = document.createElement('button');
    clearBtn.className    = 'ub-vc-btn ub-vc-clear';
    clearBtn.type         = 'button';
    clearBtn.textContent  = 'Clear filter';
    clearBtn.style.display = 'none';

    ctrlBar.appendChild(searchEl);
    ctrlBar.appendChild(countEl);
    ctrlBar.appendChild(clearBtn);

    /* ── table wrapper ──────────────────────── */
    var wrap = document.createElement('div');
    wrap.className = 'ub-vc-wrap';

    var tbl = document.createElement('table');
    tbl.className = 'ub-vc-table';

    /* ── thead ──────────────────────────────── */
    var thead = document.createElement('thead');
    var hrow  = document.createElement('tr');

    /* Corner cell — sticky top + left */
    var corner = document.createElement('th');
    corner.className   = 'ub-vc-lh';
    corner.scope       = 'col';
    hrow.appendChild(corner);

    /* Version header cells — sticky top */
    var vhCells = [];
    for (var vi = 0; vi < n; vi++) {
      var vname = versionList[vi];
      var th    = document.createElement('th');
      th.className     = 'ub-vc-vh';
      th.scope         = 'col';
      th.title         = 'Filter to \u201c' + vname + '\u201d';
      th.dataset.vname = vname;

      var span = document.createElement('span');
      var code = document.createElement('code');
      code.textContent = vname.replace(/ /g, '\u00A0');
      span.appendChild(code);
      th.appendChild(span);

      hrow.appendChild(th);
      vhCells.push(th);
    }

    thead.appendChild(hrow);
    tbl.appendChild(thead);

    /* ── tbody ──────────────────────────────── */
    var tbody = document.createElement('tbody');
    var rows  = [];

    for (var gi = 0; gi < sorted.length; gi++) {
      var g   = sorted[gi];
      var tr  = document.createElement('tr');
      var unk = isUnknown(g);

      /* Label cell — sticky left */
      var td0 = document.createElement('td');
      td0.className = 'ub-vc-lc';
      if (unk) td0.title = 'Version compatibility unknown';

      var a = document.createElement('a');
      a.href   = '../glitchcraft/' + g.uid + '/';
      a.target = '_blank';
      a.rel    = 'noopener noreferrer';
      a.title  = g.name;
      var lCode = document.createElement('code');
      lCode.textContent = g.label;
      a.appendChild(lCode);
      td0.appendChild(a);

      /* Ghost name — inside sticky label cell so overflow
         never extends the scroll container's scrollable width. */
      var ghost = document.createElement('span');
      ghost.className = 'ub-vc-ghost-name';
      ghost.textContent = g.name;
      td0.appendChild(ghost);

      tr.appendChild(td0);

      /* Version cells */
      if (unk) {
        for (var vu = 0; vu < n; vu++) {
          tr.appendChild(document.createElement('td'));
        }
      } else {
        var covered = coveredSet(g, versionList);
        var cls     = buildCellClasses(covered, n);
        for (var vj = 0; vj < n; vj++) {
          var vtd = document.createElement('td');
          if (cls[vj]) vtd.className = cls[vj];
          tr.appendChild(vtd);
        }
      }

      tbody.appendChild(tr);
      rows.push({ el: tr, glitch: g });
    }

    tbl.appendChild(tbody);
    wrap.appendChild(tbl);

    /* Place everything */
    root.innerHTML = '';
    root.appendChild(ctrlBar);
    root.appendChild(wrap);

    /* ── ghost-name clipping ─────────────────── */
    /* Measure the bar-area width (everything right of the label column)
       and expose it as a CSS variable so ghost names are clipped at the
       last version column instead of bleeding into dead table space. */
    function updateBarWidth() {
      var barW = tbl.offsetWidth - corner.offsetWidth;
      tbl.style.setProperty('--ub-vc-bar-w', barW + 'px');
    }
    updateBarWidth();
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(updateBarWidth).observe(wrap);
    }

    /* ── filter / search logic ──────────────── */
    function applyFilter() {
      var q       = searchQ.toLowerCase();
      var visible = 0;

      for (var i = 0; i < rows.length; i++) {
        var rg = rows[i].glitch;

        var matchSearch = !q;
        if (!matchSearch) {
          matchSearch = rg.label.toLowerCase().indexOf(q) >= 0 ||
                        rg.name.toLowerCase().indexOf(q)  >= 0;
          if (!matchSearch) {
            for (var t = 0; t < rg.tags.length; t++) {
              if (rg.tags[t].toLowerCase().indexOf(q) >= 0) {
                matchSearch = true;
                break;
              }
            }
          }
        }

        var matchVersion = !vFilter || rg.versions.indexOf(vFilter) >= 0;

        var show = matchSearch && matchVersion;
        rows[i].el.style.display = show ? '' : 'none';
        if (show) visible++;
      }

      var total = rows.length;
      countEl.textContent = (visible === total)
        ? total + ' glitches'
        : visible + '\u202f/\u202f' + total + ' glitches';

      clearBtn.style.display = vFilter ? '' : 'none';
      for (var h = 0; h < vhCells.length; h++) {
        vhCells[h].classList.toggle('ub-vc-active', vhCells[h].dataset.vname === vFilter);
      }
    }

    countEl.textContent = rows.length + ' glitches';

    /* ── events ─────────────────────────────── */
    searchEl.addEventListener('input', function () {
      searchQ = searchEl.value;
      applyFilter();
    });

    for (var hi = 0; hi < vhCells.length; hi++) {
      (function (cell) {
        cell.addEventListener('click', function () {
          var vname = cell.dataset.vname;
          vFilter = (vFilter === vname) ? null : vname;
          applyFilter();
        });
      })(vhCells[hi]);
    }

    clearBtn.addEventListener('click', function () {
      vFilter = null;
      applyFilter();
    });

    /* Respect the global version-filter event (toolbar version selector) */
    function onGlobalVersionFilter() {
      var gv = null;
      if (window.__ubVersionFilter && window.__ubVersionFilter.active) {
        gv = window.__ubVersionFilter.value || null;
      }
      if (gv !== vFilter) {
        vFilter = gv;
        applyFilter();
      }
    }
    if (window.__ubVCVersionFilterCb) {
      window.removeEventListener('version-filter', window.__ubVCVersionFilterCb);
    }
    window.__ubVCVersionFilterCb = onGlobalVersionFilter;
    window.addEventListener('version-filter', onGlobalVersionFilter);
  }

  /* ── data loading ───────────────────────────────────────────── */

  function init() {
    var root = document.getElementById(CHART_ID);
    if (!root) return;

    root.innerHTML = '<p class="ub-vc-loading">Loading\u2026</p>';

    var base = '../../';

    var p1 = fetch(base + 'assets/data/grimoire-data.json').then(function (r) {
      if (!r.ok) throw new Error('grimoire-data.json ' + r.status);
      return r.json();
    });
    var p2 = fetch(base + 'assets/data/versions.json').then(function (r) {
      if (!r.ok) throw new Error('versions.json ' + r.status);
      return r.json();
    });

    Promise.all([p1, p2]).then(function (results) {
      render(root, results[0], results[1]);
    }).catch(function (err) {
      root.innerHTML = '<p class="ub-vc-error">Failed to load chart data.</p>';
      console.error('[VersionChart]', err);
    });
  }

  /* ── boot ───────────────────────────────────────────────────── */
  if (typeof document$ !== 'undefined') {
    document$.subscribe(function () { init(); });
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
})();