// Typing effect, site-wide: any [data-words="a|b|c"] types a phrase, pauses, deletes it and types the next (loops):
// the homepage hero, blog post covers, the blog heading and section landing pages.
// [data-type-once] types its own text a single time and stays (the section pill on diagram pages).
document$.subscribe(function () {
  (window.__typeTimers || []).forEach(clearTimeout);
  var timers = window.__typeTimers = [];
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.querySelectorAll("[data-words]").forEach(function (el, n) {
    var words = el.dataset.words.split("|"), w = 0, i = words[0].length, deleting = true;
    el.textContent = words[0];
    var tick = function () {
      if (deleting) {
        i--;
        el.textContent = words[w].slice(0, i);
        if (i === 0) { deleting = false; w = (w + 1) % words.length; timers.push(setTimeout(tick, 300)); return; }
        timers.push(setTimeout(tick, 45));
      } else {
        i++;
        el.textContent = words[w].slice(0, i);
        if (i === words[w].length) { deleting = true; timers.push(setTimeout(tick, 2200)); return; }
        timers.push(setTimeout(tick, 85));
      }
    };
    timers.push(setTimeout(tick, 2200 + n * 700)); // show the first phrase for a moment; several on a page stay out of step
  });

  document.querySelectorAll("[data-type-once]").forEach(function (el) {
    var text = el.textContent, i = 0;
    el.textContent = "";
    el.classList.add("is-typing");
    var tick = function () {
      el.textContent = text.slice(0, ++i);
      if (i < text.length) timers.push(setTimeout(tick, 55));
      else timers.push(setTimeout(function () { el.classList.remove("is-typing"); }, 1600));
    };
    timers.push(setTimeout(tick, 500));
  });
});
