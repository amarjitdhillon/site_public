// Page transitions: when you move to another page (Material's instant navigation), the new page
// fades in and slides up a little instead of snapping in. Off for reduced motion.
(function () {
  var first = true;
  document$.subscribe(function () {
    if (first) { first = false; return; } // the first page load already has its own reveal
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (document.documentElement.classList.contains("vt-nav")) return; // a card morph (morph.js) is already animating this one
    var root = document.documentElement;
    root.classList.remove("page-in");
    void root.offsetWidth; // restart the animation
    root.classList.add("page-in");
    clearTimeout(window.__pageInTimer);
    window.__pageInTimer = setTimeout(function () { root.classList.remove("page-in"); }, 2000);
  });
})();
