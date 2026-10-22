// Scroll-reveal + reading progress on every page (`reveal: false` in the front matter turns it off).
// Re-runs after Material's instant navigation via document$.
document$.subscribe(function () {
  var bar = document.getElementById("read-progress");
  if (window.__revealScroll) {
    window.removeEventListener("scroll", window.__revealScroll);
    window.__revealScroll = null;
  }
  if (!document.querySelector("[data-reveal-page]")) {
    if (bar) bar.remove();
    return;
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Reading progress bar under the header
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "read-progress";
    document.body.appendChild(bar);
  }
  var ticking = false;
  var paint = function () {
    ticking = false;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = "scaleX(" + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ")";
    // reveal everything that is on screen or already scrolled past (covers jumps and fast flicks)
    var limit = window.innerHeight * 0.94;
    document.querySelectorAll(".rv:not(.rv-in)").forEach(function (el) {
      if (el.getBoundingClientRect().top < limit) el.classList.add("rv-in");
    });
  };
  window.__revealScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(paint); } };
  window.addEventListener("scroll", window.__revealScroll, { passive: true });
  paint();

  // Things that fade and slide in as they enter the screen
  var root = document.querySelector(".md-content .md-typeset") || document.querySelector(".md-typeset");
  if (!root) return;
  var targets = [];
  [].forEach.call(root.children, function (el) {
    if (el.matches("h1, script, style, [data-reveal-page], .about-timeline")) return; // timelines animate on their own
    if (el.matches(".grid, .bento")) {
      // cascade: each card follows the previous one
      var cards = el.querySelectorAll(":scope > ul > li, :scope > .admonition, :scope > details, :scope > .card, :scope > .bento__tile");
      [].forEach.call(cards, function (c, i) { c.style.setProperty("--rv-delay", Math.min(i, 8) * 110 + "ms"); targets.push(c); });
      return;
    }
    targets.push(el);
  });
  targets.forEach(function (el) {
    // anything already on screen at load just shows, no flash
    el.classList.add("rv");
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) el.classList.add("rv-in");
  });
  paint();
});
