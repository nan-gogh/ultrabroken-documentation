/**
 * Zonai Rain — Matrix digital rain using the Zonai font
 * ─────────────────────────────────────────────────────
 * Lightweight canvas-based falling-character effect.  Each column renders
 * a trail of Zonai glyphs that scroll downward at randomised speeds.
 *
 * Modes (driven by toolbar.js via data-ub-bg on <html>):
 *   'animate' → rain falls continuously
 *   'frozen'  → rain paused; canvas retains last frame (static rain)
 *   'hidden'  → canvas hidden via CSS display:none
 *
 * PRE-AGING
 * ─────────
 * On init, every column starts at a random mid-screen position so rain
 * is visible immediately — even when loading directly into frozen mode.
 *
 * FONT READINESS
 * ──────────────
 * If the Zonai web font hasn't loaded when the first frame draws, the
 * canvas falls back to sans-serif.  A document.fonts.ready callback
 * redraws the static frame once the font is available.
 */
(function () {
  'use strict';

  /* ── Tunables ──────────────────────────────────────────────────── */
  var CHARS      = 'BCDHJLMNRSTUWYbcdhjlmnrstuwy';
  var CHAR_SIZE  = 16;      // px – row height and font size
  var CELL_W     = 34;      // px – horizontal spacing between columns
  var TRAIL_LEN  = 18;      // characters in each falling trail
  var MAX_ALPHA  = 0.06;    // peak trail-body opacity (subtle)
  var HEAD_ALPHA = 0.14;    // lead-character brightness
  var STEP_MS    = 75;      // ms between simulation steps (~13 FPS)
  var COLOR      = '#00f0c2'; // --teal-glow

  /* ── State ─────────────────────────────────────────────────────── */
  var canvas, ctx;
  var drops = [];             // per-column { y, speed, chars[] }
  var tickTimer = null;
  var running = false;

  /* ── Helpers ───────────────────────────────────────────────────── */
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function pickChar() {
    return CHARS[Math.floor(Math.random() * CHARS.length)];
  }

  function totalRows() {
    return Math.ceil(canvas.height / CHAR_SIZE);
  }

  /* ── Column lifecycle ──────────────────────────────────────────── */
  function newDrop(preAge) {
    var rows  = totalRows();
    var speed = rand(0.3, 1.0);          // rows per step
    var head  = preAge
      ? rand(0, rows + TRAIL_LEN)        // random position across full screen
      : -rand(2, rows * 0.5);            // start above viewport

    // Pre-generate character ring (avoids per-frame allocation)
    var chars = [];
    for (var i = 0; i < TRAIL_LEN + 4; i++) chars.push(pickChar());

    return { y: head, speed: speed, chars: chars };
  }

  function buildColumns(preAge) {
    var cols = Math.ceil(canvas.width / CELL_W);
    while (drops.length < cols) drops.push(newDrop(preAge));
    drops.length = cols;
  }

  /* ── Rendering ─────────────────────────────────────────────────── */
  function drawFrame() {
    if (!ctx) return;
    var w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.font = CHAR_SIZE + 'px Zonai, sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillStyle = COLOR;

    for (var i = 0; i < drops.length; i++) {
      var d = drops[i];
      var x = i * CELL_W;
      var headRow = Math.floor(d.y);

      for (var j = 0; j < TRAIL_LEN; j++) {
        var row = headRow - j;
        var py  = row * CHAR_SIZE;
        if (py < -CHAR_SIZE || py > h) continue;

        // Head is brightest, linear fade down the trail
        ctx.globalAlpha = j === 0
          ? HEAD_ALPHA
          : MAX_ALPHA * (1 - j / TRAIL_LEN);

        // Occasional character flicker (3 % chance)
        var ch = Math.random() < 0.03
          ? pickChar()
          : d.chars[j % d.chars.length];

        ctx.fillText(ch, x, py);
      }
    }
    ctx.globalAlpha = 1;
  }

  /* ── Simulation step ───────────────────────────────────────────── */
  function advanceDrops() {
    for (var i = 0; i < drops.length; i++) {
      var d = drops[i];
      d.y += d.speed;
      // Reset when entire trail has left the viewport
      if ((d.y - TRAIL_LEN) * CHAR_SIZE > canvas.height) {
        drops[i] = newDrop(false);
      }
    }
  }

  /* ── Animation loop (setTimeout — auto-throttled in hidden tabs) ─ */
  function tick() {
    if (!running) return;
    advanceDrops();
    drawFrame();
    tickTimer = setTimeout(tick, STEP_MS);
  }

  function startAnimation() {
    if (running) return;
    running = true;
    tick();
  }

  function stopAnimation() {
    running = false;
    if (tickTimer) {
      clearTimeout(tickTimer);
      tickTimer = null;
    }
  }

  /* ── Mode switching ────────────────────────────────────────────── */
  function applyMode(mode) {
    if (mode === 'animate') {
      startAnimation();
    } else if (mode === 'frozen') {
      stopAnimation();
      drawFrame();   // ensure canvas has content (e.g. coming from hidden)
    } else {         // hidden — CSS hides canvas; clear to free GPU memory
      stopAnimation();
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  /* ── Resize handling ───────────────────────────────────────────── */
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    buildColumns(true);
    if (!running) drawFrame();
  }

  /* ── Bootstrap ─────────────────────────────────────────────────── */
  function init() {
    canvas = document.createElement('canvas');
    canvas.className = 'ub-rain-bg';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);

    ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    buildColumns(true);                         // pre-age all columns

    var mode = window.__ubBgMode || 'animate';
    applyMode(mode);

    // Re-draw once Zonai font is loaded (fixes sans-serif flash in frozen mode)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        var m = window.__ubBgMode || 'animate';
        if (!running && m !== 'hidden') drawFrame();
      });
    }

    window.addEventListener('motion-toggle', function (e) {
      applyMode(e.detail.mode);
    });

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    });
  }

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
