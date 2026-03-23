/**
 * Zonai particles
 * ---------------
 * Modes (driven by motion-toggle.js via data-ub-bg on <html>):
 *   'animate' -> particles spawn, animate, and cycle continuously
 *   'frozen'  -> a fixed set of particles sits visible and static
 *   'hidden'  -> no particles; container hidden by CSS
 *
 * PRE-AGING
 * ---------
 * Seeded particles use a negative animation-delay to start mid-animation
 * in the visible plateau (30-65% through their lifetime), so something is
 * on screen immediately. CSS animation-play-state:paused (frozen mode)
 * still renders the element at the correct opacity for the delayed position,
 * so pre-aged particles appear visible and static without any JS special case.
 *
 * PAUSE CORRECTNESS
 * -----------------
 * Cleanup uses animationend, not setTimeout. animationend only fires while
 * the animation is playing, so frozen mode suspends both visuals and lifecycle.
 * Switching to 'hidden' explicitly clears all particles because display:none
 * prevents animationend from ever firing.
 */
(function () {
  'use strict';

  var CHARS = 'BCDHJLMNRSTUWYbcdhjlmnrstuwy'.split('');
  var SPAWN_INTERVAL = 1400;
  var LIFE_MIN = 9000;
  var LIFE_MAX = 16000;
  var SIZE_MIN = 1.2;
  var SIZE_MAX = 4.0;

  // Scale particle counts with available screen area.
  // Breakpoints mirror MkDocs Material's responsive tiers.
  function particleLimits() {
    var w = window.innerWidth;
    if (w < 600)  return { max: 4,  initial: 3 };  // phone portrait
    if (w < 960)  return { max: 7,  initial: 4 };  // phone landscape / small tablet
    if (w < 1220) return { max: 11, initial: 6 };  // tablet
    return            { max: 18, initial: 7 };      // desktop
  }

  var container = null;
  var activeCount = 0;
  var spawnTimer = null;
  var animating = false;

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function pickChar() {
    return CHARS[Math.floor(Math.random() * CHARS.length)];
  }

  // Exclusion ellipse: avoid central rune area (semi-axes 22% x, 28% y)
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

  // Core spawn. preAge=true applies a negative delay so the particle starts
  // in the visible plateau (30-65% through its animation) rather than at opacity 0.
  function spawnOne(preAge) {
    if (activeCount >= particleLimits().max || !container) return;
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

    if (preAge) {
      el.style.animationDelay = '-' + Math.floor(life * rand(0.30, 0.65)) + 'ms';
    }

    activeCount++;
    container.appendChild(el);

    // Only fires while animation is playing -- paused state suspends this correctly.
    el.addEventListener('animationend', function () {
      if (el.parentNode) el.parentNode.removeChild(el);
      activeCount = Math.max(0, activeCount - 1);
    }, { once: true });
  }

  // Interval callback for animate mode
  function spawn() {
    if (!animating) return;
    spawnOne(false);
  }

  // Seed N pre-aged visible particles, staggered slightly to avoid a single burst
  function seedVisible(count) {
    var step = Math.min(150, 600 / count);
    for (var i = 0; i < count; i++) {
      (function (delay) {
        setTimeout(function () { spawnOne(true); }, delay);
      })(i * step);
    }
  }

  // Remove excess particles when the viewport shrinks below the current count
  function cullToLimit() {
    if (!container) return;
    var limit = particleLimits().max;
    var chars = container.querySelectorAll('.ub-zonai-char');
    for (var i = chars.length - 1; i >= limit; i--) {
      if (chars[i].parentNode) chars[i].parentNode.removeChild(chars[i]);
      activeCount = Math.max(0, activeCount - 1);
    }
  }

  function clearAll() {
    if (!container) return;
    var chars = container.querySelectorAll('.ub-zonai-char');
    for (var i = 0; i < chars.length; i++) {
      if (chars[i].parentNode) chars[i].parentNode.removeChild(chars[i]);
    }
    activeCount = 0;
  }

  function startSpawner() {
    if (spawnTimer) return;
    animating = true;
    spawnTimer = setInterval(spawn, SPAWN_INTERVAL);
  }

  function stopSpawner() {
    animating = false;
    if (spawnTimer) {
      clearInterval(spawnTimer);
      spawnTimer = null;
    }
  }

  function applyMode(mode) {
    if (!container) return;
    var limits = particleLimits();
    if (mode === 'animate') {
      // Seed immediately if screen is sparse (first load or coming from hidden)
      if (activeCount < 3) {
        seedVisible(limits.initial);
      }
      startSpawner();
    } else if (mode === 'frozen') {
      stopSpawner();
      // Seed if nothing is present (first load in frozen, or coming from hidden).
      // Existing animate particles are held visually by CSS animation-play-state:paused.
      if (activeCount === 0) {
        seedVisible(limits.initial);
      }
    } else { // hidden
      stopSpawner();
      clearAll(); // display:none prevents animationend -- must clear manually
    }
  }

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

    // Cull excess particles when the viewport shrinks (e.g. orientation change,
    // DevTools resize). Debounced to avoid thrashing on continuous resize.
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(cullToLimit, 200);
    });
  }

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
