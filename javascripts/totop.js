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
    '<clipPath id="totop-clip"><rect class="totop__fuel" x="0" y="34.5" width="48" height="48"/></clipPath>' +
    // the rocket fills with fuel (bottom up) as you read, then launches when clicked
    '<path class="totop__rocket-fill" clip-path="url(#totop-clip)" d="M24 11c4.2 3 6 8 6 13v6.5h-12V24c0-5 1.8-10 6-13zM18 24.5l-4.2 5.3v3.4l4.2-2.2zM30 24.5l4.2 5.3v3.4l-4.2-2.2zM21 31h6l-1.1 3.2h-3.8z"/>' +
    '<path class="totop__rocket" d="M24 11c4.2 3 6 8 6 13v6.5h-12V24c0-5 1.8-10 6-13zM18 24.5l-4.2 5.3v3.4l4.2-2.2zM30 24.5l4.2 5.3v3.4l-4.2-2.2zM21 31h6l-1.1 3.2h-3.8z"/><circle class="totop__window" cx="24" cy="20.5" r="2.1"/></svg>';
  var ring, fuel;
  var ticking = false;
  var paint = function () {
    ticking = false;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? Math.min(1, window.scrollY / h) : 0;
    ring.setAttribute("stroke-dashoffset", (C * (1 - p)).toFixed(2));
    if (fuel) fuel.setAttribute("y", (34.5 - 23.5 * p).toFixed(2)); // nose at y=11, nozzle at y=34.5
    btn.classList.toggle("is-on", window.scrollY > 300);
  };
  var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(paint); } };
  btn.addEventListener("click", function () {
    var smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!smooth) { window.scrollTo({ top: 0 }); return; }
    if (btn.classList.contains("is-launch")) return;
    launch();
    setTimeout(function () { window.scrollTo({ top: 0, behavior: "smooth" }); }, 280); // glide up as it lifts off
  });
  // Rocket launch: shakes on the pad, then blasts up the screen (speeding up) with a flame and smoke puffs
  var launch = function () {
    var r = btn.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    var rocket = document.createElement("div");
    rocket.className = "rocket";
    rocket.style.left = x + "px"; rocket.style.top = y + "px";
    rocket.innerHTML = '<span class="rocket__flame"></span><span class="rocket__ship">🚀</span>';
    document.body.appendChild(rocket);
    btn.classList.add("is-launch");
    for (var i = 0; i < 7; i++) {
      var puff = document.createElement("span");
      puff.className = "rocket__puff";
      puff.style.left = x + (Math.random() - .5) * 26 + "px"; puff.style.top = y + 10 + Math.random() * 10 + "px";
      puff.style.setProperty("--dx", (Math.random() - .5) * 60 + "px");
      puff.style.animationDelay = 200 + i * 40 + "ms";
      document.body.appendChild(puff);
      setTimeout(puff.remove.bind(puff), 1800);
    }
    setTimeout(function () { rocket.remove(); btn.classList.remove("is-launch"); }, 1700);
  };
  var mount = function () {
    if (!btn.isConnected) document.body.appendChild(btn);
    ring = btn.querySelector(".totop__ring");
    fuel = btn.querySelector(".totop__fuel");
    paint();
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  if (window.document$) document$.subscribe(mount); else document.addEventListener("DOMContentLoaded", mount);
})();
