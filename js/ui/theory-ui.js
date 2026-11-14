(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  const { h } = FCE.dom;

  // Theory: the notes, cleaned up, one section per card. Params: { temaId }.
  FCE.screens.theory = function (el, params) {
    let current = FCE.temas.find((t) => t.id === (params && params.temaId)) || FCE.temas[0];
    const body = h('div', { class: 'stack' });
    const tabs = h('div', { class: 'pills', role: 'tablist' });
    const toc = h('div', { class: 'pills toc' });

    function paint() {
      tabs.replaceChildren(...FCE.temas.map((t) =>
        h('button', {
          class: 'pill' + (t === current ? ' on' : ''), type: 'button', role: 'tab', 'aria-selected': String(t === current),
          onclick: () => { current = t; paint(); },
        }, t.titulo)));
      toc.replaceChildren(...current.secciones.map((s) =>
        h('button', {
          class: 'pill', type: 'button',
          onclick: () => { const t = document.querySelector(`[data-section-id="${s.id}"]`); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
        }, s.titulo)));
      body.replaceChildren();
      for (const s of current.secciones) body.append(h('div', { class: 'card solid theory', html: FCE.theory.render(s) }));
    }

    el.append(h('h1', { class: 'title-l', style: 'margin-bottom:14px' }, 'Teoría'), tabs, h('div', { style: 'height:12px' }), toc, h('div', { style: 'height:18px' }), body);
    paint();
  };
})(globalThis);
