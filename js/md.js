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

// Couleurs de section façon « fiche de révision » (bandeaux colorés)
const SECTION_COLORS = [
  [/m[ée]thod/i, '#334155'],
  [/[ée]conom/i, '#15803d'],
  [/droit|juridi/i, '#b91c1c'],
  [/manag|strat[ée]g/i, '#7e22ce'],
  [/auteur|date|article/i, '#1f2937'],
  [/pi[èe]ge|erreur/i, '#be123c'],
  [/r[ée]seau|syst[èe]me|informati|d[ée]v|programm|algo/i, '#0369a1'],
  [/math|calcul/i, '#c2410c'],
];
const PALETTE = ['#4338ca', '#0f766e', '#b45309', '#be185d', '#0369a1', '#4d7c0f', '#7e22ce', '#b91c1c'];
export function sectionColor(name = '') {
  if (!name) return '#4338ca';
  for (const [re, c] of SECTION_COLORS) if (re.test(name)) return c;
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
export const cleanSection = (s = '') => s.replace(/^\s*\d+[.)]\s*/, '').replace(/\s*—\s*mots? à savoir.*$/i, '').trim();

/** Parse un bloc de carte riche : lignes « !! » = piège, le reste = verso */
export function parseCardBlock(lines) {
  const back = [];
  const traps = [];
  for (const l of lines) {
    const t = l.match(/^\s*!!\s*(.*)$/);
    if (t) traps.push(t[1]);
    else back.push(l);
  }
  return { back: back.join('\n').trim(), trap: traps.join(' ') };
}

/** Une carte « fiche » contient des sous-titres ### : elle se lit comme une fiche de révision */
export const isFiche = (back = '') => /^###\s/m.test(back);
export const ficheTopics = (back = '') => [...back.matchAll(/^###\s+(.+)$/gm)].map((m) => m[1].trim());

export function ficheHtml(title, back, trap, color) {
  return `<section class="fiche" style="--fc:${color}"><h2 class="fiche-head">${inline(title)}</h2><div class="fiche-body md">${md(back)}</div>${
    trap ? `<div class="fc-trap"><b>⚠️ Piège</b> ${inline(trap)}</div>` : ''
  }</section>`;
}

export function cardBlockHtml(front, back, trap, color) {
  if (isFiche(back)) return ficheHtml(front, back, trap, color);
  return `<div class="fc-block" style="--fc:${color}"><div class="fc-q">${inline(front)}</div><div class="fc-a md">${md(back)}</div>${
    trap ? `<div class="fc-trap"><b>⚠️ Piège</b> ${inline(trap)}</div>` : ''
  }</div>`;
}

const isList = (l) => /^\s*([-*+]|\d+[.)])\s+/.test(l);
const isTableRow = (l) => /^\s*\|.*\|\s*$/.test(l);
const isTableSep = (l) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(l || '');
const cardLine = (l) => !/`[^`]*::[^`]*`/.test(l) && l.match(/^\s*(?:[-*+]\s+|\d+[.)]\s+)?(.+?)\s*::\s*(.+)$/);

function isBlockStart(l, next) {
  return /^```/.test(l) || /^:::\s+\S/.test(l) || /^#{1,6}\s/.test(l) || /^>/.test(l) || isList(l) || (isTableRow(l) && isTableSep(next)) || /^\s*(-{3,}|\*{3,})\s*$/.test(l);
}

export function md(src = '') {
  const lines = src.replace(/\r/g, '').split('\n');
  const out = [];
  let i = 0;
  let section = '';
  while (i < lines.length) {
    const l = lines[i];
    let m;
    if ((m = l.match(/^:::\s+(.+)$/))) {
      const buf = [];
      i++;
      while (i < lines.length && !/^:::\s*$/.test(lines[i])) buf.push(lines[i++]);
      i++;
      const { back, trap } = parseCardBlock(buf);
      out.push(cardBlockHtml(m[1].trim(), back, trap, sectionColor(section || m[1])));
      continue;
    }
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
      if (n === 2) {
        section = cleanSection(m[2]);
        out.push(`<h2 class="sec" style="--fc:${sectionColor(section)}">${inline(m[2])}</h2>`);
      } else if (n === 3) out.push(`<h3 class="sub"${section ? ` style="--fc:${sectionColor(section)}"` : ''}>${inline(m[2])}</h3>`);
      else out.push(`<h${n}>${inline(m[2])}</h${n}>`);
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
