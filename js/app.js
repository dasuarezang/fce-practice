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
      screenEl.append(h('p', { class: 'muted' }, 'No se pudo mostrar esta pantalla.'));
    }
  }

  function start() {
    const app = document.getElementById('app');
    const themeBtn = h('button', { class: 'theme-toggle', type: 'button', onclick: toggleTheme });
    const SUN = '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/></svg>';
    const MOON = '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a6.7 6.7 0 0 0 10.7 10.7z"/></svg>';
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
    backBtn = h('button', { class: 'linklike', type: 'button', onclick: () => go('home') }, '‹ Home');
    const bar = h('header', { class: 'bar glass' },
      h('div', { class: 'bar-inner' }, backBtn, h('span', { class: 'bar-title' }, h('span', { class: 'bar-name' }, 'FCE Practice'), h('span', { class: 'bar-by' }, 'by DSA')), themeBtn));
    screenEl = h('main', { class: 'screen', id: 'screen' });
    app.append(bar, screenEl);
    root.addEventListener('hashchange', render);
    render();
  }

  FCE.app = { go, replace, start };
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
  }
})(globalThis);
