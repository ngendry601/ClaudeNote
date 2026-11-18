// Moteur Markdown sûr (tout est échappé avant mise en forme) + schémas maison.
//
// En plus du Markdown classique (titres, listes, **gras**, *italique*, ==surligné==, `code`, tableaux, citations) :
//   ```flux                       → étapes reliées par des flèches
//   Faits -> Problème -> Règle -> Solution
//   ```
//   ```arbre                      → classification (indentation de 2 espaces)
//   Contrat
//     Formation
//     Exécution
//   ```
//   ```matrice                    → grille 2×2 (SWOT, BCG…), cases séparées par |
//   **Forces** : … | **Faiblesses** : …
//   **Opportunités** : … | **Menaces** : …
//   ```
//   > ⚠️ …  /  > 💡 …  /  > 📌 …  → encadrés « piège », « astuce », « à retenir »
import { esc } from './ui.js';

const safeUrl = (u) => /^(https?:|mailto:|#|\/|\.\/)/i.test(u);

export function inline(raw = '') {
  let s = esc(raw);
  const codes = [];
  s = s.replace(/`([^`]+)`/g, (_, c) => (codes.push(c), `\u0000${codes.length - 1}\u0000`));
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, url) => (safeUrl(url) ? `<img alt="${alt}" src="${url}" loading="lazy">` : m));
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, url) => (safeUrl(url) ? `<a href="${url}" target="_blank" rel="noopener">${t}</a>` : m));
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/__(.+?)__/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*\w])\*(?!\s)(.+?)\*(?!\w)/g, '$1<em>$2</em>');
  s = s.replace(/~~(.+?)~~/g, '<del>$1</del>');
  s = s.replace(/==(.+?)==/g, '<mark>$1</mark>');
  s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[i]}</code>`);
  return s;
}

/* ---------- Schémas ---------- */
function flowHtml(lines) {
  const rows = lines.filter((l) => l.trim()).map((l) => l.split(/\s*(?:->|→|=>)\s*/).filter(Boolean));
  return `<div class="flow">${rows
    .map((nodes) => `<div class="flow-row">${nodes.map((n) => `<span class="flow-node">${inline(n)}</span>`).join('<span class="flow-arrow" aria-hidden="true">➜</span>')}</div>`)
    .join('')}</div>`;
}

function treeHtml(lines) {
  const items = lines
    .filter((l) => l.trim())
    .map((l) => {
      const raw = l.replace(/\t/g, '  ');
      const depth = Math.floor((raw.length - raw.trimStart().length) / 2);
      return { depth, text: raw.trim().replace(/^[-*]\s+/, '') };
    });
  let i = 0;
  const build = (depth) => {
    let html = '<ul>';
    while (i < items.length && items[i].depth >= depth) {
      const it = items[i++];
      html += `<li><span class="tree-node">${inline(it.text)}</span>`;
      if (i < items.length && items[i].depth > it.depth) html += build(items[i].depth);
      html += '</li>';
    }
    return html + '</ul>';
  };
  return `<div class="tree">${build(items[0]?.depth || 0)}</div>`;
}

function matrixHtml(lines) {
  const rows = lines.filter((l) => l.trim()).map((l) => l.split('|').map((c) => c.trim()));
  const cols = Math.max(...rows.map((r) => r.length));
  let k = 0;
  return `<div class="matrix" style="--cols:${cols}">${rows
    .map((r) => r.map((c) => `<div class="matrix-cell m${k++ % 4}">${inline(c)}</div>`).join(''))
    .join('')}</div>`;
}

const DIAGRAMS = { flux: flowHtml, schema: flowHtml, etapes: flowHtml, arbre: treeHtml, matrice: matrixHtml };

