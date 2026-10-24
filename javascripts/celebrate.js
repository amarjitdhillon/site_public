// Celebrations: a small confetti burst in the page's section colours. window.tsConfetti(element) fires it from that
// element; claps.js calls it on the 10th clap, readmark.js when a page earns its "✓ Read". Off for reduced motion.
window.tsConfetti = function (from) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var r = from && from.getBoundingClientRect ? from.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
  var x0 = r.left + r.width / 2, y0 = r.top + r.height / 2;
  var cs = getComputedStyle(document.documentElement);
  var sec = function (v, fb) { var s = cs.getPropertyValue(v).trim() || fb; return "rgb(" + s + ")"; };
  var colours = [sec("--sec1", "124, 58, 237"), sec("--sec2", "219, 39, 119"), "#ffd166", "#7ce7ff", "#ff7eb6"];
  var c = document.createElement("canvas"), dpr = Math.min(devicePixelRatio || 1, 2);
  c.className = "confetti"; c.width = innerWidth * dpr; c.height = innerHeight * dpr;
  document.body.appendChild(c);
  var ctx = c.getContext("2d"); ctx.scale(dpr, dpr);
  var bits = [];
  for (var i = 0; i < 90; i++) {
    var a = -Math.PI / 2 + (Math.random() - .5) * 2.2, v = 6 + Math.random() * 8;
    bits.push({ x: x0, y: y0, vx: Math.cos(a) * v, vy: Math.sin(a) * v, w: 5 + Math.random() * 6, h: 3 + Math.random() * 4,
      rot: Math.random() * 6, vr: (Math.random() - .5) * .4, c: colours[i % colours.length] });
  }
  var start = performance.now();
  (function frame(now) {
    var t = now - start;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    bits.forEach(function (b) {
      b.vy += .32; b.vx *= .985; b.vy *= .985; b.x += b.vx; b.y += b.vy; b.rot += b.vr;
      ctx.save(); ctx.globalAlpha = Math.max(0, 1 - t / 1800);
      ctx.translate(b.x, b.y); ctx.rotate(b.rot); ctx.fillStyle = b.c; ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); ctx.restore();
    });
    if (t < 1800) requestAnimationFrame(frame); else c.remove();
  })(start);
};
