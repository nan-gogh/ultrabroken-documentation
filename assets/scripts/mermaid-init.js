/**
 * mermaid-init.js
 *
 * Global Mermaid theme configuration for the Ultrabroken Archives.
 * Initializes Mermaid with teal theme variables and triggers diagram rendering.
 * Must be loaded immediately after the Mermaid CDN script.
 */

// Wait for Mermaid to be available, then configure and render
if (typeof mermaid !== 'undefined') {
  mermaid.initialize({
    startOnLoad: false,  /* we'll call contentLoaded() manually */
    theme: "base",
    themeVariables: {
      /* --- Core colours -------------------------------------------------- */
      primaryColor: "#00796b",          /* node / shape fill */
      primaryBorderColor: "#00f0c2",    /* node borders */
      primaryTextColor: "#ffffff",      /* text inside primary nodes */
      lineColor: "#00f0c2",             /* arrows and connector lines */
      textColor: "#e0e0e0",             /* general diagram text */
      edgeLabelBackground: "#1a2332",   /* background behind edge labels */
      titleColor: "#00f0c2",            /* diagram title */

      /* --- Backgrounds --------------------------------------------------- */
      background: "#0d1b2a",
      mainBkg: "#1a2332",               /* default node background */
      nodeBorder: "#00f0c2",
      clusterBkg: "#1e2d3d",            /* subgraph / cluster fill */
      clusterBorder: "#00f0c2",

      /* --- Sequence diagrams --------------------------------------------- */
      actorBkg: "#00796b",
      actorBorder: "#00f0c2",
      actorTextColor: "#ffffff",
      activationBkgColor: "#1e2d3d",
      activationBorderColor: "#00f0c2",
      sequenceNumberColor: "#00f0c2",

      /* --- Class diagrams ------------------------------------------------ */
      classText: "#ffffff",

      /* --- State diagrams ------------------------------------------------ */
      labelColor: "#e0e0e0",

      /* --- Gantt charts -------------------------------------------------- */
      gridColor: "#2a3a4a",
      taskBkgColor: "#00796b",
      taskBorderColor: "#00f0c2",
      taskTextColor: "#ffffff",
      taskTextOutsideColor: "#e0e0e0",
      activeTaskBkgColor: "#005f56",
      activeTaskBorderColor: "#00f0c2",
      doneTaskBkgColor: "#37474f",
      doneTaskBorderColor: "#607d8b",
      critBkgColor: "#4e1a1a",
      critBorderColor: "#ef5350",
      sectionBkgColor: "#1e2d3d",
      altSectionBkgColor: "#162336",
      sectionBkgColor2: "#1e2d3d",

      /* --- Pie charts ---------------------------------------------------- */
      pie1: "#00796b",
      pie2: "#0097a7",
      pie3: "#00acc1",
      pie4: "#4db6ac",
      pie5: "#80cbc4",
      pie6: "#b2dfdb",
      pieOuterStrokeColor: "#00f0c2",
      pieInnerStrokeColor: "#00f0c2",
      pieTitleTextColor: "#00f0c2",
      pieSectionTextColor: "#ffffff",

      /* --- ER diagrams --------------------------------------------------- */
      attributeBackgroundColorEven: "#1a2332",
      attributeBackgroundColorOdd: "#1e2d3d",
      fillType0: "#00796b",
      fillType1: "#0097a7",
    },
  });

  /* Trigger diagram rendering after DOM content loads and theme is configured */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      mermaid.contentLoaded();
    });
  } else {
    /* DOM already loaded, render immediately */
    mermaid.contentLoaded();
  }
}

