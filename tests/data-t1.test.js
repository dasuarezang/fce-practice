const test = require('node:test');
const assert = require('node:assert');
const { validate } = require('../tools/validate.js');
const inventory = require('../tools/inventory.js');
require('../data/index.js');

const t1 = () => globalThis.FCE.temas.find((t) => t.id === 't1');
const items = () => t1().secciones.flatMap((s) => s.items);
const inventoryT1 = Object.fromEntries(Object.entries(inventory).filter(([k]) => k.startsWith('t1-')));

test('tema 1 has its title and passes validation against its inventory', () => {
  assert.strictEqual(t1().titulo, '1. Family Affair');
  const r = validate([t1()], inventoryT1);
  assert.deepStrictEqual(r.errors, []);
});

test('tema 1 spot values from the notes', () => {
  const byId = (id) => items().find((i) => i.id === id);
  assert.strictEqual(byId('t1-adj-bossy').definicion, 'mandón');
  assert.strictEqual(byId('t1-dm-make-the-bed').verbo, 'make');
  assert.strictEqual(byId('t1-dm-make-the-bed').resto, 'the bed');
  assert.strictEqual(byId('t1-pp-simple').puntos.length, 4);
  assert.strictEqual(byId('t1-pp-continuous').formula, 'have + been + verb-ing');
  assert.strictEqual(byId('t1-anto-polite').negativo, 'impolite');
  assert.strictEqual(byId('t1-pv-make-it-up').definicion, 'invent; lie');
  assert.ok(!byId('t1-pv-make-it-up').revisar);
});

test('tema 1 groups: present perfect is gramatica, the rest vocabulario', () => {
  const g = Object.fromEntries(t1().secciones.map((s) => [s.id, s.grupo]));
  assert.strictEqual(g['t1-present-perfect'], 'gramatica');
  for (const id of ['t1-phrasal', 't1-adjetivos', 't1-antonimos', 't1-do-make']) assert.strictEqual(g[id], 'vocabulario');
});
