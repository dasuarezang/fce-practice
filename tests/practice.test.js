const test = require('node:test');
const assert = require('node:assert');
require('../js/rng.js');
require('../data/index.js');
for (const f of ['index', 'kahoot', 'gapfill', 'match', 'reorder']) require(`../js/gen/${f}.js`);
require('../js/practice.js');

const FCE = globalThis.FCE;
const ALL = FCE.temas.flatMap((t) => t.secciones.map((s) => s.id));

test('build with empty selection returns []', () => {
  assert.deepStrictEqual(FCE.practice.build({ sectionIds: [], kind: 'mixto', length: 'all' }), []);
});

test('build kind "kahoot" on t1-phrasal "all" gives 6 questions', () => {
  const qs = FCE.practice.build({ sectionIds: ['t1-phrasal'], kind: 'kahoot', length: 'all', seed: 1 });
  assert.strictEqual(qs.length, 6);
  assert.ok(qs.every((q) => q.kind === 'kahoot'));
});

test('build length 10 on all sections gives ≤ 10', () => {
  const qs = FCE.practice.build({ sectionIds: ALL, kind: 'mixto', length: 10, seed: 1 });
  assert.ok(qs.length > 0 && qs.length <= 10);
});

test('mixto over all sections uses all four kinds', () => {
  const kinds = new Set(FCE.practice.build({ sectionIds: ALL, kind: 'mixto', length: 'all', seed: 1 }).map((q) => q.kind));
  assert.deepStrictEqual([...kinds].sort(), ['gapfill', 'kahoot', 'match', 'reorder']);
});

test('mixto covers every selected item at least once', () => {
  const qs = FCE.practice.build({ sectionIds: ALL, kind: 'mixto', length: 'all', seed: 4 });
  const seen = new Set(qs.flatMap((q) => q.itemIds));
  assert.strictEqual(seen.size, 99);
});

test('a kind a section does not support skips that section', () => {
  assert.deepStrictEqual(FCE.practice.build({ sectionIds: ['t1-phrasal'], kind: 'reorder', length: 'all' }), []);
});

test('kindsFor(["t1-do-make"]) includes gapfill and match but not reorder', () => {
  const k = FCE.practice.kindsFor(['t1-do-make']);
  assert.ok(k.includes('gapfill') && k.includes('match') && !k.includes('reorder'));
});

test('itemsOf returns entries only for the selected sections', () => {
  const es = FCE.practice.itemsOf(['t2-irregulares']);
  assert.strictEqual(es.length, 5);
  assert.ok(es.every((e) => e.section.id === 't2-irregulares'));
});

test('same seed gives the same build', () => {
  const a = FCE.practice.build({ sectionIds: ALL, kind: 'mixto', length: 20, seed: 9 });
  const b = FCE.practice.build({ sectionIds: ALL, kind: 'mixto', length: 20, seed: 9 });
  assert.deepStrictEqual(a, b);
});

test('mixto can form a match group in 2-item regla sections (it used to always fall back to kahoot)', () => {
  let sawMatch = false;
  for (let seed = 1; seed <= 40; seed++) {
    const qs = FCE.practice.build({ sectionIds: ['t1-present-perfect'], kind: 'mixto', length: 'all', seed });
    const covered = new Set(qs.flatMap((q) => q.itemIds));
    assert.strictEqual(covered.size, 2, 'both items stay covered');
    if (qs.some((q) => q.kind === 'match')) sawMatch = true;
  }
  assert.ok(sawMatch);
});

test('mixto can use gap-fill and reorder on the -ed/-ing rules now that their examples are complete', () => {
  const kinds = new Set();
  for (let seed = 1; seed <= 40; seed++) {
    const qs = FCE.practice.build({ sectionIds: ['t2-ed-ing'], kind: 'mixto', length: 'all', seed });
    assert.strictEqual(new Set(qs.flatMap((q) => q.itemIds)).size, 2, 'both items covered');
    qs.forEach((q) => kinds.add(q.kind));
  }
  assert.ok(kinds.has('gapfill') && kinds.has('reorder'), [...kinds].join(','));
});
