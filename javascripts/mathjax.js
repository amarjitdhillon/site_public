// LaTeX math: MathJax (about 260 KB) is downloaded only on pages that actually contain math,
// the first time one is opened, instead of on every page.
window.MathJax = {
  tex: {
    inlineMath: [["\\(", "\\)"]],
    displayMath: [["\\[", "\\]"]],
    processEscapes: true,
    processEnvironments: true
  },
  options: {
    ignoreHtmlClass: ".*|",
    processHtmlClass: "arithmatex"
  }
};

var mathjaxLoading = null;
document$.subscribe(function () {
  if (!document.querySelector(".arithmatex")) return;
  if (window.MathJax.typesetPromise) {
    MathJax.startup.output.clearCache();
    MathJax.typesetClear();
    MathJax.texReset();
    MathJax.typesetPromise();
  } else if (!mathjaxLoading) {
    // first math page: load the library, it typesets the page itself once ready
    mathjaxLoading = document.createElement("script");
    mathjaxLoading.src = "https://unpkg.com/mathjax@3.2.2/es5/tex-mml-chtml.js";
    mathjaxLoading.async = true;
    document.head.appendChild(mathjaxLoading);
  }
});
