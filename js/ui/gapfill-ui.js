(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  const { h } = FCE.dom;
  FCE.ui = FCE.ui || {};

  FCE.ui.gapfill = {
    render(el, q, onAnswer) {
      const parts = q.text.split('___');
      const line = h('p', { class: 'gap-line' });
      const inputs = [];
      const optionBtns = [];
      let locked = false;

      function finish(ok) {
        locked = true;
        inputs.forEach((i) => { i.disabled = true; i.classList.add(ok ? 'right' : 'wrong'); });
        onAnswer(ok);
      }

      if (q.options) {
        // Choice gap (do / make): answer on click.
        parts.forEach((p, i) => {
          line.append(p);
          if (i < parts.length - 1) line.append(h('strong', { class: 'gap-blank' }, ' ____ '));
        });
        const row = h('div', { class: 'opt-row' });
        for (const o of q.options) {
          const b = h('button', {
            class: 'btn quiet', type: 'button', 'data-option': o,
            onclick: () => {
              if (locked) return;
              const ok = FCE.gen.matches(q, o);
              optionBtns.forEach((x) => { x.disabled = true; if (FCE.gen.matches(q, x.dataset.option)) x.classList.add('right'); });
              if (!ok) b.classList.add('wrong');
              finish(ok);
            },
          }, o);
          optionBtns.push(b);
          row.append(b);
        }
        el.append(line, row);
        return;
      }

      parts.forEach((p, i) => {
        line.append(p);
        if (i < parts.length - 1) {
          const input = h('input', {
            class: 'gap-input', type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false',
            'aria-label': `Hueco ${i + 1}`,
            onkeydown: (e) => { if (e.key === 'Enter') check(); },
          });
          inputs.push(input);
          line.append(input);
        }
      });
      const btn = h('button', { class: 'btn', type: 'button', onclick: check }, 'Comprobar');
      el.append(line, h('div', { class: 'actions' }, btn));
      inputs[0].focus();

      function check() {
        if (locked) return;
        if (inputs.some((i) => !i.value.trim())) { inputs.find((i) => !i.value.trim()).focus(); return; }
        const value = inputs.map((i) => i.value.trim()).join(', ');
        btn.disabled = true;
        finish(FCE.gen.matches(q, value));
      }
    },
  };
})(globalThis);
