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
            .gantt-title, .titleText { fill: var(--teal-glow) !important; font-size: 1.5rem !important; font-family: 'New Rocker', serif !important; }
            .grid .tick text { fill: var(--muted-text) !important; font-family: 'Texturina', serif !important; }
            .taskText { fill: #1a1a2e !important; font-family: 'Texturina', serif !important; font-weight: 600 !important; }
            .taskTextOutsideRight, .taskTextOutsideLeft { fill: var(--teal-glow) !important; text-shadow: none !important; font-family: 'Texturina', serif !important; }
            .task { fill: var(--md-mermaid-node-bg-color, rgba(0, 240, 194, 0.12)) !important; stroke: var(--teal-glow) !important; stroke-width: 1.5px !important; }
            .activeTask { fill: rgba(0, 240, 194, 0.7) !important; stroke: var(--teal-glow) !important; stroke-width: 2px !important; }
            .doneTask { fill: rgba(0, 240, 194, 0.15) !important; stroke: var(--teal-glow) !important; stroke-dasharray: 4 !important; }
            .critTask { stroke: #fff !important; }
            .sectionTitle { fill: var(--teal-glow) !important; opacity: 0.8 !important; font-family: 'Texturina', serif !important; }
          `;
        }
        return origInit.call(this, config);
      };
      val._intercepted = true;
    }
    this._mermaid = val;
  }
});
