/* ── Mermaid theme interceptor ─────────────────────────────────────────
   Material for MkDocs renders Mermaid inside closed Shadow DOMs and
   styles flowchart / class / state / sequence / ER diagrams via CSS
   custom properties.  Gantt and Pie charts receive NO Material styling.

   We use three complementary strategies:

   1. ShadowRoot.innerHTML interception – when Material sets the SVG
      content via innerHTML, we inject a <style> inside the SVG element
      so that px units become SVG user units and scale with the viewBox
      on smaller screens.  We detect chart type via aria-roledescription
      (gantt) and class names (pieTitleText).  DOM setAttribute calls
      provide belt-and-suspenders overrides for inline SVG attributes
      that CSS alone cannot beat without !important.
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
  backdropFill: '#1a1a2e',
  titleFont: '"New Rocker", serif',
  textFont: '"Texturina", Georgia, serif'
};

/* ── Gantt-specific settings ── */
var GANTT = {
  titleSize: '24px',
  tickSize: '16px',
  sectionSize: '20px',
  taskSize: '17px',
  barHeight: 28,
  topPadding: 0,
  sectionFill: '#173440',
  sectionAltFill: '#173440',
  /* Opaque task-bar fills (high-contrast over sectionFill #173440) */
  taskFill: '#106C67',
  activeFill: '#0C9281',
  doneFill: '#135657',
  critFill: '#5D7179',
  activeCritFill: '#7F8F96',
  doneCritFill: '#3A525D'
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
    /* ── Gantt: title (hidden) ── */
    '.titleText{display:none!important}' +
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
      '{fill:' + GANTT.taskFill + '!important;' +
      'stroke:' + THEME.primary + '!important;stroke-width:1.5px!important}' +
    '.active0,.active1,.active2,.active3' +
      '{fill:' + GANTT.activeFill + '!important;' +
      'stroke:' + THEME.primary + '!important;stroke-width:2px!important}' +
    '.done0,.done1,.done2,.done3' +
      '{fill:' + GANTT.doneFill + '!important;' +
      'stroke:' + THEME.primary + '!important;stroke-dasharray:4!important}' +
    /* ── Gantt: critical bars ── */
    '.crit0,.crit1,.crit2,.crit3' +
      '{fill:' + GANTT.critFill + '!important;' +
      'stroke:' + THEME.critical + '!important;stroke-width:2px!important}' +
    '.activeCrit0,.activeCrit1,.activeCrit2,.activeCrit3' +
      '{fill:' + GANTT.activeCritFill + '!important;' +
      'stroke:' + THEME.critical + '!important;stroke-width:2px!important}' +
    '.doneCrit0,.doneCrit1,.doneCrit2,.doneCrit3' +
      '{fill:' + GANTT.doneCritFill + '!important;' +
      'stroke:' + THEME.critical + '!important;stroke-dasharray:4!important}' +
    /* ── Gantt: grid & section backgrounds ── */
    '.grid .tick{stroke:rgba(137,139,148,0.3)!important}' +
    '.section{opacity:1!important}' +
    '.section0,.section1,.section2,.section3{fill:' + GANTT.sectionFill + '!important;opacity:1!important;' +
      'stroke:rgba(0,240,194,0.25)!important;stroke-width:1.5px!important}' +
    /* ── Gantt: overall background ── */
    'rect.background{fill:' + THEME.backdropFill + '!important}' +
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

      /* Detect chart type from the rendered HTML */
      if (typeof html !== 'string') return;
      var isGantt = html.indexOf('roledescription="gantt"') !== -1;
      var isPie   = html.indexOf('pieTitleText') !== -1;
      if (!isGantt && !isPie) return;

      var svg = this.querySelector('svg');
      if (!svg) return;

      /* Inject style INSIDE the SVG so px units are SVG user units
         and scale with the viewBox on narrow screens */
      var s = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      s.textContent = GANTT_PIE_CSS;
      svg.prepend(s);

      /* ── Gantt-only DOM modifications ── */
      if (isGantt) {
        var vb = svg.getAttribute('viewBox');
        if (vb) {
          var p = vb.split(/[\s,]+/).map(Number);
          var naturalW = p[2];           /* viewBox width in SVG units */
          /* Extend viewBox upward so large title text isn't clipped */
          var extra = parseInt(GANTT.titleSize);
          p[1] -= extra;    /* shift origin up */
          p[3] += extra;    /* increase height */
          svg.setAttribute('viewBox', p.join(' '));
          var naturalH = p[3];           /* viewBox height after adjustment */
          /* Wrap SVG in a scrollable container.  This is the bullet-proof
             way to handle a wide SVG: the wrapper scrolls, the SVG keeps
             its natural dimensions.  We defer to setTimeout(0) so that
             Material's synchronous post-processing is complete. */
          var shadowRoot = this;
          var host = this.host;
          setTimeout(function () {
            /* Re-query in case Material replaced the SVG */
            var s = shadowRoot.querySelector('svg[aria-roledescription="gantt"]');
            if (!s) return;
            /* Create a wrapper div inside the shadow root */
            var wrapper = document.createElement('div');
            wrapper.style.cssText =
              'overflow-x:auto;-webkit-overflow-scrolling:touch;width:100%;';
            /* Move SVG into wrapper */
            s.parentNode.insertBefore(wrapper, s);
            wrapper.appendChild(s);
            /* Force SVG to its natural pixel size */
            s.removeAttribute('width');
            s.removeAttribute('height');
            s.removeAttribute('style');
            s.style.cssText =
              'width:' + naturalW + 'px!important;' +
              'min-width:' + naturalW + 'px!important;' +
              'max-width:none!important;' +
              'height:' + naturalH + 'px!important;' +
              'display:block;';
          }, 0);
        }
        /* Style gantt background rect directly as SVG attributes */
        var bg = svg.querySelector('rect.background');
        if (bg) {
          bg.setAttribute('fill', THEME.backdropFill);
          bg.setAttribute('stroke', THEME.primary);
          bg.setAttribute('stroke-width', '2');
          bg.setAttribute('rx', '3');
          bg.setAttribute('ry', '3');
        }
        /* Set section band fills directly via attributes (overrides Mermaid inline styles) */
        svg.querySelectorAll('.section0,.section1,.section2,.section3').forEach(function(r) {
          r.setAttribute('fill', GANTT.sectionAltFill);
          r.setAttribute('opacity', '1');
          r.setAttribute('stroke', 'rgba(0,240,194,0.25)');
          r.setAttribute('stroke-width', '1.5');
          r.removeAttribute('fill-opacity');
          r.removeAttribute('rx');
          r.removeAttribute('ry');
        });
        /* Set task/crit bar fills directly via attributes */
        var barFills = {
          '.task0,.task1,.task2,.task3': GANTT.taskFill,
          '.active0,.active1,.active2,.active3': GANTT.activeFill,
          '.done0,.done1,.done2,.done3': GANTT.doneFill,
          '.crit0,.crit1,.crit2,.crit3': GANTT.critFill,
          '.activeCrit0,.activeCrit1,.activeCrit2,.activeCrit3': GANTT.activeCritFill,
          '.doneCrit0,.doneCrit1,.doneCrit2,.doneCrit3': GANTT.doneCritFill
        };
        Object.keys(barFills).forEach(function(sel) {
          svg.querySelectorAll(sel).forEach(function(r) {
            r.setAttribute('fill', barFills[sel]);
          });
        });
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
        config.gantt.useWidth = 1200;    /* render at fixed width, scroll on narrow screens */
        config.gantt.barHeight = GANTT.barHeight;
        config.gantt.topPadding = GANTT.topPadding;
        config.gantt.fontSize  = parseInt(GANTT.taskSize);
        config.gantt.sectionFontSize = parseInt(GANTT.sectionSize);

        /* ── Theme variables (source-level colour control) ── */
        if (!config.themeVariables) config.themeVariables = {};
        var tv = config.themeVariables;

        /* Gantt task bars */
        tv.taskBkgColor         = GANTT.taskFill;
        tv.taskBorderColor      = THEME.primary;
        tv.taskTextDarkColor    = THEME.text;
        tv.taskTextColor        = THEME.text;
        tv.taskTextOutsideColor = THEME.primary;
        /* Active tasks */
        tv.activeTaskBkgColor    = GANTT.activeFill;
        tv.activeTaskBorderColor = THEME.primary;
        /* Done tasks */
        tv.doneTaskBkgColor    = GANTT.doneFill;
        tv.doneTaskBorderColor = THEME.primary;
        /* Critical tasks (white to stand out) */
        tv.critBkgColor    = GANTT.critFill;
        tv.critBorderColor = THEME.critical;
        /* Title, sections, grid */
        tv.titleColor        = THEME.primary;
        tv.sectionBkgColor   = GANTT.sectionAltFill;
        tv.sectionBkgColor2  = GANTT.sectionAltFill;
        tv.altSectionBkgColor = GANTT.sectionAltFill;
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
          /* Gantt title (hidden) */
          '.titleText{display:none!important}' +
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
            'font-family:' + THEME.textFont + '!important}' +          /* Gantt: section backgrounds */
          '.section{opacity:1!important}' +
          '.section0,.section1,.section2,.section3{fill:' + GANTT.sectionAltFill + '!important;opacity:1!important;' +
            'stroke:rgba(0,240,194,0.25)!important;stroke-width:1.5px!important}' +
          /* Gantt: overall background */
          'rect.background{fill:' + THEME.backdropFill + '!important}' +
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