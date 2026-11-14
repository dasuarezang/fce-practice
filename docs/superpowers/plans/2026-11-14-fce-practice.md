# FCE Practice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Static web (GitHub Pages) to practise the FCE notes in `primerosdosexamenes.pdf`: topic/subtopic selector, theory, and Kahoot / match-with-arrows / gap-fill / reorder exercises generated from data, with a verifier that guarantees nothing from the notes is skipped.

**Architecture:** Pure-JS, no build. Content lives in `data/*.js` (one file per tema). Pure logic (rng, question generators, session, store, theory HTML, verifier) is unit-tested with `node --test`; DOM screens sit on top and are verified in a browser. All scripts are classic scripts that attach to `globalThis.FCE`, so the same files run in the browser (double click) and in Node tests.

**Tech Stack:** HTML, CSS, vanilla JS (ES2020), Node ≥ 18 only for tests/verifier (built-in `node:test`, zero npm dependencies), `gh` CLI for publishing.

**Spec:** `docs/superpowers/specs/2026-11-14-fce-practice-design.md` (§8 holds every data value to transcribe; do not retype from the PDF).

## Global Constraints

- No build step, no runtime dependencies, no CDN: the site must work offline from a folder.
- **No gradients anywhere** (`gradient` must not appear in any `.css`/`.html`); flat backgrounds: light `#f5f5f7`, dark `#000`/`#1c1c1e`. Glass (`backdrop-filter: blur`, translucent bg, 1px border) only on top bar, bottom bar, modal sheets, answer feedback.
- UI text in Spanish; study content in English (Spanish translations only where §8 has them).
- Every script is an IIFE `(function (root) { const FCE = (root.FCE = root.FCE || {}); … })(globalThis);` and exports via `FCE.*`; Node tests `require()` them. Top-level `const`/`let` is forbidden in scripts (browser redeclaration clashes).
- Data files push into `FCE.temas`; ids stable and readable (`t2-expr-by-far`); every item has `fuente` (PDF page number).
- Light/dark via `prefers-color-scheme`; honour `prefers-reduced-motion`; no horizontal scroll at 360px width.
- Progress only in `localStorage` key `fce.progress.v1`.
- Git commits have **no** Co-Authored-By / "Generated with" lines (user rule). Branch `main`.
- Section ids and item totals (99 items) are fixed: `t1-phrasal` 6, `t1-adjetivos` 20, `t1-antonimos` 8, `t1-present-perfect` 2, `t1-do-make` 29, `t2-phrasal` 8, `t2-ed-ing` 2, `t2-comparativos` 8 (6 table rows + 2 three-syllable examples *experienced*, *inconvenient*), `t2-irregulares` 5, `t2-expressions` 11.

## Review Focus

1. **Typed answers** with `/` alternatives (`cleverer / more clever`, `educado/cortés`), accents, case, extra spaces, trailing punctuation, and optional parts (`do (an) exercise`, `(a) sport`) must be accepted. *Pinned in Task 6.*
2. **Small pools:** a selection with 1–3 items must still produce kahoot questions (fewer than 4 options, never crash, never duplicate options). *Pinned in Task 5.*
3. **Duplicate terms across sections:** `count on` appears in T1 and T2 with different definitions; the other `count on` definition must never appear as a distractor, and never twice in one match group. *Pinned in Tasks 5 and 7.*
4. **Corrupt or unavailable `localStorage`** (throws, invalid JSON) must leave the app working with empty progress. *Pinned in Task 9.*
5. **Retry loop termination:** failed questions come back once at the end; a session never loops forever; zero selected subtopics gives an empty-selection message, not a blank screen. *Pinned in Tasks 9 and 12.*

---

### Task 1: Scaffold, RNG and test runner

**Files:**
- Create: `package.json`, `.gitignore`, `js/rng.js`, `tests/rng.test.js`

