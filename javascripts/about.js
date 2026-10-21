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
        var p = Math.min((t - start) / 1200, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
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
