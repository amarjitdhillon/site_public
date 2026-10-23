// Blog post sidebar (overrides/blog-post.html): email link, copy link with a "Copied" tick, share links.
document$.subscribe(function () {
  // the address is put together here so it never sits in the page source for scrapers (same as the About page)
  document.querySelectorAll(".js-mail[data-u][data-d]").forEach(function (a) {
    a.href = "mailto:" + a.dataset.u + "@" + a.dataset.d + "?subject=" + encodeURIComponent("Hi Amar, from your TechSpace");
  });

  var url = location.href.split("#")[0], title = document.title.replace(/ - Amar's TechSpace$/, "");
  document.querySelectorAll(".postside .js-share").forEach(function (a) {
    a.href = a.dataset.to === "linkedin"
      ? "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(url)
      : "https://x.com/intent/post?url=" + encodeURIComponent(url) + "&text=" + encodeURIComponent(title);
  });

  document.querySelectorAll(".postside .js-copy-link").forEach(function (btn) {
    var label = btn.querySelector(".postside__copy-label");
    btn.addEventListener("click", function () {
      var done = function () {
        btn.classList.add("is-copied"); label.textContent = "Copied";
        setTimeout(function () { btn.classList.remove("is-copied"); label.textContent = "Copy link"; }, 2200);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, done); else done();
    });
  });
});
