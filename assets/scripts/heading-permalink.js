/**
 * Heading Permalink — share icon to copy section links
 * ─────────────────────────────────────────────────────
 * Injects a share icon into every heading with an ID.
 * Click the icon (or press Enter/Space when focused) to
 * copy the heading's permalink to the clipboard.
 *
 * Separated from collapsible-sections.js — no coupling needed
 * because this script only listens on .ub-heading-share clicks,
 * never the heading click itself.
 */
(function () {
  'use strict';

  /* ── Site root for asset URLs ─────────────────────────── */
  var scriptEl = document.currentScript || document.querySelector('script[src*="heading-permalink"]');
  var SITE_ROOT = (scriptEl && scriptEl.src)
    ? scriptEl.src.replace(/assets\/scripts\/[^/]+$/, '')
    : location.href.replace(/\/[^/]*$/, '/');

  /* ── Share icons on all headings with IDs ───────────────── */
  function initShareIcons(article) {
    var headings = article.querySelectorAll(
      'h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]'
    );
    for (var i = 0; i < headings.length; i++) {
      var h = headings[i];
      if (h.classList.contains('tab-toc-heading')) continue;
      if (h.querySelector('.ub-heading-share')) continue;

      var share = document.createElement('span');
      share.className = 'ub-heading-share';
      share.setAttribute('aria-label', 'Copy link');
      share.setAttribute('role', 'button');
      share.setAttribute('tabindex', '0');

      var img = document.createElement('img');
      img.src = SITE_ROOT + 'assets/images/icons/share-icon.svg';
      img.alt = '';
      img.setAttribute('aria-hidden', 'true');
      share.appendChild(img);

      h.appendChild(share);
    }
  }

  /* ── Copy permalink + feedback ──────────────────────────── */
  function doCopy(url, iconParent) {
    navigator.clipboard.writeText(url).then(function () {
      var icon = iconParent.querySelector('.ub-heading-share');
      if (icon) {
        icon.classList.remove('ub-heading-share--flash');
        void icon.offsetWidth;   // reflow so re-add triggers animation
        icon.classList.add('ub-heading-share--flash');
        setTimeout(function () {
          icon.classList.remove('ub-heading-share--flash');
        }, 1400);
      }
      if (typeof showCopiedToast === 'function') {
        showCopiedToast('Copied to clipboard');
      }
    }).catch(function (err) {
      console.error('Failed to copy permalink:', err);
    });
  }

  function copyPermalink(heading) {
    var slug = heading ? heading.id : null;
    if (!slug) return;
    var base = location.href.split('#')[0];
    var url = heading.tagName === 'H1' ? base : base + '#' + slug;
    doCopy(url, heading);
  }

  /* ── Share icons on tab labels (companion to tab_headings hook) ── */
  function initTabShareIcons(article) {
    var headings = article.querySelectorAll('.tab-toc-heading[id]');
    for (var i = 0; i < headings.length; i++) {
      var h = headings[i];
      var block = h.closest('.tabbed-block');
      if (!block) continue;
      var content = block.parentElement;
      if (!content || !content.classList.contains('tabbed-content')) continue;
      var set = content.closest('.tabbed-set');
      if (!set) continue;

      // Find block index among siblings
      var blocks = content.children;
      var idx = -1;
      for (var j = 0; j < blocks.length; j++) {
        if (blocks[j] === block) { idx = j; break; }
      }
      if (idx < 0) continue;

      // Find corresponding label
      var labelsWrap = set.querySelector('.tabbed-labels');
      if (!labelsWrap) continue;
      var labelEls = labelsWrap.querySelectorAll('label');
      var label = labelEls[idx];
      if (!label) continue;
      if (label.querySelector('.ub-heading-share')) continue;

      label.dataset.headingId = h.id;

      var share = document.createElement('span');
      share.className = 'ub-heading-share';
      share.setAttribute('aria-label', 'Copy link');
      share.setAttribute('role', 'button');
      share.setAttribute('tabindex', '0');

      var img = document.createElement('img');
      img.src = SITE_ROOT + 'assets/images/icons/share-icon.svg';
      img.alt = '';
      img.setAttribute('aria-hidden', 'true');
      share.appendChild(img);

      label.appendChild(share);
    }
  }

  /* ── Click handler (delegated) ─────────────────────────── */
  document.addEventListener('click', function (e) {
    var share = e.target.closest('.ub-heading-share');
    if (!share) return;
    var h = share.closest('h1, h2, h3, h4, h5, h6');
    if (h) { copyPermalink(h); return; }
    // Tab label share icon
    var label = share.closest('label[data-heading-id]');
    if (label) {
      var base = location.href.split('#')[0];
      doCopy(base + '#' + label.dataset.headingId, label);
    }
  });

  /* ── Keyboard activation on share icon ─────────────────── */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var share = e.target.closest('.ub-heading-share');
    if (!share) return;
    e.preventDefault();
    var h = share.closest('h1, h2, h3, h4, h5, h6');
    if (h) { copyPermalink(h); return; }
    var label = share.closest('label[data-heading-id]');
    if (label) {
      var base = location.href.split('#')[0];
      doCopy(base + '#' + label.dataset.headingId, label);
    }
  });

  /* ── Init ───────────────────────────────────────────────── */
  function init() {
    var article = document.querySelector('.md-content__inner');
    if (!article) return;
    initShareIcons(article);
    initTabShareIcons(article);
  }

  if (typeof document$ !== 'undefined') {
    document$.subscribe(function () { init(); });
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ── Global toast (preserved for other scripts) ──────────── */
function showCopiedToast(message) {
  try {
    var id = 'ub-global-toast';
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      el.className = 'md-dialog';
      el.setAttribute('data-md-component', 'dialog');
      document.body.appendChild(el);
    }
    el.innerHTML =
      '<div class="md-dialog__inner md-typeset" role="status" aria-live="polite">' +
      (message || 'Copied to clipboard') + '</div>';
    el.classList.add('md-dialog--active');
    if (el._ubHideTimer) {
      clearTimeout(el._ubHideTimer);
      el._ubHideTimer = null;
    }
    el._ubHideTimer = setTimeout(function () {
      el.classList.remove('md-dialog--active');
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 320);
    }, 1400);
  } catch (e) { console.error('showCopiedToast error', e); }
}
