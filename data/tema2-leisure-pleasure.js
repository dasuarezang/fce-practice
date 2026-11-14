(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  FCE.temas = FCE.temas || [];

  const slug = (s) => s.toLowerCase().replace(/\(|\)/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const phrasal = [
    ['come across', 'to meet someone or find something by chance'],
    ['come along', 'to arrive or appear in a place'],
    ['come up against', 'to have to deal with a problem or difficulty'],
    ['count on', 'to be able to depend on something or someone'],
    ['end up', 'to finally be in a particular place or situation'],
    ['go on', 'to continue to happen or exist'],
    ['run out of', 'to finish, use or sell something completely'],
    ['throw yourself into', 'to start doing something with a lot of enthusiasm and energy'],
  ].map(([termino, definicion]) => ({ id: 't2-pv-' + slug(termino), termino, definicion, fuente: 3 }));

  const edIng = [
    {
      id: 't2-ed-ing-ed',
      titulo: 'Adjectives ending in -ed',
      formula: '-ed',
      puntos: ['They refer to feelings.'],
      ejemplo: 'I feel really EXCITED for Ocarina of Time Remake!',
      hueco: 'I feel really {{excited}} for Ocarina of Time Remake!',
      fuente: 3,
    },
    {
      id: 't2-ed-ing-ing',
      titulo: 'Adjectives ending in -ing',
      formula: '-ing',
      puntos: ['They refer to actions or situations.'],
      ejemplo: "Tomorrow's day will be really EXCITING, Ocarina of Time is launching!",
      hueco: "Tomorrow's day will be really {{exciting}}, Ocarina of Time is launching!",
      fuente: 3,
    },
  ];

  const comparativos = [
    ['high', 'higher', 'highest', 'one syllable'],
    ['small', 'smaller', 'smallest', 'one syllable'],
    ['fat', 'fatter', 'fattest', 'ending single consonant'],
    ['sad', 'sadder', 'saddest', 'ending single consonant'],
    ['clever', 'cleverer / more clever', 'cleverest / most clever', 'two syllables'],
    ['narrow', 'narrower / more narrow', 'narrowest / most narrow', 'two syllables'],
    ['experienced', 'more experienced', 'most experienced', 'three or more syllables'],
    ['inconvenient', 'more inconvenient', 'most inconvenient', 'three or more syllables'],
  ].map(([base, comparativo, superlativo, nota]) => ({
    id: 't2-comp-' + slug(base), base, comparativo, superlativo, nota, fuente: 3,
  }));

  const irregulares = [
    ['good', 'better', 'best'],
    ['bad', 'worse', 'worst'],
    ['little', 'less', 'least'],
    ['much', 'more', 'most'],
    ['far', 'further / farther', 'furthest / farthest'],
  ].map(([base, comparativo, superlativo]) => ({
    id: 't2-irr-' + slug(base), base, comparativo, superlativo, fuente: 4,
  }));

  const E = (key, proposito, formula, ejemplo, hueco, fuente, revisar) => {
    const item = { id: 't2-expr-' + key, proposito, formula, ejemplo, hueco, fuente };
    if (revisar) item.revisar = revisar;
    return item;
  };

  const expressions = [
    E('as-adj-as', 'To say two things are the same', 'as + adjective + as',
      'She finds physics as challenging as maths.',
      'She finds physics {{as}} challenging {{as}} maths.', 4),
    E('not-so-adj-as', 'To say that one thing is less than another', 'not so/as + adjective + as',
      "The party's majority in Parliament is not so/as big as it was.",
      "The party's majority in Parliament is not {{so/as}} big {{as}} it was.", 4),
    E('less-least', 'To say that one thing is more or less than another', 'less/least + adjective',
      'This coat is less expensive than the other one. / This is the least expensive coat in the shop.',
      'This coat is {{less}} expensive than the other one.', 4),
    E('as-adv-as', 'To say that we do one thing the same as another person', 'as + adverb + as',
      'She dresses as elegantly as a fashion model.',
      'She dresses {{as}} elegantly {{as}} a fashion model.', 4),
    E('not-so-adv-as', 'To say that we do one thing differently from another person', 'not so/as + adverb + as',
      "He doesn't adapt to new situations as rapidly as his peers.",
      "He doesn't adapt to new situations {{as}} rapidly {{as}} his peers.", 4),
    E('much-more', 'To express large differences',
      'much/far/a lot/considerably + adjective/adverb + -er/more + adjective/adverb',
      'Acts of kindness are often much more common when societies face big challenges.',
      'Acts of kindness are often {{much/far/a lot/considerably}} more common when societies face big challenges.', 4),
    E('not-nearly', 'To express large differences', 'not nearly as + adjective/adverb + as',
      'The study of genetics is not nearly as well developed as we would wish.',
      'The study of genetics is {{not nearly as}} well developed {{as}} we would wish.', 4),
    E('by-far', 'To express large differences', 'by far + superlative',
      "This restaurant's pizza is by far the most authentic I've tried in my city.",
      "This restaurant's pizza is {{by far}} the most authentic I've tried in my city.", 4),
    E('one-of-the-most', 'To express large differences', 'one of the most + superlative + infinitive',
      'Amazingly, one of the filthiest parts of the human body is the mouth, which has 600 different types of bacteria living on it.',
      'Amazingly, {{one of the}} filthiest parts of the human body is the mouth, which has 600 different types of bacteria living on it.', 5),
    E('slightly', 'To express small differences',
      'slightly/a bit/a little + adjective/adverb + -er/more + adjective/adverb',
      'Because of the new gambling law, people spend slightly less time in casinos than they did in the past.',
      'Because of the new gambling law, people spend {{slightly/a bit/a little}} less time in casinos than they did in the past.', 5),
    E('not-quite', 'To express small differences', 'not quite as + adjective/adverb + as',
      'The launch of the new product was not quite as successful as anticipated.',
      'The launch of the new product was {{not quite as}} successful {{as}} anticipated.', 5),
  ];

  FCE.temas.push({
    id: 't2',
    titulo: '2. Leisure and Pleasure',
    secciones: [
      { id: 't2-phrasal', titulo: 'Phrasal verbs & expressions', grupo: 'vocabulario', tipo: 'pares', items: phrasal },
      { id: 't2-ed-ing', titulo: 'Adjectives ending -ed, -ing', grupo: 'gramatica', tipo: 'regla', items: edIng },
      {
        id: 't2-comparativos', titulo: 'Comparatives and superlatives', grupo: 'gramatica', tipo: 'tabla', items: comparativos,
        intro: [
          'Comparative adjectives: they compare two things.',
          'Superlative adjectives: they compare one thing to a group.',
          'Three or more syllables: more + adjective (comparative) / most + adjective (superlative).',
        ],
      },
      { id: 't2-irregulares', titulo: 'Irregular adjectives', grupo: 'gramatica', tipo: 'tabla', items: irregulares },
      { id: 't2-expressions', titulo: 'Comparison expressions', grupo: 'expressions', tipo: 'estructura', items: expressions },
    ],
  });
})(globalThis);
