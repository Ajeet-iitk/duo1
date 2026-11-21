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

  var chosen = {};      /* user-picked voice name per base lang */
  var warned = false;
  var cloudOn = true;   /* free Google Translate TTS fallback when no native voice */
  var audioEl = null;

  function score(v) {
    var n = (v.name + ' ' + v.voiceURI).toLowerCase(), sc = 0;
    if (/natural|neural|online/.test(n)) sc += 4;
    if (/google/.test(n)) sc += 3;
    if (/microsoft/.test(n)) sc += 2;
    if (!v.localService) sc += 1;
    return sc;
  }
  function voicesFor(lang) {
    load();
    var base = normalize(lang).split('-')[0];
    return voices.filter(function (x) { return normalize(x.lang).split('-')[0] === base; })
      .sort(function (a, b) { return score(b) - score(a); });
  }
  function pickVoice(lang) {
    var base = normalize(lang).split('-')[0];
    var list = voicesFor(lang);
    if (chosen[base]) {
      var pick = list.filter(function (x) { return x.name === chosen[base]; })[0];
      if (pick) return pick;
    }
    var exact = list.filter(function (x) { return normalize(x.lang) === normalize(lang); })[0];
    return exact || list[0] || null;
  }

  function hasVoice(lang) { return voicesFor(lang).length > 0; }

  /* Pre-recorded clips (assets/audio, built by tools/build-audio.mjs). These work offline
     and on devices that have no native Tamil/Telugu/Gujarati voice. */
  function clipFor(text, lang, slow) {
    var idx = root.TLAudioIndex;
    if (!idx) return null;
    var base = normalize(lang).split('-')[0];
    var e = idx[base] && idx[base][String(text).trim()];
    if (!e) return null;
    var parts = e.split(',');
    var useSlow = slow && parts[1] === 's';
    return { src: 'assets/audio/' + base + '/' + parts[0] + (useSlow ? '_s' : '') + '.mp3', rate: slow && !useSlow ? 0.75 : 1 };
  }

  function playClip(clip, opts, onfail) {
    try {
      if (audioEl) { audioEl.pause(); audioEl = null; }
      var a = new Audio(clip.src);
      a.playbackRate = clip.rate;
      var done = false;
      function fin(ok) { if (done) return; done = true; if (!ok) onfail && onfail(); else if (opts.onend) opts.onend(); }
      a.onended = function () { fin(true); };
      a.onerror = function () { fin(false); };
      audioEl = a;
      var p = a.play();
      if (p && p.catch) p.catch(function (err) {
        if (err && err.name === 'NotAllowedError') {
          /* Browser blocks sound until the first tap — not a real failure. */
          done = true; if (opts.onend) opts.onend();
          if (root.TLUI && !blockedWarned) { blockedWarned = true; root.TLUI.toast('Tap anywhere on the page once to allow sound, then press \ud83d\udd0a again.'); }
        } else fin(false);
      });
      return true;
    } catch (e) { return false; }
  }
  var blockedWarned = false;

  function nativeSpeak(text, opts, v) {
    var u = new root.SpeechSynthesisUtterance(String(text));
    if (v) u.voice = v;
    u.lang = (v && v.lang) || opts.lang || 'en';
    u.rate = opts.rate == null ? rate : opts.rate;
    u.pitch = opts.pitch == null ? 1 : opts.pitch;
    u.volume = 1;
    var done = false;
    function fin() { if (!done) { done = true; if (opts.onend) opts.onend(); } }
    u.onend = fin; u.onerror = fin;
    setTimeout(fin, 2500 + String(text).length * 180 / (u.rate || 1));
    /* Chrome drops an utterance queued in the same tick as cancel(): wait a beat. */
    setTimeout(function () { try { root.speechSynthesis.speak(u); } catch (e) { fin(); } }, 60);
    return true;
  }

  function warnNoVoice(base) {
    if (warned || !root.TLUI) return;
    warned = true;
    root.TLUI.toast('No ' + (LANG_NAMES[base] || '') + ' audio for this text on this device. Install a ' + (LANG_NAMES[base] || '') + ' voice in your system speech settings.');
  }

  /* Speak text. opts: {lang, rate, slow, onend}
     order: recorded clip -> native voice -> friendly message. */
  function speak(text, opts) {
    opts = opts || {};
    if (opts.slow) opts.rate = Math.min(rate, 0.55);
    if (!enabled || !text) { if (opts.onend) setTimeout(opts.onend, 60); return false; }
    stop();
    var lang = opts.lang || 'en';
    var base = normalize(lang).split('-')[0];
    var v = root.speechSynthesis ? pickVoice(lang) : null;
    var nativeOk = v && normalize(v.lang).split('-')[0] === base;
    function viaNative() {
      if (nativeOk || (v && !(base === 'ta' || base === 'te' || base === 'gu'))) return nativeSpeak(text, opts, v);
      warnNoVoice(base); if (opts.onend) setTimeout(opts.onend, 60); return false;
    }
    var clip = cloudOn ? clipFor(text, lang, opts.slow) : null;
    if (clip && playClip(clip, opts, viaNative)) return true;
    return viaNative();
  }

  /* Speak the same text twice: normal, then slow. */
  function speakBoth(text, opts) {
    opts = opts || {};
    speak(text, { lang: opts.lang, onend: function () { setTimeout(function () { speak(text, { lang: opts.lang, slow: true, onend: opts.onend }); }, 350); } });
  }

  function stop() {
    try { root.speechSynthesis && root.speechSynthesis.cancel(); } catch (e) {}
    if (audioEl) { try { audioEl.pause(); } catch (e) {} audioEl = null; }
  }

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
    speakBoth: speakBoth,
    voicesFor: voicesFor,
    choose: function (lang, name) { chosen[normalize(lang).split('-')[0]] = name; },
    setCloud: function (v) { cloudOn = !!v; },
    get cloud() { return cloudOn; },
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
