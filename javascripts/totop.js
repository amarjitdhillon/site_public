// Back-to-top ring: a round button bottom-right whose ring fills as you read; click to glide to the top.
(function () {
  var R = 20, C = 2 * Math.PI * R;
  var btn = document.createElement("button");
  btn.className = "totop";
  btn.setAttribute("aria-label", "Back to top");
  btn.innerHTML =
    '<svg viewBox="0 0 48 48" aria-hidden="true">' +
    '<defs><linearGradient id="totop-g" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#ffd166"/><stop offset=".5" stop-color="#ff7eb6"/><stop offset="1" stop-color="#7ce7ff"/></linearGradient></defs>' +
    '<circle class="totop__track" cx="24" cy="24" r="' + R + '"/>' +
    '<circle class="totop__ring" cx="24" cy="24" r="' + R + '" stroke-dasharray="' + C.toFixed(2) + '" stroke-dashoffset="' + C.toFixed(2) + '"/>' +
    '<path class="totop__arrow" d="M24 31V17M18 23l6-6 6 6"/></svg>';
  var ring;
  var ticking = false;
  var paint = function () {
    ticking = false;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? Math.min(1, window.scrollY / h) : 0;
    ring.setAttribute("stroke-dashoffset", (C * (1 - p)).toFixed(2));
    btn.classList.toggle("is-on", window.scrollY > 300);
  };
  var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(paint); } };
  btn.addEventListener("click", function () {
    var smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
  });
  var mount = function () {
    if (!btn.isConnected) document.body.appendChild(btn);
    ring = btn.querySelector(".totop__ring");
    paint();
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  if (window.document$) document$.subscribe(mount); else document.addEventListener("DOMContentLoaded", mount);
})();
