(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  const { h } = FCE.dom;
  const KEY = 'fce.lastResult';
  const PASS = 60; // Cambridge First pass mark, in %

  // The last attempt survives a reload of #/results. The questions themselves cannot be rebuilt,
  // so only the numbers and the review lines are stored (no "Retry mistakes" after a reload).
  function remember(data) {
    try { sessionStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* private mode: reload loses the result */ }
  }
  function recall() {
    try {
      const d = JSON.parse(sessionStorage.getItem(KEY));
      return d && d.summary && Array.isArray(d.rows) ? d : null;
    } catch (e) { return null; }
  }

  FCE.screens.results = function (el, params) {
    let data;
    let fresh = false;
    if (params && params.summary) {
      const log = params.log || [];
      data = {
        summary: params.summary,
        rows: log.map(({ q, ok }) => ({ ok, text: q.explain || q.prompt || '' })),
      };
      remember(data);
      fresh = true;
    } else {
      data = recall();
    }
    if (!data) {
      FCE.app.replace('home');
      return;
    }
    const summary = data.summary;
    const questions = (params && params.questions) || [];
    el.classList.add('wide');
    const pct = summary.total ? Math.round((summary.correct / summary.total) * 100) : 0;
    const wrong = new Set(summary.wrongItemIds);
    const failedQs = questions.filter((q) => q.itemIds.some((id) => wrong.has(id)));
    if (fresh && FCE.sound) FCE.sound.play(pct >= PASS ? 'pass' : 'fail');
    const wrongCount = summary.total - summary.correct;

    const score = h('div', { class: 'stack', style: 'gap:8px' },
      h('span', { class: 'eyebrow res-eyebrow' }, pct >= PASS ? 'Your result · passed' : 'Your result · not passed yet'),
      h('h1', { class: 'title-xl res-pct', 'data-pct': pct }, pct + '%'),
      h('p', { class: 'muted' }, `${summary.correct} of ${summary.total} right first time.`),
      h('div', { class: 'res-tally' },
        h('span', { class: 'tally ok' }, `✓ ${summary.correct} right`),
        h('span', { class: 'tally bad' }, `✕ ${wrongCount} wrong`)));

    const review = h('section', { class: 'card stack' },
      h('h2', { class: 'title-l' }, 'Question by question'),
      data.rows.length
        ? h('ul', { class: 'review' }, data.rows.map((r) =>
            h('li', { class: r.ok ? 'ok' : 'bad' }, h('span', { class: 'mark', 'aria-label': r.ok ? 'Right' : 'Wrong' }, r.ok ? '✓' : '✕'), h('span', { class: 'line' }, r.text))))
        : h('p', { class: 'muted' }, 'No details are available for this attempt.'));

    el.append(
      h('div', { class: 'res-grid' }, score, review),
      h('div', { class: 'row res-actions' },
        failedQs.length ? h('button', { class: 'btn', type: 'button', onclick: () => FCE.app.go('practice', { questions: failedQs }) }, 'Retry mistakes') : null,
        h('button', { class: 'btn secondary', type: 'button', onclick: () => FCE.app.go('selector') }, 'New practice'),
        h('button', { class: 'btn quiet', type: 'button', onclick: () => FCE.app.go('home') }, 'Home')));
  };
})(globalThis);
