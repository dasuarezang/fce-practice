const test = require('node:test');
const assert = require('node:assert');
const { validate } = require('../tools/validate.js');

const par = (id, extra = {}) => ({ id, termino: 'hang out', definicion: 'spend time', fuente: 1, ...extra });
const tema = (items, tipo = 'pares', id = 's1') => [{ id: 't', titulo: 'T', secciones: [{ id, titulo: 'S', grupo: 'vocabulario', tipo, items }] }];

test('accepts a valid minimal tema', () => {
  const r = validate(tema([par('a')]), { s1: 1 });
  assert.deepStrictEqual(r.errors, []);
  assert.deepStrictEqual(r.warnings, []);
});

test('reports duplicate item ids', () => {
  const r = validate(tema([par('a'), par('a')]), { s1: 2 });
  assert.ok(r.errors.some((e) => /duplicate/i.test(e) && e.includes('a')));
});

test('reports item missing fuente', () => {
  const r = validate(tema([par('a', { fuente: undefined })]), { s1: 1 });
  assert.ok(r.errors.some((e) => /fuente/.test(e)));
});

test('reports unknown tipo', () => {
  const r = validate(tema([par('a')], 'banana'), { s1: 1 });
  assert.ok(r.errors.some((e) => /tipo/.test(e) && e.includes('banana')));
});

test('reports count mismatch against inventory', () => {
  const r = validate(tema([par('a')]), { s1: 2 });
  assert.ok(r.errors.some((e) => /s1/.test(e) && /1/.test(e) && /2/.test(e)));
});

test('reports sections missing from data or from inventory', () => {
  const r = validate(tema([par('a')]), { s1: 1, other: 3 });
  assert.ok(r.errors.some((e) => e.includes('other')));
  const r2 = validate(tema([par('a')]), {});
  assert.ok(r2.errors.some((e) => e.includes('s1')));
});

test('reports estructura without hueco', () => {
  const item = { id: 'e', proposito: 'p', formula: 'as + adj + as', ejemplo: 'x as y as z.', fuente: 4 };
  const r = validate(tema([item], 'estructura'), { s1: 1 });
  assert.ok(r.errors.some((e) => /hueco/.test(e)));
});

test('reports colocaciones with invalid verbo', () => {
  const item = { id: 'c', verbo: 'take', resto: 'a bath', fuente: 2 };
  const r = validate(tema([item], 'colocaciones'), { s1: 1 });
  assert.ok(r.errors.some((e) => /verbo/.test(e)));
});

test('puts items with revisar into warnings, not errors', () => {
  const r = validate(tema([par('a', { revisar: 'dudoso' })]), { s1: 1 });
  assert.deepStrictEqual(r.errors, []);
  assert.strictEqual(r.warnings.length, 1);
  assert.ok(r.warnings[0].includes('a') && r.warnings[0].includes('dudoso'));
});
