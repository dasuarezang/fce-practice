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
    const themeBtn = h('button', { class: 'linklike theme-toggle', type: 'button', onclick: toggleTheme }, '');
    function paintTheme() {
      const light = document.documentElement.getAttribute('data-theme') === 'light';
      themeBtn.textContent = light ? 'Dark mode' : 'Light mode';
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
      h('div', { class: 'bar-inner' }, backBtn, h('span', { class: 'bar-title' }, 'FCE Practice'), themeBtn));
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
