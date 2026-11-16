(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  const { h } = FCE.dom;

  // Flashcards for the vocabulary (word pairs and opposites). Flip, then mark "Knew it" or "Not yet";
  // the answer is recorded in the same progress as the exercises, so "Not yet" counts as weak.
  const TIPOS = ['pares', 'antonimos'];

  function cardOf(item, tipo, reverse) {
    const a = tipo === 'pares' ? item.termino : item.positivo;
    const b = tipo === 'pares' ? item.definicion : item.negativo;
    return reverse ? { id: item.id, front: b, back: a } : { id: item.id, front: a, back: b };
  }

  FCE.screens.flashcards = function (el, params) {
    el.classList.add('has-dock');
    if (params && params.deck) return study(el, params.deck);
    return choose(el);
  };

  function choose(el) {
    const sections = FCE.temas.flatMap((t) => t.secciones.filter((s) => TIPOS.includes(s.tipo)).map((s) => ({ t, s })));
    const picked = new Set(sections.map((x) => x.s.id));
    let reverse = false;
    let onlyWeak = false;
    const weak = new Set(FCE.progress.weakIds());
    const msg = h('p', { class: 'muted small-msg', role: 'status' });
    const tiles = sections.map(({ t, s }) => {
      const input = h('input', { type: 'checkbox', checked: true, onchange: (e) => { if (e.target.checked) picked.add(s.id); else picked.delete(s.id); } });
      return h('label', { class: 'sel-tile on' }, input,
        h('span', { class: 'sel-title' }, s.titulo), h('span', { class: 'sel-meta' }, `${t.titulo.split('.')[0]}. · ${s.items.length} cards`),
        h('span', { class: 'sel-tick', 'aria-hidden': 'true' }, '✓'));
    });
    // keep the "on" look in sync with the checkboxes
    for (const tile of tiles) tile.querySelector('input').addEventListener('change', (e) => tile.classList.toggle('on', e.target.checked));

    const dirBox = h('div', { class: 'pills', role: 'group', 'aria-label': 'Direction' });
    const weakBox = h('div', { class: 'pills', role: 'group', 'aria-label': 'Which cards' });
    function paint() {
      dirBox.replaceChildren(
        h('button', { class: 'pill' + (!reverse ? ' on' : ''), type: 'button', onclick: () => { reverse = false; paint(); } }, 'Word → meaning'),
        h('button', { class: 'pill' + (reverse ? ' on' : ''), type: 'button', onclick: () => { reverse = true; paint(); } }, 'Meaning → word'));
      weakBox.replaceChildren(
        h('button', { class: 'pill' + (!onlyWeak ? ' on' : ''), type: 'button', onclick: () => { onlyWeak = false; paint(); } }, 'All cards'),
        h('button', { class: 'pill' + (onlyWeak ? ' on' : ''), type: 'button', onclick: () => { onlyWeak = true; paint(); } }, 'Only my weak ones'));
    }
    paint();

    function start() {
      const rng = FCE.rng.make(Date.now());
      let cards = [];
      for (const { s } of sections) {
        if (!picked.has(s.id)) continue;
        for (const it of s.items) {
          if (onlyWeak && !weak.has(it.id)) continue;
          cards.push(cardOf(it, s.tipo, reverse));
        }
      }
      if (!cards.length) { msg.textContent = onlyWeak ? 'No weak cards in this selection. Nice.' : 'Choose at least one subtopic.'; return; }
      FCE.app.go('flashcards', { deck: rng.shuffle(cards) });
    }

    el.append(
      h('h1', { class: 'title-l' }, 'Flashcards'),
      h('p', { class: 'muted', style: 'margin:6px 0 20px' }, 'Quick vocabulary review. Flip each card, then say whether you knew it.'),
      h('section', { class: 'card stack' },
        h('span', { class: 'eyebrow' }, 'Subtopics'),
        h('div', { class: 'sel-grid' }, tiles),
        h('div', null, h('span', { class: 'eyebrow' }, 'Direction'), dirBox),
        h('div', null, h('span', { class: 'eyebrow' }, 'Cards'), weakBox),
        h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', onclick: start }, 'Start'), msg)));
  }

  function study(el, deck) {
    let i = 0;
    let flipped = false;
    const missed = [];
    const counter = h('span', { class: 'muted' });
    const bar = h('i', { style: 'width:0%' });
    const stage = h('div', { class: 'stage' });

    function render() {
      if (i >= deck.length) return finish();
      const c = deck[i];
      flipped = false;
      bar.style.width = Math.round((i / deck.length) * 100) + '%';
      counter.textContent = `${i + 1} / ${deck.length}`;
      const face = h('button', { class: 'flash', type: 'button', 'aria-live': 'polite', onclick: flip },
        h('span', { class: 'flash-side eyebrow' }, 'Tap to flip'),
        h('span', { class: 'flash-text' }, c.front));
      const answers = h('div', { class: 'row flash-actions', hidden: true },
        h('button', { class: 'btn quiet', type: 'button', onclick: () => mark(false) }, '✕ Not yet'),
        h('button', { class: 'btn', type: 'button', onclick: () => mark(true) }, '✓ Knew it'));
      function flip() {
        flipped = !flipped;
        face.classList.toggle('back', flipped);
        face.querySelector('.flash-side').textContent = flipped ? 'Answer' : 'Tap to flip';
        face.querySelector('.flash-text').textContent = flipped ? c.back : c.front;
        if (flipped) answers.hidden = false;
      }
      stage.replaceChildren(face, answers);
    }

    function mark(ok) {
      const c = deck[i];
      FCE.progress.record([c.id], ok);
      if (!ok) missed.push(c);
      i++;
      render();
    }

    function finish() {
      bar.style.width = '100%';
      counter.textContent = `${deck.length} / ${deck.length}`;
      const known = deck.length - missed.length;
      stage.replaceChildren(h('div', { class: 'card stack' },
        h('span', { class: 'eyebrow res-eyebrow' }, 'Deck finished'),
        h('h2', { class: 'title-xl' }, `${known} / ${deck.length}`),
        h('p', { class: 'muted' }, missed.length ? 'The ones you missed are now marked as weak.' : 'You knew every card.'),
        h('div', { class: 'row' },
          missed.length ? h('button', { class: 'btn', type: 'button', onclick: () => FCE.app.go('flashcards', { deck: FCE.rng.make(Date.now()).shuffle(missed) }) }, `Repeat the ${missed.length} missed`) : null,
          h('button', { class: 'btn secondary', type: 'button', onclick: () => FCE.app.go('flashcards') }, 'New deck'),
          h('button', { class: 'btn quiet', type: 'button', onclick: () => FCE.app.go('home') }, 'Home'))));
    }

    el.append(
      h('div', { class: 'stack', style: 'gap:10px;margin-bottom:22px' },
        h('div', { class: 'row', style: 'justify-content:space-between' }, h('span', { class: 'eyebrow' }, 'Flashcards'), counter),
        h('div', { class: 'progress' }, bar)),
      stage);
    render();
  }
})(globalThis);
