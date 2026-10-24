// Morphing transitions: click a blog card or a "Keep exploring" card and its pieces fly into place on the new page
// (cover into the post hero, pill into pill, title into title, icon into icon), App Store style.
// Uses the browser's View Transitions around Material's instant navigation; plain navigation where it isn't supported.
(function () {
  if (!document.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var done = null, bypass = false;

  function clearNames() {
    document.querySelectorAll("[data-vt]").forEach(function (el) { el.style.viewTransitionName = ""; el.removeAttribute("data-vt"); });
  }
  function name(el, n) { if (el) { el.style.viewTransitionName = n; el.setAttribute("data-vt", ""); } }
  function visible(card, sels) {
    for (var i = 0; i < sels.length; i++) {
      var el = card.querySelector(sels[i]);
      if (el && el.getBoundingClientRect().width > 2) return el;
    }
    return null;
  }

  document.addEventListener("click", function (e) {
    if (bypass) return; // our own replayed click, let Material navigate
    var card = e.target.closest && e.target.closest("a.post-card, a.rn-card");
    if (!card || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (card.origin !== location.origin || card.target === "_blank") return;
    clearNames(); // the current page's own hero / title must not share a name with the card
    name(card.querySelector(".post-card__cover"), "vt-cover"); // notes pages have no cover to land on, so "Keep exploring" covers just fade
    name(card.querySelector(".post-card__kicker, .rn-card__pill"), "vt-pill");
    name(visible(card, [".post-card__cover-title", ".post-card__title", ".rn-card__title"]), "vt-title");
    name(card.querySelector(".post-card__icon, .rn-card__icon"), "vt-icon");
    // hold the click: the old page is captured first, then Material's instant navigation runs inside the transition
    e.preventDefault(); e.stopPropagation();
    var root = document.documentElement;
    root.classList.add("vt-nav");
    var t = document.startViewTransition(function () {
      return new Promise(function (resolve) {
        done = resolve;
        setTimeout(resolve, 3000); // never hang on a slow page
        bypass = true; card.click(); bypass = false;
      });
    });
    t.finished.finally(function () { root.classList.remove("vt-nav"); clearNames(); });
  }, true);

  // the new page names its matching pieces, then the transition is allowed to run
  document$.subscribe(function () {
    if (!done) return;
    var hero = document.querySelector(".post-hero"), head = document.querySelector(".page-head");
    if (hero) {
      name(hero, "vt-cover");
      name(hero.querySelector(".post-card__kicker"), "vt-pill");
      name(hero.querySelector("h1"), "vt-title");
      name(hero.querySelector(".post-hero__icon"), "vt-icon");
    } else if (head) {
      name(head.querySelector(".page-head__pill"), "vt-pill");
      name(head.querySelector("h1"), "vt-title");
      name(head.querySelector("h1 .twemoji"), "vt-icon");
    }
    var resolve = done; done = null;
    setTimeout(resolve, 30); // not requestAnimationFrame: frames are paused while the transition waits for the new page
  });
})();
