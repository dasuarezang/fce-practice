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

// Dark theme is the first :root block; light theme is :root[data-theme="light"].
const light = css.slice(css.indexOf(':root[data-theme="light"]'), css.indexOf('* { box-sizing'));
const dark = css.slice(css.indexOf(':root {'), css.indexOf(':root[data-theme="light"]'));
const get = (block, name) => {
  const m = block.match(new RegExp('--' + name + ':\\s*(#[0-9a-fA-F]{6})'));
  assert.ok(m, 'token --' + name + ' not found');
  return m[1];
};

for (const [label, block] of [['dark', dark], ['light', light]]) {
  test(`${label}: text, muted text, links and result colours are readable on the page background (4.5:1)`, () => {
    const bg = get(block, 'bg');
    const card = get(block, 'card');
    for (const name of ['text', 'muted', 'link', 'ok', 'bad', 'k1', 'k3', ...Array.from({ length: 24 }, (_, i) => 'c' + (i + 1))]) {
      for (const [surfaceName, surface] of [['bg', bg], ['card', card]]) {
        const r = ratio(get(block, name), surface);
        assert.ok(r >= 4.5, `${label} --${name} on ${surfaceName} = ${r.toFixed(2)}`);
      }
    }
  });
  test(`${label}: button text on the accent colour has at least 4.5:1`, () => {
    const r = ratio(get(block, 'accent-text'), get(block, 'accent'));
    assert.ok(r >= 4.5, `${label} accent button = ${r.toFixed(2)}`);
  });
}