**Interfaces:**
- Produces: `FCE.rng.make(seed: number) -> { next(): number /*[0,1)*/, shuffle<T>(arr: T[]): T[] /*new array*/, pick<T>(arr: T[], n: number): T[] }`. Same seed → same sequence.

- [ ] **Step 1:** `package.json` with `"scripts": {"test": "node --test tests/", "check": "node tools/check.js"}` and no dependencies; `.gitignore` with `node_modules/`.
- [ ] **Step 2: Failing tests** in `tests/rng.test.js`: `same seed gives same shuffle`; `shuffle keeps all elements and does not mutate input`; `pick(arr,2) returns 2 distinct elements`; `pick(arr,10) on 3 elements returns 3`.
- [ ] **Step 3:** Run `npm test` → FAIL (module missing).
- [ ] **Step 4:** Implement `js/rng.js` (mulberry32 seeded generator, Fisher–Yates).
- [ ] **Step 5:** Run `npm test` → PASS.
- [ ] **Step 6: Commit** `git add -A && git commit -m "Scaffold project with seeded RNG"`.

### Task 2: Data model validator and inventory

**Files:**
- Create: `tools/inventory.js`, `tools/validate.js`, `tests/validate.test.js`

**Interfaces:**
- Produces: `inventory` = `{ "t1-phrasal": 6, … }` (Global Constraints totals, as `module.exports`).
- Produces: `validate(temas: Tema[], inventory) -> { errors: string[], warnings: string[] }` (`module.exports = { validate }`). Errors: duplicate item id, missing `id`/`fuente`/required fields per `tipo`, unknown `tipo`, section count ≠ inventory, section missing from data or from inventory. Warnings: one line per item with a `revisar` string.
- Required fields per tipo (spec §4): `pares{termino,definicion}`, `antonimos{positivo,negativo}`, `colocaciones{verbo∈do|make,resto}`, `tabla{base,comparativo,superlativo}`, `regla{titulo,formula,puntos[]}` (optional `ejemplo`,`hueco`), `estructura{proposito,formula,ejemplo,hueco}` where `hueco` is `ejemplo` with the answer wrapped as `{{…}}`.

- [ ] **Step 1: Failing tests:** `accepts a valid minimal tema`; `reports duplicate item ids`; `reports item missing fuente`; `reports unknown tipo`; `reports count mismatch against inventory`; `reports estructura without hueco`; `puts items with revisar into warnings, not errors`.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement both files. **Step 4:** Run → PASS.
- [ ] **Step 5: Commit** `"Add data validator and inventory"`.

### Task 3: Tema 1 data

**Files:**
- Create: `data/tema1-family-affair.js`, `data/index.js`, `tests/data-t1.test.js`

**Interfaces:**
- Consumes: `validate`, `inventory`.
- Produces: `FCE.temas[0] = { id:"t1", titulo:"1. Family Affair", secciones:[…] }` with the five section ids from Global Constraints; each section `{ id, titulo, grupo, tipo, items }`. Groups: `t1-phrasal`/`t1-adjetivos`/`t1-antonimos`/`t1-do-make` → `vocabulario`; `t1-present-perfect` → `gramatica`. Tipos: pares, pares, antonimos, regla, colocaciones. `data/index.js` is the loader list used by `index.html` (browser: documents the script order; Node: `require`s every data file).

- [ ] **Step 1: Failing test** `tests/data-t1.test.js`: loads `data/index.js`, runs `validate(FCE.temas, inventoryT1)` where `inventoryT1` is inventory filtered to `t1-*`; asserts `errors` is `[]`; asserts spot values: item `t1-adj-bossy` has `definicion === "mandón"`; `t1-dm-make-the-bed` has `verbo === "make"` and `resto === "the bed"`; `t1-pp-simple` has 4 `puntos`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Transcribe spec §8 "Tema 1" and "Do or Make" exactly. Phrasal: `make it up` carries `revisar:"¿invent; lie?"`. *Do/make* `resto` keeps parentheses verbatim (`"(an) exercise"`, `"(a) sport"`). `fuente`: 1 for tema 1, 2 for Do or Make. Present Perfect items are two `regla` (Simple, Continuous) with the 4 points each and `formula` `have + past participle` / `have + been + verb-ing`.
- [ ] **Step 4:** Run → PASS. **Step 5: Commit** `"Add Tema 1 data"`.

