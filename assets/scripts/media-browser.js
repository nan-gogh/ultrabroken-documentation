/**
 * Media Browser – R2 Storage File Listing
 *
 * Lists files from the Ultrabroken Media R2 worker, with preview,
 * download, and share functionality.
 * Only activates on pages containing <div id="ub-file-list">.
 */
(function() {
  'use strict';

  var WORKER = 'https://ultrabroken-media.gl1tchcr4vt.workers.dev';
  var shareIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13.02 14.4" width="12" height="13" style="vertical-align:middle;fill:#00f0c2;transform:translateY(-1px)"><path d="M10.85,10.18c-.55,0-1.04.22-1.42.56l-5.16-3c.04-.17.07-.33.07-.51s-.03-.34-.07-.51l5.1-2.97c.39.36.9.59,1.48.59,1.2,0,2.17-.97,2.17-2.17s-.97-2.17-2.17-2.17-2.17.97-2.17,2.17c0,.17.03.34.07.51l-5.1,2.97c-.39-.36-.9-.59-1.48-.59-1.2,0-2.17.97-2.17,2.17s.97,2.17,2.17,2.17c.57,0,1.08-.22,1.48-.59l5.15,3c-.04.15-.06.31-.06.48,0,1.16.95,2.1,2.11,2.1s2.11-.94,2.11-2.1-.95-2.11-2.11-2.11"/></svg>';
  var downloadIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14.03 14.03" width="12" height="12" style="vertical-align:middle;fill:#00f0c2;transform:rotate(-90deg) translateY(-1px)"><path d="M14.03,6.13v1.77H3.4l4.87,4.87-1.26,1.26L0,7.02,7.02,0l1.26,1.26L3.4,6.13h10.63Z"/></svg>';
  var currentPrefix = 'image/';

  function init() {
    var container = document.getElementById('ub-file-list');
    if (!container) return;

    currentPrefix = 'image/';
    ubLoadFiles();

    // Inject login icon into editor row
    var actions = document.querySelector('.ub-page-actions');
    if (actions && !actions.querySelector('.ub-vault-login')) {
      var login = document.createElement('a');
      login.href = WORKER + '/manage/';
      login.target = '_blank';
      login.rel = 'noopener';
      login.className = 'md-content__button ub-vault-login';
      login.title = 'Media Vault';
      login.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:1.2rem;height:1.2rem"><path fill="currentColor" d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/></svg>';
      actions.appendChild(login);
    }
  }

  window.ubSwitchTab = function(prefix) {
    currentPrefix = prefix;
    document.querySelectorAll('#ub-media-tabs button').forEach(function(b) {
      b.classList.toggle('active', b.textContent.trim() === prefix);
    });
    ubLoadFiles();
  };

  function ubLoadFiles() {
    var container = document.getElementById('ub-file-list');
    if (!container) return;
    container.innerHTML = '<div class="ub-media-loading">Loading\u2026</div>';

    fetchAllFiles(currentPrefix).then(function(allFiles) {
      if (allFiles.length === 0) {
        container.innerHTML = '<div class="ub-media-empty">No files in ' + escHtml(currentPrefix) + '</div>';
        return;
      }
      var html = '<div class="ub-file-list">';
      for (var i = 0; i < allFiles.length; i++) {
        var f = allFiles[i];
        var name = f.key.slice(currentPrefix.length);
        var size = formatSize(f.size);
        var date = new Date(f.uploaded).toLocaleDateString();
        html += '<div class="ub-file-row">'
          + '<span class="ub-name" onclick="ubPreview(\'' + escAttr(f.key) + '\')" title="' + escHtml(f.key) + '">' + escHtml(name) + '</span>'
          + '<span class="ub-meta"><span class="ub-size">' + size + '</span>'
          + '<span class="ub-date">' + date + '</span></span>'
          + '<span class="ub-actions">'
          + '  <button class="ub-media-btn" onclick="ubDownload(\'' + escAttr(f.key) + '\')" title="Download">' + downloadIcon + '</button>'
          + '  <button class="ub-media-btn" onclick="ubCopyUrl(\'' + escAttr(f.key) + '\')" title="Copy URL">' + shareIcon + '</button>'
          + '</span></div>';
      }
      html += '</div>';
      container.innerHTML = html;
    }).catch(function() {
      container.innerHTML = '<div class="ub-media-empty">Error loading files</div>';
    });
  }

  function fetchAllFiles(prefix) {
    var allFiles = [];
    function page(cursor) {
      var params = new URLSearchParams({ prefix: prefix });
      if (cursor) params.set('cursor', cursor);
      return fetch(WORKER + '/api/list?' + params).then(function(res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      }).then(function(data) {
        allFiles = allFiles.concat(data.files);
        if (data.truncated && data.cursor) return page(data.cursor);
        return allFiles;
      });
    }
    return page(null);
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function escHtml(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function escAttr(s) { return s.replace(/'/g, "\\'").replace(/"/g, '&quot;'); }

  window.ubDownload = function(key) {
    var url = WORKER + '/' + encodeURI(key);
    var name = key.split('/').pop();
    fetch(url).then(function(res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.blob();
    }).then(function(blob) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      document.body.appendChild(a);
      a.click();
      setTimeout(function() { URL.revokeObjectURL(a.href); a.remove(); }, 100);
    }).catch(function() {
      if (typeof showCopiedToast === 'function') showCopiedToast('Download failed');
    });
  };

  window.ubCopyUrl = function(key) {
    var url = WORKER + '/' + encodeURI(key);
    navigator.clipboard.writeText(url).then(
      function() { if (typeof showCopiedToast === 'function') showCopiedToast('Copied to clipboard'); },
      function() { if (typeof showCopiedToast === 'function') showCopiedToast('Failed to copy URL'); }
    );
  };

  window.ubPreview = function(key) {
    var url = WORKER + '/' + encodeURI(key);
    var isVideo = /\.(mp4|mov|webm|mkv)$/i.test(key);
    var overlay = document.createElement('div');
    overlay.className = 'ub-preview-overlay';
    overlay.onclick = function(e) { if (e.target === overlay) closeOverlay(); };
    function closeOverlay() { if (overlay.parentNode) document.body.removeChild(overlay); document.removeEventListener('keydown', onKey); }
    function onKey(e) { if (e.key === 'Escape') closeOverlay(); }
    document.addEventListener('keydown', onKey);
    var close = document.createElement('button');
    close.className = 'ub-close-btn';
    close.innerHTML = '&times;';
    close.onclick = closeOverlay;
    overlay.appendChild(close);
    if (isVideo) {
      var vid = document.createElement('video');
      vid.controls = true; vid.autoplay = true; vid.playsInline = true; vid.muted = true;
      vid.onerror = function() {
        if (overlay.parentNode) {
          vid.remove();
          var msg = document.createElement('div');
          msg.style.cssText = 'text-align:center;color:var(--md-default-fg-color);padding:32px;';
          msg.innerHTML = '<p style="margin-bottom:12px;color:var(--md-default-fg-color--light);">This browser cannot play this video format.</p>'
            + '<a class="ub-media-btn" href="' + url + '" download style="font-size:0.85rem;padding:8px 18px;">Download to view</a>';
          overlay.appendChild(msg);
        }
      };
      vid.src = url;
      overlay.appendChild(vid);
    } else {
      var img = document.createElement('img');
      img.src = url; img.alt = key;
      overlay.appendChild(img);
    }
    document.body.appendChild(overlay);
  };

  // MkDocs Material provides an observable (document$) that emits on layout swap
  if (typeof document$ !== 'undefined') {
    document$.subscribe(function() {
      init();
    });
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
})();
