// About page: count-up stats and the cert wall filter.
// Uses Material's document$ so it re-runs after instant navigation.
document$.subscribe(function () {
  // Count-up numbers when the stats strip scrolls into view
  var nums = document.querySelectorAll(".about-stat__num[data-count]");
  if (nums.length) {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var run = function (el) {
      var target = parseInt(el.dataset.count, 10);
      if (reduce) { el.textContent = target; return; }
      var start = null;
      var step = function (t) {
        if (!start) start = t;
        var p = Math.min((t - start) / 4800, 1); // count-up takes ~5s
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 5))); // ease-out: fast, then slow, then very slow
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    nums.forEach(function (el) { el.textContent = "0"; io.observe(el); });
  }

  // Email button: the address is put together here so it never sits in the page source for scrapers
  document.querySelectorAll(".js-mail[data-u][data-d]").forEach(function (a) {
    a.href = "mailto:" + a.dataset.u + "@" + a.dataset.d + "?subject=" + encodeURIComponent("Hi Amar, from your TechSpace");
  });

  // Rotating role line in the hero
  var rot = document.querySelector(".about-rotator[data-words]");
  if (rot && !rot.dataset.started) {
    rot.dataset.started = "1";
    var words = rot.dataset.words.split("|");
    var i = 0;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInterval(function () {
        rot.classList.add("is-out");
        setTimeout(function () {
          i = (i + 1) % words.length;
          rot.textContent = words[i];
          rot.classList.remove("is-out");
        }, 300);
      }, 2400);
    }
  }

  // Timelines: the line draws itself as you scroll, roles slide in, dots light up when reached
  var lines = document.querySelectorAll(".about-timeline");
  if (lines.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var items = [];
    lines.forEach(function (tl) {
      tl.classList.add("is-anim");
      tl.querySelectorAll(".about-tl__item").forEach(function (it) { items.push(it); });
    });
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); seen.unobserve(e.target); } });
    }, { threshold: 0.25 });
    items.forEach(function (it) { seen.observe(it); });
    var ticking = false;
    var update = function () {
      ticking = false;
      var mark = window.innerHeight * 0.7;
      lines.forEach(function (tl) {
        var r = tl.getBoundingClientRect();
        var p = Math.max(0, Math.min(1, (mark - r.top) / r.height));
        tl.style.setProperty("--p", p.toFixed(3));
        var reach = p * r.height;
        tl.querySelectorAll(".about-tl__item").forEach(function (it) {
          it.classList.toggle("is-hit", it.offsetTop + 8 <= reach);
        });
      });
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    // instant navigation re-runs this block, so drop the previous page's listeners first
    if (window.__tlScroll) {
      window.removeEventListener("scroll", window.__tlScroll);
      window.removeEventListener("resize", window.__tlScroll);
    }
    window.__tlScroll = onScroll;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  // Skills radar: draw a spider chart from data-skills="Label:value|...", grow it when it scrolls into view
  document.querySelectorAll(".radar[data-skills]").forEach(function (box) {
    if (box.dataset.drawn) return;
    box.dataset.drawn = "1";
    var items = box.dataset.skills.split("|").map(function (p) { var a = p.split(":"); return { label: a[0], v: +a[1] }; });
    var n = items.length, R = 105, NS = "http://www.w3.org/2000/svg";
    var pt = function (i, r) { var a = -Math.PI / 2 + i * 2 * Math.PI / n; return [r * Math.cos(a), r * Math.sin(a)]; };
    var poly = function (r) { return items.map(function (_, i) { return pt(i, typeof r === "function" ? r(i) : r).join(","); }).join(" "); };
    var svg = '<svg viewBox="-170 -150 340 300" class="radar__svg">';
    [0.25, 0.5, 0.75, 1].forEach(function (f) { svg += '<polygon class="radar__ring" points="' + poly(R * f) + '"/>'; });
    items.forEach(function (it, i) {
      var e = pt(i, R), l = pt(i, R + 18);
      var anchor = Math.abs(l[0]) < 8 ? "middle" : (l[0] > 0 ? "start" : "end");
      svg += '<line class="radar__axis" x1="0" y1="0" x2="' + e[0] + '" y2="' + e[1] + '"/>';
      svg += '<text class="radar__label" x="' + l[0] + '" y="' + (l[1] + 4) + '" text-anchor="' + anchor + '">' + it.label + "</text>";
    });
    svg += '<g class="radar__shape"><polygon class="radar__area" points="' + poly(function (i) { return R * items[i].v / 100; }) + '"/>';
    items.forEach(function (it, i) {
      var p = pt(i, R * it.v / 100);
      svg += '<circle class="radar__dot" cx="' + p[0] + '" cy="' + p[1] + '" r="5" data-tip="' + it.label + ": " + it.v + '"><title>' + it.label + ": " + it.v + "</title></circle>";
    });
    svg += "</g></svg>";
    box.innerHTML = svg + '<div class="radar__tip" hidden></div>';
    var tip = box.querySelector(".radar__tip");
    box.addEventListener("pointerover", function (e) {
      var d = e.target.closest(".radar__dot"); if (!d) return;
      var r = d.getBoundingClientRect(), b = box.getBoundingClientRect();
      tip.textContent = d.dataset.tip; tip.hidden = false;
      tip.style.left = (r.left - b.left + r.width / 2) + "px"; tip.style.top = (r.top - b.top - 8) + "px";
    });
    box.addEventListener("pointerout", function (e) { if (e.target.closest(".radar__dot")) tip.hidden = true; });
    var grow = function () { box.classList.add("is-in"); };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { grow(); return; }
    var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { grow(); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(box);
  });

  // Filter chips for the badge wall
  var buttons = document.querySelectorAll(".cert-filter");
  var badges = document.querySelectorAll(".cert-wall .cert-badge");
  var count = document.getElementById("cert-count");
  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.dataset.filter;
      buttons.forEach(function (b) { b.classList.toggle("is-active", b === btn); });
      var shown = 0;
      badges.forEach(function (badge) {
        var match = f === "all" || badge.dataset.issuer === f;
        badge.hidden = !match;
        if (match) shown++;
      });
      if (count) count.textContent = shown;
    });
  });
});
