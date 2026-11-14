(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  const { h } = FCE.dom;
  FCE.ui = FCE.ui || {};

  FCE.ui.kahoot = {
    render(el, q, onAnswer) {
      let locked = false;
      const tiles = q.options.map((text, i) =>
        h('button', { class: `tile k${(i % 4) + 1}`, type: 'button', 'data-index': i, onclick: () => choose(i) },
          h('span', { class: 'tile-key' }, String(i + 1)), h('span', { class: 'tile-text' }, text), h('span', { class: 'tile-mark' })));

      function choose(i) {
        if (locked) return;
        locked = true;
        document.removeEventListener('keydown', onKey);
        tiles.forEach((t, idx) => {
          t.disabled = true;
          if (idx === q.answer) { t.classList.add('right'); t.querySelector('.tile-mark').textContent = '✓'; }
          else if (idx === i) { t.classList.add('wrong'); t.querySelector('.tile-mark').textContent = '✗'; }
          else t.classList.add('dim');
        });
        onAnswer(i === q.answer);
      }

      function onKey(e) {
        if (!el.isConnected) { document.removeEventListener('keydown', onKey); return; }
        const n = Number(e.key);
        if (n >= 1 && n <= q.options.length) choose(n - 1);
      }
      document.addEventListener('keydown', onKey);

      el.append(h('h2', { class: 'prompt' }, q.prompt), h('div', { class: 'tiles' + (q.options.length <= 2 ? ' two' : '') }, tiles));
    },
  };
})(globalThis);
