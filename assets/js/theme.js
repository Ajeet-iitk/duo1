/* Bhasha — day/night theme (smooth), animated glyph background, living favicon */
(function (root) {
  'use strict';
  var KEY = 'bhasha.theme', mode = 'auto', cvs, g, parts = [], W = 0, H = 0, mx = -999, my = -999, raf = 0;
  var reduced = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var GLYPHS = ('அஆஇஈஉஊஎஏஐஒஓகசதநபமயரலவ' + 'అఆఇఈఉఊఎఏఒఓకచతనపమయరలవ' + 'અઆઇઈઉઊએઐઓઔકખગચતનપમયરલવ' + 'अआकमनहॐ').split('');

  function sys() { return root.matchMedia && root.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
  function eff() { return mode === 'auto' ? sys() : mode; }

  function favicon(t) {
    var bg = t === 'dark' ? '%23182233' : '%2358CC02', fg = t === 'dark' ? '%23FFC800' : '%23ffffff';
    var tx = t === 'dark' ? '%23182233' : '%2346a302';
    var svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='16' fill='" + bg + "'/>" +
      "<path d='M14 18a8 8 0 0 1 8-8h20a8 8 0 0 1 8 8v16a8 8 0 0 1-8 8H30l-10 9v-9a8 8 0 0 1-6-8Z' fill='" + fg + "'/>" +
      "<text x='32' y='36' font-size='22' font-family='sans-serif' font-weight='900' text-anchor='middle' fill='" + tx + "'>अ</text>" +
      "<circle cx='50' cy='50' r='7' fill='%23FF9600'/></svg>";
    var l = document.querySelector('link[rel=icon]');
    if (l) l.href = 'data:image/svg+xml,' + svg;
    var m = document.querySelector('meta[name=theme-color]');
    if (m) m.content = t === 'dark' ? '#0f1724' : '#58CC02';
  }

  function apply(animate) {
    var t = eff(), el = document.documentElement;
    if (animate) { el.classList.add('theme-fade'); setTimeout(function () { el.classList.remove('theme-fade'); }, 700); }
    el.setAttribute('data-theme', t);
    favicon(t);
    paintToggle();
  }
  function set(m) {
    mode = m;
    try { localStorage.setItem(KEY, m); } catch (e) {}
    apply(true);
    if (root.TLSfx) root.TLSfx.play(eff() === 'dark' ? 'whoosh' : 'chest');
  }
  function toggle() { set(eff() === 'dark' ? 'light' : 'dark'); }

  function paintToggle() {
    var b = document.getElementById('theme-btn');
    if (!b) return;
    var d = eff() === 'dark';
    if (!b.firstChild) b.innerHTML = '<span class="tg-track"><span class="tg-sun">☀️</span><span class="tg-moon">🌙</span><span class="tg-knob"></span></span>';
    b.classList.toggle('night', d);
    b.setAttribute('aria-label', d ? 'Switch to day mode' : 'Switch to night mode');
    b.title = d ? 'Day mode' : 'Night mode';
  }

  /* ----- background glyph field ----- */
  function size() { W = cvs.width = root.innerWidth; H = cvs.height = root.innerHeight; }
  function mk(any) {
    return { x: Math.random() * W, y: any ? Math.random() * H : H + 40, s: 16 + Math.random() * 40, c: GLYPHS[Math.random() * GLYPHS.length | 0],
      v: 0.12 + Math.random() * 0.35, p: Math.random() * 6.28, hue: [100, 200, 280, 40, 340][Math.random() * 5 | 0] };
  }
  function seed() {
    var n = Math.min(60, Math.round(W * H / 26000)); parts = [];
    for (var i = 0; i < n; i++) parts.push(mk(true));
  }
  function frame(t) {
    g.clearRect(0, 0, W, H);
    var night = eff() === 'dark';
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.y -= p.v; p.p += 0.01; p.x += Math.sin(p.p) * 0.25;
      var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
      if (d2 < 14000) { var f = (14000 - d2) / 14000; p.x += dx / 18 * f; p.y += dy / 18 * f; }
      if (p.y < -50) { parts[i] = mk(false); continue; }
      var a = night ? 0.12 + 0.1 * Math.sin(t / 700 + p.p * 3) : 0.10;
      g.save(); g.translate(p.x, p.y); g.rotate(Math.sin(p.p) * 0.25);
      g.font = '900 ' + p.s + 'px Nunito, "Noto Sans Tamil", "Noto Sans Telugu", "Noto Sans Gujarati", sans-serif';
      g.fillStyle = night ? 'hsla(' + p.hue + ',90%,75%,' + a + ')' : 'hsla(' + p.hue + ',65%,50%,' + a + ')';
      if (night) { g.shadowColor = 'hsla(' + p.hue + ',100%,70%,.6)'; g.shadowBlur = 14; }
      g.fillText(p.c, 0, 0); g.restore();
    }
    raf = root.requestAnimationFrame(frame);
  }
  function startBg() {
    if (reduced) return;
    cvs = document.createElement('canvas'); cvs.id = 'bgfield';
    document.body.insertBefore(cvs, document.body.firstChild);
    g = cvs.getContext('2d'); size(); seed();
    root.addEventListener('resize', function () { size(); seed(); });
    root.addEventListener('pointermove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) root.cancelAnimationFrame(raf); else raf = root.requestAnimationFrame(frame);
    });
    raf = root.requestAnimationFrame(frame);
  }

  function init() {
    apply(false);
    if (root.matchMedia) {
      var mq = root.matchMedia('(prefers-color-scheme: dark)');
      if (mq.addEventListener) mq.addEventListener('change', function () { if (mode === 'auto') apply(true); });
    }
    startBg();
  }
  root.TLTheme = { init: init, toggle: toggle, set: set, mode: function () { return mode; }, eff: eff, paint: paintToggle };
  /* Apply the theme before first paint so there is no flash. */
  try { mode = localStorage.getItem(KEY) || 'auto'; } catch (e) {}
  var q = /[?&]theme=(dark|light)/.exec(location.search); if (q) mode = q[1];
  document.documentElement.setAttribute('data-theme', eff());
})(window);