### Task 4: Tema 2 data

**Files:**
- Create: `data/tema2-leisure-pleasure.js`, `tests/data-t2.test.js`; Modify: `data/index.js`

**Interfaces:**
- Produces: `FCE.temas[1] = { id:"t2", titulo:"2. Leisure and Pleasure", … }`. Groups: `t2-phrasal` (pares) and `t2-irregulares`/`t2-comparativos` (tabla) and `t2-ed-ing` (regla) → `vocabulario` for phrasal, `gramatica` for ed-ing, comparativos, irregulares; `t2-expressions` (estructura) → `expressions`. `t2-comparativos` rows carry `nota` for the syllable category (`"one syllable"`, `"ending single consonant"`, `"two syllables"`, `"three or more syllables"`).

- [ ] **Step 1: Failing test:** `validate` over both temas with the full inventory → `errors` `[]`; spot values: `t2-expr-by-far.formula === "by far + superlative"`; `t2-expr-by-far.hueco` contains `{{by far}}`; `t2-comp-narrow.comparativo === "narrower / more narrow"`; `t2-irr-far.superlativo === "furthest / farthest"`; total items across all temas = 99.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Transcribe spec §8 "Tema 2". `fuente` 3 (phrasal, -ed/-ing, comparatives) and 4/5 (irregulars + expressions 1–8 on 4, 9–11 on 5). Items with `revisar`: `t2-ed-ing-*` (examples), `t2-expr-not-nearly` (last word), `t2-expr-one-of-the-most` (plural noun vs infinitive). `hueco` for each expression wraps the structure words (e.g. `She finds physics {{as}} challenging {{as}} maths.`); item 3 `ejemplo` keeps both sentences, `hueco` uses the first.
- [ ] **Step 4:** Run → PASS. **Step 5: Commit** `"Add Tema 2 data"`.

### Task 5: Kahoot generator

**Files:**
- Create: `js/gen/kahoot.js`, `js/gen/index.js`, `tests/kahoot.test.js`

**Interfaces:**
- Consumes: `FCE.rng`, `FCE.temas`.
- Produces — Question shape (used by every later task): `{ kind:"kahoot", itemIds:string[], prompt:string, options:string[], answer:number, explain:string }`.
- Produces: `FCE.gen.kahoot(entries: Entry[], pool: Entry[], rng) -> Question[]`, one per entry, where `Entry = { item, section }`. `FCE.gen.SUPPORT = { pares:["kahoot","match","gapfill"], antonimos:["kahoot","match","gapfill"], colocaciones:["gapfill","match","kahoot"], tabla:["kahoot","gapfill"], regla:["kahoot","match"], estructura:["kahoot","match","gapfill","reorder"] }`.
- Per tipo: pares → term→definition or definition→term (rng); antonimos → positive→negative; colocaciones → "___ the bed" with options `["do","make"]`; tabla → comparative or superlative of `base`; regla → a random `punto` → options = titles of the rules in the same section; estructura → `proposito` → `formula`. Distractors come from `pool` entries of the same tipo, excluding entries whose answer text or *term* equals the correct one.

- [ ] **Step 1: Failing tests:** `pares question has 4 unique options and answer index points to the correct definition`; `with a pool of 2 entries produces 2 options, no crash` (Review Focus 2); `the other "count on" definition never appears as a distractor for a "count on" question` (Review Focus 3, using real data from both temas); `colocaciones kahoot has exactly options ["do","make"]`; `same seed gives same questions`.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run → PASS. **Step 5: Commit** `"Add kahoot question generator"`.

### Task 6: Gap-fill generator and answer matching

**Files:**
- Create: `js/gen/gapfill.js`, `tests/gapfill.test.js`

