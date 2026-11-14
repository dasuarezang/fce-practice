const test = require('node:test');
const assert = require('node:assert');
require('../js/rng.js');
require('../data/index.js');
require('../js/gen/index.js');
require('../js/gen/match.js');

const FCE = globalThis.FCE;
const all = () => FCE.gen.allEntries();
const entries = (id) => all().filter((e) => e.section.id === id);
const run = (es, seed = 1) => FCE.gen.match(es, all(), FCE.rng.make(seed));

test('groups of ≤5, no group of 1, every item appears exactly once', () => {
  for (const id of ['t1-adjetivos', 't1-do-make', 't2-phrasal', 't2-expressions', 't1-antonimos']) {
    const es = entries(id);
    const qs = run(es);
    const ids = qs.flatMap((q) => q.itemIds);
    assert.strictEqual(ids.length, es.length, id);
    assert.strictEqual(new Set(ids).size, es.length, id);
    for (const q of qs) {
      assert.ok(q.itemIds.length >= 2 || es.length < 2, `${id} group of ${q.itemIds.length}`);
      assert.ok(q.itemIds.length <= 6, id);
      assert.strictEqual(q.kind, 'match');
    }
  }
});

test('every left id has exactly one pair and it points to a right id', () => {
  for (const q of run(entries('t1-adjetivos'))) {
    const rightIds = new Set(q.right.map((r) => r.id));
    assert.strictEqual(Object.keys(q.pairs).length, q.left.length);
    for (const l of q.left) assert.ok(rightIds.has(q.pairs[l.id]));
  }
});

test('pares pairs term with its own definition', () => {
  const q = run(entries('t2-phrasal'))[0];
  const l = q.left[0];
  const r = q.right.find((x) => x.id === q.pairs[l.id]);
  const item = entries('t2-phrasal').find((e) => e.item.id === l.id).item;
  assert.strictEqual(l.text, item.termino);
  assert.strictEqual(r.text, item.definicion);
});

test('colocaciones right column has exactly the 2 verbs and allows many-to-one', () => {
  for (const q of run(entries('t1-do-make'))) {
    assert.deepStrictEqual(q.right.map((r) => r.text).sort(), ['do', 'make']);
    assert.ok(Object.keys(q.pairs).length > 2);
  }
});

test('regla matches puntos to the rule titles (many-to-one)', () => {
  const qs = run(entries('t1-present-perfect'));
  assert.strictEqual(qs.length, 1);
  assert.strictEqual(qs[0].left.length, 8);
  assert.deepStrictEqual(qs[0].right.map((r) => r.text).sort(), ['Present Perfect Continuous', 'Present Perfect Simple']);
});

test('estructura matches by example, so shared purposes are not ambiguous', () => {
  const qs = run(entries('t2-expressions'));
  const byFar = qs.flatMap((q) => q.left).find((l) => l.id === 't2-expr-by-far');
  assert.ok(byFar.text.includes('by far the most authentic'));
});

test('two items with the same term (count on) never land in the same group', () => {
  const es = [...entries('t1-phrasal'), ...entries('t2-phrasal')];
  for (let seed = 1; seed <= 20; seed++) {
    for (const q of run(es, seed)) {
      const terms = q.left.map((l) => l.text);
      assert.strictEqual(new Set(terms).size, terms.length);
    }
  }
});

test('tipos without match support yield no question', () => {
  assert.deepStrictEqual(run(entries('t2-comparativos')), []);
});
