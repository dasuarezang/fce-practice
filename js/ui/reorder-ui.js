(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  const { h } = FCE.dom;
  FCE.ui = FCE.ui || {};

  FCE.ui.reorder = {
    render(el, q, onAnswer) {
      let locked = false;
      let dragged = null;
      const target = h('div', { class: 'word-area target', 'aria-label': 'Tu frase', 'data-area': 'target' });
      const pool = h('div', { class: 'word-area pool', 'aria-label': 'Palabras', 'data-area': 'pool' });
      const btn = h('button', { class: 'btn', type: 'button', disabled: true, onclick: check }, 'Comprobar');

      function move(chip, area) {
        if (locked) return;
        area.append(chip);
        btn.disabled = pool.children.length > 0;
      }

      const chips = q.words.map((w) => {
        const chip = h('button', {
          class: 'chip', type: 'button', draggable: 'true',
          onclick: () => move(chip, chip.parentNode === pool ? target : pool),
          ondragstart: () => { dragged = chip; },
        }, w);
        return chip;
      });
      chips.forEach((c) => pool.append(c));

      for (const area of [target, pool]) {
        area.addEventListener('dragover', (e) => e.preventDefault());
        area.addEventListener('drop', (e) => {
          e.preventDefault();
          if (dragged) move(dragged, area);
          dragged = null;
        });
      }

      function check() {
        if (locked || pool.children.length) return;
        locked = true;
        const built = [...target.children].map((c) => c.textContent);
        const ok = built.join(' ') === q.solution.join(' ');
        target.classList.add(ok ? 'right' : 'wrong');
        chips.forEach((c) => { c.disabled = true; });
        btn.disabled = true;
        onAnswer(ok);
      }

      el.append(
        h('p', { class: 'muted', style: 'margin-bottom:12px' }, 'Ordena las palabras para formar la frase.'),
        target, pool, h('div', { class: 'actions' }, btn));
    },
  };
})(globalThis);