**Interfaces:**
- Produces: `{ kind:"gapfill", itemIds, text:string /*contains one "___"*/, answers:string[] /*accepted variants*/, options?:string[], explain:string }`.
- Produces: `FCE.gen.gapfill(entries, pool, rng) -> Question[]`; `FCE.gen.variants(answer: string) -> string[]` (splits on `/`, expands `(x)` optional parts into with/without, trims); `FCE.gen.matches(q: Question, input: string) -> boolean` (case-, accent- and whitespace-insensitive, ignores trailing `.,!?`; true if the normalised input equals any normalised variant).
- Per tipo: pares → definition→term; antonimos → positive→negative; colocaciones → `___ <resto>` with `options ["do","make"]`; tabla → **two** questions per item (comparative, superlative); estructura/regla → from `hueco` (each `{{x}}` becomes `___`; one question per item, `answers` = the `{{}}` contents joined by one space when several, with `options` null). Regla without `hueco` produces nothing.

- [ ] **Step 1: Failing tests:** `variants("cleverer / more clever") = ["cleverer","more clever"]`; `variants("(an) exercise")` contains `"an exercise"` and `"exercise"`; `matches accepts "Educado" and "cortés" and "CORTES" for "educado/cortés"`; `matches ignores trailing period and double spaces`; `matches rejects "make" for do-the-cleaning`; `tabla yields 2 questions per item`; `estructura with hueco "She finds physics {{as}} challenging {{as}} maths." gives text with two "___", answers[0] === "as, as", and matches accepts both "as, as" and "as as"`.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run → PASS. **Step 5: Commit** `"Add gap-fill generator and answer matching"`.

### Task 7: Match generator

**Files:**
- Create: `js/gen/match.js`, `tests/match.test.js`

**Interfaces:**
- Produces: `{ kind:"match", itemIds, left:{id,text}[], right:{id,text}[], pairs:Record<string,string> /*leftId→rightId, many-to-one allowed*/, explain }`.
- Produces: `FCE.gen.match(entries, pool, rng, size=5) -> Question[]` — entries are chunked into groups of ≤5 within the same section (a trailing group of 1 merges into the previous), left/right shuffled.
- Per tipo: pares → term ↔ definition; antonimos → positive ↔ negative; colocaciones → phrase ↔ `do`/`make` (right has the 2 verbs, many-to-one); regla → punto ↔ rule title (many-to-one); estructura → proposito ↔ formula.

- [ ] **Step 1: Failing tests:** `groups of 5 and a lone remainder merges (11 items → 5,6 or 5,3,3 — assert no group has 1 item and every item appears once)`; `every left id has exactly one pair`; `colocaciones right column has exactly 2 entries`; `two items with the same term (count on) never land in the same group` (Review Focus 3).
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run → PASS. **Step 5: Commit** `"Add match generator"`.

### Task 8: Reorder generator and practice builder

**Files:**
- Create: `js/gen/reorder.js`, `js/practice.js`, `tests/reorder.test.js`, `tests/practice.test.js`

**Interfaces:**
- Produces: `{ kind:"reorder", itemIds, words:string[] /*shuffled, never equal to solution order*/, solution:string[], explain }`; `FCE.gen.reorder(entries, pool, rng) -> Question[]` for `estructura` (first sentence of `ejemplo`) and `regla` with `ejemplo`; other tipos yield `[]`.
- Produces: `FCE.practice.build({ sectionIds: string[], kind: "mixto"|"kahoot"|"match"|"gapfill"|"reorder", length: 10|20|"all", seed?: number }) -> Question[]`. Items come from the selected sections. `mixto` assigns each item one of its supported kinds, chosen so that over a whole selection every supported kind appears when possible. `length` caps the number of questions (`"all"` = no cap). `kind` unsupported by a section simply skips it. Empty `sectionIds` → `[]`.
- Produces: `FCE.practice.itemsOf(sectionIds) -> Entry[]` and `FCE.practice.kindsFor(sectionIds) -> string[]` (kinds with at least one question).

