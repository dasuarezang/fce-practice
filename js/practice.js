(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  const KINDS = ['kahoot', 'match', 'gapfill', 'reorder'];

  function itemsOf(sectionIds) {
    const wanted = new Set(sectionIds);
    return FCE.gen.allEntries().filter((e) => wanted.has(e.section.id));
  }

  function generate(kind, entries, rng) {
    return FCE.gen[kind](entries, FCE.gen.allEntries(), rng);
  }

  // Mixto: each item gets one of its supported kinds, least-used first, so every kind shows up.
  function assignMixed(entries, rng) {
    const count = Object.fromEntries(KINDS.map((k) => [k, 0]));
    const assigned = new Map(KINDS.map((k) => [k, []]));
    for (const e of rng.shuffle(entries)) {
      const options = FCE.gen.SUPPORT[e.section.tipo];
      const min = Math.min(...options.map((k) => count[k]));
      const kind = rng.pick(options.filter((k) => count[k] === min), 1)[0];
      count[kind]++;
      assigned.get(kind).push(e);
    }
    // A match group needs at least two items of a section: move a lone one to kahoot.
    const matches = assigned.get('match');
    const perSection = {};
    for (const e of matches) perSection[e.section.id] = (perSection[e.section.id] || 0) + 1;
    assigned.set('match', matches.filter((e) => perSection[e.section.id] > 1));
    for (const e of matches) if (perSection[e.section.id] === 1) assigned.get('kahoot').push(e);
    return assigned;
  }

  function build(opts) {
    const rng = FCE.rng.make(opts.seed === undefined ? Date.now() : opts.seed);
    const entries = itemsOf(opts.sectionIds);
    if (!entries.length) return [];
    let questions = [];
    if (opts.kind === 'mixto') {
      for (const [kind, es] of assignMixed(entries, rng)) if (es.length) questions.push(...generate(kind, es, rng));
    } else {
      questions = generate(opts.kind, entries, rng);
    }
    questions = rng.shuffle(questions);
    return opts.length === 'all' || !opts.length ? questions : questions.slice(0, opts.length);
  }

  function kindsFor(sectionIds) {
    const entries = itemsOf(sectionIds);
    const rng = FCE.rng.make(1);
    return KINDS.filter((k) => generate(k, entries, rng).length > 0);
  }

  FCE.practice = { build, itemsOf, kindsFor, KINDS };
})(globalThis);
