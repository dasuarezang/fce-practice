const test = require('node:test');
const assert = require('node:assert');
require('../data/index.js');
for (const f of ['index', 'kahoot', 'gapfill', 'match', 'reorder']) require(`../js/gen/${f}.js`);
require('../js/rng.js');
require('../js/practice.js');
require('../js/theory.js');
const { check } = require('../tools/check.js');
const FCE = globalThis.FCE;

test('check on real data has no failures and counts 99 items', () => {
  const r = check();
  assert.deepStrictEqual(r.errors, []);
  assert.strictEqual(r.count, 99);
  assert.deepStrictEqual(r.warnings, []); // nothing left to confirm against the notebook
});

test('check on a fixture item supported by only one kind reports it', () => {
  const realTemas = FCE.temas;
  const realMatch = FCE.gen.match;
  FCE.temas = [{ id: 'f', titulo: 'F', secciones: [{ id: 'f-1', titulo: 'F', grupo: 'gramatica', tipo: 'regla',
    items: [{ id: 'f-r1', titulo: 'T', formula: 'f', puntos: ['p'], fuente: 1 }] }] }];
  FCE.gen.match = () => [];
  try {
    const r = check({ inventory: { 'f-1': 1 } });
    assert.ok(r.errors.some((e) => e.includes('f-r1') && /kinds?/.test(e)), r.errors.join('\n'));
  } finally {
    FCE.temas = realTemas;
    FCE.gen.match = realMatch;
  }
});

test('check reports an item missing from the theory output', () => {
  const realRender = FCE.theory.render;
  FCE.theory.render = () => '<section></section>';
  try {
    const r = check();
    assert.ok(r.errors.some((e) => /theory/i.test(e)));
  } finally {
    FCE.theory.render = realRender;
  }
});
