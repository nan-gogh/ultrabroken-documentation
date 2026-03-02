/**
 * Unified canvas background system
 * ────────────────────────────────
 * Combines: particles + constellations, background rune, bottom glow bar,
 * and 404 detection (rune flips upside-down on 404 pages).
 *
 * Three background modes (driven by motion-toggle.js):
 *   'animate' → everything animates normally (particles move, rune/glow pulse)
 *   'frozen'  → a single frozen frame is rendered (no requestAnimationFrame loop)
 *   'hidden'  → canvas wrapper hidden entirely, plain background colour
 *
 * Mode is driven by the in-page toggle (motion-toggle.js)
 * via the 'motion-toggle' CustomEvent and localStorage('ub-bg-mode').
 */
(function () {
  /* ------------------------------------------------------------------ */
  /*  Background mode detection (from in-page toggle)                    */
  /* ------------------------------------------------------------------ */
  var bgMode = window.__ubBgMode || 'animate';
  var reducedMotion = bgMode !== 'animate';

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
    // The canvas must NOT be position:fixed itself — mobile Chromium
    // browsers discard fixed-position canvas GPU layers during address-
    // bar transitions.  Instead we wrap it in a fixed <div> (trivially
    // cheap for the compositor to retain) and make the canvas absolute
    // inside it.  Visually identical, but the canvas is never treated
    // as a special fixed compositing layer.
    var wrapper = document.createElement('div');
    wrapper.className = 'ub-canvas-wrapper';
    var c = document.createElement('canvas');
    c.className = 'ub-particles-canvas';
    wrapper.appendChild(c);
    document.body.appendChild(wrapper);
    return c;
  }

  var canvas = createCanvas();
  var ctx = canvas.getContext('2d');
  var DPR = Math.max(1, window.devicePixelRatio || 1);
  var W = 0, H = 0;
  var particles = [];
  var contextLost = false;

  // Paint a frozen first frame as soon as possible so the canvas is never
  // blank during the 200ms deferred init window. A 0ms timeout ensures all
  // var initialisations in this IIFE have completed (hoisting safety).
  // Skip in 'hidden' mode — CSS already prevents any flash there.
  if (bgMode !== 'hidden') {
    setTimeout(renderFrozenEarly, 0);
  }

  function renderFrozenEarly() {
    // Lightweight first-frame paint: size canvas, seed particles, render once.
    // Deliberately avoids touching lockedW/lockedH — resize() in init() will
    // reconcile those. We just need something visible ASAP.
    DPR = Math.max(1, window.devicePixelRatio || 1);
    W = Math.max(300, Math.floor(window.innerWidth));
    H = Math.max(200, Math.floor(window.innerHeight)) + 100; // 100 = BUFFER
    var wrapper = canvas.parentNode;
    if (wrapper) { wrapper.style.width = W + 'px'; wrapper.style.height = H + 'px'; }
    canvas.width  = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var area = (W * H) / (1366 * 768);
    var target = Math.max(12, Math.round(cfg.baseCount * area));
    while (particles.length < target) particles.push(makeParticle(true));
    render(0);
  }

  /* ------------------------------------------------------------------ */
  /*  Canvas context-loss recovery                                      */
  /* ------------------------------------------------------------------ */
  // Mobile browsers can invalidate the 2D context during GPU memory
  // pressure (e.g. address-bar transitions, tab switching).  After loss
  // every draw call is a silent no-op — the canvas stays blank until we
  // re-acquire the context.
  canvas.addEventListener('contextlost', function (e) {
    e.preventDefault();          // request the browser to restore later
    contextLost = true;
  });
  canvas.addEventListener('contextrestored', function () {
    contextLost = false;
    ctx = canvas.getContext('2d');
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    render(performance.now());   // repaint immediately
  });

  /* ------------------------------------------------------------------ */
  /*  Site-root detection (used for asset URLs)                          */
  /* ------------------------------------------------------------------ */
  // The script tag lives at <site-root>/assets/scripts/particles-constellations.js
  // so stripping that suffix gives us the site root reliably, regardless of
  // what page we're on or whether a canonical link exists.
  var _scriptEl = document.currentScript;
  var _siteRoot = (_scriptEl && _scriptEl.src)
    ? _scriptEl.src.replace(/assets\/scripts\/[^/]+$/, '')
    : (location.href.replace(/\/[^/]*$/, '/'));   // last-resort fallback

  var runeImg = null;
  var runeReady = false;
  (function loadRune() {
    var img = new Image();
    img.onload = function () {
      runeReady = true;
      // If reduced-motion froze a frame before the SVG was ready, re-render now
      if (reducedMotion && !loopRunning) renderFrozen();
    };
    img.src = _siteRoot + 'assets/images/ultrabroken_rune.svg';
    // For cached images the browser may have already loaded the resource before
    // onload fires (or img.complete is true right after src is set).
    // Detect this synchronously so the very first frame includes the rune.
    if (img.complete) runeReady = true;
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
  // Dimension ratchets: we only ever *grow* the locked values.  On mobile
  // the address bar toggling changes innerHeight (portrait) or innerWidth
  // (landscape) by ~60-100 px.  By never shrinking, the canvas buffer is
  // never re-allocated, preventing GPU layer discard and flicker.
  //
  // Pre-size each axis with a 100 px buffer so the "chrome hidden" size
  // is already covered from the very first frame - the first collapse in
  // either orientation never triggers a resize.  The wrapper's
  // overflow:hidden clips any extra pixels invisibly.
  var BUFFER = 100;
  var lockedW = Math.floor(window.innerWidth);
  var lockedH = Math.floor(window.innerHeight) + BUFFER;

  // Zoom detection baseline.  baseDPR is the devicePixelRatio at the
  // time the canvas was last genuinely sized.  During a Ctrl+zoom the
  // DPR changes but the physical (hardware) pixel area stays constant;
  // during a genuine resize or monitor switch, the physical area changes.
  var baseDPR   = DPR;
  var basePhysW = window.innerWidth  * DPR;
  var basePhysH = window.innerHeight * DPR;

  function resize(force) {
    if (contextLost) return;     // nothing useful we can do without a context
    var newDPR = Math.max(1, window.devicePixelRatio || 1);

    // ── Skip during mobile pinch-zoom (compensate() handles it) ──
    var vv = window.visualViewport;
    if (vv && vv.scale > 1.01) { DPR = newDPR; return; }

    // ── Skip during desktop Ctrl+zoom ──
    // DPR changed but physical display area is roughly constant.
    if (!force && Math.abs(newDPR - baseDPR) > 0.01) {
      var physW = window.innerWidth  * newDPR;
      var physH = window.innerHeight * newDPR;
      if (Math.abs(physW - basePhysW) < basePhysW * 0.12 &&
          Math.abs(physH - basePhysH) < basePhysH * 0.12) {
        // Pure desktop zoom — compensate() applies a counter-transform.
        DPR = newDPR;
        return;
      }
      // DPR changed AND physical pixels changed → monitor switch.
      // Reset zoom baseline and fall through to full re-layout.
      baseDPR   = newDPR;
      basePhysW = physW;
      basePhysH = physH;
      var wrapper = canvas.parentNode;
      if (wrapper) wrapper.style.transform = '';
    }

    DPR = newDPR;
    var rawW = Math.max(300, Math.floor(window.innerWidth));
    var rawH = Math.max(200, Math.floor(window.innerHeight));

    // Orientation change: either axis shifts by >100 px - reset both
    // locks with a fresh buffer for the new orientation.
    var wDelta = W > 0 ? Math.abs(rawW - W) : 0;
    var hDelta = W > 0 ? Math.abs(rawH - H) : 0;
    if (wDelta > 100 || hDelta > 100) {
      lockedW = rawW;
      lockedH = rawH + BUFFER;
    }

    // Ratchet: only grow.
    if (rawW > lockedW) lockedW = rawW;
    if (rawH > lockedH) lockedH = rawH;
    var newW = lockedW;
    var newH = lockedH;

    if (!force && W === newW && H === newH) return;

    W = newW;
    H = newH;

    // Set the wrapper's CSS size in fixed px (canvas fills 100% of it).
    var wrapper = canvas.parentNode;
    wrapper.style.width  = W + 'px';
    wrapper.style.height = H + 'px';

    // Only reallocate the backing store if the pixel dimensions actually
    // changed.  Setting canvas.width / canvas.height ALWAYS clears the
    // bitmap - even to the same value - which causes a visible blank
    // frame on mobile during address-bar transitions.
    var needW = Math.floor(W * DPR);
    var needH = Math.floor(H * DPR);
    var cleared = false;
    if (canvas.width !== needW || canvas.height !== needH) {
      canvas.width  = needW;
      canvas.height = needH;
      cleared = true;
    }
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // Spawn particles to fill the pool for the current viewport.
    // NEVER cull particles here — resize fires on scroll due to
    // mobile address-bar transitions and would destroy click-burst
    // particles. update() already handles the full particle lifecycle:
    // ambient particles recycle at the screen top, burst particles
    // are removed when off-screen, and burst-cluster spawns have a cap.
    var area = (W * H) / (1366 * 768);
    var target = Math.max(12, Math.round(cfg.baseCount * area));
    while (particles.length < target) particles.push(makeParticle(true));

    // If we just cleared the bitmap, repaint synchronously so there is
    // never a blank frame visible to the user.
    if (cleared) render(performance.now());
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
    if (contextLost) return;
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
    if (!loopRunning || contextLost) return;
    var dt = Math.min(60, now - last);
    last = now;
    update(dt);
    render(now);
    requestAnimationFrame(step);
  }

  /** Render a single frozen frame (reduced motion). */
  function renderFrozen() {
    resize(true);
    render(0);
  }

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
  /*  Background mode live toggle (from in-page button)                  */
  /* ------------------------------------------------------------------ */
  function showCanvas()  {
    var w = canvas.parentNode;
    if (w) w.style.display = '';
  }
  function hideCanvas()  {
    var w = canvas.parentNode;
    if (w) w.style.display = 'none';
  }

  window.addEventListener('motion-toggle', function (e) {
    bgMode = (e.detail && e.detail.mode) || 'animate';
    reducedMotion = bgMode !== 'animate';

    if (bgMode === 'hidden') {
      stopLoop();
      hideCanvas();
    } else if (bgMode === 'frozen') {
      stopLoop();
      showCanvas();
      renderFrozen();
    } else {
      showCanvas();
      startLoop();
    }
  });

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
    attachZoomCompensation();

    refresh404();
    attach404Observer();

    if (bgMode === 'hidden') {
      hideCanvas();
    } else if (bgMode === 'frozen') {
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
  /*  Zoom compensation (mobile pinch + desktop Ctrl+zoom)              */
  /* ------------------------------------------------------------------ */
  // Two kinds of zoom exist:
  //  • Mobile pinch / trackpad pinch → visualViewport.scale changes.
  //  • Desktop Ctrl+±  → devicePixelRatio changes, vv.scale stays 1,
  //    but vv.width/height change (CSS-pixel viewport shrinks/grows).
  //
  // In both cases we apply a single CSS counter-transform on the wrapper
  // so the background stays at its original apparent size & position,
  // like a wallpaper unaffected by zoom.
  function attachZoomCompensation() {
    var vv      = window.visualViewport;
    var wrapper = canvas.parentNode;
    if (!wrapper) return;

    function compensate() {
      // Pinch-zoom factor (mobile / trackpad).  Always 1 on desktop
      // Ctrl+zoom.
      var pinchScale = vv ? vv.scale : 1;

      // Desktop Ctrl+zoom factor.  DPR rises when zooming in, while
      // baseDPR records the value at last genuine (non-zoom) resize.
      var currentDPR = Math.max(1, window.devicePixelRatio || 1);
      var dprZoom    = baseDPR > 0 ? (currentDPR / baseDPR) : 1;

      var totalZoom = pinchScale * dprZoom;

      if (totalZoom > 0.999 && totalZoom < 1.001) {
        // No effective zoom — clear any leftover transform.
        wrapper.style.transform = '';
        return;
      }

      // Visual-viewport offset (non-zero only during pinch-zoom).
      var offX = vv ? vv.offsetLeft : 0;
      var offY = vv ? vv.offsetTop  : 0;

      wrapper.style.transform =
        'translate(' + offX + 'px, ' + offY + 'px) ' +
        'scale(' + (1 / totalZoom) + ')';
    }

    // visualViewport events cover pinch-zoom AND desktop Ctrl+zoom
    // (viewport dimensions change in both cases).
    if (vv) {
      vv.addEventListener('resize', compensate);
      vv.addEventListener('scroll', compensate);
    }
    // Fallback / belt-and-suspenders for browsers or edge cases where
    // visualViewport doesn't fire.  compensate() is cheap & idempotent.
    window.addEventListener('resize', compensate);
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
