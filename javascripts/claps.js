// 👏 Claps: no-login appreciation. Count lives in DynamoDB behind API Gateway (tools/claps/claps.yaml).
// Each browser can clap up to 10 times per page; claps are batched so a burst of clicks is one request.
document$.subscribe(function () {
  var box = document.querySelector(".claps");
  if (!box) return;
  var api = box.dataset.api;
  var page = new URL(box.dataset.page || location.pathname, location.href).pathname;
  var btn = box.querySelector(".claps__btn"), out = box.querySelector(".claps__count"), text = box.querySelector(".claps__text");
  var KEY = "claps:" + page, MAX = 10;
  var mine = 0;
  try { mine = +localStorage.getItem(KEY) || 0; } catch (e) {}
  var count = 0, pending = 0, timer = null;
  var show = function () {
    out.textContent = count;
    btn.classList.toggle("is-mine", mine > 0);
    if (mine >= MAX) { btn.disabled = true; text.textContent = "Thanks for the claps! 🙌"; }
    else if (mine > 0) { text.textContent = "You clapped " + mine + (mine === 1 ? " time" : " times") + " 🙌"; }
  };
  if (!api) { box.hidden = true; return; }   // backend not configured yet
  fetch(api + "?page=" + encodeURIComponent(page)).then(function (r) { return r.json(); })
    .then(function (d) { count = d.count || 0; show(); box.classList.add("is-ready"); })
    .catch(function () { box.hidden = true; });
  var flush = function () {
    var n = pending; pending = 0; timer = null;
    if (!n) return;
    fetch(api, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ page: page, n: n }) })
      .then(function (r) { return r.json(); }).then(function (d) { if (d.count) { count = d.count; show(); } })
      .catch(function () {});
  };
  btn.addEventListener("click", function () {
    if (mine >= MAX) return;
    mine++; count++; pending++;
    try { localStorage.setItem(KEY, mine); } catch (e) {}
    show();
    // little pop and a floating +1
    btn.classList.remove("pop"); void btn.offsetWidth; btn.classList.add("pop");
    var plus = document.createElement("span"); plus.className = "claps__plus"; plus.textContent = "+1";
    btn.appendChild(plus); setTimeout(function () { plus.remove(); }, 900);
    clearTimeout(timer); timer = setTimeout(flush, 700);
  });
  addEventListener("pagehide", flush);
});
