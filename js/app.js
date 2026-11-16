(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  const { h, clear } = FCE.dom;
  FCE.progress = FCE.store.create();

  const state = { name: 'home', params: {} };
  let screenEl;
  let backBtn;

  // Screens keep their params in memory; the hash only carries the screen name.
  function go(name, params) {
    state.name = name;
    state.params = params || {};
    if (location.hash !== '#/' + name) location.hash = '#/' + name;
    else render();
  }

  // Same as go() but replaces the history entry (used for 'no params' fallbacks so Back is not trapped).
  function replace(name) {
    state.name = name;
    state.params = {};
    location.replace('#/' + name);
    if (location.hash === '#/' + name) render();
  }

  function render() {
    const wanted = location.hash.replace(/^#\//, '') || 'home';
    if (wanted !== state.name) {
      state.name = wanted;
      state.params = {}; // back/forward or manual hash: no params available
    }
    const screen = FCE.screens[state.name] ? state.name : 'home';
    backBtn.style.visibility = screen === 'home' ? 'hidden' : 'visible';
    screenEl.className = 'screen';
    clear(screenEl);
    root.scrollTo(0, 0);
    try {
      FCE.screens[screen](screenEl, state.params);
    } catch (err) {
      console.error(err);
      screenEl.append(h('p', { class: 'muted' }, 'This screen could not be shown.'));
    }
  }

  // The coloured blocks are sized once from the screen, not from the window: scrolling, the mobile
  // address bar or resizing the window never moves or rescales them. Only a rotation re-measures.
  function pinBackground() {
    let bw = 0;
    let bh = 0;
    const set = () => {
      const s = root.screen || {};
      const long = Math.max(s.width || 0, s.height || 0);
      const short = Math.min(s.width || 0, s.height || 0);
      const portrait = root.innerHeight > root.innerWidth;
      const rs = document.documentElement.style;
      // never smaller than the window itself (e.g. browser zoomed out)
      bw = Math.max(portrait ? short : long, root.innerWidth);
      bh = Math.max(portrait ? long : short, root.innerHeight);
      rs.setProperty('--bw', bw + 'px');
      rs.setProperty('--bh', bh + 'px');
    };
    set();
    let wasPortrait = root.innerHeight > root.innerWidth;
    root.addEventListener('resize', () => {
      const p = root.innerHeight > root.innerWidth;
      // Re-measure only on rotation, or if the window grows past the layer (it never shrinks the blocks).
      if (p !== wasPortrait || root.innerWidth > bw || root.innerHeight > bh) { wasPortrait = p; set(); }
    });
  }

  function start() {
    const app = document.getElementById('app');
    const themeBtn = h('button', { class: 'theme-toggle', type: 'button', onclick: toggleTheme });
    const SUN = '<svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/></svg>';
    const MOON = '<svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a6.7 6.7 0 0 0 10.7 10.7z"/></svg>';
    function paintTheme() {
      const light = document.documentElement.getAttribute('data-theme') === 'light';
      // Show the icon of the mode you will switch to.
      themeBtn.innerHTML = light ? MOON : SUN;
      const label = light ? 'Switch to dark mode' : 'Switch to light mode';
      themeBtn.setAttribute('aria-label', label);
      themeBtn.setAttribute('title', label);
    }
    function toggleTheme() {
      const light = document.documentElement.getAttribute('data-theme') === 'light';
      if (light) document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', 'light');
      try { localStorage.setItem('fce.theme', light ? 'dark' : 'light'); } catch (e) { /* storage unavailable: the choice only lasts this visit */ }
      paintTheme();
    }
    paintTheme();
    const soundBtn = h('button', { class: 'theme-toggle sound-toggle', type: 'button', onclick: () => { FCE.sound.setEnabled(!FCE.sound.enabled()); paintSound(); if (FCE.sound.enabled()) FCE.sound.play('right'); } });
    const ON = '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>';
    const OFF = '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>';
    function paintSound() {
      const on = FCE.sound.enabled();
      soundBtn.innerHTML = on ? ON : OFF;
      const label = on ? 'Turn sounds off' : 'Turn sounds on';
      soundBtn.setAttribute('aria-label', label);
      soundBtn.setAttribute('title', label);
      soundBtn.setAttribute('aria-pressed', String(on));
    }
    paintSound();
    backBtn = h('button', { class: 'linklike', type: 'button', onclick: () => go('home') }, '‹ Home');
    const bar = h('header', { class: 'bar glass' },
      h('div', { class: 'bar-inner' }, backBtn, h('span', { class: 'bar-title' }, h('span', { class: 'bar-name' }, 'FCE Practice'), h('span', { class: 'bar-by' }, 'by DSA')), h('span', { class: 'bar-tools' }, soundBtn, themeBtn)));
    screenEl = h('main', { class: 'screen', id: 'screen' });
    const foot = h('footer', { class: 'foot' },
      h('div', { class: 'foot-inner glass' },
        h('p', { class: 'foot-note' }, 'Independent, non-profit study resource based on personal class notes. Not affiliated with or endorsed by Cambridge University Press & Assessment.'),
        h('p', { class: 'foot-by' }, 'by DSA')));
    app.append(bar, screenEl, foot);
    pinBackground();
    root.addEventListener('hashchange', render);
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js').catch(() => { /* no offline mode; the web still works */ });
    }
    render();
  }

  FCE.app = { go, replace, start };
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
  }
})(globalThis);
