/**
 * graph-view.js — Interactive force-directed graph for Ultrabroken Archives
 * =========================================================================
 * Renders a Canvas-based graph visualisation of how glitchcraft pages
 * reference each other, similar to Obsidian's graph view.
 *
 * Data source: assets/data/graph.json  (built by build_bm25_index.py)
 *
 * Features:
 *   - Force-directed layout (repulsion + attraction + centering)
 *   - Zoom (scroll wheel) and pan (middle-click or Ctrl+drag)
 *   - Drag nodes
 *   - Hover highlights node + direct connections, dims everything else
 *   - Click a node to navigate to its page
 *   - Node size scaled by connection count (degree)
 *   - Teal glow aesthetic consistent with site theme
 *   - Responsive — fills its container
 */

(function () {
  'use strict';

  /* ── constants ───────────────────────────────────────────────── */
  var REPULSION     = 800;      // charge repulsion strength
  var ATTRACTION    = 0.008;    // spring constant for edges
  var CENTER_PULL   = 0.01;     // pull toward center of canvas
  var DAMPING       = 0.92;     // velocity damping per tick
  var DT            = 1;        // timestep
  var EDGE_LENGTH   = 120;      // preferred edge rest length
  var MIN_NODE_R    = 4;
  var MAX_NODE_R    = 18;
  var FONT          = '11px Texturina, Georgia, serif';
  var FONT_BOLD     = 'bold 12px Texturina, Georgia, serif';

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
  var nodes = [];           // [{id,name,abbr,x,y,vx,vy,r,degree,edges:[]}]
  var edges = [];           // [{source:nodeRef, target:nodeRef}]
  var nodeMap = {};         // id → node

  var canvas, ctx, W, H;
  var dpr = window.devicePixelRatio || 1;

  // Camera: pan + zoom
  var camX = 0, camY = 0, zoom = 1;
  var minZoom = 0.15, maxZoom = 5;

  // Interaction
  var hoveredNode  = null;
  var dragNode     = null;
  var isPanning    = false;
  var panStartX, panStartY, panCamX, panCamY;
  var pointer = { x: 0, y: 0 };

  var running = true;
  var settled = false;
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
    // Resolve graph.json relative to site root
    var base = (document.querySelector('meta[name="site-url"]') || {}).content
             || document.baseURI.split('/wiki/')[0] + '/';
    base = base.replace(/\/$/, '');
    var url = base + '/assets/data/graph.json';

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

    // Create node objects with random initial positions
    var spread = Math.sqrt(rawNodes.length) * 30;
    for (var i = 0; i < rawNodes.length; i++) {
      var rn = rawNodes[i];
      var node = {
        id:     rn.id,
        name:   rn.name || '',
        abbr:   rn.abbr || '',
        x:      (Math.random() - 0.5) * spread,
        y:      (Math.random() - 0.5) * spread,
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
      var edge = { source: s, target: t };
      edges.push(edge);
      s.degree++;
      t.degree++;
      s.edges.push(edge);
      t.edges.push(edge);
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

  /* ── physics simulation ──────────────────────────────────────── */

  function tick() {
    var i, j, n, n2, edge, dx, dy, dist, force, fx, fy;
    var totalV = 0;

    // Repulsion (Barnes-Hut would be better for 1000+ nodes, but brute force
    // is fine for ~300)
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      for (j = i + 1; j < nodes.length; j++) {
        n2 = nodes[j];
        dx = n2.x - n.x;
        dy = n2.y - n.y;
        dist = Math.sqrt(dx * dx + dy * dy) || 1;
        force = REPULSION / (dist * dist);
        fx = (dx / dist) * force;
        fy = (dy / dist) * force;
        n.vx  -= fx * DT;
        n.vy  -= fy * DT;
        n2.vx += fx * DT;
        n2.vy += fy * DT;
      }
    }

    // Attraction along edges
    for (i = 0; i < edges.length; i++) {
      edge = edges[i];
      dx = edge.target.x - edge.source.x;
      dy = edge.target.y - edge.source.y;
      dist = Math.sqrt(dx * dx + dy * dy) || 1;
      force = ATTRACTION * (dist - EDGE_LENGTH);
      fx = (dx / dist) * force;
      fy = (dy / dist) * force;
      edge.source.vx += fx * DT;
      edge.source.vy += fy * DT;
      edge.target.vx -= fx * DT;
      edge.target.vy -= fy * DT;
    }

    // Center pull + damping + integrate
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      if (n === dragNode) { n.vx = 0; n.vy = 0; continue; }
      n.vx -= n.x * CENTER_PULL;
      n.vy -= n.y * CENTER_PULL;
      n.vx *= DAMPING;
      n.vy *= DAMPING;
      n.x  += n.vx * DT;
      n.y  += n.vy * DT;
      totalV += Math.abs(n.vx) + Math.abs(n.vy);
    }

    tickCount++;
    // After initial settling, reduce tick rate
    if (tickCount > 300 && totalV < 0.5 * nodes.length) {
      settled = true;
    }
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
      ctx.strokeStyle = hi ? CLR_EDGE_HI : CLR_EDGE;
      ctx.lineWidth   = hi ? 1.5 : 0.5;
      if (hNode && !hi) {
        ctx.globalAlpha = 0.15;
      }
      ctx.beginPath();
      ctx.moveTo(edge.source.x, edge.source.y);
      ctx.lineTo(edge.target.x, edge.target.y);
      ctx.stroke();
      ctx.globalAlpha = 1;
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
    var showAll = zoom > 0.7;
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

      // Show abbreviation when zoomed out, full name when zoomed in or hovered
      var label = (isH || zoom > 1.2) ? nd.name : (nd.abbr || nd.name);
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
    if (!settled || dragNode || hoveredNode) {
      tick();
    }
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
    settled = false; // redraw
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
      settled = false;
      return;
    }

    var w2 = screenToWorld(sx, sy);
    var hit = hitTest(w2.x, w2.y);
    if (hit !== hoveredNode) {
      hoveredNode = hit;
      canvas.style.cursor = hit ? 'pointer' : 'default';
      settled = false;
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
        settled = false;
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
      // If barely moved, treat as click → navigate
      var rect = canvas.getBoundingClientRect();
      var sx = e.clientX - rect.left;
      var sy = e.clientY - rect.top;
      var w = screenToWorld(sx, sy);
      var dx = w.x - dragNode.x, dy = w.y - dragNode.y;
      if (dx * dx + dy * dy < 4) {
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

    settled = false;
  }

  function navigate(node) {
    if (!node || !node.id) return;
    var base = (document.querySelector('meta[name="site-url"]') || {}).content
             || document.baseURI.split('/wiki/')[0] + '/';
    base = base.replace(/\/$/, '');
    window.open(base + '/' + node.id, '_blank');
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
        touchId = t.identifier;
        settled = false;
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
      settled = false;
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
          settled = false;
          e.preventDefault();
        } else if (isPanning) {
          camX = panCamX - (sx - panStartX) / zoom;
          camY = panCamY - (sy - panStartY) / zoom;
          settled = false;
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
      var w = screenToWorld(sx, sy);
      var dx = w.x - dragNode.x, dy = w.y - dragNode.y;
      if (dx * dx + dy * dy < 16) {
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
      camX = 0; camY = 0; zoom = 1; settled = false;
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
      init(data);
      // Auto-fit after a short simulated warmup
      for (var i = 0; i < 150; i++) tick();
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
    settled = false;
  }

  /* ── entry point ─────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
