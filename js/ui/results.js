(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  const { h } = FCE.dom;

  FCE.screens.results = function (el, params) {
    const summary = params && params.summary;
    const questions = (params && params.questions) || [];
    if (!summary) {
      FCE.app.replace('home');
      return;
    }
    el.classList.add('wide');
    const pct = summary.total ? Math.round((summary.correct / summary.total) * 100) : 0;
    const wrong = new Set(summary.wrongItemIds);
    const failedQs = questions.filter((q) => q.itemIds.some((id) => wrong.has(id)));

    const score = h('div', { class: 'stack', style: 'gap:8px' },
      h('span', { class: 'eyebrow res-eyebrow' }, 'Result'),
      h('h1', { class: 'title-xl res-pct', 'data-pct': pct }, pct + '%'),
      h('p', { class: 'muted' }, `${summary.correct} of ${summary.total} right first time.`));

    const review = failedQs.length
      ? h('section', { class: 'card stack' },
          h('h2', { class: 'title-l' }, 'To review'),
          h('ul', { class: 'fails' }, failedQs.map((q) => h('li', null, q.explain || q.prompt || ''))))
      : h('section', { class: 'card' },
          h('h2', { class: 'title-l' }, 'No mistakes'),
          h('p', { class: 'muted', style: 'margin-top:6px' }, 'Everything right first time.'));

    el.append(
      h('div', { class: 'res-grid' }, score, review),
      h('div', { class: 'row res-actions' },
        failedQs.length ? h('button', { class: 'btn', type: 'button', onclick: () => FCE.app.go('practice', { questions: failedQs }) }, 'Retry mistakes') : null,
        h('button', { class: 'btn secondary', type: 'button', onclick: () => FCE.app.go('selector') }, 'New practice'),
        h('button', { class: 'btn quiet', type: 'button', onclick: () => FCE.app.go('home') }, 'Home')));
  };
})(globalThis);
