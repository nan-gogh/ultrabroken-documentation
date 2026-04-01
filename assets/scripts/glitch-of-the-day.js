/**
 * Glitch of the Day
 *
 * Shows a "this day in glitch history" card on the homepage.
 * Reads grimoire-data.json, matches today's month+day against
 * discovery dates, and renders one or more entries.
 * When multiple glitches share the same calendar day, one is
 * picked at random (seeded by the full date so it's stable for
 * the whole day).  If no match exists, the section stays hidden.
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

  function render(root, entries) {
    var html = '<div class="gotd-card">';
    html += '<p class="gotd-heading">' +
            '<span class="gotd-icon">📅</span> ' +
            'On This Day in Glitch History' +
            '</p>';

    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      var link = resolveHref(e.href);
      var year = e.date.split('-')[0];

      html += '<div class="gotd-entry">';
      html += '<a class="gotd-name" href="' + link + '">' +
              e.name +
              (e.label ? ' <span class="gotd-label">' + e.label + '</span>' : '') +
              '</a>';
      html += '<span class="gotd-meta">';
      html += 'Discovered ' + formatDate(e.date);
      if (e.credits && e.credits.length) {
        html += ' by ' + e.credits.join(', ');
      }
      html += '</span>';
      if (e.tags && e.tags.length) {
        html += '<span class="gotd-tags">';
        for (var j = 0; j < e.tags.length; j++) {
          html += '<code class="gotd-tag">' + e.tags[j] + '</code>';
        }
        html += '</span>';
      }
      html += '</div>';
    }

    html += '</div>';
    root.innerHTML = html;
    root.style.display = '';
  }

  /* ── Boot ─────────────────────────────────────────────── */

  function boot() {
    var root = document.getElementById(ROOT_ID);
    if (!root) return;

    var now = new Date();
    var mm = String(now.getMonth() + 1).padStart(2, '0');
    var dd = String(now.getDate()).padStart(2, '0');
    var todayKey = mm + '-' + dd;

    fetch('../assets/data/grimoire-data.json')
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(function (data) {
        // Collect all entries whose discovery date shares today's month+day
        var matches = [];
        for (var i = 0; i < data.length; i++) {
          var d = data[i].date;
          if (!d || d.length < 10) continue;
          if (d.slice(5) === todayKey) matches.push(data[i]);
        }
        if (!matches.length) return;   // nothing for today — stay hidden

        // Pick one random entry, stable for the whole calendar day
        var seed = dayHash(now.getFullYear() + '-' + todayKey);
        var pick = matches[seed % matches.length];

        render(root, [pick]);
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
