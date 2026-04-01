/**
 * Glitch Spotlight / Glitch of the Day
 *
 * Shows a spotlight card on the homepage.
 * Reads grimoire-data.json, matches today's month+day against
 * discovery dates.  Calendar-day match → "Glitch of the Day";
 * no match → "Glitch Spotlight" (day-stable random pick).
 */
(function () {
  'use strict';

  var ROOT_ID = 'glitch-of-the-day';

  /* ── Helpers ──────────────────────────────────────────── */

  /** Simple deterministic hash for daily seed. */
  function dayHash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  /** Format "YYYY-MM-DD" → "Month D, YYYY". */
  function formatDate(iso) {
    var parts = iso.split('-');
    var months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[parseInt(parts[1], 10) - 1] + ' ' +
           parseInt(parts[2], 10) + ', ' + parts[0];
  }

  /** Turn grimoire href (./UID/) into a path relative to the homepage. */
  function resolveHref(href) {
    // grimoire hrefs are relative to the grimoire page (glitchcraft/)
    return 'glitchcraft/' + href.replace(/^\.\//, '');
  }

  /* ── Render ───────────────────────────────────────────── */

  function render(root, entry, isHistory) {
    var html = '<div class="gotd-card">';
    if (isHistory) {
      html += '<p class="gotd-heading">' +
              '<span class="gotd-icon">📅</span> ' +
              'Glitch of the Day' +
              '</p>';
    } else {
      html += '<p class="gotd-heading">' +
              '<span class="gotd-icon">✨</span> ' +
              'Glitch Spotlight' +
              '</p>';
    }

    var e = entry;
    var link = resolveHref(e.href);

    html += '<div class="gotd-entry">';
    html += '<a class="gotd-name" href="' + link + '">' +
            e.name +
            (e.label ? ' <code class="gotd-label">' + e.label + '</code>' : '') +
            '</a>';
    html += '<span class="gotd-meta">';
    if (isHistory) {
      html += 'Discovered ' + formatDate(e.date);
    } else {
      html += 'Discovered on ' + formatDate(e.date);
    }
    if (e.credits && e.credits.length) {
      html += ' by ' + e.credits.join(', ');
    }
    html += '</span>';
    html += '</div>';

    html += '</div>';
    root.innerHTML = html;
    root.style.display = 'block';
  }

  /* ── Boot ─────────────────────────────────────────────── */

  function boot() {
    var root = document.getElementById(ROOT_ID);
    if (!root) return;

    var now = new Date();
    var mm = String(now.getMonth() + 1).padStart(2, '0');
    var dd = String(now.getDate()).padStart(2, '0');
    var todayKey = mm + '-' + dd;
    var seed = dayHash(now.getFullYear() + '-' + todayKey);

    fetch('../assets/data/grimoire-data.json')
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(function (data) {
        // Collect entries with valid dates
        var dated = [];
        var matches = [];
        for (var i = 0; i < data.length; i++) {
          var d = data[i].date;
          if (!d || d.length < 10) continue;
          dated.push(data[i]);
          if (d.slice(5) === todayKey) matches.push(data[i]);
        }
        if (!dated.length) return;

        if (matches.length) {
          // "Glitch of the Day" — discovered on this calendar day
          render(root, matches[seed % matches.length], true);
        } else {
          // "Glitch Spotlight" — random pick (stable for the whole day)
          render(root, dated[seed % dated.length], false);
        }
      })
      .catch(function () { /* silent — just don't show the section */ });
  }

  if (typeof document$ !== 'undefined') {
    document$.subscribe(function () { boot(); });
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
