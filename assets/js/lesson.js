/* ==========================================================================
   Bhasha — lesson runner
   Renders and grades a full lesson: progress bar, hearts, combos, six
   exercise types, the green/red feedback footer, and the results screen.
   ========================================================================== */
(function (root) {
  'use strict';

  var PRAISE = ['Nice!', 'Correct!', 'Excellent!', 'Superb!', 'Amazing!', 'You got it!', 'Perfect!', 'Great job!'];
  var NUDGE = ['Almost!', 'Not quite', 'Keep going', 'So close!', 'Try to remember this one'];
  var WRONG_LINES = [
    'Careful — this one is tricky.',
    'That one trips up almost everyone.',
    'Let us look at it again.',
    'Nearly! The answer is below.'
  ];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function rand(a) { return a[Math.floor(Math.random() * a.length)]; }

  var S = null;   /* session state */

  /* ------------------------------------------------------------- lifecycle */
  function start(opts) {
    var course = TLData.courses[opts.courseId];
    var unit = TLData.unitById(course, opts.unitId);
    var index = opts.index || 0;
    var base = root.TLStore.get('profile.base');
    var lesson = root.TLEx.build(course, unit, index, base);

    S = {
      course: course,
      unit: unit,
      index: index,
      base: base,
      lesson: lesson,
      i: 0,
      hearts: root.TLStore.state.stats.hearts,
      combo: 0,
      maxCombo: 0,
      correct: 0,
      wrong: 0,
      xp: 0,
      started: Date.now(),
      answer: null,
      checked: false,
      lastResult: null,
      perfect: true,
      mistakes: [],
      onExit: opts.onExit || function () {},
      finished: false
    };

    if (!S.hearts) S.hearts = 0;
    buildShell();
    render();
    root.TLSfx.play('whoosh');
  }

  function buildShell() {
    var el = document.createElement('div');
    el.className = 'lesson-shell';
    el.innerHTML =
      '<div class="lesson-top">' +
        '<button class="x" id="lsn-quit" aria-label="Quit lesson">✕</button>' +
        '<div class="bar"><i id="lsn-bar" style="width:0%"></i></div>' +
        '<button class="explain-btn" id="lsn-explain" title="Explain this question">💡<span>Explain</span></button>' +
        '<div class="stat heart" id="lsn-hearts" title="Hearts">❤️ <span>5</span></div>' +
      '</div>' +
      '<div class="lesson-body"><div class="lesson-inner" id="lsn-body"></div></div>' +
      '<div class="lesson-foot" id="lsn-foot">' +
        '<div class="lf-inner">' +
          '<div class="feedback" id="lsn-fb"></div>' +
          '<div class="acts" id="lsn-acts">' +
            '<button class="btn lg disabled" id="lsn-main">Check</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(el);
    S.el = el;
    el.querySelector('#lsn-quit').addEventListener('click', confirmQuit);
    el.querySelector('#lsn-explain').addEventListener('click', openQuestionExplain);
  }

  function confirmQuit() {
    root.TLSfx.play('tap');
    if (S.finished) return exit();
    var msg = '<h2>Quit this lesson?</h2><p class="muted">Your progress in this lesson will be lost.</p>' +
      '<div class="wrapflex" style="margin-top:16px">' +
      '<button class="btn ghost" id="q-stay">Keep learning</button>' +
      '<button class="btn red" id="q-go">Quit lesson</button></div>';
    var m = root.TLUI.modal(msg);
    m.querySelector('#q-stay').addEventListener('click', function () { root.TLUI.closeModal(); root.TLSfx.play('tap'); });
    m.querySelector('#q-go').addEventListener('click', function () { root.TLUI.closeModal(); exit(); });
  }

  function exit() {
    if (root.TLSpeech) root.TLSpeech.stop();
    if (S && S.keyHandler) document.removeEventListener('keydown', S.keyHandler);
    if (S && S.el && S.el.parentNode) S.el.parentNode.removeChild(S.el);
    var cb = S.onExit;
    S = null;
    cb({ quit: true });
  }

  /* ---------------------------------------------------------------- render */
  function current() { return S.lesson.exercises[S.i]; }

  function render() {
    var ex = current();
    if (!ex) return finish();

    var bar = document.getElementById('lsn-bar');
    if (bar) bar.style.width = Math.round((S.i / S.lesson.exercises.length) * 100) + '%';
    var h = document.getElementById('lsn-hearts');
    if (h) h.innerHTML = (S.hearts > 0 ? '❤️' : '🤍') + ' <span>' + S.hearts + '</span>' +
      (S.combo >= 3 ? ' <span class="combo">🔥 ' + S.combo + '</span>' : '');

    var body = document.getElementById('lsn-body');
    body.innerHTML = '<h1 class="q-title">' + esc(ex.title || '') + '</h1>' + renderExercise(ex);
    S.answer = null;
    S.checked = false;
    S.lastResult = null;
    resetFooter();
    wire(ex);
    autoPlay(ex);
    bindKeys(ex);
  }

  function autoPlay(ex) {
    var src = ex.audio || null;
    if (src && root.TLStore.get('settings.voice') !== false) {
      setTimeout(function () { if (S && current() === ex) speakable(src); }, 320);
    }
  }

  function speakable(o) {
    root.TLSpeech.speak(o.text, { lang: o.lang });
  }

  function renderExercise(ex) {
    switch (ex.type) {
      case 'choice': return renderChoice(ex);
      case 'listen': return renderListen(ex);
      case 'match': return renderMatch(ex);
      case 'tiles': return renderTiles(ex);
      case 'type': return renderType(ex);
      case 'speak': return renderSpeak(ex);
      default: return '<p class="muted">Unsupported exercise.</p>';
    }
  }

  function renderChoice(ex) {
    var h = '';
    if (ex.promptIsScript) {
      h += '<div class="prompt-card">' +
        '<div class="pc-main"><div class="pc-script">' + esc(ex.prompt) + '</div>' +
        (ex.promptSub ? '<div class="pc-roman">' + esc(ex.promptSub) + '</div>' : '') + '</div>' +
        '<button class="speak-btn" data-speak="' + esc(ex.prompt) + '">🔊</button>' +
        '</div>';
    } else {
      h += '<div class="prompt-card"><div class="pc-avatar">🗣️</div><div class="pc-main"><div class="pc-en">' + esc(ex.prompt) + '</div></div></div>';
    }
    h += '<div class="choices">';
    ex.options.forEach(function (o, n) {
      h += '<button class="choice" data-opt="' + esc(o.id) + '">' +
        '<span class="k">' + (n + 1) + '</span>' +
        '<span><span class="c-script">' + esc(o.label) + '</span>' +
        (o.sub ? '<div class="c-roman">' + esc(o.sub) + '</div>' : '') + '</span>' +
        '</button>';
    });
    h += '</div>';
    return h;
  }

  function renderListen(ex) {
    var h = '<div style="text-align:center;margin-bottom:22px">' +
      '<button class="speak-btn lg" data-speak-audio="1">🔊</button>' +
      '<div class="muted" style="margin-top:10px">Tap to hear it again</div></div>' +
      '<div class="choices">';
    ex.options.forEach(function (o, n) {
      h += '<button class="choice" data-opt="' + esc(o.id) + '">' +
        '<span class="k">' + (n + 1) + '</span><span class="c-script">' + esc(o.label) + '</span></button>';
    });
    return h + '</div>';
  }

  function renderMatch(ex) {
    var left = root.TLEx.shuffle(ex.pairs);
    var right = root.TLEx.shuffle(ex.pairs);
    var h = '<p class="q-sub">' + esc(ex.and || '') + '</p><div class="match-grid"><div>';
    left.forEach(function (p) {
      h += '<button class="choice" style="width:100%;margin-bottom:12px" data-ml="' + esc(p.id) + '">' +
        '<span class="c-script">' + esc(p.script) + '</span></button>';
    });
    h += '</div><div>';
    right.forEach(function (p) {
      h += '<button class="choice" style="width:100%;margin-bottom:12px" data-mr="' + esc(p.id) + '">' +
        '<span>' + esc(p.meaning) + '</span></button>';
    });
    return h + '</div></div>';
  }

  function renderTiles(ex) {
    S.tiles = { bank: ex.tiles.map(function (t, i) { return { t: t, i: i, used: false }; }), picked: [] };
    var h = '<div class="prompt-card"><div class="pc-avatar">🖋️</div><div class="pc-main"><div class="pc-en">' + esc(ex.prompt) + '</div></div>' +
      '<button class="speak-btn" data-speak="' + esc(ex.key) + '">🔊</button></div>';
    h += '<div class="tile-bank" id="tl-answer" style="border-bottom:2px solid #e5e5e5;padding-bottom:14px"></div>';
    h += '<div class="tile-src" id="tl-src"></div>';
    h += '<div style="margin-top:18px"><button class="btn ghost sm" id="tl-clear">Clear</button></div>';
    return h;
  }

  function repaintTiles() {
    var ans = document.getElementById('tl-answer');
    var src = document.getElementById('tl-src');
    if (!ans || !src) return;
    ans.innerHTML = S.tiles.picked.map(function (t) {
      return '<button class="tile" data-unpick="' + t.i + '">' + esc(t.t) + '</button>';
    }).join('');
    src.innerHTML = S.tiles.bank.map(function (b) {
      return '<button class="tile' + (b.used ? ' used' : '') + '" data-pick="' + b.i + '">' + esc(b.t) + '</button>';
    }).join('');
  }

  function renderType(ex) {
    return '<div class="prompt-card"><div class="pc-avatar">✍️</div><div class="pc-main"><div class="pc-en">' + esc(ex.prompt) + '</div></div>' +
      '<button class="speak-btn" data-speak="' + esc(ex.key) + '">🔊</button></div>' +
      '<textarea class="typebox" id="lsn-type" placeholder="Type in ' + esc(S.course.name) + ' or romanisation…" autocomplete="off" spellcheck="false"></textarea>' +
      '<div class="wrapflex" style="margin-top:12px">' +
      '<button class="btn ghost sm" id="lsn-nokeyboard">Can\'t type in ' + esc(S.course.name) + '?</button>' +
      '<button class="btn ghost sm" id="lsn-hint">💡 Hint</button>' +
      '</div>' +
      '<div id="lsn-fallback"></div>';
  }

  function renderSpeak(ex) {
    var supported = root.TLSpeech.recognitionSupported;
    return '<div class="prompt-card" style="flex-direction:column;align-items:center;text-align:center;gap:8px">' +
      '<div class="pc-avatar" style="font-size:54px">🎤</div>' +
      '<div class="pc-script" style="font-size:32px">' + esc(ex.text) + '</div>' +
      '<div class="pc-roman">' + esc(ex.roman) + '</div>' +
      '<div class="muted">' + esc(ex.meaning) + '</div>' +
      '<div class="wrapflex" style="margin-top:10px;justify-content:center">' +
      '<button class="speak-btn" data-speak="' + esc(ex.text) + '">🔊</button>' +
      (supported ? '<button class="btn blue" id="lsn-mic">🎤 Hold to speak</button>' : '') +
      '</div>' +
      (supported ? '<div class="muted tiny" id="lsn-heard">Tap the mic and say the sentence</div>'
        : '<div class="muted tiny">Speech recognition is not available in this browser — say it out loud, then press Check.</div>') +
      '</div>';
  }

  /* ---------------------------------------------------------------- wiring */
  function bindKeys(ex) {
    S.keyHandler = function (ev) {
      if (!S) return;
      if (ev.key === 'Enter') {
        if (ev.target && ev.target.tagName === 'TEXTAREA' && !ev.shiftKey && S.checked) return;
        if (ev.target && ev.target.tagName === 'TEXTAREA' && !S.checked) { ev.preventDefault(); onMainButton(); return; }
      }
      var n = parseInt(ev.key, 10);
      if (n >= 1 && n <= 4 && (ex.type === 'choice' || ex.type === 'listen')) {
        var opts = document.querySelectorAll('[data-opt]');
        if (opts[n - 1] && !S.checked) opts[n - 1].click();
      }
    };
    document.addEventListener('keydown', S.keyHandler);
  }

  function wire(ex) {
    var body = document.getElementById('lsn-body');

    /* speaker buttons */
    body.querySelectorAll('[data-speak]').forEach(function (b) {
      b.addEventListener('click', function () {
        root.TLSfx.play('tapSoft');
        root.TLSpeech.speak(b.getAttribute('data-speak'), { lang: S.course.speech });
      });
    });
    var big = body.querySelector('[data-speak-audio]');
    if (big) big.addEventListener('click', function () {
      root.TLSfx.play('tapSoft');
      speakable(ex.audio);
    });

    if (ex.type === 'choice' || ex.type === 'listen') {
      body.querySelectorAll('[data-opt]').forEach(function (b) {
        b.addEventListener('click', function () {
          if (S.checked) return;
          root.TLSfx.play('select');
          body.querySelectorAll('[data-opt]').forEach(function (x) { x.classList.remove('sel'); });
          b.classList.add('sel');
          S.answer = b.getAttribute('data-opt');
          setMainEnabled(true);
          /* auto-check for listening, like Duolingo does */
          if (ex.type === 'listen') setTimeout(function () { if (S && !S.checked) onMainButton(); }, 260);
        });
      });
    }

    if (ex.type === 'match') wireMatch(ex);
    if (ex.type === 'tiles') {
      repaintTiles();
      body.addEventListener('click', function (ev) {
        var pick = ev.target.closest('[data-pick]');
        var unpick = ev.target.closest('[data-unpick]');
        if (pick && !S.checked) {
          var idx = +pick.getAttribute('data-pick');
          var b = S.tiles.bank.filter(function (x) { return x.i === idx; })[0];
          if (!b || b.used) return;
          b.used = true;
          S.tiles.picked.push(b);
          root.TLSfx.play('tap');
          repaintTiles();
          updateTileAnswer();
        }
        if (unpick && !S.checked) {
          var i2 = +unpick.getAttribute('data-unpick');
          var hit = S.tiles.picked.filter(function (x) { return x.i === i2; })[0];
          if (!hit) return;
          hit.used = false;
          S.tiles.picked = S.tiles.picked.filter(function (x) { return x.i !== i2; });
          root.TLSfx.play('tapSoft');
          repaintTiles();
          updateTileAnswer();
        }
      });
      var clear = body.querySelector('#tl-clear');
      if (clear) clear.addEventListener('click', function () {
        S.tiles.picked = []; S.tiles.bank.forEach(function (b) { b.used = false; });
        root.TLSfx.play('tapSoft'); repaintTiles(); updateTileAnswer();
      });
      updateTileAnswer();
    }

    if (ex.type === 'type') {
      var ta = body.querySelector('#lsn-type');
      ta.addEventListener('input', function () { S.answer = ta.value; setMainEnabled(!!ta.value.trim()); });
      ta.focus();
      var fb = body.querySelector('#lsn-fallback');
      var bindFallback = function () {
        if (fb.dataset.bound) return;
        fb.dataset.bound = '1';
        fb.addEventListener('click', function (ev) {
          var a = ev.target.closest('[data-tt]'), b2 = ev.target.closest('[data-tt-un]');
          if (a) { var k = +a.getAttribute('data-tt'); S.typedTiles.picked.push(S.typedTiles.bank[k]); S.typedTiles.bank.splice(k, 1); root.TLSfx.play('tap'); paintFallback(fb, ta); }
          if (b2) { var j = +b2.getAttribute('data-tt-un'); S.typedTiles.bank.push(S.typedTiles.picked[j]); S.typedTiles.picked.splice(j, 1); root.TLSfx.play('tapSoft'); paintFallback(fb, ta); }
        });
      };
      body.querySelector('#lsn-nokeyboard').addEventListener('click', function () {
        root.TLSfx.play('tap');
        if (!S.typedTiles) {
          var chars = ex.reveal.script.split(' ');
          var bank = chars.slice();
          root.TLEx.shuffle(chars.slice()).forEach(function (c) { if (bank.length < 6) bank.push(c); });
          S.typedTiles = { bank: root.TLEx.shuffle(bank), picked: [] };
        }
        fb.innerHTML = '<div class="muted" style="margin-top:12px">Build the answer by tapping:</div>' +
          '<div class="tile-bank" id="tt-answer" style="border-bottom:2px solid #e5e5e5;min-height:50px"></div>' +
          '<div class="tile-src" id="tt-src"></div>';
        bindFallback();
        paintFallback(fb, ta);
      });
      body.querySelector('#lsn-hint').addEventListener('click', function () {
        root.TLSfx.play('tapSoft');
        root.TLUI.toast('First letter: ' + ex.reveal.script.charAt(0) + '  ·  ' + ex.reveal.roman);
      });
    }

    if (ex.type === 'speak') {
      var mic = body.querySelector('#lsn-mic');
      if (mic) mic.addEventListener('click', function () { doListen(ex, mic); });
    }
  }

  function updateTileAnswer() {
    /* only the joined string matters for grading */
    S.answer = S.tiles.picked.map(function (t) { return t.t; });
    setMainEnabled(S.tiles.picked.length > 0);
  }

  /* Repaint the "can't type?" tile fallback inside a type exercise. */
  function paintFallback(fb, ta) {
    var ans = fb.querySelector('#tt-answer'), src = fb.querySelector('#tt-src');
    if (!ans || !src || !S.typedTiles) return;
    ans.innerHTML = S.typedTiles.picked.map(function (t, k) {
      return '<button class="tile" data-tt-un="' + k + '">' + esc(t) + '</button>';
    }).join('');
    src.innerHTML = S.typedTiles.bank.map(function (t, k) {
      return '<button class="tile" data-tt="' + k + '">' + esc(t) + '</button>';
    }).join('');
    ta.value = S.typedTiles.picked.join(' ');
    S.answer = ta.value;
    setMainEnabled(!!ta.value.trim());
  }

  function wireMatch(ex) {
    var body = document.getElementById('lsn-body');
    S.matchState = { selLeft: null, selRight: null, done: 0, mistakes: 0, total: ex.pairs.length };
    function clearSel() {
      body.querySelectorAll('[data-ml],[data-mr]').forEach(function (x) { x.classList.remove('sel'); });
      S.matchState.selLeft = null; S.matchState.selRight = null;
    }
    body.addEventListener('click', function (ev) {
      if (S.checked) return;
      var l = ev.target.closest('[data-ml]'), r = ev.target.closest('[data-mr]');
      if (!l && !r) return;
      if (l) {
        if (l.classList.contains('done')) return;
        body.querySelectorAll('[data-ml]').forEach(function (x) { x.classList.remove('sel'); });
        l.classList.add('sel');
        S.matchState.selLeft = l;
        root.TLSfx.play('select');
      } else {
        if (r.classList.contains('done')) return;
        body.querySelectorAll('[data-mr]').forEach(function (x) { x.classList.remove('sel'); });
        r.classList.add('sel');
        S.matchState.selRight = r;
        root.TLSfx.play('select');
      }
      var sl = S.matchState.selLeft, sr = S.matchState.selRight;
      if (sl && sr) {
        if (sl.getAttribute('data-ml') === sr.getAttribute('data-mr')) {
          sl.classList.add('done'); sr.classList.add('done');
          sl.classList.remove('sel'); sr.classList.remove('sel');
          S.matchState.done++;
          S.matchState.selLeft = S.matchState.selRight = null;
          root.TLSfx.play('correct');
          if (S.matchState.done === S.matchState.total) {
            S.answer = S.matchState.mistakes === 0;
            if (!S.answer) S.matchState.mistakes = S.matchState.mistakes;
            setMainEnabled(true);
            S.answer = S.matchState.mistakes === 0;
            /* grade: any earlier mistake makes it a retry */
            S.matchWrong = S.matchState.mistakes > 0;
            S.answer = true;
            S.forcedWrong = S.matchWrong;
            setMainEnabled(true);
            onMainButton();
          }
        } else {
          root.TLSfx.play('wrong');
          var a = sl, b = sr;
          a.classList.add('bad'); b.classList.add('bad');
          setTimeout(function () { a.classList.remove('bad', 'sel'); b.classList.remove('bad', 'sel'); }, 620);
          S.matchState.selLeft = S.matchState.selRight = null;
          S.matchState.mistakes++;
        }
      }
    });
    setMainEnabled(false);
  }

  function doListen(ex, mic) {
    if (!root.TLSpeech.recognitionSupported) return;
    mic.textContent = '🎙️ Listening…';
    mic.classList.add('listening');
    var heard = document.getElementById('lsn-heard');
    var done = false;
    var stopper = root.TLSpeech.listen({
      lang: S.course.speech,
      onresult: function (alts) {
        done = true;
        heard.textContent = 'I heard: “' + alts[0] + '”';
        S.answer = { alts: alts, heard: alts[0] };
        setMainEnabled(true);
      },
      onerror: function (err) {
        done = true;
        heard.textContent = err === 'not-allowed' ? 'Microphone permission was blocked.' : 'I did not catch that — try again or press Check.';
        root.TLUI.toast('Microphone unavailable: ' + err);
      },
      onend: function () {
        mic.textContent = '🎤 Hold to speak';
        if (!done) heard.textContent = 'I did not catch that — try again.';
      }
    });
    setTimeout(function () { if (stopper) stopper.stop(); }, 6000);
  }

  /* --------------------------------------------------------------- footer */
  function setMainEnabled(on) {
    var b = document.getElementById('lsn-main');
    if (!b) return;
    if (S.checked) return;
    b.classList.toggle('disabled', !on);
    b.disabled = !on;
  }

  function resetFooter() {
    var foot = document.getElementById('lsn-foot');
    foot.className = 'lesson-foot';
    document.getElementById('lsn-fb').innerHTML = defaultFeedback();
    var acts = document.getElementById('lsn-acts');
    acts.innerHTML = '<button class="btn lg disabled" id="lsn-main">Check</button>';
    acts.querySelector('#lsn-main').addEventListener('click', onMainButton);
  }

  function defaultFeedback() {
    var lines = [
      'Learn a little every day. 🦉',
      'Take your time — tap the speaker as often as you like.',
      'Wrong answers are how the streak gets built.',
      'Say it out loud before you answer.'
    ];
    return '<div class="fb-body muted">' + rand(lines) + '</div>';
  }

  function onMainButton() {
    if (S.checked) { next(); return; }
    if (!S.answer && S.answer !== true) return;
    grade();
  }

  function grade() {
    var ex = current();
    var res = root.TLEx.check(ex, S.answer);
    if (ex.type === 'match' && S.forcedWrong) res.correct = false;

    S.checked = true;
    S.lastResult = res;
    root.TLStore.markWord(S.course.id, ex.itemId || '', res.correct);
    if (res.correct) root.TLStore.bumpQuest('words', 1);

    var foot = document.getElementById('lsn-foot');
    var fb = document.getElementById('lsn-fb');
    var acts = document.getElementById('lsn-acts');

    if (res.correct) {
      S.correct++;
      S.combo++;
      S.maxCombo = Math.max(S.maxCombo, S.combo);
      root.TLSfx.play(S.combo >= 3 && S.combo % 3 === 0 ? 'combo' : 'correct');
      root.TLUI.xpFloat((S.combo >= 5 ? '×2 ' : '') + '+1');
      foot.className = 'lesson-foot ok';
      fb.innerHTML =
        '<div class="badge">' + (S.combo >= 5 ? '🔥' : '🎉') + '</div>' +
        '<div class="fb-title">' + (S.combo >= 3 ? rand(PRAISE) + ' Combo ×' + S.combo : rand(PRAISE)) + '</div>' +
        '<div class="fb-body">' + esc(res.correct && ex.type === 'listen' ? ex.key : rand(['On to the next one!', 'Keep it up.', 'That is one more word learned.'])) + '</div>';
      acts.innerHTML =
        '<button class="btn explain lg" id="lsn-explain-foot">💡 Explain</button>' +
        '<button class="btn lg" id="lsn-main">Continue</button>';
    } else {
      S.wrong++;
      S.combo = 0;
      S.perfect = false;
      root.TLSfx.play('wrong');
      root.TLStore.loseHeart();
      S.hearts = root.TLStore.state.stats.hearts;
      S.mistakes.push({ q: ex.title, given: describeAnswer(ex, S.answer), key: res.expected });
      var correctText = res.expected;
      if (ex.type === 'choice' || ex.type === 'listen') {
        var co = ex.options.filter(function (o) { return o.correct; })[0];
        if (co) correctText = co.label + (co.sub ? ' (' + co.sub + ')' : '');
      }
      foot.className = 'lesson-foot no';
      fb.innerHTML =
        '<div class="badge">😢</div>' +
        '<div class="fb-title">' + rand(NUDGE) + '</div>' +
        '<div class="fb-body">Correct answer: <b>' + esc(correctText) + '</b>' +
        '<div class="muted tiny" style="margin-top:4px">' + rand(WRONG_LINES) + '</div>' +
        '<div id="lsn-why" class="tiny" style="margin-top:6px"></div></div>';
      acts.innerHTML =
        '<button class="btn explain lg" id="lsn-explain-foot">💡 Explain</button>' +
        '<button class="btn red lg" id="lsn-main">Got it</button>';
      autoWhy(ex, correctText);
      /* mark the right option green, chosen one red */
      markOptions(ex, S.answer);
    }
    var main = acts.querySelector('#lsn-main');
    main.disabled = false;
    main.classList.remove('disabled');
    main.addEventListener('click', onMainButton);
    wireExplainButtons();
    updateHearts();
    if (S.hearts <= 0) setTimeout(outOfHearts, 700);
  }

  function markOptions(ex, given) {
    var body = document.getElementById('lsn-body');
    if (ex.type === 'choice' || ex.type === 'listen') {
      ex.options.forEach(function (o) {
        var el = body.querySelector('[data-opt="' + o.id + '"]');
        if (!el) return;
        el.classList.remove('sel');
        if (o.correct) el.classList.add('good');
        else if (o.id === given) el.classList.add('bad');
      });
    }
    if (ex.type === 'tiles') {
      var ans = document.getElementById('tl-answer');
      if (ans) ans.innerHTML = '<button class="tile inbank" style="color:#58a700">' + esc(ex.target) + '</button>';
    }
  }

  function describeAnswer(ex, a) {
    if (a && typeof a === 'object') return a.heard || 'spoken answer';
    if (Array.isArray(a)) return a.join(' ');
    if (ex.type === 'choice' || ex.type === 'listen') {
      var o = ex.options.filter(function (x) { return x.id === a; })[0];
      return o ? o.label : String(a);
    }
    return String(a == null ? '' : a);
  }

  /* ---------------------------------------------------------- explainer */
  /* Every question can be explained — before answering (top bar button) and
     after answering (footer button). The payload adapts to the exercise. */
  function explainFor(ex) {
    if (ex.type === 'match') {
      var pairs = ex.pairs || [];
      var script = pairs.map(function (p) { return p.script; }).join('  ·  ');
      var roman = pairs.map(function (p) { return p.roman; }).join('  ·  ');
      var meaning = pairs.map(function (p) { return p.meaning; }).join('  ·  ');
      return {
        item: { script: script, roman: roman, en: meaning, hi: meaning },
        question: 'Explain each of these words and how to tell them apart.'
      };
    }
    var item = ex.explainItem || ex.reveal;
    var q;
    if (ex.type === 'listen') q = 'I have to recognise "' + ex.key + '" by ear. Explain the sounds and how to remember it.';
    else if (ex.type === 'tiles') q = 'Explain the word order and grammar of "' + ex.key + '".';
    else if (ex.type === 'type') q = 'Explain how "' + ex.key + '" is written — how do the letters build the sound?';
    else if (ex.type === 'speak') q = 'Explain how to pronounce "' + ex.text + '" naturally.';
    else q = 'Why does "' + ex.key + '" mean "' + ex.prompt + '"? Give me a way to remember it.';
    return { item: item, question: q };
  }

  function openQuestionExplain() {
    var ex = current();
    if (!ex || !S) return;
    root.TLSfx.play('tapSoft');
    var target = explainFor(ex);
    root.TLUI.openExplain(target.item, {
      courseId: S.course.id,
      question: target.question,
      title: ex.title,
      word: ex.key || ex.text || ''
    });
  }

  function wireExplainButtons() {
    var a = document.getElementById('lsn-explain-foot');
    if (a) a.addEventListener('click', openQuestionExplain);
  }

  /* When a real model is connected, drop a one-line diagnosis into the footer
     automatically. The full explainer stays one tap away in both engines. */
  function autoWhy(ex, correctText) {
    if (!root.TLAI.online) return;
    var slot = document.getElementById('lsn-why');
    if (!slot) return;
    slot.innerHTML = '<span class="muted">Asking the AI tutor…</span>';
    root.TLAI.whyWrong(ex.title + ' (' + (ex.prompt || ex.key || '') + ')', describeAnswer(ex, S.answer), correctText, S.course.id)
      .then(function (t) {
        var el = document.getElementById('lsn-why');
        if (el) el.innerHTML = t ? '💡 ' + t : '';
      });
  }

  function updateHearts() {
    var h = document.getElementById('lsn-hearts');
    if (h) h.innerHTML = (S.hearts > 0 ? '❤️' : '🤍') + ' <span>' + S.hearts + '</span>' +
      (S.combo >= 3 ? ' <span class="combo">🔥 ' + S.combo + '</span>' : '');
  }

  function next() {
    S.i++;
    if (S.keyHandler) document.removeEventListener('keydown', S.keyHandler);
    if (S.i >= S.lesson.exercises.length) return finish();
    render();
  }

  /* ------------------------------------------------------------ outcomes */
  function outOfHearts() {
    if (!S) return;
    var msg = '<div style="text-align:center">' +
      '<div style="font-size:64px">💔</div>' +
      '<h2>You ran out of hearts</h2>' +
      '<p class="muted">Hearts refill over time (one every 30 minutes), or you can refill them now.</p>' +
      '<div class="wrapflex" style="margin-top:16px;justify-content:center">' +
      '<button class="btn ghost" id="oh-quit">End lesson</button>' +
      '<button class="btn red" id="oh-refill">❤️ Refill for 350 💎</button>' +
      '</div></div>';
    var m = root.TLUI.modal(msg, { locked: true });
    m.querySelector('#oh-quit').addEventListener('click', function () { root.TLUI.closeModal(); exit(); });
    m.querySelector('#oh-refill').addEventListener('click', function () {
      if (root.TLStore.spendGems(350)) {
        root.TLStore.refillHearts();
        S.hearts = root.TLStore.state.stats.hearts;
        root.TLSfx.play('chest');
        root.TLUI.closeModal();
        updateHearts();
      } else {
        root.TLSfx.play('error');
        root.TLUI.toast('Not enough gems — you have ' + root.TLStore.state.stats.gems + ' 💎');
      }
    });
  }

  function finish() {
    if (!S || S.finished) return;
    S.finished = true;
    root.TLSfx.play('complete');
    var total = S.lesson.exercises.length;
    var acc = Math.round((S.correct / Math.max(1, total)) * 100);
    var bonus = S.perfect ? 5 : 0;
    var comboBonus = Math.floor(S.maxCombo / 5) * 2;
    var xp = Math.max(10, Math.round(S.correct * 1.2) + bonus + comboBonus);
    var timeMs = Date.now() - S.started;
    var prev = root.TLStore.lessonState(S.course.id, S.unit.id, S.index);
    var crownUp = prev.crowns === 0 || S.perfect;

    var out = root.TLStore.completeLesson({
      courseId: S.course.id, unitId: S.unit.id, index: S.index,
      correct: S.correct, wrong: S.wrong, total: total, xp: xp, timeMs: timeMs,
      combo: S.maxCombo, crownUp: crownUp
    });
    root.TLStore.addGems(S.perfect ? 10 : 5);
    var newAch = root.TLStore.checkAchievements();

    var body = document.getElementById('lsn-body');
    var mins = Math.floor(timeMs / 60000), secs = Math.round((timeMs % 60000) / 1000);
    body.innerHTML =
      '<div class="result">' +
        '<div class="big-emoji">' + (S.perfect ? '🏆' : '🎉') + '</div>' +
        '<h1>' + (S.perfect ? 'Perfect lesson!' : 'Lesson complete!') + '</h1>' +
        '<p class="muted">' + esc(S.course.name) + ' · Unit: ' + esc(S.unit.title) + '</p>' +
        '<div class="stat-row">' +
          '<div class="stat-box"><div class="sb-k">Total XP</div><div class="sb-v">' + xp + '</div></div>' +
          '<div class="stat-box"><div class="sb-k">Accuracy</div><div class="sb-v">' + acc + '%</div></div>' +
          '<div class="stat-box"><div class="sb-k">Time</div><div class="sb-v">' + mins + ':' + String(secs).padStart(2, '0') + '</div></div>' +
        '</div>' +
        (S.maxCombo >= 3 ? '<div class="chip yellow" style="margin-bottom:10px">🔥 Best combo: ' + S.maxCombo + '</div><br>' : '') +
        (crownUp ? '<div class="chip green" style="margin-bottom:10px">👑 Crown earned</div>' : '') +
        '<div class="chip blue" style="margin-bottom:10px">💎 +' + (S.perfect ? 10 : 5) + ' gems</div>' +
        '<div class="chip" style="margin-bottom:10px">🔥 ' + out.streak.streak + ' day streak</div>' +
        (newAch.length ? '<div class="card" style="margin-top:18px;text-align:left"><h3>New achievement</h3>' +
          newAch.map(function (a) { return '<div class="row ach on"><div class="a-ico">' + a.icon + '</div><div class="r-main"><div class="r-title">' + esc(a.label) + '</div><div class="r-sub">' + esc(a.desc) + '</div></div></div>'; }).join('') +
          '</div>' : '') +
        (S.mistakes.length ? '<div class="card" style="margin-top:18px;text-align:left"><h3>Review these</h3>' +
          S.mistakes.slice(0, 5).map(function (m) {
            return '<div class="row"><div class="r-emoji">🔁</div><div class="r-main"><div class="r-title">' + esc(m.key) + '</div><div class="r-sub">you said: ' + esc(m.given) + '</div></div>' +
              '<button class="btn ghost sm" data-rev="' + esc(m.key) + '">🔊</button></div>';
          }).join('') + '</div>' : '') +
      '</div>';

    body.querySelectorAll('[data-rev]').forEach(function (b) {
      b.addEventListener('click', function () {
        root.TLSpeech.speak(b.getAttribute('data-rev'), { lang: S.course.speech });
      });
    });

    if (crownUp && prev.crowns > 0) root.TLSfx.play('levelUp');
    document.getElementById('lsn-bar').style.width = '100%';
    var foot = document.getElementById('lsn-foot');
    foot.className = 'lesson-foot';
    document.getElementById('lsn-fb').innerHTML = '<div class="fb-body muted">Nice work — the daily goal counts this lesson.</div>';
    var acts = document.getElementById('lsn-acts');
    acts.innerHTML = '<button class="btn lg" id="lsn-done">Continue</button>';
    acts.querySelector('#lsn-done').addEventListener('click', exit);
    if (S.keyHandler) document.removeEventListener('keydown', S.keyHandler);
  }

  root.TLLesson = { start: start, get session() { return S; } };
})(window);
