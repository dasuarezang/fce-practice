(function (root) {
  const FCE = (root.FCE = root.FCE || {});

  function make(seed) {
    let s = (seed >>> 0) || 1;
    function next() {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    function shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }
    function pick(arr, n) {
      return shuffle(arr).slice(0, Math.max(0, n));
    }
    return { next, shuffle, pick };
  }

  FCE.rng = { make };
})(globalThis);
