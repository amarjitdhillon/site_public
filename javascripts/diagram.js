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
      '<button type="button" class="dstage__present" aria-label="Present this diagram" title="Present (P)">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 3h20v2h-1v11h-6.6l1.9 5H14.2l-1.9-5h-.6l-1.9 5H7.7l1.9-5H3V5H2zm3 2v9h14V5zm4 1.5 6 3-6 3z"/></svg><span>Present</span></button>' +
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

    bar.querySelector(".dstage__present").addEventListener("click", function () { present(stage); });
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

  // P anywhere on the page presents the diagram nearest the middle of the screen
  if (!window.__presentKey) {
    window.__presentKey = true;
    document.addEventListener("keydown", function (e) {
      if ((e.key !== "p" && e.key !== "P") || e.metaKey || e.ctrlKey || e.altKey || document.querySelector(".presenter")) return;
      if (e.target.closest && e.target.closest("input, textarea, [contenteditable]")) return;
      var stages = Array.from(document.querySelectorAll(".dstage"));
      if (!stages.length) return;
      var mid = innerHeight / 2;
      stages.sort(function (a, b) {
        var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
        return Math.abs(ra.top + ra.height / 2 - mid) - Math.abs(rb.top + rb.height / 2 - mid);
      });
      e.preventDefault();
      present(stages[0]);
    });
  }
});

// Presenter mode: a clean full-screen keynote of one diagram for interviews and screen shares.
// The step-by-step page loads big with larger captions (arrow keys / space to move); a static-only diagram shows its image.
function present(stage) {
  var src = stage.querySelector("iframe.anim-diagram"), img = stage.querySelector(".dstage__body img");
  var name = stage.querySelector(".dstage__name").textContent;
  var lucid = stage.querySelector(".dstage__lucid");
  var box = document.createElement("div");
  box.className = "presenter";
  box.style.setProperty("--d1", stage.style.getPropertyValue("--d1") || "124, 58, 237");
  box.style.setProperty("--d2", stage.style.getPropertyValue("--d2") || "219, 39, 119");
  box.setAttribute("role", "dialog"); box.setAttribute("aria-label", "Presenting: " + name);
  box.innerHTML = '<div class="presenter__bar"><span class="presenter__dot"></span><b class="presenter__name"></b>' +
    '<span class="presenter__hint">← → or space to move, Esc to close</span>' +
    (lucid ? '<a class="presenter__btn presenter__lucid" target="_blank" rel="noopener">🔒 Lucid source</a>' : "") +
    '<button type="button" class="presenter__btn presenter__x" aria-label="Close presenter">✕</button></div><div class="presenter__stage"></div>';
  box.querySelector(".presenter__name").textContent = name;
  if (lucid) box.querySelector(".presenter__lucid").href = lucid.href;
  var holder = box.querySelector(".presenter__stage"), frame;
  if (src) {
    var ar = (src.style.aspectRatio || "16/10").split("/");
    holder.style.setProperty("--ar", (parseFloat(ar[0]) / parseFloat(ar[1])) || 1.6);
    frame = document.createElement("iframe");
    frame.src = src.getAttribute("src"); frame.className = "presenter__frame";
    frame.setAttribute("aria-label", name + ", step by step");
    frame.addEventListener("load", function () {
      try { // same site, so the step page can be restyled for a big screen and hand Esc back to us
        var d = frame.contentDocument, st = d.createElement("style");
        st.textContent = ".bar{padding:18px 26px;gap:18px}.cap b{font-size:26px;margin-bottom:4px}.cap span{font-size:19px;line-height:1.45}" +
          "button{font-size:18px;padding:12px 22px;border-radius:12px}.dots i{width:11px;height:11px}.stage{padding:14px}";
        d.head.appendChild(st);
        d.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
        frame.contentWindow.focus();
      } catch (err) {}
    });
    holder.appendChild(frame);
  } else if (img) {
    var big = document.createElement("img");
    big.src = img.currentSrc || img.src; big.alt = img.alt; big.className = "presenter__img";
    holder.appendChild(big);
  }
  function close() {
    document.removeEventListener("keydown", onKey, true);
    document.removeEventListener("fullscreenchange", onFs);
    if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
    box.classList.remove("is-in");
    setTimeout(function () { box.remove(); }, 500);
    document.documentElement.classList.remove("is-presenting");
  }
  function onKey(e) { if (e.key === "Escape") { e.preventDefault(); close(); } }
  function onFs() { if (!document.fullscreenElement && box.isConnected) close(); }
  box.querySelector(".presenter__x").addEventListener("click", close);
  document.addEventListener("keydown", onKey, true);
  document.body.appendChild(box);
  document.documentElement.classList.add("is-presenting");
  requestAnimationFrame(function () { box.classList.add("is-in"); });
  if (box.requestFullscreen) box.requestFullscreen().then(function () {
    document.addEventListener("fullscreenchange", onFs);
  }).catch(function () {});
}
