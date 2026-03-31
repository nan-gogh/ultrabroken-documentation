/**
 * version-chart.js — Version Compatibility Chart
 * ================================================
 * Renders a 4-panel CSS Grid layout showing which game versions each
 * documented glitch is known to work on.  The version-header row and
 * label column live in separate overflow-hidden containers whose scroll
 * position is synced from the body scroll container via JS.
 *
 * Layout (CSS Grid — no JS measurements needed for panel sizing):
 *   ┌──────────┬───────────────────┐
 *   │  corner   │  hscroll (htable) │   auto row
 *   ├──────────┼───────────────────┤
 *   │  vscroll  │  bscroll (btable) │   1fr row
 *   │ (ltable)  │                   │
 *   └──────────┴───────────────────┘
 *     auto col       1fr col
 *
 * Only activates on pages containing <div id="ub-version-chart">.
 * Data is loaded from assets/data/grimoire-data.json and versions.json.
 */

(function () {
  'use strict';

  var CHART_ID = 'ub-version-chart';
  var COL_W = 20;

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
    var showName = false;
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

    var toggleBtn = document.createElement('button');
    toggleBtn.className   = 'ub-vc-btn';
    toggleBtn.type        = 'button';
    toggleBtn.textContent = 'Show name';

    var countEl = document.createElement('span');
    countEl.className = 'ub-vc-count';

    var clearBtn = document.createElement('button');
    clearBtn.className    = 'ub-vc-btn ub-vc-clear';
    clearBtn.type         = 'button';
    clearBtn.textContent  = 'Clear filter';
    clearBtn.style.display = 'none';

    ctrlBar.appendChild(searchEl);
    ctrlBar.appendChild(toggleBtn);
    ctrlBar.appendChild(countEl);
    ctrlBar.appendChild(clearBtn);

    /* ── 4-panel container (CSS Grid) ───────── */
    var outer = document.createElement('div');
    outer.className = 'ub-vc-outer';

    var corner = document.createElement('div');
    corner.className   = 'ub-vc-corner';
    corner.textContent = 'Label';

    var hscroll = document.createElement('div');
    hscroll.className = 'ub-vc-hscroll';

    var htable = document.createElement('table');
    htable.className = 'ub-vc-htable';
    var hthead = document.createElement('thead');
    var hrow   = document.createElement('tr');
    hthead.appendChild(hrow);
    htable.appendChild(hthead);
    hscroll.appendChild(htable);

    var vscroll = document.createElement('div');
    vscroll.className = 'ub-vc-vscroll';

    var ltable = document.createElement('table');
    ltable.className = 'ub-vc-ltable';
    var ltbody = document.createElement('tbody');
    ltable.appendChild(ltbody);
    vscroll.appendChild(ltable);

    var bscroll = document.createElement('div');
    bscroll.className = 'ub-vc-bscroll';

    var btable = document.createElement('table');
    btable.className = 'ub-vc-btable';
    var btbody = document.createElement('tbody');
    btable.appendChild(btbody);
    bscroll.appendChild(btable);

    /* ── version header cells ───────────────── */
    var vhCells = [];
    for (var vi = 0; vi < n; vi++) {
      var vname  = versionList[vi];
      var th     = document.createElement('th');
      th.className     = 'ub-vc-vh';
      th.scope         = 'col';
      th.title         = 'Filter to \u201c' + vname + '\u201d';
      th.dataset.vname = vname;

      var span = document.createElement('span');
      span.textContent = vname.replace(/ /g, '\u00A0');
      th.appendChild(span);

      hrow.appendChild(th);
      vhCells.push(th);
    }

    /* ── body rows: label table + bar table ─── */
    var rows = [];

    for (var gi = 0; gi < sorted.length; gi++) {
      var g   = sorted[gi];
      var unk = isUnknown(g);

      /* ── label row ──── */
      var ltr = document.createElement('tr');
      if (unk) ltr.className = 'ub-vc-unk-row';

      var ltd = document.createElement('td');
      ltd.className = 'ub-vc-lc';
      if (unk) ltd.title = 'Version compatibility unknown';

      var a = document.createElement('a');
      a.href   = '../glitchcraft/' + g.uid + '/';
      a.target = '_blank';
      a.rel    = 'noopener noreferrer';
      a.title  = g.name;
      var lCode = document.createElement('code');
      lCode.textContent = g.label;
      a.appendChild(lCode);
      ltd.appendChild(a);
      ltr.appendChild(ltd);
      ltbody.appendChild(ltr);

      /* ── bar row ────── */
      var btr = document.createElement('tr');
      if (unk) btr.className = 'ub-vc-unk-row';

      if (unk) {
        for (var vu = 0; vu < n; vu++) {
          var utd = document.createElement('td');
          if (vu === 0) {
            utd.className   = 'ub-vc-unk-mark';
            utd.textContent = '?';
            utd.title       = 'Unknown';
          }
          btr.appendChild(utd);
        }
      } else {
        var covered = coveredSet(g, versionList);
        var cls     = buildCellClasses(covered, n);
        for (var vj = 0; vj < n; vj++) {
          var vtd = document.createElement('td');
          var cellCls = cls[vj];
          if (cellCls) vtd.className = cellCls;
          btr.appendChild(vtd);
        }
      }

      btbody.appendChild(btr);
      rows.push({ ltr: ltr, btr: btr, glitch: g });
    }

    /* ── set minimum table widths ────────── */
    var tableMinW = (n * COL_W) + 'px';
    htable.style.minWidth = tableMinW;
    btable.style.minWidth = tableMinW;

    /* ── assemble DOM ───────────────────────── */
    outer.appendChild(corner);
    outer.appendChild(hscroll);
    outer.appendChild(vscroll);
    outer.appendChild(bscroll);

    root.innerHTML = '';
    root.appendChild(ctrlBar);
    root.appendChild(outer);

    /* ── post-render layout sync ────────────── */
    function syncLayout() {
      var lrows = ltbody.rows;
      var brows = btbody.rows;

      /* Reset heights for re-measurement */
      for (var i = 0; i < lrows.length; i++) {
        lrows[i].style.height = '';
        brows[i].style.height = '';
      }

      /* Sync row heights between label and bar tables */
      for (var i = 0; i < lrows.length; i++) {
        var lh = lrows[i].offsetHeight;
        var bh = brows[i].offsetHeight;
        if (lh !== bh) {
          var h = Math.max(lh, bh) + 'px';
          lrows[i].style.height = h;
          brows[i].style.height = h;
        }
      }

      /* Compensate for scrollbar thickness */
      var sbW = bscroll.offsetWidth  - bscroll.clientWidth;
      var sbH = bscroll.offsetHeight - bscroll.clientHeight;
      htable.style.paddingRight  = sbW > 0 ? sbW + 'px' : '';
      ltable.style.paddingBottom = sbH > 0 ? sbH + 'px' : '';
    }

    requestAnimationFrame(syncLayout);

    /* Scroll sync: bscroll drives hscroll (x) and vscroll (y) */
    var scrollTicking = false;
    bscroll.addEventListener('scroll', function () {
      if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(function () {
          hscroll.scrollLeft = bscroll.scrollLeft;
          vscroll.scrollTop  = bscroll.scrollTop;
          scrollTicking = false;
        });
      }
    }, { passive: true });

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
        rows[i].ltr.style.display = show ? '' : 'none';
        rows[i].btr.style.display = show ? '' : 'none';
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

    toggleBtn.addEventListener('click', function () {
      showName = !showName;
      toggleBtn.textContent = showName ? 'Show label' : 'Show name';
      corner.textContent    = showName ? 'Name' : 'Label';
      outer.classList.toggle('ub-vc-names', showName);
      for (var i = 0; i < rows.length; i++) {
        var rg     = rows[i].glitch;
        var anchor = rows[i].ltr.querySelector('td.ub-vc-lc a');
        if (!anchor) continue;
        anchor.innerHTML = '';
        if (showName) {
          anchor.textContent = rg.name;
          anchor.title       = rg.label;
        } else {
          var c = document.createElement('code');
          c.textContent = rg.label;
          anchor.appendChild(c);
          anchor.title = rg.name;
        }
      }
      requestAnimationFrame(syncLayout);
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

    /* Re-sync layout on resize (e.g. phone rotation) */
    var resizeTimer;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(syncLayout, 150);
    }

    /* Remove previous listeners from an earlier render (SPA navigation) */
    if (window.__ubVCVersionFilterCb) {
      window.removeEventListener('version-filter', window.__ubVCVersionFilterCb);
    }
    if (window.__ubVCResizeCb) {
      window.removeEventListener('resize', window.__ubVCResizeCb);
    }
    window.__ubVCVersionFilterCb = onGlobalVersionFilter;
    window.__ubVCResizeCb = onResize;
    window.addEventListener('version-filter', onGlobalVersionFilter);
    window.addEventListener('resize', onResize);
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