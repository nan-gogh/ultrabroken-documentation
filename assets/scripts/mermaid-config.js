/* ── Mermaid theme interceptor ─────────────────────────────────────────
   Material for MkDocs renders Mermaid inside closed Shadow DOMs and
   styles flowchart / class / state / sequence / ER diagrams via CSS
   custom properties.  Gantt and Pie charts receive NO Material styling.

   We use three complementary strategies:

   1. ShadowRoot.innerHTML interception – when Material sets the SVG
      content via innerHTML, we prepend a <style> at the shadow-root
      level (outside the SVG).  Unlike Element.prototype.attachShadow,
      property setters can't be cached in closures by bundled code.
   2. themeVariables – sets colours at the source so the CSS template
      directly outputs teal values.
   3. config.gantt – controls bar height and font sizes that Mermaid
      sets via SVG attributes.
   4. themeCSS – appends CSS rules that end up inside the SVG <style>
      block with ID-prefixed specificity + !important.
   ───────────────────────────────────────────────────────────────────── */

/* === Theme Configuration (globalized constants) === */

/* ── Shared colors used by both chart types ── */
var THEME = {
  primary: '#00f0c2',
  accent: '#898b94',
  text: '#d5d7de',
  critical: '#fff',
  dark: '#1a1a2e',
  titleFont: '"New Rocker", serif',
  textFont: '"Texturina", Georgia, serif'
};

/* ── Gantt-specific settings ── */
var GANTT = {
  titleSize: '48px',
  tickSize: '26px',
  sectionSize: '30px',
  taskSize: '26px',
  barHeight: 48,
  topPadding: 80
};

/* ── Pie-specific settings ── */
var PIE = {
  titleSize: '1.5rem',
  labelSize: '1rem',
  legendSize: '1rem'
};

