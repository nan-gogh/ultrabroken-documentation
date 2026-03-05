/* ── Mermaid theme interceptor ─────────────────────────────────────────
   Material for MkDocs renders Mermaid inside closed Shadow DOMs and
   styles flowchart / class / state / sequence / ER diagrams via CSS
   custom properties.  Gantt and Pie charts receive NO Material styling.

   CSS injected via themeCSS ends up inside the SVG <style> element but
   fails to override Mermaid's own generated styles for Gantt charts
   (likely a browser scoping quirk with SVG <style> in closed shadow
   roots).  To work around this we use three complementary strategies:

   1. attachShadow interception  – injects a <style> at the shadow-root
      level (outside the SVG) where CSS cascade works reliably.
   2. themeVariables              – sets colours at the source so the CSS
      template directly outputs teal values (no override battle).
   3. config.gantt                – controls bar height and font sizes
      that are set via SVG attributes, not CSS.
   ───────────────────────────────────────────────────────────────────── */

/* === 1. Shadow-root CSS injection === */
(function () {
  var _attach = Element.prototype.attachShadow;
  Element.prototype.attachShadow = function (init) {
    var shadow = _attach.call(this, init);
    /* Only act on Mermaid diagram containers */
    if (this.classList && this.classList.contains('mermaid')) {
      var obs = new MutationObserver(function () {
        if (shadow.querySelector('svg')) {
          var s = document.createElement('style');
          s.textContent =
            /* ── Gantt: title ── */
            '.titleText { font-size: 26px !important; ' +
              'font-family: "New Rocker", serif !important; ' +
              'fill: #00f0c2 !important; }' +
            /* ── Gantt: axis tick labels ── */
            '.grid .tick text { font-size: 14px !important; ' +
              'font-family: "Texturina", Georgia, serif !important; ' +
              'fill: #898b94 !important; }' +
            /* ── Gantt: section labels ── */
            '.sectionTitle, .sectionTitle0, .sectionTitle1, ' +
            '.sectionTitle2, .sectionTitle3 ' +
              '{ font-size: 16px !important; ' +
              'font-family: "Texturina", Georgia, serif !important; ' +
              'fill: #00f0c2 !important; }' +
            /* ── Gantt: task text inside bars ── */
            '.taskText, .taskText0, .taskText1, .taskText2, .taskText3, ' +
            '.activeText0, .activeText1, .activeText2, .activeText3, ' +
            '.doneText0, .doneText1, .doneText2, .doneText3, ' +
            '.critText0, .critText1, .critText2, .critText3, ' +
            '.activeCritText0, .activeCritText1, .activeCritText2, .activeCritText3, ' +
            '.doneCritText0, .doneCritText1, .doneCritText2, .doneCritText3 ' +
              '{ fill: #d5d7de !important; ' +
              'font-family: "Texturina", Georgia, serif !important; }' +
            /* ── Gantt: task text outside bars ── */
            '.taskTextOutside0, .taskTextOutside1, ' +
            '.taskTextOutside2, .taskTextOutside3, ' +
            '.taskTextOutsideRight, .taskTextOutsideLeft ' +
              '{ fill: #00f0c2 !important; ' +
              'font-family: "Texturina", Georgia, serif !important; }' +
            /* ── Gantt: task bars ── */
            '.task0, .task1, .task2, .task3 ' +
              '{ fill: rgba(0,240,194,0.12) !important; ' +
              'stroke: #00f0c2 !important; stroke-width: 1.5px !important; }' +
            '.active0, .active1, .active2, .active3 ' +
              '{ fill: rgba(0,240,194,0.35) !important; ' +
              'stroke: #00f0c2 !important; stroke-width: 2px !important; }' +
            '.done0, .done1, .done2, .done3 ' +
              '{ fill: rgba(0,240,194,0.08) !important; ' +
              'stroke: #00f0c2 !important; stroke-dasharray: 4 !important; }' +
            /* ── Gantt: critical bars (white to stand out) ── */
            '.crit0, .crit1, .crit2, .crit3 ' +
              '{ fill: rgba(255,255,255,0.18) !important; ' +
              'stroke: #fff !important; stroke-width: 2px !important; }' +
            '.activeCrit0, .activeCrit1, .activeCrit2, .activeCrit3 ' +
              '{ fill: rgba(255,255,255,0.30) !important; ' +
              'stroke: #fff !important; stroke-width: 2px !important; }' +
            '.doneCrit0, .doneCrit1, .doneCrit2, .doneCrit3 ' +
              '{ fill: rgba(255,255,255,0.08) !important; ' +
              'stroke: #fff !important; stroke-dasharray: 4 !important; }' +
            /* ── Gantt: grid & section backgrounds ── */
            '.grid .tick { stroke: rgba(137,139,148,0.3) !important; }' +
            '.section0, .section2 { fill: rgba(0,240,194,0.05) !important; }' +
            '.section1, .section3 { fill: rgba(0,240,194,0.02) !important; }' +
            /* ── Pie: title ── */
            '.pieTitleText { font-size: 1.5rem !important; ' +
              'font-family: "New Rocker", "Texturina", serif !important; ' +
              'fill: #00f0c2 !important; }' +
            /* ── Pie: labels & legend ── */
            'text.pieSectionText, .pieLegendText { fill: #898b94 !important; ' +
              'font-family: "Texturina", Georgia, serif !important; }' +
            '.slice { stroke: #1a1a2e !important; stroke-width: 2px !important; }' +
            'g.legend > text { fill: #898b94 !important; ' +
              'font-family: "Texturina", Georgia, serif !important; }';
          shadow.prepend(s);
          obs.disconnect();
        }
      });
      obs.observe(shadow, { childList: true, subtree: true });
    }
    return shadow;
  };
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
        config.gantt.barHeight = 40;
        config.gantt.fontSize  = 14;
        config.gantt.sectionFontSize = 16;

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

        /* ── themeCSS fallback (belt-and-suspenders) ── */
        if (typeof config.themeCSS === 'string') {
          config.themeCSS +=
            '.pieTitleText{fill:#00f0c2!important;font-size:1.5rem!important;' +
              'font-family:"New Rocker","Texturina",serif!important}' +
            'text.pieSectionText,.pieLegendText{fill:#898b94!important;' +
              'font-family:"Texturina",serif!important}' +
            '.slice{stroke:#1a1a2e!important;stroke-width:2px!important}' +
            'g.legend>text{fill:#898b94!important;font-family:"Texturina",serif!important}';
        }

        return origInit.call(this, config);
      };
      val._intercepted = true;
    }
    this._mermaid = val;
  }
});
