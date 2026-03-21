/**
 * Zonai particles
 * ---------------
 * Spawns random Zonai-font characters that fade in and out at random
 * positions and sizes across the viewport background.
 *
 * Gated by the motion toggle (data-ub-bg attribute):
 *   'animate' -> particles spawn and animate
 *   'frozen'  -> existing particles freeze mid-animation, no new spawns
 *   'hidden'  -> all existing particles removed, container hidden by CSS
 *
 * PAUSE CORRECTNESS
 * -----------------
 * Cleanup uses animationend, NOT setTimeout.  animationend only fires while
 * the animation is actually playing, so CSS animation-play-state:paused
 * (applied by the frozen rule) correctly suspends both the visual and the
 * lifecycle.  On resume the animation continues from where it paused and
 * animationend fires when it truly completes.
 *
 * When switching to 'hidden', existing particles are explicitly cleared
 * because display:none on the container prevents animationend from ever
 * firing, which would otherwise leak elements and corrupt activeCount.
 */
(function () {
  'use strict';

  /* -- Configuration ------------------------------------------------ */
  var CHARS = 'BCDHJLMNRSTUWYbcdhjlmnrstuwy'.split('');
  var MAX_PARTICLES = 18;
  var SPAWN_INTERVAL = 1400;
  var LIFE_MIN = 9000;
  var LIFE_MAX = 16000;
  var SIZE_MIN = 1.2;
  var SIZE_MAX = 4.0;

  /* -- State -------------------------------------------------------- */
  var container = null;
  var activeCount = 0;
  var spawnTimer = null;
  var paused = false;

  /* -- Helpers ------------------------------------------------------ */
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function pickChar() {
    return CHARS[Math.floor(Math.random() * CHARS.length)];
  }

  /* -- Spawn position: avoid the central rune area ----------------- */
  // The background rune sits at the viewport centre (~48vmin wide/tall).
  // Exclusion ellipse centred at (50%, 50%), semi-axes 22% x, 28% y.
  function validPosition() {
    for (var attempt = 0; attempt < 12; attempt++) {
      var x = rand(3, 93);
      var y = rand(3, 93);
      var dx = x - 50;
      var dy = y - 50;
      if ((dx * dx) / (22 * 22) + (dy * dy) / (28 * 28) > 1) {
        return { x: x, y: y };
      }
    }
    return null;
  }

  /* -- Spawn a single particle ------------------------------------- */
  function spawn() {
    if (paused || activeCount >= MAX_PARTICLES || !container) return;

    var pos = validPosition();
    if (!pos) return;

    var el = document.createElement('span');
    el.className = 'ub-zonai-char';
    el.textContent = pickChar();
    el.setAttribute('aria-hidden', 'true');

    var life = rand(LIFE_MIN, LIFE_MAX);
    var size = rand(SIZE_MIN, SIZE_MAX);

    el.style.left = pos.x + '%';
    el.style.top = pos.y + '%';
    el.style.fontSize = size + 'rem';
    el.style.animationDuration = life + 'ms';

    activeCount++;
    container.appendChild(el);

    // animationend fires only while playing -- safe across pause/resume.
    el.addEventListener('animationend', function () {
      if (el.parentNode) el.parentNode.removeChild(el);
      activeCount = Math.max(0, activeCount - 1);
    }, { once: true });
  }

  /* -- Remove all existing particles (for hidden mode) ------------ */
  function clearAll() {
    if (!container) return;
    var chars = container.querySelectorAll('.ub-zonai-char');
    for (var i = 0; i < chars.length; i++) {
      if (chars[i].parentNode) chars[i].parentNode.removeChild(chars[i]);
    }
    activeCount = 0;
  }

  /* -- Spawner control --------------------------------------------- */
  function startSpawner() {
    if (spawnTimer) return;
    paused = false;
    spawnTimer = setInterval(spawn, SPAWN_INTERVAL);
    // Seed a few immediately so the background is not empty on load/resume
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

  /* -- React to motion toggle -------------------------------------- */
  function applyMode(mode) {
    if (!container) return;
    if (mode === 'animate') {
      startSpawner();
    } else if (mode === 'hidden') {
      stopSpawner();
      clearAll();
    } else {
      // frozen: stop new spawns; CSS animation-play-state:paused freezes visuals
      stopSpawner();
    }
  }

  /* -- Create DOM -------------------------------------------------- */
  function init() {
    container = document.createElement('div');
    container.className = 'ub-zonai-bg';
    container.setAttribute('aria-hidden', 'true');
    document.body.appendChild(container);

    var mode = window.__ubBgMode || 'animate';
    applyMode(mode);

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
