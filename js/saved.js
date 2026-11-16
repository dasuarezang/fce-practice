(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  const KEY = 'fce.session.v1';
  const KINDS = ['kahoot', 'match', 'gapfill', 'reorder'];

  function store() {
    try { return root.localStorage || null; } catch (e) { return null; }
  }

  const isQ = (q) => q && typeof q === 'object' && KINDS.includes(q.kind) && Array.isArray(q.itemIds);

  // Only a well-formed, unfinished snapshot is accepted; anything else is treated as "nothing saved".
  function valid(s) {
    return !!s && Array.isArray(s.questions) && s.questions.length > 0 && s.questions.every(isQ)
      && Array.isArray(s.queue) && s.queue.every((x) => x && isQ(x.q))
      && Number.isInteger(s.pos) && s.pos >= 0 && s.pos < s.queue.length
      && Number.isInteger(s.originalCorrect) && Array.isArray(s.wrong)
      && Array.isArray(s.log) && s.log.every((x) => x && isQ(x.q));
  }

  function save(snap) {
    const st = store();
    if (!st) return;
    try { st.setItem(KEY, JSON.stringify(snap)); } catch (e) { /* storage full or blocked: no resume */ }
  }
  function load() {
    const st = store();
    if (!st) return null;
    try {
      const s = JSON.parse(st.getItem(KEY));
      return valid(s) ? s : null;
    } catch (e) { return null; }
  }
  function clear() {
    const st = store();
    if (!st) return;
    try { st.removeItem(KEY); } catch (e) { /* nothing to do */ }
  }

  FCE.saved = { save, load, clear, valid };
})(globalThis);
