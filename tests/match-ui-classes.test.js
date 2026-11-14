const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const js = fs.readFileSync(path.join(__dirname, '../js/ui/match-ui.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '../css/match.css'), 'utf8');

// Regression: the verdict class "right" on a LEFT card collided with the column class ".mcard.right".
test('verdict classes on match cards never reuse the column class names left/right', () => {
  const added = [...js.matchAll(/classList\.add\(([^)]*)\)/g)].map((m) => m[1]);
  assert.ok(added.length > 0);
  for (const a of added) assert.ok(!/['"]right['"]/.test(a), `classList.add(${a}) collides with .mcard.right`);
  assert.ok(css.includes('.mcard.left.is-ok') && css.includes('.mcard.left.is-bad'));
});
