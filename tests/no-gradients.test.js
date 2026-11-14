const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const SKIP = new Set(['node_modules', 'docs', '.git', '.superpowers', 'tests']);

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (/\.(css|html)$/.test(name)) out.push(p);
  }
  return out;
}

test('no CSS or HTML file uses a gradient', () => {
  for (const f of walk(root)) {
    assert.ok(!/gradient/i.test(fs.readFileSync(f, 'utf8')), `gradient found in ${path.relative(root, f)}`);
  }
});
