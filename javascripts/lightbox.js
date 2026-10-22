// Diagram lightbox: click any linked image to open it full screen.
// Wheel / pinch to zoom, drag to pan, double-click to reset, Esc / ✕ / backdrop to close.
(function () {
  var box, img, scale = 1, tx = 0, ty = 0, pointers = new Map(), pinch = null, drag = null;

  function apply() { img.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + scale + ")"; }
  function reset() { scale = 1; tx = 0; ty = 0; apply(); }
  function zoomAt(f, cx, cy) {
    var r = box.getBoundingClientRect();
    var ox = cx - r.width / 2 - tx, oy = cy - r.height / 2 - ty;
    var ns = Math.min(8, Math.max(1, scale * f));
    tx -= ox * (ns / scale - 1); ty -= oy * (ns / scale - 1);
    scale = ns;
    if (scale === 1) { tx = 0; ty = 0; }
    apply();
  }

  function build() {
    box = document.createElement("div");
    box.className = "lb";
    box.innerHTML = '<img alt=""><button class="lb__x" aria-label="Close">✕</button>' +
      '<div class="lb__hint">Scroll or pinch to zoom · drag to pan · double-click to reset</div>';
    img = box.querySelector("img");
    document.body.appendChild(box);

    box.querySelector(".lb__x").onclick = close;
    box.addEventListener("click", function (e) { if (e.target === box && !box.dataset.moved) close(); });
    box.addEventListener("wheel", function (e) { e.preventDefault(); zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX, e.clientY); }, { passive: false });
    img.addEventListener("dblclick", function (e) { e.preventDefault(); scale > 1 ? reset() : zoomAt(2.5, e.clientX, e.clientY); });

    box.addEventListener("pointerdown", function (e) {
      if (e.target.closest(".lb__x")) return;
      box.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      box.dataset.moved = "";
      if (pointers.size === 2) {
        var p = Array.from(pointers.values());
        pinch = { d: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y), s: scale };
        drag = null;
      } else {
        drag = { x: e.clientX - tx, y: e.clientY - ty };
      }
    });
    box.addEventListener("pointermove", function (e) {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && pointers.size === 2) {
        var p = Array.from(pointers.values());
        var d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
        zoomAt((pinch.s * d / pinch.d) / scale, (p[0].x + p[1].x) / 2, (p[0].y + p[1].y) / 2);
        box.dataset.moved = "1";
      } else if (drag && scale > 1) {
        tx = e.clientX - drag.x; ty = e.clientY - drag.y; apply();
        box.dataset.moved = "1";
      }
    });
    var up = function (e) {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = null;
      if (pointers.size === 0) drag = null;
      setTimeout(function () { box.dataset.moved = ""; }, 0);
    };
    box.addEventListener("pointerup", up);
    box.addEventListener("pointercancel", up);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && box.classList.contains("is-open")) close(); });
  }

  function open(src, alt) {
    if (!box) build();
    img.src = src; img.alt = alt || "";
    reset();
    box.classList.add("is-open");
    document.documentElement.style.overflow = "hidden";
  }
  function close() {
    box.classList.remove("is-open");
    document.documentElement.style.overflow = "";
  }

  var IMG_RE = /\.(png|jpe?g|svg|webp|gif)(\?.*)?$/i;

  // A content image is zoomable if it's diagram-sized and not an icon/emoji/badge,
  // and it isn't a link to another page (those keep working as links).
  function zoomable(im) {
    if (!im.closest(".md-typeset") || im.closest(".lb, .twemoji, .emojione, .cert-tile, .cert-badge, .cert-feat, .about-hero")) return false;
    var a = im.closest("a");
    if (a && !IMG_RE.test(a.getAttribute("href") || "")) return false;
    return (im.naturalWidth || im.width) >= 240 && im.getBoundingClientRect().width >= 120;
  }

  function mark() {
    document.querySelectorAll(".md-typeset img").forEach(function (im) {
      var go = function () { im.classList.toggle("lb-zoom", zoomable(im)); };
      im.complete ? go() : im.addEventListener("load", go, { once: true });
    });
  }
  if (window.document$) document$.subscribe(mark); else document.addEventListener("DOMContentLoaded", mark);

  document.addEventListener("click", function (e) {
    var im = e.target.closest(".md-typeset img");
    if (!im || !zoomable(im)) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey) return; // keep "open in new tab"
    e.preventDefault();
    var a = im.closest("a");
    open(a ? a.href : (im.currentSrc || im.src), im.alt);
  });
})();
