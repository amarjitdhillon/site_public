// 3D tilt: cards lean toward the mouse like a physical card (mouse only).
// Applies to the About "Proof, not promises" photos and the homepage "Featured diagrams".
(function () {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var SEL = ".md-typeset .proof > ul > li, .md-typeset .featured > ul > li";
  var MAX = 16; // degrees
  var current = null;

  function reset(card) {
    card.style.transition = "transform .45s ease";
    card.style.transform = "";
  }

  document.addEventListener("pointermove", function (e) {
    var card = e.target.closest && e.target.closest(SEL);
    if (current && current !== card) { reset(current); current = null; }
    if (!card) return;
    current = card;
    var r = card.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width - 0.5;   // -0.5 .. 0.5
    var y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transition = "transform .08s linear";
    card.style.transform = "perspective(900px) rotateX(" + (-y * MAX).toFixed(2) + "deg) rotateY(" + (x * MAX).toFixed(2) + "deg) scale(1.05)";
  }, { passive: true });

  document.addEventListener("pointerleave", function () { if (current) { reset(current); current = null; } });
})();
