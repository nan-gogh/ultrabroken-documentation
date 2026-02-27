/**
 * Unified canvas background system
 * ────────────────────────────────
 * Combines: particles + constellations, background rune, bottom glow bar,
 * and 404 detection (rune flips upside-down on 404 pages).
 *
 * Reduced-motion behavior:
 *   OFF → everything animates normally (particles move, rune/glow pulse)
 *   ON  → a single frozen frame is rendered (no requestAnimationFrame loop)
 *
 * The OS reduced-motion preference is tracked live: if the user toggles it
 * while browsing, the canvas smoothly freezes or resumes.
 */
(function () {
  /* ------------------------------------------------------------------ */
  /*  Reduced-motion detection                                          */
  /* ------------------------------------------------------------------ */
  var mql = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  var reducedMotion = mql ? mql.matches : false;

  /* ------------------------------------------------------------------ */
  /*  Configuration                                                     */
  /* ------------------------------------------------------------------ */
  var cfg = {
    // Particles
    baseCount: 40,
    minSize: 1.0,
    maxSize: 3.5,
    minSpeed: 10,           // px / sec
    maxSpeed: 80,           // px / sec
    lineDistance: 300,       // px threshold for constellation lines
    lineMaxAlpha: 0.12,
    lineFalloff: 2.0,
    particleAlpha: 0.9,
    spawnPadding: 40,
    burstChance: 0.12,
    burstSize: 6,

    // Rune
    runeMinOpacity: 0.04,
    runeMaxOpacity: 0.10,
    runePulsePeriod: 4200,  // ms (full cycle)

    // Bottom glow bar
    glowHeight: 0.08,      // fraction of viewport height (≈8 vh)
    glowMinHeight: 80,     // px
    glowMinOpacity: 0.7,
    glowMaxOpacity: 1.0,
    glowPulsePeriod: 4200  // ms
  };

  /* ------------------------------------------------------------------ */
  /*  Canvas setup                                                      */
  /* ------------------------------------------------------------------ */
  function createCanvas() {
    var c = document.createElement('canvas');
    c.className = 'ub-particles-canvas';
    c.style.cssText = 'width:100%;height:100%;position:fixed;left:0;top:0;pointer-events:none;z-index:0;will-change:transform;';
    document.body.appendChild(c);
    return c;
  }

  var canvas = createCanvas();
  var ctx = canvas.getContext('2d');
  var DPR = Math.max(1, window.devicePixelRatio || 1);
  var W = 0, H = 0;
  var particles = [];

  /* ------------------------------------------------------------------ */
  /*  Rune image loading                                                */
  /* ------------------------------------------------------------------ */
  var runeImg = null;
  var runeReady = false;
  (function loadRune() {
    var img = new Image();
    // Resolve relative to site root (works for local dev and gh-pages)
    var base = (document.querySelector('link[rel="canonical"]') || {}).href || location.href;
    var siteRoot = base.replace(/\/[^/]*$/, '/');
    img.src = siteRoot + 'assets/images/ultrabroken_rune.svg';
    img.onload = function () {
      runeReady = true;
      // If reduced-motion froze a frame before the SVG was ready, re-render now
      if (reducedMotion && !loopRunning) renderFrozen();
    };
    runeImg = img;
  })();

  /* ------------------------------------------------------------------ */
  /*  404 detection  (merged from 404-detect.js)                        */
  /* ------------------------------------------------------------------ */
  var is404 = false;

  function detect404() {
    var title = (document.title || '').trim();
    if (/\b404\b|page not found|could not find/i.test(title)) return true;
    var main = document.querySelector('.md-content');
    if (!main) return false;
    var heading = main.querySelector('h1, h2, h3');
    if (heading && /\b404\b|page not found/i.test(heading.textContent)) return true;
    var text = (main.textContent || '').slice(0, 400).toLowerCase();
    if (text.indexOf('page not found') !== -1) return true;
    return false;
  }

  function refresh404() {
    is404 = detect404();
    document.body.classList.toggle('ultrabroken-404', is404);
  }

  /* ------------------------------------------------------------------ */
  /*  Resize handling                                                   */
  /* ------------------------------------------------------------------ */
  function resize() {
    DPR = Math.max(1, window.devicePixelRatio || 1);
    var rect = canvas.getBoundingClientRect();
    W = Math.max(300, Math.floor(rect.width));
    H = Math.max(200, Math.floor(rect.height));
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var area = (W * H) / (1366 * 768);
    var target = Math.max(12, Math.round(cfg.baseCount * area));
    while (particles.length < target) particles.push(makeParticle(true));
    while (particles.length > target) particles.pop();
  }

  /* ------------------------------------------------------------------ */
  /*  Particle helpers                                                  */
  /* ------------------------------------------------------------------ */
  function rand(a, b) { return a + Math.random() * (b - a); }

  function makeParticle(spawnInside, clusterX) {
    var size = rand(cfg.minSize, cfg.maxSize);
    var x = (typeof clusterX === 'number')
      ? Math.max(0, Math.min(W, clusterX + rand(-20, 20)))
      : rand(0, W);
    var y = spawnInside ? rand(H * 0.2, H) : H + rand(0, cfg.spawnPadding);
    var speed = rand(cfg.minSpeed, cfg.maxSpeed) / 1000;
    return {
      x: x, y: y,
      vx: rand(-10, 10) / 1000,
      vy: -speed,
      size: size,
      hue: 175 + Math.random() * 40,
      alpha: cfg.particleAlpha
    };
  }

  function makeBurstParticle(cx, cy) {
    var speed = rand(0.02, 0.09);
    return {
      x: cx + rand(-18, 18),
      y: cy + rand(-10, 10),
      vx: rand(-0.03, 0.03),
      vy: -speed,
      size: rand(1.2, 3.2),
      hue: 175 + Math.random() * 40,
      alpha: cfg.particleAlpha,
      burst: true
    };
  }

  /* ------------------------------------------------------------------ */
  /*  Update (particles only — rune + glow are time-based in render)    */
  /* ------------------------------------------------------------------ */
  function update(dt) {
    var dead = [];
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.burst) {
        if (p.y < -cfg.spawnPadding) dead.push(i);
        continue;
      }
      if (p.x < -20) p.x = W + 20;
      if (p.x > W + 20) p.x = -20;
      if (p.y < -cfg.spawnPadding) {
        if (Math.random() < cfg.burstChance) {
          var clusterX = p.x;
          Object.assign(p, makeParticle(false, clusterX));
          for (var j = 1; j < cfg.burstSize; j++) {
            particles.push(makeParticle(false, clusterX));
          }
          try {
            var area = (W * H) / (1366 * 768);
            var target = Math.max(12, Math.round(cfg.baseCount * area));
            var cap = Math.max(target, Math.round(target * 1.5));
            while (particles.length > cap) {
              var removed = false;
              for (var k = particles.length - 1; k >= 0; k--) {
                if (!particles[k].burst) { particles.splice(k, 1); removed = true; break; }
              }
              if (!removed) break;
            }
          } catch (e) { /* swallow */ }
        } else {
          Object.assign(p, makeParticle(false));
        }
      }
    }
    for (var i2 = dead.length - 1; i2 >= 0; i2--) particles.splice(dead[i2], 1);
  }

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */
  function render(now) {
    ctx.clearRect(0, 0, W, H);

    /* ---- Bottom glow bar ---- */
    renderGlowBar(now);

    /* ---- Background rune ---- */
    renderRune(now);

    /* ---- Constellation lines ---- */
    ctx.lineWidth = 1;
    for (var i = 0; i < particles.length; i++) {
      var a = particles[i];
      for (var j = i + 1; j < particles.length; j++) {
        var b = particles[j];
        var dx = a.x - b.x, dy = a.y - b.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < cfg.lineDistance) {
          var base = Math.max(0, 1 - dist / cfg.lineDistance);
          var alpha = Math.pow(base, cfg.lineFalloff) * cfg.lineMaxAlpha;
          ctx.strokeStyle = 'rgba(0,240,194,' + alpha.toFixed(3) + ')';
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    /* ---- Particles (drawn above lines) ---- */
    for (var pi = 0; pi < particles.length; pi++) {
      var p = particles[pi];
      var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, Math.max(4, p.size * 6));
      g.addColorStop(0, 'rgba(0,240,194,' + p.alpha + ')');
      g.addColorStop(0.35, 'rgba(0,240,194,' + Math.max(0.18, p.alpha * 0.35) + ')');
      g.addColorStop(1, 'rgba(0,240,194,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* ---- Rune sub-render ---- */
  function renderRune(now) {
    if (!runeReady) return;

    // Pulse opacity via sin wave
    var t = (now % cfg.runePulsePeriod) / cfg.runePulsePeriod;
    var sin01 = 0.5 + 0.5 * Math.sin(t * Math.PI * 2);
    var opacity = cfg.runeMinOpacity + (cfg.runeMaxOpacity - cfg.runeMinOpacity) * sin01;

    // Size: 48 vmin, capped at 60 vw / 60 vh
    var vmin = Math.min(W, H);
    var size = vmin * 0.48;
    size = Math.min(size, W * 0.6, H * 0.6);

    var cx = W / 2;
    var cy = H / 2;

    ctx.save();
    ctx.globalAlpha = reducedMotion ? (cfg.runeMinOpacity + cfg.runeMaxOpacity) / 2 : opacity;
    ctx.globalCompositeOperation = 'screen';
    ctx.translate(cx, cy);
    if (is404) ctx.scale(1, -1); // flip upside-down on 404 pages
    ctx.drawImage(runeImg, -size / 2, -size / 2, size, size);
    ctx.restore();
  }

  /* ---- Bottom glow bar sub-render ---- */
  function renderGlowBar(now) {
    var h = Math.max(cfg.glowMinHeight, H * cfg.glowHeight);
    // Small-viewport adjustment (mirrors former CSS @media max-width: 640px)
    var effectiveH = W <= 640 ? Math.max(56, H * 0.06) : h;

    // Pulse opacity
    var t = (now % cfg.glowPulsePeriod) / cfg.glowPulsePeriod;
    var sin01 = 0.5 + 0.5 * Math.sin(t * Math.PI * 2);
    var opacity = cfg.glowMinOpacity + (cfg.glowMaxOpacity - cfg.glowMinOpacity) * sin01;

    var grad = ctx.createLinearGradient(0, H - effectiveH, 0, H);
    grad.addColorStop(0, 'rgba(0,240,194,0)');
    grad.addColorStop(0.65, 'rgba(0,240,194,0.08)');
    grad.addColorStop(1, 'rgba(0,240,194,0.18)');

    ctx.save();
    ctx.globalAlpha = reducedMotion ? (cfg.glowMinOpacity + cfg.glowMaxOpacity) / 2 : opacity;
    ctx.fillStyle = grad;
    ctx.fillRect(0, H - effectiveH, W, effectiveH);
    ctx.restore();
  }

  /* ------------------------------------------------------------------ */
  /*  Animation loop                                                    */
  /* ------------------------------------------------------------------ */
  var last = 0;
  var loopRunning = false;

  function step(now) {
    if (!loopRunning) return;
    var dt = Math.min(60, now - last);
    last = now;
    update(dt);
    render(now);
    requestAnimationFrame(step);
  }

  /** Render a single frozen frame (reduced motion). */
  function renderFrozen() {
    resize();
    render(0);
  }

  /**
   * On mobile, position:fixed canvases can lose their painted content
   * when the browser recomposites during scroll.  Re-paint the frozen
   * frame on scroll so it never goes blank.  Throttled to ~1 per frame.
   */
  var scrollRepaintPending = false;
  window.addEventListener('scroll', function () {
    if (!reducedMotion || loopRunning) return;
    if (scrollRepaintPending) return;
    scrollRepaintPending = true;
    requestAnimationFrame(function () {
      scrollRepaintPending = false;
      render(0);
    });
  }, { passive: true });

  /** Start / resume the live animation loop. */
  function startLoop() {
    if (loopRunning) return;
    loopRunning = true;
    last = performance.now();
    requestAnimationFrame(step);
  }

  /** Stop the live animation loop. */
  function stopLoop() {
    loopRunning = false;
  }

  /* ------------------------------------------------------------------ */
  /*  Reduced-motion live toggle                                        */
  /* ------------------------------------------------------------------ */
  if (mql && mql.addEventListener) {
    mql.addEventListener('change', function (e) {
      reducedMotion = e.matches;
      if (reducedMotion) {
        stopLoop();
        renderFrozen();
      } else {
        startLoop();
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Click burst                                                       */
  /* ------------------------------------------------------------------ */
  window.addEventListener('click', function (e) {
    if (reducedMotion) return;
    particles.push(makeBurstParticle(e.clientX, e.clientY));
  });

  /* ------------------------------------------------------------------ */
  /*  Init                                                              */
  /* ------------------------------------------------------------------ */
  function init() {
    resize();
    window.addEventListener('resize', throttle(resize, 250));

    refresh404();
    attach404Observer();

    if (reducedMotion) {
      renderFrozen();
    } else {
      startLoop();
    }
  }

  /* ------------------------------------------------------------------ */
  /*  404 observer                                                      */
  /* ------------------------------------------------------------------ */
  function attach404Observer() {
    var target = document.body;
    if (!target) return;

    var mo = new MutationObserver(function () {
      refresh404();
      if (reducedMotion) renderFrozen();
    });
    mo.observe(target, { childList: true, subtree: true });

    window.addEventListener('popstate', function () {
      refresh404();
      if (reducedMotion) renderFrozen();
    });

    var _pushState = history.pushState;
    history.pushState = function () {
      _pushState.apply(this, arguments);
      setTimeout(function () {
        refresh404();
        if (reducedMotion) renderFrozen();
      }, 50);
    };
  }

  /* ------------------------------------------------------------------ */
  /*  Utility                                                           */
  /* ------------------------------------------------------------------ */
  function throttle(fn, wait) {
    var t = 0, timer = null;
    return function () {
      var now = Date.now();
      if (now - t > wait) { t = now; fn.apply(this, arguments); }
      else {
        clearTimeout(timer);
        timer = setTimeout(function () { t = Date.now(); fn.apply(this, arguments); }, wait - (now - t));
      }
    };
  }

  /* ------------------------------------------------------------------ */
  /*  Bootstrap                                                         */
  /* ------------------------------------------------------------------ */
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 200);
  } else {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 200); });
  }

  // Last-ditch 404 recheck
  setTimeout(refresh404, 300);
})();
