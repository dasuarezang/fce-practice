const test = require('node:test');
const assert = require('node:assert');
require('../js/store.js');
const FCE = globalThis.FCE;

function memory(initial) {
  const data = new Map(initial ? Object.entries(initial) : []);
  return { getItem: (k) => (data.has(k) ? data.get(k) : null), setItem: (k, v) => data.set(k, String(v)), data };
}

test('record then stats counts seen and wrong', () => {
  const s = FCE.store.create(memory());
  s.record(['a', 'b'], true);
  s.record(['a'], false);
  assert.deepStrictEqual(s.stats('a'), { seen: 2, wrong: 1 });
  assert.deepStrictEqual(s.stats('b'), { seen: 1, wrong: 0 });
  assert.deepStrictEqual(s.stats('zzz'), { seen: 0, wrong: 0 });
});

test('progress persists across store instances on the same storage', () => {
  const m = memory();
  FCE.store.create(m).record(['a'], false);
  assert.deepStrictEqual(FCE.store.create(m).stats('a'), { seen: 1, wrong: 1 });
  assert.ok(m.data.has('fce.progress.v1'));
});

test('failedIds lists items with wrong>0 and reset clears everything', () => {
  const s = FCE.store.create(memory());
  s.record(['a'], false);
  s.record(['b'], true);
  assert.deepStrictEqual(s.failedIds(), ['a']);
  s.reset();
  assert.deepStrictEqual(s.failedIds(), []);
  assert.deepStrictEqual(s.stats('a'), { seen: 0, wrong: 0 });
});

test('throwing storage does not throw and returns empty stats', () => {
  const boom = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };
  const s = FCE.store.create(boom);
  assert.doesNotThrow(() => s.record(['a'], true));
  assert.deepStrictEqual(s.stats('a'), { seen: 0, wrong: 0 });
  assert.deepStrictEqual(s.failedIds(), []);
  assert.doesNotThrow(() => s.reset());
});

test('invalid JSON or wrong shape in storage is treated as empty', () => {
  for (const bad of ['{not json', 'null', '[1,2]', '"str"', '{"items":5}']) {
    const s = FCE.store.create(memory({ 'fce.progress.v1': bad }));
    assert.deepStrictEqual(s.stats('a'), { seen: 0, wrong: 0 }, bad);
    s.record(['a'], false);
    assert.deepStrictEqual(s.stats('a'), { seen: 1, wrong: 1 }, bad);
  }
});

test('missing localStorage entirely still works (no storage available)', () => {
  const s = FCE.store.create(null);
  assert.doesNotThrow(() => s.record(['a'], true));
  assert.deepStrictEqual(s.failedIds(), []);
});
