/* ==========================================================================
   Bhasha — speech
   Text-to-speech for Tamil / Telugu / Gujarati and (where the browser
   supports it) speech recognition so learners can be scored on pronunciation.
   ========================================================================== */
(function (root) {
  'use strict';

  var voices = [];
  var ready = false;
  var enabled = true;
  var rate = 0.85;

  function load() {
    if (!root.speechSynthesis) return;
    voices = root.speechSynthesis.getVoices() || [];
    ready = voices.length > 0;
  }
  load();
  if (root.speechSynthesis) {
    root.speechSynthesis.onvoiceschanged = load;
    /* Some engines populate late. */
    setTimeout(load, 400);
    setTimeout(load, 1500);
  }

  var LANG_NAMES = { ta: 'Tamil', te: 'Telugu', gu: 'Gujarati', hi: 'Hindi', en: 'English' };
  var FALLBACK = { ta: ['hi-IN', 'en-IN'], te: ['hi-IN', 'en-IN'], gu: ['hi-IN', 'en-IN'] };

  function normalize(code) { return String(code || '').replace('_', '-').toLowerCase(); }

  function pickVoice(lang) {
    load();
    var want = normalize(lang);
    var base = want.split('-')[0];
    /* 1. exact locale match */
    var v = voices.filter(function (x) { return normalize(x.lang) === want; })[0];
    if (v) return v;
    /* 2. same language, any locale */
    v = voices.filter(function (x) { return normalize(x.lang).split('-')[0] === base; })[0];
    if (v) return v;
    /* 3. friendly fallback (Hindi voice reading Tamil script is wrong, so we
          only fall back to a *voice* for the romanised hint read aloud) */
    var fb = FALLBACK[base] || [];
    for (var i = 0; i < fb.length; i++) {
      v = voices.filter(function (x) { return normalize(x.lang).split('-')[0] === fb[i].split('-')[0]; })[0];
      if (v) return v;
    }
    return null;
  }

  function hasVoice(lang) {
    load();
    var base = normalize(lang).split('-')[0];
    return voices.some(function (x) {
      var b = normalize(x.lang).split('-')[0];
      return b === base || (base === 'ta' && b === 'ta') || (base === 'te' && b === 'te');
    });
  }

  /* Speak text. opts: {lang, roman, onend} */
  function speak(text, opts) {
    opts = opts || {};
    if (!enabled || !root.speechSynthesis || !text) {
      if (opts.onend) setTimeout(opts.onend, 60);
      return false;
    }
    try { root.speechSynthesis.cancel(); } catch (e) {}
    var u = new root.SpeechSynthesisUtterance(String(text));
    var v = pickVoice(opts.lang || 'en');
    if (v) u.voice = v;
    u.lang = opts.lang || 'en';
    u.rate = opts.rate == null ? rate : opts.rate;
    u.pitch = opts.pitch == null ? 1 : opts.pitch;
    u.volume = 1;
    var done = false;
    u.onend = function () { if (!done) { done = true; if (opts.onend) opts.onend(); } };
    u.onerror = function () { if (!done) { done = true; if (opts.onend) opts.onend(); } };
    /* Safety net: some engines never fire onend. */
    setTimeout(function () { if (!done) { done = true; if (opts.onend) opts.onend(); } }, 2600);
    try { root.speechSynthesis.speak(u); } catch (e) { return false; }
    return true;
  }

  function stop() { try { root.speechSynthesis.cancel(); } catch (e) {} }

  /* ------------------------------------------------------- recognition */
  var SR = root.SpeechRecognition || root.webkitSpeechRecognition;
  var recognitionSupported = !!SR;

  /* Very forgiving similarity check for spoken answers. Tamil/Telugu/Gujarati
     recognition is patchy across browsers, so we compare a loose phonetic key
     and treat anything close as a pass. */
  function phonetic(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/[^\u0900-\u097f\u0b80-\u0bff\u0c00-\u0c7f\u0a80-\u0affa-z\s]/g, '')
      .replace(/aa|ā/g, 'a').replace(/ee|ī/g, 'i').replace(/oo|ū/g, 'u')
      .replace(/th/g, 't').replace(/dh/g, 'd').replace(/sh/g, 's')
      .replace(/kh/g, 'k').replace(/gh/g, 'g').replace(/ph|f/g, 'p')
      .replace(/[^a-z\s]/g, '')
      .replace(/\s+/g, ' ').trim();
  }

  function similar(a, b) {
    a = phonetic(a); b = phonetic(b);
    if (!a || !b) return 0;
    if (a === b) return 1;
    if (a.indexOf(b) > -1 || b.indexOf(a) > -1) return 0.9;
    /* word overlap */
    var aw = a.split(' '), bw = b.split(' ');
    var hit = aw.filter(function (w) { return w.length > 1 && bw.indexOf(w) > -1; }).length;
    return hit / Math.max(aw.length, bw.length);
  }

  function listen(opts) {
    opts = opts || {};
    if (!recognitionSupported) { if (opts.onerror) opts.onerror('unsupported'); return null; }
    var r = new SR();
    r.lang = opts.lang || 'en-IN';
    r.interimResults = false;
    r.maxAlternatives = 3;
    r.continuous = false;
    var finished = false;
    function finish(fn, arg) { if (finished) return; finished = true; fn && fn(arg); }
    r.onresult = function (ev) {
      var alts = [];
      var res = ev.results[0];
      for (var i = 0; i < res.length; i++) alts.push(res[i].transcript);
      finish(opts.onresult, alts);
    };
    r.onerror = function (ev) { finish(opts.onerror, ev.error || 'error'); };
    r.onend = function () { finish(opts.onend); };
    try { r.start(); } catch (e) { finish(opts.onerror, 'start-failed'); return null; }
    return { stop: function () { try { r.stop(); } catch (e) {} } };
  }

  root.TLSpeech = {
    speak: speak,
    stop: stop,
    listen: listen,
    similar: similar,
    phonetic: phonetic,
    hasVoice: hasVoice,
    voiceName: function (lang) { var v = pickVoice(lang); return v ? v.name + ' (' + v.lang + ')' : 'none'; },
    get recognitionSupported() { return recognitionSupported; },
    get ttsSupported() { return !!root.speechSynthesis; },
    langName: function (c) { return LANG_NAMES[normalize(c).split('-')[0]] || c; },
    setEnabled: function (v) { enabled = !!v; if (!v) stop(); },
    setRate: function (r) { rate = Math.max(0.4, Math.min(1.4, r)); },
    get enabled() { return enabled; }
  };
})(window);
