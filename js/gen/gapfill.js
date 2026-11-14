(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  const gen = (FCE.gen = FCE.gen || {});

  function expandOptional(s) {
    const m = s.match(/\(([^)]*)\)/);
    if (!m) return [s];
    const before = s.slice(0, m.index);
    const after = s.slice(m.index + m[0].length);
    const out = [];
    for (const mid of [m[1], '']) out.push(...expandOptional(before + mid + after));
    return out;
  }

  const clean = (s) => s.replace(/\s+/g, ' ').trim();

  // "cleverer / more clever" -> two answers; "(an) exercise" -> with and without "an".
  gen.variants = function (answer) {
    const out = [];
    for (const part of String(answer).split('/')) {
      for (const v of expandOptional(part)) {
        const c = clean(v);
        if (c && !out.includes(c)) out.push(c);
      }
    }
    return out;
  };

  function norm(s) {
    return String(s)
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[,;-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/[.!?¡¿]+$/g, '')
      .trim();
  }

  gen.matches = function (q, input) {
    const n = norm(input);
    if (!n) return false;
    const key = (s) => norm(s).replace(/ /g, '');
    const answerKeys = q.answers.map(key);
    if (answerKeys.includes(key(n))) return true;
    // Notebook form "cleverer / more clever": every part must be a valid answer.
    if (String(input).includes('/')) {
      const parts = String(input).split('/').map(key).filter(Boolean);
      return parts.length > 0 && parts.every((p) => answerKeys.includes(p));
    }
    return false;
  };

  // "{{so/as}} ... {{as}}" -> text with ___ and every combination of per-gap alternatives.
  function fromHueco(hueco) {
    const gaps = [];
    const text = hueco.replace(/\{\{(.+?)\}\}/g, (_, g) => {
      gaps.push(gen.variants(g));
      return '___';
    });
    let combos = [[]];
    for (const g of gaps) combos = combos.flatMap((c) => g.map((v) => [...c, v]));
    return { text, answers: combos.map((c) => c.join(', ')) };
  }

  function q(it, text, answers, explain, options) {
    return { kind: 'gapfill', itemIds: [it.id], text, answers, options: options || null, explain };
  }

  gen.gapfill = function (entries) {
    const out = [];
    for (const { item: it, section } of entries) {
      switch (section.tipo) {
        case 'pares':
          out.push(q(it, `«${it.definicion}» → ___`, gen.variants(it.termino), `${it.termino} = ${it.definicion}`));
          break;
        case 'antonimos':
          out.push(q(it, `«${it.positivo}» → ___ (contrario)`, gen.variants(it.negativo), `${it.positivo} ↔ ${it.negativo}`));
          break;
        case 'colocaciones':
          out.push(q(it, `___ ${it.resto}`, [it.verbo], `${it.verbo} ${it.resto}`, ['do', 'make']));
          break;
        case 'tabla': {
          const exp = `${it.base} → ${it.comparativo} → ${it.superlativo}`;
          out.push(q(it, `${it.base} → ___ (comparativo)`, gen.variants(it.comparativo), exp));
          out.push(q(it, `${it.base} → ___ (superlativo)`, gen.variants(it.superlativo), exp));
          break;
        }
        case 'estructura':
        case 'regla':
          if (it.hueco) {
            const h = fromHueco(it.hueco);
            out.push(q(it, h.text, h.answers, `${it.formula} — ${it.hueco.replace(/\{\{|\}\}/g, '')}`));
          }
          break;
      }
    }
    return out;
  };
})(globalThis);
