(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  const { h } = FCE.dom;

  // My progress: mastery per subtopic, and the backup tools (file, code, reset).
  FCE.screens.progress = function (el) {
    el.classList.add('wide');
    const weak = new Set(FCE.progress.weakIds());
    const stat = (items) => {
      let mastered = 0;
      let weakN = 0;
      let started = 0;
      for (const i of items) {
        const s = FCE.progress.stats(i.id);
        if (s.seen > 0) started++;
        if (weak.has(i.id)) weakN++;
        else if (s.seen > 0) mastered++;
      }
      return { total: items.length, mastered, weak: weakN, started };
    };

    const all = FCE.temas.flatMap((t) => t.secciones.flatMap((s) => s.items));
    const g = stat(all);
    const gp = g.total ? Math.round((g.mastered / g.total) * 100) : 0;

    el.append(
      h('h1', { class: 'title-l' }, 'My progress'),
      h('p', { class: 'muted', style: 'margin:6px 0 20px' }, 'An item counts as mastered once you have practised it and are not still getting it wrong.'));

    const sections = FCE.temas.flatMap((t) => t.secciones.map((s) => ({ t, s, c: stat(s.items) })));
    // Suggest the subtopic with the lowest mastery.
    const next = sections.slice().sort((a, b) => a.c.mastered / a.c.total - b.c.mastered / b.c.total)[0];

    el.append(h('section', { class: 'card stack prog-over' },
      h('div', { class: 'row', style: 'justify-content:space-between;align-items:baseline' },
        h('span', { class: 'eyebrow' }, 'Overall'), h('span', { class: 'muted' }, `${g.mastered} of ${g.total} items mastered`)),
      h('div', { class: 'big-count' }, gp + '%'),
      h('div', { class: 'progress' }, h('i', { style: `width:${gp}%` })),
      h('div', { class: 'res-tally' },
        h('span', { class: 'tally ok' }, `${g.mastered} mastered`),
        h('span', { class: 'tally bad' }, `${g.weak} weak`),
        h('span', { class: 'tally' }, `${g.total - g.started} not started`)),
      next && next.c.mastered < next.c.total
        ? h('p', { class: 'muted' }, 'Start with: ', h('strong', null, next.s.titulo), ` (${next.t.titulo})`)
        : null));

    for (const tema of FCE.temas) {
      const card = h('section', { class: 'card stack', style: 'margin-top:16px' }, h('h2', { class: 'title-l' }, tema.titulo));
      for (const s of tema.secciones) {
        const c = stat(s.items);
        const p = c.total ? Math.round((c.mastered / c.total) * 100) : 0;
        card.append(h('div', { class: 'prog-row', 'data-section': s.id },
          h('div', { class: 'stack', style: 'gap:6px;flex:1;min-width:0' },
            h('div', { class: 'row', style: 'justify-content:space-between;gap:8px' },
              h('strong', null, s.titulo), h('span', { class: 'muted small' }, `${p}% · ${c.mastered}/${c.total}${c.weak ? ` · ${c.weak} weak` : ''}`)),
            h('div', { class: 'progress' }, h('i', { style: `width:${p}%` }))),
          h('button', { class: 'btn quiet', type: 'button', onclick: () => FCE.app.go('selector', { sectionIds: [s.id] }) }, 'Practise')));
      }
      el.append(card);
    }

    // ---- Backup ----
    const status = h('p', { class: 'muted', role: 'status', 'aria-live': 'polite' });
    const say = (msg) => { status.textContent = msg; };
    const codeBox = h('textarea', { class: 'code-box', rows: 3, placeholder: 'Paste a progress code here', spellcheck: 'false', 'aria-label': 'Progress code' });
    const fileInput = h('input', { type: 'file', accept: 'application/json,.json', style: 'display:none', onchange: onFile });

    function report(n) {
      if (n < 0) { say('That is not a valid FCE Practice backup. Nothing was changed.'); return; }
      if (n === 0) { say('Imported: nothing new (this device already has equal or more progress).'); return; }
      FCE.app.go('progress');
      setTimeout(() => {
        const s = document.querySelector('[role="status"]');
        if (s) s.textContent = `Imported: ${n} ${n === 1 ? 'item' : 'items'} updated.`;
      }, 0);
    }
    function onFile() {
      const f = fileInput.files && fileInput.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        let data = null;
        try { data = JSON.parse(String(r.result)); } catch (e) { /* invalid JSON */ }
        report(FCE.progress.importData(data));
      };
      r.onerror = () => say('The file could not be read.');
      r.readAsText(f);
    }
    function download() {
      const blob = new Blob([JSON.stringify(FCE.progress.exportData(), null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = h('a', { href: url, download: 'fce-practice-progress.json' });
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      say('Backup file downloaded.');
    }
    async function copyCode() {
      const code = FCE.progress.toCode();
      codeBox.value = code;
      try { await navigator.clipboard.writeText(code); say('Code copied. Paste it on the other device.'); }
      catch (e) { codeBox.select(); say('Copy the code from the box.'); }
    }
    function importCode() {
      const data = FCE.progress.fromCode(codeBox.value);
      report(data ? FCE.progress.importData(data) : -1);
    }
    function reset() {
      if (!root.confirm('Reset all your progress on this device? Download a backup first if you want to keep it.')) return;
      FCE.progress.reset();
      FCE.saved.clear();
      FCE.app.go('progress');
    }

    el.append(h('section', { class: 'card stack', style: 'margin-top:16px' },
      h('h2', { class: 'title-l' }, 'Backup and other devices'),
      h('p', { class: 'muted' }, 'Your progress lives only in this browser. Move it to your phone (or keep a copy) with a file or a short code. Importing merges: it never removes progress you already have here.'),
      h('div', { class: 'row' },
        h('button', { class: 'btn', type: 'button', onclick: download }, 'Download backup'),
        h('button', { class: 'btn secondary', type: 'button', onclick: () => fileInput.click() }, 'Import file'),
        fileInput),
      h('div', { class: 'stack', style: 'gap:10px' },
        h('span', { class: 'eyebrow' }, 'Or use a code'),
        codeBox,
        h('div', { class: 'row' },
          h('button', { class: 'btn secondary', type: 'button', onclick: copyCode }, 'Copy my code'),
          h('button', { class: 'btn secondary', type: 'button', onclick: importCode }, 'Import code'))),
      status,
      h('div', { class: 'row', style: 'border-top:1px solid var(--line);padding-top:14px' },
        h('button', { class: 'btn quiet', type: 'button', onclick: reset }, 'Reset progress'))));
  };
})(globalThis);
