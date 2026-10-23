// Content tabs: each tab set on a page gets its own gradient for the sliding pill (tg-0 .. tg-4 in extra.css).
// The first colour comes from the page address, so a page always looks the same but differs from other pages.
document$.subscribe(function () {
  var path = location.pathname, h = 0;
  for (var i = 0; i < path.length; i++) h = (h * 31 + path.charCodeAt(i)) >>> 0;
  var start = h % 5;
  document.querySelectorAll(".md-typeset .tabbed-set").forEach(function (set, i) {
    set.classList.remove("tg-0", "tg-1", "tg-2", "tg-3", "tg-4");
    set.classList.add("tg-" + ((start + i) % 5));
  });
});
