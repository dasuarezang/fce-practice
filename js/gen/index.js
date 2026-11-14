(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  const gen = (FCE.gen = FCE.gen || {});

  // Which exercise kinds each content tipo can produce (spec §6).
  gen.SUPPORT = {
    pares: ['kahoot', 'match', 'gapfill'],
    antonimos: ['kahoot', 'match', 'gapfill'],
    colocaciones: ['gapfill', 'match', 'kahoot'],
    tabla: ['kahoot', 'gapfill'],
    regla: ['kahoot', 'match'],
    estructura: ['kahoot', 'match', 'gapfill', 'reorder'],
  };

  // Entry = { item, section }: one per study item, in notebook order.
  gen.allEntries = function () {
    const out = [];
    for (const tema of FCE.temas || []) {
      for (const section of tema.secciones) {
        for (const item of section.items) out.push({ item, section });
      }
    }
    return out;
  };

  // Examples may hold several sentences separated by " / "; exercises use the first.
  gen.firstSentence = function (text) {
    return String(text).split(' / ')[0].trim();
  };
})(globalThis);
