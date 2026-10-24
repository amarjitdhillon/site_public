// Keyboard shortcuts, GitHub / Linear style. "?" opens a sheet listing them.
// P presents a diagram (diagram.js), / searches (Material), T switches theme (with the circle), J / K move to the
// next / previous page in this section's menu, H goes home. Ignored while typing in a field or with modifier keys.
(function () {
  var KEYS = [
    ["?", "Show or hide this list"],
    ["P", "Present the diagram on screen (diagram pages)"],
    ["T", "Switch light / dark"],
    ["/", "Search the site"],
    ["J", "Next page in this section"],
    ["K", "Previous page in this section"],
    ["H", "Home"],
    ["Esc", "Close whatever is open"]
  ];
  var sheet;

  function siblings() {
    var links = Array.from(document.querySelectorAll(
      ".md-sidebar--primary .md-nav--primary > .md-nav__list > .md-nav__item--active a.md-nav__link[href]"))
      .filter(function (a) { var u = new URL(a.href); return u.origin === location.origin && !u.hash; }); // pages, not headings
    var seen = {}, out = [];
    links.forEach(function (a) { var p = new URL(a.href).pathname; if (!seen[p]) { seen[p] = 1; out.push(a); } });
    return out;
  }
  function step(d) {
    var list = siblings(), here = location.pathname;
    var i = list.findIndex(function (a) { return new URL(a.href).pathname === here; });
    var next = list[i + d];
    if (i > -1 && next) next.click(); // Material's instant navigation picks the click up
  }
  function toggleSheet() {
    if (sheet && sheet.isConnected) { close(); return; }
    sheet = document.createElement("div");
    sheet.className = "keys";
    sheet.setAttribute("role", "dialog"); sheet.setAttribute("aria-label", "Keyboard shortcuts");
    sheet.innerHTML = '<div class="keys__card"><div class="keys__head"><b>Keyboard shortcuts ⌨️</b>' +
      '<button type="button" class="keys__x" aria-label="Close">✕</button></div><ul></ul>' +
      '<p class="keys__foot">Press <kbd>?</kbd> anytime to see this again</p></div>';
    var ul = sheet.querySelector("ul");
    KEYS.forEach(function (k) {
      var li = document.createElement("li");
      li.innerHTML = "<kbd></kbd><span></span>";
      li.firstChild.textContent = k[0]; li.lastChild.textContent = k[1];
      ul.appendChild(li);
    });
    sheet.addEventListener("click", function (e) { if (e.target === sheet || e.target.closest(".keys__x")) close(); });
    document.body.appendChild(sheet);
    requestAnimationFrame(function () { sheet.classList.add("is-in"); });
  }
  function close() {
    if (!sheet) return;
    var s = sheet; sheet = null;
    s.classList.remove("is-in");
    setTimeout(function () { s.remove(); }, 400);
  }

  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName))) return;
    if (document.querySelector(".presenter")) return; // presenter mode has its own keys
    var k = e.key;
    if (k === "?") { e.preventDefault(); toggleSheet(); return; }
    if (k === "Escape") { close(); return; }
    if (k === "t" || k === "T") {
      var lab = document.querySelector('form[data-md-component="palette"] label:not([hidden])');
      if (lab) { e.preventDefault(); lab.click(); close(); }
      return;
    }
    if (k === "j" || k === "J") { e.preventDefault(); close(); step(1); return; }
    if (k === "k" || k === "K") { e.preventDefault(); close(); step(-1); return; }
    if (k === "h" || k === "H") {
      var home = document.querySelector(".md-header__button.md-logo, a.md-logo");
      if (home) { e.preventDefault(); close(); home.click(); }
    }
  });
})();
