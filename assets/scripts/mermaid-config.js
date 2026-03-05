Object.defineProperty(window, 'mermaid', {
  configurable: true,
  enumerable: true,
  get: function() {
    return this._mermaid;
  },
  set: function(val) {
    if (val && val.initialize && !val._intercepted) {
      const origInit = val.initialize;
      val.initialize = function(config) {
        if (config && typeof config.themeCSS === 'string') {
          // Append our specific pie & gantt fixes to Material's default themeCSS
          config.themeCSS += `
            /* Fix Pie charts */
            .pieTitleText { fill: var(--teal-glow) !important; font-size: 1.5rem !important; font-family: 'New Rocker', 'Texturina', serif !important; }
            text.pieSectionText, .pieLegendText { fill: var(--muted-text, #898b94) !important; font-family: 'Texturina', serif !important; }
            .slice { stroke: #1a1a2e !important; stroke-width: 2px !important; }
            g.legend > text { fill: var(--muted-text) !important; font-family: 'Texturina', serif !important; }
            
            /* Fix Gantt charts */
            .titleText { fill: var(--teal-glow) !important; font-size: 1.5rem !important; font-family: 'New Rocker', serif !important; }
            .grid .tick text { fill: var(--muted-text, #898b94) !important; font-family: 'Texturina', serif !important; }
            .sectionTitle { fill: var(--teal-glow) !important; opacity: 0.8 !important; font-family: 'Texturina', serif !important; }
            .sectionTitle0, .sectionTitle1, .sectionTitle2, .sectionTitle3 { fill: var(--teal-glow) !important; }

            /* Default task bars */
            .task0, .task1, .task2, .task3 { fill: rgba(0, 240, 194, 0.12) !important; stroke: var(--teal-glow) !important; stroke-width: 1.5px !important; }
            .active0, .active1, .active2, .active3 { fill: rgba(0, 240, 194, 0.35) !important; stroke: var(--teal-glow) !important; stroke-width: 2px !important; }
            .done0, .done1, .done2, .done3 { fill: rgba(0, 240, 194, 0.08) !important; stroke: var(--teal-glow) !important; stroke-dasharray: 4 !important; }

            /* Critical task bars — visually distinct (white border + brighter fill) */
            .crit0, .crit1, .crit2, .crit3 { fill: rgba(255, 255, 255, 0.18) !important; stroke: #fff !important; stroke-width: 2px !important; }
            .activeCrit0, .activeCrit1, .activeCrit2, .activeCrit3 { fill: rgba(255, 255, 255, 0.30) !important; stroke: #fff !important; stroke-width: 2px !important; }
            .doneCrit0, .doneCrit1, .doneCrit2, .doneCrit3 { fill: rgba(255, 255, 255, 0.08) !important; stroke: #fff !important; stroke-dasharray: 4 !important; }

            /* All task text — light readable color */
            .taskText0, .taskText1, .taskText2, .taskText3,
            .activeText0, .activeText1, .activeText2, .activeText3,
            .doneText0, .doneText1, .doneText2, .doneText3,
            .critText0, .critText1, .critText2, .critText3,
            .activeCritText0, .activeCritText1, .activeCritText2, .activeCritText3,
            .doneCritText0, .doneCritText1, .doneCritText2, .doneCritText3
            { fill: var(--md-default-fg-color, hsla(225deg, 15%, 90%, 0.82)) !important; font-family: 'Texturina', serif !important; }
            .taskTextOutside0, .taskTextOutside1, .taskTextOutside2, .taskTextOutside3,
            .taskTextOutsideRight, .taskTextOutsideLeft
            { fill: var(--teal-glow) !important; font-family: 'Texturina', serif !important; }
          `;
        }
        return origInit.call(this, config);
      };
      val._intercepted = true;
    }
    this._mermaid = val;
  }
});
