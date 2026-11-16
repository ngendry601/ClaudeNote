// Petit moteur Markdown sûr (tout est échappé avant transformation)
import { esc } from './ui.js';

const safeUrl = (u) => /^(https?:|mailto:|#|\/|\.\/)/i.test(u);

export function inline(raw) {
  let s = esc(raw);
  const codes = [];
  s = s.replace(/`([^`]+)`/g, (_, c) => {
    codes.push(c);
    return `\u0000${codes.length - 1}\u0000`;
  });
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, url) => (safeUrl(url) ? `<img alt="${alt}" src="${url}" loading="lazy">` : m));
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, url) => (safeUrl(url) ? `<a href="${url}" target="_blank" rel="noopener">${t}</a>` : m));
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/__(.+?)__/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*\w])\*(?!\s)(.+?)\*(?!\w)/g, '$1<em>$2</em>');
  s = s.replace(/~~(.+?)~~/g, '<del>$1</del>');
  s = s.replace(/==(.+?)==/g, '<mark>$1</mark>');
  s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[i]}</code>`);
  return s;
}

const isList = (l) => /^\s*([-*+]|\d+[.)])\s+/.test(l);
const isTableRow = (l) => /^\s*\|.*\|\s*$/.test(l);
const isTableSep = (l) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(l || '');
const cardLine = (l) => !/`[^`]*::[^`]*`/.test(l) && l.match(/^\s*(?:[-*+]\s+|\d+[.)]\s+)?(.+?)\s*::\s*(.+)$/);

function isBlockStart(l, next) {
  return /^```/.test(l) || /^#{1,6}\s/.test(l) || /^>/.test(l) || isList(l) || (isTableRow(l) && isTableSep(next)) || /^\s*(-{3,}|\*{3,})\s*$/.test(l);
}

export function md(src = '') {
  const lines = src.replace(/\r/g, '').split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    let m;
    if (/^```/.test(l)) {
      const lang = l.slice(3).trim();
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      out.push(`<pre data-lang="${esc(lang)}"><code>${esc(buf.join('\n'))}</code></pre>`);
      continue;
    }
    if ((m = l.match(/^(#{1,6})\s+(.*)$/))) {
      const n = m[1].length;
      out.push(`<h${n}>${inline(m[2])}</h${n}>`);
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
      out.push(`<blockquote>${md(buf.join('\n'))}</blockquote>`);
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
      const ordered = /^\s*\d+[.)]/.test(l);
      const items = [];
      while (i < lines.length && (isList(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && items.length))) {
        const cur = lines[i++];
        if (isList(cur)) items.push(cur.replace(/^\s*([-*+]|\d+[.)])\s+/, ''));
        else items[items.length - 1] += ' ' + cur.trim();
      }
      const lis = items.map((it) => {
        const c = !/`[^`]*::[^`]*`/.test(it) && it.match(/^(.+?)\s*::\s*(.+)$/);
        if (c) return `<li class="md-card-li"><span class="md-card"><b>${inline(c[1])}</b><span>${inline(c[2])}</span></span></li>`;
        const t = it.match(/^\[( |x|X)\]\s+(.*)$/);
        if (t) return `<li class="task"><input type="checkbox" disabled ${t[1] !== ' ' ? 'checked' : ''}> ${inline(t[2])}</li>`;
        return `<li>${inline(it)}</li>`;
      });
      out.push(ordered ? `<ol>${lis.join('')}</ol>` : `<ul>${lis.join('')}</ul>`);
      continue;
    }
    if ((m = cardLine(l))) {
      out.push(`<p><span class="md-card"><b>${inline(m[1])}</b><span>${inline(m[2])}</span></span></p>`);
      i++;
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

export const stripMd = (s = '') =>
  s
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`~|=]+|-{2,}/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
