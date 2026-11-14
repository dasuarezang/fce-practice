(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  const { h } = FCE.dom;

  // Practice flow: one question at a time, glass feedback sheet after each answer.
  FCE.screens.practice = function (el, params) {
    const questions = (params && params.questions) || [];
    if (!questions.length) {
      FCE.app.go('selector');
      return;
    }
    const session = FCE.session.create(questions);
    const bar = h('i', { style: 'width:0%' });
    const counter = h('span', { class: 'muted' });
    const stage = h('div', { class: 'stage' });
    const sheetHost = h('div');
    el.append(
      h('div', { class: 'stack', style: 'gap:10px;margin-bottom:22px' },
        h('div', { class: 'row', style: 'justify-content:space-between' }, h('span', { class: 'eyebrow' }, 'Práctica'), counter),
        h('div', { class: 'progress' }, bar)),
      stage, sheetHost);

    function show() {
      sheetHost.replaceChildren();
      const q = session.current();
      if (!q) {
        FCE.app.go('results', { summary: session.summary(), questions });
        return;
      }
      const pct = session.total() ? Math.round((session.index() / session.total()) * 100) : 0;
      bar.style.width = pct + '%';
      counter.textContent = `${session.index() + 1} / ${session.total()}`;
      stage.replaceChildren();
      const ui = FCE.ui[q.kind];
      if (!ui) {
        stage.append(h('p', { class: 'muted' }, 'Tipo de ejercicio no disponible.'));
        return;
      }
      let answered = false;
      ui.render(stage, q, (ok) => {
        if (answered) return;
        answered = true;
        FCE.progress.record(q.itemIds, ok);
        session.submit(ok);
        const last = session.done();
        const next = h('button', { class: 'btn', type: 'button', autofocus: true, onclick: show }, last ? 'Ver resultados' : 'Siguiente');
        sheetHost.replaceChildren(
          h('div', { class: 'sheet glass ' + (ok ? 'ok' : 'bad'), role: 'status' },
            h('h4', null, ok ? '¡Correcto!' : 'No era esa'),
            h('p', { class: 'explain' }, q.explain || ''),
            next));
        next.focus();
      });
    }
    show();
  };
})(globalThis);
