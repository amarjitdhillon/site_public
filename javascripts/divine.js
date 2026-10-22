// Homepage sky: Lord Shiva (with Nirvana Shatakam verse 1 flowing line by line), then the Trishul drawn in light, then Om,
// each appearing for a while and fading away, looping gently like the UFO.
// Waits while the tab is hidden; reduced motion just shows Shiva, still.
(function () {
  var SCENES = [
    { sel: [".hero__shiva", ".hero__shloka"], hold: 19000, lines: ".hero__shloka .ln" },
    { sel: [".hero__trishul"], hold: 9000 },
    { sel: [".hero__om"], hold: 7000 },
  ];
  var FADE = 3200, GAP = 4500, FIRST = 1500, LINE = 4500;
  var run = 0; // bumps on every homepage visit, so an old loop stops itself

  function wait(ms, id) {
    return new Promise(function (resolve) {
      (function tick(left) {
        if (id !== run) return; // left the page or restarted
        if (document.hidden) return setTimeout(function () { tick(left) }, 500); // pause while the tab is hidden
        if (left <= 0) return resolve();
        setTimeout(function () { tick(left - 250) }, Math.min(250, left));
      })(ms);
    });
  }

  function els(scene, hero) {
    return scene.sel.map(function (s) { return hero.querySelector(s) }).filter(Boolean);
  }

  document$.subscribe(function () {
    var hero = document.querySelector(".hero");
    var id = ++run;
    if (!hero || !hero.querySelector(".divine")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els(SCENES[0], hero).forEach(function (e) { e.classList.add("on") });
      var last = hero.querySelector(".hero__shloka .ln:last-of-type"), en0 = hero.querySelector(".hero__shloka-en");
      if (last) { last.classList.add("on"); if (en0) en0.textContent = last.dataset.en; }
      return;
    }
    (async function loop() {
      await wait(FIRST, id);
      for (var i = 0; id === run && hero.isConnected; i = (i + 1) % SCENES.length) {
        var on = els(SCENES[i], hero);
        on.forEach(function (e) { e.classList.add("on") });
        if (SCENES[i].lines) {
          // the verse: each line fades in, rests, and hands over to the next; the hover meaning follows along
          var lines = hero.querySelectorAll(SCENES[i].lines), en = hero.querySelector(".hero__shloka-en");
          await wait(1200, id);
          for (var k = 0; k < lines.length && id === run; k++) {
            lines.forEach(function (l) { l.classList.remove("on") });
            lines[k].classList.add("on");
            if (en) en.textContent = lines[k].dataset.en;
            await wait(LINE, id);
          }
          await wait(Math.max(0, FADE + SCENES[i].hold - 1200 - LINE * lines.length), id);
          lines.forEach(function (l) { l.classList.remove("on") });
        } else {
          await wait(FADE + SCENES[i].hold, id);
        }
        on.forEach(function (e) { e.classList.remove("on") });
        await wait(FADE + GAP, id);
      }
    })();
  });
})();
