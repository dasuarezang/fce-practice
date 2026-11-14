(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  const { h } = FCE.dom;

  // Coverage: how much of the notes has been practised, and which items still need confirming.
  FCE.screens.coverage = function (el) {
    const stat = (items) => {
      let worked = 0;
      let failed = 0;
      for (const i of items) {
        const s = FCE.progress.stats(i.id);
        if (s.seen > 0) worked++;
        if (s.wrong > 0) failed++;
      }
      return { total: items.length, worked, failed };
    };

    const all = FCE.temas.flatMap((t) => t.secciones.flatMap((s) => s.items));
    const g = stat(all);
    el.append(
      h('h1', { class: 'title-l' }, 'Cobertura del temario'),
      h('p', { class: 'muted', style: 'margin:6px 0 20px' }, `${g.total} ítems en los apuntes · ${g.worked} practicados · ${g.failed} con fallos`));

    const flagged = [];
    for (const tema of FCE.temas) {
      const rows = tema.secciones.map((s) => {
        const c = stat(s.items);
        for (const i of s.items) if (i.revisar) flagged.push({ id: i.id, note: i.revisar, section: s.titulo });
        const pages = [...new Set(s.items.map((i) => i.fuente))].sort().join(', ');
        return h('tr', { 'data-section': s.id },
          h('th', { scope: 'row' }, s.titulo, h('span', { class: 'muted small' }, ` · p. ${pages}`)),
          h('td', null, String(c.total)), h('td', null, String(c.worked)), h('td', { class: c.failed ? 'bad-text' : '' }, String(c.failed)));
      });
      el.append(h('section', { class: 'card solid', style: 'margin-bottom:16px;overflow-x:auto' },
        h('h2', { class: 'title-l', style: 'margin-bottom:10px' }, tema.titulo),
        h('table', { class: 'cov-table' },
          h('thead', null, h('tr', null, h('th', null, 'Subtema'), h('th', null, 'Ítems'), h('th', null, 'Practicados'), h('th', null, 'Con fallos'))),
          h('tbody', null, rows))));
    }

    if (flagged.length) {
      el.append(h('section', { class: 'card stack' },
        h('h2', { class: 'title-l' }, 'Por confirmar con el cuaderno'),
        h('ul', { class: 'fails' }, flagged.map((f) => h('li', { 'data-revisar': f.id }, h('span', { class: 'badge' }, 'revisar'), ' ', h('strong', null, f.id), ' — ', f.note)))));
    }
  };
})(globalThis);
