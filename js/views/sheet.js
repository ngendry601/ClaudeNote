// « Fiche complète » : tout un paquet sur une seule page, mis en page comme une fiche de révision
// papier (titre, bandeaux numérotés colorés, texte dense sur 3 colonnes).
// Deux modes : « Page » (la feuille entière, zoomable, comme un PDF) et « Lecture » (texte adapté à l'écran).
import { getDeck, getCourse, cardsOf } from '../store.js';
import { esc, icon } from '../ui.js';
import { md, inline, isFiche } from '../md.js';
import { cardColor } from '../cardview.js';

const PAGE_WIDTH = 1120; // largeur de la feuille en mode « Page » (px)
const MODE_KEY = 'cn-sheet-mode';

function sheetHtml(deck, cards) {
  const fiches = cards.filter((c) => isFiche(c.back));
  const simples = cards.filter((c) => !isFiche(c.back));
  let n = 0;
  const blocks = fiches.map((c) => {
    n++;
    return `<section class="sh-sec" style="--fc:${cardColor(c)}">
      <h2 class="sh-band">${n}. ${inline(c.front)}</h2>
      <div class="sh-body md">${md(c.back)}</div>
      ${c.trap ? `<p class="sh-trap"><b>⚠️ Piège :</b> ${inline(c.trap)}</p>` : ''}
    </section>`;
  });
  if (simples.length) {
    n++;
    blocks.push(`<section class="sh-sec" style="--fc:${cardColor(simples[0])}">
      <h2 class="sh-band">${n}. ${fiches.length ? 'À savoir aussi' : 'Questions — réponses'}</h2>
      <div class="sh-body md"><ul>${simples.map((c) => `<li><strong>${inline(c.front)}</strong> : ${inline(c.back.replace(/\n+/g, ' '))}</li>`).join('')}</ul></div>
    </section>`);
  }
  return `<article class="sheet">
    <h1 class="sh-title">${esc(deck.name)} — fiche de révision synthétique</h1>
    ${blocks.join('')}
  </article>`;
}

export default function sheetView(el, { params: [deckId] }) {
  const deck = getDeck(deckId);
  const cards = deck ? cardsOf(deck.id) : [];
  if (!deck || !cards.length) {
    el.innerHTML = `<div class="empty"><h3>Aucune fiche dans ce paquet</h3><a class="btn" href="#/flashcards">Flashcards</a></div>`;
    return;
  }
  let mode = localStorage.getItem(MODE_KEY) || 'page';
  const course = deck.courseId ? getCourse(deck.courseId) : null;
  const back = () => (history.length > 1 ? history.back() : (location.hash = '#/flashcards'));

  el.innerHTML = `
    <div class="sheet-view">
      <div class="ff-bar no-print">
        <button class="ff-btn" data-act="close" title="Fermer (Échap)">${icon('x', 20)}</button>
        <span class="ff-title">${esc(deck.name)}</span>
        <div class="seg">${[['page', 'Page'], ['read', 'Lecture']].map(([k, l]) => `<button class="${mode === k ? 'on' : ''}" data-mode="${k}">${l}</button>`).join('')}</div>
        <button class="ff-btn" data-act="print" title="Imprimer / enregistrer en PDF">🖨️</button>
      </div>
      <div class="sheet-wrap mode-${mode}" data-wrap>${sheetHtml(deck, cards)}</div>
      ${course ? `<p class="sheet-foot no-print"><a href="#/cours/${course.id}">Modifier le cours</a></p>` : ''}
    </div>`;

  const wrap = el.querySelector('[data-wrap]');
  const sheet = wrap.querySelector('.sheet');
  // Mode « Page » : la feuille garde sa largeur et sa mise en page, réduite pour tenir dans l'écran
  // (comme un PDF). On peut zoomer avec deux doigts.
  const fit = () => {
    if (mode !== 'page') {
      sheet.style.zoom = '';
      return;
    }
    const avail = wrap.clientWidth - 16;
    sheet.style.zoom = String(Math.min(1, avail / PAGE_WIDTH));
  };
  fit();
  window.addEventListener('resize', fit);

  el.onclick = (e) => {
    const m = e.target.closest('[data-mode]');
    if (m) {
      mode = m.dataset.mode;
      localStorage.setItem(MODE_KEY, mode);
      wrap.className = `sheet-wrap mode-${mode}`;
      el.querySelectorAll('[data-mode]').forEach((b) => b.classList.toggle('on', b === m));
      fit();
      return;
    }
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'close') back();
    if (a === 'print') window.print();
  };
  const onKey = (e) => e.key === 'Escape' && back();
  document.addEventListener('keydown', onKey);
  return () => {
    window.removeEventListener('resize', fit);
    document.removeEventListener('keydown', onKey);
  };
}
