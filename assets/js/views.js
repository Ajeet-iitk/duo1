/* ==========================================================================
   Bhasha — views & UI shell
   Router, sidebar/topbar chrome, learning path, alphabet reference, AI tutor,
   progress, profile, settings, per-question explainer drawer.
   ========================================================================== */
(function (root) {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function h(html) {
    var d = document.createElement('div');
    d.innerHTML = html.trim();
    return d.firstElementChild;
  }
  function course() { return TLData.courses[TLStore.get('profile.course')]; }
  function base() { return TLStore.get('profile.base'); }
  function gloss(item, b) { b = b || base(); return b === 'hi' ? item.hi : item.en; }
  function money(n) { return Number(n).toLocaleString('en-IN'); }

  /* ------------------------------------------------------------- icons */
  function icon(name) {
    var s = {
      learn: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 2 2 7l10 5 10-5-10-5Z" fill="currentColor"/><path d="M2 12l10 5 10-5" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M2 17l10 5 10-5" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" opacity=".55"/></svg>',
      letters: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M4 20V6a2 2 0 0 1 2-2h5a4 4 0 0 1 0 8H6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M6 12h7a4 4 0 0 1 0 8H6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
      tutor: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" fill="currentColor"/><path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" fill="currentColor" opacity=".7"/></svg>',
      quests: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.2"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2.2"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/></svg>',
      profile: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2.2"/><path d="M4 21c0-4 3.6-6.5 8-6.5S20 17 20 21" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
      settings: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
      heart: '❤️', gem: '💎', fire: '🔥'
    };
    return s[name] || '';
  }
  var NAV = [
    { id: 'learn', label: 'Learn', icon: 'learn' },
    { id: 'letters', label: 'Letters', icon: 'letters' },
    { id: 'tutor', label: 'AI Tutor', icon: 'tutor' },
    { id: 'quests', label: 'Progress', icon: 'quests' },
    { id: 'profile', label: 'Profile', icon: 'profile' }
  ];

  /* ================================================================== */
  /*  SHELL                                                             */
  /* ================================================================== */
  function mountShell() {
    var app = $('#app');
    app.innerHTML =
      '<aside class="sidebar" id="sidebar"></aside>' +
      '<main class="main"><div class="wrap" id="wrap"></div></main>' +
      '<nav class="mobile-nav" id="mobilenav"></nav>';
    renderSidebar();
  }

  function renderSidebar() {
    var c = course();
    var sb = $('#sidebar');
    sb.className = 'sidebar';
    sb.innerHTML =
      '<a class="brand" href="#/learn" title="Bhasha">' + owl(34) + '<span class="bt">Bhasha<em>.</em></span></a>' +
      NAV.map(function (n) {
        return '<a class="nav-item' + (route() === n.id ? ' active' : '') + '" href="#/' + n.id + '" data-nav="' + n.id + '" title="' + esc(n.label) + '" aria-label="' + esc(n.label) + '">' +
          '<span class="ic">' + icon(n.icon) + '</span><span class="nl">' + n.label + '</span>' +
          (n.id === 'quests' && questsReady() ? '<span class="dot">' + questsReady() + '</span>' : '') +
          '</a>';
      }).join('') +
      '<div class="nav-sep"></div>' +
      '<a class="nav-item" href="#/settings" title="Settings" aria-label="Settings"><span class="ic">' + icon('settings') + '</span><span class="nl">Settings</span></a>' +
      '<button class="langpicker" id="switchlang" title="' + esc(c.name) + '"><span class="lp-flag">' + c.flag + '</span><span class="lp-name">' + esc(c.name) + '</span></button>';

    $('#switchlang').addEventListener('click', function () { openLanguagePicker(); });
    $$('#sidebar .nav-item').forEach(function (a) {
      a.addEventListener('click', function () { root.TLSfx.play('tapSoft'); });
    });

    var mn = $('#mobilenav');
    mn.innerHTML = NAV.map(function (n) {
      return '<a class="nav-item' + (route() === n.id ? ' active' : '') + '" href="#/' + n.id + '">' +
        '<span class="ic">' + icon(n.icon) + '</span><span>' + n.label + '</span></a>';
    }).join('');

    applySidebar();
  }

  /* Sidebar collapse state is shared by the top-bar button and Settings, and is
     remembered between visits. Collapsing shrinks the rail to icons so the
     content gets the space back on smaller laptops. */
  function applySidebar() {
    var collapsed = !!TLStore.get('settings.sidebarCollapsed');
    var sb = $('#sidebar');
    if (sb) sb.classList.toggle('collapsed', collapsed);
    var tg = $('#nav-toggle');
    if (tg) {
      tg.innerHTML = collapsed ? '»' : '«';
      tg.title = collapsed ? 'Expand sidebar' : 'Collapse sidebar';
      tg.setAttribute('aria-label', tg.title);
      tg.setAttribute('aria-expanded', String(!collapsed));
    }
  }

  function toggleSidebar() {
    TLStore.set('settings.sidebarCollapsed', !TLStore.get('settings.sidebarCollapsed'));
    root.TLSfx.play('tapSoft');
    applySidebar();
  }

  function questsReady() {
    return TLStore.state.quests.items.filter(function (q) { return q.done && !q.claimed; }).length;
  }

  function owl(size) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 64 64">' +
      '<ellipse cx="32" cy="36" rx="20" ry="21" fill="#58CC02"/>' +
      '<ellipse cx="32" cy="44" rx="13" ry="13" fill="#89E219"/>' +
      '<circle cx="24" cy="30" r="8.5" fill="#fff"/><circle cx="40" cy="30" r="8.5" fill="#fff"/>' +
      '<circle cx="25" cy="30" r="4" fill="#4B4B4B"/><circle cx="39" cy="30" r="4" fill="#4B4B4B"/>' +
      '<path d="M32 34l6 5-6 5-6-5 6-5Z" fill="#FFC800"/>' +
      '</svg>';
  }

  function topbar() {
    var s = TLStore.state;
    var c = course();
    var hearts = s.stats.hearts;
    return '<div class="topbar">' +
      '<button class="navtoggle" id="nav-toggle" title="Collapse sidebar" aria-label="Collapse sidebar" aria-expanded="true">«</button>' +
      '<button class="flagbtn" id="tb-lang" title="Change course"><span class="stat flag">' + c.flag + '</span><span class="tb-name">' + esc(c.name) + '</span></button>' +
      '<div class="spacer"></div>' +
      '<a class="stat streak" href="#/quests" title="Streak">🔥 <span>' + s.stats.streak + '</span></a>' +
      '<a class="stat gem" href="#/quests" title="Gems">💎 <span>' + money(s.stats.gems) + '</span></a>' +
      '<a class="stat heart" href="#/quests" title="Hearts left today">' + (hearts > 0 ? '❤️' : '🤍') + ' <span id="tb-hearts">' + hearts + '</span>' + (hearts === 0 && s.stats.hearts < TLStore.MAX_HEARTS ? '<span class="tiny" style="color:#afafaf">' + countdown() + '</span>' : '') + '</a>' +
      '</div>';
  }

  function countdown() {
    var ms = TLStore.heartsInMs();
    if (ms <= 0) return '';
    var m = Math.ceil(ms / 60000);
    return m + 'm';
  }

  function renderTopbar() {
    var el = $('#tb-lang');
    if (el && !el.dataset.bound) {
      el.dataset.bound = '1';
      el.addEventListener('click', openLanguagePicker);
    }
    var tg = $('#nav-toggle');
    if (tg && !tg.dataset.bound) {
      tg.dataset.bound = '1';
      tg.addEventListener('click', toggleSidebar);
    }
    applySidebar();
  }

  /* ================================================================== */
  /*  ROUTER                                                            */
  /* ================================================================== */
  var currentRoute = 'learn';
  function route() {
    var r = (location.hash || '#/learn').replace('#/', '').split('?')[0];
    return NAV.concat([{ id: 'settings' }]).some(function (n) { return n.id === r; }) ? r : 'learn';
  }

  function go(id) {
    if (location.hash === '#/' + id) renderRoute();
    else location.hash = '#/' + id;
  }

  function renderRoute() {
    var r = route();
    currentRoute = r;
    var wrap = $('#wrap');
    wrap.innerHTML = topbar() +
      '<div class="columns">' +
        '<div class="center-col" id="center">' + pageBody(r) + '</div>' +
        '<div class="right-rail" id="rail">' + rail(r) + '</div>' +
      '</div>';
    renderTopbar();
    wireBody(r);
    renderSidebar();
    TLStore.rollHearts();
  }

  /* ================================================================== */
  /*  PAGES                                                             */
  /* ================================================================== */
  function pageBody(r) {
    switch (r) {
      case 'learn': return pageLearn();
      case 'letters': return pageLetters();
      case 'tutor': return pageTutor();
      case 'quests': return pageQuests();
      case 'profile': return pageProfile();
      case 'settings': return pageSettings();
      default: return pageLearn();
    }
  }

  /* ------------------------------------------------------------ LEARN */
  function pageLearn() {
    var c = course();
    var cc = TLStore.course(c.id);
    var html = '';
    var activeUnitIdx = 0;
    var totalUnits = c.units.length;

    for (var u = 0; u < totalUnits; u++) {
      var unit = c.units[u];
      var unlocked = TLStore.unitUnlocked(c, u);
      var uc = TLStore.unitCompletion(c, unit);
      if (unlocked && uc.done < uc.total) activeUnitIdx = u;
      else if (unlocked && activeUnitIdx === u && uc.done === uc.total) activeUnitIdx = Math.min(u + 1, totalUnits - 1);

      html += '<div class="unit-band" style="background-color:' + unit.color + '">' +
        '<div class="ub-txt"><div class="ub-kicker">Unit ' + (u + 1) + ' · ' + (unlocked ? uc.done + '/' + uc.total + ' lessons' : 'locked') + '</div>' +
        '<h2>' + unit.icon + ' ' + esc(unit.title) + '</h2>' +
        '<p>' + esc(unit.subtitle) + '</p></div>' +
        '<button class="ub-guide" data-guide="' + unit.id + '">📖 Guidebook</button>' +
        '</div>';

      html += '<div class="path">';
      var offsets = [0, 56, 0, -56];
      for (var i = 0; i < TLData.lessonsPerUnit; i++) {
        var st = TLStore.lessonState(c.id, unit.id, i);
        var isCurrent = unlocked && i === 0 && !st.done;
        var lessonUnlocked = unlocked && (i === 0 || TLStore.lessonState(c.id, unit.id, i - 1).done || st.done);
        var cls = st.done ? 'done' : (lessonUnlocked ? '' : 'locked');
        if (isCurrent) cls += ' current';
        var offset = offsets[i % offsets.length];
        html += '<div class="node-wrap" style="--off:' + offset + 'px">' +
          (isCurrent && u === activeUnitIdx ? '<div class="start-bubble">Start</div>' : '') +
          '<button class="node ' + cls + '" data-lesson="' + unit.id + '" data-i="' + i + '" ' + (lessonUnlocked ? '' : 'disabled') + '>' +
          '<span class="pop">' + (st.done ? '⭐' : (lessonUnlocked ? (i === 0 ? '★' : '•') : '🔒')) + '</span>' +
          '</button>' +
          '<div class="node-crowns">' + crowns(st.crowns) + '</div>' +
          '<div class="node-label">' + (st.done ? 'Lesson ' + (i + 1) + ' · best ' + st.best + '%' : 'Lesson ' + (i + 1)) + '</div>' +
          '</div>';
      }
      html += '</div>';

      var nextUnlocked = u + 1 < totalUnits && TLStore.unitUnlocked(c, u + 1);
      if (u + 1 < totalUnits) {
        html += '<div class="path-checkpoint"><div class="line"></div>' +
          '<div class="trophy' + (uc.done === uc.total ? '' : ' locked') + '">' + (uc.done === uc.total ? '🏆' : '🔒') + '</div>' +
          '<div class="line"></div></div>';
      }
    }

    html += '<div class="mascot-row"><div style="font-size:44px">' + (cc.xp > 0 ? '🦉' : '👋') + '</div>' +
      '<div class="bubble">' + (cc.xp > 0
        ? 'You have ' + cc.xp + ' XP in ' + esc(c.name) + '. Keep the streak alive!'
        : 'Welcome! Tap the glowing node to begin ' + esc(c.name) + '.') + '</div></div>';

    return html;
  }

  function crowns(n) {
    var out = '';
    for (var i = 0; i < TLStore.MAX_CROWNS; i++) out += '<span style="opacity:' + (i < n ? 1 : .25) + '">👑</span>';
    return out;
  }

  /* ---------------------------------------------------------- LETTERS */
  function pageLetters() {
    var c = course();
    var si = c.scriptInfo;
    return '<div class="card" style="margin-bottom:18px">' +
      '<h3>' + esc(si.name) + '</h3>' +
      '<p class="muted" style="line-height:1.5">' + esc(si.blurb) + '</p>' +
      '<p class="muted"><b>Direction:</b> ' + esc(si.dir) + ' · ' + esc(si.vowelHint) + '</p>' +
      '<div class="wrapflex" style="margin-top:8px">' +
      '<button class="btn sm" id="letters-practice">Practise these letters</button>' +
      '<button class="btn ghost sm" id="letters-ai">💡 Explain the script</button>' +
      '</div></div>' +
      '<h3 style="margin:18px 0 10px">Tap any letter to hear it</h3>' +
      (si.letters.length > 12 ? '<div class="muted tiny" style="margin-bottom:8px">First ' + si.letters.length + ' letters of the ' + esc(c.name) + ' script</div>' : '') +
      '<div class="letter-grid">' +
      si.letters.map(function (L, i) {
        return '<button class="letter" data-letter="' + i + '">' +
          '<div class="l-ch">' + esc(L[0]) + '</div>' +
          '<div class="l-rom">' + esc(L[1]) + '</div>' +
          '<div class="l-hint">' + esc(L[2]) + '</div></button>';
      }).join('') + '</div>';
  }

  /* ------------------------------------------------------------ TUTOR */
  function pageTutor() {
    var c = course();
    var engine = TLAI.online ? (TLStore.get('settings.ai.model') || 'LLM') : 'built-in tutor';
    return '<div class="card" style="margin-bottom:18px">' +
      '<div class="card-head"><h3>' + icon('tutor') + ' ' + esc(c.name) + ' AI Tutor</h3>' +
      '<span class="chip ' + (TLAI.online ? 'green' : 'blue') + '">' + esc(engine) + '</span></div>' +
      '<p class="muted">Ask anything about ' + esc(c.name) + ' — grammar, pronunciation, why a word changes, or for extra practice sentences. ' +
      (TLAI.online ? '' : 'Running on the built-in explainer; add an API key in Settings to unlock a full language model.') + '</p>' +
      '<div class="quick-q" style="margin-top:10px">' +
      ['How does word order work?', 'Explain the script', 'How do I say "thank you"?', 'Why is my answer wrong?', 'Give me 3 practice sentences']
        .map(function (q) { return '<button class="chip" data-quick="' + esc(q) + '">' + esc(q) + '</button>'; }).join('') +
      '</div></div>' +
      '<div class="card" id="tutor-log" style="min-height:260px;display:flex;flex-direction:column;gap:12px;margin-bottom:14px">' +
      '<div class="ai-tag">AI Tutor</div>' +
      '<div class="msg ai">' + esc(greeting(c)) + '</div>' +
      '</div>' +
      '<form class="wrapflex" id="tutor-form" style="gap:8px;align-items:flex-end">' +
      '<textarea class="typebox" id="tutor-input" style="min-height:56px;flex:1;font-size:16px" placeholder="Ask about ' + esc(c.name) + '…"></textarea>' +
      '<button class="btn" type="submit" style="height:56px">Ask</button>' +
      '</form>';
  }

  function greeting(c) {
    return 'Vanakkam! I am your ' + c.name + ' tutor. Ask me about a word, a sentence or a grammar rule — ' +
      'I can also explain the ' + (c.scriptInfo ? c.scriptInfo.name : 'script') + ' one letter at a time.';
  }

  function wireTutor() {
    var log = $('#tutor-log');
    var input = $('#tutor-input');
    var history = [];

    function push(role, html) {
      var el = document.createElement('div');
      el.className = 'msg ' + (role === 'user' ? 'me' : 'ai');
      el.innerHTML = html;
      log.appendChild(el);
      log.scrollTop = log.scrollHeight;
      return el;
    }

    function ask(q) {
      if (!q.trim()) return;
      TLSfx.play('tap');
      push('user', esc(q));
      history.push({ role: 'user', content: q });
      var thinking = push('ai', '<span class="muted">Thinking…</span>');
      TLAI.ask(q, history, { courseId: course().id }).then(function (res) {
        thinking.innerHTML = res.html;
        history.push({ role: 'assistant', content: res.html.replace(/<[^>]+>/g, ' ') });
        log.scrollTop = log.scrollHeight;
      });
    }

    $('#tutor-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var q = input.value; input.value = ''; ask(q);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); var q = input.value; input.value = ''; ask(q); }
    });
    $$('[data-quick]').forEach(function (b) {
      b.addEventListener('click', function () { ask(b.getAttribute('data-quick')); });
    });
  }

  /* ---------------------------------------------------------- PROFILE */
  function pageQuests() {
    var q = TLStore.quests();
    var s = TLStore.state;
    var cal = TLStore.streakCalendar(7);
    return '<h1 class="q-title">Your progress</h1>' +
      '<div class="card" style="margin-bottom:18px">' +
      '<div class="spread" style="margin-bottom:10px"><b>Daily goal: ' + s.daily.xp + ' / ' + s.daily.goal + ' XP</b>' +
      '<button class="btn ghost sm" id="goal-edit">Edit</button></div>' +
      '<div class="progress-clip"><i style="width:' + Math.min(100, Math.round(s.daily.xp / s.daily.goal * 100)) + '%"></i></div>' +
      '</div>' +
      '<div class="card" style="margin-bottom:18px"><h3>🎯 Today\'s quests</h3>' +
      q.items.map(function (it) {
        var pct = Math.round(it.progress / it.target * 100);
        return '<div class="row">' +
          '<span class="r-emoji">' + it.icon + '</span>' +
          '<div class="r-main"><div class="r-title">' + esc(it.label) + '</div>' +
          '<div class="progress-clip" style="margin-top:6px"><i style="width:' + pct + '%"></i></div></div>' +
          (it.claimed ? '<span class="chip green">Claimed</span>'
            : it.done ? '<button class="btn sm" data-claim="' + it.id + '">Claim 💎20</button>'
              : '<span class="chip">' + it.progress + '/' + it.target + '</span>') +
          '</div>';
      }).join('') + '</div>' +
      '<div class="card" style="margin-bottom:18px"><h3>🔥 Streak</h3>' +
      '<div class="spread"><div><div style="font-size:34px;font-weight:900;color:#c26a00">' + s.stats.streak + ' days</div>' +
      '<div class="muted">Longest: ' + s.stats.longestStreak + ' · Freezes: ' + s.stats.freezes + '</div></div>' +
      '<div style="font-size:52px">' + (s.stats.streak > 0 ? '🔥' : '❄️') + '</div></div>' +
      '<div class="streak-grid" style="margin-top:14px">' +
      cal.map(function (d) {
        return '<div><div class="d">' + d.label + '</div><div class="c ' + (d.active ? 'on' : 'off') + '">' + (d.active ? '🔥' : '⚪') + '</div></div>';
      }).join('') + '</div>' +
      '</div>' +
      '<div class="card"><h3>💎 Spend your gems (' + money(s.stats.gems) + ')</h3>' +
      gemsSpendRow('Refill all 5 hearts', 'Instantly back to full hearts', 'hearts', 350, 'red') +
      gemsSpendRow('Streak freeze', 'Protects your streak for one missed day', 'freeze', 200, 'blue') +
      '</div>';
  }

  function gemsSpendRow(title, sub, kind, cost, cls) {
    var can = TLStore.state.stats.gems >= cost;
    return '<div class="row">' +
      '<div class="r-main"><div class="r-title">' + esc(title) + '</div><div class="r-sub">' + esc(sub) + '</div></div>' +
      '<button class="btn ' + cls + ' sm' + (can ? '' : ' disabled') + '" data-buy="' + kind + '" data-cost="' + cost + '">' + cost + ' 💎</button>' +
      '</div>';
  }

  /* ---------------------------------------------------------- PROFILE */
  function pageProfile() {
    var s = TLStore.state;
    var c = course();
    var tot = TLStore.courseTotals(c);
    var acc = s.stats.correct + s.stats.wrong > 0
      ? Math.round(s.stats.correct / (s.stats.correct + s.stats.wrong) * 100) : 0;
    var ach = TLStore.achievements();
    return '<div class="card" style="display:flex;gap:18px;align-items:center;margin-bottom:18px">' +
      '<div style="font-size:64px">' + (s.profile.avatar || '🦉') + '</div>' +
      '<div style="flex:1"><h3 style="margin:0 0 4px;font-size:24px">' + esc(s.profile.name) + '</h3>' +
      '<div class="muted">Joined ' + esc(s.profile.joined) + ' · learning ' + esc(c.name) + ' from ' + esc(base() === 'hi' ? 'Hindi' : 'English') + '</div>' +
      '<button class="btn ghost sm" style="margin-top:8px" id="edit-name">Edit profile</button></div>' +
      '</div>' +
      '<div class="grid3" style="margin-bottom:18px">' +
      statBox('🔥 Streak', s.stats.streak + ' days') +
      statBox('⚡ Total XP', money(s.stats.xp)) +
      statBox('👑 Crowns', TLStore.totalCrowns()) +
      statBox('📘 Lessons', s.stats.lessons) +
      statBox('🎯 Accuracy', acc + '%') +
      statBox('💎 Gems', money(s.stats.gems)) +
      '</div>' +
      '<div class="card" style="margin-bottom:18px"><h3>' + c.flag + ' ' + esc(c.name) + ' progress</h3>' +
      '<div class="progress-clip" style="margin:10px 0"><i style="width:' + Math.round(tot.pct * 100) + '%"></i></div>' +
      '<div class="muted">' + tot.done + ' of ' + tot.lessons + ' lessons · ' + tot.crowns + ' crowns · ' + (TLStore.course(c.id).xp) + ' XP</div>' +
      '<h3 style="margin-top:18px">Words seen</h3>' +
      '<div class="wrapflex">' + Object.keys(TLStore.course(c.id).words).slice(0, 24).map(function (id) {
        var it = TLData.findItem(c, id);
        var w = TLStore.course(c.id).words[id];
        if (!it) return '';
        return '<span class="chip ' + (w.strength > .6 ? 'green' : w.strength > .2 ? 'yellow' : '') + '" data-word="' + id + '">' +
          esc(it.script) + ' · ' + esc(gloss(it)) + '</span>';
      }).join('') + '</div>' +
      (Object.keys(TLStore.course(c.id).words).length ? '' : '<div class="muted">Finish a lesson and your vocabulary will show up here.</div>') +
      '</div>' +
      '<div class="card"><h3>🏅 Achievements</h3>' +
      ach.map(function (a) {
        return '<div class="row ach ' + (a.on ? 'on' : '') + '"><div class="a-ico">' + a.icon + '</div>' +
          '<div class="r-main"><div class="r-title">' + esc(a.label) + '</div><div class="r-sub">' + esc(a.desc) + '</div></div>' +
          (a.on ? '<span class="chip green">Unlocked</span>' : '<span class="chip">Locked</span>') + '</div>';
      }).join('') + '</div>';
  }

  function statBox(k, v) {
    return '<div class="stat-box"><div class="sb-k">' + k + '</div><div class="sb-v">' + v + '</div></div>';
  }

  /* --------------------------------------------------------- SETTINGS */
  function pageSettings() {
    var s = TLStore.state;
    var ai = s.settings.ai;
    return '<h1 class="q-title">Settings</h1>' +
      '<div class="card" style="margin-bottom:18px"><h3>🔊 Sound & speech</h3>' +
      toggle('sfx', 'Sound effects', s.settings.sfx) +
      '<div class="switch"><div><div class="r-title">Volume</div><div class="r-sub">Sound effects level</div></div>' +
      '<input type="range" min="0" max="100" value="' + Math.round(s.settings.sfxVolume * 100) + '" id="set-vol" style="width:140px"></div>' +
      toggle('voice', 'Native audio', s.settings.voice) +
      '<div class="switch"><div><div class="r-title">Speaking speed</div><div class="r-sub">' + TLStore.get('settings.speechRate') + '×</div></div>' +
      '<input type="range" min="50" max="120" value="' + Math.round(s.settings.speechRate * 100) + '" id="set-rate" style="width:140px"></div>' +
      '<div class="switch"><div><div class="r-title">Test audio</div><div class="r-sub">' + esc(TLSpeech.voiceName(course().speech)) + '</div></div>' +
      '<button class="btn sm" id="set-testspeak">Play sample</button></div>' +
      '</div>' +

      '<div class="card" style="margin-bottom:18px"><h3>🌍 Languages</h3>' +
      '<div class="wrapflex">' +
      Object.keys(TLData.courses).map(function (id) {
        var cc = TLData.courses[id];
        return '<button class="pick' + (s.profile.course === id ? ' sel' : '') + '" data-setcourse="' + id + '" style="flex:1">' +
          '<div class="p-flag">' + cc.flag + '</div><div class="p-name">' + esc(cc.name) + '</div>' +
          '<div class="p-sub">' + esc(cc.native) + '</div></button>';
      }).join('') +
      '</div>' +
      '<div style="margin-top:14px"><div class="r-title">Learn from</div><div class="wrapflex" style="margin-top:6px">' +
      Object.keys(TLData.bases).map(function (b) {
        return '<button class="chip ' + (s.profile.base === b ? 'blue' : '') + '" data-setbase="' + b + '">' + TLData.bases[b].flag + ' ' + TLData.bases[b].label + '</button>';
      }).join('') + '</div></div>' +
      '</div>' +

      '<div class="card" style="margin-bottom:18px"><h3>🤖 AI explainers</h3>' +
      '<p class="muted">The explainer works offline out of the box. Connect any OpenAI-compatible endpoint for richer, model-generated explanations.</p>' +
      '<label class="field"><span>Provider</span><select id="ai-provider">' +
      '<option value="offline"' + (ai.provider === 'offline' ? ' selected' : '') + '>Built-in tutor (offline, free)</option>' +
      '<option value="openai-compatible"' + (ai.provider === 'openai-compatible' ? ' selected' : '') + '>OpenAI-compatible API</option>' +
      '</select></label>' +
      '<label class="field"><span>Endpoint</span><input id="ai-endpoint" value="' + esc(ai.endpoint) + '" placeholder="https://api.openai.com/v1"></label>' +
      '<label class="field"><span>API key</span><input id="ai-key" type="password" value="' + esc(ai.key) + '" placeholder="sk-…"></label>' +
      '<label class="field"><span>Model</span><input id="ai-model" value="' + esc(ai.model) + '" placeholder="gpt-4o-mini"></label>' +
      '<div class="wrapflex"><button class="btn sm" id="ai-save">Save AI settings</button>' +
      '<button class="btn ghost sm" id="ai-test">Test connection</button></div>' +
      '<div class="muted tiny" style="margin-top:8px" id="ai-status">Keys are stored only in this browser (localStorage) and sent directly to your endpoint.</div>' +
      '</div>' +

      '<div class="card" style="margin-bottom:18px"><h3>🎯 Daily goal</h3>' +
      '<div class="wrapflex">' + [20, 50, 100, 200].map(function (g) {
        return '<button class="chip ' + (s.daily.goal === g ? 'blue' : '') + '" data-goal="' + g + '">' + g + ' XP</button>';
      }).join('') + '</div></div>' +

      '<div class="card" style="margin-bottom:18px"><h3>🖥️ Layout</h3>' +
      toggle('sidebarCollapsed', 'Collapse the sidebar', s.settings.sidebarCollapsed) +
      '<p class="muted tiny" style="margin-top:6px">Shrinks the sidebar to icons so the lesson gets more room. The « button in the top bar does the same.</p>' +
      '</div>' +

      '<div class="card"><h3>⚠️ Danger zone</h3>' +
      '<p class="muted">Reset all progress, streaks and achievements. This cannot be undone.</p>' +
      '<button class="btn red" id="reset-all">Reset everything</button></div>';
  }

  function toggle(id, label, on) {
    return '<div class="switch"><div class="r-title">' + esc(label) + '</div>' +
      '<div class="toggle' + (on ? ' on' : '') + '" data-toggle="' + id + '"></div></div>';
  }

  /* ================================================================== */
  /*  RIGHT RAIL                                                        */
  /* ================================================================== */
  function rail(r) {
    var s = TLStore.state;
    var c = course();
    var cal = TLStore.streakCalendar(7);
    var pct = Math.min(100, Math.round(s.daily.xp / s.daily.goal * 100));
    var next = nextLesson();
    return '' +
      '<div class="card">' +
      '<div class="spread"><b>🔥 ' + s.stats.streak + ' day streak</b>' +
      '<span class="muted tiny">' + s.daily.xp + '/' + s.daily.goal + ' XP today</span></div>' +
      '<div class="progress-clip" style="margin:10px 0"><i style="width:' + pct + '%"></i></div>' +
      '<div class="streak-grid">' +
      cal.map(function (d) { return '<div><div class="d">' + d.label + '</div><div class="c ' + (d.active ? 'on' : 'off') + '">' + (d.active ? '🔥' : '⚪') + '</div></div>'; }).join('') +
      '</div></div>' +

      (next ? '<div class="super-card">' +
        '<h3>' + next.unit.icon + ' Continue learning</h3>' +
        '<p>' + esc(c.name) + ' · Unit ' + next.unitIndex + ': ' + esc(next.unit.title) + ' — Lesson ' + (next.index + 1) + ' of ' + TLData.lessonsPerUnit + '</p>' +
        '<button class="btn-white" id="rail-continue">' + (next.index === 0 ? 'START LESSON' : 'RESUME') + '</button>' +
        '</div>' : '<div class="super-card"><h3>🎉 Course complete</h3><p>You have finished every lesson in ' + esc(c.name) + '. Revisit any node to earn more crowns.</p></div>') +

      '<div class="card">' +
      '<h3>📖 ' + esc(c.name) + ' guidebook</h3>' +
      '<p class="muted tiny">Grammar notes for every unit, and the full letter chart with audio.</p>' +
      '<div class="wrapflex"><a class="btn ghost sm" href="#/letters">Letters</a>' +
      '<button class="btn ghost sm" id="rail-guide">Unit ' + (next ? next.unitIndex : 1) + ' notes</button></div>' +
      '</div>';
  }

  /* First lesson on the path that has not been completed yet. */
  function nextLesson() {
    var c = course();
    for (var u = 0; u < c.units.length; u++) {
      var unit = c.units[u];
      if (!TLStore.unitUnlocked(c, u)) return null;
      for (var i = 0; i < TLData.lessonsPerUnit; i++) {
        if (!TLStore.lessonState(c.id, unit.id, i).done) {
          return { unit: unit, unitIndex: u + 1, index: i, unitId: unit.id };
        }
      }
    }
    return null;
  }

  /* ================================================================== */
  /*  WIRING                                                            */
  /* ================================================================== */
  function wireBody(r) {
    var center = $('#center');

    /* lesson nodes */
    $$('[data-lesson]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.disabled) { TLSfx.play('error'); toast('Finish the previous lesson to unlock this one.'); return; }
        TLSfx.play('tap');
        startLesson(b.getAttribute('data-lesson'), +b.getAttribute('data-i'));
      });
    });

    /* guidebook */
    $$('[data-guide]').forEach(function (b) {
      b.addEventListener('click', function () { TLSfx.play('tapSoft'); openGuidebook(b.getAttribute('data-guide')); });
    });
    var rg = $('#rail-guide');
    if (rg) rg.addEventListener('click', function () {
      var nx = nextLesson();
      openGuidebook(nx ? nx.unitId : course().units[0].id);
    });
    var rc = $('#rail-continue');
    if (rc) rc.addEventListener('click', function () {
      var nx = nextLesson();
      if (!nx) return;
      TLSfx.play('tap');
      startLesson(nx.unitId, nx.index);
    });

    /* letters */
    $$('[data-letter]').forEach(function (b) {
      b.addEventListener('click', function () {
        var L = course().scriptInfo.letters[+b.getAttribute('data-letter')];
        TLSfx.play('tapSoft');
        TLSpeech.speak(L[0], { lang: course().speech });
        toast(L[0] + '  ·  ' + L[1] + '  ·  ' + L[2]);
      });
    });
    var lp = $('#letters-practice');
    if (lp) lp.addEventListener('click', function () { TLSfx.play('tap'); startLesson(course().units[0].id, 0); });
    var la = $('#letters-ai');
    if (la) la.addEventListener('click', function () {
      openExplain({ id: '', script: course().scriptInfo.letters.slice(0, 4).map(function (x) { return x[0]; }).join(' '), roman: course().scriptInfo.letters.slice(0, 4).map(function (x) { return x[1]; }).join(' '), en: 'the ' + course().name + ' script', hi: course().name + ' लिपि' }, { question: 'Explain how to read this script' });
    });

    /* claims and gem spending */
    $$('[data-claim]').forEach(function (b) {
      b.addEventListener('click', function () {
        var reward = TLStore.claimQuest(b.getAttribute('data-claim'));
        if (reward) toast('Quest complete! +' + reward + ' 💎');
        renderRoute();
      });
    });
    $$('[data-buy]').forEach(function (b) {
      b.addEventListener('click', function () {
        var kind = b.getAttribute('data-buy');
        var cost = +b.getAttribute('data-cost');
        if (!TLStore.spendGems(cost)) { TLSfx.play('error'); toast('Not enough gems — you have ' + TLStore.state.stats.gems + ' 💎'); return; }
        if (kind === 'hearts') { TLStore.refillHearts(); TLSfx.play('chest'); toast('Hearts refilled ❤️'); }
        if (kind === 'freeze') { TLStore.set('stats.freezes', TLStore.state.stats.freezes + 1); TLSfx.play('chest'); toast('Streak freeze added ❄️'); }
        renderRoute();
      });
    });
    var ge = $('#goal-edit');
    if (ge) ge.addEventListener('click', function () { go('settings'); });

    /* tutor */
    if (r === 'tutor') wireTutor();

    /* profile */
    var en = $('#edit-name');
    if (en) en.addEventListener('click', openNameEditor);
    $$('[data-word]').forEach(function (c2) {
      c2.addEventListener('click', function () {
        var it = TLData.findItem(course(), c2.getAttribute('data-word'));
        if (it) openExplain(it);
      });
    });

    /* settings */
    wireSettings();
  }

  function wireSettings() {
    $$('[data-toggle]').forEach(function (t) {
      t.addEventListener('click', function () {
        var key = t.getAttribute('data-toggle');
        var val = !TLStore.get('settings.' + key);
        TLStore.set('settings.' + key, val);
        t.classList.toggle('on', val);
        if (key === 'sfx') TLSfx.setEnabled(val);
        if (key === 'voice') TLSpeech.setEnabled(val);
        if (key === 'sidebarCollapsed') applySidebar();
        TLSfx.play('tap');
      });
    });
    var vol = $('#set-vol');
    if (vol) vol.addEventListener('input', function () {
      var v = +vol.value / 100;
      TLStore.set('settings.sfxVolume', v);
      TLSfx.setVolume(v);
    });
    vol && vol.addEventListener('change', function () { TLSfx.play('correct'); });
    var rate = $('#set-rate');
    if (rate) rate.addEventListener('input', function () {
      var v = +rate.value / 100;
      TLStore.set('settings.speechRate', v);
      TLSpeech.setRate(v);
    });
    var ts = $('#set-testspeak');
    if (ts) ts.addEventListener('click', function () {
      var w = TLData.allItems(course())[6];
      TLSpeech.speak(w.script, { lang: course().speech });
    });

    $$('[data-setcourse]').forEach(function (b) {
      b.addEventListener('click', function () {
        switchCourse(b.getAttribute('data-setcourse'));
      });
    });
    $$('[data-setbase]').forEach(function (b) {
      b.addEventListener('click', function () {
        TLStore.set('profile.base', b.getAttribute('data-setbase'));
        TLSfx.play('tap');
        toast('Now learning from ' + (base() === 'hi' ? 'Hindi' : 'English'));
        renderRoute();
      });
    });
    $$('[data-goal]').forEach(function (b) {
      b.addEventListener('click', function () {
        TLStore.set('daily.goal', +b.getAttribute('data-goal'));
        TLSfx.play('tap');
        renderRoute();
      });
    });

    var save = $('#ai-save');
    if (save) save.addEventListener('click', function () {
      TLStore.set('settings.ai.provider', $('#ai-provider').value);
      TLStore.set('settings.ai.endpoint', $('#ai-endpoint').value.trim());
      TLStore.set('settings.ai.key', $('#ai-key').value.trim());
      TLStore.set('settings.ai.model', $('#ai-model').value.trim());
      TLSfx.play('correct');
      $('#ai-status').innerHTML = AIStatusText();
      toast('AI settings saved');
    });
    var test = $('#ai-test');
    if (test) test.addEventListener('click', function () {
      TLStore.set('settings.ai.provider', $('#ai-provider').value);
      TLStore.set('settings.ai.endpoint', $('#ai-endpoint').value.trim());
      TLStore.set('settings.ai.key', $('#ai-key').value.trim());
      TLStore.set('settings.ai.model', $('#ai-model').value.trim());
      $('#ai-status').innerHTML = '<span class="muted">Contacting endpoint…</span>';
      TLAI.testConnection().then(function (r) {
        $('#ai-status').innerHTML = r.ok
          ? '<span style="color:#58a700">✅ Connected. Model replied: ' + esc(r.text) + '</span>'
          : '<span style="color:#ea2b2b">❌ ' + esc(r.text) + '</span>';
      });
    });
    var reset = $('#reset-all');
    if (reset) reset.addEventListener('click', function () {
      var m = modal('<h2>Reset all progress?</h2><p class="muted">Every lesson, crown, streak and achievement will be deleted.</p>' +
        '<div class="wrapflex" style="margin-top:16px"><button class="btn ghost" id="rs-no">Cancel</button><button class="btn red" id="rs-yes">Delete everything</button></div>');
      $('#rs-no').addEventListener('click', closeModal);
      $('#rs-yes').addEventListener('click', function () { TLStore.reset(); location.hash = '#/learn'; location.reload(); });
    });
  }

  function AIStatusText() {
    var ai = TLStore.get('settings.ai');
    return TLAI.online
      ? '<span style="color:#58a700">✅ Using ' + esc(ai.model || 'model') + ' at ' + esc(ai.endpoint) + '</span>'
      : '<span class="muted">Using the built-in offline tutor.</span>';
  }

  /* ================================================================== */
  /*  LESSON LAUNCH                                                     */
  /* ================================================================== */
  function startLesson(unitId, index) {
    if (TLStore.state.stats.hearts <= 0) {
      TLSfx.play('error');
      var m = modal('<div style="text-align:center"><div style="font-size:56px">💔</div><h2>Out of hearts</h2>' +
        '<p class="muted">Hearts refill automatically, or refill now for 350 💎.</p>' +
        '<div class="wrapflex" style="justify-content:center;margin-top:14px">' +
        '<button class="btn ghost" id="nh-progress">Open progress</button>' +
        '<button class="btn red" id="nh-refill">Refill 350 💎</button></div></div>');
      $('#nh-progress').addEventListener('click', function () { closeModal(); go('quests'); });
      $('#nh-refill').addEventListener('click', function () {
        if (TLStore.spendGems(350)) { TLStore.refillHearts(); TLSfx.play('chest'); closeModal(); doStart(unitId, index); }
        else { TLSfx.play('error'); toast('Not enough gems'); }
      });
      return;
    }
    doStart(unitId, index);
  }

  function doStart(unitId, index) {
    TLLesson.start({
      courseId: course().id,
      unitId: unitId,
      index: index,
      onExit: function () { if (route() === 'learn') renderRoute(); else renderRoute(); }
    });
  }

  /* ================================================================== */
  /*  MODALS / DRAWERS / TOASTS                                         */
  /* ================================================================== */
  function modal(inner, opts) {
    opts = opts || {};
    var back = h('<div class="modal-back"><div class="modal">' + inner + '</div></div>');
    back.addEventListener('click', function (e) { if (e.target === back && !opts.locked) closeModal(); });
    document.body.appendChild(back);
    return $('.modal', back);
  }
  function closeModal() {
    var b = $('.modal-back');
    if (b && b.parentNode) b.parentNode.removeChild(b);
  }

  function toast(msg) {
    var wrap = $('.toast-wrap') || h('<div class="toast-wrap"></div>');
    if (!wrap.parentNode) document.body.appendChild(wrap);
    var t = h('<div class="toast">' + msg + '</div>');
    wrap.appendChild(t);
    setTimeout(function () {
      t.style.transition = 'opacity .3s'; t.style.opacity = '0';
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 320);
    }, 2400);
  }

  function xpFloat(txt) {
    var btn = $('#lsn-main');
    if (!btn) return;
    var r = btn.getBoundingClientRect();
    var el = h('<div class="xp-float">' + esc(txt) + '</div>');
    el.style.left = (r.left + r.width / 2 - 14) + 'px';
    el.style.top = (r.top - 10) + 'px';
    document.body.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1000);
  }

  /* --------------------------------------------------- explainer drawer */
  var drawerOpen = false;
  function openExplain(item, opts) {
    opts = opts || {};
    closeExplain();
    var c = course();
    var b = base();
    var hasWord = !!(item && item.script);
    var drawer = h(
      '<aside class="ai-drawer">' +
      '<header>' + icon('tutor') +
      '<h3>AI Explainer</h3><div style="flex:1"></div>' +
      '<button class="btn ghost sm" id="ai-close">Close</button></header>' +
      (hasWord ?
        '<div class="ai-word">' +
        '<div class="aw-main">' +
        '<div class="aw-script">' + esc(item.script) + '</div>' +
        (item.roman ? '<div class="aw-roman">' + esc(item.roman) + '</div>' : '') +
        '<div class="aw-gloss">' + esc(gloss(item, b)) + '</div>' +
        '</div>' +
        '<button class="speak-btn" id="ai-say" title="Listen">🔊</button>' +
        '</div>' : '') +
      '<div class="ai-body" id="ai-body">' +
      (opts.title ? '<div class="ai-asked">Question: ' + esc(opts.title) + '</div>' : '') +
      '<div class="ai-tag">' + (TLAI.online ? (TLStore.get('settings.ai.model') || 'Language model') : 'Built-in explainer') + '</div>' +
      '<div class="msg ai" id="ai-main"><span class="muted">Looking this up…</span></div>' +
      '</div>' +
      '<footer>' +
      '<textarea id="ai-q" placeholder="Ask a follow-up…"></textarea>' +
      '<button class="btn" id="ai-send">Ask</button>' +
      '</footer></aside>');
    document.body.appendChild(drawer);
    drawerOpen = true;
    $('#ai-close').addEventListener('click', function () { TLSfx.play('tapSoft'); closeExplain(); });
    var say = $('#ai-say');
    if (say) say.addEventListener('click', function () {
      TLSfx.play('tapSoft');
      /* a matching set has several words joined together — speak them one by one */
      var parts = String(item.script).split('·').map(function (s) { return s.trim(); }).filter(Boolean);
      parts.forEach(function (p, i) {
        setTimeout(function () { TLSpeech.speak(p, { lang: c.speech }); }, i * 1400);
      });
    });
    root.TLSfx.unlock();

    var main = $('#ai-main');
    TLAI.explain(item, { courseId: opts.courseId || c.id, question: opts.question }).then(function (res) {
      main.innerHTML = res.html;
    });

    function send() {
      var q = $('#ai-q').value;
      if (!q.trim()) return;
      var body = $('#ai-body');
      var me = h('<div class="msg me">' + esc(q) + '</div>');
      body.appendChild(me);
      var think = h('<div class="msg ai"><span class="muted">Thinking…</span></div>');
      body.appendChild(think);
      body.scrollTop = body.scrollHeight;
      $('#ai-q').value = '';
      TLAI.explain(item, { courseId: opts.courseId || c.id, question: q }).then(function (res) {
        think.innerHTML = res.html;
        body.scrollTop = body.scrollHeight;
      });
    }
    $('#ai-send').addEventListener('click', send);
    $('#ai-q').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    });

    /* quick questions */
    var quick = h('<div class="quick-q" style="margin-top:4px"></div>');
    ['How do I pronounce it?', 'Show me an example sentence', 'When do I use this?', 'How do I remember it?']
      .forEach(function (q) {
        var qb = h('<button class="chip">' + q + '</button>');
        qb.addEventListener('click', function () { $('#ai-q').value = q; send(); });
        quick.appendChild(qb);
      });
    $('#ai-body').appendChild(quick);
  }

  function closeExplain() {
    var d = $('.ai-drawer');
    if (d && d.parentNode) d.parentNode.removeChild(d);
    drawerOpen = false;
  }

  /* -------------------------------------------------------- guidebook */
  function openGuidebook(unitId) {
    var c = course();
    var u = TLData.unitById(c, unitId);
    if (!u) return;
    var b = base();
    var m = modal(
      '<div class="spread"><h2>' + u.icon + ' ' + esc(u.title) + '</h2>' +
      '<button class="btn ghost sm" id="gb-close">Close</button></div>' +
      '<p class="muted">' + esc(u.subtitle) + '</p>' +
      '<h3 style="margin-top:18px">Grammar notes</h3>' +
      (u.notes || []).map(function (n) {
        return '<div class="card" style="margin-bottom:10px;background:#f7f7f7"><b>' + esc(n.title) + '</b>' +
          '<p class="muted" style="margin:6px 0 0;line-height:1.5">' + esc(n.body) + '</p></div>';
      }).join('') +
      '<h3 style="margin-top:18px">Words in this unit</h3>' +
      '<div style="max-height:280px;overflow:auto">' +
      u.items.map(function (it) {
        return '<div class="row"><div class="r-main"><div class="r-title" style="font-size:19px">' + esc(it.script) + '</div>' +
          '<div class="r-sub">' + esc(it.roman) + ' — ' + esc(gloss(it, b)) + '</div></div>' +
          '<button class="btn ghost sm" data-say="' + esc(it.script) + '">🔊</button>' +
          '<button class="btn ghost sm" data-exp="' + esc(it.id) + '">💡</button></div>';
      }).join('') + '</div>' +
      (u.phrases && u.phrases.length ? '<h3 style="margin-top:18px">Sentences</h3>' +
        u.phrases.map(function (p) {
          return '<div class="row"><div class="r-main"><div class="r-title" style="font-size:17px">' + esc(p.script) + '</div>' +
            '<div class="r-sub">' + esc(p.roman) + ' — ' + esc(gloss(p, b)) + '</div></div>' +
            '<button class="btn ghost sm" data-say="' + esc(p.script) + '">🔊</button></div>';
        }).join('') : ''));
    $('#gb-close').addEventListener('click', closeModal);
    $$('[data-say]', m).forEach(function (x) {
      x.addEventListener('click', function () { TLSfx.play('tapSoft'); TLSpeech.speak(x.getAttribute('data-say'), { lang: c.speech }); });
    });
    $$('[data-exp]', m).forEach(function (x) {
      x.addEventListener('click', function () {
        var it = TLData.findItem(c, x.getAttribute('data-exp'));
        if (it) openExplain(it);
      });
    });
  }

  /* --------------------------------------------------- language picker */
  function openLanguagePicker() {
    TLSfx.play('tapSoft');
    var s = TLStore.state;
    var m = modal(
      '<h2>Choose a course</h2><p class="muted">Switch anytime — progress is kept per language.</p>' +
      '<div class="pick-grid" style="margin-top:14px">' +
      Object.keys(TLData.courses).map(function (id) {
        var c = TLData.courses[id];
        var cc = s.courses[id];
        var tot = TLStore.courseTotals(c);
        return '<button class="pick' + (s.profile.course === id ? ' sel' : '') + '" data-pickcourse="' + id + '">' +
          '<div class="p-flag">' + c.flag + '</div>' +
          '<div class="p-name">' + esc(c.name) + '</div>' +
          '<div class="p-sub">' + esc(c.native) + ' · ' + tot.done + '/' + tot.lessons + ' lessons</div></button>';
      }).join('') + '</div>' +
      '<h3 style="margin-top:20px">Learn from</h3>' +
      '<div class="wrapflex">' + Object.keys(TLData.bases).map(function (b) {
        return '<button class="chip ' + (s.profile.base === b ? 'blue' : '') + '" data-pickbase="' + b + '">' +
          TLData.bases[b].flag + ' ' + TLData.bases[b].label + '</button>';
      }).join('') + '</div>');
    $$('[data-pickcourse]', m).forEach(function (b) {
      b.addEventListener('click', function () { switchCourse(b.getAttribute('data-pickcourse')); closeModal(); });
    });
    $$('[data-pickbase]', m).forEach(function (b) {
      b.addEventListener('click', function () {
        TLStore.set('profile.base', b.getAttribute('data-pickbase'));
        TLSfx.play('tap');
        closeModal();
        renderRoute();
      });
    });
  }

  function switchCourse(id) {
    TLStore.set('profile.course', id);
    TLStore.course(id);
    TLSfx.play('unlock');
    toast('Now learning ' + TLData.courses[id].name + ' ' + TLData.courses[id].flag);
    if (location.hash === '#/learn') renderRoute();
    else go('learn');
  }

  function openNameEditor() {
    var m = modal('<h2>Edit profile</h2>' +
      '<label class="field"><span>Display name</span><input id="pn" value="' + esc(TLStore.get('profile.name')) + '"></label>' +
      '<label class="field"><span>Avatar</span><select id="pa">' +
      ['🦉', '🦚', '🐯', '🐼', '🦊', '🐧', '🐙', '🦄'].map(function (e) {
        return '<option' + (TLStore.get('profile.avatar') === e ? ' selected' : '') + '>' + e + '</option>';
      }).join('') + '</select></label>' +
      '<button class="btn full" id="ps">Save</button>');
    $('#ps').addEventListener('click', function () {
      TLStore.set('profile.name', $('#pn').value.trim() || 'Learner');
      TLStore.set('profile.avatar', $('#pa').value);
      TLSfx.play('correct');
      closeModal(); renderRoute();
    });
  }

  /* ================================================================== */
  /*  ONBOARDING                                                        */
  /* ================================================================== */
  function onboarding() {
    var step = 0, pickedCourse = null, pickedBase = 'en', goal = 50;
    var host = h('<div class="blueprint"></div>');
    document.body.appendChild(host);

    function draw() {
      if (step === 0) {
        host.innerHTML = '<div style="max-width:720px;margin:20px auto">' +
          '<div style="text-align:center">' + owl(72) + '<h1 style="font-size:32px;margin:10px 0 4px">Bhasha</h1>' +
          '<p class="muted" style="font-size:17px">Learn Tamil, Telugu or Gujarati — from English or Hindi.</p></div>' +
          '<h2 style="margin:26px 0 4px">I want to learn…</h2>' +
          '<div class="pick-grid">' + Object.keys(TLData.courses).map(function (id) {
            var c = TLData.courses[id];
            return '<button class="pick' + (pickedCourse === id ? ' sel' : '') + '" data-oc="' + id + '">' +
              '<div class="p-flag">' + c.flag + '</div><div class="p-name">' + esc(c.name) + '</div>' +
              '<div class="p-sub">' + esc(c.native) + ' · ' + c.units.length + ' units</div></button>';
          }).join('') + '</div>' +
          '<h2 style="margin:26px 0 4px">…starting from</h2>' +
          '<div class="wrapflex">' + Object.keys(TLData.bases).map(function (b) {
            return '<button class="pick' + (pickedBase === b ? ' sel' : '') + '" data-ob="' + b + '" style="flex:1">' +
              '<div class="p-name">' + TLData.bases[b].flag + ' ' + TLData.bases[b].label + '</div></button>';
          }).join('') + '</div>' +
          '<div style="margin-top:28px;text-align:right"><button class="btn lg' + (pickedCourse ? '' : ' disabled') + '" id="on-next">Continue</button></div>' +
          '</div>';
        $$('[data-oc]', host).forEach(function (b) {
          b.addEventListener('click', function () { pickedCourse = b.getAttribute('data-oc'); TLSfx.play('select'); draw(); });
        });
        $$('[data-ob]', host).forEach(function (b) {
          b.addEventListener('click', function () { pickedBase = b.getAttribute('data-ob'); TLSfx.play('select'); draw(); });
        });
        var nx = $('#on-next');
        nx.addEventListener('click', function () {
          if (!pickedCourse) { TLSfx.play('error'); return; }
          TLSfx.play('tap'); step = 1; draw();
        });
      } else if (step === 1) {
        host.innerHTML = '<div style="max-width:640px;margin:20px auto;text-align:center">' +
          '<h1 style="font-size:30px">How much time do you have?</h1>' +
          '<p class="muted">Pick a daily XP goal — you can change it later.</p>' +
          '<div class="pick-grid" style="margin-top:20px">' +
          [[20, 'Casual', '5 min / day'], [50, 'Regular', '10 min / day'], [100, 'Serious', '20 min / day'], [200, 'Intense', '30+ min / day']]
            .map(function (g) {
              return '<button class="pick' + (goal === g[0] ? ' sel' : '') + '" data-og="' + g[0] + '">' +
                '<div class="p-name">' + g[1] + '</div><div class="p-sub">' + g[0] + ' XP · ' + g[2] + '</div></button>';
            }).join('') + '</div>' +
          '<div style="margin-top:28px;display:flex;justify-content:space-between">' +
          '<button class="btn ghost" id="on-back">Back</button>' +
          '<button class="btn lg" id="on-start">Start learning</button></div>' +
          '</div>';
        $$('[data-og]', host).forEach(function (b) {
          b.addEventListener('click', function () { goal = +b.getAttribute('data-og'); TLSfx.play('select'); draw(); });
        });
        $('#on-back').addEventListener('click', function () { step = 0; TLSfx.play('tapSoft'); draw(); });
        $('#on-start').addEventListener('click', function () {
          TLStore.set('profile.course', pickedCourse);
          TLStore.set('profile.base', pickedBase);
          TLStore.set('daily.goal', goal);
          TLStore.set('profile.onboarded', true);
          TLStore.course(pickedCourse);
          TLSfx.play('complete');
          host.parentNode.removeChild(host);
          location.hash = '#/learn';
          renderRoute();
        });
      }
    }
    draw();
  }

  /* ================================================================== */
  /*  BOOT                                                              */
  /* ================================================================== */
  function boot() {
    TLStore.load();
    TLSfx.setEnabled(TLStore.get('settings.sfx') !== false);
    TLSfx.setVolume(TLStore.get('settings.sfxVolume') == null ? 0.5 : TLStore.get('settings.sfxVolume'));
    TLSpeech.setEnabled(TLStore.get('settings.voice') !== false);
    TLSpeech.setRate(TLStore.get('settings.speechRate') || 0.85);

    document.addEventListener('click', function once() {
      TLSfx.unlock();
      document.removeEventListener('click', once);
    }, { once: true });

    mountShell();
    renderRoute();

    if (!TLStore.get('profile.onboarded')) onboarding();

    window.addEventListener('hashchange', function () {
      TLSfx.play('whoosh');
      closeExplain();
      renderRoute();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeExplain(); closeModal(); }
    });

    setInterval(function () {
      TLStore.rollHearts();
      var el = $('#tb-hearts');
      if (el) {
        el.textContent = TLStore.state.stats.hearts;
        renderTopbar();
      }
    }, 30000);
  }

  root.TLUI = {
    boot: boot,
    render: renderRoute,
    go: go,
    toast: toast,
    modal: modal,
    closeModal: closeModal,
    xpFloat: xpFloat,
    openExplain: openExplain,
    closeExplain: closeExplain,
    startLesson: startLesson,
    icon: icon,
    esc: esc
  };
})(window);
