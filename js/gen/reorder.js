(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  const gen = (FCE.gen = FCE.gen || {});

  gen.reorder = function (entries, pool, rng) {
    const out = [];
    for (const { item: it, section } of entries) {
      if (section.tipo !== 'estructura' && !(section.tipo === 'regla' && it.ejemplo)) continue;
      if (!it.ejemplo || it.ejemplo.includes('…')) continue; // never build exercises on illegible text
      const sentence = gen.firstSentence(it.ejemplo);
      const solution = sentence.split(/\s+/);
      let words = null;
      for (let attempt = 0; attempt < 30 && !words; attempt++) {
        const w = rng.shuffle(solution);
        if (w.join(' ') !== solution.join(' ')) words = w;
      }
      if (!words) continue;
      out.push({ kind: 'reorder', itemIds: [it.id], words, solution, purpose: section.tipo === 'estructura' ? it.proposito : undefined, explain: `${it.formula} — ${sentence}` });
      if (section.tipo === 'estructura') {
        // Second exercise: rebuild the structure itself from its tokens ("as + adjective + as").
        const fsol = it.formula.split(/\s+/);
        let fwords = null;
        for (let attempt = 0; attempt < 30 && !fwords; attempt++) {
          const w = rng.shuffle(fsol);
          if (w.join(' ') !== fsol.join(' ')) fwords = w;
        }
        if (fwords) out.push({ kind: 'reorder', itemIds: [it.id], words: fwords, solution: fsol, purpose: it.proposito, formulaOnly: true, explain: `${it.proposito}: ${it.formula}` });
      }
    }
    return out;
  };
})(globalThis);
