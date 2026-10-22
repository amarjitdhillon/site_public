// Homepage UFO: every time the homepage loads, a little UFO glides across the hero's night sky,
// wobbling, with a quick tractor-beam flicker halfway. Typing "alien" or "ufo" summons it again.
// Never blocks clicks; skipped for reduced motion.
(function () {
  var flying = false;

  function fly() {
    var hero = document.querySelector(".hero");
    if (!hero || flying || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    flying = true;
    var ufo = document.createElement("div");
    ufo.className = "ufo";
    ufo.setAttribute("aria-hidden", "true");
    ufo.innerHTML =
      '<svg viewBox="0 0 120 80"><defs>' +
      '<linearGradient id="ufo-hull" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9ecff"/><stop offset="1" stop-color="#7c83c9"/></linearGradient>' +
      '<radialGradient id="ufo-dome" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#cffaff"/><stop offset="1" stop-color="#5ad1e6" stop-opacity=".55"/></radialGradient>' +
      '<linearGradient id="ufo-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd166" stop-opacity=".7"/><stop offset="1" stop-color="#ffd166" stop-opacity="0"/></linearGradient>' +
      '</defs>' +
      '<path class="ufo__beam" d="M48 44 L28 80 L92 80 L72 44 Z" fill="url(#ufo-beam)"/>' +
      '<ellipse cx="60" cy="26" rx="17" ry="15" fill="url(#ufo-dome)"/>' +
      '<ellipse cx="60" cy="36" rx="46" ry="11" fill="url(#ufo-hull)"/>' +
      '<ellipse cx="60" cy="33" rx="46" ry="5" fill="#fff" opacity=".35"/>' +
      '<g class="ufo__lights"><circle cx="30" cy="38" r="3"/><circle cx="45" cy="41" r="3"/><circle cx="60" cy="42" r="3"/><circle cx="75" cy="41" r="3"/><circle cx="90" cy="38" r="3"/></g>' +
      '</svg>';
    hero.appendChild(ufo);

    var r = hero.getBoundingClientRect(), W = r.width, H = r.height;
    var size = Math.max(54, Math.min(96, W * .07));
    var ltr = Math.random() < .5, dur = 6500, t0 = null;
    var yBase = 8 + Math.random() * Math.min(H * .06, 30); // top band of the sky, above the headline and above Shiva's head
    function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2 } // gentle start and stop
    function step(now) {
      if (!t0) t0 = now;
      var p = Math.min((now - t0) / dur, 1), e = ease(p);
      var x = ltr ? -size + (W + size * 2) * e : W + size - (W + size * 2) * e;
      var y = yBase + Math.sin(p * Math.PI * 4) * 10 + Math.sin(p * Math.PI) * Math.min(H * .05, 24);
      var tilt = Math.cos(p * Math.PI * 4) * 6 + (ltr ? 4 : -4);
      ufo.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) rotate(" + tilt.toFixed(1) + "deg)";
      ufo.classList.toggle("ufo--beam", p > .44 && p < .56); // beam flicker halfway across
      if (p < 1 && ufo.isConnected) requestAnimationFrame(step);
      else { ufo.remove(); flying = false }
    }
    ufo.style.width = size + "px";
    requestAnimationFrame(step);
  }

  // every homepage view: fly in after a short pause
  document$.subscribe(function () {
    if (document.querySelector(".hero")) setTimeout(fly, 2200);
  });

  // secret: type "alien" or "ufo" anywhere on the homepage
  var typed = "";
  document.addEventListener("keydown", function (e) {
    if (e.target.closest && e.target.closest("input, textarea, [contenteditable]")) return;
    typed = (typed + (e.key || "")).slice(-5).toLowerCase();
    if (typed === "alien" || typed.slice(-3) === "ufo") { typed = ""; fly() }
  });
})();
