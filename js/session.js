(function (root) {
  const FCE = (root.FCE = root.FCE || {});

  function create(questions, snap, opts) {
    const retries = !(opts && opts.retries === false);
    const queue = snap ? snap.queue.map((x) => ({ q: x.q, retry: !!x.retry })) : questions.map((q) => ({ q, retry: false }));
    let pos = snap ? snap.pos : 0;
    let originalCorrect = snap ? snap.originalCorrect : 0;
    const wrong = snap ? snap.wrong.slice() : [];
    const log = snap ? snap.log.map((x) => ({ q: x.q, ok: !!x.ok })) : []; // first attempt of every question, for the results review

    function current() {
      return pos < queue.length ? queue[pos].q : null;
    }

    function submit(ok) {
      if (pos >= queue.length) return;
      const entry = queue[pos];
      if (!entry.retry) {
        log.push({ q: entry.q, ok });
        if (ok) originalCorrect++;
        else {
          for (const id of entry.q.itemIds) if (!wrong.includes(id)) wrong.push(id);
          if (retries) queue.push({ q: entry.q, retry: true }); // one retry only (not in exams)
        }
      }
      pos++;
    }

    return {
      current,
      index: () => pos,
      total: () => queue.length,
      submit,
      done: () => pos >= queue.length,
      log: () => log.slice(),
      // Plain data (JSON-safe) to resume this session later.
      snapshot: () => ({ questions, queue: queue.map((x) => ({ q: x.q, retry: x.retry })), pos, originalCorrect, wrong: wrong.slice(), log: log.map((x) => ({ q: x.q, ok: x.ok })) }),
      summary: () => ({ total: questions.length, correct: originalCorrect, wrongItemIds: wrong.slice() }),
    };
  }

  FCE.session = { create, restore: (snap) => create(snap.questions, snap) };
})(globalThis);
