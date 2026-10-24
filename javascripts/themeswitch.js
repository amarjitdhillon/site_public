// Circular theme switch: clicking the sun/moon spreads the new theme out from the button in a growing circle
// (View Transitions), instead of the whole page flipping at once. Plain switch on older browsers and reduced motion.
(function () {
  if (!document.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var replaying = false;

  document.addEventListener("click", function (e) {
    if (replaying) return;
    var label = e.target.closest && e.target.closest('form[data-md-component="palette"] label[for]');
    if (!label || document.documentElement.classList.contains("vt-nav")) return; // a card morph owns the screen
    var input = document.getElementById(label.htmlFor);
    if (!input) return;
    e.preventDefault(); e.stopPropagation();

    var r = label.getBoundingClientRect();
    var x = r.left + r.width / 2, y = r.top + r.height / 2;
    var radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    var root = document.documentElement;
    root.style.setProperty("--vt-x", x + "px"); root.style.setProperty("--vt-y", y + "px"); root.style.setProperty("--vt-r", radius + "px");
    root.classList.add("vt-theme");

    var t = document.startViewTransition(function () {
      return new Promise(function (resolve) {
        replaying = true; label.click(); replaying = false; // Material switches the palette as usual
        setTimeout(resolve, 40); // not requestAnimationFrame: frames are paused during the update
      });
    });
    t.finished.finally(function () { root.classList.remove("vt-theme"); });
    label.closest("form").classList.remove("is-spin"); void label.offsetWidth;
    label.closest("form").classList.add("is-spin");
  }, true);
})();
