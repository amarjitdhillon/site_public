// Section titles (h2): when they scroll into view, the words rise in one after another (Apple style),
// then the gradient underline draws in. Words are wrapped in .w spans; emoji, icons and abbreviations move as one word.
function splitWords(h) {
  var n = 0;
  Array.from(h.childNodes).forEach(function (node) {
    if (node.nodeType === 3) {
      var frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { // keep the space as its own span: these headings drop loose spaces
          var sp = document.createElement("span"); sp.className = "w-sp"; sp.textContent = " "; frag.appendChild(sp); return;
        }
        var w = document.createElement("span");
        w.className = "w"; w.style.setProperty("--i", n++); w.textContent = part;
        frag.appendChild(w);
      });
      node.replaceWith(frag);
    } else if (node.nodeType === 1 && !node.classList.contains("headerlink")) {
      var wrap = document.createElement("span");
      wrap.className = "w"; wrap.style.setProperty("--i", n++);
      node.replaceWith(wrap); wrap.appendChild(node);
    }
  });
  h.style.setProperty("--words", n);
}
document$.subscribe(function () {
  var hs = document.querySelectorAll(".md-content .md-typeset h2");
  if (!hs.length) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("uline-in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  hs.forEach(function (h) {
    if (h.closest(".bento, .grid, .admonition, details, .tabbed-block, .about-hero")) return; // only real section titles
    h.classList.add("uline");
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && !h.querySelector(".w")) splitWords(h);
    io.observe(h);
  });
});
