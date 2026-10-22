// Homepage hero spotlight: a soft light trails the mouse across the banner (eased, not jumpy).
document$.subscribe(function () {
  var hero = document.querySelector(".hero");
  if (!hero || hero.dataset.lit) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  hero.dataset.lit = "1";
  var tx = 50, ty = 40, x = 50, y = 40, raf = null;
  var step = function () {
    x += (tx - x) * 0.08;   // ease toward the target: quick at first, then slow
    y += (ty - y) * 0.08;
    hero.style.setProperty("--hx", x.toFixed(2) + "%");
    hero.style.setProperty("--hy", y.toFixed(2) + "%");
    raf = (Math.abs(tx - x) + Math.abs(ty - y) > 0.05) ? requestAnimationFrame(step) : null;
  };
  hero.addEventListener("pointermove", function (e) {
    var r = hero.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width * 100;
    ty = (e.clientY - r.top) / r.height * 100;
    hero.classList.add("is-lit");
    if (!raf) raf = requestAnimationFrame(step);
  });
  hero.addEventListener("pointerleave", function () { hero.classList.remove("is-lit"); });
});
