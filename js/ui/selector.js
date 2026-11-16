(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  const { h } = FCE.dom;

  const GROUPS = [
    ['vocabulario', 'Vocabulary'],
    ['gramatica', 'Grammar'],
    ['expressions', 'Expressions'],
  ];
  const KIND_LABELS = { mixto: 'Mixed', kahoot: 'Kahoot', match: 'Match', gapfill: 'Gap-fill', reorder: 'Reorder' };
  const LENGTHS = [[10, '10'], [20, '20'], ['all', 'All']];

  // Selector: subtopic tiles on the left, a sticky "Your practice" panel on the right (bottom bar on phones).
  FCE.screens.selector = function (el, params) {
    el.classList.add('wide', 'has-dock');
    const temas = FCE.temas;
    const allIds = (t) => t.secciones.map((s) => s.id);
    const selected = new Set();
    const pre = temas.find((t) => t.id === (params && params.temaId));
    for (const id of pre ? allIds(pre) : []) selected.add(id);
    for (const id of (params && params.sectionIds) || []) selected.add(id);

    let exam = false;
    let kind = 'mixto';
    let length = 10;

    const counter = h('span', { class: 'counter', 'aria-live': 'polite' });
    const bigCount = h('span', { class: 'big-count' });
    const bigLabel = h('span', { class: 'muted' });
    const examNote = h('p', { class: 'muted exam-note' });
    const message = h('p', { class: 'muted small-msg', role: 'status' });
    const startBtn = h('button', { class: 'btn start-main', type: 'button', onclick: start }, 'Start');
    const startBtn2 = h('button', { class: 'btn', type: 'button', onclick: start }, 'Start');
    const kindBox = h('div', { class: 'pills', role: 'group', 'aria-label': 'Exercise type' });
    const modeBox = h('div', { class: 'pills', role: 'group', 'aria-label': 'Mode' });
    const lengthBox = h('div', { class: 'pills', role: 'group', 'aria-label': 'Number of questions' });
    const inputs = new Map(); // sectionId -> input
    const tiles = new Map(); // sectionId -> label
    const temaCount = new Map(); // temaId -> span
    const temaToggles = new Map(); // temaId -> button

    function itemCount() {
      return FCE.practice.itemsOf([...selected]).length;
    }

    function refresh() {
      const n = itemCount();
      counter.textContent = `Selected: ${n} ${n === 1 ? 'item' : 'items'}`;
      bigCount.textContent = String(n);
      bigLabel.textContent = n === 1 ? 'item selected' : 'items selected';
      for (const [id, input] of inputs) {
        input.checked = selected.has(id);
        tiles.get(id).classList.toggle('on', selected.has(id));
      }
      for (const t of temas) {
        const ids = allIds(t);
        const total = t.secciones.reduce((a, s) => a + s.items.length, 0);
        const sel = t.secciones.filter((s) => selected.has(s.id)).reduce((a, s) => a + s.items.length, 0);
        temaCount.get(t.id).textContent = `${sel} of ${total} items`;
        temaToggles.get(t.id).textContent = ids.every((id) => selected.has(id)) ? 'Clear all' : 'Select all';
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
      modeBox.replaceChildren(
        h('button', { class: 'pill' + (!exam ? ' on' : ''), type: 'button', 'data-mode': 'practice', 'aria-pressed': String(!exam), onclick: () => { exam = false; refresh(); } }, 'Practice'),
        h('button', { class: 'pill' + (exam ? ' on' : ''), type: 'button', 'data-mode': 'exam', 'aria-pressed': String(exam), onclick: () => { exam = true; refresh(); } }, 'Exam'));
      examNote.textContent = exam ? 'Timed (40 s per question), no feedback until the end. Pass mark: 60%.' : '';
      lengthBox.replaceChildren(
        ...LENGTHS.map(([v, label]) =>
          h('button', {
            class: 'pill' + (v === length ? ' on' : ''), type: 'button', 'aria-pressed': String(v === length),
            onclick: () => { length = v; refresh(); },
          }, label)
        )
      );
      startBtn.disabled = startBtn2.disabled = selected.size === 0;
      message.textContent = selected.size === 0 ? 'Choose at least one subtopic' : '';
    }

    function start() {
      const questions = FCE.practice.build({ sectionIds: [...selected], kind, length });
      if (!questions.length) {
        message.textContent = 'This selection has no questions of that type. Try another type.';
        return;
      }
      FCE.app.go('practice', { questions, exam });
    }

    el.append(h('h1', { class: 'title-l' }, 'Choose what to practise'),
      h('p', { class: 'muted', style: 'margin:6px 0 22px' }, 'Tick the subtopics to include.'));

    const main = h('div', { class: 'sel-main' });
    for (const tema of temas) {
      const count = h('span', { class: 'muted' });
      const toggle = h('button', {
        class: 'linklike', type: 'button',
        onclick: () => {
          const ids = allIds(tema);
          if (ids.every((id) => selected.has(id))) ids.forEach((id) => selected.delete(id));
          else ids.forEach((id) => selected.add(id));
          refresh();
        },
      });
      temaCount.set(tema.id, count);
      temaToggles.set(tema.id, toggle);

      const card = h('section', { class: 'card tema-card' },
        h('div', { class: 'tema-head' },
          h('h2', { class: 'title-l' }, tema.titulo),
          h('div', { class: 'row', style: 'gap:14px' }, count, toggle)));
      for (const [grupo, label] of GROUPS) {
        const secs = tema.secciones.filter((s) => s.grupo === grupo);
        if (!secs.length) continue;
        card.append(h('div', { class: 'group' },
          h('span', { class: 'eyebrow' }, label),
          h('div', { class: 'sel-grid' }, secs.map((s) => {
            const input = h('input', {
              type: 'checkbox', 'data-section': s.id,
              onchange: (e) => { if (e.target.checked) selected.add(s.id); else selected.delete(s.id); refresh(); },
            });
            const tile = h('label', { class: 'sel-tile' },
              input,
              h('span', { class: 'sel-title' }, s.titulo),
              h('span', { class: 'sel-meta' }, `${s.items.length} ${s.items.length === 1 ? 'item' : 'items'}`),
              h('span', { class: 'sel-tick', 'aria-hidden': 'true' }, '✓'));
            inputs.set(s.id, input);
            tiles.set(s.id, tile);
            return tile;
          }))));
      }
      main.append(card);
    }

    const side = h('aside', { class: 'card sel-side' },
      h('span', { class: 'eyebrow' }, 'Your practice'),
      h('div', { class: 'stack', style: 'gap:2px' }, bigCount, bigLabel),
      h('div', null, h('span', { class: 'eyebrow' }, 'Mode'), modeBox, examNote),
      h('div', null, h('span', { class: 'eyebrow' }, 'Exercise type'), kindBox),
      h('div', null, h('span', { class: 'eyebrow' }, 'Questions'), lengthBox),
      startBtn, message);

    el.append(
      h('div', { class: 'sel-layout' }, main, side),
      h('div', { class: 'startbar glass' }, h('div', { class: 'startbar-inner' }, counter, startBtn2))
    );
    refresh();
  };
})(globalThis);