- [ ] **Step 1: Failing tests:** `reorder words are a permutation of the solution and differ from it`; `reorder for pares returns []`; `build with empty selection returns []`; `build kind "kahoot" on t1-phrasal "all" gives 6 questions`; `build length 10 on all sections gives ≤ 10`; `mixto over all sections uses all four kinds`; `kindsFor(["t1-do-make"]) includes gapfill and match`.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run → PASS. **Step 5: Commit** `"Add reorder generator and practice builder"`.

### Task 9: Store and session

**Files:**
- Create: `js/store.js`, `js/session.js`, `tests/store.test.js`, `tests/session.test.js`

**Interfaces:**
- Produces: `FCE.store.create(storage?: {getItem,setItem}) -> { record(itemIds: string[], ok: boolean): void, stats(itemId): {seen:number, wrong:number}, failedIds(): string[], reset(): void }`; default storage `globalThis.localStorage`, key `fce.progress.v1`. Every storage call is wrapped: throw or invalid JSON → behaves as empty and never throws.
- Produces: `FCE.session.create(questions: Question[]) -> { current(): Question|null, index(): number, total(): number, submit(ok: boolean): void, done(): boolean, summary(): { total:number, correct:number, wrongItemIds:string[] } }`. A question answered wrongly is appended **once** to the end of the queue as a retry; retries count in `total()` but not in `correct` and never re-queue.

- [ ] **Step 1: Failing tests:** `record then stats counts seen and wrong`; `throwing storage does not throw and returns empty stats` and `invalid JSON in storage is treated as empty` (Review Focus 4); `failedIds lists items with wrong>0`; `session wrong answer is retried once at the end`; `session ends: answering everything wrong terminates after 2×N submissions` (Review Focus 5); `summary.wrongItemIds has unique ids`.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run → PASS. **Step 5: Commit** `"Add progress store and session"`.

### Task 10: Theory rendering and the full coverage check

**Files:**
- Create: `js/theory.js`, `tools/check.js`, `tests/theory.test.js`, `tests/check.test.js`

**Interfaces:**
- Produces: `FCE.theory.render(section) -> string` (HTML). Every item's root element carries `data-item-id="<id>"`. `regla` formula and `puntos` rendered as a boxed list; `tabla` as an HTML table grouped by `nota`; `estructura` with the `formula` wrapped in `<mark>`; item with `revisar` gets no visible change.
- Produces: `FCE.theory.escape(s: string) -> string`.
- Produces: `tools/check.js` (`npm run check`): runs `validate`; for every item asserts it appears in `FCE.theory.render(section)` and in **≥ 2 distinct question kinds** produced by `FCE.practice.build({sectionIds:[section.id], kind, length:"all"})` (counting `itemIds`); prints warnings; prints `OK: 99 items` and exits 0, else prints each failure and exits 1.

- [ ] **Step 1: Failing tests:** `render output contains data-item-id for every item of every section` (real data); `render escapes < and & in text`; `check on real data has no failures`; `check on a fixture item supported by only one kind reports it`.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run `npm test && npm run check` → PASS and `OK: 99 items`.
- [ ] **Step 5: Commit** `"Add theory rendering and coverage verifier"`.

### Task 11: App shell, styles and home screen

**Files:**
- Create: `index.html`, `css/base.css`, `css/glass.css`, `js/app.js`, `tests/no-gradients.test.js`

