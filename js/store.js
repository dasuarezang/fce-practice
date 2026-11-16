(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  const KEY = 'fce.progress.v1';
  const WEAK_RUN = 2;

  function defaultStorage() {
    try {
      return root.localStorage || null;
    } catch (e) {
      return null;
    }
  }

  function create(storage) {
    const st = storage === undefined ? defaultStorage() : storage;
    let memory = {}; // fallback when storage is missing or failing

    function load() {
      if (!st) return memory;
      try {
        const raw = st.getItem(KEY);
        if (raw === null || raw === undefined) return memory;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.items && typeof parsed.items === 'object' && !Array.isArray(parsed.items)) {
          return parsed.items;
        }
        return {};
      } catch (e) {
        return memory;
      }
    }

    function save(items) {
      memory = items;
      if (!st) return;
      try {
        st.setItem(KEY, JSON.stringify({ items }));
      } catch (e) {
        /* storage full or blocked: keep in memory only */
      }
    }

    function record(itemIds, ok) {
      const items = load();
      for (const id of itemIds) {
        const cur = items[id] && typeof items[id] === 'object' ? items[id] : { seen: 0, wrong: 0 };
        // run = right answers in a row since the last mistake (drives "weak items")
        items[id] = { seen: (cur.seen | 0) + 1, wrong: (cur.wrong | 0) + (ok ? 0 : 1), run: ok ? (cur.run | 0) + 1 : 0 };
      }
      save(items);
    }

    function stats(itemId) {
      const cur = load()[itemId];
      return cur && typeof cur === 'object' ? { seen: cur.seen | 0, wrong: cur.wrong | 0 } : { seen: 0, wrong: 0 };
    }

    function failedIds() {
      const items = load();
      return Object.keys(items).filter((id) => items[id] && items[id].wrong > 0);
    }

    // Weak = failed at some point and not yet answered right twice in a row since.
    function weakIds() {
      const items = load();
      return Object.keys(items).filter((id) => items[id] && items[id].wrong > 0 && (items[id].run | 0) < WEAK_RUN);
    }

    function reset() {
      save({});
    }

    return { record, stats, failedIds, weakIds, reset };
  }

  FCE.store = { create };
})(globalThis);
