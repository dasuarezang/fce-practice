(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  const { h } = FCE.dom;

  // Practice flow: one question at a time, glass feedback sheet after each answer.
  FCE.screens.practice = function (el, params) {
    const resume = params && params.resume;
    const questions = resume ? resume.questions : (params && params.questions) || [];
    if (!questions.length) {
      FCE.app.replace('selector');
      return;
    }
    el.classList.add('has-dock');
    const exam = !!(params && params.exam && !resume);
    const SECONDS_PER_QUESTION = 40;
    const session = resume ? FCE.session.restore(resume) : FCE.session.create(questions, null, { retries: !exam });
    const bar = h('i', { style: 'width:0%' });
    const counter = h('span', { class: 'muted' });
    const timerEl = h('span', { class: 'timer', hidden: !exam });
    const stage = h('div', { class: 'stage' });
    const sheetHost = h('div');
    el.append(
      h('div', { class: 'stack', style: 'gap:10px;margin-bottom:22px' },
        h('div', { class: 'row', style: 'justify-content:space-between' }, h('span', { class: 'eyebrow' }, exam ? 'Exam' : 'Practice'), h('span', { class: 'row', style: 'gap:14px' }, timerEl, counter)),
        h('div', { class: 'progress' }, bar)),
      stage, sheetHost);

    const taught = new Set();

    // Exam: one countdown for the whole test; when it ends, what is left counts as wrong.
    let timer = null;
    function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
    function finishExam() {
      stopTimer();
      while (!session.done()) session.submit(false);
      show();
    }
    if (exam) {
      let left = questions.length * SECONDS_PER_QUESTION;
      const paint = () => {
        const m = Math.floor(left / 60);
        const s = String(left % 60).padStart(2, '0');
        timerEl.textContent = `${m}:${s}`;
        timerEl.classList.toggle('low', left <= 30);
      };
      paint();
      timer = setInterval(() => {
        if (!el.isConnected) { stopTimer(); return; }
        left--;
        paint();
        if (left <= 0) finishExam();
      }, 1000);
    }

    // A structure is explained once, before the first question that uses it.
    function teach(entries, then) {
      stage.replaceChildren(
        h('div', { class: 'card solid teach' },
          h('span', { class: 'eyebrow' }, entries.length > 1 ? 'Before you answer · structures' : 'Before you answer · structure'),
          entries.map(({ item }) =>
            h('article', { class: 't-expr' },
              h('p', { class: 't-purpose' }, item.proposito),
              h('p', { class: 't-formula' }, h('mark', null, item.formula)),
              h('p', { class: 't-example' }, item.ejemplo.split(' / ').join('\n')))),
          h('div', { class: 'actions' }, h('button', { class: 'btn', type: 'button', onclick: then }, 'Got it'))));
      root.scrollTo(0, 0);
    }

    function show() {
      sheetHost.replaceChildren();
      const q = session.current();
      if (!q) {
        stopTimer();
        if (!exam) FCE.saved.clear();
        FCE.app.go('results', { summary: session.summary(), log: session.log(), questions, exam });
        return;
      }
      const fresh = exam ? [] : FCE.practice.teachEntries(q).filter((e) => !taught.has(e.item.id));
      if (fresh.length) {
        fresh.forEach((e) => taught.add(e.item.id));
        counter.textContent = `${session.index() + 1} / ${session.total()}`;
        teach(fresh, ask);
        return;
      }
      ask();
    }

    function ask() {
      sheetHost.replaceChildren();
      const q = session.current();
      const pct = Math.round((Math.min(session.index(), questions.length) / questions.length) * 100);
      bar.style.width = pct + '%';
      counter.textContent = `${session.index() + 1} / ${session.total()}`;
      stage.replaceChildren();
      const ui = FCE.ui[q.kind];
      if (!ui) {
        stage.append(h('p', { class: 'muted' }, 'This exercise type is not available.'));
        return;
      }
      let answered = false;
      ui.render(stage, q, (ok) => {
        if (answered) return;
        answered = true;
        FCE.progress.record(q.itemIds, ok);
        if (exam) {
          // No verdict until the end: record the answer and move on.
          session.submit(ok);
          if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
          setTimeout(() => { if (el.isConnected) show(); }, 180);
          return;
        }
        if (FCE.sound) FCE.sound.play(ok ? 'right' : 'wrong');
        session.submit(ok);
        if (session.done()) FCE.saved.clear();
        else FCE.saved.save(session.snapshot());
        const last = session.done();
        // Close the on-screen keyboard so the verdict is visible, and ignore the Enter that submitted
        // the answer if it arrives again on the Next button.
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
        const shownAt = Date.now();
        const next = h('button', { class: 'btn', type: 'button', onclick: () => { if (Date.now() - shownAt > 400) show(); } }, last ? 'See results' : 'Next');
        sheetHost.replaceChildren(
          h('div', { class: 'sheet glass ' + (ok ? 'ok' : 'bad'), role: 'status' },
            h('span', { class: 'sheet-icon', 'aria-hidden': 'true' }, ok ? '✓' : '✕'),
            h('div', { class: 'sheet-body' }, h('h4', null, ok ? 'Correct' : 'Not quite'), h('p', { class: 'explain' }, q.explain || '')),
            next));
        if (!(root.matchMedia && root.matchMedia('(pointer: coarse)').matches)) next.focus();
      });
    }
    show();
  };
})(globalThis);