**Interfaces:**
- Produces: `FCE.app.go(screen: "home"|"selector"|"practice"|"results"|"theory"|"coverage", params?: object) -> void` (hash router, `#/home` etc.). Each screen module registers `FCE.screens[name] = (root: HTMLElement, params) => void`.
- Produces: CSS tokens on `:root` (`--bg`, `--card`, `--text`, `--muted`, `--accent`, `--ok`, `--bad`, `--glass-bg`, `--glass-border`) with dark overrides under `@media (prefers-color-scheme: dark)`; `.glass` class (blur + translucent bg + 1px border) and `.bar` (sticky top bar, glass).
- `index.html` loads scripts in this order: `data/*.js`, `js/rng.js`, `js/gen/*.js`, `js/practice.js`, `js/store.js`, `js/session.js`, `js/theory.js`, `js/ui/*.js` (screens), `js/app.js`.
- Home: two cards titled exactly `1. Family Affair` and `2. Leisure and Pleasure`, each with a progress line (`seen/total` items) and buttons *Practicar* (→ selector, tema preselected) and *Teoría* (→ theory); link *Cobertura*.

- [ ] **Step 1: Guard test** `tests/no-gradients.test.js`: reads every `.css` and `.html` under the repo (excluding `node_modules`, `docs`) and asserts none contains `gradient`. It passes now (no files yet) and guards every later task.
- [ ] **Step 2:** Build shell, styles and home, one file per screen under `js/ui/`; run `npm test` → PASS.
- [ ] **Step 3: Verify in browser:** run `python -m http.server 8000`, open `http://localhost:8000`. Expect: the two cards with the exact titles, correct in light and dark (toggle OS theme), no horizontal scroll at 360px (devtools), top bar blurs content when scrolling.
- [ ] **Step 4: Commit** `"Add app shell and home screen"`.

### Task 12: Selector screen

**Files:**
- Create: `js/ui/selector.js`, `css/selector.css`

**Interfaces:**
- Consumes: `FCE.practice.itemsOf`, `FCE.practice.kindsFor`, `FCE.practice.build`, `FCE.temas`.
- Produces: `FCE.screens.selector`. Selection state is a `Set` of section ids. Per tema a collapsible card with sections grouped by `grupo` (Vocabulario / Gramática / Expressions), a checkbox per section showing its item count, *Marcar todo* per tema, live counter `Seleccionados: N ítems`, kind picker (Mixto, Kahoot, Relacionar, Huecos, Ordenar) disabling kinds with no questions for the selection, length picker (10 / 20 / Todo), *Empezar* button disabled with message `Elige al menos un subtema` when selection is empty (Review Focus 5). Start calls `FCE.app.go("practice", { questions })`.

- [ ] **Step 1: Verify in browser:** select only `t2-expressions` → counter shows 11, Ordenar enabled; select only `t1-adjetivos` → Ordenar disabled; clear all → *Empezar* disabled with the message; *Marcar todo* on tema 1 → counter 65.
- [ ] **Step 2: Commit** `"Add topic selector"`.

### Task 13: Practice shell, kahoot UI and results

**Files:**
- Create: `js/ui/practice.js`, `js/ui/kahoot-ui.js`, `js/ui/results.js`, `css/practice.css`

**Interfaces:**
- Consumes: `FCE.session`, `FCE.store`, Question shapes (Tasks 5–8).
- Produces: `FCE.screens.practice` (progress bar, glass bottom bar with *Comprobar/Siguiente*, delegates to `FCE.ui.kahoot.render(root, q, onAnswer:(ok:boolean)=>void)`; the same signature for the other three UIs registered as `FCE.ui.match|gapfill|reorder`), calls `store.record` on every answer, then `FCE.screens.results` (percentage, list of failed items by `explain`, buttons *Repetir fallos* — builds a session from questions whose `itemIds` intersect `wrongItemIds` — and *Volver*). Feedback appears in a glass sheet with green/red and the `explain` text.
- Kahoot UI: 4 coloured flat tiles (blue/green/orange/purple, no gradient), keyboard keys 1–4.

- [ ] **Step 1: Verify in browser:** run a 10-question kahoot on tema 1 phrasal; right answer → green sheet with explanation; wrong → red sheet, the question returns once at the end; results show the percentage and *Repetir fallos* starts a session with only the failed items; reload and the home progress shows seen counts.
- [ ] **Step 2: Commit** `"Add practice flow with kahoot and results"`.

### Task 14: Gap-fill and reorder UI

