// Time-aware greeting: the homepage hero and the About card greet the visitor by their own clock,
// and the homepage pill asks a friendly question for that time of day (a different one each visit).
// On the homepage it then looks up the visitor's city (GeoJS, from their IP) and the weather there (Open-Meteo),
// both free with no key, and turns the question into "How's Paris this evening? 12°C and clear ✨".
// Amar chose this knowingly (Oct 2026): the visitor's IP goes to those two services. Cached 30 min in
// sessionStorage, 3s timeout, and any failure (VPN, blocker, offline) just keeps the plain question.
// The static text stays for search engines and when scripts are off.
document$.subscribe(function () {
  var h = new Date().getHours();
  var slot = h >= 5 && h < 12 ? "morning" : h >= 12 && h < 17 ? "afternoon" : h >= 17 && h < 22 ? "evening" : "late";
  var GREET = {
    morning: "Good morning, Alien ☀️", afternoon: "Good afternoon, Alien 🌤️",
    evening: "Good evening, Alien 🌙", late: "Up late, Alien? 🦉"
  };
  var ASK = {
    morning: ["Coffee first, architecture next? ☕", "Ready to build something today? 🛠️", "Early start, huh? 🌅"],
    afternoon: ["How's your day going? 😄", "Need a quick break with some diagrams? 🖼️", "Lunch done, brain on? 🧠"],
    evening: ["How was your day? 🌆", "Winding down with some reading? 📖", "Still thinking about work? 😅"],
    late: ["Debugging something at this hour? 🐞", "Can't sleep either? 😴", "Night owl mode on? 🌌"]
  };
  document.documentElement.classList.toggle("is-night", h >= 19 || h < 6);
  var home = document.querySelector(".hero-greet");
  if (home) home.textContent = GREET[slot];
  var pill = document.querySelector(".hero__pill");
  if (pill && home) { var q = ASK[slot]; pill.textContent = q[Math.floor(Math.random() * q.length)]; }
  var about = document.querySelector(".about-hero__hi");
  if (about) about.textContent = GREET[slot] + " I'm";
  if (pill && home) localGreeting(pill, slot);
});

var WHEN = { morning: "this morning", afternoon: "this afternoon", evening: "this evening", late: "tonight" };
function sky(code, day) { // WMO weather codes, in plain words
  if (code === 0) return day ? ["sunny", "☀️"] : ["clear", "✨"];
  if (code <= 2) return day ? ["partly cloudy", "⛅"] : ["a few clouds", "☁️"];
  if (code === 3) return ["cloudy", "☁️"];
  if (code <= 48) return ["foggy", "🌫️"];
  if (code <= 67 || (code >= 80 && code <= 82)) return ["rainy", "🌧️"];
  if (code <= 77 || code === 85 || code === 86) return ["snowy", "❄️"];
  return ["stormy", "⛈️"];
}
function nudge(temp, word, f) {
  var c = f ? (temp - 32) * 5 / 9 : temp;
  if (word === "rainy") return " Stay dry ☔";
  if (word === "snowy" || c <= -5) return " Bundle up 🧣";
  if (c >= 28) return " Stay cool 😎";
  return "";
}
function getJSON(url) {
  var ctl = window.AbortController ? new AbortController() : null;
  if (ctl) setTimeout(function () { ctl.abort(); }, 3000);
  return fetch(url, ctl ? { signal: ctl.signal } : {}).then(function (r) { if (!r.ok) throw r.status; return r.json(); });
}
function localGreeting(pill, slot) {
  var KEY = "ts-local", cached = null;
  try { cached = JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch (e) {}
  var show = function (d) {
    if (!d || !d.city || !pill.isConnected) return;
    var w = sky(d.code, d.day), unit = d.f ? "°F" : "°C";
    pill.textContent = "How's " + d.city + " " + WHEN[slot] + "? " + Math.round(d.temp) + unit + " and " + w[0] + " " + w[1] + nudge(d.temp, w[0], d.f);
    pill.classList.add("is-local");
  };
  if (cached && Date.now() - cached.at < 30 * 60 * 1000) { show(cached); return; }
  getJSON("https://get.geojs.io/v1/ip/geo.json").then(function (g) {
    if (!g || !g.city || !g.latitude) throw 0;
    var f = g.country_code === "US" || g.country_code === "LR" || g.country_code === "MM";
    return getJSON("https://api.open-meteo.com/v1/forecast?latitude=" + encodeURIComponent(g.latitude) +
      "&longitude=" + encodeURIComponent(g.longitude) + "&current=temperature_2m,weather_code,is_day" +
      (f ? "&temperature_unit=fahrenheit" : "")).then(function (m) {
      var d = { city: g.city, temp: m.current.temperature_2m, code: m.current.weather_code, day: !!m.current.is_day, f: f, at: Date.now() };
      try { sessionStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {}
      show(d);
    });
  }).catch(function () { /* keep the plain question */ });
}
