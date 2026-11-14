(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  const { h } = FCE.dom;
  FCE.ui = FCE.ui || {};

  // Reorder: tap a word to move it between the pool and the sentence, or drag it (mouse or touch)
  // to the sentence area; dropping on a word inserts before it.
  FCE.ui.reorder = {
    render(el, q, onAnswer) {
      let locked = false;
      let suppressClick = false;
      const target = h('div', { class: 'word-area target', 'aria-label': 'Your sentence', 'data-area': 'target' });
      const pool = h('div', { class: 'word-area pool', 'aria-label': 'Words', 'data-area': 'pool' });
      const btn = h('button', { class: 'btn', type: 'button', disabled: true, onclick: check }, 'Check');

      function place(chip, area, before) {
        if (locked) return;
        if (before && before !== chip && before.parentNode === area) area.insertBefore(chip, before);
        else area.append(chip);
        btn.disabled = pool.children.length > 0;
      }

      function makeChip(word) {
        const chip = h('button', {
          class: 'chip', type: 'button',
          onclick: () => {
            if (suppressClick) return;
            place(chip, chip.parentNode === pool ? target : pool);
          },
        }, word);
        chip.addEventListener('pointerdown', (e) => {
          if (locked || (e.pointerType === 'mouse' && e.button !== 0)) return;
          const start = { x: e.clientX, y: e.clientY };
          let dragging = false;
          try { chip.setPointerCapture(e.pointerId); } catch (err) { /* synthetic pointer: events still reach the chip */ }
          const move = (ev) => {
            const dx = ev.clientX - start.x;
            const dy = ev.clientY - start.y;
            if (!dragging && Math.hypot(dx, dy) > 6) { dragging = true; chip.classList.add('dragging'); }
            if (dragging) chip.style.transform = `translate(${dx}px, ${dy}px)`;
          };
          const up = (ev) => {
            chip.removeEventListener('pointermove', move);
            chip.removeEventListener('pointerup', up);
            chip.removeEventListener('pointercancel', up);
            if (!dragging) return; // a plain tap: the click handler does the move
            chip.style.pointerEvents = 'none';
            const under = document.elementFromPoint(ev.clientX, ev.clientY);
            chip.style.pointerEvents = '';
            chip.style.transform = '';
            chip.classList.remove('dragging');
            suppressClick = true;
            setTimeout(() => { suppressClick = false; }, 0);
            const area = under && under.closest ? under.closest('.word-area') : null;
            if (area && ev.type === 'pointerup') place(chip, area, under.closest('.chip'));
          };
          chip.addEventListener('pointermove', move);
          chip.addEventListener('pointerup', up);
          chip.addEventListener('pointercancel', up);
        });
        return chip;
      }

      const chips = q.words.map(makeChip);
      chips.forEach((c) => pool.append(c));

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
        h('p', { class: 'muted', style: 'margin-bottom:12px' }, 'Put the words in order to form the sentence.'),
        target, pool, h('div', { class: 'actions' }, btn));
    },
  };
})(globalThis);
