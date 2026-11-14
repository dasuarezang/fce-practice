// Data loader. In the browser, index.html loads each data file with its own <script>
// (same order as below). In Node (tests, tools/check.js) this file requires them.
(function (root) {
  if (typeof require === 'function' && typeof module !== 'undefined') {
    require('./tema1-family-affair.js');
    require('./tema2-leisure-pleasure.js');
  }
})(globalThis);
