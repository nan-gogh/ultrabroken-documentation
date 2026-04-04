/**
 * graph-view.js — Interactive force-directed graph for Ultrabroken Archives
 * =========================================================================
 * Renders a Canvas-based graph visualisation of how glitchcraft pages
 * reference each other, similar to Obsidian's graph view.
 *
 * Physics model: Obsidian-style force-directed graph with
 *   - Alpha (temperature) decay for smooth convergence
 *   - Many-body repulsion (Coulomb 1/dist², Barnes–Hut O(n log n))
 *   - Spring link force with degree-weighted strength
 *   - Per-node center gravity (Obsidian "center force")
 *   - All forces have a minimum alpha floor so the lattice self-heals
 *   - Velocity decay (friction) per tick
 *
 * Data source: assets/data/graph.json  (built by build_bm25_index.py)
 */

(function () {
  'use strict';

  /* ── simulation parameters (d3-force model) ──────────────────── */

  // Alpha (temperature) system — simulation cools as alpha → 0
  var ALPHA         = 1;        // current temperature (set during warmup)
  var ALPHA_MIN     = 0.001;    // stop when alpha falls below this
  var ALPHA_DECAY   = 0.0228;   // ~300 ticks to converge: 1 - pow(0.001, 1/300)
  var ALPHA_TARGET  = 0;        // target alpha (0 = cool to rest)
  var VELOCITY_DECAY = 0.4;     // friction: vel *= (1 - this) each tick

  // Many-body (repulsion) — negative = repel
  var CHARGE        = -800;     // long-range repulsion strength
  var DIST_MIN      = 1;        // avoid infinite force at coincident points
  var DIST_MAX      = 2000;     // repulsion effective over very large range
  var BH_THETA      = 0.9;      // Barnes–Hut approximation threshold (s/d ratio)

  // Short-range collision (nuclear-style hard repulsion)
  var COLLIDE_RADIUS = 30;      // minimum spacing between node centres
  var COLLIDE_STRENGTH = 0.7;   // how strongly overlaps are resolved (0–1)

  // Link (spring attraction)
  var LINK_DIST     = 200;      // resting spring length (wide spacing)

  // Center gravity: per-node pull toward origin (Obsidian's "center force")
  // Keeps the graph cohesive and pulls strays back — always-on via alpha floor
  // Much lower than Obsidian's 0.48 because our repulsion model differs
  var CENTER_STRENGTH = 0.03;

  // Max velocity cap to prevent explosion
  var MAX_VEL       = 50;

  // Node sizing
  var MIN_NODE_R    = 3;
  var MAX_NODE_R    = 14;
  var FONT          = '8px Texturina, Georgia, serif';
  var FONT_BOLD     = 'bold 9px Texturina, Georgia, serif';

  /* colours */
  var CLR_BG        = '#1a1a2e';
  var CLR_NODE      = '#00f0c2';
  var CLR_NODE_DIM  = 'rgba(0,240,194,0.15)';
  var CLR_EDGE      = 'rgba(0,240,194,0.12)';
  var CLR_EDGE_HI   = 'rgba(0,240,194,0.6)';
  var CLR_LABEL     = '#c0c0c0';
  var CLR_LABEL_HI  = '#ffffff';
  var CLR_GLOW      = '#00f0c2';
  var CLR_NODE_HOVER = '#ffffff';

  /* ── state ───────────────────────────────────────────────────── */
  var nodes = [];           // [{id,name,label,x,y,vx,vy,r,degree,edges:[],linkStrength}]
  var edges = [];           // [{source:nodeRef, target:nodeRef, strength:n}]
  var nodeMap = {};         // id → node

  var canvas, ctx, W, H;
  var dpr = window.devicePixelRatio || 1;

  // Camera: pan + zoom
  var camX = 0, camY = 0, zoom = 1;
  var minZoom = 0.15, maxZoom = 5;

  // Interaction
  var hoveredNode  = null;
  var dragNode     = null;
  var dragTargetX  = 0;     // cursor position in world coords — physics cannot override this
  var dragTargetY  = 0;
  var dragStartSX  = 0;     // screen-pixel position at drag start (for click-vs-drag)
  var dragStartSY  = 0;
  var isPanning    = false;
  var panStartX, panStartY, panCamX, panCamY;
  var pointer = { x: 0, y: 0 };

  var running = true;
  var simAlpha = 1;          // live simulation alpha
  var tickCount = 0;

  /* ── helpers ─────────────────────────────────────────────────── */

  function screenToWorld(sx, sy) {
    return {
      x: (sx - W / 2) / zoom + camX,
      y: (sy - H / 2) / zoom + camY
    };
  }

  function hitTest(wx, wy) {
    // Reverse iteration so top-drawn nodes (last) are hit first
    for (var i = nodes.length - 1; i >= 0; i--) {
      var n = nodes[i];
      var dx = wx - n.x, dy = wy - n.y;
      if (dx * dx + dy * dy <= (n.r + 4) * (n.r + 4)) return n;
    }
    return null;
  }

  /* ── data loading ────────────────────────────────────────────── */

  function load(cb) {
    // Use the global site-root base path
    var url = window.__ub_base + 'assets/data/graph.json';

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        try { cb(JSON.parse(xhr.responseText)); } catch (e) { console.error('graph.json parse error', e); }
      } else {
        console.warn('graph.json not found (' + xhr.status + ')');
      }
    };
    xhr.onerror = function () { console.warn('graph.json fetch error'); };
    xhr.send();
  }

  /* ── initialise graph data ───────────────────────────────────── */

  function init(data) {
    var rawNodes = data.nodes || [];
    var rawEdges = data.edges || [];

    // Phyllotaxis spiral for deterministic, evenly-spaced initial positions
    // (same approach as d3-force)
    var PHI = (1 + Math.sqrt(5)) / 2;  // golden ratio
    var spacing = 10;

    for (var i = 0; i < rawNodes.length; i++) {
      var rn = rawNodes[i];
      var angle = i * PHI * 2 * Math.PI;
      var radius = spacing * Math.sqrt(i + 0.5);
      var node = {
        id:     rn.id,
        name:   rn.name || '',
        label:  rn.label || '',
        x:      Math.cos(angle) * radius,
        y:      Math.sin(angle) * radius,
        vx:     0,
        vy:     0,
        r:      MIN_NODE_R,
        degree: 0,
        edges:  []
      };
      nodes.push(node);
      nodeMap[node.id] = node;
    }

    // Create edges (skip if either end missing)
    for (var j = 0; j < rawEdges.length; j++) {
      var re = rawEdges[j];
      var s = nodeMap[re.source];
      var t = nodeMap[re.target];
      if (!s || !t) continue;
      var edge = { source: s, target: t, strength: 0 };
      edges.push(edge);
      s.degree++;
      t.degree++;
      s.edges.push(edge);
      t.edges.push(edge);
    }

    // Compute per-edge strength: 1 / min(degree_source, degree_target)
    // This automatically weakens links to heavily-connected hub nodes
    // (d3-force default), preventing hubs from being ripped apart
    for (var ei = 0; ei < edges.length; ei++) {
      var e = edges[ei];
      var minDeg = Math.min(e.source.degree || 1, e.target.degree || 1);
      e.strength = 1 / minDeg;
    }

    // Scale node radius by degree
    var maxDeg = 1;
    for (var k = 0; k < nodes.length; k++) {
      if (nodes[k].degree > maxDeg) maxDeg = nodes[k].degree;
    }
    for (var m = 0; m < nodes.length; m++) {
      nodes[m].r = MIN_NODE_R + (MAX_NODE_R - MIN_NODE_R) * Math.sqrt(nodes[m].degree / maxDeg);
    }
  }

  /* ── Barnes–Hut quadtree (O(n log n) many-body) ────────────────── */

  function qtBuild() {
    if (nodes.length === 0) return null;
    var x0 = nodes[0].x, y0 = nodes[0].y, x1 = x0, y1 = y0;
    for (var i = 1; i < nodes.length; i++) {
      var nd = nodes[i];
      if (nd.x < x0) x0 = nd.x; if (nd.y < y0) y0 = nd.y;
      if (nd.x > x1) x1 = nd.x; if (nd.y > y1) y1 = nd.y;
    }
    // Square bounding box with 1-unit padding
    var dx = x1 - x0, dy = y1 - y0;
    if (dx > dy) { var p = (dx - dy) / 2; y0 -= p; y1 += p; }
    else         { var p = (dy - dx) / 2; x0 -= p; x1 += p; }
    var sz = (x1 - x0) || 1;
    var root = { x0: x0, y0: y0, sz: sz, cx: 0, cy: 0, m: 0, body: null, ch: null };
    for (var i = 0; i < nodes.length; i++) qtInsert(root, nodes[i], 0);
    return root;
  }

  function qtInsert(q, body, depth) {
    if (depth > 40) return; // guard against coincident nodes
    if (q.m === 0 && !q.body) {
      q.body = body; q.cx = body.x; q.cy = body.y; q.m = 1;
      return;
    }
    if (q.body) {
      var old = q.body; q.body = null;
      if (!q.ch) q.ch = [null, null, null, null];
      qtChild(q, old, depth);
    }
    if (!q.ch) q.ch = [null, null, null, null];
    qtChild(q, body, depth);
    q.cx = (q.cx * q.m + body.x) / (q.m + 1);
    q.cy = (q.cy * q.m + body.y) / (q.m + 1);
    q.m += 1;
  }

  function qtChild(q, body, depth) {
    var half = q.sz / 2, midX = q.x0 + half, midY = q.y0 + half;
    var idx = (body.x < midX ? 0 : 1) + (body.y < midY ? 0 : 2);
    if (!q.ch[idx]) {
      var cx0 = (idx & 1) ? midX : q.x0;
      var cy0 = (idx & 2) ? midY : q.y0;
      q.ch[idx] = { x0: cx0, y0: cy0, sz: half, cx: 0, cy: 0, m: 0, body: null, ch: null };
    }
    qtInsert(q.ch[idx], body, depth + 1);
  }

  function qtForce(q, node, alpha) {
    if (!q || q.m === 0) return;
    var dx = q.cx - node.x, dy = q.cy - node.y;
    var dist2 = dx * dx + dy * dy;
    if (q.body) {
      if (q.body === node) return;
      var dist = Math.sqrt(dist2);
      if (dist < DIST_MIN) dist = DIST_MIN;
      if (dist > DIST_MAX) return;
      var f = alpha * CHARGE / (dist * dist);
      node.vx += (dx / dist) * f;
      node.vy += (dy / dist) * f;
      return;
    }
    // Barnes–Hut criterion: treat cell as single body if s/d < θ
    if (q.sz * q.sz < BH_THETA * BH_THETA * dist2) {
      var dist = Math.sqrt(dist2);
      if (dist < DIST_MIN) dist = DIST_MIN;
      if (dist > DIST_MAX) return;
      var f = alpha * CHARGE * q.m / (dist * dist);
      node.vx += (dx / dist) * f;
      node.vy += (dy / dist) * f;
      return;
    }
    if (q.ch) {
      for (var c = 0; c < 4; c++) if (q.ch[c]) qtForce(q.ch[c], node, alpha);
    }
  }

  /* ── physics simulation (d3-force model) ──────────────────────── */

  function tick() {
    var i, j, n, n2, edge, dx, dy, dist, force, fx, fy;

    // ① Update alpha (simulated annealing cooldown)
    simAlpha += (ALPHA_TARGET - simAlpha) * ALPHA_DECAY;

    // Minimum alpha floor — all variable forces use this so the lattice
    // is always weakly self-correcting even after the sim has "cooled"
    var effectiveAlpha = Math.max(simAlpha, 0.01);

    // ② Many-body repulsion via Barnes–Hut quadtree (O(n log n))
    var tree = qtBuild();
    if (tree) {
      for (i = 0; i < nodes.length; i++) {
        qtForce(tree, nodes[i], effectiveAlpha);
      }
    }

    // ③ Link spring force: pull linked nodes toward LINK_DIST
    //    Strength is per-edge: 1/min(deg_source, deg_target)
    for (i = 0; i < edges.length; i++) {
      edge = edges[i];
      dx = edge.target.x - edge.source.x;
      dy = edge.target.y - edge.source.y;
      dist = Math.sqrt(dx * dx + dy * dy) || 1;

      // Spring: F = strength * effectiveAlpha * (dist - restLength) / dist
      force = edge.strength * effectiveAlpha * (dist - LINK_DIST) / dist;
      fx = dx * force;
      fy = dy * force;
      edge.source.vx += fx;
      edge.source.vy += fy;
      edge.target.vx -= fx;
      edge.target.vy -= fy;
    }

    // ④ Collision force: short-range hard repulsion like nuclear force
    //    Prevents nodes from overlapping regardless of charge
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      var ri = n.r + COLLIDE_RADIUS;
      for (j = i + 1; j < nodes.length; j++) {
        n2 = nodes[j];
        dx = n2.x - n.x;
        dy = n2.y - n.y;
        dist = Math.sqrt(dx * dx + dy * dy);
        var minSep = ri + n2.r + COLLIDE_RADIUS;
        if (dist < minSep && dist > 0) {
          // Push apart proportional to overlap
          var overlap = (minSep - dist) / dist * COLLIDE_STRENGTH * 0.5;
          var ox = dx * overlap;
          var oy = dy * overlap;
          n.x  -= ox;
          n.y  -= oy;
          n2.x += ox;
          n2.y += oy;
        }
      }
    }

    // ⑤ Center force: per-node pull toward origin (Obsidian-style gravity)
    //    Uses effectiveAlpha so it's always weakly active
    var centerK = effectiveAlpha * CENTER_STRENGTH;
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      n.vx -= n.x * centerK;
      n.vy -= n.y * centerK;
    }

    // ⑥ Velocity decay (friction) + velocity cap + position integration
    var decay = 1 - VELOCITY_DECAY;
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      if (n === dragNode) { n.vx = 0; n.vy = 0; continue; }

      // Apply friction
      n.vx *= decay;
      n.vy *= decay;

      // Clamp velocity to prevent explosion
      var speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
      if (speed > MAX_VEL) {
        n.vx = (n.vx / speed) * MAX_VEL;
        n.vy = (n.vy / speed) * MAX_VEL;
      }

      // Integrate position
      n.x += n.vx;
      n.y += n.vy;
    }

    tickCount++;
  }

  /** Check if simulation has cooled — velocity-based so the sim stays
   *  alive as long as any node is actually moving (e.g. stray returning) */
  function isSettled() {
    if (dragNode) return false;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.vx * n.vx + n.vy * n.vy > 0.0001) return false;
    }
    return true;
  }

  /** Reheat simulation (e.g. during interaction) */
  function reheat(alpha) {
    if (simAlpha < alpha) simAlpha = alpha;
  }

  /* ── rendering ───────────────────────────────────────────────── */

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-camX, -camY);

    var hNode = hoveredNode;
    var connectedSet = null;

    if (hNode) {
      connectedSet = {};
      connectedSet[hNode.id] = true;
      for (var e = 0; e < hNode.edges.length; e++) {
        var ed = hNode.edges[e];
        connectedSet[ed.source.id] = true;
        connectedSet[ed.target.id] = true;
      }
    }

    // Draw edges
    for (var i = 0; i < edges.length; i++) {
      var edge = edges[i];
      var hi = hNode && (edge.source === hNode || edge.target === hNode);
      // Only draw edges when connected to hovered node; hide all otherwise
      if (!hi) continue;
      ctx.strokeStyle = hi ? CLR_EDGE_HI : CLR_EDGE;
      ctx.lineWidth   = hi ? 1.5 : 0.5;
      ctx.beginPath();
      ctx.moveTo(edge.source.x, edge.source.y);
      ctx.lineTo(edge.target.x, edge.target.y);
      ctx.stroke();
    }

    // Draw nodes
    for (var j = 0; j < nodes.length; j++) {
      var n = nodes[j];
      var isHovered = n === hNode;
      var isConnected = connectedSet && connectedSet[n.id];
      var dimmed = hNode && !isConnected;

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);

      if (isHovered) {
        // Glow effect
        ctx.shadowColor = CLR_GLOW;
        ctx.shadowBlur = 15;
        ctx.fillStyle = CLR_NODE_HOVER;
      } else if (dimmed) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = CLR_NODE_DIM;
      } else {
        ctx.shadowBlur = 0;
        ctx.fillStyle = CLR_NODE;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Draw labels (only when zoomed in enough, or for hovered + connected)
    var showAll = zoom > 1.4;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (var k = 0; k < nodes.length; k++) {
      var nd = nodes[k];
      var isH = nd === hNode;
      var isC = connectedSet && connectedSet[nd.id];
      var dim = hNode && !isC;

      if (!showAll && !isH && !isC) continue;

      ctx.font = isH ? FONT_BOLD : FONT;
      ctx.fillStyle = isH ? CLR_LABEL_HI : dim ? 'rgba(192,192,192,0.2)' : CLR_LABEL;

      // Show label when zoomed out, full name when zoomed in or hovered
      var label = (isH || zoom > 2.0) ? nd.name : (nd.label || nd.name);
      ctx.fillText(label, nd.x, nd.y + nd.r + 3);
    }

    ctx.restore();

    // HUD: node count
    ctx.font = '11px monospace';
    ctx.fillStyle = 'rgba(192,192,192,0.5)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(nodes.length + ' glitches · ' + edges.length + ' links', 8, 8);
  }

  /* ── animation loop ──────────────────────────────────────────── */

  function frame() {
    if (!running) return;
    // While dragging, maintain a gentle alpha floor so connected nodes
    // follow softly — but never pump it higher than what's already there
    if (dragNode && simAlpha < 0.02) simAlpha = 0.02;
    // Keep ticking while simulation is hot or being dragged
    // Hover is visual-only and must NOT burn alpha
    if (!isSettled()) {
      tick();
    }
    // Physics (collision + center-of-mass) shifts all positions each tick,
    // including the dragged node. Restore it to the cursor target so it
    // stays pinned to the mouse regardless of what the simulation does.
    if (dragNode) { dragNode.x = dragTargetX; dragNode.y = dragTargetY; }
    draw();
    requestAnimationFrame(frame);
  }

  /* ── resize ──────────────────────────────────────────────────── */

  function resize() {
    var container = canvas.parentElement;
    W = container.clientWidth;
    H = container.clientHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
  }

  /* ── input handlers ──────────────────────────────────────────── */

  function onMouseMove(e) {
    var rect = canvas.getBoundingClientRect();
    var sx = e.clientX - rect.left;
    var sy = e.clientY - rect.top;
    pointer.x = sx;
    pointer.y = sy;

    if (isPanning) {
      camX = panCamX - (sx - panStartX) / zoom;
      camY = panCamY - (sy - panStartY) / zoom;
      return;
    }

    if (dragNode) {
      var w = screenToWorld(sx, sy);
      dragNode.x = w.x;
      dragNode.y = w.y;
      dragTargetX = w.x;
      dragTargetY = w.y;
      return;
    }

    var w2 = screenToWorld(sx, sy);
    var hit = hitTest(w2.x, w2.y);
    if (hit !== hoveredNode) {
      hoveredNode = hit;
      canvas.style.cursor = hit ? 'pointer' : 'default';
    }
  }

  function onMouseDown(e) {
    var rect = canvas.getBoundingClientRect();
    var sx = e.clientX - rect.left;
    var sy = e.clientY - rect.top;

    // Middle button or Ctrl+left → pan
    if (e.button === 1 || (e.button === 0 && (e.ctrlKey || e.metaKey))) {
      isPanning = true;
      panStartX = sx;
      panStartY = sy;
      panCamX = camX;
      panCamY = camY;
      canvas.style.cursor = 'grabbing';
      e.preventDefault();
      return;
    }

    if (e.button === 0) {
      var w = screenToWorld(sx, sy);
      var hit = hitTest(w.x, w.y);
      if (hit) {
        dragNode = hit;
        dragTargetX = w.x;
        dragTargetY = w.y;
        dragStartSX = sx;
        dragStartSY = sy;
        e.preventDefault();
      }
    }
  }

  function onMouseUp(e) {
    if (isPanning) {
      isPanning = false;
      canvas.style.cursor = 'default';
      return;
    }
    if (dragNode) {
      // Only treat as click if pointer barely moved in screen pixels
      var rect = canvas.getBoundingClientRect();
      var sx = e.clientX - rect.left;
      var sy = e.clientY - rect.top;
      var dsx = sx - dragStartSX, dsy = sy - dragStartSY;
      if (dsx * dsx + dsy * dsy < 36) {
        navigate(dragNode);
      }
      dragNode = null;
      return;
    }
  }

  function onWheel(e) {
    e.preventDefault();
    var factor = e.deltaY > 0 ? 0.9 : 1.1;
    var newZoom = zoom * factor;
    if (newZoom < minZoom) newZoom = minZoom;
    if (newZoom > maxZoom) newZoom = maxZoom;

    // Zoom toward pointer position
    var rect = canvas.getBoundingClientRect();
    var sx = e.clientX - rect.left;
    var sy = e.clientY - rect.top;
    var wBefore = screenToWorld(sx, sy);
    zoom = newZoom;
    var wAfter = screenToWorld(sx, sy);
    camX += wBefore.x - wAfter.x;
    camY += wBefore.y - wAfter.y;
  }

  function navigate(node) {
    if (!node || !node.id) return;
    window.open(window.__ub_base + node.id, '_blank');
  }

  /* ── touch support ───────────────────────────────────────────── */

  var touchId = null;
  var pinch = null;

  function onTouchStart(e) {
    if (e.touches.length === 1) {
      var t = e.touches[0];
      var rect = canvas.getBoundingClientRect();
      var sx = t.clientX - rect.left;
      var sy = t.clientY - rect.top;
      var w = screenToWorld(sx, sy);
      var hit = hitTest(w.x, w.y);
      if (hit) {
        dragNode = hit;
        dragTargetX = hit.x;
        dragTargetY = hit.y;
        dragStartSX = sx;
        dragStartSY = sy;
        touchId = t.identifier;
        e.preventDefault();
      } else {
        // Start pan
        isPanning = true;
        panStartX = sx;
        panStartY = sy;
        panCamX = camX;
        panCamY = camY;
        touchId = t.identifier;
      }
    } else if (e.touches.length === 2) {
      // Pinch-to-zoom
      isPanning = false;
      dragNode = null;
      var t1 = e.touches[0], t2 = e.touches[1];
      pinch = {
        dist: Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY),
        zoom: zoom
      };
      e.preventDefault();
    }
  }

  function onTouchMove(e) {
    if (e.touches.length === 2 && pinch) {
      var t1 = e.touches[0], t2 = e.touches[1];
      var dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      var newZoom = pinch.zoom * (dist / pinch.dist);
      if (newZoom < minZoom) newZoom = minZoom;
      if (newZoom > maxZoom) newZoom = maxZoom;
      zoom = newZoom;
      e.preventDefault();
      return;
    }

    for (var i = 0; i < e.touches.length; i++) {
      if (e.touches[i].identifier === touchId) {
        var t = e.touches[i];
        var rect = canvas.getBoundingClientRect();
        var sx = t.clientX - rect.left;
        var sy = t.clientY - rect.top;

        if (dragNode) {
          var w = screenToWorld(sx, sy);
          dragNode.x = w.x;
          dragNode.y = w.y;
          dragTargetX = w.x;
          dragTargetY = w.y;
          e.preventDefault();
        } else if (isPanning) {
          camX = panCamX - (sx - panStartX) / zoom;
          camY = panCamY - (sy - panStartY) / zoom;
        }
        break;
      }
    }
  }

  function onTouchEnd(e) {
    if (dragNode && e.changedTouches.length) {
      var t = e.changedTouches[0];
      var rect = canvas.getBoundingClientRect();
      var sx = t.clientX - rect.left;
      var sy = t.clientY - rect.top;
      var dsx = sx - dragStartSX, dsy = sy - dragStartSY;
      if (dsx * dsx + dsy * dsy < 36) {
        navigate(dragNode);
      }
    }
    dragNode = null;
    isPanning = false;
    touchId = null;
    pinch = null;
  }

  /* ── bootstrap ───────────────────────────────────────────────── */

  function setup() {
    var root = document.getElementById('graph-view-root');
    if (!root) return;

    canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.background = CLR_BG;
    canvas.style.borderRadius = '8px';
    root.appendChild(canvas);

    ctx = canvas.getContext('2d');

    // Initial fit-to-zoom reset button
    var controls = document.createElement('div');
    controls.className = 'graph-controls';

    var resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset View';
    resetBtn.className = 'graph-reset-btn';
    resetBtn.addEventListener('click', function () {
      camX = 0; camY = 0; zoom = 1;
    });
    controls.appendChild(resetBtn);

    var fitBtn = document.createElement('button');
    fitBtn.textContent = 'Fit All';
    fitBtn.className = 'graph-reset-btn';
    fitBtn.addEventListener('click', fitAll);
    controls.appendChild(fitBtn);

    root.appendChild(controls);

    resize();

    // Events
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    window.addEventListener('resize', resize);

    // Load data and start
    load(function (data) {
      // Clear loading message
      var loadMsg = root.querySelector('p');
      if (loadMsg) loadMsg.style.display = 'none';

      init(data);

      // Run synchronous warmup: full 300-tick convergence
      // (alpha decays from 1 → ~0.001 over 300 ticks)
      simAlpha = 1;
      for (var i = 0; i < 300; i++) tick();

      fitAll();
      frame();
    });
  }

  function fitAll() {
    if (!nodes.length) return;
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].x < minX) minX = nodes[i].x;
      if (nodes[i].x > maxX) maxX = nodes[i].x;
      if (nodes[i].y < minY) minY = nodes[i].y;
      if (nodes[i].y > maxY) maxY = nodes[i].y;
    }
    camX = (minX + maxX) / 2;
    camY = (minY + maxY) / 2;
    var graphW = maxX - minX + 100;
    var graphH = maxY - minY + 100;
    zoom = Math.min(W / graphW, H / graphH, 2);
    if (zoom < minZoom) zoom = minZoom;
  }

  /* ── entry point ─────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
