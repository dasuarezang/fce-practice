(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  const { h } = FCE.dom;

  const chip = (text, cls) => h('span', { class: 'hv-chip' + (cls ? ' ' + cls : '') }, text);

  // ---------------------------------------------------------------- Install guide (the most detailed part)
  // Phone sketch: a screen with the one control the step is about highlighted in the guide's colour.
  const PHONE = {
    page: '<svg viewBox="0 0 120 200" aria-hidden="true"><rect x="6" y="4" width="108" height="192" rx="18" class="ph-body"/><rect x="14" y="30" width="92" height="150" rx="6" class="ph-screen"/><rect x="14" y="14" width="76" height="12" rx="6" class="ph-hot"/><rect x="22" y="18" width="44" height="4" rx="2" class="ph-on"/><rect x="24" y="48" width="72" height="22" rx="6" class="ph-line"/><rect x="24" y="80" width="72" height="8" rx="4" class="ph-line"/><rect x="24" y="96" width="52" height="8" rx="4" class="ph-line"/></svg>',
    menu: '<svg viewBox="0 0 120 200" aria-hidden="true"><rect x="6" y="4" width="108" height="192" rx="18" class="ph-body"/><rect x="14" y="30" width="92" height="150" rx="6" class="ph-screen"/><rect x="14" y="14" width="76" height="12" rx="6" class="ph-line"/><circle cx="99" cy="20" r="9" class="ph-hot"/><circle cx="99" cy="15.5" r="1.6" class="ph-dot"/><circle cx="99" cy="20" r="1.6" class="ph-dot"/><circle cx="99" cy="24.5" r="1.6" class="ph-dot"/><rect x="24" y="48" width="72" height="8" rx="4" class="ph-line"/><rect x="24" y="66" width="52" height="8" rx="4" class="ph-line"/></svg>',
    install: '<svg viewBox="0 0 120 200" aria-hidden="true"><rect x="6" y="4" width="108" height="192" rx="18" class="ph-body"/><rect x="14" y="30" width="92" height="150" rx="6" class="ph-screen"/><rect x="40" y="36" width="64" height="104" rx="8" class="ph-sheet"/><rect x="48" y="46" width="44" height="7" rx="3.5" class="ph-line"/><rect x="48" y="62" width="36" height="7" rx="3.5" class="ph-line"/><rect x="44" y="80" width="56" height="16" rx="6" class="ph-hot"/><rect x="52" y="85" width="40" height="6" rx="3" class="ph-on"/><rect x="48" y="106" width="40" height="7" rx="3.5" class="ph-line"/><rect x="48" y="122" width="34" height="7" rx="3.5" class="ph-line"/></svg>',
    confirm: '<svg viewBox="0 0 120 200" aria-hidden="true"><rect x="6" y="4" width="108" height="192" rx="18" class="ph-body"/><rect x="14" y="30" width="92" height="150" rx="6" class="ph-screen"/><rect x="22" y="70" width="76" height="62" rx="10" class="ph-sheet"/><rect x="32" y="80" width="26" height="26" rx="6" class="ph-icon"/><rect x="64" y="84" width="26" height="6" rx="3" class="ph-line"/><rect x="64" y="96" width="18" height="6" rx="3" class="ph-line"/><rect x="62" y="112" width="28" height="14" rx="6" class="ph-hot"/></svg>',
    home: '<svg viewBox="0 0 120 200" aria-hidden="true"><rect x="6" y="4" width="108" height="192" rx="18" class="ph-body"/><rect x="14" y="30" width="92" height="150" rx="6" class="ph-screen"/><rect x="24" y="44" width="20" height="20" rx="5" class="ph-line"/><rect x="50" y="44" width="20" height="20" rx="5" class="ph-line"/><rect x="76" y="44" width="20" height="20" rx="5" class="ph-line"/><rect x="24" y="78" width="20" height="20" rx="5" class="ph-line"/><rect x="50" y="78" width="20" height="20" rx="5" class="ph-hot"/><text x="60" y="93" text-anchor="middle" class="ph-letter">FCE</text><rect x="76" y="78" width="20" height="20" rx="5" class="ph-line"/></svg>',
    share: '<svg viewBox="0 0 120 200" aria-hidden="true"><rect x="6" y="4" width="108" height="192" rx="18" class="ph-body"/><rect x="14" y="30" width="92" height="150" rx="6" class="ph-screen"/><rect x="24" y="48" width="72" height="8" rx="4" class="ph-line"/><rect x="24" y="66" width="52" height="8" rx="4" class="ph-line"/><rect x="14" y="156" width="92" height="24" rx="4" class="ph-bar"/><path d="M60 172v-11M55.5 165.5 60 161l4.5 4.5M54 167v7h12v-7" class="ph-hotline"/></svg>',
    sheet: '<svg viewBox="0 0 120 200" aria-hidden="true"><rect x="6" y="4" width="108" height="192" rx="18" class="ph-body"/><rect x="14" y="30" width="92" height="150" rx="6" class="ph-screen"/><rect x="14" y="70" width="92" height="110" rx="10" class="ph-sheet"/><rect x="24" y="82" width="72" height="14" rx="6" class="ph-line"/><rect x="24" y="102" width="72" height="14" rx="6" class="ph-line"/><rect x="24" y="122" width="72" height="16" rx="6" class="ph-hot"/><rect x="34" y="127" width="52" height="6" rx="3" class="ph-on"/><rect x="24" y="144" width="72" height="14" rx="6" class="ph-line"/></svg>',
  };

  const GUIDES = [
    {
      key: 'android', label: 'Android', tone: 'tone-18', note: 'Chrome, Edge, Samsung Internet and Firefox all work. The steps below are for Chrome.',
      steps: [
        ['Open the web in Chrome', 'Go to the FCE Practice address. Wait for the home page to load; you need internet only this first time.', 'page'],
        ['Open the menu', 'Tap the three dots (⋮) at the top right of Chrome.', 'menu'],
        ['Tap “Install app”', 'If you do not see it, tap “Add to Home screen” and then “Install”. Both do the same thing.', 'install'],
        ['Confirm', 'Tap “Install” in the box that appears. It takes a second; no store and no account.', 'confirm'],
        ['Open it from your home screen', 'Look for the FCE icon among your apps (swipe up if it is not on the first screen). It opens full screen, like any other app.', 'home'],
      ],
      tips: ['Nothing to download from a store: it is the same web, saved on your phone.', 'After the first visit it also opens with no connection or data.', 'If “Install app” never shows up, make sure you are not in a private tab and that Chrome is up to date.'],
    },
    {
      key: 'iphone', label: 'iPhone / iPad', tone: 'tone-12', note: 'It has to be Safari. On iPhone, Add to Home Screen is also in the share menu of Chrome and Edge from iOS 16.4, but Safari is the safe choice.',
      steps: [
        ['Open the web in Safari', 'Go to the FCE Practice address in Safari. If a link opened inside another app (WhatsApp, Instagram…), copy it and paste it in Safari.', 'page'],
        ['Tap Share', 'The square with an arrow pointing up: at the bottom of the screen on iPhone, at the top right on iPad.', 'share'],
        ['Scroll down and tap “Add to Home Screen”', 'The list is long: swipe it up until you see the option with a “+” square. If it is not there, scroll to the very bottom and tap “Edit Actions”.', 'sheet'],
        ['Name it and tap “Add”', 'Leave “FCE Practice” (or shorten it) and tap “Add” at the top right. Keep “Open as Web App” on if you see it.', 'confirm'],
        ['Open it from your home screen', 'The FCE icon is now on your home screen, next to your apps. Open it from there, not from Safari, to get the full-screen version.', 'home'],
      ],
      tips: ['Safari does not show an “Install” banner: Add to Home Screen is the way to install it on iPhone.', 'After the first visit it also opens with no connection or data.', 'iOS can clear the stored data of a web you have not opened in weeks. Download a backup of your progress from “My progress” now and then.'],
    },
  ];

  function guideBlock() {
    const ua = (root.navigator && root.navigator.userAgent) || '';
    let current = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && root.navigator.maxTouchPoints > 1) ? 'iphone' : 'android';
    const wrap = h('section', { class: 'card install' });
    const body = h('div', { class: 'install-body' });
    const tabs = h('div', { class: 'seg', role: 'tablist', 'aria-label': 'Phone type' });

    function paint() {
      const g = GUIDES.find((x) => x.key === current);
      wrap.className = 'card install ' + g.tone;
      for (const b of tabs.children) {
        const on = b.dataset.key === current;
        b.setAttribute('aria-selected', String(on));
        b.tabIndex = on ? 0 : -1;
      }
      body.replaceChildren(
        h('p', { class: 'muted install-note' }, g.note),
        h('ol', { class: 'steps' }, g.steps.map(([title, text, art], i) =>
          h('li', { class: 'step' },
            h('span', { class: 'step-n', 'aria-hidden': 'true' }, String(i + 1)),
            h('div', { class: 'step-text' }, h('h3', null, title), h('p', { class: 'muted' }, text)),
            h('div', { class: 'step-art', html: PHONE[art] })))),
        h('div', { class: 'tips' }, h('h3', null, 'Good to know'), h('ul', null, g.tips.map((t) => h('li', { class: 'muted' }, t)))));
    }

    for (const g of GUIDES) {
      tabs.append(h('button', { type: 'button', role: 'tab', class: 'seg-btn ' + g.tone, 'data-key': g.key, onclick: () => { current = g.key; paint(); } }, g.label));
    }
    wrap.append(
      h('div', { class: 'install-head' },
        h('p', { class: 'kicker' }, 'Install it like an app'),
        h('h2', { class: 'title-m' }, 'Put FCE Practice on your phone'),
        h('p', { class: 'muted' }, 'Free, takes under a minute, and works offline afterwards.'),
        tabs),
      body);
    paint();
    return wrap;
  }

  // ---------------------------------------------------------------- Feature cards: a tone, an icon and a mini picture each
  const I = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const ICONS = {
    book: I('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M9 8h6"/>'),
    target: I('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>'),
    hand: I('<path d="M9 11V5a1.5 1.5 0 0 1 3 0v5M12 10V8a1.5 1.5 0 0 1 3 0v3M15 11V9.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-1a6 6 0 0 1-5-3l-2-3.5a1.5 1.5 0 0 1 2.4-1.7L9 15V11"/>'),
    clock: I('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/>'),
    cards: I('<rect x="3" y="6" width="14" height="14" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v12"/>'),
    flag: I('<path d="M5 21V4M5 4h12l-2 4 2 4H5"/>'),
    chart: I('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
    resume: I('<path d="M5 4v16l14-8z"/>'),
    sun: I('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    phone: I('<rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/>'),
  };

  const BLOCKS = [
    { icon: 'book', tone: 'tone-1', title: 'Theory', text: 'All your class notes on one page, unit by unit, in notebook order. Use the index on the left (or the buttons at the top on a phone) to jump to a section.',
      vis: () => h('div', { class: 'hv hv-lines' }, h('i'), h('i'), h('i'), h('i')) },
    { icon: 'target', tone: 'tone-19', title: 'Practice', text: 'Tick the subtopics, pick a type (Kahoot, Match, Gap-fill, Reorder, or Mixed) and how many questions. A wrong answer comes back once at the end. Before the first question about a structure in Comparison expressions you get a short explanation of it.',
      vis: () => h('div', { class: 'hv' }, chip('Kahoot', 'c1'), chip('Match', 'c2'), chip('Gap-fill', 'c3'), chip('Reorder', 'c4'), chip('Mixed')) },
    { icon: 'hand', tone: 'tone-13', title: 'How to answer', text: 'Kahoot: tap an option (or press 1–4). Gap-fill: type and press Enter or Check. Reorder: tap the words in order, or drag them. Match: drag from the dot on a left card to its match, or tap a card and then its match.',
      vis: () => h('div', { class: 'hv hv-answer' },
        h('div', { class: 'hv-opts' }, ['1', '2', '3', '4'].map((n, i) => h('span', { class: 'hv-opt c' + (i + 1) }, n))),
        h('div', { class: 'hv-sentence' }, 'She ', h('b', { class: 'hv-gap' }, 'is'), ' taller'),
        h('div', { class: 'hv-pair' }, h('span', { class: 'hv-pill' }, h('i', { class: 'hv-dot' })), h('span', { class: 'hv-link' }), h('span', { class: 'hv-pill' }, h('i', { class: 'hv-dot' })))) },
    { icon: 'clock', tone: 'tone-5', title: 'Exam', text: 'Choose “Exam” in the practice menu. It is timed: one countdown for the whole test, 40 seconds per question, shows no right or wrong until the end, and has no second chances. The pass mark is 60%. Time running out counts what is left as wrong.',
      vis: () => h('div', { class: 'hv hv-stats' }, h('span', { class: 'hv-stat' }, h('b', null, '40 s'), 'per question'), h('span', { class: 'hv-stat' }, h('b', null, '60%'), 'to pass'), h('span', { class: 'hv-stat' }, h('b', null, '0'), 'second chances')) },
    { icon: 'cards', tone: 'tone-23', title: 'Flashcards', text: 'Quick review of the vocabulary. Flip the card, then mark “Knew it” or “Not yet”. The ones you miss count as weak.',
      vis: () => h('div', { class: 'hv hv-flash' }, h('span', { class: 'hv-fc' }, 'tall'), h('span', { class: 'hv-arrow', 'aria-hidden': 'true' }, '→'), h('span', { class: 'hv-fc back' }, 'alto'), h('span', { class: 'hv-ok' }, 'Knew it'), h('span', { class: 'hv-no' }, 'Not yet')) },
    { icon: 'flag', tone: 'tone-10', title: 'Weak items', text: 'An item is weak when you have failed it and have not yet got it right twice in a row since. “Practise my weak items” on the home page builds a test from them, and it empties as you master them.',
      vis: () => h('div', { class: 'hv hv-weak' }, h('span', { class: 'hv-dotrow' }, h('i', { class: 'x' }), h('i', { class: 'y' }), h('i', { class: 'y' })), h('span', { class: 'hv-arrow', 'aria-hidden': 'true' }, '→'), h('span', { class: 'hv-dotrow' }, h('i', { class: 'y' }), h('i', { class: 'y' }), h('b', null, 'mastered'))) },
    { icon: 'chart', tone: 'tone-16', title: 'My progress', text: 'Shows how much you have mastered, overall and by subtopic. Your progress is saved only in this browser: to move it to another device (or keep a copy), download a backup or copy your code and import it there. Importing never removes progress you already have.',
      vis: () => h('div', { class: 'hv hv-bars' }, [82, 55, 30].map((w) => h('span', { class: 'hv-bar' }, h('i', { style: `width:${w}%` })))) },
    { icon: 'resume', tone: 'tone-7', title: 'Unfinished tests', text: 'If you leave or reload in the middle of a practice, the home page offers to resume it. Exams cannot be resumed.',
      vis: () => h('div', { class: 'hv hv-resume' }, h('span', null, 'Practice in progress · 7 of 12'), h('b', null, 'Resume')) },
    { icon: 'sun', tone: 'tone-14', title: 'Sound and theme', text: 'The speaker and sun/moon buttons in the top bar turn the sounds off and switch between dark and light.',
      vis: () => h('div', { class: 'hv hv-tools' }, h('span', { class: 'hv-tool' }, '♪'), h('span', { class: 'hv-tool' }, '☀'), h('span', { class: 'hv-tool' }, '☾')) },
    { icon: 'phone', tone: 'tone-21', title: 'Offline and updates', text: 'After one visit with internet the web opens without a connection. When you are online it always loads the latest version: if I update the web, the installed app updates itself the next time you open it with internet.',
      vis: () => h('div', { class: 'hv hv-sync' }, h('span', { class: 'hv-node' }, 'Web'), h('span', { class: 'hv-arrow', 'aria-hidden': 'true' }, '→'), h('span', { class: 'hv-node on' }, 'Your phone')) },
  ];

  FCE.screens.help = function (el) {
    el.classList.add('wide');
    el.append(
      h('h1', { class: 'title-l' }, 'How it works'),
      h('p', { class: 'muted', style: 'margin:6px 0 20px' }, 'First, how to install it on your phone. Then everything the web does, in a minute.'),
      guideBlock(),
      h('h2', { class: 'title-m help-sub' }, 'Everything the web does'));
    const grid = h('div', { class: 'help-grid' });
    for (const b of BLOCKS) {
      grid.append(h('section', { class: 'card help-card ' + b.tone },
        h('div', { class: 'help-top' }, h('span', { class: 'help-ico', html: ICONS[b.icon] }), h('h2', { class: 'help-title' }, b.title)),
        b.vis(),
        h('p', { class: 'muted help-text' }, b.text)));
    }
    el.append(grid);
  };
})(globalThis);
