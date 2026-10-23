// Sidebars: "On this page": a gradient marker slides to the section you're reading, in the page's section colour.
document$.subscribe(function () {
  // share the page's section colours (title area pill) with both sidebars
  var sec = document.querySelector(".page-head, .post-hero"), root = document.documentElement.style;
  root.setProperty("--sec1", sec ? sec.style.getPropertyValue("--s1") : "124, 58, 237");
  root.setProperty("--sec2", sec ? sec.style.getPropertyValue("--s2") : "219, 39, 119");
  var list = document.querySelector(".md-sidebar--secondary .md-nav--secondary > .md-nav__list");
  if (!list) return;
  var head = document.querySelector(".page-head");
  if (head) { // borrow the colours of the title area pill
    list.style.setProperty("--t1", head.style.getPropertyValue("--s1"));
    list.style.setProperty("--t2", head.style.getPropertyValue("--s2"));
  }
  list.classList.add("toc-live");
  var marker = document.createElement("span");
  marker.className = "toc-marker";
  marker.setAttribute("aria-hidden", "true");
  list.appendChild(marker);

  function place() {
    var a = list.querySelector(".md-nav__link--active");
    if (!a) { marker.style.opacity = 0; return; }
    var lr = list.getBoundingClientRect(), r = a.getBoundingClientRect();
    marker.style.opacity = 1;
    marker.style.transform = "translateY(" + (r.top - lr.top) + "px)";
    marker.style.height = r.height + "px";
  }
  new MutationObserver(place).observe(list, { subtree: true, attributes: true, attributeFilter: ["class"] });
  place();
});
