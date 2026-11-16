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

    // Backup of the progress as plain data (a file or a copyable code) and its safe re-import.
    function exportData() {
      return { app: 'fce-practice', version: 1, exported: new Date().toISOString(), items: JSON.parse(JSON.stringify(load())) };
    }

    function clean(v) {
      const n = Number(v);
      return Number.isFinite(n) ? Math.max(0, Math.min(1e6, Math.floor(n))) : 0;
    }

    // Merge, never overwrite: for each item the record with more attempts wins (ties: more mistakes).
    // Returns the number of items taken from the backup, or -1 if the data is not a valid backup.
    function importData(data) {
      if (!data || typeof data !== 'object' || data.app !== 'fce-practice' || !data.items || typeof data.items !== 'object' || Array.isArray(data.items)) return -1;
      const items = load();
      let taken = 0;
      for (const id of Object.keys(data.items)) {
        const inc = data.items[id];
        if (id.length > 120 || !inc || typeof inc !== 'object') continue;
        const next = { seen: clean(inc.seen), wrong: clean(inc.wrong), run: clean(inc.run) };
        if (next.seen === 0 && next.wrong === 0) continue;
        const cur = items[id] && typeof items[id] === 'object' ? items[id] : { seen: 0, wrong: 0 };
        if (next.seen > (cur.seen | 0) || (next.seen === (cur.seen | 0) && next.wrong > (cur.wrong | 0))) {
          items[id] = next;
          taken++;
        }
      }
      save(items);
      return taken;
    }

    // Short text version of the backup, to send to yourself (WhatsApp, notes...).
    function toCode() {
      const compact = { a: 'fce-practice', v: 1, i: {} };
      const items = load();
      for (const id of Object.keys(items)) compact.i[id] = [items[id].seen | 0, items[id].wrong | 0, items[id].run | 0];
      return 'FCE1:' + btoa(JSON.stringify(compact));
    }
    function fromCode(text) {
      try {
        const m = /FCE1:([A-Za-z0-9+/=]+)/.exec(String(text).replace(/\s+/g, ''));
        if (!m) return null;
        const c = JSON.parse(atob(m[1]));
        if (!c || c.a !== 'fce-practice' || !c.i || typeof c.i !== 'object') return null;
        const items = {};
        for (const id of Object.keys(c.i)) if (Array.isArray(c.i[id])) items[id] = { seen: c.i[id][0], wrong: c.i[id][1], run: c.i[id][2] };
        return { app: 'fce-practice', version: 1, items };
      } catch (e) { return null; }
    }

    function reset() {
      save({});
    }

    return { record, stats, failedIds, weakIds, exportData, importData, toCode, fromCode, reset };
  }

  FCE.store = { create };
})(globalThis);
