// Page A4 : un cours (ou une seule partie) mis en page comme une fiche de révision PDF.
// - la taille du texte et le nombre de colonnes s'ajustent pour que tout tienne sur UNE page A4 ;
// - la page est ensuite réduite (zoom) pour tenir entièrement dans l'écran, sans défilement.
import { esc } from './ui.js';
import { md, inline, isFiche, ficheTopics, sectionColor } from './md.js';
import { extractCards } from './srs.js';

export const A4_W = 794; // 210 mm à 96 ppp
export const A4_H = 1123; // 297 mm

const sectionHtml = (s, n) => `<section class="a4-sec" style="--fc:${s.color}">
  <h2 class="a4-band">${n ? `${n}. ` : ''}${inline(s.front)}</h2>
  <div class="a4-body md">${md(s.back)}</div>
  ${s.trap ? `<p class="a4-trap"><b>⚠️ Piège :</b> ${inline(s.trap)}</p>` : ''}
</section>`;

function pageHtml(title, inner, { subtitle = '' } = {}) {
  return `<div class="a4"><div class="a4-inner">
    ${title ? `<h1 class="a4-title">${inline(title)}${subtitle ? ` <span>${esc(subtitle)}</span>` : ''}</h1>` : ''}
    <div class="a4-cols">${inner}</div>
  </div></div>`;
}

/** Toute la fiche d'un cours sur une page */
export function coursePageHtml(course) {
  const content = course.content || '';
  const parts = extractCards(content);
  const fiches = parts.filter((p) => isFiche(p.back) || p.back.includes('\n'));
  const simples = parts.filter((p) => !fiches.includes(p));
  if (!parts.length) {
    // cours libre (pas de blocs ::: ) : on met le texte tel quel dans la page
    return pageHtml(course.title, `<div class="a4-body md">${md(content.replace(/^#\s+.*$/m, ''))}</div>`);
  }
  let n = 0;
  const html = fiches.map((p) => sectionHtml({ ...p, color: p.color || sectionColor(p.front) }, ++n));
  if (simples.length)
    html.push(
      sectionHtml(
        { front: fiches.length ? 'À savoir aussi' : 'Questions — réponses', color: simples[0].color || '#4338ca', back: simples.map((s) => `- **${s.front}** : ${s.back.replace(/\n+/g, ' ')}`).join('\n') },
        ++n,
      ),
    );
  return pageHtml(`${course.title} — fiche de révision`, html.join(''));
}

/** Une flashcard : recto (ce qu'il faut réciter) ou verso (la partie complète) */
export function cardPageHtml(card, { flipped, title = '', color } = {}) {
  const c = { ...card, color: color || card.color || sectionColor(card.front) };
  const fiche = isFiche(card.back);
  if (!flipped) {
    const topics = fiche ? ficheTopics(card.back) : [];
    const body = fiche
      ? `<p class="a4-ask">Récite tout ce que tu sais sur :</p><ol class="a4-recite">${topics.map((t) => `<li>${inline(t)}</li>`).join('')}</ol>`
      : `<p class="a4-question">${inline(card.front)}</p><p class="a4-ask">Quelle est la réponse ?</p>`;
    return pageHtml(title, `<section class="a4-sec front" style="--fc:${c.color}"><h2 class="a4-band">${fiche ? inline(card.front) : 'Question'}</h2>${body}</section>`);
  }
  if (!fiche && !card.back.includes('\n'))
    return pageHtml(title, `<section class="a4-sec" style="--fc:${c.color}"><h2 class="a4-band">Question</h2><p class="a4-question">${inline(card.front)}</p>
      <h2 class="a4-band">Réponse</h2><div class="a4-body md a4-answer">${md(card.back)}</div>${c.trap ? `<p class="a4-trap"><b>⚠️ Piège :</b> ${inline(c.trap)}</p>` : ''}</section>`);
  return pageHtml(title, sectionHtml(c, 0));
}

/**
 * Ajuste police + colonnes pour que le contenu tienne sur une page A4.
 * À appeler une fois la page insérée dans le document.
 */
export function layoutA4(page, { maxCols = 3, maxFont = 19, minFont = 8.5 } = {}) {
  const inner = page.querySelector('.a4-inner');
  const cols = page.querySelector('.a4-cols');
  page.style.zoom = '1';
  page.style.height = 'auto';
  const fits = () => inner.scrollHeight <= A4_H;
  let best = { font: 0, cols: maxCols };
  for (let n = 1; n <= maxCols; n++) {
    cols.style.columnCount = String(n);
    let lo = minFont;
    let hi = maxFont;
    inner.style.fontSize = `${lo}px`;
    if (!fits()) continue;
    for (let i = 0; i < 7; i++) {
      const mid = (lo + hi) / 2;
      inner.style.fontSize = `${mid}px`;
      if (fits()) lo = mid;
      else hi = mid;
    }
    // à taille égale, on préfère moins de colonnes (plus lisible)
    if (lo > best.font + 0.6) best = { font: lo, cols: n };
  }
  if (!best.font) best = { font: minFont, cols: maxCols }; // trop long : la page s'allonge
  cols.style.columnCount = String(best.cols);
  inner.style.fontSize = `${best.font.toFixed(2)}px`;
  const h = fits() ? A4_H : inner.scrollHeight;
  page.style.height = `${h}px`;
  page.dataset.h = String(h);
  return best;
}

/**
 * Réduit la page pour qu'elle tienne dans son conteneur.
 * mode 'page'  : toute la page visible (largeur ET hauteur)
 * mode 'width' : la page occupe toute la largeur (on fait défiler)
 */
export function fitA4(page, stage, mode = 'page') {
  const cs = getComputedStyle(stage);
  const w = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const h = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const ph = Number(page.dataset.h) || A4_H;
  let z = w / A4_W;
  if (mode === 'page' && h > 0) z = Math.min(z, h / ph);
  page.style.zoom = String(Math.max(0.2, z));
  return z;
}

/** Insère une page dans `stage`, la met en page et la garde ajustée (rotation, redimensionnement). */
export function mountA4(stage, html, { mode = 'page', maxCols = 3, maxFont = 19 } = {}) {
  stage.innerHTML = html;
  const page = stage.querySelector('.a4');
  const state = { mode };
  layoutA4(page, { maxCols, maxFont });
  const refit = () => fitA4(page, stage, state.mode);
  refit();
  const ro = new ResizeObserver(refit);
  ro.observe(stage);
  return {
    page,
    setMode(m) {
      state.mode = m;
      refit();
    },
    get mode() {
      return state.mode;
    },
    destroy: () => ro.disconnect(),
  };
}
