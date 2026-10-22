// Homepage hero cosmos: a living night sky behind the hero text, drawn on one canvas.
//  - a near-black night sky whose faint tint slowly cycles (violet, teal, magenta) over about a minute
//  - the Milky Way runs across the right side; soft nebulae drift and a small spiral galaxy turns
//  - three star layers drift at different speeds (depth) and twinkle; the mouse tilts them a little
//  - a shooting star every few seconds
// Pauses when the hero is off screen or the tab is hidden. Reduced motion gets one still frame.
document$.subscribe(function () {
  var hero = document.querySelector(".hero");
  if (!hero || hero.dataset.cosmos) return;
  hero.dataset.cosmos = "1";

  var canvas = document.createElement("canvas");
  canvas.className = "hero__cosmos";
  canvas.setAttribute("aria-hidden", "true");
  hero.insertBefore(canvas, hero.firstChild);
  var ctx = canvas.getContext("2d");
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // sky palettes: [top-left, bottom-right]
  var SKIES = [ // near-black night skies, each with only a hint of color
    [[5, 5, 12], [12, 8, 24]],    // ink
    [[8, 5, 16], [20, 8, 30]],    // violet hint
    [[3, 9, 14], [8, 14, 26]],    // teal hint
    [[10, 5, 14], [24, 6, 22]],   // magenta hint
  ];
  var SKY_CYCLE = 60000; // ms for the full loop
  var NEBULAE = [
    { x: .14, y: .05, r: .55, c: [91, 91, 247], a: .26, sx: .00007, sy: .00005, p: 0 },
    { x: .95, y: .95, r: .5, c: [214, 40, 110], a: .24, sx: .00006, sy: .00008, p: 2 },
    { x: .62, y: .35, r: .38, c: [60, 200, 230], a: .1, sx: .00009, sy: .00006, p: 4 },
    { x: .35, y: .9, r: .35, c: [150, 70, 240], a: .12, sx: .00005, sy: .0001, p: 1 },
  ];
  var LAYERS = [ // density per 10k px, size, drift px/s, parallax px
    { n: 10, r: [.3, .8], v: 3, par: 4 },
    { n: 3, r: [.6, 1.2], v: 7, par: 10 },
    { n: 1, r: [1.1, 1.9], v: 14, par: 20 },
  ];

  var W = 0, H = 0, dpr = 1, stars = [], galaxy = null, milky = null, shooters = [], nextShot = 0;
  var mx = 0, my = 0, tmx = 0, tmy = 0;

  function rand(a, b) { return a + Math.random() * (b - a) }
  function mix(a, b, t) { return [0, 1, 2].map(function (i) { return Math.round(a[i] + (b[i] - a[i]) * t) }) }
  function rgb(c, a) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")" }

  function makeGalaxy(size) {
    var g = document.createElement("canvas");
    g.width = g.height = size;
    var c = g.getContext("2d"), R = size / 2;
    var core = c.createRadialGradient(R, R, 0, R, R, R * .35);
    core.addColorStop(0, "rgba(255,240,220,.9)");
    core.addColorStop(.4, "rgba(255,180,220,.35)");
    core.addColorStop(1, "rgba(255,180,220,0)");
    c.fillStyle = core;
    c.fillRect(0, 0, size, size);
    // two spiral arms of tiny dots
    for (var arm = 0; arm < 2; arm++) {
      for (var i = 0; i < 520; i++) {
        var t = i / 520, ang = arm * Math.PI + t * 3.4 * Math.PI, rad = t * R * .95;
        var x = R + Math.cos(ang) * rad + rand(-1, 1) * R * .09 * (1 - t * .4);
        var y = R + Math.sin(ang) * rad * .55 + rand(-1, 1) * R * .06 * (1 - t * .4);
        c.fillStyle = rgb(t < .5 ? [255, 220, 240] : [170, 200, 255], (1 - t) * .7);
        c.fillRect(x, y, 1.2, 1.2);
      }
    }
    return g;
  }

  // the Milky Way: a soft dusty band of glow, dark dust lanes and thousands of faint stars,
  // running diagonally across the right side so the text on the left stays clear
  function gauss() { return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5 }
  function makeMilkyWay() {
    var m = document.createElement("canvas");
    m.width = Math.round(W * dpr); m.height = Math.round(H * dpr);
    var c = m.getContext("2d");
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    var x0 = W * .45, y0 = H * 1.15, x1 = W * 1.05, y1 = -H * .15;
    var dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
    var spread = Math.min(W, H) * .16;
    var at = function (t, off) { return [x0 + dx * t + nx * off, y0 + dy * t + ny * off] };
    for (var i = 0; i < 900; i++) { // glow clouds
      var t = Math.random(), p = at(t, gauss() * spread), r = rand(18, 70);
      var g = c.createRadialGradient(p[0], p[1], 0, p[0], p[1], r);
      var col = Math.random() < .5 ? [205, 195, 255] : [255, 205, 230];
      g.addColorStop(0, rgb(col, .035)); g.addColorStop(1, rgb(col, 0));
      c.fillStyle = g; c.fillRect(p[0] - r, p[1] - r, r * 2, r * 2);
    }
    c.globalCompositeOperation = "destination-out";
    for (i = 0; i < 160; i++) { // dark dust lanes along the core
      t = Math.random(); p = at(t, gauss() * spread * .35 + Math.sin(t * 9) * spread * .2); r = rand(10, 34);
      g = c.createRadialGradient(p[0], p[1], 0, p[0], p[1], r);
      g.addColorStop(0, "rgba(0,0,0,.18)"); g.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = g; c.fillRect(p[0] - r, p[1] - r, r * 2, r * 2);
    }
    c.globalCompositeOperation = "source-over";
    var n = Math.round(W * H / 10000 * 14);
    for (i = 0; i < n; i++) { // dense faint stars in the band
      t = Math.random(); p = at(t, gauss() * spread * .8);
      c.fillStyle = rgb(Math.random() < .2 ? [255, 225, 200] : [235, 235, 255], rand(.15, .7));
      c.fillRect(p[0], p[1], rand(.4, 1.1), rand(.4, 1.1));
    }
    return m;
  }

  function build() {
    var r = hero.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = [];
    LAYERS.forEach(function (L, li) {
      var n = Math.round(W * H / 10000 * L.n);
      for (var i = 0; i < n; i++) {
        stars.push({
          l: li, x: Math.random() * W, y: Math.random() * H, r: rand(L.r[0], L.r[1]),
          a: rand(.35, 1), tw: rand(.6, 2.2), ph: Math.random() * 6.28,
          c: Math.random() < .15 ? [255, 214, 150] : Math.random() < .2 ? [170, 220, 255] : [255, 255, 255],
        });
      }
    });
    galaxy = makeGalaxy(Math.round(Math.min(260, W * .26) * dpr));
    milky = makeMilkyWay();
  }

  function draw(now, dt) {
    // sky
    var k = (now % SKY_CYCLE) / SKY_CYCLE * SKIES.length, i = Math.floor(k), f = k - i;
    f = f * f * (3 - 2 * f); // smooth hand-off between palettes
    var a = SKIES[i], b = SKIES[(i + 1) % SKIES.length];
    var sky = ctx.createLinearGradient(0, 0, W, H);
    sky.addColorStop(0, rgb(mix(a[0], b[0], f), 1));
    sky.addColorStop(1, rgb(mix(a[1], b[1], f), 1));
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Milky Way
    ctx.globalAlpha = .85 + Math.sin(now * .0004) * .1;
    ctx.drawImage(milky, -mx * 3, -my * 3, W, H);
    ctx.globalAlpha = 1;

    // nebulae: drifting, breathing glows
    ctx.globalCompositeOperation = "lighter";
    NEBULAE.forEach(function (n) {
      var x = (n.x + Math.sin(now * n.sx + n.p) * .08) * W;
      var y = (n.y + Math.cos(now * n.sy + n.p) * .1) * H;
      var rad = n.r * Math.max(W, H) * (1 + Math.sin(now * .0003 + n.p) * .08);
      var g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, rgb(n.c, n.a));
      g.addColorStop(.5, rgb(n.c, n.a * .35));
      g.addColorStop(1, rgb(n.c, 0));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    });

    // spiral galaxy, slowly turning
    var gs = galaxy.width / dpr;
    ctx.save();
    ctx.translate(W * .95 - mx * 6, H * .12 - my * 6); // top-right corner, clear of Shiva
    ctx.rotate(now * .00004);
    ctx.globalAlpha = .75;
    ctx.drawImage(galaxy, -gs / 2, -gs / 2, gs, gs);
    ctx.restore();
    ctx.globalAlpha = 1;

    // stars
    stars.forEach(function (s) {
      var L = LAYERS[s.l];
      if (dt) { s.x -= L.v * dt; if (s.x < -4) { s.x = W + 4; s.y = Math.random() * H } }
      var tw = still ? s.a : s.a * (.55 + .45 * Math.sin(now * .001 * s.tw + s.ph));
      var x = s.x - mx * L.par, y = s.y - my * L.par;
      ctx.fillStyle = rgb(s.c, tw);
      ctx.beginPath();
      ctx.arc(x, y, s.r, 0, 6.283);
      ctx.fill();
      if (s.l === 2 && tw > .8) { // a little cross flare on the brightest near stars
        ctx.fillStyle = rgb(s.c, (tw - .8) * 1.5);
        ctx.fillRect(x - s.r * 3, y - .3, s.r * 6, .6);
        ctx.fillRect(x - .3, y - s.r * 3, .6, s.r * 6);
      }
    });

    // shooting stars
    if (!still && now > nextShot) {
      shooters.push({ x: rand(W * .3, W * 1.05), y: rand(-20, H * .35), vx: -rand(520, 760), vy: rand(200, 300), life: 0, max: rand(.7, 1.1) });
      nextShot = now + rand(2800, 6500);
    }
    shooters = shooters.filter(function (m) {
      m.life += dt; m.x += m.vx * dt; m.y += m.vy * dt;
      var fade = Math.sin(Math.min(m.life / m.max, 1) * Math.PI);
      var tx = m.x - m.vx * .12, ty = m.y - m.vy * .12;
      var g = ctx.createLinearGradient(m.x, m.y, tx, ty);
      g.addColorStop(0, "rgba(255,255,255," + fade + ")");
      g.addColorStop(1, "rgba(255,209,102,0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tx, ty); ctx.stroke();
      return m.life < m.max;
    });

    // keep the text side readable
    ctx.globalCompositeOperation = "source-over";
    var shade = ctx.createLinearGradient(0, 0, W * .65, 0);
    shade.addColorStop(0, "rgba(6,8,28,.42)");
    shade.addColorStop(1, "rgba(6,8,28,0)");
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, W, H);
  }

  var last = 0, running = false, visible = true, raf = null;
  function loop(now) {
    if (!canvas.isConnected) { running = false; return } // left the homepage
    var dt = last ? Math.min((now - last) / 1000, .05) : 0;
    last = now;
    mx += (tmx - mx) * .04; my += (tmy - my) * .04; // eased parallax
    draw(now, dt);
    raf = requestAnimationFrame(loop);
  }
  function start() { if (!running && !still && visible && !document.hidden) { running = true; last = 0; raf = requestAnimationFrame(loop) } }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = null }

  build();
  draw(performance.now(), 0);
  if (still) return;

  new IntersectionObserver(function (e) { visible = e[0].isIntersecting; visible ? start() : stop() }).observe(hero);
  document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start() });
  new ResizeObserver(function () { build(); if (!running) draw(performance.now(), 0) }).observe(hero);
  hero.addEventListener("pointermove", function (e) {
    var r = hero.getBoundingClientRect();
    tmx = (e.clientX - r.left) / r.width - .5;
    tmy = (e.clientY - r.top) / r.height - .5;
  });
  hero.addEventListener("pointerleave", function () { tmx = tmy = 0 });
  start();
});
