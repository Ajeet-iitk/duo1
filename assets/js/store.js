/* ==========================================================================
   Bhasha — progress store
   Single source of truth for the learner's state, persisted to localStorage
   (with an in-memory fallback so the app still works when storage is blocked,
   e.g. some file:// contexts).
   ========================================================================== */
(function (root) {
  'use strict';

  var KEY = 'bhasha.state.v1';
  var DAY = 86400000;
  var HEART_REGEN_MS = 30 * 60 * 1000;   /* 1 heart back every 30 minutes */
  var MAX_HEARTS = 5;
  var MAX_CROWNS = 5;

  /* ---------------------------------------------------------- storage shim */
  var mem = {};
  function safeGet(k) {
    try { return root.localStorage.getItem(k); } catch (e) { return mem[k] == null ? null : mem[k]; }
  }
  function safeSet(k, v) {
    try { root.localStorage.setItem(k, v); } catch (e) { mem[k] = v; }
  }
  function safeDel(k) {
    try { root.localStorage.removeItem(k); } catch (e) { delete mem[k]; }
  }

  /* ------------------------------------------------------------ date utils */
  function dayKey(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function daysBetween(a, b) {
    /* both 'YYYY-MM-DD' local day keys */
    var A = new Date(a + 'T00:00:00'); var B = new Date(b + 'T00:00:00');
    return Math.round((B - A) / DAY);
  }

  /* ------------------------------------------------------------ defaults */
  function fresh(courseId, baseId) {
    return {
      v: 1,
      created: Date.now(),
      profile: {
        name: 'Learner',
        avatar: '🦉',
        course: courseId || 'ta',
        base: baseId || 'en',
        onboarded: false,
        joined: dayKey()
      },
      settings: {
        sfx: true,
        sfxVolume: 0.5,
        voice: true,
        speechRate: 0.85,
        confirmQuit: false,
        sidebarCollapsed: false,
        ai: {
          enabled: true,
          provider: 'offline',                 /* 'offline' | 'openai-compatible' */
          endpoint: 'https://api.openai.com/v1',
          key: '',
          model: 'gpt-4o-mini'
        }
      },
      stats: {
        xp: 0, gems: 500, hearts: MAX_HEARTS, heartsAt: Date.now(),
        streak: 0, longestStreak: 0, lastDay: null, freezes: 2,
        lessons: 0, correct: 0, wrong: 0, minutes: 0, bestCombo: 0,
        perfectLessons: 0
      },
      courses: {},
      daily: { date: dayKey(), xp: 0, goal: 50 },
      quests: { date: null, items: [] },
      achievements: {}
    };
  }

  function freshCourse() {
    return { xp: 0, lessons: {}, words: {}, unitsDone: {}, started: Date.now() };
  }

  var state = null;

  function load() {
    var raw = safeGet(KEY);
    if (raw) {
      try {
        var parsed = JSON.parse(raw);
        state = migrate(parsed);
      } catch (e) { state = fresh(); }
    } else {
      state = fresh();
    }
    rollDaily();
    rollHearts();
    rollQuests();
    return state;
  }

  function migrate(s) {
    var base = fresh();
    /* shallow-but-safe merge so new fields appear for existing users */
    s = s || {};
    function merge(a, b) {
      Object.keys(b).forEach(function (k) {
        if (a[k] === undefined || a[k] === null) a[k] = b[k];
        else if (typeof b[k] === 'object' && !Array.isArray(b[k])) merge(a[k], b[k]);
      });
      return a;
    }
    merge(s, base);
    s.profile = merge(s.profile || {}, base.profile);
    s.settings = merge(s.settings || {}, base.settings);
    s.settings.ai = merge(s.settings.ai || {}, base.settings.ai);
    s.stats = merge(s.stats || {}, base.stats);
    s.courses = s.courses || {};
    return s;
  }

  function save() { safeSet(KEY, JSON.stringify(state)); }

  /* --------------------------------------------------------------- hearts */
  function rollHearts() {
    var st = state.stats;
    if (st.hearts >= MAX_HEARTS) { st.heartsAt = Date.now(); return; }
    var elapsed = Date.now() - (st.heartsAt || Date.now());
    var gained = Math.floor(elapsed / HEART_REGEN_MS);
    if (gained > 0) {
      st.hearts = Math.min(MAX_HEARTS, st.hearts + gained);
      st.heartsAt = Date.now() - (elapsed % HEART_REGEN_MS);
      if (st.hearts >= MAX_HEARTS) st.heartsAt = Date.now();
      save();
    }
  }
  function heartsInMs() {
    var st = state.stats;
    if (st.hearts >= MAX_HEARTS) return 0;
    return Math.max(0, HEART_REGEN_MS - (Date.now() - st.heartsAt));
  }

  /* --------------------------------------------------------------- daily */
  function rollDaily() {
    var today = dayKey();
    if (state.daily.date !== today) {
      state.daily = { date: today, xp: 0, goal: state.daily.goal || 50 };
      save();
    }
  }

  function rollStreakOnPractice() {
    var st = state.stats, today = dayKey();
    if (st.lastDay === today) return { changed: false, streak: st.streak };
    if (st.lastDay && daysBetween(st.lastDay, today) === 1) {
      st.streak += 1;
    } else if (st.lastDay && daysBetween(st.lastDay, today) > 1) {
      /* a freeze can save a single missed day */
      if (st.freezes > 0 && daysBetween(st.lastDay, today) === 2) {
        st.freezes -= 1;
        st.streak += 1;
      } else {
        st.streak = 1;
      }
    } else {
      st.streak = 1;
    }
    st.lastDay = today;
    st.longestStreak = Math.max(st.longestStreak, st.streak);
    save();
    return { changed: true, streak: st.streak };
  }

  function streakCalendar(days) {
    days = days || 7;
    var out = [];
    var today = new Date();
    for (var i = days - 1; i >= 0; i--) {
      var d = new Date(today.getTime() - i * DAY);
      var key = dayKey(d);
      var active = key === state.stats.lastDay ||
        /* streak window: the n days ending at lastDay are 'on' */
        (state.stats.lastDay && daysBetween(key, state.stats.lastDay) >= 0 && daysBetween(key, state.stats.lastDay) < state.stats.streak);
      out.push({
        key: key,
        label: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()],
        active: !!active,
        isToday: i === 0
      });
    }
    return out;
  }

  /* ----------------------------------------------------------- per-course */
  function course(id) {
    id = id || state.profile.course;
    if (!state.courses[id]) { state.courses[id] = freshCourse(); save(); }
    return state.courses[id];
  }

  function lessonKey(unitId, index) { return unitId + ':' + index; }

  function lessonState(courseId, unitId, index) {
    var c = course(courseId);
    var rec = c.lessons[lessonKey(unitId, index)];
    return {
      crowns: rec ? rec.crowns : 0,
      done: !!(rec && rec.done),
      best: rec ? rec.best : 0,
      attempts: rec ? rec.attempts : 0
    };
  }

  /* Unit is unlocked once the previous unit is fully cleared. */
  function unitUnlocked(courseObj, unitIndex) {
    if (unitIndex === 0) return true;
    var prev = courseObj.units[unitIndex - 1];
    var c = course(courseObj.id);
    var total = TLData.lessonsPerUnit;
    var done = 0;
    for (var i = 0; i < total; i++) {
      if (c.lessons[lessonKey(prev.id, i)]) done++;
    }
    return done >= total;
  }

  function unitCompletion(courseObj, unit) {
    var c = course(courseObj.id);
    var total = TLData.lessonsPerUnit;
    var done = 0, crowns = 0;
    for (var i = 0; i < total; i++) {
      var rec = c.lessons[lessonKey(unit.id, i)];
      if (rec && rec.done) done++;
      crowns += rec ? rec.crowns : 0;
    }
    return { done: done, total: total, crowns: crowns, maxCrowns: total * MAX_CROWNS, pct: done / total };
  }

  function courseTotals(courseObj) {
    var lessons = 0, done = 0, crowns = 0;
    courseObj.units.forEach(function (u) {
      var uc = unitCompletion(courseObj, u);
      lessons += uc.total; done += uc.done; crowns += uc.crowns;
    });
    return { lessons: lessons, done: done, crowns: crowns, pct: lessons ? done / lessons : 0 };
  }

  /* --------------------------------------------------------------- awards */
  function addXp(amount, courseId) {
    state.stats.xp += amount;
    state.daily.xp += amount;
    if (courseId) course(courseId).xp += amount;
    save();
  }
  function addGems(n) { state.stats.gems = Math.max(0, state.stats.gems + n); save(); }
  function spendGems(n) {
    if (state.stats.gems < n) return false;
    state.stats.gems -= n; save(); return true;
  }
  function loseHeart() {
    var st = state.stats;
    if (st.hearts >= MAX_HEARTS) st.heartsAt = Date.now();
    st.hearts = Math.max(0, st.hearts - 1);
    save();
  }
  function refillHearts() { state.stats.hearts = MAX_HEARTS; state.stats.heartsAt = Date.now(); save(); }

  function markWord(courseId, itemId, correct) {
    if (!itemId) return;
    var c = course(courseId);
    var w = c.words[itemId] || { seen: 0, right: 0, wrong: 0, strength: 0 };
    w.seen++;
    if (correct) { w.right++; w.strength = Math.min(1, w.strength + 0.25); }
    else { w.wrong++; w.strength = Math.max(0, w.strength - 0.35); }
    w.last = Date.now();
    c.words[itemId] = w;
    save();
  }

  function completeLesson(opts) {
    /* opts: {courseId, unitId, index, correct, total, xp, crowns, timeMs, combo} */
    var c = course(opts.courseId);
    var key = lessonKey(opts.unitId, opts.index);
    var rec = c.lessons[key] || { crowns: 0, done: false, best: 0, attempts: 0 };
    rec.attempts += 1;
    rec.done = true;
    rec.best = Math.max(rec.best, Math.round((opts.correct / Math.max(1, opts.total)) * 100));
    if (opts.crownUp) rec.crowns = Math.min(MAX_CROWNS, rec.crowns + 1);
    else if (rec.crowns === 0) rec.crowns = 1;
    rec.last = Date.now();
    c.lessons[key] = rec;

    state.stats.lessons += 1;
    state.stats.correct += opts.correct;
    state.stats.wrong += opts.wrong || 0;
    state.stats.minutes += Math.round((opts.timeMs || 0) / 60000);
    state.stats.bestCombo = Math.max(state.stats.bestCombo, opts.combo || 0);
    if (opts.correct === opts.total) state.stats.perfectLessons += 1;
    addXp(opts.xp, opts.courseId);
    var streakInfo = rollStreakOnPractice();
    bumpQuest('xp', opts.xp);
    bumpQuest('lessons', 1);
    if (opts.correct === opts.total) bumpQuest('perfect', 1);
    checkAchievements();
    save();
    return { lesson: rec, streak: streakInfo };
  }

  /* --------------------------------------------------------------- quests */
  var QUEST_POOL = [
    { id: 'xp50', kind: 'xp', target: 50, label: 'Earn 50 XP', icon: '⚡' },
    { id: 'xp80', kind: 'xp', target: 80, label: 'Earn 80 XP', icon: '⚡' },
    { id: 'les2', kind: 'lessons', target: 2, label: 'Complete 2 lessons', icon: '📘' },
    { id: 'les3', kind: 'lessons', target: 3, label: 'Complete 3 lessons', icon: '📘' },
    { id: 'perf1', kind: 'perfect', target: 1, label: 'Finish a lesson with no mistakes', icon: '🎯' },
    { id: 'perf2', kind: 'perfect', target: 2, label: 'Finish 2 perfect lessons', icon: '🎯' },
    { id: 'words10', kind: 'words', target: 10, label: 'Answer 10 questions correctly', icon: '✅' }
  ];

  function rollQuests() {
    var today = dayKey();
    if (state.quests.date === today && state.quests.items.length) return;
    /* deterministic pick so a refresh does not reshuffle the day's quests */
    var seed = 0;
    for (var i = 0; i < today.length; i++) seed = (seed * 31 + today.charCodeAt(i)) % 9973;
    var pool = QUEST_POOL.slice();
    var picked = [];
    for (var k = 0; k < 3 && pool.length; k++) {
      var idx = (seed + k * 7) % pool.length;
      var q = pool.splice(idx, 1)[0];
      picked.push({ id: q.id, kind: q.kind, target: q.target, label: q.label, icon: q.icon, progress: 0, done: false, claimed: false });
    }
    state.quests = { date: today, items: picked };
    save();
  }

  function bumpQuest(kind, amount, courseId, itemId) {
    var changed = false;
    state.quests.items.forEach(function (q) {
      if (q.kind !== kind || q.done) return;
      q.progress = Math.min(q.target, q.progress + amount);
      if (q.progress >= q.target) { q.done = true; }
      changed = true;
    });
    if (kind === 'words' && itemId) {
      /* handled by caller via bumpQuest('words',1) */
    }
    if (changed) save();
  }

  function claimQuest(id) {
    var q = state.quests.items.filter(function (x) { return x.id === id; })[0];
    if (!q || !q.done || q.claimed) return false;
    q.claimed = true;
    var reward = 20;
    addGems(reward);
    root.TLSfx.play('coin');
    save();
    return reward;
  }

  /* -------------------------------------------------------- achievements */
  var ACHIEVEMENTS = [
    { id: 'first-lesson', label: 'First Steps', desc: 'Complete your first lesson', icon: '👣', test: function (s) { return s.stats.lessons >= 1; } },
    { id: 'five-lessons', label: 'Getting Warm', desc: 'Complete 5 lessons', icon: '🔥', test: function (s) { return s.stats.lessons >= 5; } },
    { id: 'streak3', label: 'On a Roll', desc: 'Reach a 3 day streak', icon: '📅', test: function (s) { return s.stats.longestStreak >= 3; } },
    { id: 'streak7', label: 'Week Warrior', desc: 'Reach a 7 day streak', icon: '🏆', test: function (s) { return s.stats.longestStreak >= 7; } },
    { id: 'xp100', label: 'Century', desc: 'Earn 100 XP', icon: '⚡', test: function (s) { return s.stats.xp >= 100; } },
    { id: 'xp500', label: 'Power Learner', desc: 'Earn 500 XP', icon: '🚀', test: function (s) { return s.stats.xp >= 500; } },
    { id: 'perfect', label: 'Flawless', desc: 'Finish a lesson with zero mistakes', icon: '🎯', test: function (s) { return s.stats.perfectLessons >= 1; } },
    { id: 'combo10', label: 'Ten in a Row', desc: 'Hit a 10 answer combo', icon: '💫', test: function (s) { return s.stats.bestCombo >= 10; } },
    { id: 'crown', label: 'Crowned', desc: 'Earn 10 crowns', icon: '👑', test: function () { return totalCrowns() >= 10; } },
    { id: 'polyglot', label: 'Polyglot', desc: 'Start lessons in two different languages', icon: '🌏', test: function () { return Object.keys(state.courses).filter(function (k) { return state.courses[k].xp > 0; }).length >= 2; } }
  ];

  function totalCrowns() {
    var n = 0;
    Object.keys(state.courses).forEach(function (k) {
      var c = state.courses[k];
      Object.keys(c.lessons).forEach(function (kk) { n += c.lessons[kk].crowns || 0; });
    });
    return n;
  }

  function checkAchievements() {
    var unlocked = [];
    ACHIEVEMENTS.forEach(function (a) {
      if (!state.achievements[a.id] && a.test(state)) {
        state.achievements[a.id] = Date.now();
        unlocked.push(a);
      }
    });
    if (unlocked.length) save();
    return unlocked;
  }

  function achievementList() {
    return ACHIEVEMENTS.map(function (a) {
      return { id: a.id, label: a.label, desc: a.desc, icon: a.icon, at: state.achievements[a.id] || null, on: !!state.achievements[a.id] };
    });
  }

  /* ------------------------------------------------------------------ api */
  function set(path, value) {
    var parts = path.split('.');
    var o = state;
    for (var i = 0; i < parts.length - 1; i++) { o = o[parts[i]] = o[parts[i]] || {}; }
    o[parts[parts.length - 1]] = value;
    save();
  }
  function get(path) {
    var parts = path.split('.');
    var o = state;
    for (var i = 0; i < parts.length; i++) { if (o == null) return undefined; o = o[parts[i]]; }
    return o;
  }
  function reset() { safeDel(KEY); mem = {}; state = fresh(); save(); }

  root.TLStore = {
    get state() { return state; },
    load: load,
    save: save,
    reset: reset,
    get: get,
    set: set,
    dayKey: dayKey,
    daysBetween: daysBetween,
    MAX_HEARTS: MAX_HEARTS,
    MAX_CROWNS: MAX_CROWNS,
    course: course,
    courseTotals: courseTotals,
    unitCompletion: unitCompletion,
    unitUnlocked: unitUnlocked,
    lessonState: lessonState,
    lessonKey: lessonKey,
    addXp: addXp,
    addGems: addGems,
    spendGems: spendGems,
    loseHeart: loseHeart,
    refillHearts: refillHearts,
    heartsInMs: heartsInMs,
    rollHearts: rollHearts,
    markWord: markWord,
    completeLesson: completeLesson,
    bumpQuest: bumpQuest,
    claimQuest: claimQuest,
    quests: function () { return state.quests; },
    achievements: achievementList,
    checkAchievements: checkAchievements,
    totalCrowns: totalCrowns,
    streakCalendar: streakCalendar
  };
})(window);
