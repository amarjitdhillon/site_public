// Read ticks: this browser remembers which notes and posts you've finished (near the end + 20s on the page).
// The left menu ticks them, the page shows a "Read" chip, and section landing pages show a progress ring.
// Stored only in localStorage on this device: no accounts, no tracking, nothing sent anywhere.
(function () {
  var KEY = "ts-read", MIN_MS = 20000;
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } }
  function save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} }
  function norm(path) { return path.replace(/index\.html$/, "").replace(/\/?$/, "/"); }
  function chip(holder, isNew) {
    if (!holder || holder.querySelector(".read-chip")) return;
    var c = document.createElement("span");
    c.className = "read-chip" + (isNew ? " is-new" : "");
    c.textContent = "✓ Read";
    holder.appendChild(c);
  }
  function tickMenu(read) {
    document.querySelectorAll(".md-sidebar--primary a.md-nav__link[href]").forEach(function (a) {
      var u = new URL(a.getAttribute("href"), location.href);
      a.classList.toggle("is-read", u.origin === location.origin && read.indexOf(norm(u.pathname)) > -1 && !u.hash);
    });
  }
  function ring(read) {
    var line = document.querySelector(".landing-line");
    if (!line || document.querySelector(".read-ring")) return;
    var here = norm(location.pathname), seen = {}, total = 0, done = 0;
    // only this section: the menu holds the whole site, the active top-level item is the section you're in
    document.querySelectorAll(".md-sidebar--primary .md-nav--primary > .md-nav__list > .md-nav__item--active a.md-nav__link[href]").forEach(function (a) {
      var u = new URL(a.getAttribute("href"), location.href), p = norm(u.pathname);
      if (u.origin !== location.origin || u.hash || p === here || seen[p]) return;
      seen[p] = 1; total++;
      if (read.indexOf(p) > -1) done++;
    });
    if (total < 2) return;
    var pct = done / total, C = 2 * Math.PI * 16;
    var box = document.createElement("div");
    box.className = "read-ring";
    box.innerHTML = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="16" class="read-ring__track"/>' +
      '<circle cx="20" cy="20" r="16" class="read-ring__fill" style="stroke-dasharray:' + C + ';stroke-dashoffset:' + C + '"/></svg>' +
      '<span><b>' + done + ' of ' + total + ' read</b><small>' +
      (done === 0 ? "Pages you finish get a ✓ in the menu" : done === total ? "You've read the whole section 🎉" : "Ticks show in the menu, saved on this device only") +
      "</small></span>";
    line.insertAdjacentElement("afterend", box);
    requestAnimationFrame(function () { setTimeout(function () {
      box.querySelector(".read-ring__fill").style.strokeDashoffset = C * (1 - pct);
    }, 300); });
  }

  document$.subscribe(function () {
    clearInterval(window.__readTimer);
    var read = load(), here = norm(location.pathname);
    tickMenu(read);
    ring(read);
    var meta = document.querySelector(".page-head__meta, .post-hero__chips");
    if (!meta) return; // only notes pages and blog posts count as "reads"
    if (read.indexOf(here) > -1) { chip(meta, false); return; }
    var start = Date.now(), article = document.querySelector(".md-content__inner");
    window.__readTimer = setInterval(function () {
      if (document.hidden || !article) return;
      var r = article.getBoundingClientRect();
      var nearEnd = r.bottom - innerHeight < r.height * 0.15 || r.bottom < innerHeight * 1.05;
      if (nearEnd && Date.now() - start > MIN_MS) {
        clearInterval(window.__readTimer);
        read = load();
        if (read.indexOf(here) < 0) { read.push(here); save(read); }
        chip(meta, true);
        if (window.tsConfetti) window.tsConfetti(meta.querySelector(".read-chip"));
        tickMenu(read);
      }
    }, 1000);
  });
})();
