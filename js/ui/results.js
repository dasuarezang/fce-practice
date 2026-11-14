(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  const { h } = FCE.dom;

  FCE.screens.results = function (el, params) {
    const summary = params && params.summary;
    const questions = (params && params.questions) || [];
    if (!summary) {
      FCE.app.go('home');
      return;
    }
    const pct = summary.total ? Math.round((summary.correct / summary.total) * 100) : 0;
    const wrong = new Set(summary.wrongItemIds);
    const failedQs = questions.filter((q) => q.itemIds.some((id) => wrong.has(id)));

    el.append(
      h('div', { class: 'stack', style: 'gap:6px;margin:8px 0 24px' },
        h('span', { class: 'eyebrow' }, 'Resultado'),
        h('h1', { class: 'title-xl', 'data-pct': pct }, pct + '%'),
        h('p', { class: 'muted' }, `${summary.correct} de ${summary.total} a la primera.`))
    );

    if (failedQs.length) {
      el.append(h('section', { class: 'card stack' },
        h('h2', { class: 'title-l' }, 'Para repasar'),
        h('ul', { class: 'fails' }, failedQs.map((q) => h('li', null, q.explain || q.prompt || '')))));
    } else {
      el.append(h('section', { class: 'card' }, h('h2', { class: 'title-l' }, 'Sin fallos'), h('p', { class: 'muted', style: 'margin-top:6px' }, 'Todo a la primera.')));
    }

    el.append(h('div', { class: 'row', style: 'margin-top:24px' },
      failedQs.length ? h('button', { class: 'btn', type: 'button', onclick: () => FCE.app.go('practice', { questions: failedQs }) }, 'Repetir fallos') : null,
      h('button', { class: 'btn secondary', type: 'button', onclick: () => FCE.app.go('selector') }, 'Nueva práctica'),
      h('button', { class: 'btn quiet', type: 'button', onclick: () => FCE.app.go('home') }, 'Inicio')));
  };
})(globalThis);
