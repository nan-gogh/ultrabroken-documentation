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

/* === 1. Shadow-root innerHTML injection === */
(function () {
  var desc = Object.getOwnPropertyDescriptor(ShadowRoot.prototype, 'innerHTML');
  if (!desc || !desc.set) return;

  var GANTT_PIE_CSS =
    /* ── Gantt: title ── */
    '.titleText{font-size:48px!important;' +
      'font-family:"New Rocker",serif!important;' +
      'fill:#00f0c2!important}' +
    /* ── Gantt: axis tick labels ── */
    '.grid .tick text{font-size:26px!important;' +
      'font-family:"Texturina",Georgia,serif!important;' +
      'fill:#898b94!important}' +
    /* ── Gantt: section labels ── */
    '.sectionTitle,.sectionTitle0,.sectionTitle1,' +
    '.sectionTitle2,.sectionTitle3' +
      '{font-size:30px!important;' +
      'font-family:"Texturina",Georgia,serif!important;' +
      'fill:#00f0c2!important}' +
    /* ── Gantt: task text inside bars ── */
    '.taskText,.taskText0,.taskText1,.taskText2,.taskText3,' +
    '.activeText0,.activeText1,.activeText2,.activeText3,' +
    '.doneText0,.doneText1,.doneText2,.doneText3,' +
    '.critText0,.critText1,.critText2,.critText3,' +
    '.activeCritText0,.activeCritText1,.activeCritText2,.activeCritText3,' +
    '.doneCritText0,.doneCritText1,.doneCritText2,.doneCritText3' +
      '{fill:#d5d7de!important;font-size:26px!important;' +
      'font-family:"Texturina",Georgia,serif!important}' +
    /* ── Gantt: task text outside bars ── */
    '.taskTextOutside0,.taskTextOutside1,' +
    '.taskTextOutside2,.taskTextOutside3,' +
    '.taskTextOutsideRight,.taskTextOutsideLeft' +
      '{fill:#00f0c2!important;font-size:26px!important;' +
      'font-family:"Texturina",Georgia,serif!important}' +
    /* ── Gantt: task bars ── */
    '.task0,.task1,.task2,.task3' +
      '{fill:rgba(0,240,194,0.12)!important;' +
      'stroke:#00f0c2!important;stroke-width:1.5px!important}' +
    '.active0,.active1,.active2,.active3' +
      '{fill:rgba(0,240,194,0.35)!important;' +
      'stroke:#00f0c2!important;stroke-width:2px!important}' +
    '.done0,.done1,.done2,.done3' +
      '{fill:rgba(0,240,194,0.08)!important;' +
      'stroke:#00f0c2!important;stroke-dasharray:4!important}' +
    /* ── Gantt: critical bars ── */
    '.crit0,.crit1,.crit2,.crit3' +
      '{fill:rgba(255,255,255,0.18)!important;' +
      'stroke:#fff!important;stroke-width:2px!important}' +
    '.activeCrit0,.activeCrit1,.activeCrit2,.activeCrit3' +
      '{fill:rgba(255,255,255,0.30)!important;' +
      'stroke:#fff!important;stroke-width:2px!important}' +
    '.doneCrit0,.doneCrit1,.doneCrit2,.doneCrit3' +
      '{fill:rgba(255,255,255,0.08)!important;' +
      'stroke:#fff!important;stroke-dasharray:4!important}' +
    /* ── Gantt: grid & section backgrounds ── */
    '.grid .tick{stroke:rgba(137,139,148,0.3)!important}' +
    '.section0,.section2{fill:rgba(0,240,194,0.05)!important}' +
    '.section1,.section3{fill:rgba(0,240,194,0.02)!important}' +
    /* ── Pie ── */
    '.pieTitleText{font-size:1.5rem!important;' +
      'font-family:"New Rocker","Texturina",serif!important;' +
      'fill:#00f0c2!important}' +
    'text.pieSectionText,.pieLegendText{fill:#898b94!important;' +
      'font-family:"Texturina",Georgia,serif!important}' +
    '.slice{stroke:#1a1a2e!important;stroke-width:2px!important}' +
    'g.legend>text{fill:#898b94!important;' +
      'font-family:"Texturina",Georgia,serif!important}';

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
        config.gantt.barHeight = 48;
        config.gantt.fontSize  = 26;
        config.gantt.sectionFontSize = 30;

        /* ── Theme variables (source-level colour control) ── */
        if (!config.themeVariables) config.themeVariables = {};
        var tv = config.themeVariables;

        /* Gantt task bars */
        tv.taskBkgColor         = 'rgba(0,240,194,0.12)';
        tv.taskBorderColor      = '#00f0c2';
        tv.taskTextDarkColor    = '#d5d7de';
        tv.taskTextColor        = '#d5d7de';
        tv.taskTextOutsideColor = '#00f0c2';
        /* Active tasks */
        tv.activeTaskBkgColor    = 'rgba(0,240,194,0.35)';
        tv.activeTaskBorderColor = '#00f0c2';
        /* Done tasks */
        tv.doneTaskBkgColor    = 'rgba(0,240,194,0.08)';
        tv.doneTaskBorderColor = '#00f0c2';
        /* Critical tasks (white to stand out) */
        tv.critBkgColor    = 'rgba(255,255,255,0.18)';
        tv.critBorderColor = '#fff';
        /* Title, sections, grid */
        tv.titleColor        = '#00f0c2';
        tv.sectionBkgColor   = 'rgba(0,240,194,0.05)';
        tv.sectionBkgColor2  = 'rgba(0,240,194,0.03)';
        tv.altSectionBkgColor = 'rgba(0,240,194,0.02)';
        tv.gridColor     = 'rgba(137,139,148,0.3)';
        tv.todayLineColor = '#00f0c2';
        /* Pie */
        tv.pieTitleTextColor   = '#00f0c2';
        tv.pieSectionTextColor = '#898b94';
        tv.pieLegendTextColor  = '#898b94';
        tv.pieTitleTextSize    = '26px';

        /* ── themeCSS (ends up inside SVG <style> with ID prefix) ── */
        config.themeCSS = (config.themeCSS || '') +
          /* Gantt title */
          '.titleText{font-size:48px!important;' +
            'font-family:"New Rocker",serif!important;' +
            'fill:#00f0c2!important}' +
          /* Gantt tick labels */
          '.grid .tick text{font-size:26px!important;' +
            'font-family:"Texturina",Georgia,serif!important;' +
            'fill:#898b94!important}' +
          /* Gantt section labels */
          '.sectionTitle,.sectionTitle0,.sectionTitle1,' +
          '.sectionTitle2,.sectionTitle3{font-size:30px!important;' +
            'font-family:"Texturina",Georgia,serif!important;' +
            'fill:#00f0c2!important}' +
          /* Gantt task text */
          '.taskText,.taskText0,.taskText1,.taskText2,.taskText3,' +
          '.activeText0,.activeText1,.activeText2,.activeText3,' +
          '.doneText0,.doneText1,.doneText2,.doneText3,' +
          '.critText0,.critText1,.critText2,.critText3,' +
          '.activeCritText0,.activeCritText1,.activeCritText2,.activeCritText3,' +
          '.doneCritText0,.doneCritText1,.doneCritText2,.doneCritText3' +
            '{fill:#d5d7de!important;font-size:26px!important;' +
            'font-family:"Texturina",Georgia,serif!important}' +
          /* Gantt outside text */
          '.taskTextOutside0,.taskTextOutside1,' +
          '.taskTextOutside2,.taskTextOutside3,' +
          '.taskTextOutsideRight,.taskTextOutsideLeft' +
            '{fill:#00f0c2!important;font-size:26px!important;' +
            'font-family:"Texturina",Georgia,serif!important}' +
          /* Pie */
          '.pieTitleText{fill:#00f0c2!important;font-size:1.5rem!important;' +
            'font-family:"New Rocker","Texturina",serif!important}' +
          'text.pieSectionText,.pieLegendText{fill:#898b94!important;' +
            'font-family:"Texturina",serif!important}' +
          '.slice{stroke:#1a1a2e!important;stroke-width:2px!important}' +
          'g.legend>text{fill:#898b94!important;font-family:"Texturina",serif!important}';

        return origInit.call(this, config);
      };
      val._intercepted = true;
    }
    this._mermaid = val;
  }
});
