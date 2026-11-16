const test = require('node:test');
const assert = require('node:assert');
require('../js/session.js');
require('../js/saved.js');
const FCE = globalThis.FCE;
const q = (id) => ({ kind: 'kahoot', itemIds: [id], prompt: 'p', options: ['x', 'y'], answer: 0 });

function fakeStorage() {
  const d = {};
  return { getItem: (k) => (k in d ? d[k] : null), setItem: (k, v) => { d[k] = v; }, removeItem: (k) => { delete d[k]; } };
}

test('save/load round-trips an unfinished session; clear removes it', () => {
  globalThis.localStorage = fakeStorage();
  const s = FCE.session.create([q('a'), q('b')]);
  s.submit(true);
  FCE.saved.save(s.snapshot());
  const snap = FCE.saved.load();
  assert.ok(snap);
  assert.strictEqual(FCE.session.restore(snap).current().itemIds[0], 'b');
  FCE.saved.clear();
  assert.strictEqual(FCE.saved.load(), null);
});

test('a finished, malformed or tampered snapshot is ignored', () => {
  globalThis.localStorage = fakeStorage();
  const s = FCE.session.create([q('a')]);
  s.submit(true);
  FCE.saved.save(s.snapshot()); // pos === length: nothing to resume
  assert.strictEqual(FCE.saved.load(), null);
  localStorage.setItem('fce.session.v1', '{not json');
  assert.strictEqual(FCE.saved.load(), null);
  localStorage.setItem('fce.session.v1', JSON.stringify({ questions: [{ kind: 'bogus', itemIds: [] }], queue: [], pos: 0 }));
  assert.strictEqual(FCE.saved.load(), null);
});
