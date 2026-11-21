/* Bhasha — Explore: live content from free web APIs + games + mastery map.
   Free sources used (no keys):
     • Tatoeba     — example sentences (bundled cache refreshed daily by tools/update-content.mjs,
                     plus live search through a public CORS relay when you search a word)
     • Wikipedia   — random article summaries in Tamil / Telugu / Gujarati (REST API, CORS-enabled)
     • Wiktionary  — dictionary look-ups via the MediaWiki API
     • Google Translate TTS — fallback voice when the device has no native voice (see speech.js) */
(function (root) {
  'use strict';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var T3 = { ta: 'tam', te: 'tel', gu: 'guj' };
  var running = null;   /* cleanup fn of the active game */

  function course() { return TLData.courses[TLStore.get('profile.course')]; }
  function base() { return TLStore.get('profile.base'); }
  function gloss(w) { return TLData.gloss(w, base()); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.random() * (i + 1) | 0, t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function words() {
    var c = course(), out = [];
    c.units.forEach(function (u, i) { if (i > 0) out = out.concat(u.items); });
    return out.filter(function (w) { return w.script && w.hi.indexOf('अक्षर') !== 0; });
  }
  function say(t, slow) { TLSpeech.speak(t, { lang: course().speech, slow: slow }); }
  function sfx(n) { TLSfx.play(n); }
  function reward(xp, why) {
    TLStore.addXp(xp, course().id); TLStore.addGems(Math.round(xp / 5));
    if (root.TLUI) TLUI.toast('+' + xp + ' XP · ' + why);
  }

  /* ================================================================ LIVE DATA */
  function cacheKey(k) { return 'bhasha.live.' + k; }
  function getCache(k, ttl) {
    try { var o = JSON.parse(localStorage.getItem(cacheKey(k))); if (o && Date.now() - o.t < ttl) return o.v; } catch (e) {}
    return null;
  }
  function setCache(k, v) { try { localStorage.setItem(cacheKey(k), JSON.stringify({ t: Date.now(), v: v })); } catch (e) {} }

  function getJSON(url, relay) {
    var tryDirect = fetch(url).then(function (r) { if (!r.ok) throw 0; return r.json(); });
    if (!relay) return tryDirect;
    return tryDirect.catch(function () {
      return fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent(url)).then(function (r) { if (!r.ok) throw 0; return r.json(); });
    });
  }

  function bundled(id) {
    var c = root.TLLiveCache;
    return c && c.sentences && c.sentences[id] ? c.sentences[id] : [];
  }
  function updatedAt() { var c = root.TLLiveCache; return c && c.updated ? new Date(c.updated).toLocaleDateString() : ''; }

  function tatoebaSearch(id, q) {
    var tat = T3[id];
    var url = 'https://tatoeba.org/en/api_v0/search?from=eng&to=' + tat + '&query=' + encodeURIComponent(q) + '&trans_filter=limit&trans_to=' + tat;
    return getJSON(url, true).then(function (j) {
      var out = [];
      (j.results || []).forEach(function (r) {
        var all = [].concat.apply([], r.translations || []);
        var tr = all.filter(function (t) { return t.lang === tat; })[0];
        var hi = all.filter(function (t) { return t.lang === 'hin'; })[0];
        if (tr) out.push({ id: tr.id, en: r.text, hi: hi ? hi.text : '', t: tr.text, w: q });
      });
      return out;
    });
  }

  function wikiRandom(id) {
    return getJSON('https://' + id + '.wikipedia.org/api/rest_v1/page/random/summary').then(function (j) {
      return { title: j.title, extract: j.extract, thumb: j.thumbnail && j.thumbnail.source, url: j.content_urls && j.content_urls.desktop && j.content_urls.desktop.page };
    });
  }
  function wiktionary(id, term) {
    var url = 'https://en.wiktionary.org/w/api.php?action=query&list=search&srsearch=' + encodeURIComponent(term) + '&srlimit=3&format=json&origin=*';
    return getJSON(url).then(function (j) { return (j.query && j.query.search) || []; });
  }

  /* ================================================================ HUB */
  var TILES = [
    { id: 'safari', icon: '🧭', t: 'Sentence Safari', d: 'Real sentences from real people. Refreshed daily.', live: true, c: '#1cb0f6' },
    { id: 'wiki', icon: '📰', t: 'Wiki Wander', d: 'Random articles in your language. Read, listen, get lost.', live: true, c: '#ce82ff' },
    { id: 'sounds', icon: '🌺', t: 'Sound Garden', d: 'Tap every letter and hear it bloom.', c: '#ff86d0' },
    { id: 'rain', icon: '🌧️', t: 'Word Rain', d: 'Catch the right meaning before it hits the ground.', game: true, c: '#14d4f4' },
    { id: 'flip', icon: '🂴', t: 'Memory Flip', d: 'Match script to meaning. Hear each card.', game: true, c: '#ff9600' },
    { id: 'blitz', icon: '⚡', t: '60-Second Blitz', d: 'Fast quiz. Chain a combo, earn gems.', game: true, c: '#ffc800' },
    { id: 'cards', icon: '🗂️', t: 'Smart Flashcards', d: 'Weakest words first. Teach the deck what you know.', c: '#58cc02' },
    { id: 'dojo', icon: '🎧', t: 'Dictation Dojo', d: 'Hear it. Type it. No peeking.', game: true, c: '#ff4b4b' },
    { id: 'lookup', icon: '🔎', t: 'Lookup Lab', d: 'Search any English word for live sentences + dictionary.', live: true, c: '#4dd0a1' },
    { id: 'mastery', icon: '🏆', t: 'Mastery Map', d: 'See exactly what you know — and what is next.', c: '#a568cc' }
  ];

  function hub() {
    var T = TLI18n.t;
    return '<div class="xp-hero"><div class="xp-hero-t"><h1>' + esc(T('exploreTitle')) + '</h1><p>' + esc(T('exploreSub')) + '</p></div>' +
      '<div class="xp-orbit" aria-hidden="true"><span>அ</span><span>అ</span><span>અ</span><span>अ</span></div></div>' +
      '<div class="xp-grid">' + TILES.map(function (t, i) {
        return '<a class="xp-tile" href="#/explore/' + t.id + '" style="--c:' + t.c + ';--d:' + (i * 60) + 'ms">' +
          '<div class="xp-ic">' + t.icon + '</div><div class="xp-tt">' + esc(t.t) + '</div><div class="xp-dd">' + esc(t.d) + '</div>' +
          (t.live ? '<span class="xp-badge live">' + esc(T('live')) + '</span>' : (t.game ? '<span class="xp-badge">GAME</span>' : '')) + '</a>';
      }).join('') + '</div>';
  }

  function shell(title, body, extra) {
    return '<a class="xp-back" href="#/explore">' + esc(TLI18n.t('back')) + '</a>' +
      '<h1 class="q-title" style="margin:6px 0 4px">' + title + '</h1>' + (extra || '') + '<div id="xp-stage">' + body + '</div>';
  }

  /* ================================================================ PAGES */
  function page(sub) {
    if (!sub) return hub();
    var t = TILES.filter(function (x) { return x.id === sub; })[0];
    if (!t) return hub();
    var title = t.icon + ' ' + esc(t.t);
    switch (sub) {
      case 'safari': return shell(title, '<div class="muted">Loading…</div>', '<p class="muted">' + esc(course().name) + ' sentences from Tatoeba' + (updatedAt() ? ' · batch of ' + updatedAt() : '') + '. Tap a card to reveal, 🐢 for slow audio.</p>');
      case 'wiki': return shell(title, '<div class="muted">Fetching an article…</div>', '<p class="muted">Live from ' + esc(course().id) + '.wikipedia.org — a fresh random article every tap.</p>');
      case 'lookup': return shell(title, '<form class="xp-search" id="lk-form"><input id="lk-q" placeholder="Type an English word, e.g. river" autocomplete="off"><button class="btn sm">Search</button></form><div id="lk-out" class="muted" style="margin-top:12px">Results come live from Tatoeba and Wiktionary.</div>');
      case 'sounds': return shell(title, '<div id="sg"></div>', '<p class="muted">Every letter of ' + esc(course().name) + '. Tap to hear. Try the mystery round when ready.</p>');
      case 'mastery': return shell(title, masteryHtml());
      default: return shell(title, '<div id="game"></div>');
    }
  }

  /* ================================================================ WIRE */
  function wire(sub) {
    if (running) { running(); running = null; }
    if (!sub) return;
    var fn = { safari: safari, wiki: wiki, lookup: lookup, sounds: sounds, rain: rain, flip: flip, blitz: blitz, cards: cards, dojo: dojo, mastery: masteryWire }[sub];
    if (fn) running = fn() || null;
  }

  /* ----------------------------------------------------------- Safari */
  function sentenceCard(s, i) {
    var b = base();
    var tr = b === 'hi' ? (s.hi || s.en) : (b === 'hg' ? (s.hi ? TLData.translit(s.hi) : s.en) : s.en);
    return '<div class="xp-sent" data-i="' + i + '"><div class="xs-top"><div class="xs-t">' + esc(s.t) + '</div>' +
      '<div class="xs-btns"><button data-say="' + i + '" title="Listen">🔊</button><button data-slow="' + i + '" title="Slow">🐢</button></div></div>' +
      '<div class="xs-tr">' + esc(tr) + '</div><div class="xs-hint">tap to reveal · keyword: ' + esc(s.w || '') + '</div></div>';
  }
  function safari() {
    var stage = $('#xp-stage'), list = [], page = 0;
    function draw() {
      var chunk = list.slice(page * 8, page * 8 + 8);
      stage.innerHTML = chunk.length ? chunk.map(sentenceCard).join('') +
        '<div class="wrapflex" style="margin-top:14px"><button class="btn" id="sf-more">' + esc(TLI18n.t('refresh')) + ' ↻</button></div>' +
        '<p class="muted tiny" style="margin-top:10px">Sentences: <a href="https://tatoeba.org" target="_blank" rel="noopener">Tatoeba.org</a> contributors, CC BY 2.0 FR.</p>'
        : '<div class="card">No sentences cached for this course yet. Try Lookup Lab.</div>';
      $$('.xp-sent', stage).forEach(function (el) {
        var s = chunk[+el.dataset.i];
        el.addEventListener('click', function (e) {
          if (e.target.closest('button')) return;
          el.classList.toggle('open'); sfx('tapSoft'); say(s.t);
        });
      });
      $$('[data-say]', stage).forEach(function (b) { b.addEventListener('click', function () { say(chunk[+b.dataset.say].t); }); });
      $$('[data-slow]', stage).forEach(function (b) { b.addEventListener('click', function () { say(chunk[+b.dataset.slow].t, true); }); });
      var more = $('#sf-more', stage);
      if (more) more.addEventListener('click', function () {
        sfx('whoosh'); page++; if (page * 8 >= list.length) { list = shuffle(list); page = 0; } draw(); window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
    list = shuffle(bundled(course().id).slice());
    /* Top up with a live search of a random word you know, when the relay is reachable. */
    var seed = shuffle(words())[0];
    draw();
    if (seed && /^[a-z ]{3,}$/i.test(seed.en)) {
      tatoebaSearch(course().id, seed.en).then(function (more) {
        var have = {}; list.forEach(function (x) { have[x.id] = 1; });
        var add = more.filter(function (x) { return !have[x.id]; });
        if (add.length) { list = add.concat(list); page = 0; draw(); }
      }).catch(function () {});
    }
  }

  /* ------------------------------------------------------------- Wiki */
  function wiki() {
    var stage = $('#xp-stage');
    function load() {
      stage.innerHTML = '<div class="xp-skel"></div>';
      wikiRandom(course().id).then(function (a) {
        stage.innerHTML = '<div class="card xp-wiki">' + (a.thumb ? '<img src="' + esc(a.thumb) + '" alt="" loading="lazy">' : '') +
          '<h2 class="xw-t">' + esc(a.title) + ' <button class="iconbtn" id="xw-say" title="Listen">🔊</button></h2>' +
          '<p class="xw-x">' + esc(a.extract) + '</p>' +
          '<div class="wrapflex"><button class="btn sm" id="xw-read">🔊 Read aloud</button><button class="btn sm ghost" id="xw-next">Another ↻</button>' +
          (a.url ? '<a class="btn sm ghost" target="_blank" rel="noopener" href="' + esc(a.url) + '">Open</a>' : '') + '</div>' +
          '<p class="muted tiny" style="margin-top:8px">Text from Wikipedia, CC BY-SA.</p></div>';
        $('#xw-say').addEventListener('click', function () { say(a.title); });
        $('#xw-read').addEventListener('click', function () { say(a.extract.split(/[.।]/)[0]); });
        $('#xw-next').addEventListener('click', function () { sfx('whoosh'); load(); });
      }).catch(function () {
        stage.innerHTML = '<div class="card">Couldn’t reach Wikipedia. Check your connection. <button class="btn sm" id="xw-retry">Retry</button></div>';
        $('#xw-retry').addEventListener('click', load);
      });
    }
    load();
  }

  /* ----------------------------------------------------------- Lookup */
  function lookup() {
    var form = $('#lk-form'), out = $('#lk-out');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = $('#lk-q').value.trim(); if (!q) return;
      out.innerHTML = '<div class="xp-skel"></div>';
      var id = course().id;
      Promise.all([tatoebaSearch(id, q).catch(function () { return null; }), wiktionary(id, q).catch(function () { return []; })]).then(function (r) {
        var s = r[0], d = r[1], html = '';
        if (s === null) html += '<div class="card">Live sentence search is offline right now (the free relay is busy). Showing matching cached sentences instead.</div>';
        var rows = s || bundled(id).filter(function (x) { return x.en.toLowerCase().indexOf(q.toLowerCase()) > -1; });
        html += rows.length ? rows.slice(0, 8).map(sentenceCard).join('') : '<div class="card">No sentences found for “' + esc(q) + '”.</div>';
        if (d.length) html += '<h3 style="margin:16px 0 6px">Wiktionary</h3>' + d.map(function (x) {
          return '<a class="xp-wk" target="_blank" rel="noopener" href="https://en.wiktionary.org/wiki/' + encodeURIComponent(x.title) + '"><b>' + esc(x.title) + '</b><span>' + x.snippet.replace(/<[^>]+>/g, '') + '</span></a>';
        }).join('');
        out.innerHTML = html;
        $$('.xp-sent', out).forEach(function (el, i) {
          el.addEventListener('click', function (e) { if (e.target.closest('button')) return; el.classList.toggle('open'); say(rows[i].t); });
          $$('[data-say]', el).forEach(function (b) { b.addEventListener('click', function () { say(rows[i].t); }); });
          $$('[data-slow]', el).forEach(function (b) { b.addEventListener('click', function () { say(rows[i].t, true); }); });
        });
      });
    });
  }

  /* ----------------------------------------------------- Sound Garden */
  function sounds() {
    var c = course(), L = c.scriptInfo.letters, el = $('#sg');
    var hues = [100, 200, 280, 40, 340, 170];
    el.innerHTML = '<div class="sg-grid">' + L.map(function (l, i) {
      return '<button class="sg-bloom" data-i="' + i + '" style="--h:' + hues[i % 6] + '"><b>' + esc(l[0]) + '</b><small>' + esc(l[1]) + '</small></button>';
    }).join('') + '</div><div class="sg-info" id="sg-info">Tap a letter…</div>' +
      '<div class="wrapflex" style="margin-top:14px"><button class="btn" id="sg-quiz">🎲 Mystery round</button></div><div id="sg-q"></div>';
    $$('.sg-bloom', el).forEach(function (b) {
      b.addEventListener('click', function () {
        var l = L[+b.dataset.i]; say(l[0]); sfx('select');
        b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
        $('#sg-info').innerHTML = '<b style="font-size:28px">' + esc(l[0]) + '</b> — <b>' + esc(l[1]) + '</b> · ' + esc(l[2] || '');
      });
    });
    $('#sg-quiz').addEventListener('click', function () {
      var ans = L[Math.random() * L.length | 0], opts = shuffle([ans].concat(shuffle(L.filter(function (x) { return x !== ans; })).slice(0, 3)));
      say(ans[0]);
      $('#sg-q').innerHTML = '<div class="card" style="margin-top:12px"><div class="r-title">Which letter did you hear? <button class="iconbtn" id="sgq-say">🔊</button></div><div class="wrapflex" style="margin-top:10px">' +
        opts.map(function (o) { return '<button class="choice-lg" data-v="' + esc(o[0]) + '">' + esc(o[0]) + '</button>'; }).join('') + '</div></div>';
      $('#sgq-say').addEventListener('click', function () { say(ans[0]); });
      $$('#sg-q .choice-lg').forEach(function (b) {
        b.addEventListener('click', function () {
          var ok = b.dataset.v === ans[0]; sfx(ok ? 'correct' : 'wrong'); b.classList.add(ok ? 'ok' : 'bad');
          if (ok) { reward(3, 'sharp ears'); setTimeout(function () { $('#sg-quiz').click(); }, 900); }
        });
      });
    });
  }

  /* -------------------------------------------------------- Word Rain */
  function rain() {
    var game = $('#game'), pool = words(), W, score = 0, lives = 3, cur, bubbles = [], raf, last = 0, speed = 38, alive = true, spawnT = 0;
    game.innerHTML = '<div class="gm-hud"><span id="r-s">Score 0</span><span id="r-l">❤️❤️❤️</span></div>' +
      '<div class="gm-prompt" id="r-p"></div><div class="rain-field" id="rf"></div>' +
      '<p class="muted tiny">Tap the meaning that matches the word at the top.</p>';
    var rf = $('#rf');
    function next() {
      cur = pool[Math.random() * pool.length | 0];
      $('#r-p').innerHTML = '<b>' + esc(cur.script) + '</b><small>' + esc(cur.roman) + '</small> <button class="iconbtn" id="r-say">🔊</button>';
      $('#r-say').onclick = function () { say(cur.script); };
      say(cur.script);
      bubbles.forEach(function (b) { b.el.remove(); }); bubbles = [];
      var opts = shuffle([cur].concat(shuffle(pool.filter(function (x) { return gloss(x) !== gloss(cur); })).slice(0, 3)));
      W = rf.clientWidth;
      opts.forEach(function (o, i) {
        var el = document.createElement('button'); el.className = 'rain-b'; el.textContent = gloss(o);
        el.style.left = (4 + i * 24) + '%'; el.style.top = '0px'; el.style.transform = 'translateY(' + (-20 - i * 55) + 'px)';
        var b = { el: el, y: -20 - i * 55, ok: o === cur }; bubbles.push(b); rf.appendChild(el);
        el.onclick = function () { hit(b); };
      });
    }
    function hit(b) {
      if (!alive) return;
      if (b.ok) { score++; sfx('correct'); markW(cur, true); speed += 3; $('#r-s').textContent = 'Score ' + score; next(); }
      else miss(b);
    }
    function miss(b) {
      sfx('wrong'); lives--; markW(cur, false); b.el.classList.add('boom');
      $('#r-l').textContent = '❤️'.repeat(Math.max(0, lives)) + '🖤'.repeat(3 - Math.max(0, lives));
      if (lives <= 0) return over();
      if (b.ok) next();
    }
    function over() {
      alive = false; sfx('gameOver'); cancelAnimationFrame(raf);
      var xp = score * 3; if (xp) reward(xp, 'Word Rain');
      game.innerHTML = '<div class="card gm-end"><div style="font-size:54px">🌧️</div><h2>Score: ' + score + '</h2><p class="muted">+' + xp + ' XP</p><button class="btn" id="r-again">Play again</button></div>';
      $('#r-again').onclick = function () { wire('rain'); };
    }
    function loop(t) {
      if (!alive) return; var dt = Math.min(0.05, (t - last) / 1000 || 0); last = t;
      var H = rf.clientHeight;
      bubbles.forEach(function (b) {
        b.y += speed * dt; b.el.style.transform = 'translateY(' + b.y + 'px)';
        if (b.y > H - 44 && !b.gone) { b.gone = true; if (b.ok) miss(b); else b.el.style.opacity = 0.2; }
      });
      raf = requestAnimationFrame(loop);
    }
    next(); raf = requestAnimationFrame(loop);
    return function () { alive = false; cancelAnimationFrame(raf); };
  }
  function markW(w, ok) { try { TLStore.markWord(course().id, w.id, ok); } catch (e) {} }

  /* ------------------------------------------------------ Memory Flip */
  function flip() {
    var game = $('#game'), pool = shuffle(words()).slice(0, 6), moves = 0, open = [], found = 0, lock = false;
    var cards = [];
    pool.forEach(function (w) { cards.push({ w: w, k: 's', txt: w.script, sub: w.roman }); cards.push({ w: w, k: 'g', txt: gloss(w), sub: '' }); });
    cards = shuffle(cards);
    game.innerHTML = '<div class="gm-hud"><span id="f-m">Moves 0</span><span>Pairs 0/6</span></div><div class="flip-grid">' +
      cards.map(function (c, i) { return '<button class="flip-c" data-i="' + i + '"><span class="fc-in"><span class="fc-f">?</span><span class="fc-b ' + c.k + '">' + esc(c.txt) + '<small>' + esc(c.sub) + '</small></span></span></button>'; }).join('') + '</div>';
    $$('.flip-c', game).forEach(function (el) {
      el.addEventListener('click', function () {
        var i = +el.dataset.i, c = cards[i];
        if (lock || el.classList.contains('on') || el.classList.contains('done')) return;
        el.classList.add('on'); sfx('tapSoft'); if (c.k === 's') say(c.w.script);
        open.push({ el: el, c: c });
        if (open.length === 2) {
          moves++; $('#f-m').textContent = 'Moves ' + moves; lock = true;
          var a = open[0], b = open[1];
          if (a.c.w === b.c.w && a.c.k !== b.c.k) {
            setTimeout(function () { a.el.classList.add('done'); b.el.classList.add('done'); sfx('correct'); markW(a.c.w, true); found++; lock = false; open = [];
              game.querySelector('.gm-hud span:last-child').textContent = 'Pairs ' + found + '/6';
              if (found === 6) { sfx('complete'); var xp = Math.max(10, 40 - moves * 2); reward(xp, 'cleared in ' + moves + ' moves'); } }, 450);
          } else setTimeout(function () { a.el.classList.remove('on'); b.el.classList.remove('on'); sfx('tick'); lock = false; open = []; }, 900);
        }
      });
    });
  }

  /* ------------------------------------------------------ 60s Blitz */
  function blitz() {
    var game = $('#game'), pool = words(), time = 60, score = 0, combo = 0, q, iv, alive = true;
    game.innerHTML = '<div class="gm-hud"><span id="b-t">⏱ 60</span><span id="b-s">0 pts</span><span id="b-c"></span></div>' +
      '<div class="gm-bar"><i id="b-bar"></i></div><div class="gm-prompt" id="b-p"></div><div id="b-o" class="blitz-opts"></div>';
    function ask() {
      var w = pool[Math.random() * pool.length | 0], toScript = Math.random() < 0.5;
      var dist = shuffle(pool.filter(function (x) { return x !== w; })).slice(0, 3), opts = shuffle([w].concat(dist));
      q = { w: w, toScript: toScript };
      $('#b-p').innerHTML = toScript ? '<small>What is this in ' + esc(course().name) + '?</small><b>' + esc(gloss(w)) + '</b>' : '<b>' + esc(w.script) + '</b><small>' + esc(w.roman) + '</small>';
      if (!toScript) say(w.script);
      $('#b-o').innerHTML = opts.map(function (o) { return '<button class="choice-lg" data-id="' + o.id + '">' + esc(toScript ? o.script : gloss(o)) + '</button>'; }).join('');
      $$('#b-o button').forEach(function (b) {
        b.onclick = function () {
          if (!alive) return; var ok = b.dataset.id === w.id;
          if (ok) { combo++; score += 10 + Math.min(combo, 10) * 2; sfx(combo > 4 ? 'combo' : 'correct'); time = Math.min(60, time + 1); }
          else { combo = 0; time = Math.max(0, time - 3); sfx('wrong'); }
          markW(w, ok);
          $('#b-s').textContent = score + ' pts'; $('#b-c').textContent = combo > 1 ? '🔥 x' + combo : '';
          ask();
        };
      });
    }
    function end() {
      alive = false; clearInterval(iv); sfx('complete');
      var xp = Math.round(score / 6); reward(xp, 'Blitz');
      game.innerHTML = '<div class="card gm-end"><div style="font-size:54px">⚡</div><h2>' + score + ' points</h2><p class="muted">+' + xp + ' XP</p><button class="btn" id="b-again">Go again</button></div>';
      $('#b-again').onclick = function () { wire('blitz'); };
    }
    iv = setInterval(function () {
      time -= 1; $('#b-t').textContent = '⏱ ' + Math.max(0, time); $('#b-bar').style.width = (time / 60 * 100) + '%';
      if (time <= 0) end();
    }, 1000);
    ask();
    return function () { alive = false; clearInterval(iv); };
  }

  /* ------------------------------------------------- Smart flashcards */
  function cards() {
    var game = $('#xp-stage'), c = course(), st = TLStore.course(c.id).words || {};
    var deck = words().sort(function (a, b) { return ((st[a.id] || { strength: 0 }).strength) - ((st[b.id] || { strength: 0 }).strength); }).slice(0, 15);
    var i = 0, sh = false;
    function draw() {
      if (i >= deck.length) {
        game.innerHTML = '<div class="card gm-end"><div style="font-size:54px">🎉</div><h2>Deck complete</h2><button class="btn" id="c-again">New deck</button></div>';
        reward(15, 'deck finished'); $('#c-again').onclick = function () { wire('cards'); return false; }; return;
      }
      var w = deck[i], s = st[w.id] || { strength: 0 };
      game.innerHTML = '<div class="gm-bar"><i style="width:' + (i / deck.length * 100) + '%"></i></div>' +
        '<div class="fcard" id="fc"><div class="fc-front"><b>' + esc(w.script) + '</b><small>' + esc(w.roman) + '</small></div>' +
        '<div class="fc-back"><b>' + esc(gloss(w)) + '</b><small>strength ' + Math.round(s.strength * 100) + '%</small></div></div>' +
        '<div class="wrapflex" style="justify-content:center;margin-top:14px"><button class="btn ghost sm" id="c-say">🔊</button><button class="btn ghost sm" id="c-slow">🐢</button></div>' +
        '<div class="wrapflex" style="justify-content:center;margin-top:12px" id="c-act"><button class="btn" id="c-flip">Flip</button></div>';
      sh = false; say(w.script);
      $('#c-say').onclick = function () { say(w.script); };
      $('#c-slow').onclick = function () { say(w.script, true); };
      function reveal() {
        if (sh) return; sh = true; $('#fc').classList.add('flipped'); sfx('tapSoft');
        $('#c-act').innerHTML = '<button class="btn red" id="c-no">Again</button><button class="btn" id="c-yes">Knew it</button>';
        $('#c-no').onclick = function () { markW(w, false); sfx('wrong'); deck.push(w); i++; draw(); };
        $('#c-yes').onclick = function () { markW(w, true); sfx('correct'); i++; draw(); };
      }
      $('#c-flip').onclick = reveal; $('#fc').onclick = reveal;
    }
    draw();
  }

  /* ----------------------------------------------------- Dictation Dojo */
  function dojo() {
    var game = $('#game'), pool = words(), score = 0, round = 0, N = 8, w;
    function norm(s) { return String(s).toLowerCase().replace(/[^a-z஀-௿ఀ-౿઀-૿]/g, ''); }
    function draw() {
      if (round >= N) { var xp = score * 4; reward(xp, 'Dojo'); game.innerHTML = '<div class="card gm-end"><div style="font-size:54px">🥋</div><h2>' + score + ' / ' + N + '</h2><p class="muted">+' + xp + ' XP</p><button class="btn" id="d-again">Train again</button></div>'; $('#d-again').onclick = function () { wire('dojo'); }; return; }
      w = pool[Math.random() * pool.length | 0]; round++;
      game.innerHTML = '<div class="gm-hud"><span>Round ' + round + '/' + N + '</span><span>' + score + ' pts</span></div>' +
        '<div class="card" style="text-align:center"><button class="btn" id="d-say">🔊 Play</button> <button class="btn ghost" id="d-slow">🐢 Slow</button>' +
        '<p class="muted">Type what you hear — in script or in English letters (romanisation).</p>' +
        '<form id="d-f" class="xp-search"><input id="d-i" autocomplete="off" placeholder="Type here…"><button class="btn sm">Check</button></form><div id="d-r"></div></div>';
      $('#d-say').onclick = function () { say(w.script); }; $('#d-slow').onclick = function () { say(w.script, true); };
      say(w.script); $('#d-i').focus();
      $('#d-f').onsubmit = function (e) {
        e.preventDefault(); var v = norm($('#d-i').value); if (!v) return;
        var ok = v === norm(w.script) || v === norm(w.roman) || (norm(w.roman).length > 3 && TLSpeech.similar(v, w.roman) >= 0.9);
        sfx(ok ? 'correct' : 'wrong'); markW(w, ok); if (ok) score++;
        $('#d-r').innerHTML = '<div class="gm-fb ' + (ok ? 'ok' : 'bad') + '"><b>' + esc(w.script) + '</b> · ' + esc(w.roman) + ' · ' + esc(gloss(w)) + '</div><button class="btn" id="d-n" style="margin-top:10px">Next</button>';
        $('#d-i').disabled = true; $('#d-n').onclick = draw; $('#d-n').focus();
      };
    }
    draw();
  }

  /* --------------------------------------------------------- Mastery */
  var LEVELS = [
    { n: 'Newcomer', at: 0, e: '🌱' }, { n: 'Traveller', at: 0.12, e: '🧳' }, { n: 'Chatter', at: 0.35, e: '💬' },
    { n: 'Storyteller', at: 0.6, e: '📖' }, { n: 'Fluent', at: 0.82, e: '🔥' }, { n: 'Master', at: 0.95, e: '👑' }
  ];
  function masteryData() {
    var c = course(), st = TLStore.course(c.id), W = st.words || {}, total = 0, sum = 0, units = [];
    c.units.forEach(function (u) {
      var s = 0; u.items.forEach(function (w) { s += (W[w.id] || { strength: 0 }).strength; });
      units.push({ u: u, pct: u.items.length ? s / u.items.length : 0, words: u.items });
      total += u.items.length; sum += s;
    });
    var pct = total ? sum / total : 0, lvl = 0;
    LEVELS.forEach(function (l, i) { if (pct >= l.at) lvl = i; });
    return { pct: pct, units: units, lvl: lvl, W: W, xp: st.xp || 0 };
  }
  function masteryHtml() {
    var m = masteryData(), L = LEVELS[m.lvl], nx = LEVELS[m.lvl + 1];
    var weak = [];
    m.units.forEach(function (x) { x.words.forEach(function (w) { var s = (m.W[w.id] || { strength: 0, wrong: 0 }); if (s.wrong > 0 && s.strength < 0.5) weak.push(w); }); });
    var advice = !m.xp ? 'Start with Unit 1 — Sounds & Script. Letters first, everything else gets easier.' :
      m.pct < 0.35 ? 'Daily 10 minutes beats weekend marathons. Try Smart Flashcards after each lesson.' :
      m.pct < 0.8 ? 'Time to speak: use Dictation Dojo and Sentence Safari to hear full sentences.' :
      'You are close. Read Wiki Wander articles aloud and chat with the AI Tutor in ' + esc(course().name) + '.';
    return '<div class="card ms-hero"><div class="ms-badge">' + L.e + '</div><div><div class="ms-lvl">' + esc(L.n) + '</div>' +
      '<div class="muted">' + Math.round(m.pct * 100) + '% of ' + esc(course().name) + ' mastered' + (nx ? ' · next: ' + nx.e + ' ' + esc(nx.n) + ' at ' + Math.round(nx.at * 100) + '%' : '') + '</div>' +
      '<div class="gm-bar"><i style="width:' + Math.round(m.pct * 100) + '%"></i></div></div></div>' +
      '<div class="card" style="margin-top:14px"><b>Your next move</b><p class="muted" style="margin:6px 0 0">' + advice + '</p></div>' +
      '<h3 style="margin:18px 0 8px">Unit heatmap</h3><div class="ms-units">' + m.units.map(function (x) {
        return '<div class="ms-unit"><div class="ms-ut">' + x.u.icon + ' ' + esc(x.u.title) + '<span>' + Math.round(x.pct * 100) + '%</span></div><div class="ms-dots">' +
          x.words.map(function (w) { var s = (m.W[w.id] || { strength: 0 }).strength; return '<i title="' + esc(w.script + ' — ' + gloss(w)) + '" data-w="' + esc(w.script) + '" style="--s:' + s + '"></i>'; }).join('') + '</div></div>';
      }).join('') + '</div>' +
      (weak.length ? '<h3 style="margin:18px 0 8px">Tricky words</h3><div class="wrapflex">' + weak.slice(0, 12).map(function (w) { return '<button class="chip" data-say="' + esc(w.script) + '">' + esc(w.script) + ' · ' + esc(gloss(w)) + '</button>'; }).join('') + '</div>' : '') +
      '<div class="wrapflex" style="margin-top:18px"><a class="btn" href="#/explore/cards">Smart Flashcards</a><a class="btn ghost" href="#/explore/blitz">Blitz</a></div>';
  }
  function masteryWire() {
    $$('.ms-dots i').forEach(function (i) { i.addEventListener('click', function () { say(i.dataset.w); }); });
    $$('[data-say]').forEach(function (b) { b.addEventListener('click', function () { say(b.dataset.say); }); });
  }

  root.TLExplore = { page: page, wire: wire, tiles: TILES, mastery: masteryData, levels: LEVELS };
})(window);
