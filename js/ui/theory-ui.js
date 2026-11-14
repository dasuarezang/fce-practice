(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  const { h } = FCE.dom;

  // Theory: tema tabs on top, section menu on the left (a row of pills on phones), notes on the right.
  FCE.screens.theory = function (el, params) {
    el.classList.add('wide');
    let current = FCE.temas.find((t) => t.id === (params && params.temaId)) || FCE.temas[0];
    const tabs = h('div', { class: 'pills', role: 'tablist' });
    const nav = h('nav', { class: 'th-nav', 'aria-label': 'Sections' });
    const body = h('div', { class: 'stack th-body' });

    function paint() {
      tabs.replaceChildren(...FCE.temas.map((t) =>
        h('button', {
          class: 'pill' + (t === current ? ' on' : ''), type: 'button', role: 'tab', 'aria-selected': String(t === current),
          onclick: () => { current = t; paint(); },
        }, t.titulo)));
      nav.replaceChildren(...current.secciones.map((s) =>
        h('button', {
          class: 'th-link', type: 'button',
          onclick: () => { const t = document.querySelector(`[data-section-id="${s.id}"]`); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
        }, s.titulo)));
      body.replaceChildren();
      for (const s of current.secciones) body.append(h('div', { class: 'card solid theory', html: FCE.theory.render(s) }));
    }

    el.append(h('h1', { class: 'title-l', style: 'margin-bottom:14px' }, 'Theory'), tabs,
      h('div', { class: 'th-layout' }, nav, body));
    paint();
  };
})(globalThis);
