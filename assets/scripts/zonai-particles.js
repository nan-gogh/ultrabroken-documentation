/**
 * Zonai particles
 * ───────────────
 * Spawns random Zonai-font characters that fade in and out at random
 * positions and sizes across the viewport background.
 *
 * Gated by the motion toggle (data-ub-bg attribute):
 *   'animate' → particles spawn and animate
 *   'frozen'  → existing particles freeze mid-animation, no new spawns
 *   'hidden'  → container hidden entirely
 */
(function () {
  'use strict';

  /* ── Configuration ─────────────────────────────────────────────── */
  var CHARS = 'BCDHJLMNRSTUWYbcdhjlmnrstuwy'.split('');
  var MAX_PARTICLES = 18;       // Max simultaneous characters on screen
  var SPAWN_INTERVAL = 1400;    // ms between new particle spawns
  var LIFE_MIN = 4000;          // Minimum particle lifetime (ms)
  var LIFE_MAX = 8000;          // Maximum particle lifetime (ms)
  var SIZE_MIN = 1.2;           // Minimum font-size (rem)
  var SIZE_MAX = 4.0;           // Maximum font-size (rem)

  /* ── State ─────────────────────────────────────────────────────── */
  var container = null;
  var activeCount = 0;
  var spawnTimer = null;
  var paused = false;

  /* ── Helpers ───────────────────────────────────────────────────── */
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function pickChar() {
    return CHARS[Math.floor(Math.random() * CHARS.length)];
  }

  /* ── Spawn a single particle ───────────────────────────────────── */
  function spawn() {
    if (paused || activeCount >= MAX_PARTICLES || !container) return;

    var el = document.createElement('span');
    el.className = 'ub-zonai-char';
    el.textContent = pickChar();
    el.setAttribute('aria-hidden', 'true');

    var life = rand(LIFE_MIN, LIFE_MAX);
    var size = rand(SIZE_MIN, SIZE_MAX);
    var x = rand(2, 96);   // % from left (avoid edge clipping)
    var y = rand(2, 96);   // % from top

    el.style.left = x + '%';
    el.style.top = y + '%';
    el.style.fontSize = size + 'rem';
    el.style.animationDuration = life + 'ms';
    el.style.transform = 'rotate(' + Math.floor(rand(0, 360)) + 'deg)';

    activeCount++;
    container.appendChild(el);

    // Self-remove after animation completes
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
      activeCount--;
    }, life);
  }

  /* ── Spawner control ───────────────────────────────────────────── */
  function startSpawner() {
    if (spawnTimer) return;
    paused = false;
    spawnTimer = setInterval(spawn, SPAWN_INTERVAL);
    // Seed a few immediately so the background isn't empty on load
    for (var i = 0; i < 4; i++) {
      setTimeout(spawn, i * 300);
    }
  }

  function stopSpawner() {
    paused = true;
    if (spawnTimer) {
      clearInterval(spawnTimer);
      spawnTimer = null;
    }
  }

  /* ── React to motion toggle ────────────────────────────────────── */
  function applyMode(mode) {
    if (!container) return;
    if (mode === 'animate') {
      startSpawner();
    } else {
      stopSpawner();
      // 'frozen' keeps existing particles visible (CSS pauses animation)
      // 'hidden' hides entire container (CSS display:none)
    }
  }

  /* ── Create DOM ────────────────────────────────────────────────── */
  function init() {
    container = document.createElement('div');
    container.className = 'ub-zonai-bg';
    container.setAttribute('aria-hidden', 'true');
    document.body.appendChild(container);

    // Read current mode (set by motion-toggle.js before this script loads)
    var mode = window.__ubBgMode || 'animate';
    applyMode(mode);

    // Listen for toggle changes
    window.addEventListener('motion-toggle', function (e) {
      applyMode(e.detail.mode);
    });
  }

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
