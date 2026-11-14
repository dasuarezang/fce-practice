(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  const { h } = FCE.dom;

  const GROUPS = [
    ['vocabulario', 'Vocabulario'],
    ['gramatica', 'Gramática'],
    ['expressions', 'Expressions'],
  ];
  const KIND_LABELS = { mixto: 'Mixto', kahoot: 'Kahoot', match: 'Relacionar', gapfill: 'Huecos', reorder: 'Ordenar' };
  const LENGTHS = [[10, '10'], [20, '20'], ['all', 'Todo']];

  FCE.screens.selector = function (el, params) {
    const temas = FCE.temas;
    const allIds = (t) => t.secciones.map((s) => s.id);
    const selected = new Set();
    const pre = temas.find((t) => t.id === (params && params.temaId));
    for (const id of pre ? allIds(pre) : []) selected.add(id);

    let kind = 'mixto';
    let length = 10;

    const counter = h('span', { class: 'counter', 'aria-live': 'polite' });
    const message = h('p', { class: 'muted', role: 'status' });
    const startBtn = h('button', { class: 'btn', type: 'button', onclick: start }, 'Empezar');
    const kindBox = h('div', { class: 'pills', role: 'group', 'aria-label': 'Tipo de ejercicio' });
    const lengthBox = h('div', { class: 'pills', role: 'group', 'aria-label': 'Número de preguntas' });
    const checkboxes = new Map(); // sectionId -> input
    const temaToggles = new Map(); // temaId -> button

    function itemCount() {
      return FCE.practice.itemsOf([...selected]).length;
    }

    function refresh() {
      const n = itemCount();
      counter.textContent = `Seleccionados: ${n} ${n === 1 ? 'ítem' : 'ítems'}`;
      for (const [id, input] of checkboxes) input.checked = selected.has(id);
      for (const t of temas) {
        const all = allIds(t).every((id) => selected.has(id));
        temaToggles.get(t.id).textContent = all ? 'Quitar todo' : 'Marcar todo';
      }
      const available = selected.size ? FCE.practice.kindsFor([...selected]) : [];
      if (kind !== 'mixto' && !available.includes(kind)) kind = 'mixto';
      kindBox.replaceChildren(
        ...Object.keys(KIND_LABELS).map((k) => {
          const enabled = k === 'mixto' ? available.length > 0 : available.includes(k);
          return h('button', {
            class: 'pill' + (k === kind ? ' on' : ''), type: 'button', 'data-kind': k, 'aria-pressed': String(k === kind),
            disabled: !enabled, onclick: () => { kind = k; refresh(); },
          }, KIND_LABELS[k]);
        })
      );
      lengthBox.replaceChildren(
        ...LENGTHS.map(([v, label]) =>
          h('button', {
            class: 'pill' + (v === length ? ' on' : ''), type: 'button', 'aria-pressed': String(v === length),
            onclick: () => { length = v; refresh(); },
          }, label)
        )
      );
      startBtn.disabled = selected.size === 0;
      message.textContent = selected.size === 0 ? 'Elige al menos un subtema' : '';
    }

    function start() {
      const questions = FCE.practice.build({ sectionIds: [...selected], kind, length });
      if (!questions.length) {
        message.textContent = 'Con esta selección no hay preguntas de ese tipo. Prueba con otro tipo.';
        return;
      }
      FCE.app.go('practice', { questions, back: 'selector' });
    }

    el.append(h('h1', { class: 'title-l' }, 'Elige qué practicar'),
      h('p', { class: 'muted', style: 'margin:6px 0 20px' }, 'Marca los temas y subtemas que entran en la práctica.'));

    for (const tema of temas) {
      const body = h('div', { class: 'stack' });
      for (const [grupo, label] of GROUPS) {
        const secs = tema.secciones.filter((s) => s.grupo === grupo);
        if (!secs.length) continue;
        body.append(h('div', { class: 'group' },
          h('span', { class: 'eyebrow' }, label),
          secs.map((s) => {
            const input = h('input', {
              type: 'checkbox', 'data-section': s.id,
              onchange: (e) => { if (e.target.checked) selected.add(s.id); else selected.delete(s.id); refresh(); },
            });
            checkboxes.set(s.id, input);
            return h('label', { class: 'check' }, input, h('span', { class: 'check-text' }, s.titulo), h('span', { class: 'muted' }, String(s.items.length)));
          })
        ));
      }
      const toggle = h('button', {
        class: 'linklike', type: 'button',
        onclick: () => {
          const ids = allIds(tema);
          if (ids.every((id) => selected.has(id))) ids.forEach((id) => selected.delete(id));
          else ids.forEach((id) => selected.add(id));
          refresh();
        },
      });
      temaToggles.set(tema.id, toggle);
      const details = h('details', { class: 'card tema-card', open: !pre || pre.id === tema.id },
        h('summary', null, h('span', { class: 'title-l' }, tema.titulo)),
        h('div', { class: 'row', style: 'justify-content:flex-end;margin:8px 0' }, toggle),
        body);
      el.append(details);
    }

    el.append(
      h('section', { class: 'card stack opts' },
        h('div', null, h('span', { class: 'eyebrow' }, 'Tipo de ejercicio'), kindBox),
        h('div', null, h('span', { class: 'eyebrow' }, 'Preguntas'), lengthBox)),
      h('div', { class: 'startbar glass' }, h('div', { class: 'startbar-inner' }, h('div', { class: 'stack', style: 'gap:2px' }, counter, message), startBtn))
    );
    refresh();
  };
})(globalThis);