**Files:**
- Create: `js/ui/gapfill-ui.js`, `js/ui/reorder-ui.js`

**Interfaces:**
- Consumes: `FCE.gen.matches`; produces `FCE.ui.gapfill.render` and `FCE.ui.reorder.render` with the signature from Task 13.
- Gap-fill: text with an inline input (or option buttons when `options`), Enter submits. Reorder: word chips tapped or dragged into a sentence area; chips return on tap; correct when the joined result equals `solution` joined.

- [ ] **Step 1: Verify in browser:** `___ the bed` shows do/make buttons; typing `Cortés` for polite's definition is accepted; typing `do (an) exercise`-style optional article accepted both ways; reorder with `by far` example accepts only the right order and works with finger/touch emulation.
- [ ] **Step 2: Commit** `"Add gap-fill and reorder UI"`.

### Task 15: Match with arrows UI

**Files:**
- Create: `js/ui/match-ui.js`, `css/match.css`

**Interfaces:**
- Produces: `FCE.ui.match.render(root, q, onAnswer)`. Two columns of cards, each with a dot on the inner edge; dragging from a left dot to a right dot (Pointer Events, mouse+touch, `touch-action:none` on dots) draws an SVG line (solid colour, no gradient); re-drag replaces a link; tapping a line removes it; many-to-one allowed. *Comprobar* is enabled when every left card has a link and colours lines green/red against `q.pairs`; `onAnswer(ok)` is true only when all pairs are right.

- [ ] **Step 1: Verify in browser:** drag works with mouse and with touch emulation; lines follow when the window is resized or scrolled; colocaciones match (phrases → do/make) accepts two phrases linked to the same verb; a wrong link shows red and the correct answer in the explanation.
- [ ] **Step 2: Commit** `"Add match-with-arrows UI"`.

### Task 16: Theory and coverage screens

**Files:**
- Create: `js/ui/theory-ui.js`, `js/ui/coverage-ui.js`, `css/theory.css`

**Interfaces:**
- Consumes: `FCE.theory.render`, `FCE.store`.
- Produces: `FCE.screens.theory` (params `{ temaId }`: sections in notebook order, `<mark>` highlights in flat yellow `#fff3a3`/dark equivalent) and `FCE.screens.coverage` (per tema/section: total items, worked (`seen>0`), with failures (`wrong>0`), and a `revisar` badge on items flagged, listing them).

- [ ] **Step 1: Verify in browser:** theory for tema 2 shows 11 expressions with highlighted structures and the comparatives table with the three-syllable rows; coverage shows 99 items total, `revisar` lists exactly the items flagged in Tasks 3–4.
- [ ] **Step 2: Commit** `"Add theory and coverage screens"`.

### Task 17: README, final check and publish

**Files:**
- Create: `README.md`, `.nojekyll`

**Interfaces:** none.

- [ ] **Step 1:** README (Spanish): what it is, how to run (`python -m http.server`), `npm test`, `npm run check`, and the 4-step recipe to add a tema (spec §7).
- [ ] **Step 2:** Run `npm test && npm run check` → all pass, `OK: 99 items`.
- [ ] **Step 3: Full manual pass** at 360px and desktop, light and dark: home → selector → each of the four exercise kinds → results → theory → coverage.
- [ ] **Step 4:** Read the user's memory note `kreix-release.md` for the email convention, set the repo-local `git config user.email` to the GitHub noreply address that note names (check with `gh api user`), then commit `"Add README and publish config"`.
- [ ] **Step 5 (outward-facing, the user asked for it):** `gh repo create dasuarezang/fce-practice --public --source . --push`, then enable Pages: `gh api -X POST repos/dasuarezang/fce-practice/pages -f "source[branch]=main" -f "source[path]=/"`.
- [ ] **Step 6:** Poll `curl -sI https://dasuarezang.github.io/fce-practice/` until `HTTP/2 200`; open the live URL and repeat a short run of Step 3. Report the URL.
