/*
  AI Widget client — renders the search widget and wires all interactions.
  Requires: window.UbAI populated by ai-worker-config.js, ai-worker-fetch.js,
  ai-worker-typewriter.js (loaded earlier via extra_javascript).
*/
(function () {
  var U = window.UbAI;
  var el = U.el;

  /* ── DOM construction ──────────────────────────────────────────── */

  function render(container) {
    var root = el('div', { class: 'ub-ai-root' });
    var row = el('div', { style: 'display:flex; gap:0.4rem; align-items:flex-end;' });
    var inputWrap = el('div', { class: 'ub-ai-input-wrap', style: 'position:relative; flex:1; display:flex;' });
    var phText = U.PLACEHOLDERS[Math.floor(Math.random() * U.PLACEHOLDERS.length)];

    var input = el('div', {
      contenteditable: 'true', role: 'textbox', 'aria-multiline': 'true',
      'data-ub-placeholder': phText, class: 'ub-ai-input',
      spellcheck: 'false', autocorrect: 'off', autocomplete: 'on', autocapitalize: 'on'
    }, '');
    input.style.resize = 'none';
    input.style.overflow = 'hidden';
    input.style.flex = '1 1 auto';
    input.style.width = '100%';
    input.style.boxSizing = 'border-box';
    input.style.whiteSpace = 'pre-wrap';
    input.style.overflowWrap = 'anywhere';
    input.style.wordBreak = 'break-word';
    input.style.display = 'block';

    var clearBtn = el('button', { type: 'button', class: 'ub-ai-clear', 'aria-label': 'Clear search' }, '');
    var askBtn   = el('button', { type: 'button', class: 'ub-ai-ask',   'aria-label': 'Ask' }, '');
    var shareBtn = el('button', { type: 'button', class: 'ub-ai-share', 'aria-label': 'Share query' }, '');
    var out          = el('div', { class: 'ub-ai-out' }, '');
    var evidenceWrap = el('div', { class: 'ub-ai-evidence md-typeset' }, '');

    inputWrap.appendChild(input);
    row.appendChild(inputWrap);
    row.appendChild(askBtn);
    row.appendChild(shareBtn);
    row.appendChild(clearBtn);
    root.appendChild(row);
    root.appendChild(out);
    root.appendChild(evidenceWrap);
    container.appendChild(root);

    return { input: input, btn: askBtn, share: shareBtn,
             out: out, clear: clearBtn, evidence: evidenceWrap };
  }

  /* ── Markdown rendering helpers ──────────────────────────────── */

  function normalizeMarkdown(s) {
    if (!s) return '';
    return String(s).replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  function normalizeHtmlWhitespace(html) {
    return html
      .replace(/<p>\s*<\/p>\s*/gi, '')
      .replace(/(<br\s*\/?>\s*){3,}/gi, '<br><br>')
      .replace(/>\s+</g, '><')
      .trim();
  }

  function safeRender(outEl, md) {
    var clean = normalizeMarkdown(md);
    try {
      if (window.marked && window.DOMPurify) {
        outEl.innerHTML = normalizeHtmlWhitespace(DOMPurify.sanitize(marked.parse(clean)));
      } else {
        outEl.textContent = clean;
      }
    } catch (e) {
      outEl.textContent = clean;
    }
  }

  /* ── Widget initialisation ─────────────────────────────────────── */

  function initAIWidget() {
    try {
      var placeholder = document.querySelector('#ai-search-root');
      if (!placeholder) { document.body.classList.remove('ultrabroken-center-rune'); return; }
      if (placeholder.dataset.aiInitialized === '1') return;
      if (placeholder.querySelector('.ub-ai-root')) { placeholder.dataset.aiInitialized = '1'; return; }

      var w = render(placeholder);
      w._idleMode = true;
      w._silenceMode = false;
      w._lastResponseText = null;
      w._lastResources = [];
      w._lastRelated = [];

      /* ── Typewriter ─────────────────────────────────────────── */

      var tw = U.Typewriter(w.input, w.out, {
        placeholders: U.PLACEHOLDERS,
        idleText: U.idleText,
        getIdleMode: function () { return w._idleMode; }
      });

      /* ── Value accessors ────────────────────────────────────── */

      w.getValue = function () {
        if (w.input._phAnimating) return '';
        var txt = String(w.input.textContent || '');
        var ph  = String(w.input.getAttribute('data-ub-placeholder') || '');
        return txt === ph ? '' : txt;
      };

      w.setValue = function (v) {
        tw.stop();
        w.input.textContent = v || '';
        if (!v) tw.start(false);
      };

      /* ── Visibility ─────────────────────────────────────────── */

      var updateVisibility = function () {
        var has = w.getValue().trim();
        if (has) {
          if (w.clear) { w.clear.style.display = 'flex'; w.clear.disabled = false; }
          if (w.btn)   { w.btn.style.display   = 'flex'; w.btn.disabled   = false; }
          if (w.share) { w.share.style.display  = 'flex'; w.share.disabled = !w._lastResponseText; }
        } else {
          if (w.clear) { w.clear.style.display = 'none'; w.clear.disabled = true; }
          if (w.btn)   { w.btn.style.display   = 'none'; w.btn.disabled   = true; }
          if (w.share) { w.share.style.display  = 'none'; w.share.disabled = true; }
        }
      };

      /* ── Lock / unlock input ────────────────────────────────── */

      var lockInput = function () {
        w.input.setAttribute('contenteditable', 'false');
        if (w.btn)   { w.btn.style.display   = 'flex'; w.btn.disabled   = false; }
        if (w.clear) { w.clear.style.display  = 'flex'; w.clear.disabled = false; }
      };

      var unlockInput = function () {
        w.input.setAttribute('contenteditable', 'true');
      };

      /* ── Clear ──────────────────────────────────────────────── */

      var postSilence = false;

      var doClear = function () {
        w._idleMode = true;
        w._lastResponseText = null;
        w._lastResources = [];
        w._lastRelated = [];
        unlockInput();
        w.setValue('');
        var initText = postSilence ? U.IDLE_SILENCE_TEXT : U.IDLE_BLUR_TEXT;
        postSilence = false;
        if (w.out) {
          w.out.innerHTML = '';
          if (document.activeElement !== w.input) w.out.textContent = initText;
        }
        if (w.evidence) w.evidence.innerHTML = '';
        updateVisibility();
      };

      /* ── Ask handler ────────────────────────────────────────── */

      var handleAsk = async function () {
        var q = w.getValue().trim();
        if (!q) return;
        if (q.length > U.MAX_QUERY_CHARS) q = q.slice(0, U.MAX_QUERY_CHARS).trim();

        lockInput();
        w._idleMode = false;
        w._lastResponseText = null;
        w._lastResources = [];
        w._lastRelated = [];
        updateVisibility();
        w.out.textContent = U.LOADING_TEXT;
        if (w.evidence) w.evidence.innerHTML = '';

        var r = await U.askWorker(q);
        if (r.error) { w.out.textContent = 'Error: ' + r.error; return; }

        // Model answer
        var responseText    = r.response_text || r.answer || '';
        var responseSources = (r.response_sources != null) ? r.response_sources : null;
        if (responseText) {
          w._lastResponseText = responseText;
          safeRender(w.out, responseSources != null
            ? responseText + '\n\n' + responseSources
            : responseText);
        } else if (r.debug) {
          w.out.textContent = JSON.stringify(r.debug, null, 2);
        } else {
          w.out.textContent = '';
        }

        // Resources: worker evidence as direct wiki links
        try {
          var ev = r.evidence || [];
          if (Array.isArray(ev) && ev.length && w.evidence) {
            w.evidence.appendChild(el('h2', { class: 'ub-ai-resources' }, 'Resources'));
            var list = el('ul', { class: 'ub-ai-evidence-list' });
            w.evidence.appendChild(list);
            ev.forEach(function (item) {
              var id = item.path || item.id || '';
              var titleText = item.title || '';
              var slug = String(id).replace(/\.md$/, '').replace(/^\/+|\/+$/g, '').replace(/\/index$/, '');
              var text = titleText || slug || id;
              if (!text.trim()) return;
              var href = slug.startsWith('wiki/')
                ? U.SITE_ROOT + '/' + slug + '/'
                : U.SITE_ROOT + '/wiki/' + slug + '/';
              list.appendChild(el('li', {}, el('a', { href: href, target: '_blank', rel: 'noopener noreferrer' }, text)));
              w._lastResources.push({ text: text.trim(), href: href });
            });
          }
        } catch (e) { /* evidence rendering */ }

        // Related: model sources as search links
        try {
          var modelSources = Array.isArray(r.sources) ? r.sources : [];
          if (U.SHOW_MODEL_SOURCES && modelSources.length && w.evidence) {
            w.evidence.appendChild(el('h2', { class: 'ub-ai-related' }, 'Related'));
            var rlist = el('ul', { class: 'ub-ai-related-list' });
            w.evidence.appendChild(rlist);
            modelSources.forEach(function (s) {
              var text = s.title || s.path || s.id || '';
              var query = String(text).trim();
              if (!query) return;
              rlist.appendChild(el('li', {}, el('a', {
                href: 'search:' + encodeURIComponent(query),
                class: 'search-link', 'data-query': query
              }, text)));
              w._lastRelated.push({ text: query, query: query });
            });
          }
        } catch (e) { /* model source rendering */ }

        updateVisibility();
        if (!w.out.textContent && (!r.evidence || !r.evidence.length)) w.out.textContent = 'silence';
        if (r.silence) { w._silenceMode = true; unlockInput(); }
      };

      /* ── Event wiring ───────────────────────────────────────── */

      w.btn.addEventListener('click', handleAsk);

      // Focus: kill animation, clear placeholder text
      w.input.addEventListener('focus', function () {
        if (w.input._phAnimating) { tw.stop(); w.input.textContent = ''; }
        if (w._silenceMode) { w._silenceMode = false; w._idleMode = true; }
        if (w._idleMode) w.out.textContent = U.IDLE_FOCUSED_TEXT;
      });

      // Blur: restart animation after short delay if empty
      w.input.addEventListener('blur', function () {
        var hasText = !!String(w.input.textContent || '').trim();
        if (w._idleMode && !hasText) w.out.textContent = U.IDLE_BLUR_TEXT;
        if (!hasText) setTimeout(function () { tw.start(false); }, 400);
      });

      // Enter = submit, Ctrl/Cmd+Enter = newline
      w.input.addEventListener('keydown', function (ev) {
        if (ev.key !== 'Enter') return;
        if (ev.ctrlKey || ev.metaKey) {
          ev.preventDefault();
          try {
            var sel = window.getSelection();
            if (sel && sel.rangeCount) {
              var range = sel.getRangeAt(0);
              range.deleteContents();
              var nl = document.createTextNode('\n');
              range.insertNode(nl);
              range.setStartAfter(nl);
              range.collapse(true);
              sel.removeAllRanges();
              sel.addRange(range);
            }
          } catch (e) {}
          updateVisibility();
        } else {
          ev.preventDefault();
          handleAsk();
        }
      });

      /* ── Button setup ───────────────────────────────────────── */

      // Clear button
      if (w.clear) {
        w.clear.appendChild(el('img', { src: U.SITE_ROOT + '/assets/images/icons/cancel-icon.svg', alt: 'Clear' }));
        w.clear.style.display = 'none';
        w.clear.addEventListener('click', function () {
          if (!w._idleMode) postSilence = true;
          doClear();
        });
      }

      // Ask button
      w.btn.appendChild(el('img', { src: U.SITE_ROOT + '/assets/images/icons/ask-icon.svg', alt: 'Ask' }));
      w.btn.style.display = 'none';

      // Share button
      if (w.share) {
        w.share.appendChild(el('img', { src: U.SITE_ROOT + '/assets/images/icons/share-icon.svg', alt: 'Share' }));
        w.share.style.display = 'none';
        w.share.disabled = true;

        w.share.addEventListener('click', function () {
          var responseText = w._lastResponseText;
          if (!responseText) return;

          var queryHeading = '';
          var q = w.getValue().trim();
          if (q) queryHeading = '## ' + q + '\n\n';

          var resourcesFooter = '';
          var res = w._lastResources || [];
          if (res.length) resourcesFooter = '\n\n## Resources\n' + res.map(function (r) {
            return '- [' + r.text + '](' + r.href + ')';
          }).join('\n');

          var relatedFooter = '';
          var rel = w._lastRelated || [];
          if (rel.length) relatedFooter = '\n\n## Related\n' + rel.map(function (r) {
            return '- [' + r.text + '](' + U.WIKI_SEARCH_BASE + '?q=' + encodeURIComponent(r.query) + ')';
          }).join('\n');

          var disclaimer = '\n\n### Disclaimer\nThis response was synthesized by [The Librarian]('
            + U.SITE_ROOT + '/wiki/about/#ai-search). Take it with a grain of salt - always verify against the source pages.';

          var text = queryHeading + responseText.trim() + resourcesFooter + relatedFooter + disclaimer;
          navigator.clipboard.writeText(text).then(function () {
            try { showCopiedToast('Copied to clipboard'); } catch (e) {}
          }).catch(function (err) {
            try { showCopiedToast('Copy failed'); } catch (e) {}
            console.error('copy response failed', err);
          });
        });
      }

      /* ── Input events (character cap + visibility) ──────────── */

      ['input', 'change', 'paste', 'cut', 'compositionend'].forEach(function (evt) {
        w.input.addEventListener(evt, function () {
          if (w.input.contentEditable === 'true') {
            var cur = w.input.textContent || '';
            if (cur.length > U.MAX_QUERY_CHARS) {
              w.input.textContent = cur.slice(0, U.MAX_QUERY_CHARS);
              try {
                var sel = window.getSelection();
                var range = document.createRange();
                var node = w.input.childNodes[0] || w.input;
                range.setStart(node, Math.min(U.MAX_QUERY_CHARS, node.length || 0));
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
              } catch (e) {}
            }
          }
          updateVisibility();
        });
      });

      /* ── Initial state ──────────────────────────────────────── */

      updateVisibility();
      tw.start(true);
      document.body.classList.add('ultrabroken-center-rune');
      placeholder.dataset.aiInitialized = '1';

    } catch (e) {
      console.debug('initAIWidget error', e);
    }
  }

  /* ── Navigation hooks ──────────────────────────────────────────── */

  function updateCenteredRune() {
    var ph = document.querySelector('#ai-search-root');
    if (ph) document.body.classList.add('ultrabroken-center-rune');
    else document.body.classList.remove('ultrabroken-center-rune');
  }

  function attachNavObserver() {
    if (typeof document$ !== 'undefined') {
      document$.subscribe(function () {
        updateCenteredRune();
        setTimeout(initAIWidget, 50);
      });
    } else {
      var mo = new MutationObserver(function () {
        updateCenteredRune();
        setTimeout(initAIWidget, 50);
      });
      mo.observe(document.body, { childList: true, subtree: true });
      window.addEventListener('popstate', function () {
        updateCenteredRune();
        setTimeout(initAIWidget, 50);
      });
      var _pushState = history.pushState;
      history.pushState = function () {
        _pushState.apply(this, arguments);
        updateCenteredRune();
        setTimeout(initAIWidget, 50);
      };
    }
  }

  /* ── Entry point ───────────────────────────────────────────────── */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      updateCenteredRune();
      initAIWidget();
      attachNavObserver();
    });
  } else {
    updateCenteredRune();
    initAIWidget();
    attachNavObserver();
  }
})();