/* === 1. Shadow-root innerHTML injection === */
(function () {
  var desc = Object.getOwnPropertyDescriptor(ShadowRoot.prototype, 'innerHTML');
  if (!desc || !desc.set) return;

  var GANTT_PIE_CSS =
    /* ── Gantt: title ── */
    '.titleText{font-size:' + GANTT.titleSize + '!important;' +
      'font-family:' + THEME.titleFont + '!important;' +
      'fill:' + THEME.primary + '!important}' +
    /* ── Gantt: axis tick labels ── */
    '.grid .tick text{font-size:' + GANTT.tickSize + '!important;' +
      'font-family:' + THEME.textFont + '!important;' +
      'fill:' + THEME.accent + '!important}' +
    /* ── Gantt: section labels ── */
    '.sectionTitle,.sectionTitle0,.sectionTitle1,' +
    '.sectionTitle2,.sectionTitle3' +
      '{font-size:' + GANTT.sectionSize + '!important;' +
      'font-family:' + THEME.textFont + '!important;' +
      'fill:' + THEME.primary + '!important}' +
    /* ── Gantt: task text inside bars ── */
    '.taskText,.taskText0,.taskText1,.taskText2,.taskText3,' +
    '.activeText0,.activeText1,.activeText2,.activeText3,' +
    '.doneText0,.doneText1,.doneText2,.doneText3,' +
    '.critText0,.critText1,.critText2,.critText3,' +
    '.activeCritText0,.activeCritText1,.activeCritText2,.activeCritText3,' +
    '.doneCritText0,.doneCritText1,.doneCritText2,.doneCritText3' +
      '{fill:' + THEME.text + '!important;font-size:' + GANTT.taskSize + '!important;' +
      'font-family:' + THEME.textFont + '!important}' +
    /* ── Gantt: task text outside bars ── */
    '.taskTextOutside0,.taskTextOutside1,' +
    '.taskTextOutside2,.taskTextOutside3,' +
    '.taskTextOutsideRight,.taskTextOutsideLeft' +
      '{fill:' + THEME.primary + '!important;font-size:' + GANTT.taskSize + '!important;' +
      'font-family:' + THEME.textFont + '!important}' +
    /* ── Gantt: task bars ── */
    '.task0,.task1,.task2,.task3' +
      '{fill:rgba(0,240,194,0.12)!important;' +
      'stroke:' + THEME.primary + '!important;stroke-width:1.5px!important}' +
    '.active0,.active1,.active2,.active3' +
      '{fill:rgba(0,240,194,0.35)!important;' +
      'stroke:' + THEME.primary + '!important;stroke-width:2px!important}' +
    '.done0,.done1,.done2,.done3' +
      '{fill:rgba(0,240,194,0.08)!important;' +
      'stroke:' + THEME.primary + '!important;stroke-dasharray:4!important}' +
    /* ── Gantt: critical bars ── */
    '.crit0,.crit1,.crit2,.crit3' +
      '{fill:rgba(255,255,255,0.18)!important;' +
      'stroke:' + THEME.critical + '!important;stroke-width:2px!important}' +
    '.activeCrit0,.activeCrit1,.activeCrit2,.activeCrit3' +
      '{fill:rgba(255,255,255,0.30)!important;' +
      'stroke:' + THEME.critical + '!important;stroke-width:2px!important}' +
    '.doneCrit0,.doneCrit1,.doneCrit2,.doneCrit3' +
      '{fill:rgba(255,255,255,0.08)!important;' +
      'stroke:' + THEME.critical + '!important;stroke-dasharray:4!important}' +
    /* ── Gantt: grid & section backgrounds ── */
    '.grid .tick{stroke:rgba(137,139,148,0.3)!important}' +
    '.section0,.section2{fill:rgba(0,240,194,1)!important}' +
    '.section1,.section3{fill:rgba(0,240,194,1)!important}' +
    /* ── Gantt: overall background (opaque with outline) ── */
    'rect.background{fill:#2a2f3f!important;stroke:' + THEME.primary + '!important;stroke-width:2px!important}' +
    /* ── Pie ── */
    '.pieTitleText{font-size:' + PIE.titleSize + '!important;' +
      'font-family:' + THEME.titleFont + ',' + THEME.textFont + '!important;' +
      'fill:' + THEME.primary + '!important}' +
    'text.pieSectionText,.pieLegendText{fill:' + THEME.accent + '!important;' +
      'font-size:' + PIE.labelSize + '!important;' +
      'font-family:' + THEME.textFont + '!important}' +
    'text.slice{fill:' + THEME.critical + '!important;' +
      'font-size:' + PIE.labelSize + '!important;' +
      'font-family:' + THEME.textFont + '!important;' +
      'font-weight:700!important;' +
      'paint-order:stroke fill!important;' +
      'stroke:' + THEME.dark + '!important;stroke-width:3px!important;' +
      'stroke-linejoin:round!important}' +
    '.pieCircle{stroke:none!important;stroke-width:0!important}' +
    '.pieOuterCircle{stroke:none!important;stroke-width:0!important}' +
    'path[class*=pie]{stroke:none!important;stroke-width:0!important}' +
    'g.legend>rect{stroke:none!important;stroke-width:0!important}' +
    'g.legend>text{fill:' + THEME.accent + '!important;' +
      'font-size:' + PIE.legendSize + '!important;' +
      'font-family:' + THEME.textFont + '!important}';

  Object.defineProperty(ShadowRoot.prototype, 'innerHTML', {
    configurable: true,
    enumerable: true,
    get: desc.get,
    set: function (html) {
      desc.set.call(this, html);
      /* Only inject into shadow roots that contain Mermaid SVGs */
      if (typeof html === 'string' &&
          (html.indexOf('titleText') !== -1 ||
           html.indexOf('pieTitleText') !== -1)) {
        var s = document.createElement('style');
        s.textContent = GANTT_PIE_CSS;
        this.prepend(s);
        /* Extend SVG viewBox upward so large title text isn't clipped */
        var svg = this.querySelector('svg');
        if (svg) {
          var vb = svg.getAttribute('viewBox');
          if (vb) {
            var p = vb.split(/[\s,]+/).map(Number);
            var extra = parseInt(GANTT.titleSize);
            p[1] -= extra;    /* shift origin up */
            p[3] += extra;    /* increase height */
            svg.setAttribute('viewBox', p.join(' '));
          }
        }
      }
    }
  });
})();

