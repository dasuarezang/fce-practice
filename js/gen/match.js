(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  const gen = (FCE.gen = FCE.gen || {});

  const SUPPORTED = ['pares', 'antonimos', 'colocaciones', 'regla', 'estructura'];

  // Chunks of ≤ size; a lone remainder joins the previous chunk (never a group of 1 unless n=1).
  function chunk(list, size) {
    const out = [];
    for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
    if (out.length > 1 && out[out.length - 1].length === 1) {
      const last = out.pop();
      out[out.length - 1].push(...last);
    }
    return out;
  }

  function buildGroup(items, tipo, rng) {
    const left = [];
    const right = [];
    const pairs = {};
    const lines = [];
    for (const it of items) {
      switch (tipo) {
        case 'pares':
          left.push({ id: it.id, text: it.termino });
          right.push({ id: it.id, text: it.definicion });
          pairs[it.id] = it.id;
          lines.push(`${it.termino} = ${it.definicion}`);
          break;
        case 'antonimos':
          left.push({ id: it.id, text: it.positivo });
          right.push({ id: it.id, text: it.negativo });
          pairs[it.id] = it.id;
          lines.push(`${it.positivo} ↔ ${it.negativo}`);
          break;
        case 'estructura':
          left.push({ id: it.id, text: gen.firstSentence(it.ejemplo) });
          right.push({ id: it.id, text: it.formula });
          pairs[it.id] = it.id;
          lines.push(`${gen.firstSentence(it.ejemplo)} → ${it.formula}`);
          break;
        case 'colocaciones':
          left.push({ id: it.id, text: `___ ${it.resto}` });
          pairs[it.id] = it.verbo;
          lines.push(`${it.verbo} ${it.resto}`);
          break;
        case 'regla':
          right.push({ id: it.id, text: it.titulo });
          it.puntos.forEach((p, i) => {
            left.push({ id: `${it.id}#${i}`, text: p });
            pairs[`${it.id}#${i}`] = it.id;
          });
          lines.push(`${it.titulo}: ${it.formula}`);
          break;
      }
    }
    if (tipo === 'colocaciones') {
      right.push({ id: 'do', text: 'do' }, { id: 'make', text: 'make' });
    }
    return {
      kind: 'match',
      itemIds: items.map((i) => i.id),
      left: rng.shuffle(left),
      right: tipo === 'colocaciones' ? right : rng.shuffle(right),
      pairs,
      explain: lines.join('\n'),
    };
  }

  gen.match = function (entries, pool, rng, size) {
    const n = size || 5;
    const bySection = new Map();
    for (const e of entries) {
      if (!SUPPORTED.includes(e.section.tipo)) continue;
      if (!bySection.has(e.section.id)) bySection.set(e.section.id, { tipo: e.section.tipo, items: [] });
      bySection.get(e.section.id).items.push(e.item);
    }
    const out = [];
    for (const { tipo, items } of bySection.values()) {
      for (const group of chunk(rng.shuffle(items), n)) out.push(buildGroup(group, tipo, rng));
    }
    return out;
  };
})(globalThis);
