/*
  AI Widget fetch layer — DOM helper and Worker communication.
  Requires: window.UbAI (set by ai-worker-config.js)
*/
(function () {
  var U = window.UbAI;

  // Minimal DOM element builder.
  U.el = function (tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) {
      var keys = Object.keys(attrs);
      for (var i = 0; i < keys.length; i++) e.setAttribute(keys[i], attrs[keys[i]]);
    }
    var ch = Array.isArray(children) ? children : (children != null ? [children] : []);
    for (var j = 0; j < ch.length; j++) {
      var c = ch[j];
      if (typeof c === 'string') e.appendChild(document.createTextNode(c));
      else if (c) e.appendChild(c);
    }
    return e;
  };

  // Send a query to the Cloudflare RAG Worker.
  U.askWorker = async function (q) {
    var DEFAULT_WORKER_URL = 'https://ultrabroken-rag.gl1tchcr4vt.workers.dev';
    var url = window.AI_WORKER_URL || localStorage.getItem('ai_worker_url') || DEFAULT_WORKER_URL;
    try {
      var res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });
      if (!res.ok) {
        var text = null;
        try { text = await res.text(); } catch (e) {}
        console.error('Worker responded with', res.status, text);
        try {
          var j = JSON.parse(text || '{}');
          return { error: j.error || JSON.stringify(j) || ('worker error ' + res.status) };
        } catch (e) {
          return { error: text || ('worker error ' + res.status) };
        }
      }
      return await res.json();
    } catch (e) {
      console.error('askWorker fetch failed', e);
      return { error: String(e) };
    }
  };
})();
