(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  const { h } = FCE.dom;

  // How it works: short blocks, with the rules that are not obvious spelled out.
  const BLOCKS = [
    ['Theory', 'All your class notes on one page, unit by unit, in notebook order. Use the index on the left (or the buttons at the top on a phone) to jump to a section.'],
    ['Practice', 'Tick the subtopics, pick a type (Kahoot, Match, Gap-fill, Reorder, or Mixed) and how many questions. A wrong answer comes back once at the end. Before the first question about a structure in Comparison expressions you get a short explanation of it.'],
    ['How to answer', 'Kahoot: tap an option (or press 1–4). Gap-fill: type and press Enter or Check. Reorder: tap the words in order, or drag them. Match: drag from the dot on a left card to its match, or tap a card and then its match.'],
    ['Exam', 'Choose “Exam” in the practice menu. It is timed: one countdown for the whole test, 40 seconds per question, shows no right or wrong until the end, and has no second chances. The pass mark is 60%. Time running out counts what is left as wrong.'],
    ['Flashcards', 'Quick review of the vocabulary. Flip the card, then mark “Knew it” or “Not yet”. The ones you miss count as weak.'],
    ['Weak items', 'An item is weak when you have failed it and have not yet got it right twice in a row since. “Practise my weak items” on the home page builds a test from them, and it empties as you master them.'],
    ['My progress', 'Shows how much you have mastered, overall and by subtopic. Your progress is saved only in this browser: to move it to another device (or keep a copy), download a backup or copy your code and import it there. Importing never removes progress you already have.'],
    ['Unfinished tests', 'If you leave or reload in the middle of a practice, the home page offers to resume it. Exams cannot be resumed.'],
    ['Sound and theme', 'The speaker and sun/moon buttons in the top bar turn the sounds off and switch between dark and light.'],
    ['Install and offline', 'On your phone, use “Add to home screen” (or “Install”) in the browser menu. After one visit with internet it also opens without a connection. When you are online it always loads the latest version.'],
  ];

  FCE.screens.help = function (el) {
    el.classList.add('wide');
    el.append(
      h('h1', { class: 'title-l' }, 'How it works'),
      h('p', { class: 'muted', style: 'margin:6px 0 20px' }, 'Everything the web does, in a minute.'));
    const grid = h('div', { class: 'help-grid' });
    for (const [title, text] of BLOCKS) {
      grid.append(h('section', { class: 'card help-card' }, h('h2', { class: 'help-title' }, title), h('p', { class: 'muted help-text' }, text)));
    }
    el.append(grid);
  };
})(globalThis);
