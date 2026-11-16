(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  const { h } = FCE.dom;

  const ACCENT = { t1: 'var(--t1)', t2: 'var(--t2)' };

  function counts(tema) {
    const items = tema.secciones.flatMap((s) => s.items);
    const seen = items.filter((i) => FCE.progress.stats(i.id).seen > 0).length;
    return { total: items.length, seen };
  }

  // Home: one choice, Theory or Practice. Progress per unit sits under the practice card.
  FCE.screens.home = function (el) {
    el.classList.add('wide');
    el.append(
      h('div', { class: 'stack', style: 'gap:8px;margin:8px 0 28px' },
        h('span', { class: 'eyebrow' }, 'Cambridge First · class notes'),
        h('h1', { class: 'title-xl' }, 'Practise what you have covered in class.')
      )
    );

    const progress = h('div', { class: 'stack home-progress' });
    for (const tema of FCE.temas) {
      const c = counts(tema);
      const pct = c.total ? Math.round((c.seen / c.total) * 100) : 0;
      progress.append(
        h('div', { class: 'stack', style: 'gap:6px', 'data-tema': tema.id },
          h('div', { class: 'row', style: 'justify-content:space-between;gap:8px' },
            h('span', { style: `font-weight:600;color:${ACCENT[tema.id] || 'var(--text)'}` }, tema.titulo),
            h('span', { class: 'muted small' }, `${c.seen}/${c.total} practised`)),
          h('div', { class: 'progress', role: 'progressbar', 'aria-valuenow': pct, 'aria-valuemin': 0, 'aria-valuemax': 100 }, h('i', { style: `width:${pct}%` }))));
    }

    el.append(
      h('div', { class: 'home-choice' },
        h('button', { class: 'choice card', type: 'button', 'data-go': 'theory', onclick: () => FCE.app.go('theory') },
          h('span', { class: 'choice-kicker' }, 'Read'),
          h('span', { class: 'choice-title' }, 'Theory'),
          h('span', { class: 'muted' }, 'All your notes in one page, unit by unit.'),
          h('span', { class: 'choice-go', 'aria-hidden': 'true' }, '→')),
        h('div', { class: 'choice card stack', 'data-go': 'practice' },
          h('button', { class: 'choice-main', type: 'button', onclick: () => FCE.app.go('selector') },
            h('span', { class: 'choice-kicker' }, 'Test yourself'),
            h('span', { class: 'choice-title' }, 'Practice'),
            h('span', { class: 'muted' }, 'Choose subtopics and the type of exercise.'),
            h('span', { class: 'choice-go', 'aria-hidden': 'true' }, '→')),
          progress)),
      h('p', { style: 'margin-top:28px' },
        h('button', { class: 'linklike', type: 'button', onclick: () => FCE.app.go('coverage') }, 'View coverage of the syllabus')));
  };
})(globalThis);
