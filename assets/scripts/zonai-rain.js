/**
 * Zonai Rain — matrix digital rain using the Zonai font
 * ─────────────────────────────────────────────────────
 * Static grid of pre-computed characters with JS-driven opacity
 * raindrops.  Each column holds a fixed vertical strip of <span>
 * characters that never move.  A "raindrop" — a bright head with a
 * fading trail — sweeps downward through the column by updating
 * span opacity via requestAnimationFrame.  No CSS translateY, no
 * <canvas>, so mobile pinch-zoom cannot trigger a buffer crash.
 *
 * Modes (driven by toolbar.js via data-ub-bg on <html>):
 *   'animate' → raindrops fall continuously
 *   'frozen'  → rAF paused; current snapshot persists
 *   'hidden'  → container display:none via CSS
 *
 * PRE-AGING
 * ─────────
 * Every column starts with its drop at a random position so the
 * rain looks mid-fall on first paint — even in frozen mode.
 */
(function () {
  'use strict';

  /* ── Tunables ──────────────────────────────────────────────────── */
  var CHARS       = 'BCDHJLMNRSTUWYbcdhjlmnrstuwy';
  var TRAIL_LEN   = 14;       // characters in the fading trail
  var SPEED_MIN   = 8;        // rows per second (slowest column)
  var SPEED_MAX   = 16;       // rows per second (fastest column)
  var HEAD_ALPHA  = 0.09;     // head character opacity
  var TRAIL_ALPHA = 0.08;     // max trail-body opacity (linear fade)
  var GAP_MAX     = 20;       // max extra blank rows between passes

  /* ── Responsive tunables (read from CSS custom properties) ─────── */
  var FONT_PX = 18;
  var LINE_H  = 2.4;
  var COL_GAP = 38;
  var CELL_H  = FONT_PX * LINE_H;

  function readCSSVars() {
    if (!container) return;
    var s = getComputedStyle(container);
    FONT_PX = parseFloat(s.getPropertyValue('--rain-font-px')) || 18;
    LINE_H  = parseFloat(s.getPropertyValue('--rain-line-h'))  || 2.4;
    COL_GAP = parseFloat(s.getPropertyValue('--rain-col-gap')) || 38;
    CELL_H  = FONT_PX * LINE_H;
  }

  /* ── State ─────────────────────────────────────────────────────── */
  var container = null;
  var columns   = [];         // { el, spans[], rows, speed, pos, prevHead }
  var brightDrops = [];       // overlay columns spawned by clicks
  var rafId     = null;
  var lastTime  = 0;
  var running   = false;

  /* ── Helpers ───────────────────────────────────────────────────── */
  function rand(a, b) { return Math.random() * (b - a) + a; }
  function pickChar() { return CHARS[Math.floor(Math.random() * CHARS.length)]; }
  function computeRows() { return Math.ceil(window.innerHeight / CELL_H); }

  /* ── Build one column ──────────────────────────────────────────── */
  function createColumn(rows) {
    var col = document.createElement('div');
    col.className = 'ub-rain-col';

    var spans = [];
    for (var i = 0; i < rows; i++) {
      var sp = document.createElement('span');
      sp.textContent = pickChar();
      sp.style.opacity = '0';
      col.appendChild(sp);
      spans.push(sp);
    }

    return {
      el: col,
      spans: spans,
      rows: rows,
      speed: rand(SPEED_MIN, SPEED_MAX),
      pos: rand(-TRAIL_LEN, rows + TRAIL_LEN),   // pre-age
      prevHead: -999
    };
  }

  /* ── Render one column: update only the spans that changed ─────── */
  /* Per-column overrides: col.headAlpha, col.trailAlpha, col.trailLen */
  function renderColumn(col) {
    var headRow = Math.floor(col.pos);
    if (headRow === col.prevHead) return;

    var tLen = col.trailLen || TRAIL_LEN;
    var hA   = col.headAlpha  || HEAD_ALPHA;
    var tA   = col.trailAlpha || TRAIL_ALPHA;

    // Clamp trail to distance traveled since spawn
    if (col.startPos !== undefined) {
      var traveled = Math.floor(col.startPos - col.pos);
      if (traveled < tLen) tLen = Math.max(0, traveled);
    }

    var oldHead = col.prevHead;
    col.prevHead = headRow;

    // Compute the range of rows whose opacity may have changed
    // Trail is below the head (higher row indices) since drops move upward
    var lo, hi;
    if (oldHead === -999) {
      lo = 0;
      hi = col.rows - 1;
    } else {
      lo = Math.max(0, Math.min(oldHead, headRow));
      hi = Math.min(col.rows - 1, Math.max(oldHead, headRow) + tLen + 1);
    }

    for (var i = lo; i <= hi; i++) {
      var dist = i - headRow;           // how far row i is behind the head (below it)
      var a;
      if (dist < 0 || dist > tLen) {
        a = 0;
      } else if (dist === 0) {
        a = hA;
      } else {
        a = tA * (1 - dist / tLen);
      }
      col.spans[i].style.opacity = a;
    }
  }

  /* ── Reset a column for a new pass ─────────────────────────────── */
  function resetColumn(col) {
    col.pos   = col.rows + TRAIL_LEN + rand(0, GAP_MAX);  // restart below viewport
    col.speed = rand(SPEED_MIN, SPEED_MAX);
    col.prevHead = -999;
    for (var j = 0; j < col.spans.length; j++) {
      col.spans[j].textContent = pickChar();
      col.spans[j].style.opacity = '0';
    }
  }

  /* ── Click-spawned bright drops ────────────────────────────────── */
  function removeBrightDrops() {
    for (var i = brightDrops.length - 1; i >= 0; i--) {
      var bd = brightDrops[i];
      if (bd.el.parentNode) bd.el.parentNode.removeChild(bd.el);
    }
    brightDrops.length = 0;
  }

  function spawnClickDrop(e) {
    if (!running || !container) return;

    var colIdx = Math.round(e.clientX / COL_GAP);
    if (colIdx < 0 || colIdx >= columns.length) return;

    var startRow = Math.round(e.clientY / CELL_H);
    var src = columns[colIdx];

    var c = createColumn(src.rows);
    // Clone characters from the background column
    for (var i = 0; i < src.spans.length; i++) {
      c.spans[i].textContent = src.spans[i].textContent;
    }
    c.el.style.left = (colIdx * COL_GAP) + 'px';
    c.pos        = startRow;
    c.startPos   = startRow;
    c.speed      = rand(SPEED_MIN, SPEED_MAX);
    c.prevHead   = -999;
    c.headAlpha  = 0.30;
    c.trailAlpha = 0.25;
    c.trailLen   = 10;
    container.appendChild(c.el);

    brightDrops.push(c);
  }

  /* ── Animation loop ────────────────────────────────────────────── */
  function tick(now) {
    if (!running) return;

    var dt = (now - lastTime) / 1000;
    if (dt > 0.5) dt = 0.016;          // clamp after tab-away
    lastTime = now;

    for (var c = 0; c < columns.length; c++) {
      var col = columns[c];
      col.pos -= col.speed * dt;          // move upward

      if (col.pos < -TRAIL_LEN) {
        resetColumn(col);
      }

      renderColumn(col);
    }

    for (var b = brightDrops.length - 1; b >= 0; b--) {
      var bd = brightDrops[b];
      bd.pos -= bd.speed * dt;
      if (bd.pos < -(bd.trailLen || TRAIL_LEN)) {
        if (bd.el.parentNode) bd.el.parentNode.removeChild(bd.el);
        brightDrops.splice(b, 1);
        continue;
      }
      renderColumn(bd);
    }

    rafId = requestAnimationFrame(tick);
  }

  /* ── Populate / trim columns to fill viewport width ────────────── */
  function syncColumns() {
    if (!container) return;
    var needed = Math.ceil(window.innerWidth / COL_GAP);
    var rows   = computeRows();

    while (columns.length < needed) {
      var c = createColumn(rows);
      c.el.style.left = (columns.length * COL_GAP) + 'px';
      container.appendChild(c.el);
      columns.push(c);
      renderColumn(c);
    }

    while (columns.length > needed) {
      var removed = columns.pop();
      if (removed.el.parentNode) removed.el.parentNode.removeChild(removed.el);
    }
  }

  /* ── Start / stop ──────────────────────────────────────────────── */
  function start() {
    if (running) return;
    running  = true;
    lastTime = performance.now();
    rafId    = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    removeBrightDrops();
  }

  /* ── Mode switching ────────────────────────────────────────────── */
  function applyMode(mode) {
    if (mode === 'animate') {
      start();
    } else {
      stop();
    }
  }

  /* ── Resize handling ───────────────────────────────────────────── */
  var resizeTimer = null;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      readCSSVars();
      removeBrightDrops();
      while (columns.length) {
        var r = columns.pop();
        if (r.el.parentNode) r.el.parentNode.removeChild(r.el);
      }
      syncColumns();
    }, 200);
  }

  /* ── Bootstrap ─────────────────────────────────────────────────── */
  function init() {
    container = document.createElement('div');
    container.className = 'ub-rain-bg';
    container.setAttribute('aria-hidden', 'true');
    document.body.appendChild(container);

    readCSSVars();
    syncColumns();

    var mode = window.__ubBgMode || 'animate';
    applyMode(mode);

    window.addEventListener('motion-toggle', function (e) {
      applyMode(e.detail.mode);
    });

    window.addEventListener('resize', onResize);

    // Use capture phase so Material's stopPropagation on tab label clicks
    // doesn't swallow the event before it reaches our handler.
    document.addEventListener('click', spawnClickDrop, true);
  }

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
