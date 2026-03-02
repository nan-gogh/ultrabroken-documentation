/**
 * Grimoire of Glitchcraft – Interactive sort & filter
 *
 * Loads glitch metadata from grimoire-data.json and renders a dynamic,
 * searchable, sortable, filterable list of all documented glitches.
 * Only activates on pages containing <div id="grimoire-app">.
 */
(function () {
  'use strict';

  var APP = 'grimoire-app';

  /* ---------- module state (persists across instant navigations) ---------- */
  var data    = null;   // entry[]
  var facets  = null;   // { years, versions, tags, credits }
  var state   = null;   // current filters & sort
  var _click  = false;  // global click listener bound once

  /* ================================================================
     Helpers
     ================================================================ */
  function unk(v) { return !v || v === '?' || v === 'Unknown'; }
  function yearOf(d) { return unk(d) ? 'Unknown' : d.slice(0, 4); }
  function dateMs(d) { return unk(d) ? null : new Date(d).getTime(); }

  function cmpVer(a, b) {
    if (unk(a)) return 1;
    if (unk(b)) return -1;
    var pa = a.split('.').map(Number), pb = b.split('.').map(Number);
    for (var i = 0; i < Math.max(pa.length, pb.length); i++) {
      var d = (pa[i] || 0) - (pb[i] || 0);
      if (d) return d;
    }
    return 0;
  }

  function esc(s) {
    var el = document.createElement('span');
    el.textContent = s;
    return el.innerHTML;
  }

  function at(s) {
    return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
            .replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /** ./file.md → ../file/  (MkDocs use_directory_urls) */
  function toHref(md) {
    return md.replace(/^\.\//, '../').replace(/\.md$/, '/');
  }

  function freshState() {
    return { sort: 'date', dir: 'asc', q: '',
             years: [], versions: [], tags: [], credits: [] };
  }

  /* ================================================================
     Data
     ================================================================ */
  function fetchData(cb) {
    fetch('../../../assets/data/grimoire-data.json').then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    }).then(cb).catch(function (e) {
      console.error('[Grimoire] load failed', e);
      cb(null);
    });
  }

  function extractFacets(entries) {
    var yS = new Set(), vS = new Set(), tS = new Set(), cS = new Set();
    entries.forEach(function (e) {
      yS.add(yearOf(e.date));
      (e.versions || []).forEach(function (x) { vS.add(x); });
      (e.tags    || []).forEach(function (x) { tS.add(x); });
      (e.credits || []).forEach(function (x) { cS.add(x); });
    });
    var tail = function (a, b) {
      if (unk(a)) return 1; if (unk(b)) return -1;
      return a.localeCompare(b);
    };
    return {
      years:    Array.from(yS).sort(tail),
      versions: Array.from(vS).sort(cmpVer),
      tags:     Array.from(tS).sort(tail),
      credits:  Array.from(cS).sort(function (a, b) {
        if (unk(a)) return 1; if (unk(b)) return -1;
        return a.localeCompare(b, undefined, { sensitivity: 'base' });
      })
    };
  }

  /* ================================================================
     UI – build
     ================================================================ */
  function buildUI(root) {
    var h = '';

    /* search */
    h += '<div class="grim-row">'
       + '<input id="grim-q" class="grim-search" type="text"'
       + ' placeholder="Search name, abbreviation, tag, or credit\u2026"'
       + ' autocomplete="off" spellcheck="false">'
       + '</div>';

    /* sort */
    h += '<div class="grim-row grim-gap">'
       + '<span class="grim-label">Sort</span>'
       + '<button class="grim-btn active" data-sort="date">Date</button>'
       + '<button class="grim-btn" data-sort="name">Name</button>'
       + '<button class="grim-btn grim-dir" id="grim-dir"'
       + ' title="Toggle direction">\u2191</button>'
       + '<button class="grim-btn grim-reset" id="grim-reset"'
       + ' title="Reset all filters">\u21BA Reset</button>'
       + '</div>';

    /* year chips */
    h += '<div class="grim-row">'
       + '<span class="grim-label">Year</span>'
       + '<div class="grim-chips">';
    facets.years.forEach(function (y) {
      h += '<button class="grim-chip" data-year="' + at(y) + '">'
         + esc(y) + '</button>';
    });
    h += '</div></div>';

    /* dropdowns */
    h += ddHTML('grim-dd-ver',  'Version', 'version', facets.versions, false);
    h += ddHTML('grim-dd-tag',  'Tag',     'tag',     facets.tags,     true);
    h += ddHTML('grim-dd-cred', 'Credit',  'credit',  facets.credits,  true);

    /* status + list */
    h += '<div id="grim-status" class="grim-status"></div>'
       + '<div id="grim-list"></div>';

    root.innerHTML = h;
  }

  function ddHTML(id, label, singular, items, searchable) {
    var h = '<div class="grim-row">'
          + '<span class="grim-label">' + esc(label) + '</span>'
          + '<div class="grim-dropdown" id="' + id + '">'
          + '<button class="grim-dd-toggle" type="button" data-singular="'
          + singular + '">All ' + singular + 's'
          + ' <span class="grim-arrow">\u25BE</span></button>'
          + '<div class="grim-dd-panel">';
    if (searchable) {
      h += '<input class="grim-dd-search" type="text" placeholder="Filter\u2026"'
         + ' autocomplete="off" spellcheck="false">';
    }
    h += '<div class="grim-dd-list">';
    items.forEach(function (v) {
      h += '<label class="grim-dd-opt" data-lc="' + at(v.toLowerCase()) + '">'
         + '<input type="checkbox" value="' + at(v) + '"> ' + esc(v)
         + '</label>';
    });
    h += '</div></div></div></div>';
    return h;
  }

  /* ================================================================
     UI – events
     ================================================================ */
  function wire(root) {
    /* search */
    var qEl = root.querySelector('#grim-q'), timer;
    qEl.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        state.q = qEl.value.trim().toLowerCase();
        refresh();
      }, 150);
    });

    /* sort buttons */
    root.querySelectorAll('[data-sort]').forEach(function (b) {
      b.addEventListener('click', function () {
        root.querySelectorAll('[data-sort]').forEach(function (x) {
          x.classList.remove('active');
        });
        b.classList.add('active');
        state.sort = b.dataset.sort;
        refresh();
      });
    });

    /* direction */
    var dirBtn = root.querySelector('#grim-dir');
    dirBtn.addEventListener('click', function () {
      state.dir = state.dir === 'asc' ? 'desc' : 'asc';
      dirBtn.textContent = state.dir === 'asc' ? '\u2191' : '\u2193';
      refresh();
    });

    /* reset */
    root.querySelector('#grim-reset').addEventListener('click', function () {
      state = freshState();
      qEl.value = '';
      dirBtn.textContent = '\u2191';
      root.querySelectorAll('[data-sort]').forEach(function (b) {
        b.classList.remove('active');
      });
      root.querySelector('[data-sort="date"]').classList.add('active');
      root.querySelectorAll('.grim-chip.active').forEach(function (c) {
        c.classList.remove('active');
      });
      root.querySelectorAll('.grim-dd-opt input:checked').forEach(function (cb) {
        cb.checked = false;
      });
      root.querySelectorAll('.grim-dd-search').forEach(function (s) {
        s.value = '';
        filterOpts(s, '');
      });
      root.querySelectorAll('.grim-dd-toggle').forEach(function (t) {
        var s = t.dataset.singular;
        t.innerHTML = 'All ' + s + 's <span class="grim-arrow">\u25BE</span>';
      });
      refresh();
    });

    /* year chips */
    root.querySelectorAll('.grim-chip[data-year]').forEach(function (c) {
      c.addEventListener('click', function () {
        c.classList.toggle('active');
        state.years = activeChips(root, 'data-year');
        refresh();
      });
    });

    /* dropdown toggles */
    root.querySelectorAll('.grim-dd-toggle').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var dd = btn.closest('.grim-dropdown');
        var wasOpen = dd.classList.contains('open');
        closeDDs(root);
        if (!wasOpen) {
          dd.classList.add('open');
          var si = dd.querySelector('.grim-dd-search');
          /* Only focus on desktop; mobile keyboard auto-appears and is annoying */
          if (si && window.innerWidth > 600) si.focus();
        }
      });
    });

    /* close dropdowns on outside click (bind once globally) */
    if (!_click) {
      _click = true;
      document.addEventListener('click', function (e) {
        if (!e.target.closest('.grim-dropdown')) {
          var app = document.getElementById(APP);
          if (app) closeDDs(app);
        }
      });
    }

    /* dropdown checkbox delegation */
    wireDDCB(root, '#grim-dd-ver',  'versions', 'version');
    wireDDCB(root, '#grim-dd-tag',  'tags',     'tag');
    wireDDCB(root, '#grim-dd-cred', 'credits',  'credit');

    /* dropdown search inputs */
    root.querySelectorAll('.grim-dd-search').forEach(function (inp) {
      inp.addEventListener('input', function () {
        filterOpts(inp, inp.value.trim().toLowerCase());
      });
      inp.addEventListener('click', function (e) { e.stopPropagation(); });
    });
  }

  function wireDDCB(root, sel, key, singular) {
    var dd = root.querySelector(sel);
    dd.addEventListener('change', function (e) {
      if (e.target.type !== 'checkbox') return;
      state[key] = checkedVals(dd);
      labelDD(dd, singular);
      refresh();
    });
  }

  function closeDDs(root) {
    root.querySelectorAll('.grim-dropdown.open').forEach(function (d) {
      d.classList.remove('open');
    });
  }

  function activeChips(root, attr) {
    var v = [];
    root.querySelectorAll('.grim-chip.active[' + attr + ']').forEach(function (c) {
      v.push(c.getAttribute(attr));
    });
    return v;
  }

  function checkedVals(dd) {
    var v = [];
    dd.querySelectorAll('input:checked').forEach(function (cb) { v.push(cb.value); });
    return v;
  }

  function labelDD(dd, singular) {
    var n = dd.querySelectorAll('input:checked').length;
    var t = dd.querySelector('.grim-dd-toggle');
    t.innerHTML = (n ? n + ' ' + singular + (n > 1 ? 's' : '')
                     : 'All ' + singular + 's')
                + ' <span class="grim-arrow">\u25BE</span>';
  }

  function filterOpts(input, term) {
    input.closest('.grim-dd-panel').querySelectorAll('.grim-dd-opt')
      .forEach(function (o) {
        o.style.display = (o.dataset.lc || '').indexOf(term) >= 0 ? '' : 'none';
      });
  }

  /* ================================================================
     Filter / Sort / Render
     ================================================================ */
  function applyFilter() {
    return data.filter(function (e) {
      if (state.q) {
        var hay = [e.name, e.abbr]
                    .concat(e.tags || [], e.credits || [])
                    .join(' ').toLowerCase();
        if (hay.indexOf(state.q) < 0) return false;
      }
      if (state.years.length &&
          state.years.indexOf(yearOf(e.date)) < 0) return false;
      if (state.versions.length &&
          !state.versions.some(function (v) {
            return (e.versions || []).indexOf(v) >= 0;
          })) return false;
      if (state.tags.length &&
          !state.tags.some(function (t) {
            return (e.tags || []).indexOf(t) >= 0;
          })) return false;
      if (state.credits.length &&
          !state.credits.some(function (c) {
            return (e.credits || []).indexOf(c) >= 0;
          })) return false;
      return true;
    });
  }

  function applySort(list) {
    var dir = state.dir === 'asc' ? 1 : -1;
    return list.slice().sort(function (a, b) {
      if (state.sort === 'date') {
        var da = dateMs(a.date), db = dateMs(b.date);
        /* unknown dates always sort to end regardless of direction */
        if (da === null && db === null) return a.name.localeCompare(b.name);
        if (da === null) return 1;
        if (db === null) return -1;
        var c = (da - db) * dir;
        return c || a.name.localeCompare(b.name);
      }
      return a.name.localeCompare(b.name) * dir;
    });
  }

  function renderList(list) {
    var el = document.getElementById('grim-list');
    if (!el) return;
    if (!list.length) {
      el.innerHTML = '<p class="grim-empty">No glitches match the current filters.</p>';
      return;
    }
    var h = '<div class="grim-ol">';
    for (var i = 0; i < list.length; i++) {
      var e = list[i];
      var dl = unk(e.date) ? 'Unknown' : e.date;
      var ab = e.abbr
        ? ' <span class="grim-abbr">(' + esc(e.abbr) + ')</span>' : '';
      h += '<div class="grim-li">'
         + '<span class="grim-num">' + (i + 1) + '.</span>'
         + '<a href="' + at(toHref(e.href)) + '">'
         + esc(e.name) + ab + '</a>'
         + '<span class="grim-date">' + esc(dl) + '</span></div>';
    }
    el.innerHTML = h + '</div>';
  }

  function renderStatus(n) {
    var el = document.getElementById('grim-status');
    if (!el) return;
    el.textContent = n === data.length
      ? n + ' glitches'
      : 'Showing ' + n + ' of ' + data.length + ' glitches';
  }

  function refresh() {
    var result = applySort(applyFilter());
    renderList(result);
    renderStatus(result.length);
  }

  /* ================================================================
     Init
     ================================================================ */
  function init() {
    var root = document.getElementById(APP);
    if (!root || root._grim) return;
    root._grim = true;
    state = freshState();

    /* data already cached from a previous visit */
    if (data) { buildUI(root); wire(root); refresh(); return; }

    root.innerHTML = '<p class="grim-loading">Loading glitch data\u2026</p>';

    fetchData(function (json) {
      if (!json) {
        root.innerHTML = '<p class="grim-error">Failed to load grimoire data.</p>';
        root._grim = false;          // allow retry on next navigation
        return;
      }
      data   = json;
      facets = extractFacets(json);
      buildUI(root);
      wire(root);
      refresh();
    });
  }

  // MkDocs Material provides an observable (document$) that emits on layout swap
  if (typeof document$ !== 'undefined') {
    document$.subscribe(function() {
      init();
    });
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
})();
