// Little winks.
// 1) Leave the tab and its title becomes "👽 Come back, Alien..." with a UFO icon; come back to "👋 Welcome back!"
//    for a moment, then the real title and planet icon return.
// 2) A note for developers in the browser console (once per visit): the planet in text and where to find Amar.
(function () {
  var saved = null, back;
  var ufo = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🛸</text></svg>');
  function icon() { return document.querySelector('link[rel~="icon"]'); }

  document.addEventListener("visibilitychange", function () {
    var link = icon();
    if (document.hidden) {
      clearTimeout(back);
      if (!saved) saved = { title: document.title, icon: link ? link.href : null };
      document.title = "👽 Come back, Alien...";
      if (link) link.href = ufo;
    } else if (saved) {
      var s = saved; saved = null;
      if (link && s.icon) link.href = s.icon;
      document.title = "👋 Welcome back!";
      back = setTimeout(function () { document.title = s.title; }, 1600);
    }
  });

  try {
    if (sessionStorage.getItem("ts-hello")) return;
    sessionStorage.setItem("ts-hello", "1");
  } catch (e) {}
  var planet = [
    "        .  *        .       *",
    "   *        _____        .",
    "        .-'`     `'-.    *      Amar's TechSpace",
    "   .   /    .--.     \\  ===--- ",
    "  ====|----(    )----|====      Hey, fellow builder 👋",
    "       \\    '--'     /   .",
    "  *     '-._______.-'        *",
    "     .        *       .      "
  ].join("\n");
  console.log("%c" + planet, "color:#ff7eb6;font-family:monospace;font-size:12px;line-height:1.35");
  console.log("%cPoking around the code? Respect. 🛠️", "color:#ffd166;font-weight:700;font-size:14px");
  console.log("%cThis site is MkDocs Material plus a pile of hand-made touches. If you like building GenAI and agentic systems too, let's talk:" +
    "\n  👉 https://www.linkedin.com/in/amaardhillon/\n  👉 https://www.amarjitdhillon.com/about/about/", "color:#a5b4fc;font-size:12px;line-height:1.6");
})();
