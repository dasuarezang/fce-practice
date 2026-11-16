(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  const KEY = 'fce.sound';
  let ctx = null;

  // Soft sine "bells" made with the Web Audio API: no files, quiet, short.
  const CUES = {
    right: [[659.25, 0, 0.16], [880, 0.1, 0.24]], // E5 -> A5
    wrong: [[261.63, 0, 0.2], [220, 0.13, 0.3]], // C4 -> A3
    pass: [[523.25, 0, 0.2], [659.25, 0.13, 0.2], [783.99, 0.26, 0.42]], // C-E-G
    fail: [[392, 0, 0.24], [329.63, 0.17, 0.24], [261.63, 0.34, 0.42]], // G-E-C
  };

  function enabled() {
    try { return localStorage.getItem(KEY) !== 'off'; } catch (e) { return true; }
  }
  function setEnabled(on) {
    try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) { /* choice lasts this visit only */ }
  }

  function play(name) {
    const Ctx = root.AudioContext || root.webkitAudioContext;
    if (!Ctx || !enabled() || !CUES[name]) return;
    try {
      ctx = ctx || new Ctx();
      if (ctx.state === 'suspended') ctx.resume();
      const t0 = ctx.currentTime + 0.02;
      for (const [freq, at, len] of CUES[name]) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, t0 + at);
        gain.gain.exponentialRampToValueAtTime(0.07, t0 + at + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + at + len + 0.18);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t0 + at);
        osc.stop(t0 + at + len + 0.22);
      }
    } catch (e) { /* audio unavailable: stay silent */ }
  }

  FCE.sound = { play, enabled, setEnabled };
})(globalThis);
