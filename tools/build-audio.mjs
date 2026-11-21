// Builds pre-recorded audio clips for every Tamil / Telugu / Gujarati string in the app
// (words, phrases, letters, film lines, bundled sentences) so audio works offline and on
// devices that have no native voice. Run: node tools/build-audio.mjs
// Clips come from Google Translate TTS (fetched server-side, because browsers cannot call it).
// Resumable: existing files are skipped. Writes assets/audio/<lang>/<hash>[_s].mp3 and
// assets/js/data/audio-index.js.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import vm from 'node:vm';

function load(file) {
  const sb = { window: {} }; sb.self = sb.window; sb.console = console;
  vm.runInNewContext(readFileSync(file, 'utf8'), sb);
  return sb.window;
}
const TL = load('assets/js/data/curriculum.js').TLData;
const FILMS = load('assets/js/films.js').TLFilms; // films.js needs DOM only when called, data is static
const CACHE = load('assets/js/data/live-cache.js').TLLiveCache;

export function hash(s) { let h = 0x811c9dc5; for (const c of s) { h ^= c.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(36); }

const want = { ta: new Map(), te: new Map(), gu: new Map() };   // text -> {slow:boolean}
const add = (l, t, slow) => { t = String(t || '').trim(); if (!t || t.length > 190) return; const o = want[l].get(t) || { slow: false }; o.slow = o.slow || !!slow; want[l].set(t, o); };

for (const l of Object.keys(want)) {
  const c = TL.courses[l];
  TL.allItems(c).forEach(w => add(l, w.script, true));
  TL.allPhrases(c).forEach(p => add(l, p.script, true));
  (c.scriptInfo.letters || []).forEach(x => add(l, x[0], false));
  ((CACHE.sentences || {})[l] || []).forEach(s => add(l, s.t, true));
  (FILMS.data[l] || []).forEach(f => f.lines.forEach(ln => { add(l, ln.t, true); ln.w.forEach(w => add(l, w[0], false)); }));
}
add('ta', 'வணக்கம்', true); add('te', 'నమస్కారం', true); add('gu', 'કેમ છો', true);

const index = {};
const sleep = ms => new Promise(r => setTimeout(r, ms));
let done = 0, failed = 0, total = 0;
const jobs = [];
for (const [l, m] of Object.entries(want)) {
  mkdirSync(`assets/audio/${l}`, { recursive: true });
  index[l] = {};
  for (const [t, o] of m) { const h = hash(t); index[l][t] = o.slow ? h + ',s' : h; jobs.push({ l, t, h, slow: false }); if (o.slow) jobs.push({ l, t, h, slow: true }); }
}
total = jobs.length;
console.log('clips needed:', total);

async function fetchClip(j) {
  const f = `assets/audio/${j.l}/${j.h}${j.slow ? '_s' : ''}.mp3`;
  if (existsSync(f)) { done++; return; }
  const url = 'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=' + j.l + '&q=' + encodeURIComponent(j.t) + (j.slow ? '&ttsspeed=0.24' : '');
  for (let a = 0; a < 3; a++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const b = Buffer.from(await r.arrayBuffer());
      if (r.ok && /audio/.test(r.headers.get('content-type') || '') && b.length > 800) { writeFileSync(f, b); done++; return; }
    } catch (e) { /* retry */ }
    await sleep(800 * (a + 1));
  }
  failed++; console.warn('failed:', j.l, j.t);
}
let i = 0;
async function worker() { while (i < jobs.length) { const j = jobs[i++]; await fetchClip(j); await sleep(180); if ((done + failed) % 50 === 0) console.log(done + failed, '/', total); } }
await Promise.all([worker(), worker(), worker()]);
writeFileSync('assets/js/data/audio-index.js', 'window.TLAudioIndex = ' + JSON.stringify(index) + ';\n');
console.log('done', done, 'failed', failed);
