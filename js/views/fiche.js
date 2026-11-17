// Aperçu plein écran d'une fiche, mis en page comme une fiche de révision papier.
// Lien : #/fiche/<id de la carte>   ·   #/fiche/<id>?all=1 : tout le paquet sur une seule page
import { state, getDeck, cardsOf } from '../store.js';
import { esc, icon } from '../ui.js';
import { cardFace } from '../cardview.js';

export const ficheHref = (cardId) => `#/fiche/${cardId}`;

/** Même affichage, par-dessus l'écran courant (pour ne pas quitter une révision ou un quiz) */
export function ficheOverlay(card) {
  const box = document.createElement('div');
  box.className = 'ff-overlay';
  box.innerHTML = `<div class="fiche-full"><div class="ff-bar"><button class="ff-btn" data-x title="Fermer (Échap)">${icon('x', 20)}</button>
    <span class="ff-title">${esc(getDeck(card.deckId)?.name || '')}</span></div><div class="ff-page">${cardFace(card)}</div></div>`;
  const close = () => {
    box.remove();
    document.removeEventListener('keydown', onKey, true);
  };
  const onKey = (e) => {
    e.stopPropagation(); // les raccourcis de la révision restent bloqués tant que la fiche est ouverte
    if (e.key === 'Escape') close();
  };
  box.querySelector('[data-x]').onclick = close;
  document.addEventListener('keydown', onKey, true);
  document.body.append(box);
}

export default function ficheView(el, { params: [id], query }) {
  const card = state.cards.find((c) => c.id === id);
  if (!card) {
    el.innerHTML = `<div class="empty"><h3>Fiche introuvable</h3><a class="btn" href="#/flashcards">Flashcards</a></div>`;
    return;
  }
  const deck = getDeck(card.deckId);
  const list = cardsOf(card.deckId);
  const all = query.get('all') === '1';
  const idx = list.findIndex((c) => c.id === id);
  const prev = list[idx - 1];
  const next = list[idx + 1];
  const back = () => (history.length > 1 ? history.back() : (location.hash = deck ? `#/flashcards/${deck.id}` : '#/flashcards'));

  el.innerHTML = `
    <div class="fiche-full ${all ? 'all' : ''}">
      <div class="ff-bar">
        <button class="ff-btn" data-act="close" title="Fermer (Échap)">${icon('x', 20)}</button>
        <span class="ff-title">${esc(deck?.name || '')}${all ? '' : ` · ${idx + 1}/${list.length}`}</span>
        ${all ? '' : `<button class="ff-btn" ${prev ? `data-go="${prev.id}"` : 'disabled'} title="Fiche précédente (←)">‹</button><button class="ff-btn" ${next ? `data-go="${next.id}"` : 'disabled'} title="Fiche suivante (→)">›</button>`}
        <a class="ff-btn wide" href="#/feuille/${card.deckId}">Fiche complète</a>
        ${document.fullscreenEnabled ? `<button class="ff-btn" data-act="fs" title="Plein écran">⛶</button>` : ''}
      </div>
      <div class="ff-page">${(all ? list : [card]).map((c) => cardFace(c)).join('')}</div>
    </div>`;

  el.onclick = (e) => {
    const g = e.target.closest('[data-go]');
    if (g) return location.replace(`#/fiche/${g.dataset.go}`);
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'close') back();
    if (a === 'fs') (document.fullscreenElement ? document.exitFullscreen() : el.querySelector('.fiche-full').requestFullscreen()).catch(() => {});
  };
  const go = (c) => c && location.replace(`#/fiche/${c.id}`);
  const onKey = (e) => {
    if (e.key === 'Escape' && !document.fullscreenElement) back();
    if (all) return;
    if (e.key === 'ArrowLeft') go(prev);
    if (e.key === 'ArrowRight') go(next);
  };
  // glisser à gauche / à droite pour changer de fiche
  let x0 = null;
  const onStart = (e) => (x0 = e.touches[0].clientX);
  const onEnd = (e) => {
    if (x0 === null || all) return;
    const dx = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 70) go(dx < 0 ? next : prev);
  };
  document.addEventListener('keydown', onKey);
  el.addEventListener('touchstart', onStart, { passive: true });
  el.addEventListener('touchend', onEnd);
  return () => {
    document.removeEventListener('keydown', onKey);
    el.removeEventListener('touchstart', onStart);
    el.removeEventListener('touchend', onEnd);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  };
}
