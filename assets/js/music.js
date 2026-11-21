/* Bhasha — generative background music + floating controller.
   No audio files: a tanpura drone, plucked melody and soft percussion are
   synthesised live with Web Audio, in one of four moods. */
(function (root) {
  'use strict';
  var KEY = 'bhasha.music';
  var MOODS = [
    { id: 'dawn', name: 'Raga Dawn', icon: '🌅', root: 146.83, scale: [0, 1, 4, 5, 7, 8, 11, 12, 13], tempo: 2.4, pluck: 'triangle', beat: false },
    { id: 'chai', name: 'Lofi Chai', icon: '☕', root: 130.81, scale: [0, 2, 4, 7, 9, 12, 14, 16], tempo: 0.95, pluck: 'sine', beat: true },
    { id: 'rain', name: 'Monsoon', icon: '🌧️', root: 110, scale: [0, 3, 5, 7, 10, 12, 15], tempo: 3.2, pluck: 'sine', beat: false, rain: true },
    { id: 'zen', name: 'Temple Bells', icon: '🕌', root: 164.81, scale: [0, 2, 4, 7, 9, 12], tempo: 3.8, pluck: 'sine', beat: false, bell: true }
  ];
  var st = { on: false, mood: 0, vol: 0.35, open: false };
  var ctx, master, analyser, delay, timer, drone = [], noiseSrc, step = 0, raf = 0, bars = [];

  function load() { try { var o = JSON.parse(localStorage.getItem(KEY) || '{}'); st.mood = o.mood || 0; st.vol = o.vol == null ? 0.35 : o.vol; st.wasOn = !!o.on; } catch (e) {} }
  function save() { try { localStorage.setItem(KEY, JSON.stringify({ mood: st.mood, vol: st.vol, on: st.on })); } catch (e) {} }
  function M() { return MOODS[st.mood]; }
  function hz(semi) { return M().root * Math.pow(2, semi / 12); }

  function ensure() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    var AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0;
    analyser = ctx.createAnalyser(); analyser.fftSize = 64;
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
    delay = ctx.createDelay(1.5); delay.delayTime.value = 0.42;
    var fb = ctx.createGain(); fb.gain.value = 0.38; delay.connect(fb); fb.connect(delay);
    var wet = ctx.createGain(); wet.gain.value = 0.5; delay.connect(wet); wet.connect(lp);
    master.connect(lp); lp.connect(analyser); analyser.connect(ctx.destination);
    master._in = master;
    return ctx;
  }

  function startDrone() {
    stopDrone();
    var m = M();
    [[0, 0.05], [7, 0.035], [12, 0.03], [-12, 0.05]].forEach(function (p, i) {
      var o = ctx.createOscillator(), g = ctx.createGain(), l = ctx.createOscillator(), lg = ctx.createGain();
      o.type = i === 3 ? 'sine' : 'sawtooth'; o.frequency.value = hz(p[0]) * (i === 1 ? 1.003 : 1);
      var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 520;
      l.frequency.value = 0.07 + i * 0.03; lg.gain.value = p[1] * 0.5; l.connect(lg); lg.connect(g.gain);
      g.gain.value = p[1]; o.connect(f); f.connect(g); g.connect(master);
      o.start(); l.start(); drone.push(o, l);
    });
    if (m.rain) {
      var len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      noiseSrc = ctx.createBufferSource(); noiseSrc.buffer = buf; noiseSrc.loop = true;
      var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3200; bp.Q.value = 0.5;
      var ng = ctx.createGain(); ng.gain.value = 0.06;
      noiseSrc.connect(bp); bp.connect(ng); ng.connect(master); noiseSrc.start();
    }
  }
  function stopDrone() {
    drone.forEach(function (o) { try { o.stop(); } catch (e) {} }); drone = [];
    if (noiseSrc) { try { noiseSrc.stop(); } catch (e) {} noiseSrc = null; }
  }

  function pluck(semi, vel, dur) {
    var t = ctx.currentTime, m = M(), o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = m.pluck; o.frequency.value = hz(semi);
    f.type = 'lowpass'; f.frequency.setValueAtTime(m.bell ? 4000 : 2200, t); f.frequency.exponentialRampToValueAtTime(400, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vel, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f); f.connect(g); g.connect(master); g.connect(delay);
    o.start(t); o.stop(t + dur + 0.05);
    if (m.bell) {
      var b = ctx.createOscillator(), bg = ctx.createGain(); b.type = 'sine'; b.frequency.value = hz(semi) * 2.76;
      bg.gain.setValueAtTime(vel * 0.4, t); bg.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.7);
      b.connect(bg); bg.connect(master); b.start(t); b.stop(t + dur);
    }
  }
  function kick() {
    var t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.15);
    g.gain.setValueAtTime(0.28, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.25);
  }
  function hat() {
    var t = ctx.currentTime, len = Math.floor(ctx.sampleRate * 0.04), b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var s = ctx.createBufferSource(), g = ctx.createGain(), h = ctx.createBiquadFilter();
    h.type = 'highpass'; h.frequency.value = 6500; g.gain.value = 0.05; s.buffer = b; s.connect(h); h.connect(g); g.connect(master); s.start(t);
  }

  var pos = 3;
  function tick() {
    if (!st.on) return;
    var m = M(), sc = m.scale;
    /* random walk up/down the scale, with occasional rests and leaps */
    var r = Math.random();
    if (r < 0.1) pos = Math.floor(Math.random() * sc.length);
    else pos = Math.max(0, Math.min(sc.length - 1, pos + (r < 0.55 ? 1 : -1) * (Math.random() < 0.25 ? 2 : 1)));
    if (Math.random() > 0.18) pluck(sc[pos], 0.1 + Math.random() * 0.08, m.bell ? 3.2 : 1.6);
    if (m.beat) { if (step % 4 === 0) kick(); if (step % 2 === 1) hat(); }
    step++;
    timer = setTimeout(tick, m.tempo * 1000 * (m.beat ? 0.26 : 0.18) * (1 + Math.random() * 0.5));
  }

  function play() {
    if (!ensure()) return;
    if (st.on) return;
    st.on = true; step = 0; startDrone();
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(st.vol, ctx.currentTime + 2.2);
    tick(); save(); paint(); viz();
  }
  function pause() {
    if (!ctx || !st.on) return;
    st.on = false; clearTimeout(timer);
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.9);
    setTimeout(function () { if (!st.on) stopDrone(); }, 1000);
    save(); paint();
  }
  function setMood(i) {
    st.mood = (i + MOODS.length) % MOODS.length; save();
    if (st.on) { stopDrone(); clearTimeout(timer); startDrone(); pos = 3; tick(); }
    paint();
  }
  function setVol(v) {
    st.vol = v; save();
    if (ctx && st.on) master.gain.linearRampToValueAtTime(v, ctx.currentTime + 0.1);
  }

  /* ----- controller ----- */
  function ui() {
    if (document.getElementById('mp')) return;
    var d = document.createElement('div'); d.id = 'mp'; d.className = 'mp';
    d.innerHTML =
      '<button class="mp-main" id="mp-toggle" aria-label="Music">🎵<span class="mp-bars"><i></i><i></i><i></i><i></i></span></button>' +
      '<div class="mp-panel" id="mp-panel">' +
        '<div class="mp-title" id="mp-title"></div>' +
        '<div class="mp-row">' +
          '<button id="mp-prev" aria-label="Previous">⏮</button>' +
          '<button id="mp-play" class="big" aria-label="Play or pause">▶</button>' +
          '<button id="mp-next" aria-label="Next">⏭</button>' +
          '<input id="mp-vol" type="range" min="0" max="100" aria-label="Music volume">' +
        '</div>' +
        '<canvas id="mp-viz" width="180" height="34"></canvas>' +
      '</div>';
    document.body.appendChild(d);
    var $ = function (i) { return document.getElementById(i); };
    $('mp-toggle').addEventListener('click', function () {
      st.open = !st.open; d.classList.toggle('open', st.open);
      if (root.TLSfx) root.TLSfx.play('tapSoft');
    });
    $('mp-play').addEventListener('click', function () { st.on ? pause() : play(); });
    $('mp-next').addEventListener('click', function () { setMood(st.mood + 1); });
    $('mp-prev').addEventListener('click', function () { setMood(st.mood - 1); });
    $('mp-vol').addEventListener('input', function (e) { setVol(+e.target.value / 100); });
    $('mp-vol').value = Math.round(st.vol * 100);
    paint();
  }
  function paint() {
    var d = document.getElementById('mp'); if (!d) return;
    d.classList.toggle('playing', st.on);
    var m = M();
    document.getElementById('mp-title').textContent = m.icon + ' ' + m.name;
    document.getElementById('mp-play').textContent = st.on ? '⏸' : '▶';
  }
  function viz() {
    cancelAnimationFrame(raf);
    var c = document.getElementById('mp-viz');
    if (!c || !analyser) return;
    var g = c.getContext('2d'), data = new Uint8Array(analyser.frequencyBinCount);
    (function loop() {
      if (!st.on) { g.clearRect(0, 0, c.width, c.height); return; }
      analyser.getByteFrequencyData(data);
      g.clearRect(0, 0, c.width, c.height);
      var w = c.width / 24;
      for (var i = 0; i < 24; i++) {
        var h = Math.max(2, data[i] / 255 * c.height);
        g.fillStyle = 'hsl(' + (100 + i * 8) + ',75%,55%)';
        g.fillRect(i * w + 1, c.height - h, w - 3, h);
      }
      raf = requestAnimationFrame(loop);
    })();
  }

  function init() {
    load(); ui();
    /* Browsers block audio until a gesture: resume on first interaction if it was on last time. */
    if (st.wasOn) {
      var go = function () { document.removeEventListener('pointerdown', go); play(); };
      document.addEventListener('pointerdown', go);
    }
  }
  root.TLMusic = { init: init, play: play, pause: pause, toggle: function () { st.on ? pause() : play(); }, moods: MOODS, setMood: setMood, get on() { return st.on; } };
})(window);
