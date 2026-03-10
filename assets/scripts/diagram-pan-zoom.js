/**
 * Diagram Pan-Zoom — interactive viewer for Mermaid diagrams
 *
 * Activated on any element with class "diagram-pan".
 * Expected inner structure (injected by diagram_viewer.py hook):
 *   .diagram-pan
 *     .diagram-zoom            (toolbar: slider + label + reset)
 *     .diagram-inner           (contains the rendered mermaid SVG)
 *
 * Features: scroll-wheel zoom to cursor, pinch zoom to pinch center,
 * slider zoom to viewport center, mouse/touch drag panning, reset button.
 */
(function () {
  'use strict';

  function DiagramPanZoom(pan) {
    var inner = pan.querySelector('.diagram-inner');
    var zoomBar = pan.querySelector('.diagram-zoom');
    var slider = pan.querySelector('input[type=range]');
    var label = pan.querySelector('.diagram-level');
    var resetBtn = pan.querySelector('button');
    var zoom = 1, minZoom = 0.4, maxZoom = 4;
    var baseW = 0, baseH = 0;
    var curPadX = 0, curPadY = 0;
    var dragging = false, dragX = 0, dragY = 0, scrollL = 0, scrollT = 0;
    var lastTouchDist = null, lastTouchMid = null;
    var vSX = 0, vSY = 0;
    var settingScroll = false;
    var sliderActive = false;

    var sizer = document.createElement('div');
    pan.appendChild(sizer);
    inner.style.position = 'absolute';
    inner.style.left = '0';
    inner.style.top = '0';
    inner.style.margin = '0';

    function measureBase() {
      var mermaid = inner.querySelector('.mermaid');
      if (!mermaid || pan.clientWidth === 0) return requestAnimationFrame(measureBase);
      if (mermaid.textContent.trim().length > 0) return requestAnimationFrame(measureBase);
      inner.style.position = '';
      inner.style.transform = '';
      inner.style.width = 'max-content';
      inner.style.height = '';
      var rect = mermaid.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        inner.style.position = 'absolute';
        return requestAnimationFrame(measureBase);
      }
      baseW = inner.offsetWidth;
      var cs = getComputedStyle(inner);
      baseH = Math.ceil(rect.height + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom));
      inner.style.position = 'absolute';
      applyZoom(1, true);
    }

    function applyLayout() {
      curPadX = pan.clientWidth / 2;
      curPadY = pan.clientHeight / 2;
      inner.style.transform = 'translate(' + curPadX + 'px,' + curPadY + 'px) scale(' + zoom + ')';
      inner.style.width = baseW + 'px';
      inner.style.height = baseH + 'px';
      var barH = zoomBar ? zoomBar.offsetHeight : 0;
      sizer.style.width = (2 * curPadX + baseW * zoom) + 'px';
      sizer.style.height = Math.max(0, 2 * curPadY + baseH * zoom - barH) + 'px';
      slider.value = Math.round(zoom * 100);
      label.textContent = Math.round(zoom * 100) + '%';
    }

    function applyZoom(newZoom, center) {
      zoom = Math.max(minZoom, Math.min(maxZoom, newZoom));
      applyLayout();
      if (center) {
        vSX = curPadX + baseW * zoom / 2 - pan.clientWidth / 2;
        vSY = curPadY + baseH * zoom / 2 - pan.clientHeight / 2;
        settingScroll = true;
        pan.scrollLeft = vSX;
        pan.scrollTop = vSY;
        setTimeout(function () { settingScroll = false; }, 0);
      }
    }

    function zoomAt(newZoom, px, py) {
      newZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));
      if (newZoom === zoom) return;
      var cx = (vSX + px - curPadX) / zoom;
      var cy = (vSY + py - curPadY) / zoom;
      zoom = newZoom;
      applyLayout();
      vSX = curPadX + cx * zoom - px;
      vSY = curPadY + cy * zoom - py;
      settingScroll = true;
      pan.scrollLeft = vSX;
      pan.scrollTop = vSY;
      setTimeout(function () { settingScroll = false; }, 0);
    }

    pan.addEventListener('scroll', function () {
      if (!settingScroll && lastTouchDist === null && !sliderActive) {
        vSX = pan.scrollLeft;
        vSY = pan.scrollTop;
      }
    });

    slider.addEventListener('input', function () {
      sliderActive = true;
      zoomAt(parseInt(slider.value) / 100, pan.clientWidth / 2, pan.clientHeight / 2);
    });
    slider.addEventListener('change', function () {
      setTimeout(function () { sliderActive = false; }, 50);
    });
    resetBtn.addEventListener('click', function () { applyZoom(1, true); });

    pan.addEventListener('wheel', function (e) {
      if (e.target.closest('.diagram-zoom')) return;
      e.preventDefault();
      var r = pan.getBoundingClientRect();
      zoomAt(zoom + (e.deltaY > 0 ? -0.3 : 0.3), e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });

    pan.addEventListener('mousedown', function (e) {
      if (e.target.closest('.diagram-zoom')) return;
      dragging = true;
      pan.classList.add('is-dragging');
      dragX = e.clientX; dragY = e.clientY;
      scrollL = pan.scrollLeft; scrollT = pan.scrollTop;
    });
    window.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      pan.scrollLeft = scrollL - (e.clientX - dragX);
      pan.scrollTop = scrollT - (e.clientY - dragY);
    });
    window.addEventListener('mouseup', function () {
      dragging = false;
      pan.classList.remove('is-dragging');
    });

    pan.addEventListener('touchstart', function (e) {
      if (e.touches.length === 2) {
        var r = pan.getBoundingClientRect();
        lastTouchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        lastTouchMid = { x: (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left, y: (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top };
      } else if (e.touches.length === 1) {
        if (e.target.closest('.diagram-zoom')) return;
        dragging = true;
        dragX = e.touches[0].clientX; dragY = e.touches[0].clientY;
        scrollL = pan.scrollLeft; scrollT = pan.scrollTop;
      }
    }, { passive: false });
    pan.addEventListener('touchmove', function (e) {
      if (e.touches.length === 2 && lastTouchDist !== null) {
        e.preventDefault();
        var r = pan.getBoundingClientRect();
        var dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        var mid = { x: (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left, y: (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top };
        var newZoom = (dist !== lastTouchDist) ? Math.max(minZoom, Math.min(maxZoom, zoom * dist / lastTouchDist)) : zoom;
        var cx = (vSX + lastTouchMid.x - curPadX) / zoom;
        var cy = (vSY + lastTouchMid.y - curPadY) / zoom;
        zoom = newZoom;
        applyLayout();
        vSX = curPadX + cx * zoom - mid.x;
        vSY = curPadY + cy * zoom - mid.y;
        settingScroll = true;
        pan.scrollLeft = vSX;
        pan.scrollTop = vSY;
        setTimeout(function () { settingScroll = false; }, 0);
        lastTouchDist = dist;
        lastTouchMid = mid;
      } else if (e.touches.length === 1 && dragging) {
        e.preventDefault();
        pan.scrollLeft = scrollL - (e.touches[0].clientX - dragX);
        pan.scrollTop = scrollT - (e.touches[0].clientY - dragY);
      }
    }, { passive: false });
    pan.addEventListener('touchend', function (e) {
      if (e.touches.length < 2) { lastTouchDist = null; lastTouchMid = null; }
      if (e.touches.length === 1) {
        dragging = true;
        dragX = e.touches[0].clientX; dragY = e.touches[0].clientY;
        scrollL = pan.scrollLeft; scrollT = pan.scrollTop;
      }
      if (e.touches.length === 0) { dragging = false; pan.classList.remove('is-dragging'); }
    });

    window.addEventListener('resize', function () { applyZoom(zoom, true); });
    measureBase();
  }

  function init() {
    document.querySelectorAll('.diagram-pan').forEach(DiagramPanZoom);
  }

  // Support instant-loading (Material for MkDocs)
  if (typeof document$ !== 'undefined') {
    document$.subscribe(init);
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
