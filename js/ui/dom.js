(function (root) {
  const FCE = (root.FCE = root.FCE || {});
  FCE.ui = FCE.ui || {};
  FCE.screens = FCE.screens || {};

  // h("div", {class:"x", onclick:fn}, child, "text", ...) -> HTMLElement
  FCE.dom = {
    h(tag, attrs, ...children) {
      const el = document.createElement(tag);
      for (const [k, v] of Object.entries(attrs || {})) {
        if (v === null || v === undefined || v === false) continue;
        if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (k === 'class') el.className = v;
        else if (k === 'html') el.innerHTML = v;
        else el.setAttribute(k, v === true ? '' : v);
      }
      for (const c of children.flat()) {
        if (c === null || c === undefined || c === false) continue;
        el.append(c.nodeType ? c : document.createTextNode(String(c)));
      }
      return el;
    },
    clear(el) {
      while (el.firstChild) el.removeChild(el.firstChild);
      return el;
    },
  };
})(globalThis);
