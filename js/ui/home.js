(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  const { h } = FCE.dom;

  const ACCENT = { t1: 'var(--t1)', t2: 'var(--t2)' };

  function counts(tema) {
    const items = tema.secciones.flatMap((s) => s.items);
    const seen = items.filter((i) => FCE.progress.stats(i.id).seen > 0).length;
    return { total: items.length, seen };
  }

  FCE.screens.home = function (el) {
    el.append(
      h('div', { class: 'stack', style: 'gap:8px;margin:8px 0 28px' },
        h('span', { class: 'eyebrow' }, 'Cambridge First · class notes'),
        h('h1', { class: 'title-xl' }, 'Practise what you have covered in class.')
      )
    );
    const list = h('div', { class: 'stack' });
    for (const tema of FCE.temas) {
      const c = counts(tema);
      const pct = c.total ? Math.round((c.seen / c.total) * 100) : 0;
      list.append(
        h('article', { class: 'card stack', 'data-tema': tema.id },
          h('div', { class: 'row', style: 'justify-content:space-between' },
            h('h2', { class: 'title-l', style: `color:${ACCENT[tema.id] || 'var(--text)'}` }, tema.titulo),
            h('span', { class: 'muted' }, `${c.seen}/${c.total} items practised`)
          ),
          h('div', { class: 'progress', role: 'progressbar', 'aria-valuenow': pct, 'aria-valuemin': 0, 'aria-valuemax': 100 }, h('i', { style: `width:${pct}%` })),
          h('div', { class: 'row' },
            h('button', { class: 'btn', type: 'button', onclick: () => FCE.app.go('selector', { temaId: tema.id }) }, 'Practise'),
            h('button', { class: 'btn secondary', type: 'button', onclick: () => FCE.app.go('theory', { temaId: tema.id }) }, 'Theory')
          )
        )
      );
    }
    el.append(list, h('p', { style: 'margin-top:28px' },
      h('button', { class: 'linklike', type: 'button', onclick: () => FCE.app.go('coverage') }, 'View coverage of the syllabus')));
  };
})(globalThis);
