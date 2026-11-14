const test = require('node:test');
const assert = require('node:assert');

function load() {
  delete require.cache[require.resolve('../js/rng.js')];
  require('../js/rng.js');
  return globalThis.FCE.rng;
}

test('same seed gives same shuffle', () => {
  const rng = load();
  const a = rng.make(42).shuffle([1, 2, 3, 4, 5, 6, 7, 8]);
  const b = rng.make(42).shuffle([1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepStrictEqual(a, b);
});

test('shuffle keeps all elements and does not mutate input', () => {
  const rng = load();
  const input = [1, 2, 3, 4, 5];
  const out = rng.make(1).shuffle(input);
  assert.deepStrictEqual(input, [1, 2, 3, 4, 5]);
  assert.deepStrictEqual([...out].sort(), [1, 2, 3, 4, 5]);
});

test('pick(arr,2) returns 2 distinct elements', () => {
  const rng = load();
  const out = rng.make(7).pick(['a', 'b', 'c', 'd'], 2);
  assert.strictEqual(out.length, 2);
  assert.notStrictEqual(out[0], out[1]);
});

test('pick(arr,10) on 3 elements returns 3', () => {
  const rng = load();
  assert.strictEqual(rng.make(3).pick([1, 2, 3], 10).length, 3);
});
