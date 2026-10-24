// 3D tilt: cards lean toward the mouse like a physical card (mouse only).
// Applies to the About "Proof, not promises" photos, the homepage "Featured diagrams" and the blog cover cards
// (homepage + blog list), which tilt more gently and get a glare that follows the cursor like a shiny card.
(function () {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var SEL = ".md-typeset .proof > ul > li, .md-typeset .featured > ul > li, a.post-card";
  var MAX = 16; // degrees
  var current = null;

  function reset(card) {
    card.style.transition = "transform .9s cubic-bezier(.16, 1, .3, 1)";
    card.style.transform = "";
    card.classList.remove("is-tilting");
  }

  document.addEventListener("pointermove", function (e) {
    var card = e.target.closest && e.target.closest(SEL);
    if (current && current !== card) { reset(current); current = null; }
    if (!card) return;
    current = card;
    var r = card.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width - 0.5;   // -0.5 .. 0.5
    var y = (e.clientY - r.top) / r.height - 0.5;
    var cover = card.classList.contains("post-card"), max = cover ? 10 : MAX, lift = cover ? 1.03 : 1.05;
    card.style.transition = "transform .08s linear";
    card.style.transform = "perspective(900px) rotateX(" + (-y * max).toFixed(2) + "deg) rotateY(" + (x * max).toFixed(2) + "deg) scale(" + lift + ")";
    if (cover) { // the glare sits where the light would hit
      card.style.setProperty("--gx", ((x + 0.5) * 100).toFixed(1) + "%");
      card.style.setProperty("--gy", ((y + 0.5) * 100).toFixed(1) + "%");
      card.classList.add("is-tilting");
    }
  }, { passive: true });

  document.addEventListener("pointerleave", function () { if (current) { reset(current); current = null; } });
})();
