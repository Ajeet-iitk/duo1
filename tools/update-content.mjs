// Pulls fresh example sentences from Tatoeba (free, CC-BY) and writes
// assets/js/data/live-cache.js. Run: node tools/update-content.mjs
// A daily GitHub Action (.github/workflows/update-content.yml) does this for you.
import { writeFileSync } from 'node:fs';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const LANGS = { ta: 'tam', te: 'tel', gu: 'guj' };
const code = readFileSync('assets/js/data/curriculum.js', 'utf8');
const sandbox = { window: {} }; sandbox.self = sandbox.window;
vm.runInNewContext(code, sandbox);
const TL = sandbox.window.TLData;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const out = { updated: new Date().toISOString(), source: 'tatoeba.org (CC BY 2.0 FR)', sentences: {} };

for (const [id, tat] of Object.entries(LANGS)) {
  const course = TL.courses[id];
  const words = TL.allItems(course).map(w => w.en).filter(w => /^[a-z ]{3,14}$/i.test(w));
  const pick = words.sort(() => Math.random() - 0.5).slice(0, 40);
  const seen = new Set(); out.sentences[id] = [];
  for (const q of pick) {
    try {
      const url = `https://tatoeba.org/en/api_v0/search?from=eng&to=${tat}&query=${encodeURIComponent(q)}&trans_filter=limit&trans_to=${tat}&sort=relevance`;
      const j = await (await fetch(url)).json();
      for (const r of (j.results || []).slice(0, 4)) {
        const tr = (r.translations || []).flat().find(t => t.lang === tat);
        if (!tr || seen.has(tr.id) || r.text.length > 70) continue;
        seen.add(tr.id);
        const hi = (r.translations || []).flat().find(t => t.lang === 'hin');
        out.sentences[id].push({ id: tr.id, en: r.text, hi: hi ? hi.text : '', t: tr.text, w: q });
      }
    } catch (e) { console.warn('skip', q, e.message); }
    await sleep(350);
  }
  console.log(id, out.sentences[id].length, 'sentences');
}
writeFileSync('assets/js/data/live-cache.js', 'window.TLLiveCache = ' + JSON.stringify(out) + ';\n');
