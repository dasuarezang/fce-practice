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
      out.push({ kind: 'reorder', itemIds: [it.id], words, solution, explain: `${it.formula} — ${sentence}` });
    }
    return out;
  };
})(globalThis);