/* ---------- Blocs ---------- */
const isList = (l) => /^\s*([-*+]|\d+[.)])\s+/.test(l);
const isTableRow = (l) => /^\s*\|.*\|\s*$/.test(l);
const isTableSep = (l) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(l || '');
const isBlockStart = (l, next) =>
  /^```/.test(l) || /^#{1,6}\s/.test(l) || /^>/.test(l) || isList(l) || (isTableRow(l) && isTableSep(next)) || /^\s*(-{3,}|\*{3,})\s*$/.test(l);

const CALLOUTS = [
  [/^(⚠️|❗|🚫)/u, 'warn'],
  [/^(💡|✨)/u, 'tip'],
  [/^(📌|🎯|✅)/u, 'key'],
];

function listHtml(lines) {
  // listes imbriquées selon l'indentation
  const items = lines.map((l) => {
    const raw = l.replace(/\t/g, '  ');
    return { depth: Math.floor((raw.length - raw.trimStart().length) / 2), ordered: /^\s*\d+[.)]/.test(raw), text: raw.trim().replace(/^([-*+]|\d+[.)])\s+/, '') };
  });
  let i = 0;
  const build = (depth) => {
    const tag = items[i]?.ordered ? 'ol' : 'ul';
    let html = `<${tag}>`;
    while (i < items.length && items[i].depth >= depth) {
      const it = items[i++];
      const t = it.text.match(/^\[( |x|X)\]\s+(.*)$/);
      html += t ? `<li class="task"><input type="checkbox" disabled ${t[1] !== ' ' ? 'checked' : ''}> ${inline(t[2])}` : `<li>${inline(it.text)}`;
      if (i < items.length && items[i].depth > it.depth) html += build(items[i].depth);
      html += '</li>';
    }
    return html + `</${tag}>`;
  };
  return build(items[0].depth);
}

export function md(src = '') {
  const lines = String(src).replace(/\r/g, '').split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    let m;
    if ((m = l.match(/^```\s*([\w-]*)/))) {
      const lang = m[1].toLowerCase();
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      out.push(DIAGRAMS[lang] ? DIAGRAMS[lang](buf) : `<pre data-lang="${esc(lang)}"><code>${esc(buf.join('\n'))}</code></pre>`);
      continue;
    }
    if ((m = l.match(/^(#{1,6})\s+(.*)$/))) {
      const n = m[1].length;
      out.push(`<h${n} id="${headingId(m[2])}">${inline(m[2])}</h${n}>`);
      i++;
      continue;
    }
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(l)) {
      out.push('<hr>');
      i++;
      continue;
    }
    if (/^>/.test(l)) {
      const buf = [];
      while (i < lines.length && /^>/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      const kind = CALLOUTS.find(([re]) => re.test(buf[0].trim()))?.[1];
      out.push(kind ? `<div class="callout ${kind}">${md(buf.join('\n'))}</div>` : `<blockquote>${md(buf.join('\n'))}</blockquote>`);
      continue;
    }
    if (isTableRow(l) && isTableSep(lines[i + 1])) {
      const cells = (r) => r.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const head = cells(l);
      i += 2;
      const rows = [];
      while (i < lines.length && isTableRow(lines[i])) rows.push(cells(lines[i++]));
      out.push(
        `<div class="table-wrap"><table><thead><tr>${head.map((h) => `<th>${inline(h)}</th>`).join('')}</tr></thead><tbody>${rows
          .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`)
          .join('')}</tbody></table></div>`,
      );
      continue;
    }
    if (isList(l)) {
      const buf = [];
      while (i < lines.length && (isList(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && buf.length))) {
        if (isList(lines[i])) buf.push(lines[i]);
        else buf[buf.length - 1] += ' ' + lines[i].trim();
        i++;
      }
      out.push(listHtml(buf));
      continue;
    }
    if (!l.trim()) {
      i++;
      continue;
    }
    const buf = [];
    while (i < lines.length && lines[i].trim() && !(buf.length && isBlockStart(lines[i], lines[i + 1]))) buf.push(lines[i++]);
    out.push(`<p>${buf.map(inline).join('<br>')}</p>`);
  }
  return out.join('\n');
}

const headingId = (t) => 'h-' + t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);

export const stripMd = (s = '') =>
  String(s)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`~|=]+|-{2,}/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

/** Titres ## et ### d'un texte, pour le sommaire */
export const outline = (src = '') =>
  [...String(src).matchAll(/^(#{2,3})\s+(.+)$/gm)].map((m) => ({ level: m[1].length, text: m[2].replace(/[*_=`]/g, ''), id: headingId(m[2]) }));
