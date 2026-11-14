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

  function render() {
    const wanted = location.hash.replace(/^#\//, '') || 'home';
    if (wanted !== state.name) {
      state.name = wanted;
      state.params = {}; // back/forward or manual hash: no params available
    }
    const screen = FCE.screens[state.name] ? state.name : 'home';
    backBtn.style.visibility = screen === 'home' ? 'hidden' : 'visible';
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
    backBtn = h('button', { class: 'linklike', type: 'button', onclick: () => go('home') }, '‹ Inicio');
    const bar = h('header', { class: 'bar glass' },
      h('div', { class: 'bar-inner' }, backBtn, h('span', { class: 'bar-title' }, 'FCE Practice'), h('span', { class: 'spacer' })));
    screenEl = h('main', { class: 'screen', id: 'screen' });
    app.append(bar, screenEl);
    root.addEventListener('hashchange', render);
    render();
  }

  FCE.app = { go, start };
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
  }
})(globalThis);
