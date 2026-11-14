const test = require('node:test');
const assert = require('node:assert');
require('../js/rng.js');
require('../data/index.js');
require('../js/gen/index.js');
require('../js/gen/reorder.js');

const FCE = globalThis.FCE;
const entries = (id) => FCE.gen.allEntries().filter((e) => e.section.id === id);
const run = (id, seed = 1) => FCE.gen.reorder(entries(id), FCE.gen.allEntries(), FCE.rng.make(seed));

test('reorder words are a permutation of the solution and differ from it', () => {
  for (let seed = 1; seed <= 10; seed++) {
    for (const q of run('t2-expressions', seed)) {
      assert.strictEqual(q.kind, 'reorder');
      assert.deepStrictEqual([...q.words].sort(), [...q.solution].sort());
      assert.notDeepStrictEqual(q.words, q.solution);
    }
  }
});

test('one question per expression, built from the first example sentence', () => {
  const qs = run('t2-expressions');
  assert.strictEqual(qs.length, 11);
  const less = qs.find((q) => q.itemIds[0] === 't2-expr-less-least');
  assert.strictEqual(less.solution.join(' '), 'This coat is less expensive than the other one.');
});

test('reorder for pares returns []', () => {
  assert.deepStrictEqual(run('t1-phrasal'), []);
  assert.deepStrictEqual(run('t1-do-make'), []);
});

test('regla items whose example has illegible words ("…") are skipped', () => {
  assert.deepStrictEqual(run('t2-ed-ing'), []);
});
