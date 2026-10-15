/* ==========================================================================
   Bhasha — AI explainer
   Two engines behind one API:
     1. "Built-in"  — deterministic, offline, generated from the curriculum
                      (script decomposition, syllable split, cognates,
                      mnemonic, usage pattern, common mistakes).
     2. "LLM"       — any OpenAI-compatible /chat/completions endpoint.
   The UI never has to care which one answered; both return the same shape.
   ========================================================================== */
(function (root) {
  'use strict';

  /* ------------------------------------------------------------- helpers */
  function cfg() { return root.TLStore.get('settings.ai') || {}; }
  function online() {
    var c = cfg();
    return c.enabled !== false && c.provider === 'openai-compatible' && !!c.key && !!c.endpoint;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Crude but useful syllabifier for romanisations: splits C?V(C) chunks. */
  function syllables(word) {
    var w = String(word || '').toLowerCase();
    var out = [], cur = '';
    var vowels = 'aeiou';
    for (var i = 0; i < w.length; i++) {
      var ch = w[i];
      if (!/[a-z]/.test(ch)) { if (cur) { out.push(cur + ch); cur = ''; } else out.push(ch); continue; }
      cur += ch;
      var isVowel = vowels.indexOf(ch) > -1;
      var nextIsVowel = i + 1 < w.length && vowels.indexOf(w[i + 1]) > -1;
      var nextIsCons = i + 1 < w.length && /[a-z]/.test(w[i + 1]) && !nextIsVowel;
      if (isVowel && !nextIsVowel) { out.push(cur); cur = ''; }
      else if (isVowel && nextIsVowel && cur.length >= 2) { out.push(cur); cur = ''; }
    }
    if (cur) out.push(cur);
    return out.filter(Boolean);
  }

  /* Decompose target script into known letters from the course alphabet. */
  function decompose(course, text) {
    var map = {};
    ((course.scriptInfo && course.scriptInfo.letters) || []).forEach(function (L) { map[L[0]] = L; });
    var out = [];
    String(text || '').split('').forEach(function (ch) {
      if (ch === ' ') { out.push({ ch: ' ', kind: 'space' }); return; }
      if (map[ch]) { out.push({ ch: ch, kind: 'letter', roman: map[ch][1], hint: map[ch][2] }); return; }
      if (/[\u0900-\u097f\u0b80-\u0bff\u0c00-\u0c7f\u0a80-\u0aff]/.test(ch)) {
        out.push({ ch: ch, kind: 'mark' });
      } else {
        out.push({ ch: ch, kind: 'other' });
      }
    });
    return out;
  }

  /* Find words in the same course that look/sound related to this one. */
  function related(course, item) {
    if (!item || !item.roman) return [];
    var target = item.roman.toLowerCase();
    var stem = target.slice(0, Math.max(3, Math.ceil(target.length / 2)));
    var out = [];
    TLData.allItems(course).forEach(function (w) {
      if (w.id === item.id) return;
      var r = (w.roman || '').toLowerCase();
      if (r && (r.indexOf(stem) > -1 || stem.indexOf(r.slice(0, 3)) > -1) && out.length < 4) out.push(w);
    });
    return out;
  }

  /* Look up the lesson context: which unit, what grammar notes apply. */
  function contextFor(course, itemId) {
    var ctx = { unit: null, notes: [], baseLabel: baseLabel() };
    course.units.forEach(function (u) {
      if (u.items.some(function (i) { return i.id === itemId; })) {
        ctx.unit = u;
        ctx.notes = u.notes || [];
      }
    });
    return ctx;
  }
  function baseLabel() {
    var b = root.TLStore.get('profile.base');
    return b === 'hi' ? 'Hindi' : 'English';
  }
  function gloss(item, base) {
    if (!item) return '';
    return base === 'hi' ? item.hi : item.en;
  }

  /* Quiz a natural example sentence containing the word, if we have one. */
  function examplesFor(course, item, base) {
    var out = [];
    (TLData.allPhrases(course) || []).forEach(function (p) {
      if (!item) return;
      var hitScript = p.script && item.script && p.script.indexOf(item.script) > -1;
      var hitRoman = item.roman && p.roman && p.roman.toLowerCase().indexOf(item.roman.toLowerCase().split(' ')[0]) > -1;
      if (hitScript || hitRoman) out.push(p);
    });
    return out.slice(0, 3);
  }

  /* --------------------------------------------------------- offline text */
  function offlineExplanation(course, item, opts) {
    opts = opts || {};
    var base = root.TLStore.get('profile.base');
    var ctx = contextFor(course, item ? item.id : '');
    var meaning = gloss(item, base);
    var parts = [];

    if (!item) {
      parts.push('<b>' + esc(course.name) + ' explainer</b>');
      parts.push('<span class="sec">Ask me about any word, sentence or grammar point — for example "why does the verb go last?" or "how do I say <i>thank you</i>?"</span>');
      return parts.join('');
    }

    /* 1. Headline */
    parts.push('<b>' + esc(item.script) + '</b> — ' + esc(item.roman) + ' · ' + esc(meaning));

    /* 2. If the learner asked something specific, answer that first. */
    if (opts.question) {
      parts.push('<span class="sec"><b>Answer.</b> ' + esc(offlineAnswer(course, item, opts.question, base)) + '</span>');
    }

    /* 3. Pronunciation, split into syllables */
    var syl = syllables(item.roman);
    parts.push('<span class="sec"><b>Pronunciation.</b> ' +
      syl.map(function (s) { return '<span class="k">' + esc(s) + '</span>'; }).join(' · ') +
      (course.id === 'ta' ? ' <i>(Tamil cares about vowel length — hold long vowels roughly twice as long.)</i>' :
        course.id === 'te' ? ' <i>(Telugu is very regular: every syllable gets equal, even rhythm.)</i>' :
          ' <i>(Gujarati stress usually falls on the first syllable.)</i>') +
      '</span>');

    /* 4. Script decomposition — the part textbooks forget to explain */
    var dec = item.script.length <= 32 ? decompose(course, item.script).filter(function (d) { return d.kind !== 'space'; }) : [];
    if (dec.length) {
      var known = dec.filter(function (d) { return d.kind === 'letter'; });
      if (known.length) {
        parts.push('<span class="sec"><b>Reading it letter by letter.</b> ' +
          dec.map(function (d) {
            if (d.kind === 'letter') return '<span class="k">' + esc(d.ch) + '</span> ' + esc(d.roman);
            if (d.kind === 'mark') return '<span class="k">' + esc(d.ch) + '</span> <i>vowel sign / virama — modifies the letter before it</i>';
            return esc(d.ch);
          }).join(' + ') +
          ' <i>(' + (course.scriptInfo ? course.scriptInfo.name : '') + ')</i></span>');
        var hints = known.filter(function (d) { return d.hint; });
        if (hints.length) {
          parts.push('<span class="sec">' + hints.map(function (d) {
            return '<span class="k">' + esc(d.ch) + '</span> ' + esc(d.hint);
          }).join(' &nbsp; ') + '</span>');
        }
      } else {
        parts.push('<span class="sec"><b>Script.</b> ' + esc(course.scriptInfo.blurb) + '</span>');
      }
    }

    /* 4. Grammar / usage from the unit notes */
    if (ctx.notes && ctx.notes.length) {
      parts.push('<span class="sec"><b>How it behaves.</b></span>');
      ctx.notes.slice(0, 2).forEach(function (n) {
        parts.push('<span class="sec">• <b>' + esc(n.title) + '</b> — ' + esc(n.body) + '</span>');
      });
    }

    /* 5. Live examples */
    var ex = examplesFor(course, item, base);
    if (ex.length) {
      parts.push('<span class="sec"><b>In the wild.</b></span>');
      ex.forEach(function (p) {
        parts.push('<span class="sec"><span class="k">' + esc(p.script) + '</span><br>' + esc(p.roman) + ' — ' + esc(gloss(p, base)) + '</span>');
      });
    }

    /* 6. Cognates / neighbours */
    var rel = related(course, item);
    if (rel.length) {
      parts.push('<span class="sec"><b>Sounds like.</b> ' + rel.map(function (w) {
        return '<span class="k">' + esc(w.script) + '</span> ' + esc(gloss(w, base));
      }).join(' &nbsp; ') + '</span>');
    }

    /* 7. Mnemonic — small, honest memory hook */
    parts.push('<span class="sec"><b>Memory hook.</b> ' + esc(mnemonic(course, item, base)) + '</span>');

    return parts.join('');
  }

  function mnemonic(course, item, base) {
    var roman = item.roman || '';
    var first = syllables(roman)[0] || roman;
    var m = {
      ta: 'Say "' + first + '" and picture the first letter of "' + gloss(item, base) + '". Tamil rarely changes a word once you have the root — anchor the root and the rest follows.',
      te: 'Telugu words almost always end in a vowel, so let "' + roman + '" ring out on the last sound. Rhyme it with a word you already know.',
      gu: 'Gujarati shares most of its vocabulary with Hindi, so link "' + roman + '" to the Hindi word "' + item.hi + '" and keep the sound, not the spelling.'
    };
    return m[course.id] || m.gu;
  }

  function offlineAnswer(course, item, question, base) {
    var q = String(question || '').toLowerCase();
    var syl = item && item.roman ? syllables(item.roman).join(' · ') : '';
    if (/why.*(verb|last|end)|word order|order of words/.test(q))
      return course.id === 'gu'
        ? 'Gujarati is Subject–Object–Verb, like Hindi: "I rice eat". The verb closes the sentence, and the auxiliary છે/છું follows it.'
        : 'Dravidian languages put the verb last. Subject, then object, then verb: "I rice eat". Anything that describes the verb (time, place) sits just before it.';
    if (/polite|formal|respect/.test(q))
      return 'Use the plural/respectful "you" form with anyone older or unfamiliar: ' +
        (course.id === 'ta' ? 'நீங்கள் / -கள் endings' : course.id === 'te' ? 'మీరు with -ారు verb endings' : 'તમે with છે/છો endings') + '.';
    if (/gender|masculine|feminine/.test(q))
      return course.id === 'gu'
        ? 'Gujarati has three genders (masculine, feminine, neuter). Adjectives and verbs agree with the noun, so મોટું ઘર but મોટો ભાઈ.'
        : 'Tamil and Telugu have no grammatical gender — the same word works for men and women. Only the word you choose for "he/she" changes.';
    if (/script|alphabet|letter|read|writ|spell/.test(q))
      return 'Read it one letter at a time and say each sound out loud before joining them: ' +
        (syl || (course.scriptInfo ? course.scriptInfo.vowelHint : '')) +
        '. ' + (course.scriptInfo ? course.scriptInfo.blurb.split('. ')[0] + '.' : '');
    if (/listen|ear|hear|sound|pronounc|say/.test(q))
      return 'Break it into syllables and hold long vowels about twice as long: ' + (syl || item.roman) +
        '. Tap 🔊 as many times as you like — copy the rhythm of the whole word first, then the individual sounds. ' +
        (course.id === 'te' ? 'Telugu keeps every syllable even and short.' :
          course.id === 'ta' ? 'Tamil is strict about vowel length.' :
            'Gujarati stress usually lands on the first syllable.');
    if (/remember|memor|forget|mnemonic/.test(q))
      return mnemonic(course, item, base);
    if (/example|sentence|use it|context/.test(q)) {
      var ex = examplesFor(course, item, base);
      return ex.length
        ? 'Here it is in a real sentence: ' + ex[0].script + ' (' + ex[0].roman + ') — ' + gloss(ex[0], base) + '.'
        : 'Build one yourself with the pattern from this unit: subject first, verb last.';
    }
    if (/similar|hindi|english|like|cognate/.test(q))
      return course.id === 'gu'
        ? 'Many everyday Gujarati words are cousins of the Hindi word you already know (' + item.hi + ').'
        : 'The word ' + item.script + ' has no English cousin, so learn it as a picture, not as a translation.';
    var notes = contextFor(course, (item && item.id) || '').notes;
    return 'Good question. The key idea for this lesson is: ' +
      (notes[0] ? notes[0].body : 'learn the word as one whole sound first, then break it into letters.') +
      ' Try saying ' + (item && item.roman ? item.roman : 'it') + ' out loud three times, then hit 🔊 and compare.';
  }

  /* ------------------------------------------------------------- LLM call */
  function systemPrompt(course, base) {
    var b = base === 'hi' ? 'Hindi' : 'English';
    return 'You are Bhasha, a warm, funny and precise ' + course.name + ' tutor inside a language-learning app. ' +
      'The learner is a native ' + b + ' speaker. Rules: ' +
      '1) Always give the ' + course.name + ' script, then a romanisation, then the ' + b + ' meaning. ' +
      '2) Explain WHY, not just what — grammar, pattern, register. ' +
      '3) Keep answers under 160 words, use short paragraphs, no markdown headings. ' +
      '4) Add one tiny memory hook or example sentence. ' +
      '5) If you are unsure of a form, say so briefly and give the safe everyday version. ' +
      '6) Never invent a word — prefer simpler, certain vocabulary.';
  }

  function llm(messages, opts) {
    opts = opts || {};
    var c = cfg();
    var url = String(c.endpoint || '').replace(/\/+$/, '') + '/chat/completions';
    var controller = root.AbortController ? new root.AbortController() : null;
    var timer = setTimeout(function () { try { controller && controller.abort(); } catch (e) {} }, opts.timeout || 25000);
    return root.fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + c.key
      },
      body: JSON.stringify({
        model: c.model || 'gpt-4o-mini',
        messages: messages,
        temperature: 0.4,
        max_tokens: opts.maxTokens || 500
      }),
      signal: controller ? controller.signal : undefined
    }).then(function (r) {
      clearTimeout(timer);
      if (!r.ok) {
        return r.text().then(function (t) {
          throw new Error('API ' + r.status + ': ' + String(t).slice(0, 200));
        });
      }
      return r.json();
    }).then(function (j) {
      var txt = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
      if (!txt) throw new Error('Empty response from model');
      return String(txt).trim();
    });
  }

  /* ---------------------------------------------------------------- API */

  /* explain(item) -> Promise<{html, engine}> */
  function explain(item, opts) {
    opts = opts || {};
    var course = TLData.courses[opts.courseId || root.TLStore.get('profile.course')];
    var base = root.TLStore.get('profile.base');
    var builtIn = offlineExplanation(course, item, opts);

    if (!online()) {
      return Promise.resolve({ html: builtIn, engine: 'built-in' });
    }
    var c = cfg();
    var facts = '';
    if (item) {
      facts = 'Word: ' + item.script + ' (roman: ' + item.roman + '), meaning in ' + (base === 'hi' ? 'Hindi: ' + item.hi : 'English: ' + item.en) + '.';
      var ctx = contextFor(course, item.id);
      if (ctx.unit) facts += ' Unit: "' + ctx.unit.title + '".';
      if (ctx.notes && ctx.notes.length) facts += ' Unit grammar notes: ' + ctx.notes.map(function (n) { return n.title + ': ' + n.body; }).join(' ');
    } else {
      facts = 'No specific word selected.';
    }
    var q = opts.question ? 'Learner asked: ' + opts.question : 'Explain this item so it sticks: pronunciation, script, grammar pattern, and one memory hook.';

    return llm([
      { role: 'system', content: systemPrompt(course, base) },
      { role: 'user', content: 'Language: ' + course.name + '. ' + facts + '\n' + q }
    ]).then(function (txt) {
      return { html: esc(txt).replace(/\n\n+/g, '</span><span class="sec">').replace(/\n/g, '<br>'), engine: c.model || 'llm' };
    }).catch(function (err) {
      return {
        html: builtIn + '<span class="sec" style="color:#ea2b2b"><b>Note:</b> the AI model could not be reached (' + esc(err.message) + '), so this explanation came from the built-in tutor.</span>',
        engine: 'built-in',
        error: err.message
      };
    });
  }

  /* whyWrong() -> Promise<string html> — shown in the lesson footer */
  function whyWrong(question, given, correct, courseId) {
    var course = TLData.courses[courseId || root.TLStore.get('profile.course')];
    var base = root.TLStore.get('profile.base');
    if (!online()) return Promise.resolve('');
    return llm([
      { role: 'system', content: systemPrompt(course, base) },
      {
        role: 'user',
        content: 'The learner got this wrong.\nQuestion: ' + question +
          '\nThey answered: ' + given + '\nCorrect answer: ' + correct +
          '\nIn ONE sentence under 25 words, explain the single most useful thing to notice.'
      }
    ], { maxTokens: 90 }).then(function (t) { return esc(t); }).catch(function () { return ''; });
  }

  /* tutor chat */
  function ask(question, history, opts) {
    opts = opts || {};
    var course = TLData.courses[opts.courseId || root.TLStore.get('profile.course')];
    var base = root.TLStore.get('profile.base');
    var builtIn = offlineAnswer(course, { id: '', script: '', roman: '', en: '', hi: '' }, question, base);

    if (!online()) {
      /* Keyword search over the curriculum so offline answers are still real. */
      var hit = searchCurriculum(course, question);
      var body = builtIn;
      if (hit) {
        body = '<b>' + esc(hit.script) + '</b> — ' + esc(hit.roman) + ' = ' + esc(gloss(hit, base)) +
          '<span class="sec">' + esc(contextFor(course, hit.id).notes.map(function (n) { return n.title + ': ' + n.body; }).join(' ')) + '</span>' +
          '<span class="sec">' + esc(builtIn) + '</span>';
      }
      return Promise.resolve({ html: body, engine: 'built-in' });
    }
    var msgs = [{ role: 'system', content: systemPrompt(course, base) }];
    (history || []).slice(-8).forEach(function (m) { msgs.push(m); });
    msgs.push({ role: 'user', content: question });
    return llm(msgs).then(function (t) {
      return { html: esc(t).replace(/\n\n+/g, '</span><span class="sec">').replace(/\n/g, '<br>'), engine: cfg().model };
    }).catch(function (e) {
      return { html: builtIn + '<span class="sec" style="color:#ea2b2b"><b>Offline:</b> ' + esc(e.message) + '</span>', engine: 'built-in' };
    });
  }

  function searchCurriculum(course, q) {
    var needle = String(q || '').toLowerCase();
    var tokens = needle.replace(/[^a-z\u0900-\u097f\s]/g, ' ').split(/\s+/).filter(function (t) { return t.length > 2; });
    var best = null, bestScore = 0;
    TLData.allItems(course).forEach(function (w) {
      var hay = (w.en + ' ' + w.hi + ' ' + w.roman + ' ' + w.script).toLowerCase();
      var score = 0;
      tokens.forEach(function (t) { if (hay.indexOf(t) > -1) score += t.length; });
      if (score > bestScore) { bestScore = score; best = w; }
    });
    return bestScore > 0 ? best : null;
  }

  /* Test the connection from Settings */
  function testConnection() {
    var course = TLData.courses[root.TLStore.get('profile.course')];
    return llm([
      { role: 'system', content: systemPrompt(course, root.TLStore.get('profile.base')) },
      { role: 'user', content: 'Reply with exactly: ready' }
    ], { maxTokens: 10, timeout: 15000 }).then(function (t) { return { ok: true, text: t }; })
      .catch(function (e) { return { ok: false, text: e.message }; });
  }

  root.TLAI = {
    explain: explain,
    ask: ask,
    whyWrong: whyWrong,
    testConnection: testConnection,
    syllables: syllables,
    decompose: decompose,
    offlineExplanation: offlineExplanation,
    get online() { return online(); }
  };
})(window);
