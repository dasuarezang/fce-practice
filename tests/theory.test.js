const test = require('node:test');
const assert = require('node:assert');
require('../data/index.js');
require('../js/theory.js');
const FCE = globalThis.FCE;

test('render output contains data-item-id for every item of every section', () => {
  for (const tema of FCE.temas) {
    for (const s of tema.secciones) {
      const html = FCE.theory.render(s);
      assert.ok(html.includes(`data-section-id="${s.id}"`), s.id);
      for (const it of s.items) assert.ok(html.includes(`data-item-id="${it.id}"`), it.id);
    }
  }
});

test('render escapes < and & in text', () => {
  const s = { id: 'x', titulo: 'A & B <i>', grupo: 'vocabulario', tipo: 'pares', items: [{ id: 'x1', termino: '<b>', definicion: 'a & b', fuente: 1 }] };
  const html = FCE.theory.render(s);
  assert.ok(!html.includes('<b>'));
  assert.ok(html.includes('&lt;b&gt;') && html.includes('a &amp; b') && html.includes('A &amp; B &lt;i&gt;'));
  assert.strictEqual(FCE.theory.escape(`"'<&>`), '&quot;&#39;&lt;&amp;&gt;');
});

test('estructura formulas are wrapped in <mark>', () => {
  const s = FCE.temas[1].secciones.find((x) => x.id === 't2-expressions');
  assert.ok(FCE.theory.render(s).includes('<mark>by far + superlative</mark>'));
});

test('tabla is an HTML table grouped by nota', () => {
  const s = FCE.temas[1].secciones.find((x) => x.id === 't2-comparativos');
  const html = FCE.theory.render(s);
  assert.ok(html.includes('<table'));
  for (const nota of ['one syllable', 'ending single consonant', 'two syllables', 'three or more syllables']) assert.ok(html.includes(nota), nota);
});

test('regla renders formula and every punto', () => {
  const s = FCE.temas[0].secciones.find((x) => x.id === 't1-present-perfect');
  const html = FCE.theory.render(s);
  assert.ok(html.includes('have + been + verb-ing'));
  assert.ok(html.includes('Emphasises the result.'));
});

test('revisar does not change the visible theory text', () => {
  const s = FCE.temas[0].secciones.find((x) => x.id === 't1-phrasal');
  assert.ok(!FCE.theory.render(s).includes('Confirmar'));
});

test('comparatives section carries the "comparison vocabulary" definitions and the 3+ syllables rule', () => {
  const s = FCE.temas[1].secciones.find((x) => x.id === 't2-comparativos');
  const html = FCE.theory.render(s);
  assert.ok(/compare two things/i.test(html));
  assert.ok(/compare one thing to a group/i.test(html));
  assert.ok(html.includes('more + adjective') && html.includes('most + adjective'));
});
