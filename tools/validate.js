// Validates the data model (spec §4) against the inventory.
const REQUIRED = {
  pares: ['termino', 'definicion'],
  antonimos: ['positivo', 'negativo'],
  colocaciones: ['verbo', 'resto'],
  tabla: ['base', 'comparativo', 'superlativo'],
  regla: ['titulo', 'formula', 'puntos'],
  estructura: ['proposito', 'formula', 'ejemplo', 'hueco'],
};

function empty(v) {
  if (v === undefined || v === null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

function validate(temas, inventory) {
  const errors = [];
  const warnings = [];
  const seenIds = new Set();
  const seenSections = new Set();

  for (const tema of temas) {
    for (const sec of tema.secciones || []) {
      seenSections.add(sec.id);
      const fields = REQUIRED[sec.tipo];
      if (!fields) {
        errors.push(`section ${sec.id}: unknown tipo "${sec.tipo}"`);
        continue;
      }
      if (!(sec.id in inventory)) errors.push(`section ${sec.id}: not in inventory`);
      else if (sec.items.length !== inventory[sec.id]) {
        errors.push(`section ${sec.id}: has ${sec.items.length} items, inventory says ${inventory[sec.id]}`);
      }
      for (const item of sec.items) {
        if (empty(item.id)) {
          errors.push(`section ${sec.id}: item without id`);
          continue;
        }
        if (seenIds.has(item.id)) errors.push(`duplicate id ${item.id}`);
        seenIds.add(item.id);
        if (empty(item.fuente)) errors.push(`item ${item.id}: missing fuente`);
        for (const f of fields) if (empty(item[f])) errors.push(`item ${item.id}: missing ${f}`);
        if (sec.tipo === 'colocaciones' && !empty(item.verbo) && !['do', 'make'].includes(item.verbo)) {
          errors.push(`item ${item.id}: verbo must be do or make, got "${item.verbo}"`);
        }
        if (!empty(item.revisar)) warnings.push(`item ${item.id}: revisar — ${item.revisar}`);
      }
    }
  }
  for (const id of Object.keys(inventory)) {
    if (!seenSections.has(id)) errors.push(`section ${id}: in inventory but missing from data`);
  }
  return { errors, warnings };
}

module.exports = { validate };
