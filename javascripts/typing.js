// Homepage hero: types a word, pauses, deletes it, types the next one (loops).
document$.subscribe(function () {
  var el = document.querySelector(".hero-type[data-words]");
  if (window.__typeTimer) { clearTimeout(window.__typeTimer); window.__typeTimer = null; }
  if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var words = el.dataset.words.split("|"), w = 0, i = words[0].length, deleting = true;
  var tick = function () {
    var word = words[w];
    if (deleting) {
      i--;
      el.textContent = word.slice(0, i);
      if (i === 0) { deleting = false; w = (w + 1) % words.length; window.__typeTimer = setTimeout(tick, 300); return; }
      window.__typeTimer = setTimeout(tick, 45);
    } else {
      i++;
      el.textContent = words[w].slice(0, i);
      if (i === words[w].length) { deleting = true; window.__typeTimer = setTimeout(tick, 2200); return; }
      window.__typeTimer = setTimeout(tick, 85);
    }
  };
  window.__typeTimer = setTimeout(tick, 2200); // show the first phrase for a moment before starting
});
