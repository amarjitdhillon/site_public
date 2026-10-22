// Section titles (h2) draw a gradient underline when they scroll into view.
document$.subscribe(function () {
  var hs = document.querySelectorAll(".md-content .md-typeset h2");
  if (!hs.length) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("uline-in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  hs.forEach(function (h) {
    if (h.closest(".bento, .grid, .admonition, details, .tabbed-block")) return; // only real section titles
    h.classList.add("uline");
    io.observe(h);
  });
});
