(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  const { h } = FCE.dom;
  FCE.ui = FCE.ui || {};

  const SVG = 'http://www.w3.org/2000/svg';

  // Match with arrows: drag from a dot on the left card to a card on the right (mouse or touch).
  // Tap alternative: tap a left card, then tap a right card. Many-to-one is allowed.
  FCE.ui.match = {
    render(el, q, onAnswer) {
      const links = new Map(); // leftId -> rightId
      let locked = false;
      let verdict = null; // leftId -> boolean after checking
      let selected = null; // tap mode
      let drag = null; // { leftId, line }
      let suppressClick = false;

      const board = h('div', { class: 'match-board' });
      const svg = document.createElementNS(SVG, 'svg');
      svg.setAttribute('class', 'match-lines');
      svg.setAttribute('aria-hidden', 'true');
      const leftCards = new Map();
      const rightCards = new Map();
      const leftDots = new Map();
      const rightDots = new Map();

      const leftCol = h('div', { class: 'match-col' });
      const rightCol = h('div', { class: 'match-col' });
      for (const l of q.left) {
        const dot = h('span', { class: 'dot', 'data-dot': l.id });
        const card = h('div', { class: 'mcard left', 'data-left': l.id, tabindex: '0', role: 'button' }, h('span', null, l.text), dot);
        leftCards.set(l.id, card);
        leftDots.set(l.id, dot);
        card.addEventListener('click', () => {
          if (locked || suppressClick) return;
          selected = selected === l.id ? null : l.id;
          paint();
        });
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
        });
        dot.addEventListener('pointerdown', (e) => startDrag(e, l.id, dot));
        leftCol.append(card);
      }
      for (const r of q.right) {
        const dot = h('span', { class: 'dot' });
        const card = h('div', { class: 'mcard right', 'data-right': r.id, tabindex: '0', role: 'button' }, dot, h('span', null, r.text));
        rightCards.set(r.id, card);
        rightDots.set(r.id, dot);
        card.addEventListener('click', () => {
          if (locked || suppressClick || selected === null) return;
          links.set(selected, r.id);
          selected = null;
          paint();
        });
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
        });
        rightCol.append(card);
      }
      board.append(leftCol, rightCol, svg);

      const btn = h('button', { class: 'btn', type: 'button', disabled: true, onclick: check }, 'Check');
      el.append(
        h('p', { class: 'muted', style: 'margin-bottom:14px' }, 'Drag from the dot on each left card to its match (or tap a card, then tap its match).'),
        board, h('div', { class: 'actions' }, btn));

      function center(dot) {
        const b = board.getBoundingClientRect();
        const r = dot.getBoundingClientRect();
        return { x: r.left + r.width / 2 - b.left, y: r.top + r.height / 2 - b.top };
      }

      function mkLine(a, b, cls) {
        const hit = document.createElementNS(SVG, 'line');
        const len = Math.hypot(b.x - a.x, b.y - a.y);
        const k = len > 40 ? 14 / len : 0; // keep the hit area off the dots
        const ha = { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
        const hb = { x: b.x - (b.x - a.x) * k, y: b.y - (b.y - a.y) * k };
        const line = document.createElementNS(SVG, 'line');
        for (const [ln, c, p, q] of [[hit, 'hit', ha, hb], [line, 'ln ' + (cls || ''), a, b]]) {
          ln.setAttribute('x1', p.x); ln.setAttribute('y1', p.y); ln.setAttribute('x2', q.x); ln.setAttribute('y2', q.y);
          ln.setAttribute('class', c);
        }
        return [hit, line];
      }

      function paint() {
        svg.replaceChildren();
        for (const [lid, rid] of links) {
          const cls = verdict ? (verdict.get(lid) ? 'ok' : 'bad') : '';
          const [hit, line] = mkLine(center(leftDots.get(lid)), center(rightDots.get(rid)), cls);
          if (!locked) hit.addEventListener('click', () => { links.delete(lid); paint(); });
          svg.append(hit, line);
        }
        if (drag) svg.append(...mkLine(drag.from, drag.to, 'live').slice(1));
        const textOf = (list, id) => (list.find((x) => x.id === id) || {}).text || '';
        for (const [id, card] of leftCards) {
          card.classList.toggle('linked', links.has(id));
          card.classList.toggle('picked', selected === id);
          card.setAttribute('aria-pressed', String(selected === id));
          const to = links.get(id);
          card.setAttribute('aria-label', textOf(q.left, id) + (to !== undefined ? ' — linked to ' + textOf(q.right, to) : ' — not linked'));
        }
        for (const [id, card] of rightCards) {
          const from = [...links].filter(([, r]) => r === id).map(([l]) => textOf(q.left, l));
          card.classList.toggle('linked', from.length > 0);
          card.setAttribute('aria-label', textOf(q.right, id) + (from.length ? ' — linked to ' + from.join(', ') : ''));
        }
        btn.disabled = locked || links.size < q.left.length;
      }

      function startDrag(e, leftId, dot) {
        if (locked) return;
        e.preventDefault();
        try { dot.setPointerCapture(e.pointerId); } catch (err) { /* synthetic or unsupported pointer: events still reach the dot */ }
        drag = { leftId, from: center(dot), to: center(dot), moved: false };
        const move = (ev) => {
          const b = board.getBoundingClientRect();
          drag.to = { x: ev.clientX - b.left, y: ev.clientY - b.top };
          drag.moved = true;
          paint();
        };
        const up = (ev) => {
          dot.removeEventListener('pointermove', move);
          dot.removeEventListener('pointerup', up);
          dot.removeEventListener('pointercancel', up);
          const moved = drag.moved;
          const target = document.elementFromPoint(ev.clientX, ev.clientY);
          const card = target && target.closest ? target.closest('.mcard.right') : null;
          if (card && moved) links.set(drag.leftId, card.getAttribute('data-right'));
          drag = null;
          if (moved) { suppressClick = true; setTimeout(() => { suppressClick = false; }, 0); }
          paint();
        };
        dot.addEventListener('pointermove', move);
        dot.addEventListener('pointerup', up);
        dot.addEventListener('pointercancel', up);
      }

      function check() {
        if (locked || links.size < q.left.length) return;
        locked = true;
        verdict = new Map();
        for (const l of q.left) verdict.set(l.id, links.get(l.id) === q.pairs[l.id]);
        for (const [id, card] of leftCards) card.classList.add(verdict.get(id) ? 'is-ok' : 'is-bad');
        paint();
        onAnswer([...verdict.values()].every(Boolean));
      }

      let ro = null;
      function onResize() {
        if (!board.isConnected) { cleanup(); return; }
        paint();
      }
      function cleanup() {
        root.removeEventListener('resize', onResize);
        if (ro) ro.disconnect();
      }
      if (typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(onResize); ro.observe(board); }
      root.addEventListener('resize', onResize);
      paint();
    },
  };
})(globalThis);
