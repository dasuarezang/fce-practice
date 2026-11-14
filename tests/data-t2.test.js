const test = require('node:test');
const assert = require('node:assert');
const { validate } = require('../tools/validate.js');
const inventory = require('../tools/inventory.js');
require('../data/index.js');

const temas = () => globalThis.FCE.temas;
const t2 = () => temas().find((t) => t.id === 't2');
const items = (t) => t.secciones.flatMap((s) => s.items);
const byId = (id) => temas().flatMap(items).find((i) => i.id === id);

test('both temas pass validation against the full inventory', () => {
  assert.deepStrictEqual(validate(temas(), inventory).errors, []);
});

test('tema 2 title and total item count', () => {
  assert.strictEqual(t2().titulo, '2. Leisure and Pleasure');
  assert.strictEqual(temas().flatMap(items).length, 99);
});

test('tema 2 spot values from the notes', () => {
  assert.strictEqual(byId('t2-expr-by-far').formula, 'by far + superlative');
  assert.ok(byId('t2-expr-by-far').hueco.includes('{{by far}}'));
  assert.strictEqual(byId('t2-comp-narrow').comparativo, 'narrower / more narrow');
  assert.strictEqual(byId('t2-irr-far').superlativo, 'furthest / farthest');
  assert.strictEqual(byId('t2-pv-throw-yourself-into').definicion, 'to start doing something with a lot of enthusiasm and energy');
  assert.strictEqual(byId('t2-comp-experienced').comparativo, 'more experienced');
});

test('tema 2 groups', () => {
  const g = Object.fromEntries(t2().secciones.map((s) => [s.id, s.grupo]));
  assert.deepStrictEqual(g, {
    't2-phrasal': 'vocabulario',
    't2-ed-ing': 'gramatica',
    't2-comparativos': 'gramatica',
    't2-irregulares': 'gramatica',
    't2-expressions': 'expressions',
  });
});

test('items doubtful in the notes carry revisar', () => {
  for (const id of ['t2-ed-ing-ed', 't2-ed-ing-ing', 't2-expr-not-nearly', 't2-expr-one-of-the-most']) {
    assert.ok(byId(id).revisar, id);
  }
});

test('every expression hueco contains at least one {{gap}} and its text matches ejemplo once unwrapped', () => {
  for (const e of t2().secciones.find((s) => s.id === 't2-expressions').items) {
    assert.ok(/\{\{.+?\}\}/.test(e.hueco), e.id);
    // each {{gap}} may list alternatives (a/b/c): the example must contain one of them (or the whole "a/b" text)
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = e.hueco
      .split(/(\{\{.+?\}\})/)
      .map((part) => {
        const m = part.match(/^\{\{(.+)\}\}$/);
        return m ? '(?:' + [...m[1].split('/').map(esc), esc(m[1])].join('|') + ')' : esc(part);
      })
      .join('');
    assert.ok(new RegExp(pattern).test(e.ejemplo), e.id);
  }
});

test('comparativos rows carry their syllable category as nota', () => {
  const rows = t2().secciones.find((s) => s.id === 't2-comparativos').items;
  assert.strictEqual(rows.find((r) => r.id === 't2-comp-fat').nota, 'ending single consonant');
  assert.strictEqual(rows.find((r) => r.id === 't2-comp-inconvenient').nota, 'three or more syllables');
});
