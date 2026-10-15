/* ==========================================================================
   Bhasha — exercise generator
   Turns a curriculum unit into a Duolingo-style lesson: a mixed sequence of
   recognition, listening, matching, word-bank building, typing and speaking
   questions, with distractor selection that respects what the learner has
   already met on the path.
   ========================================================================== */
(function (root) {
  'use strict';

  var uid = 0;
  function nid(p) { return (p || 'x') + '_' + (++uid); }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function gloss(item, base) { return base === 'hi' ? item.hi : item.en; }

  function norm(s) {
    var t = String(s == null ? '' : s).toLowerCase();
    if (t.normalize) t = t.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
    return t
      .replace(/[\u0964\u0965.,!?;:"'()\[\]{}।]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /* Pick n-1 distractors that are *plausible*: same unit first. */
  function distractors(pool, item, n, keyFn) {
    var key = keyFn || function (x) { return x.script; };
    var out = [], used = {}; used[key(item)] = 1;
    var ordered = shuffle(pool);
    for (var i = 0; i < ordered.length && out.length < n; i++) {
      var k = key(ordered[i]);
      if (used[k]) continue;
      if (gloss(ordered[i], 'en') === gloss(item, 'en')) continue;
      used[k] = 1;
      out.push(ordered[i]);
    }
    return out;
  }

  function optionsFor(pool, item, base, mode) {
    var d = distractors(pool, item, 3, function (x) { return mode === 'meaning' ? gloss(x, base) : x.script; });
    var all = shuffle(d.concat([item]));
    return all.map(function (x) {
      return {
        id: x.id,
        label: mode === 'meaning' ? gloss(x, base) : x.script,
        sub: mode === 'meaning' ? '' : x.roman,
        correct: x.id === item.id
      };
    });
  }

  /* ----------------------------------------------------------- factories */
  function makeChoice(course, pool, item, base) {
    var askMeaning = Math.random() < 0.5;
    return {
      id: nid('ch'),
      type: 'choice',
      itemId: item.id,
      title: askMeaning ? 'What does this mean?' : 'Which one is this?',
      prompt: askMeaning ? item.script : gloss(item, base),
      promptSub: askMeaning ? item.roman : '',
      promptIsScript: askMeaning,
      speak: askMeaning ? { text: item.script, roman: item.roman, lang: course.speech } : null,
      options: optionsFor(pool, item, base, askMeaning ? 'meaning' : 'script'),
      key: askMeaning ? gloss(item, base) : item.script,
      explainItem: item
    };
  }

  function makeListen(course, pool, item, base) {
    var opts = optionsFor(pool, item, base, 'script');
    return {
      id: nid('ls'),
      type: 'listen',
      itemId: item.id,
      title: 'Tap what you hear',
      audio: { text: item.script, roman: item.roman, lang: course.speech },
      options: opts,
      key: item.script,
      explainItem: item
    };
  }

  function makeMatch(course, pool, base) {
    var picks = shuffle(pool).slice(0, 4);
    while (picks.length < 3) picks.push(pool[Math.floor(Math.random() * pool.length)]);
    var items = picks.map(function (p) {
      return { id: p.id, script: p.script, roman: p.roman, meaning: gloss(p, base), lang: course.speech };
    });
    return {
      id: nid('mt'),
      type: 'match',
      title: 'Tap the matching pairs',
      and: 'Match ' + course.name + ' to ' + (base === 'hi' ? 'Hindi' : 'English'),
      pairs: items,
      explainItem: items[0] ? { id: '', script: items[0].script, roman: items[0].roman, en: items[0].meaning, hi: items[0].meaning } : null
    };
  }

  function makeTiles(course, pool, phrase, base) {
    var target = phrase.tiles;
    var bank = target.slice();
    /* add distractors: words from other phrases/items in the pool */
    var extraWords = [];
    TLData.allPhrases(course).forEach(function (p) {
      p.tiles.forEach(function (t) { if (target.indexOf(t) === -1 && extraWords.indexOf(t) === -1) extraWords.push(t); });
    });
    shuffle(extraWords).slice(0, target.length >= 4 ? 3 : 4).forEach(function (w) { bank.push(w); });
    /* make sure there is at least one distractor */
    if (bank.length === target.length) {
      var alt = pool.filter(function (p) { return target.indexOf(p.script) === -1; })[0];
      if (alt) bank.push(alt.script);
    }
    return {
      id: nid('tl'),
      type: 'tiles',
      title: 'Translate this sentence',
      prompt: gloss(phrase, base),
      promptIsScript: false,
      target: target.join(' '),
      tiles: shuffle(bank),
      speak: { text: phrase.script, roman: phrase.roman, lang: course.speech },
      key: phrase.script,
      explainItem: { id: '', script: phrase.script, roman: phrase.roman, en: phrase.en, hi: phrase.hi }
    };
  }

  function makeType(course, item, base) {
    return {
      id: nid('ty'),
      type: 'type',
      title: 'Write this in ' + course.name,
      prompt: gloss(item, base),
      promptIsScript: false,
      accept: [item.script, item.roman, item.roman.replace(/ /g, '')],
      key: item.script,
      reveal: item,
      speak: { text: item.script, roman: item.roman, lang: course.speech },
      explainItem: item
    };
  }

  function makeSpeak(course, phraseOrItem, base) {
    return {
      id: nid('sp'),
      type: 'speak',
      title: 'Say this sentence',
      text: phraseOrItem.script,
      roman: phraseOrItem.roman,
      meaning: gloss(phraseOrItem, base),
      lang: course.speech,
      accept: [phraseOrItem.script, phraseOrItem.roman],
      key: phraseOrItem.script,
      explainItem: phraseOrItem
    };
  }

  function makeAlphabetChoice(course, pool, item, base) {
    /* For unit 0 the "meaning" is the letter name, so skip roman prompts */
    return {
      id: nid('ab'),
      type: 'choice',
      itemId: item.id,
      title: 'Which letter is this?',
      prompt: item.script,
      promptSub: '',
      promptIsScript: true,
      speak: { text: item.script, roman: item.roman, lang: course.speech },
      options: optionsFor(pool, item, base, 'meaning').map(function (o) {
        return { id: o.id, label: o.label, sub: '', correct: o.correct };
      }),
      key: gloss(item, base),
      explainItem: item
    };
  }

  /* -------------------------------------------------------------- lesson */
  function build(course, unit, lessonIndex, base) {
    var pool = TLData.corpus(course, unit, lessonIndex);
    var items = shuffle(unit.items);
    var phrases = shuffle(unit.phrases || []);
    var isScript = unit.id.indexOf('u0') > -1;
    var out = [];

    function push(x) { if (x) out.push(x); }

    /* Safe accessor: units have different item counts, so wrap around. */
    function at(i) { return items[i % items.length]; }

    if (isScript) {
      /* pure recognition drill for the alphabet unit */
      var seq = items.slice(0, Math.min(8, items.length));
      seq.forEach(function (it, i) {
        if (i === 2 || i === 6) push(makeListen(course, pool, it, base));
        else push(makeAlphabetChoice(course, pool, it, base));
      });
      if (pool.length >= 4) push(makeMatch(course, pool, base));
      push(makeType(course, at(0), base));
      if (pool.length >= 4) push(makeListen(course, pool, at(3), base));
      return { id: unit.id + ':' + lessonIndex, title: 'Sounds & Script', exercises: out, unit: unit };
    }

    var a = at(0), b = at(1), c = at(2), d = at(3), e = at(4), f = at(5), g = at(6);

    push(makeChoice(course, pool, a, base));
    push(makeListen(course, pool, b, base));
    if (phrases[0]) push(makeTiles(course, pool, phrases[0], base));
    push(makeChoice(course, pool, c, base));
    if (pool.length >= 4) push(makeMatch(course, pool, base));
    push(makeChoice(course, pool, d, base));
    push(makeType(course, e, base));
    if (phrases[1]) push(makeTiles(course, pool, phrases[1], base));
    push(makeListen(course, pool, f, base));
    if (phrases[0]) push(makeSpeak(course, phrases[0], base));
    push(makeChoice(course, pool, g, base));
    push(makeType(course, b, base));

    /* review: sprinkle in an earlier word for lessons 2 and up */
    if (lessonIndex >= 2 && pool.length > unit.items.length) {
      var review = pool.filter(function (p) { return unit.items.indexOf(p) === -1; });
      if (review.length) out.splice(5, 0, makeChoice(course, pool, review[0], base));
    }

    /* lesson length scales a little with the path */
    var targetLen = 12;
    return { id: unit.id + ':' + lessonIndex, title: unit.title, exercises: out.slice(0, targetLen), unit: unit };
  }

  /* -------------------------------------------------------------- grading */
  function check(exercise, answer) {
    /* returns { correct: bool, expected: string } */
    switch (exercise.type) {
      case 'choice':
      case 'listen': {
        var opt = exercise.options.filter(function (o) { return o.id === answer; })[0];
        return { correct: !!(opt && opt.correct), expected: exercise.key };
      }
      case 'tiles': {
        var joined = (answer || []).join(' ').trim();
        return { correct: norm(joined) === norm(exercise.target), expected: exercise.target, given: joined };
      }
      case 'type': {
        var given = norm(answer);
        var ok = exercise.accept.some(function (a) { return norm(a) === given; });
        if (!ok) {
          /* be generous: allow a small typo on the romanisation */
          ok = exercise.accept.some(function (a) {
            return root.TLSpeech.similar(a, answer) >= 0.82;
          });
        }
        return { correct: ok, expected: exercise.key, given: answer };
      }
      case 'match':
        return { correct: answer === true, expected: 'all pairs matched' };
      case 'speak':
        if (answer && typeof answer === 'object') {
          var best = 0;
          (answer.alts || []).forEach(function (t) {
            exercise.accept.forEach(function (a) { best = Math.max(best, root.TLSpeech.similar(t, a)); });
          });
          return { correct: best >= 0.5, expected: exercise.text, heard: answer.heard, score: best };
        }
        return { correct: !!answer, expected: exercise.text, selfReported: true };
      default:
        return { correct: false, expected: '' };
    }
  }

  root.TLEx = {
    build: build,
    check: check,
    shuffle: shuffle,
    gloss: gloss,
    norm: norm,
    distractors: distractors
  };
})(window);
