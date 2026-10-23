// Edge ray: now and then a ray of light runs once around the border of a random box or card on screen.
// Never every box, never on a fixed beat: one visible box at a time, at random gaps, in its own colour.
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var SEL = ".md-typeset .admonition, .md-typeset details[open], .md-typeset .grid.cards:not(.proof, .featured) > :is(ul, ol) > li, .md-typeset a.rn-card";
  var timer, io;

  function colour(el) {
    var cs = getComputedStyle(el);
    return (cs.getPropertyValue("--g1") || cs.getPropertyValue("--c1") || cs.getPropertyValue("--s1")).trim() || "124, 92, 255";
  }

  function fire(el) {
    var ray = el.querySelector(":scope > .edge-ray");
    if (!ray) {
      ray = document.createElement("span");
      ray.className = "edge-ray";
      ray.setAttribute("aria-hidden", "true");
      el.appendChild(ray);
      ray.addEventListener("animationend", function (e) { if (e.animationName === "ray-fade") ray.classList.remove("ray-run"); });
    }
    if (ray.classList.contains("ray-run")) return;
    ray.style.setProperty("--ray", colour(el));
    ray.style.setProperty("--ray-from", Math.round(Math.random() * 360) + "deg"); // starts somewhere new each time
    void ray.offsetWidth;
    ray.classList.add("ray-run");
  }

  document$.subscribe(function () {
    clearTimeout(timer);
    if (io) io.disconnect();
    var seen = new Set(), last = null;
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.isIntersecting ? seen.add(e.target) : seen.delete(e.target); });
    }, { threshold: 0.6 });
    document.querySelectorAll(SEL).forEach(function (el) {
      if (el.parentElement.closest(".admonition, details")) return; // outer boxes only
      io.observe(el);
    });
    (function tick() {
      timer = setTimeout(function () {
        var pool = Array.from(seen).filter(function (el) { return el !== last && el.matches(SEL); });
        if (pool.length && !document.hidden && Math.random() < 0.75) { // sometimes nothing happens at all
          last = pool[Math.floor(Math.random() * pool.length)];
          fire(last);
        }
        tick();
      }, 2500 + Math.random() * 4500);
    })();
  });
})();
