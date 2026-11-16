const test = require('node:test');
const assert = require('node:assert');
require('../js/rng.js');
require('../data/index.js');
require('../js/gen/index.js');
require('../js/gen/kahoot.js');

const FCE = globalThis.FCE;
const all = () => FCE.gen.allEntries();
const ofSection = (id) => all().filter((e) => e.section.id === id);
const pool = (tipo) => all().filter((e) => e.section.tipo === tipo);

test('allEntries flattens every item with its section', () => {
  assert.strictEqual(all().length, 99);
  assert.ok(all().every((e) => e.item && e.section && e.section.items.includes(e.item)));
});

test('pares question has unique options and answer index points to the correct one', () => {
  const entries = ofSection('t1-adjetivos');
  const qs = FCE.gen.kahoot(entries, pool('pares'), FCE.rng.make(5));
  assert.strictEqual(qs.length, 20);
  for (const q of qs) {
    assert.strictEqual(q.kind, 'kahoot');
    assert.strictEqual(q.options.length, 4);
    assert.strictEqual(new Set(q.options).size, 4);
    const item = entries.find((e) => e.item.id === q.itemIds[0]).item;
    assert.ok([item.termino, item.definicion].includes(q.options[q.answer]));
    assert.ok(q.explain.includes(item.termino));
  }
});

test('with a pool of 2 entries produces 2 unique options and does not crash', () => {
  const entries = ofSection('t1-phrasal').slice(0, 2);
  const qs = FCE.gen.kahoot(entries, entries, FCE.rng.make(1));
  assert.strictEqual(qs.length, 2);
  for (const q of qs) {
    assert.strictEqual(q.options.length, 2);
    assert.strictEqual(new Set(q.options).size, 2);
  }
  const single = FCE.gen.kahoot(entries.slice(0, 1), entries.slice(0, 1), FCE.rng.make(1));
  assert.strictEqual(single[0].options.length, 1);
});

test('the other "count on" never shows up as an option or duplicate (seeds 1-30)', () => {
  const entries = [...ofSection('t1-phrasal'), ...ofSection('t2-phrasal')];
  const defs = { 't1-pv-count-on': 'rely on; depend on', 't2-pv-count-on': 'to be able to depend on something or someone' };
  for (let seed = 1; seed <= 30; seed++) {
    const qs = FCE.gen.kahoot(entries, pool('pares'), FCE.rng.make(seed));
    for (const q of qs) {
      if (q.itemIds[0] === 't1-pv-count-on') assert.ok(!q.options.includes(defs['t2-pv-count-on']), 'leak T2 def into T1 question');
      if (q.itemIds[0] === 't2-pv-count-on') assert.ok(!q.options.includes(defs['t1-pv-count-on']), 'leak T1 def into T2 question');
      assert.strictEqual(q.options.filter((o) => o === 'count on').length <= 1, true);
    }
  }
});

test('colocaciones kahoot has exactly options ["do","make"] and the right answer', () => {
  const entries = ofSection('t1-do-make');
  const qs = FCE.gen.kahoot(entries, pool('colocaciones'), FCE.rng.make(2));
  assert.strictEqual(qs.length, 29);
  for (const q of qs) {
    assert.deepStrictEqual(q.options, ['do', 'make']);
    const item = entries.find((e) => e.item.id === q.itemIds[0]).item;
    assert.strictEqual(q.options[q.answer], item.verbo);
    assert.ok(q.prompt.includes('___'));
  }
});

test('antonimos, tabla, regla and estructura questions have a correct answer in options', () => {
  for (const id of ['t1-antonimos', 't2-comparativos', 't2-irregulares', 't1-present-perfect', 't2-ed-ing', 't2-expressions']) {
    const entries = ofSection(id);
    const qs = FCE.gen.kahoot(entries, pool(entries[0].section.tipo), FCE.rng.make(9));
    assert.strictEqual(qs.length, entries.length, id);
    for (const q of qs) {
      assert.ok(q.options[q.answer] !== undefined, id);
      assert.strictEqual(new Set(q.options).size, q.options.length, id);
    }
  }
});

