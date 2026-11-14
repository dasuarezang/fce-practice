(function (root) {
  const FCE = (root.FCE = root.FCE || {});

  const escape = (s) =>
    String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const e = escape;

  function pares(s) {
    const rows = s.items
      .map((i) => `<div class="t-row" data-item-id="${e(i.id)}"><dt>${e(i.termino)}</dt><dd>${e(i.definicion)}</dd></div>`)
      .join('');
    return `<dl class="t-pairs">${rows}</dl>`;
  }

  function antonimos(s) {
    const rows = s.items
      .map((i) => `<div class="t-row" data-item-id="${e(i.id)}"><dt>${e(i.positivo)}</dt><dd>${e(i.negativo)}</dd></div>`)
      .join('');
    return `<dl class="t-pairs t-anto">${rows}</dl>`;
  }

  function colocaciones(s) {
    const rows = s.items
      .map((i) => `<li class="t-row" data-item-id="${e(i.id)}"><strong class="verb-${e(i.verbo)}">${e(i.verbo)}</strong> ${e(i.resto)}</li>`)
      .join('');
    return `<ul class="t-colloc">${rows}</ul>`;
  }

  function tabla(s) {
    let body = '';
    let lastNota = null;
    for (const i of s.items) {
      if (i.nota && i.nota !== lastNota) {
        body += `<tr class="t-nota"><th colspan="3">${e(i.nota)}</th></tr>`;
        lastNota = i.nota;
      }
      body += `<tr data-item-id="${e(i.id)}"><td>${e(i.base)}</td><td>${e(i.comparativo)}</td><td>${e(i.superlativo)}</td></tr>`;
    }
    return `<table class="t-table"><thead><tr><th>Adjective</th><th>Comparative</th><th>Superlative</th></tr></thead><tbody>${body}</tbody></table>`;
  }

  function regla(s) {
    return s.items
      .map((i) => {
        const pts = i.puntos.map((p) => `<li>${e(p)}</li>`).join('');
        const ej = i.ejemplo ? `<p class="t-example">${e(i.ejemplo)}</p>` : '';
        return `<article class="t-box" data-item-id="${e(i.id)}"><h4>${e(i.titulo)}</h4><p class="t-formula"><code>${e(i.formula)}</code></p><ul>${pts}</ul>${ej}</article>`;
      })
      .join('');
  }

  function estructura(s) {
    return s.items
      .map(
        (i) =>
          `<article class="t-expr" data-item-id="${e(i.id)}"><p class="t-purpose">${e(i.proposito)}</p><p class="t-formula"><mark>${e(i.formula)}</mark></p><p class="t-example">${e(i.ejemplo)}</p></article>`
      )
      .join('');
  }

  const RENDERERS = { pares, antonimos, colocaciones, tabla, regla, estructura };

  function render(section) {
    const body = (RENDERERS[section.tipo] || (() => ''))(section);
    const intro = section.intro && section.intro.length
      ? `<ul class="t-intro">${section.intro.map((l) => `<li>${e(l)}</li>`).join('')}</ul>`
      : '';
    return `<section class="t-section" data-section-id="${e(section.id)}"><h3>${e(section.titulo)}</h3>${intro}${body}</section>`;
  }

  FCE.theory = { render, escape };
})(globalThis);