/* === 2. mermaid.initialize interceptor === */
Object.defineProperty(window, 'mermaid', {
  configurable: true,
  enumerable: true,
  get: function () { return this._mermaid; },
  set: function (val) {
    if (val && val.initialize && !val._intercepted) {
      var origInit = val.initialize;
      val.initialize = function (config) {
        /* ── Gantt layout ── */
        if (!config.gantt) config.gantt = {};
        config.gantt.barHeight = GANTT.barHeight;
        config.gantt.topPadding = GANTT.topPadding;
        config.gantt.fontSize  = parseInt(GANTT.taskSize);
        config.gantt.sectionFontSize = parseInt(GANTT.sectionSize);

        /* ── Theme variables (source-level colour control) ── */
        if (!config.themeVariables) config.themeVariables = {};
        var tv = config.themeVariables;

        /* Gantt task bars */
        tv.taskBkgColor         = 'rgba(0,240,194,0.12)';
        tv.taskBorderColor      = THEME.primary;
        tv.taskTextDarkColor    = THEME.text;
        tv.taskTextColor        = THEME.text;
        tv.taskTextOutsideColor = THEME.primary;
        /* Active tasks */
        tv.activeTaskBkgColor    = 'rgba(0,240,194,0.35)';
        tv.activeTaskBorderColor = THEME.primary;
        /* Done tasks */
        tv.doneTaskBkgColor    = 'rgba(0,240,194,0.08)';
        tv.doneTaskBorderColor = THEME.primary;
        /* Critical tasks (white to stand out) */
        tv.critBkgColor    = 'rgba(255,255,255,0.18)';
        tv.critBorderColor = THEME.critical;
        /* Title, sections, grid */
        tv.titleColor        = THEME.primary;
        tv.sectionBkgColor   = 'rgba(0,240,194,1)';
        tv.sectionBkgColor2  = 'rgba(0,240,194,1)';
        tv.altSectionBkgColor = 'rgba(0,240,194,1)';
        /* Gantt: background styling */
        tv.backgroundShow  = true;
        tv.primaryBorderColor = THEME.primary;
        tv.gridColor     = 'rgba(137,139,148,0.3)';
        tv.todayLineColor = THEME.primary;
        /* Pie */
        tv.pieTitleTextColor   = THEME.primary;
        tv.pieSectionTextColor = THEME.accent;
        tv.pieLegendTextColor  = THEME.accent;
        tv.pieTitleTextSize    = PIE.titleSize;
        tv.pieStrokeColor      = 'transparent';
        tv.pieStrokeWidth      = '0px';
        tv.pieOuterStrokeColor = 'transparent';
        tv.pieOuterStrokeWidth = '0px';

        /* ── themeCSS (ends up inside SVG <style> with ID prefix) ── */
        config.themeCSS = (config.themeCSS || '') +
          /* Gantt title */
          '.titleText{font-size:' + GANTT.titleSize + '!important;' +
            'font-family:' + THEME.titleFont + '!important;' +
            'fill:' + THEME.primary + '!important}' +
          /* Gantt tick labels */
          '.grid .tick text{font-size:' + GANTT.tickSize + '!important;' +
            'font-family:' + THEME.textFont + '!important;' +
            'fill:' + THEME.accent + '!important}' +
          /* Gantt section labels */
          '.sectionTitle,.sectionTitle0,.sectionTitle1,' +
          '.sectionTitle2,.sectionTitle3{font-size:' + GANTT.sectionSize + '!important;' +
            'font-family:' + THEME.textFont + '!important;' +
            'fill:' + THEME.primary + '!important}' +
          /* Gantt task text */
          '.taskText,.taskText0,.taskText1,.taskText2,.taskText3,' +
          '.activeText0,.activeText1,.activeText2,.activeText3,' +
          '.doneText0,.doneText1,.doneText2,.doneText3,' +
          '.critText0,.critText1,.critText2,.critText3,' +
          '.activeCritText0,.activeCritText1,.activeCritText2,.activeCritText3,' +
          '.doneCritText0,.doneCritText1,.doneCritText2,.doneCritText3' +
            '{fill:' + THEME.text + '!important;font-size:' + GANTT.taskSize + '!important;' +
            'font-family:' + THEME.textFont + '!important}' +
          /* Gantt outside text */
          '.taskTextOutside0,.taskTextOutside1,' +
          '.taskTextOutside2,.taskTextOutside3,' +
          '.taskTextOutsideRight,.taskTextOutsideLeft' +
            '{fill:' + THEME.primary + '!important;font-size:' + GANTT.taskSize + '!important;' +
            'font-family:' + THEME.textFont + '!important}' +          /* Gantt: section backgrounds (opaque) */
          '.section0,.section2{fill:rgba(0,240,194,1)!important}' +
          '.section1,.section3{fill:rgba(0,240,194,1)!important}' +
          /* Gantt: overall background (opaque with teal outline) */
          'rect.background{fill:#2a2f3f!important;stroke:' + THEME.primary + '!important;stroke-width:2px!important}' +
          /* Pie */
          '.pieTitleText{fill:' + THEME.primary + '!important;font-size:' + PIE.titleSize + '!important;' +
            'font-family:' + THEME.titleFont + ',' + THEME.textFont + '!important}' +
          'text.pieSectionText,.pieLegendText{fill:' + THEME.accent + '!important;' +
            'font-size:' + PIE.labelSize + '!important;' +
            'font-family:' + THEME.textFont + '!important}' +
          'text.slice{fill:' + THEME.critical + '!important;' +
            'font-size:' + PIE.labelSize + '!important;' +
            'font-family:' + THEME.textFont + '!important;' +
            'font-weight:700!important;' +
            'paint-order:stroke fill!important;' +
            'stroke:' + THEME.dark + '!important;stroke-width:3px!important;' +
            'stroke-linejoin:round!important}' +
          '.pieCircle{stroke:none!important;stroke-width:0!important}' +
          '.pieOuterCircle{stroke:none!important;stroke-width:0!important}' +
          'path[class*=pie]{stroke:none!important;stroke-width:0!important}' +
          'g.legend>rect{stroke:none!important;stroke-width:0!important}' +
          'g.legend>text{fill:' + THEME.accent + '!important;' +
            'font-size:' + PIE.legendSize + '!important;' +
            'font-family:' + THEME.textFont + '!important}';

        return origInit.call(this, config);
      };
      val._intercepted = true;
    }
    this._mermaid = val;
  }
});