/* ==========================================================================
   Bhasha — sound effects
   All SFX are synthesised with the Web Audio API, so there are zero external
   assets. Each cue is a tiny score of oscillators + envelopes, tuned to feel
   like Duolingo's signature "ding / buzz / fanfare" vocabulary.
   ========================================================================== */
(function (root) {
  'use strict';

  var ctx = null;
  var master = null;
  var enabled = true;
  var volume = 0.5;

  function ensure() {
    if (ctx) return ctx;
    var AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = volume;
    /* a gentle low-pass keeps the synth from sounding harsh */
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 7200;
    master.connect(lp);
    lp.connect(ctx.destination);
    return ctx;
  }

  /* One voice: a pitched blip with an ADSR-ish envelope. */
  function tone(opt) {
    var c = ensure();
    if (!c) return;
    var t0 = c.currentTime + (opt.at || 0);
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = opt.type || 'sine';
    osc.frequency.setValueAtTime(opt.f, t0);
    if (opt.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, opt.to), t0 + opt.d);
    var peak = (opt.g == null ? 0.28 : opt.g);
    var attack = opt.a == null ? 0.008 : opt.a;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + opt.d);
    osc.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(t0 + opt.d + 0.03);
  }

  /* A short band of filtered noise — used for taps, chests and hearts. */
  function noise(opt) {
    var c = ensure();
    if (!c) return;
    var dur = opt.d || 0.15;
    var buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2.2);
    }
    var src = c.createBufferSource();
    src.buffer = buf;
    var f = c.createBiquadFilter();
    f.type = opt.filter || 'bandpass';
    f.frequency.value = opt.f || 1200;
    f.Q.value = opt.q || 1.2;
    var g = c.createGain();
    g.gain.value = opt.g == null ? 0.18 : opt.g;
    src.connect(f); f.connect(g); g.connect(master);
    src.start(c.currentTime + (opt.at || 0));
  }

  /* ------------------------------------------------------------ scorebook */

  var SFX = {
    tap: function () {
      tone({ f: 1180, to: 900, d: 0.05, type: 'triangle', g: 0.12, at: 0 });
      noise({ f: 900, d: 0.05, g: 0.05 });
    },
    tapSoft: function () {
      tone({ f: 760, to: 620, d: 0.045, type: 'triangle', g: 0.07 });
    },
    select: function () {
      tone({ f: 520, to: 690, d: 0.09, type: 'triangle', g: 0.16 });
    },
    hover: function () {
      tone({ f: 1400, d: 0.03, type: 'sine', g: 0.04 });
    },

    /* Correct: the classic two-note "ding" going up, with a bright shimmer. */
    correct: function () {
      tone({ f: 784, d: 0.16, type: 'triangle', g: 0.30 });
      tone({ f: 1175, d: 0.22, type: 'triangle', g: 0.26, at: 0.10 });
      tone({ f: 1568, d: 0.26, type: 'sine', g: 0.13, at: 0.10 });
      noise({ f: 3200, d: 0.10, g: 0.045, q: 2.4, at: 0.10 });
    },
    /* Combo up: correct + an extra sparkle. */
    combo: function () {
      SFX.correct();
      tone({ f: 2093, d: 0.16, type: 'sine', g: 0.12, at: 0.22 });
      tone({ f: 2637, d: 0.18, type: 'sine', g: 0.10, at: 0.30 });
    },

    /* Wrong: a soft descending "buzz" that is disappointing but not harsh. */
    wrong: function () {
      tone({ f: 300, to: 150, d: 0.32, type: 'sawtooth', g: 0.15, a: 0.012 });
      tone({ f: 150, to: 96, d: 0.36, type: 'sine', g: 0.16, at: 0.04 });
      noise({ f: 260, d: 0.24, g: 0.05, q: 0.9, at: 0.06, filter: 'lowpass' });
    },
    heartLost: function () {
      tone({ f: 520, to: 300, d: 0.34, type: 'triangle', g: 0.22 });
      noise({ f: 700, d: 0.2, g: 0.06, at: 0.05 });
    },

    /* Lesson complete: a 5-note fanfare. */
    complete: function () {
      [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) {
        tone({ f: f, d: 0.30, type: 'triangle', g: 0.24, at: i * 0.10 });
        tone({ f: f * 2, d: 0.24, type: 'sine', g: 0.09, at: i * 0.10 });
      });
      tone({ f: 1568, d: 0.6, type: 'sine', g: 0.14, at: 0.42 });
      noise({ f: 4200, d: 0.4, g: 0.05, q: 1.8, at: 0.42 });
    },

    /* A new crown level. */
    levelUp: function () {
      [440, 554.37, 659.25, 880, 1108.73].forEach(function (f, i) {
        tone({ f: f, d: 0.26, type: 'triangle', g: 0.2, at: i * 0.075 });
      });
      tone({ f: 1760, d: 0.5, type: 'sine', g: 0.12, at: 0.4 });
    },

    /* Streak counter goes up. */
    streak: function () {
      [659.25, 880, 1318.5].forEach(function (f, i) {
        tone({ f: f, d: 0.34, type: 'triangle', g: 0.2, at: i * 0.13 });
      });
      noise({ f: 5200, d: 0.5, g: 0.045, at: 0.26, q: 2.2 });
    },

    /* Reward chest opening. */
    chest: function () {
      noise({ f: 640, d: 0.22, g: 0.09, filter: 'lowpass' });
      [392, 523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) {
        tone({ f: f, d: 0.22, type: 'triangle', g: 0.18, at: 0.14 + i * 0.06 });
      });
    },

    /* Gem / XP collected. */
    coin: function () {
      tone({ f: 1318.5, d: 0.09, type: 'triangle', g: 0.2 });
      tone({ f: 1760, d: 0.18, type: 'triangle', g: 0.16, at: 0.07 });
    },

    /* Unlock / reveal. */
    unlock: function () {
      tone({ f: 587.33, to: 1174.66, d: 0.30, type: 'triangle', g: 0.2 });
      noise({ f: 2800, d: 0.26, g: 0.05, at: 0.12, q: 1.6 });
    },

    /* Countdown / time pressure. */
    tick: function () { tone({ f: 880, d: 0.04, type: 'square', g: 0.06 }); },

    /* Error state. */
    error: function () {
      tone({ f: 220, d: 0.16, type: 'square', g: 0.10 });
      tone({ f: 180, d: 0.2, type: 'square', g: 0.10, at: 0.12 });
    },

    /* Whoosh for screen transitions. */
    whoosh: function () { noise({ f: 1500, d: 0.22, g: 0.06, q: 0.7 }); },

    /* Losing all hearts. */
    gameOver: function () {
      [392, 349.23, 293.66, 220].forEach(function (f, i) {
        tone({ f: f, d: 0.4, type: 'triangle', g: 0.2, at: i * 0.16 });
      });
    }
  };

  /* --------------------------------------------------------------- api */

  function play(name) {
    if (!enabled) return;
    var fn = SFX[name];
    if (!fn) return;
    var c = ensure();
    if (!c) return;
    if (c.state === 'suspended') { try { c.resume(); } catch (e) {} }
    try { fn(); } catch (e) { /* audio must never break the lesson */ }
  }

  /* iOS/Safari requires a user gesture before audio can start. */
  function unlock() {
    var c = ensure();
    if (!c) return;
    if (c.state === 'suspended') { try { c.resume(); } catch (e) {} }
    /* play a silent blip to fully open the channel */
    try { tone({ f: 20000, d: 0.01, g: 0.0001 }); } catch (e) {}
  }

  function setEnabled(v) { enabled = !!v; if (enabled) unlock(); }
  function setVolume(v) {
    volume = Math.max(0, Math.min(1, v));
    if (master) master.gain.value = volume;
  }

  root.TLSfx = {
    play: play,
    unlock: unlock,
    setEnabled: setEnabled,
    setVolume: setVolume,
    names: Object.keys(SFX),
    get on() { return enabled; }
  };
})(window);
