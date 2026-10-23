// Diagram stage: every diagram (the tab set or image just before a "Designed by Amar Dhillon" credit) goes into a
// canvas-style frame with a toolbar (name + full screen button) and the credit as a signature chip in the footer.
document$.subscribe(function () {
  var head = document.querySelector(".page-head");
  document.querySelectorAll(".md-typeset p > small").forEach(function (small) {
    if (!/Designed by Amar Dhillon/.test(small.textContent)) return;
    var credit = small.parentElement, diagram = credit.previousElementSibling;
    if (!diagram || diagram.closest(".dstage") || !diagram.querySelector("img, iframe")) return;

    var frame = diagram.querySelector("iframe.anim-diagram"), img = diagram.querySelector("img");
    var name = (img && img.alt) || (frame && (frame.getAttribute("aria-label") || "").replace(/, step by step$/i, "")) || "Diagram";

    var stage = document.createElement("figure");
    stage.className = "dstage";
    if (head) {
      stage.style.setProperty("--d1", head.style.getPropertyValue("--s1"));
      stage.style.setProperty("--d2", head.style.getPropertyValue("--s2"));
    }
    var icons = small.querySelectorAll(".twemoji"); // pencil-ruler, magnify-plus, lock-outline
    var lucid = small.querySelector('a[href*="lucid.app"]');

    var bar = document.createElement("div");
    bar.className = "dstage__bar";
    bar.innerHTML = '<span class="dstage__dot"></span><span class="dstage__name"></span>' +
      '<button type="button" class="dstage__full" aria-label="Open the diagram full screen" title="Full screen">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h5V3H3v7h2zm5 14H5v-5H3v7h7zm11-5h-2v5h-5v2h7zM19 10h2V3h-7v2h5z"/></svg></button>';
    bar.querySelector(".dstage__name").textContent = name;

    var foot = document.createElement("div");
    foot.className = "dstage__foot";
    var hint = document.createElement("span");
    hint.className = "dstage__hint";
    if (icons[1]) hint.appendChild(icons[1].cloneNode(true));
    hint.appendChild(document.createTextNode(" Click the diagram to zoom in"));
    var sig = document.createElement("span");
    sig.className = "dstage__sig";
    if (icons[0]) sig.appendChild(icons[0].cloneNode(true));
    sig.appendChild(document.createTextNode(" Designed by Amar Dhillon"));
    var chips = document.createElement("span");
    chips.className = "dstage__chips";
    chips.appendChild(sig);
    if (lucid) { // the author's own Lucid source, its own chip so it's easy to find when walking someone through it
      var src = document.createElement("a");
      src.href = lucid.href; src.target = "_blank"; src.rel = "noopener"; src.className = "dstage__lucid";
      src.title = "Open the editable Lucid diagram (author only)";
      if (icons[2]) src.appendChild(icons[2].cloneNode(true));
      src.appendChild(document.createTextNode(" Lucid source "));
      var only = document.createElement("small");
      only.textContent = "author only";
      src.appendChild(only);
      chips.appendChild(src);
    }
    foot.appendChild(hint); foot.appendChild(chips);

    var body = document.createElement("div");
    body.className = "dstage__body";
    diagram.parentNode.insertBefore(stage, diagram);
    body.appendChild(diagram);
    stage.appendChild(bar); stage.appendChild(body); stage.appendChild(foot);
    credit.remove();

    bar.querySelector(".dstage__full").addEventListener("click", function () {
      // whichever view is showing: the step-by-step frame goes full screen, the static image opens the zoom lightbox
      var live = Array.from(body.querySelectorAll("iframe.anim-diagram, img")).find(function (el) { return el.offsetParent !== null; });
      if (!live) return;
      if (live.tagName === "IFRAME") {
        var go = live.requestFullscreen || live.webkitRequestFullscreen;
        go ? go.call(live) : window.open(live.src, "_blank");
      } else {
        live.click();
      }
    });
  });
});
