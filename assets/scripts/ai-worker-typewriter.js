/*
  AI Widget typewriter animation engine.
  Factory: UbAI.Typewriter(input, out, opts) → { start, stop, isAnimating }
  Requires: window.UbAI (set by ai-worker-config.js)
*/
(function () {
  var U = window.UbAI;

  /**
   * Create a typewriter instance for a given input element.
   * @param {HTMLElement} input  contenteditable div
   * @param {HTMLElement} out    output area for idle text
   * @param {Object}      opts
   *   .placeholders {string[]}   pool of placeholder texts
   *   .idleText     {Function}   returns a random idle text string
   *   .getIdleMode  {Function}   returns true when widget is in idle mode
   * @returns {{ start(startFull:boolean), stop(), isAnimating():boolean }}
   */
  U.Typewriter = function (input, out, opts) {
    opts = opts || {};
    var placeholders = opts.placeholders || U.PLACEHOLDERS;
    var idleText     = opts.idleText     || U.idleText;
    var getIdleMode  = opts.getIdleMode  || function () { return true; };

    var handle  = null;
    var lastIdx = -1;

    var TYPE_SPEED  = 65;   // ms per char typed (±jitter)
    var DEL_SPEED   = 30;   // ms per char deleted
    var PAUSE_TYPED = 360;  // pause right after last char lands
    var PAUSE_END   = 1600; // pause at full string before deleting
    var PAUSE_INIT  = 3200; // longer pause on first page-load pre-fill
    var PAUSE_START = 350;  // pause after full delete before next word

    function stop() {
      if (handle !== null) { clearTimeout(handle); handle = null; }
      input._phAnimating = false;
    }

    function start(startFull) {
      stop();
      if (document.activeElement === input) return;

      var idx;
      do { idx = Math.floor(Math.random() * placeholders.length); }
      while (placeholders.length > 1 && idx === lastIdx);
      lastIdx = idx;

      var text = placeholders[idx];
      input.setAttribute('data-ub-placeholder', text);
      input._phAnimating = true;
      var pos = 0;

      function typeNext() {
        if (document.activeElement === input) { stop(); input.textContent = ''; return; }
        if (pos <= text.length) {
          input.textContent = text.slice(0, pos);
          pos++;
          handle = setTimeout(typeNext, TYPE_SPEED + Math.random() * 40 - 20);
        } else {
          handle = setTimeout(function () {
            if (getIdleMode()) out.textContent = idleText();
            handle = setTimeout(delNext, PAUSE_END);
          }, PAUSE_TYPED);
        }
      }

      function delNext() {
        if (document.activeElement === input) { stop(); input.textContent = ''; return; }
        if (pos > 0) {
          pos--;
          input.textContent = text.slice(0, pos);
          handle = setTimeout(delNext, DEL_SPEED + Math.random() * 20 - 10);
        } else {
          input._phAnimating = false;
          handle = setTimeout(function () {
            if (document.activeElement !== input) start(false);
          }, PAUSE_START);
        }
      }

      if (startFull) {
        pos = text.length;
        input.textContent = text;
        if (getIdleMode()) out.textContent = idleText();
        handle = setTimeout(delNext, PAUSE_INIT);
      } else {
        handle = setTimeout(typeNext, 300);
      }
    }

    return {
      start: start,
      stop: stop,
      isAnimating: function () { return !!input._phAnimating; }
    };
  };
})();