test('estructura question prompts with the example, so shared purposes are not ambiguous', () => {
  const entries = ofSection('t2-expressions');
  const qs = FCE.gen.kahoot(entries, pool('estructura'), FCE.rng.make(3));
  const byFar = qs.find((q) => q.itemIds[0] === 't2-expr-by-far');
  assert.ok(byFar.prompt.includes("This restaurant's pizza is by far"));
  assert.strictEqual(byFar.options[byFar.answer], 'by far + superlative');
});

test('same seed gives same questions', () => {
  const entries = ofSection('t2-phrasal');
  const a = FCE.gen.kahoot(entries, pool('pares'), FCE.rng.make(77));
  const b = FCE.gen.kahoot(entries, pool('pares'), FCE.rng.make(77));
  assert.deepStrictEqual(a, b);
});

test('SUPPORT lists at least two kinds for every tipo', () => {
  for (const [tipo, kinds] of Object.entries(FCE.gen.SUPPORT)) assert.ok(kinds.length >= 2, tipo);
});

test('estructura also asks by purpose, and shared purposes never leak into the options (seeds 1-40)', () => {
  const entries = ofSection('t2-expressions');
  let byPurpose = 0;
  for (let seed = 1; seed <= 40; seed++) {
    for (const q of FCE.gen.kahoot(entries, pool('estructura'), FCE.rng.make(seed))) {
      if (!q.prompt.startsWith('Which structure fits')) continue;
      byPurpose++;
      const it = entries.find((e) => e.item.id === q.itemIds[0]).item;
      assert.strictEqual(q.options[q.answer], it.formula);
      const sameKind = entries.filter((e) => e.item.proposito === it.proposito).map((e) => e.item.formula);
      assert.strictEqual(q.options.filter((o) => sameKind.includes(o)).length, 1, q.prompt);
      assert.ok(q.options.length >= 4);
    }
  }
  assert.ok(byPurpose > 0, 'purpose-based prompt never generated');
});

test('tabla questions always carry the other degree of the same adjective as a trap', () => {
  const entries = ofSection('t2-irregulares');
  for (let seed = 1; seed <= 20; seed++) {
    for (const q of FCE.gen.kahoot(entries, pool('tabla'), FCE.rng.make(seed))) {
      const it = entries.find((e) => e.item.id === q.itemIds[0]).item;
      const comp = q.prompt.startsWith('Comparative');
      const trap = (comp ? it.superlativo : it.comparativo).split('/')[0].trim();
      assert.ok(q.options.includes(trap), `${q.prompt}: ${q.options}`);
      assert.strictEqual(new Set(q.options).size, q.options.length);
    }
  }
});

test('bad: asking the superlative offers "worse" among the options', () => {
  const entries = ofSection('t2-irregulares');
  let seen = false;
  for (let seed = 1; seed <= 40; seed++) {
    for (const q of FCE.gen.kahoot(entries, pool('tabla'), FCE.rng.make(seed))) {
      if (q.prompt === 'Superlative of “bad”') { seen = true; assert.ok(q.options.includes('worse')); }
    }
  }
  assert.ok(seen);
});

test('phrasal verb distractors are the most similar ones ("come along" competes with the other "come" verbs)', () => {
  const entries = ofSection('t2-phrasal');
  let seen = 0;
  for (let seed = 1; seed <= 40; seed++) {
    for (const q of FCE.gen.kahoot(entries, pool('pares'), FCE.rng.make(seed))) {
      if (q.itemIds[0] === 't2-pv-come-along' && q.options.includes('come along')) {
        seen++;
        assert.ok(q.options.includes('come across') && q.options.includes('come up against'), q.options.join(' | '));
      }
    }
  }
  assert.ok(seen > 0);
});
