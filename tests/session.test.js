const test = require('node:test');
const assert = require('node:assert');
require('../js/session.js');
const FCE = globalThis.FCE;
const q = (id) => ({ kind: 'kahoot', itemIds: [id] });

test('session walks the questions in order and ends when all are right', () => {
  const s = FCE.session.create([q('a'), q('b')]);
  assert.strictEqual(s.current().itemIds[0], 'a');
  s.submit(true);
  assert.strictEqual(s.current().itemIds[0], 'b');
  s.submit(true);
  assert.strictEqual(s.done(), true);
  assert.strictEqual(s.current(), null);
  assert.deepStrictEqual(s.summary(), { total: 2, correct: 2, wrongItemIds: [] });
});

test('session wrong answer is retried once at the end', () => {
  const s = FCE.session.create([q('a'), q('b')]);
  s.submit(false);
  assert.strictEqual(s.total(), 3);
  s.submit(true);
  assert.strictEqual(s.current().itemIds[0], 'a');
  s.submit(true);
  assert.strictEqual(s.done(), true);
  assert.deepStrictEqual(s.summary(), { total: 2, correct: 1, wrongItemIds: ['a'] });
});

test('session ends: answering everything wrong terminates after 2×N submissions', () => {
  const n = 5;
  const s = FCE.session.create(Array.from({ length: n }, (_, i) => q('i' + i)));
  let submissions = 0;
  while (!s.done()) {
    s.submit(false);
    submissions++;
    assert.ok(submissions <= 2 * n, 'did not terminate');
  }
  assert.strictEqual(submissions, 2 * n);
});

test('summary.wrongItemIds has unique ids across multi-item questions', () => {
  const s = FCE.session.create([{ kind: 'match', itemIds: ['a', 'b'] }, q('a')]);
  s.submit(false);
  s.submit(false);
  assert.deepStrictEqual([...s.summary().wrongItemIds].sort(), ['a', 'b']);
});

test('empty session is done immediately', () => {
  const s = FCE.session.create([]);
  assert.strictEqual(s.done(), true);
  assert.strictEqual(s.current(), null);
  assert.deepStrictEqual(s.summary(), { total: 0, correct: 0, wrongItemIds: [] });
});

test('index counts answered questions', () => {
  const s = FCE.session.create([q('a'), q('b')]);
  assert.strictEqual(s.index(), 0);
  s.submit(true);
  assert.strictEqual(s.index(), 1);
});

test('session log keeps the first attempt of every question, not the retries', () => {
  const s = FCE.session.create([q('a'), q('b')]);
  s.submit(false);
  s.submit(true);
  s.submit(true); // retry of a
  assert.deepStrictEqual(s.log().map((x) => [x.q.itemIds[0], x.ok]), [['a', false], ['b', true]]);
});

test('snapshot -> JSON -> restore continues exactly where the session was', () => {
  const s = FCE.session.create([q('a'), q('b'), q('c')]);
  s.submit(false);
  s.submit(true);
  const r = FCE.session.restore(JSON.parse(JSON.stringify(s.snapshot())));
  assert.strictEqual(r.current().itemIds[0], 'c');
  assert.strictEqual(r.total(), 4);
  r.submit(true);
  assert.strictEqual(r.current().itemIds[0], 'a'); // the retry of the failed one
  r.submit(true);
  assert.strictEqual(r.done(), true);
  assert.deepStrictEqual(r.summary(), { total: 3, correct: 2, wrongItemIds: ['a'] });
  assert.strictEqual(r.log().length, 3);
});

test('exam sessions (retries off) never requeue a wrong answer', () => {
  const s = FCE.session.create([q('a'), q('b')], null, { retries: false });
  s.submit(false);
  assert.strictEqual(s.total(), 2);
  s.submit(true);
  assert.strictEqual(s.done(), true);
  assert.deepStrictEqual(s.summary(), { total: 2, correct: 1, wrongItemIds: ['a'] });
});
