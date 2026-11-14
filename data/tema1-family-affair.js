(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  FCE.temas = FCE.temas || [];

  const slug = (s) => s.toLowerCase().replace(/\(|\)/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const phrasal = [
    ['hang out', 'spend time with someone'],
    ['count on', 'rely on; depend on'],
    ['turn into', 'become; transform'],
    ['make it up', 'invent; lie', 'Is it "invent; lie"? Confirm the last word against the notebook'],
    ['carry on', 'continue'],
    ['turn up', 'arrive; appear'],
  ].map(([termino, definicion, revisar]) => {
    const item = { id: 't1-pv-' + slug(termino), termino, definicion, fuente: 1 };
    if (revisar) item.revisar = revisar;
    return item;
  });

  const adjetivos = [
    ['anxious', 'ansioso'], ['bad-tempered', 'malhumorado'], ['bossy', 'mandón'], ['bright', 'brillante'],
    ['considerate', 'considerado'], ['dishonest', 'deshonesto'], ['enthusiastic', 'entusiasta'],
    ['hard-working', 'trabajador'], ['impatient', 'impaciente'], ['disappointed', 'decepcionado'],
    ['mature', 'maduro'], ['organised', 'organizado'], ['polite', 'educado/cortés'], ['quiet', 'callado'],
    ['reserved', 'reservado'], ['responsible', 'responsable'], ['sensitive', 'sensible'],
    ['unreliable', 'poco fiable'], ['wise', 'sabio'], ['upset', 'enfadado/molesto'],
  ].map(([termino, definicion]) => ({ id: 't1-adj-' + slug(termino), termino, definicion, fuente: 1 }));

  const antonimos = [
    ['considerate', 'inconsiderate'], ['enthusiastic', 'unenthusiastic'], ['organised', 'disorganised'],
    ['responsible', 'irresponsible'], ['concerned', 'unconcerned'], ['mature', 'immature'],
    ['polite', 'impolite'], ['sensitive', 'insensitive'],
  ].map(([positivo, negativo]) => ({ id: 't1-anto-' + slug(positivo), positivo, negativo, fuente: 1 }));

  const presentPerfect = [
    {
      id: 't1-pp-simple',
      titulo: 'Present Perfect Simple',
      formula: 'have + past participle',
      puntos: [
        'Views the action as something permanent.',
        'Emphasises the result.',
        'ACTION IS FINISHED.',
        'Focuses on HOW MANY TIMES an action has happened.',
      ],
      fuente: 1,
    },
    {
      id: 't1-pp-continuous',
      titulo: 'Present Perfect Continuous',
      formula: 'have + been + verb-ing',
      puntos: [
        'Views the action as temporary.',
        'Emphasises the action itself.',
        'ACTION IS IN PROGRESS.',
        'Focuses on HOW LONG the action has been in progress.',
      ],
      fuente: 1,
    },
  ];

  const doMake = [
    ['do', 'an activity'], ['make', 'an appointment'], ['make', 'an arrangement'], ['make', 'the bed'],
    ['do', 'business'], ['make', 'a change'], ['make', 'a choice'], ['do', 'the cleaning'], ['do', 'a course'],
    ['make', 'a decision'], ['make', 'an effort'], ['make', 'an excuse'], ['do', '(an) exercise'],
    ['do', 'a favour'], ['make', 'friends'], ['do', 'homework'], ['do', 'housework'],
    ['make', 'an impression'], ['do', 'a job'], ['make', 'a mistake'], ['make', 'money'], ['make', 'a noise'],
    ['make', 'a phone call'], ['make', 'a plan'], ['make', 'progress'], ['make', 'a promise'],
    ['do', 'the shopping'], ['do', '(a) sport'], ['do', 'work'],
  ].map(([verbo, resto]) => ({ id: `t1-dm-${verbo}-${slug(resto)}`, verbo, resto, fuente: 2 }));

  FCE.temas.push({
    id: 't1',
    titulo: '1. Family Affair',
    secciones: [
      { id: 't1-phrasal', titulo: 'Phrasal verbs', grupo: 'vocabulario', tipo: 'pares', items: phrasal },
      { id: 't1-adjetivos', titulo: 'Adjectives', grupo: 'vocabulario', tipo: 'pares', items: adjetivos },
      { id: 't1-antonimos', titulo: '+ Adjective : − Adjective', grupo: 'vocabulario', tipo: 'antonimos', items: antonimos },
      { id: 't1-present-perfect', titulo: 'Present Perfect Simple vs Continuous', grupo: 'gramatica', tipo: 'regla', items: presentPerfect },
      { id: 't1-do-make', titulo: 'Do or Make', grupo: 'vocabulario', tipo: 'colocaciones', items: doMake },
    ],
  });
})(globalThis);
