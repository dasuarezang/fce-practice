(function (root) {
  const FCE = (root.FCE = root.FCE || {});

  function create(questions) {
    const queue = questions.map((q) => ({ q, retry: false }));
    let pos = 0;
    let originalCorrect = 0;
    const wrong = [];
    const log = []; // first attempt of every question, in order, for the results review

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
          queue.push({ q: entry.q, retry: true }); // one retry only
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
      summary: () => ({ total: questions.length, correct: originalCorrect, wrongItemIds: wrong.slice() }),
    };
  }

  FCE.session = { create };
})(globalThis);
