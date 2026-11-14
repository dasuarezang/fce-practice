// Coverage verifier: node tools/check.js  (npm run check)
const path = require('path');
const root = path.join(__dirname, '..');
require(path.join(root, 'js/rng.js'));
require(path.join(root, 'data/index.js'));
for (const f of ['index', 'kahoot', 'gapfill', 'match', 'reorder']) require(path.join(root, 'js/gen', f + '.js'));
require(path.join(root, 'js/practice.js'));
require(path.join(root, 'js/theory.js'));
const { validate } = require('./validate.js');
const defaultInventory = require('./inventory.js');

const FCE = globalThis.FCE;

function check(opts) {
  const inventory = (opts && opts.inventory) || defaultInventory;
  const { errors, warnings } = validate(FCE.temas, inventory);
  let count = 0;
  for (const tema of FCE.temas) {
    for (const section of tema.secciones) {
      const html = FCE.theory.render(section);
      const kindsByItem = new Map();
      for (const kind of FCE.practice.KINDS) {
        const qs = FCE.practice.build({ sectionIds: [section.id], kind, length: 'all', seed: 1 });
        for (const q of qs) {
          for (const id of q.itemIds) {
            if (!kindsByItem.has(id)) kindsByItem.set(id, new Set());
            kindsByItem.get(id).add(kind);
          }
        }
      }
      for (const item of section.items) {
        count++;
        if (!html.includes(`data-item-id="${item.id}"`)) errors.push(`item ${item.id}: missing from theory output`);
        const kinds = kindsByItem.get(item.id) || new Set();
        if (kinds.size < 2) errors.push(`item ${item.id}: only ${kinds.size} exercise kind(s) (${[...kinds].join(', ') || 'none'}), need at least 2`);
      }
    }
  }
  return { errors, warnings, count };
}

function main() {
  const r = check();
  for (const w of r.warnings) console.log('WARN ' + w);
  if (r.errors.length) {
    for (const e of r.errors) console.error('FAIL ' + e);
    console.error(`${r.errors.length} problem(s)`);
    process.exit(1);
  }
  console.log(`OK: ${r.count} items`);
}

module.exports = { check };
if (require.main === module) main();
