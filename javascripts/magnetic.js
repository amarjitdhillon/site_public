// Magnetic buttons: big buttons drift toward the mouse when it comes close, then glide back.
// Mouse only, off for reduced motion.
document$.subscribe(function () {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var btns = Array.prototype.slice.call(document.querySelectorAll(".md-typeset .md-button, .hero .md-button"));
  if (!btns.length) return;
  var RANGE = 60;   // px around the button where the pull starts
  var PULL = 0.2;   // how far it follows the cursor (0..1)
  var MAX = 5;      // never move more than this many px: less than the gap between buttons, so they never touch

  btns.forEach(function (b) { b.classList.add("mag"); });
  if (window.__magMove) document.removeEventListener("pointermove", window.__magMove);
  var ticking = false, last = null;
  window.__magMove = function (e) {
    last = e;
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      // only the single closest button in range moves, so neighbours never slide into each other
      var best = null, bestD = RANGE, bx = 0, by = 0;
      btns.forEach(function (b) {
        if (!b.isConnected) return;
        var r = b.getBoundingClientRect();
        var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        var dx = last.clientX - cx, dy = last.clientY - cy;
        // distance from the button's edge, not its centre
        var ex = Math.max(0, Math.abs(dx) - r.width / 2), ey = Math.max(0, Math.abs(dy) - r.height / 2);
        var d = Math.hypot(ex, ey);
        if (d < bestD) { best = b; bestD = d; bx = dx; by = dy; }
      });
      btns.forEach(function (b) {
        if (b === best) {
          var mx = Math.max(-MAX, Math.min(MAX, bx * PULL)), my = Math.max(-MAX, Math.min(MAX, by * PULL));
          b.style.transform = "translate(" + mx.toFixed(1) + "px," + my.toFixed(1) + "px)";
          b.classList.add("mag--on");
        } else if (b.classList.contains("mag--on")) {
          b.style.transform = "";
          b.classList.remove("mag--on");
        }
      });
    });
  };
  document.addEventListener("pointermove", window.__magMove, { passive: true });
});
