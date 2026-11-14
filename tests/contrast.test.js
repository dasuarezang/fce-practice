const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const css = fs.readFileSync(path.join(__dirname, '../css/base.css'), 'utf8');

const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

test('white text on every kahoot tile colour has at least 4.5:1 contrast', () => {
  for (const k of ['--k1', '--k2', '--k3', '--k4']) {
    const m = css.match(new RegExp(k + ':\\s*(#[0-9a-fA-F]{6})'));
    assert.ok(m, k);
    assert.ok(ratio('#ffffff', m[1]) >= 4.5, `${k} ${m[1]} contrast ${ratio('#ffffff', m[1]).toFixed(2)}`);
  }
});
