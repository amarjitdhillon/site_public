// Spotlight cards: a soft glow follows the mouse across cards (desktop / mouse only).
(function () {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  var SEL = ".md-typeset .grid.cards > ul > li, .md-typeset .grid.cards > ol > li, .md-typeset a.cert-tile, .md-typeset .admonition, .md-typeset details, .md-typeset .bento__tile";
  document.addEventListener("pointermove", function (e) {
    var card = e.target.closest && e.target.closest(SEL); // innermost box wins (boxes can be nested)
    if (!card) return;
    var r = card.getBoundingClientRect();
    card.style.setProperty("--mx", (e.clientX - r.left) + "px");
    card.style.setProperty("--my", (e.clientY - r.top) + "px");
  }, { passive: true });
})();
