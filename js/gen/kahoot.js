(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  const gen = (FCE.gen = FCE.gen || {});

  // Candidate distractors: same section first, then the rest of the pool.
  function candidates(entry, pool, texter, keyer, sameSectionOnly) {
    const same = [];
    const rest = [];
    for (const e of pool) {
      if (e.item.id === entry.item.id) continue;
      if (keyer(e.item) === keyer(entry.item)) continue;
      const c = { text: texter(e.item) };
      if (c.text === undefined) continue;
      (e.section.id === entry.section.id ? same : rest).push(c);
    }
    return sameSectionOnly ? [same] : [same, rest];
  }

  function assemble(entry, rng, prompt, correct, groups, explain) {
    const chosen = [];
    const seen = new Set([correct]);
    for (const group of groups) {
      for (const c of rng.shuffle(group)) {
        if (chosen.length >= 3) break;
        if (seen.has(c.text)) continue;
        seen.add(c.text);
        chosen.push(c.text);
      }
    }
    const options = rng.shuffle([correct, ...chosen]);
    return { kind: 'kahoot', itemIds: [entry.item.id], prompt, options, answer: options.indexOf(correct), explain };
  }

  // Wrong-but-tempting forms for a comparative/superlative question.
  gen.formTraps = function (it, comp) {
    const parts = (v) => v.split('/').map((x) => x.trim()).filter(Boolean);
    const right = new Set(parts(comp ? it.comparativo : it.superlativo));
    const traps = [parts(comp ? it.superlativo : it.comparativo)[0]];
    // Two-syllable adjectives accept both patterns, so a pattern trap there could be right.
    if (it.nota !== 'two syllables') {
      traps.push(it.nota === 'three or more syllables'
        ? it.base + (comp ? 'er' : 'est') // inconvenient -> inconvenientest
        : (comp ? 'more ' : 'most ') + it.base); // high -> most high, bad -> most bad
    }
    return traps.filter((t, i) => t && !right.has(t) && traps.indexOf(t) === i);
  };

  function build(entry, pool, rng) {
    const it = entry.item;
    switch (entry.section.tipo) {
      case 'pares': {
        const explain = `${it.termino} = ${it.definicion}`;
        if (rng.next() < 0.5) {
          return assemble(entry, rng, `What does “${it.termino}” mean?`, it.definicion,
            candidates(entry, pool, (i) => i.definicion, (i) => i.termino), explain);
        }
        return assemble(entry, rng, `Which expression means “${it.definicion}”?`, it.termino,
          candidates(entry, pool, (i) => i.termino, (i) => i.termino), explain);
      }
      case 'antonimos':
        return assemble(entry, rng, `What is the opposite of “${it.positivo}”?`, it.negativo,
          candidates(entry, pool, (i) => i.negativo, (i) => i.positivo), `${it.positivo} ↔ ${it.negativo}`);
      case 'colocaciones': {
        const options = ['do', 'make'];
        return {
          kind: 'kahoot', itemIds: [it.id], prompt: `___ ${it.resto}`, options,
          answer: options.indexOf(it.verbo), explain: `${it.verbo} ${it.resto}`,
        };
      }
      case 'tabla': {
        const comp = rng.next() < 0.5;
        const field = comp ? 'comparativo' : 'superlativo';
        const groups = candidates(entry, pool, (i) => i[field], (i) => i.base);
        // Traps first, so the answer cannot be found by logic alone: the other degree of the same
        // adjective (worse when asked for the superlative of "bad") and the regular-pattern mistake.
        groups.unshift(gen.formTraps(it, comp).map((text) => ({ text })));
        return assemble(entry, rng, `${comp ? 'Comparative' : 'Superlative'} of “${it.base}”`, it[field],
          groups, `${it.base} → ${it.comparativo} → ${it.superlativo}`);
      }
      case 'regla': {
        const punto = rng.pick(it.puntos, 1)[0];
        return assemble(entry, rng, `Which one does this describe: “${punto}”?`, it.titulo,
          candidates(entry, pool, (i) => i.titulo, (i) => i.id, true), `${it.titulo}: ${it.formula}`);
      }
      case 'estructura':
        if (rng.next() < 0.5) {
          // By purpose: same-purpose formulas are excluded from the options, so only one fits.
          return assemble(entry, rng, `Which structure fits: “${it.proposito}”?`, it.formula,
            candidates(entry, pool, (i) => i.formula, (i) => i.proposito), `${it.proposito}: ${it.formula}`);
        }
        return assemble(entry, rng, `Which structure is used in: “${gen.firstSentence(it.ejemplo)}”?`, it.formula,
          candidates(entry, pool, (i) => i.formula, (i) => i.id), `${it.proposito}: ${it.formula}`);
      default:
        return null;
    }
  }

  gen.kahoot = function (entries, pool, rng) {
    return entries.map((e) => build(e, pool, rng)).filter(Boolean);
  };
})(globalThis);
