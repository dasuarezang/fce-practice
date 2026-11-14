const test = require('node:test');
const assert = require('node:assert');
require('../js/rng.js');
require('../data/index.js');
require('../js/gen/index.js');
require('../js/gen/gapfill.js');

const FCE = globalThis.FCE;
const entries = (id) => FCE.gen.allEntries().filter((e) => e.section.id === id);
const run = (id) => FCE.gen.gapfill(entries(id), FCE.gen.allEntries(), FCE.rng.make(1));
const qOf = (qs, itemId) => qs.find((q) => q.itemIds[0] === itemId);

test('variants splits on "/" and trims', () => {
  assert.deepStrictEqual(FCE.gen.variants('cleverer / more clever'), ['cleverer', 'more clever']);
  assert.deepStrictEqual(FCE.gen.variants('educado/cortés'), ['educado', 'cortés']);
});

test('variants expands optional parts in parentheses', () => {
  const v = FCE.gen.variants('(an) exercise');
  assert.ok(v.includes('an exercise') && v.includes('exercise'));
  assert.ok(FCE.gen.variants('(a) sport').includes('sport'));
});

test('matches accepts case, accents and the alternatives (educado/cortés)', () => {
  const q = { answers: FCE.gen.variants('educado/cortés') };
  for (const ok of ['Educado', 'cortés', 'CORTES', '  educado  ']) assert.strictEqual(FCE.gen.matches(q, ok), true, ok);
  assert.strictEqual(FCE.gen.matches(q, 'polite'), false);
});

test('matches ignores trailing punctuation and double spaces', () => {
  const q = { answers: ['more clever'] };
  assert.strictEqual(FCE.gen.matches(q, 'more   clever.'), true);
  assert.strictEqual(FCE.gen.matches(q, 'More clever!'), true);
  assert.strictEqual(FCE.gen.matches(q, ''), false);
});

test('pares asks the term from the definition', () => {
  const q = qOf(run('t1-adjetivos'), 't1-adj-polite');
  assert.ok(q.text.includes('educado/cortés') && q.text.includes('___'));
  assert.ok(FCE.gen.matches(q, 'polite'));
});

test('antonimos asks the negative from the positive', () => {
  const q = qOf(run('t1-antonimos'), 't1-anto-polite');
  assert.ok(FCE.gen.matches(q, 'impolite'));
  assert.ok(!FCE.gen.matches(q, 'polite'));
});

test('colocaciones: options do/make, rejects make for "do the cleaning", accepts do', () => {
  const q = qOf(run('t1-do-make'), 't1-dm-do-the-cleaning');
  assert.deepStrictEqual(q.options, ['do', 'make']);
  assert.ok(q.text.startsWith('___'));
  assert.ok(FCE.gen.matches(q, 'do'));
  assert.ok(!FCE.gen.matches(q, 'make'));
});

test('tabla yields 2 questions per item (comparative and superlative)', () => {
  const qs = run('t2-comparativos');
  assert.strictEqual(qs.length, 16);
  const clever = qs.filter((q) => q.itemIds[0] === 't2-comp-clever');
  assert.ok(clever.some((q) => FCE.gen.matches(q, 'more clever')));
  assert.ok(clever.some((q) => FCE.gen.matches(q, 'Cleverest')));
});

test('estructura with two gaps shows two ___ and accepts "as, as" and "as as"', () => {
  const q = qOf(run('t2-expressions'), 't2-expr-as-adj-as');
  assert.strictEqual((q.text.match(/___/g) || []).length, 2);
  assert.strictEqual(q.answers[0], 'as, as');
  assert.ok(FCE.gen.matches(q, 'as, as'));
  assert.ok(FCE.gen.matches(q, 'as as'));
  assert.strictEqual(q.options, null);
});

test('gap with alternatives (so/as) accepts either', () => {
  const q = qOf(run('t2-expressions'), 't2-expr-not-so-adj-as');
  assert.ok(FCE.gen.matches(q, 'so as'));
  assert.ok(FCE.gen.matches(q, 'as as'));
});

test('regla without hueco produces no gapfill question', () => {
  assert.strictEqual(run('t1-present-perfect').length, 0);
  assert.strictEqual(run('t2-ed-ing').length, 0);
});

test('expression gaps accept every alternative the notes list (much/far/a lot/considerably, slightly/a bit/a little)', () => {
  const much = qOf(run('t2-expressions'), 't2-expr-much-more');
  for (const a of ['much', 'far', 'a lot', 'considerably', 'Far']) assert.ok(FCE.gen.matches(much, a), a);
  const slightly = qOf(run('t2-expressions'), 't2-expr-slightly');
  for (const a of ['slightly', 'a bit', 'a little']) assert.ok(FCE.gen.matches(slightly, a), a);
  assert.ok(!FCE.gen.matches(slightly, 'much'));
});

test('hyphens and spaces are interchangeable: "hard working", "hardworking", "Bad tempered"', () => {
  const hw = { answers: ['hard-working'] };
  for (const a of ['hard-working', 'hard working', 'hardworking', 'Hard  Working.']) assert.ok(FCE.gen.matches(hw, a), a);
  assert.ok(!FCE.gen.matches(hw, 'hard'));
});

test('typing the notebook form with a slash is accepted when every part is a valid answer', () => {
  const q = { answers: ['cleverer', 'more clever'] };
  assert.ok(FCE.gen.matches(q, 'cleverer / more clever'));
  assert.ok(FCE.gen.matches(q, 'more clever/cleverer'));
  assert.ok(!FCE.gen.matches(q, 'cleverer / wrong'));
  assert.ok(!FCE.gen.matches(q, '/'));
});
