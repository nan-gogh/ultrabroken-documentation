/**
 * Zonai Rain — CSS-based matrix digital rain using the Zonai font
 * ───────────────────────────────────────────────────────────────
 * Lightweight falling-character effect built entirely on DOM + CSS
 * animations (translateY).  No <canvas>, so mobile pinch-zoom cannot
 * trigger a buffer reallocation crash.
 *
 * Each column is a <div> containing a vertical strip of <span>
 * characters.  The strip translates from above the viewport to below
 * it via a CSS @keyframes animation.  A CSS gradient mask on each
 * column reveals only the trailing portion, creating the classic
 * bright-head + fading-trail appearance.
 *
 * Modes (driven by toolbar.js via data-ub-bg on <html>):
 *   'animate' → rain falls continuously, head characters cycle
 *   'frozen'  → CSS animation-play-state:paused; static snapshot
 *   'hidden'  → container display:none via CSS
 *
 * PRE-AGING
 * ─────────
 * Every column gets a random negative animation-delay so the rain is
 * already mid-fall on first paint — even in frozen mode.
 *
 * HEAD CYCLING
 * ────────────
 * A single shared setInterval (~100 ms) rotates through all columns
 * and changes the head <span>'s textContent, achieving the classic
 * matrix "morphing lead character" look without per-column timers.
 * On each animationiteration, all trail characters are re-randomised
 * so loops never look identical.
 */
(function () {
  'use strict';

  /* ── Tunables ──────────────────────────────────────────────────── */
  var CHARS       = 'BCDHJLMNRSTUWYbcdhjlmnrstuwy';
  var FONT_PX     = 18;       // font-size in px
  var LINE_H      = 2.4;      // line-height multiplier (vertical spacing)
  var COL_GAP     = 38;       // px between column centres
  var TRAIL_LEN   = 14;       // characters per falling strip
  var SPEED_MIN   = 7;        // seconds (slowest column)
  var SPEED_MAX   = 14;       // seconds (fastest column)
  var HEAD_ALPHA  = 0.16;     // head character opacity
  var TRAIL_ALPHA = 0.06;     // max trail-body opacity (linear fade)
  var HEAD_MS     = 40;       // head-character cycle interval (faster to match fall speed)

  /* ── State ─────────────────────────────────────────────────────── */
  var container   = null;
  var columns     = [];       // { el, head, spans[] }
  var headTimer   = null;
  var headIndex   = 0;        // round-robin pointer for head cycling
  var animating   = false;

  /* ── Helpers ───────────────────────────────────────────────────── */
  function rand(min, max) { return Math.random() * (max - min) + min; }
  function pickChar() { return CHARS[Math.floor(Math.random() * CHARS.length)]; }

  /* ── Build one column ──────────────────────────────────────────── */
  function createColumn() {
    var col = document.createElement('div');
    col.className = 'ub-rain-col';

    var dur   = rand(SPEED_MIN, SPEED_MAX);
    var delay = -rand(0, dur);              // pre-age: start mid-fall
    col.style.animationDuration = dur + 's';
    col.style.animationDelay    = delay + 's';

    var spans = [];
    for (var i = 0; i < TRAIL_LEN; i++) {
      var sp = document.createElement('span');
      sp.textContent = pickChar();

      // Opacity gradient: head (last span) brightest, fading toward top
      var t = i / (TRAIL_LEN - 1);           // 0 = top (faintest) → 1 = bottom (head)
      sp.style.opacity = (i === TRAIL_LEN - 1)
        ? HEAD_ALPHA
        : (TRAIL_ALPHA * t).toFixed(4);

      col.appendChild(sp);
      spans.push(sp);
    }

    var head = spans[spans.length - 1];

    // Re-randomise all characters on each loop iteration
    col.addEventListener('animationiteration', function () {
      for (var j = 0; j < spans.length; j++) {
        spans[j].textContent = pickChar();
      }
    });

    return { el: col, head: head, spans: spans };
  }

  /* ── Populate / trim columns to fill viewport width ────────────── */
  function syncColumns() {
    if (!container) return;
    var needed = Math.ceil(window.innerWidth / COL_GAP);

    // Add missing columns
    while (columns.length < needed) {
      var c = createColumn();
      c.el.style.left = (columns.length * COL_GAP) + 'px';
      container.appendChild(c.el);
      columns.push(c);
    }

    // Remove excess columns
    while (columns.length > needed) {
      var removed = columns.pop();
      if (removed.el.parentNode) removed.el.parentNode.removeChild(removed.el);
    }
  }

  /* ── Head-character cycling (single shared interval) ───────────── */
  // Classic matrix behaviour: on each tick the head gets a fresh random
  // character, and every span above it shifts up by one position — so the
  // trail is literally the history of previous head characters.
  function startHeadCycle() {
    if (headTimer) return;
    animating = true;
    headTimer = setInterval(function () {
      if (!columns.length) return;
      // Cycle a batch of columns per tick for even distribution
      var batch = Math.max(1, Math.ceil(columns.length / 6));
      for (var b = 0; b < batch; b++) {
        var col = columns[headIndex];
        var spans = col.spans;
        // Shift every character up by one (oldest falls off the top)
        for (var i = 0; i < spans.length - 1; i++) {
          spans[i].textContent = spans[i + 1].textContent;
        }
        // New random character at the head (bottom)
        col.head.textContent = pickChar();
        headIndex = (headIndex + 1) % columns.length;
      }
    }, HEAD_MS);
  }

  function stopHeadCycle() {
    animating = false;
    if (headTimer) {
      clearInterval(headTimer);
      headTimer = null;
    }
  }

  /* ── Mode switching ────────────────────────────────────────────── */
  function applyMode(mode) {
    if (mode === 'animate') {
      startHeadCycle();
    } else {
      // frozen + hidden: stop head cycling
      // CSS handles animation-play-state:paused (frozen) and display:none (hidden)
      stopHeadCycle();
    }
  }

  /* ── Resize handling ───────────────────────────────────────────── */
  var resizeTimer = null;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(syncColumns, 200);
  }

  /* ── Bootstrap ─────────────────────────────────────────────────── */
  function init() {
    container = document.createElement('div');
    container.className = 'ub-rain-bg';
    container.setAttribute('aria-hidden', 'true');
    document.body.appendChild(container);

    syncColumns();

    var mode = window.__ubBgMode || 'animate';
    applyMode(mode);

    window.addEventListener('motion-toggle', function (e) {
      applyMode(e.detail.mode);
    });

    window.addEventListener('resize', onResize);
  }

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
