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
  assert.deepStrictEqual(s.stats('a'), { seen: 0, wrong: 0 });
  assert.deepStrictEqual(s.failedIds(), []);
  assert.doesNotThrow(() => s.record(['a'], true));
  assert.deepStrictEqual(s.stats('a'), { seen: 1, wrong: 0 }); // kept in memory for this session
  assert.doesNotThrow(() => s.reset());
  assert.deepStrictEqual(s.stats('a'), { seen: 0, wrong: 0 });
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

test('when getItem throws but setItem works, progress still accumulates in memory', () => {
  const s = FCE.store.create({ getItem() { throw new Error('denied'); }, setItem() {} });
  s.record(['a'], false);
  s.record(['a'], true);
  assert.deepStrictEqual(s.stats('a'), { seen: 2, wrong: 1 });
});

test('weakIds: failed items stay weak until answered right twice in a row', () => {
  const mem = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = v; } };
  const s = FCE.store.create(mem);
  s.record(['a'], false);
  s.record(['b'], true);
  assert.deepStrictEqual(s.weakIds(), ['a']);
  s.record(['a'], true);
  assert.deepStrictEqual(s.weakIds(), ['a']);
  s.record(['a'], true);
  assert.deepStrictEqual(s.weakIds(), []);
  s.record(['a'], false);
  assert.deepStrictEqual(s.weakIds(), ['a']);
});

test('export/import: merge keeps the record with more attempts and rejects foreign data', () => {
  const a = FCE.store.create(memory());
  a.record(['x'], false); a.record(['x'], true); a.record(['y'], true);
  const b = FCE.store.create(memory());
  b.record(['x'], true);
  b.record(['z'], false);
  assert.strictEqual(b.importData(a.exportData()), 2); // x (2 attempts > 1) and y
  assert.deepStrictEqual(b.stats('x'), { seen: 2, wrong: 1 });
  assert.deepStrictEqual(b.stats('y'), { seen: 1, wrong: 0 });
  assert.deepStrictEqual(b.stats('z'), { seen: 1, wrong: 1 });
  assert.strictEqual(b.importData({ app: 'other', items: {} }), -1);
  assert.strictEqual(b.importData(null), -1);
  assert.strictEqual(b.importData({ app: 'fce-practice', items: { bad: { seen: 'NaN', wrong: -5 } } }), 0);
});

test('code round-trip through toCode/fromCode, and garbage is rejected', () => {
  const a = FCE.store.create(memory());
  a.record(['p'], false); a.record(['q'], true);
  const code = a.toCode();
  assert.ok(code.startsWith('FCE1:'));
  const b = FCE.store.create(memory());
  assert.strictEqual(b.importData(FCE.store.create(memory()).fromCode('  ' + code + '\n')), 2);
  assert.deepStrictEqual(b.stats('p'), { seen: 1, wrong: 1 });
  assert.strictEqual(FCE.store.create(memory()).fromCode('hello'), null);
  assert.strictEqual(FCE.store.create(memory()).fromCode('FCE1:!!!'), null);
});
