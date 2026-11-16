(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  const { h } = FCE.dom;

  const GROUPS = [
    ['vocabulario', 'Vocabulary'],
    ['gramatica', 'Grammar'],
    ['expressions', 'Expressions'],
  ];

  // Theory: every unit on one page, in notebook order (vocabulary, grammar, expressions).
  // Left: an index of units and sections (a wrapped row on phones). Right: the notes.
  FCE.screens.theory = function (el, params) {
    el.classList.add('wide');
    const nav = h('nav', { class: 'th-nav', 'aria-label': 'Contents' });
    const body = h('div', { class: 'stack th-body' });
    const jump = (id) => {
      const t = document.getElementById(id);
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    for (const tema of FCE.temas) {
      nav.append(h('button', { class: 'th-unit', type: 'button', onclick: () => jump('th-' + tema.id) }, tema.titulo));
      const unit = h('section', { class: 'th-tema stack', id: 'th-' + tema.id },
        h('h2', { class: 'title-l th-tema-title' }, tema.titulo));
      for (const [grupo, label] of GROUPS) {
        const secs = tema.secciones.filter((s) => s.grupo === grupo);
        if (!secs.length) continue;
        unit.append(h('span', { class: 'eyebrow th-group' }, label));
        for (const s of secs) {
          nav.append(h('button', { class: 'th-link', type: 'button', onclick: () => jump('sec-' + s.id) }, s.titulo));
          unit.append(h('div', { class: 'card solid theory', id: 'sec-' + s.id, html: FCE.theory.render(s) }));
        }
      }
      body.append(unit);
    }

    el.append(h('h1', { class: 'title-l', style: 'margin-bottom:6px' }, 'Theory'),
      h('p', { class: 'muted', style: 'margin-bottom:18px' }, 'Your class notes, complete and in order.'),
      h('div', { class: 'th-layout' }, nav, body));
    if (params && params.temaId) setTimeout(() => jump('th-' + params.temaId), 0);
  };
})(globalThis);
