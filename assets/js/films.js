/* Bhasha — Cinema: famous film lines & titles in Tamil, Telugu and Gujarati.
   Posters are drawn with CSS (no copyrighted artwork). Only very short, widely
   quoted lines are used, purely for language learning; all rights remain with
   the filmmakers. Wording can vary slightly between prints and subtitles.
   w = [script, roman, English, Hindi] */
(function (root) {
  'use strict';

  var FILMS = {
    ta: [
      { id: 'baasha', movie: 'Baasha', native: 'பாட்ஷா', year: 1995, stars: 'Rajinikanth', genre: 'Gangster drama', emoji: '🕶️', grad: ['#1e3c72', '#2a5298'],
        ctx: 'Rajinikanth’s legendary punchline — the reason a whole generation learned the word “thadavai”.',
        lines: [{ kind: 'line', t: 'நான் ஒரு தடவை சொன்னா நூறு தடவை சொன்ன மாதிரி', r: 'naan oru thadavai sonnaa nooru thadavai sonna maadhiri',
          en: 'If I say it once, it is as if I said it a hundred times.', hi: 'मैं एक बार कहूँ तो समझो सौ बार कहा।',
          w: [['நான்', 'naan', 'I', 'मैं'], ['ஒரு', 'oru', 'one', 'एक'], ['தடவை', 'thadavai', 'time / occasion', 'बार'], ['சொன்னா', 'sonnaa', 'if (I) say', 'अगर कहूँ'], ['நூறு', 'nooru', 'hundred', 'सौ'], ['தடவை', 'thadavai', 'times', 'बार'], ['சொன்ன', 'sonna', 'said', 'कहा'], ['மாதிரி', 'maadhiri', 'like / as if', 'जैसा']] }] },
      { id: 'padayappa', movie: 'Padayappa', native: 'படையப்பா', year: 1999, stars: 'Rajinikanth', genre: 'Family action', emoji: '🐅', grad: ['#7b2d00', '#d35400'],
        ctx: 'A swaggering declaration of independence, quoted in every Tamil mimicry show.',
        lines: [{ kind: 'line', t: 'என் வழி தனி வழி', r: 'en vazhi thani vazhi', en: 'My way is a way of its own.', hi: 'मेरा रास्ता अलग रास्ता है।',
          w: [['என்', 'en', 'my', 'मेरा'], ['வழி', 'vazhi', 'way / path', 'रास्ता'], ['தனி', 'thani', 'separate, unique', 'अलग'], ['வழி', 'vazhi', 'way / path', 'रास्ता']] }] },
      { id: 'kabali', movie: 'Kabali', native: 'கபாலி', year: 2016, stars: 'Rajinikanth', genre: 'Crime drama', emoji: '🎩', grad: ['#0f2027', '#2c5364'],
        ctx: 'Said with a slow smile — “magizhchi” became the film’s signature word.',
        lines: [{ kind: 'line', t: 'மகிழ்ச்சி', r: 'magizhchi', en: 'Happiness! (I am pleased.)', hi: 'खुशी! (मैं प्रसन्न हूँ।)',
          w: [['மகிழ்ச்சி', 'magizhchi', 'happiness, joy', 'खुशी']] }] },
      { id: 'nayakan', movie: 'Nayakan', native: 'நாயகன்', year: 1987, stars: 'Kamal Haasan', genre: 'Crime epic', emoji: '🌧️', grad: ['#232526', '#414345'],
        ctx: 'A child’s question that sits at the heart of this Mani Ratnam classic.',
        lines: [{ kind: 'line', t: 'நீங்க நல்லவரா? கெட்டவரா?', r: 'neenga nallavaraa? kettavaraa?', en: 'Are you a good man? Or a bad one?', hi: 'आप अच्छे आदमी हैं या बुरे?',
          w: [['நீங்க', 'neenga', 'you (respectful)', 'आप'], ['நல்லவரா', 'nallavaraa', 'a good person?', 'अच्छे इंसान?'], ['கெட்டவரா', 'kettavaraa', 'a bad person?', 'बुरे इंसान?']] }] },
      { id: 'sivaji', movie: 'Sivaji', native: 'சிவாஜி', year: 2007, stars: 'Rajinikanth', genre: 'Masala', emoji: '💥', grad: ['#8e0e00', '#1f1c18'],
        ctx: 'The ultimate “that was epic, wasn’t it?” — used for anything impressive.',
        lines: [{ kind: 'line', t: 'சும்மா அதிருதில்ல', r: 'summa adhirudhilla', en: 'It just shakes the place, doesn’t it?', hi: 'बस हिला देता है, है ना?',
          w: [['சும்மா', 'summa', 'just, simply', 'बस यूँ ही'], ['அதிருதில்ல', 'adhirudhilla', 'it shakes, doesn’t it', 'हिलता है ना']] }] }
    ],
    te: [
      { id: 'pushpa', movie: 'Pushpa: The Rise', native: 'పుష్ప', year: 2021, stars: 'Allu Arjun', genre: 'Action', emoji: '🔥', grad: ['#134e5e', '#71b280'],
        ctx: 'Two lines that took over reels and cricket stadiums alike.',
        lines: [
          { kind: 'line', t: 'తగ్గేదే లే', r: 'thaggede le', en: 'I will not back down.', hi: 'मैं पीछे नहीं हटूँगा।',
            w: [['తగ్గేదే', 'thaggede', 'back down / reduce', 'झुकना / कम होना'], ['లే', 'le', 'is not (colloquial)', 'नहीं']] },
          { kind: 'line', t: 'పుష్ప అంటే ఫ్లవర్ అనుకున్నావా? ఫైరు!', r: 'pushpa ante flower anukunnavaa? fire-u!', en: 'Pushpa — you thought that means flower? It is fire!', hi: 'पुष्पा का मतलब फूल समझा क्या? आग है!',
            w: [['పుష్ప', 'pushpa', 'Pushpa', 'पुष्पा'], ['అంటే', 'ante', 'means / as in', 'मतलब'], ['ఫ్లవర్', 'flower', 'flower', 'फूल'], ['అనుకున్నావా', 'anukunnaavaa', 'did you think?', 'क्या तूने सोचा?'], ['ఫైరు', 'fire-u', 'fire', 'आग']] }] },
      { id: 'baahubali', movie: 'Baahubali', native: 'బాహుబలి', year: 2015, stars: 'Prabhas', genre: 'Epic', emoji: '⚔️', grad: ['#42275a', '#734b6d'],
        ctx: 'The start of a royal oath from the epic that took Telugu cinema worldwide.',
        lines: [{ kind: 'line', t: 'అమరేంద్ర బాహుబలి అనే నేను', r: 'amarendra baahubali ane nenu', en: 'I, who am called Amarendra Baahubali…', hi: 'मैं, जिसका नाम अमरेंद्र बाहुबली है…',
          w: [['అమరేంద్ర', 'amarendra', 'Amarendra', 'अमरेंद्र'], ['బాహుబలి', 'baahubali', 'Baahubali', 'बाहुबली'], ['అనే', 'ane', 'called / named', 'नामक'], ['నేను', 'nenu', 'I', 'मैं']] }] },
      { id: 'pokiri', movie: 'Pokiri', native: 'పోకిరి', year: 2006, stars: 'Mahesh Babu', genre: 'Action thriller', emoji: '🕶️', grad: ['#0f0c29', '#302b63'],
        ctx: 'A famous bit of Telugu–English mixing: even the verb “commit” is borrowed.',
        lines: [{ kind: 'line', t: 'ఒక్కసారి కమిట్ అయితే నా మాట నేనే వినను', r: 'okkasaari commit ayithe naa maata nene vinanu', en: 'Once I commit, I don’t even listen to myself.', hi: 'एक बार कमिट कर दिया तो मैं अपनी भी नहीं सुनता।',
          w: [['ఒక్కసారి', 'okkasaari', 'once', 'एक बार'], ['కమిట్', 'commit', 'commit', 'कमिट'], ['అయితే', 'ayithe', 'if (it) becomes', 'अगर हो जाए'], ['నా', 'naa', 'my', 'मेरी'], ['మాట', 'maata', 'word', 'बात'], ['నేనే', 'nene', 'I myself', 'मैं खुद'], ['వినను', 'vinanu', 'won’t listen', 'नहीं सुनूँगा']] }] },
      { id: 'rrr', movie: 'RRR', native: 'ఆర్ఆర్ఆర్', year: 2022, stars: 'N. T. Rama Rao Jr., Ram Charan', genre: 'Period action', emoji: '💃', grad: ['#c31432', '#240b36'],
        ctx: 'The hook of “Naatu Naatu”, the first Indian film song to win an Oscar.',
        lines: [{ kind: 'song', t: 'నాటు నాటు', r: 'naatu naatu', en: 'Rustic, rustic! (country-style, earthy)', hi: 'देसी, देसी!',
          w: [['నాటు', 'naatu', 'rustic, country-style', 'देसी'], ['నాటు', 'naatu', 'rustic, country-style', 'देसी']] }] }
    ],
    gu: [
      { id: 'chhelloshow', movie: 'Last Film Show', native: 'છેલ્લો શો', year: 2021, stars: 'Bhavin Rabari', genre: 'Coming-of-age', emoji: '🎞️', grad: ['#f12711', '#f5af19'],
        ctx: 'India’s official entry to the Oscars — a boy, a projection booth, a love of light.',
        lines: [{ kind: 'title', t: 'છેલ્લો શો', r: 'chhello show', en: 'The last show.', hi: 'आखिरी शो।',
          w: [['છેલ્લો', 'chhello', 'last', 'आखिरी'], ['શો', 'show', 'show', 'शो']] }] },
      { id: 'kevirite', movie: 'Kevi Rite Jaish', native: 'કેવી રીતે જઈશ', year: 2012, stars: 'Malhar Thakar, Jackie Shroff', genre: 'Comedy', emoji: '🚗', grad: ['#11998e', '#38ef7d'],
        ctx: 'A comic road trip whose title is also the question you will ask every day in Gujarat.',
        lines: [{ kind: 'title', t: 'કેવી રીતે જઈશ?', r: 'kevi rite jaish?', en: 'How will you go?', hi: 'कैसे जाओगे?',
          w: [['કેવી', 'kevi', 'what kind of', 'कैसी'], ['રીતે', 'rite', 'way, manner', 'तरीके से'], ['જઈશ', 'jaish', 'will go (informal “you”)', 'जाओगे']] }] },
      { id: 'beyyaar', movie: 'Bey Yaar', native: 'બે યાર', year: 2014, stars: 'Dharmesh Vyas, Divyang Thakkar', genre: 'Friendship comedy', emoji: '🤝', grad: ['#2193b0', '#6dd5ed'],
        ctx: 'Two friends, one big idea — “yaar” is the same warm word Hindi speakers know.',
        lines: [{ kind: 'title', t: 'બે યાર', r: 'be yaar', en: 'Two buddies.', hi: 'दो यार।',
          w: [['બે', 'be', 'two', 'दो'], ['યાર', 'yaar', 'buddy, friend', 'दोस्त']] }] },
      { id: 'hellaro', movie: 'Hellaro', native: 'હેલ્લારો', year: 2019, stars: 'Jayesh More, Shraddha Dangar', genre: 'Drama', emoji: '🥁', grad: ['#8e2de2', '#4a00e0'],
        ctx: 'A National Award winner about women, a desert and garba under the moon.',
        lines: [{ kind: 'title', t: 'હેલ્લારો', r: 'hellaaro', en: 'A surge, a sweeping wave.', hi: 'एक उफान, एक लहर।',
          w: [['હેલ્લારો', 'hellaaro', 'a surge / gush / wave', 'उफान / लहर']] }] },
      { id: 'chalji', movie: 'Chal Jeevi Laiye', native: 'ચાલ જીવી લઈએ', year: 2024, stars: 'Vikram Thakor, Yash Soni', genre: 'Family drama', emoji: '🌅', grad: ['#ff9966', '#ff5e62'],
        ctx: 'A gentle invitation for a hurried life: “come on, let’s actually live.”',
        lines: [{ kind: 'title', t: 'ચાલ જીવી લઈએ', r: 'chaal jeevi laiye', en: 'Come on, let’s live a little!', hi: 'चलो, ज़रा जी लें!',
          w: [['ચાલ', 'chaal', 'come on', 'चलो'], ['જીવી', 'jeevi', 'having lived', 'जी कर'], ['લઈએ', 'laiye', 'let’s take / do', 'लें']] }] }
    ]
  };

  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  function course() { return TLData.courses[TLStore.get('profile.course')]; }
  function base() { return TLStore.get('profile.base'); }
  function mean(l) { var b = base(); return b === 'hi' ? l.hi : (b === 'hg' ? TLData.translit(l.hi) : l.en); }
  function wmean(w) { var b = base(); return b === 'hi' ? w[3] : (b === 'hg' ? TLData.translit(w[3]) : w[2]); }
  function say(t, slow) { TLSpeech.speak(t, { lang: course().speech, slow: slow }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.random() * (i + 1) | 0, t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function films() { return FILMS[course().id] || []; }
  var sel = { movie: 0, line: 0 };

  function poster(f, i, on) {
    return '<button class="fp' + (on ? ' on' : '') + '" data-f="' + i + '" style="--g1:' + f.grad[0] + ';--g2:' + f.grad[1] + '">' +
      '<span class="fp-holes"></span><span class="fp-emoji">' + f.emoji + '</span>' +
      '<span class="fp-native">' + esc(f.native) + '</span><span class="fp-title">' + esc(f.movie) + '</span>' +
      '<span class="fp-meta">' + f.year + ' · ' + esc(f.genre) + '</span></button>';
  }

  function page() {
    var list = films();
    if (sel.movie >= list.length) sel.movie = 0;
    return '<a class="xp-back" href="#/explore">' + esc(TLI18n.t('back')) + '</a>' +
      '<h1 class="q-title" style="margin:6px 0 4px">🎬 Film Dialogues</h1>' +
      '<p class="muted">Famous ' + esc(course().name) + ' cinema, one line at a time. Pick a poster, hear it, break it into words, then test yourself.</p>' +
      '<div class="fp-row" id="fp-row">' + list.map(function (f, i) { return poster(f, i, i === sel.movie); }).join('') + '</div>' +
      '<div id="film-stage"></div>' +
      '<p class="muted tiny" style="margin-top:18px">Posters are original CSS art, not film artwork. Lines are very short, widely quoted phrases shown for learning; all rights belong to the filmmakers. Title phrases are marked “title” where the quote is the film’s name.</p>';
  }

  function scene() {
    var f = films()[sel.movie], l = f.lines[sel.line] || f.lines[0], stage = $('#film-stage');
    stage.innerHTML =
      '<div class="clap" style="--g1:' + f.grad[0] + ';--g2:' + f.grad[1] + '">' +
        '<div class="clap-top"><i></i><i></i><i></i><i></i><i></i><i></i></div>' +
        '<div class="clap-body">' +
          '<div class="clap-meta"><span>SCENE ' + (sel.movie + 1) + '</span><span>TAKE ' + (sel.line + 1) + '</span><span>' + (l.kind === 'line' ? 'DIALOGUE' : l.kind === 'song' ? 'SONG HOOK' : 'TITLE') + '</span></div>' +
          '<div class="clap-film"><b>' + esc(f.movie) + '</b> (' + f.year + ') · ' + esc(f.stars) + '</div>' +
          '<div class="clap-line" id="cl-line">' + esc(l.t) + '</div>' +
          '<div class="clap-rom">' + esc(l.r) + '</div>' +
          '<div class="clap-btns"><button class="btn sm" id="cl-say">🔊 Play</button><button class="btn sm ghost" id="cl-slow">🐢 Slow</button><button class="btn sm ghost" id="cl-shadow">🎤 Shadow it</button></div>' +
          '<div class="clap-mean" id="cl-mean"><span>Tap to reveal the meaning</span></div>' +
          '<div class="clap-words" id="cl-words">' + l.w.map(function (w, i) { return '<button class="cw" data-i="' + i + '"><b>' + esc(w[0]) + '</b><small>' + esc(w[1]) + '</small></button>'; }).join('') + '</div>' +
          '<div class="clap-gloss" id="cl-gloss">Tap a word to hear it and see what it means.</div>' +
          '<p class="clap-ctx">🎞️ ' + esc(f.ctx) + '</p>' +
        '</div></div>' +
      (f.lines.length > 1 ? '<div class="wrapflex" style="margin-top:12px">' + f.lines.map(function (x, i) { return '<button class="chip' + (i === sel.line ? ' blue' : '') + '" data-ln="' + i + '">Take ' + (i + 1) + '</button>'; }).join('') + '</div>' : '') +
      '<div class="wrapflex" style="margin-top:14px"><button class="btn" id="cl-quiz">🎯 Cinema quiz</button><button class="btn ghost" id="cl-rand">🎲 Random scene</button></div><div id="cl-extra"></div>';

    var mean$ = $('#cl-mean');
    mean$.addEventListener('click', function () { mean$.classList.add('open'); mean$.innerHTML = '<b>' + esc(mean(l)) + '</b>'; TLSfx.play('tapSoft'); });
    $('#cl-say').addEventListener('click', function () { clapAnim(); say(l.t); });
    $('#cl-slow').addEventListener('click', function () { say(l.t, true); });
    $$('.cw', stage).forEach(function (b) {
      b.addEventListener('click', function () {
        var w = l.w[+b.dataset.i]; say(w[0]); TLSfx.play('select');
        $$('.cw', stage).forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on');
        $('#cl-gloss').innerHTML = '<b>' + esc(w[0]) + '</b> · ' + esc(w[1]) + ' — ' + esc(wmean(w));
      });
    });
    $$('[data-ln]', stage).forEach(function (b) { b.addEventListener('click', function () { sel.line = +b.dataset.ln; scene(); }); });
    $('#cl-rand').addEventListener('click', function () { sel.movie = Math.random() * films().length | 0; sel.line = 0; refreshPosters(); scene(); clapAnim(); });
    $('#cl-quiz').addEventListener('click', quiz);
    $('#cl-shadow').addEventListener('click', function () { shadow(l); });
  }

  function clapAnim() { var c = $('.clap'); if (!c) return; c.classList.remove('clapping'); void c.offsetWidth; c.classList.add('clapping'); }
  function refreshPosters() { $$('.fp').forEach(function (b, i) { b.classList.toggle('on', i === sel.movie); }); var on = $('.fp.on'); if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }); }

  function shadow(l) {
    var out = $('#cl-extra');
    say(l.t, true);
    out.innerHTML = '<div class="card" style="margin-top:12px"><b>Shadow it</b><p class="muted">Listen, then say it back like the actor. ' + (TLSpeech.recognitionSupported ? 'Tap the mic and speak.' : 'Your browser has no speech recognition — say it aloud and rate yourself.') + '</p>' +
      (TLSpeech.recognitionSupported ? '<button class="btn blue" id="sh-mic">🎤 Speak now</button><div id="sh-res" class="muted" style="margin-top:8px"></div>' :
        '<div class="wrapflex"><button class="btn red sm" data-self="0">Rough</button><button class="btn yellow sm" data-self="1">Okay</button><button class="btn sm" data-self="2">Nailed it</button></div>') + '</div>';
    var mic = $('#sh-mic');
    if (mic) mic.addEventListener('click', function () {
      $('#sh-res').textContent = 'Listening…';
      TLSpeech.listen({ lang: course().speech, onresult: function (alts) {
        var best = 0; alts.forEach(function (a) { best = Math.max(best, TLSpeech.similar(a, l.t), TLSpeech.similar(a, l.r)); });
        var pct = Math.round(best * 100);
        $('#sh-res').innerHTML = 'Heard: <b>' + esc(alts[0]) + '</b> · match ' + pct + '%' + (pct >= 60 ? ' 🎉' : ' — try once more, slower.');
        if (pct >= 60) { TLSfx.play('correct'); reward(8); }
      }, onerror: function () { $('#sh-res').textContent = 'Could not hear you. Check the microphone permission and try again.'; } });
    });
    $$('[data-self]', out).forEach(function (b) { b.addEventListener('click', function () { var s = +b.dataset.self; TLSfx.play(s ? 'correct' : 'tapSoft'); if (s) reward(s * 4); out.innerHTML = '<div class="card" style="margin-top:12px">Logged. Repetition is the whole trick. 💪</div>'; }); });
  }

  function reward(xp) { TLStore.addXp(xp, course().id); TLStore.addGems(Math.round(xp / 4)); TLUI.toast('+' + xp + ' XP · cinema'); }

  function quiz() {
    var all = [];
    films().forEach(function (f) { f.lines.forEach(function (l) { all.push({ f: f, l: l }); }); });
    var ans = all[Math.random() * all.length | 0];
    var opts = shuffle([ans].concat(shuffle(all.filter(function (x) { return x !== ans; })).slice(0, 2)));
    var out = $('#cl-extra');
    out.innerHTML = '<div class="card" style="margin-top:12px"><b>Which line means:</b><div class="clap-mean open" style="margin:8px 0"><b>' + esc(mean(ans.l)) + '</b></div>' +
      '<div class="quiz-opts">' + opts.map(function (o, i) { return '<button class="choice" data-i="' + i + '"><span class="c-script">' + esc(o.l.t) + '</span></button>'; }).join('') + '</div></div>';
    $$('.choice', out).forEach(function (b) {
      b.addEventListener('click', function () {
        var ok = opts[+b.dataset.i] === ans; if (out.classList.contains('done')) return; out.classList.add('done');
        TLSfx.play(ok ? 'correct' : 'wrong'); b.classList.add(ok ? 'ok' : 'bad'); say(ans.l.t);
        out.insertAdjacentHTML('beforeend', '<div class="gm-fb ' + (ok ? 'ok' : 'bad') + '">' + (ok ? 'Yes!' : 'Not quite.') + ' <b>' + esc(ans.f.movie) + '</b> · ' + esc(ans.l.r) + '</div><button class="btn" id="cq-next" style="margin-top:10px">Next</button>');
        if (ok) reward(6);
        $('#cq-next').addEventListener('click', function () { out.classList.remove('done'); quiz(); });
      });
    });
  }

  function wire() {
    $$('.fp').forEach(function (b) {
      b.addEventListener('click', function () { sel.movie = +b.dataset.f; sel.line = 0; refreshPosters(); scene(); clapAnim(); TLSfx.play('tap'); var f = films()[sel.movie]; say(f.lines[0].t); });
    });
    scene();
  }

  root.TLFilms = { page: page, wire: wire, data: FILMS };
})(window);
