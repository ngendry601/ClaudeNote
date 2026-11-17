// Rendu d'une flashcard façon « fiche de révision » : bandeau coloré, sous-titres de couleur,
// mots-clés en gras, l'essentiel surligné, encadré piège.
import { state, getDeck, getSubject } from './store.js';
import { esc } from './ui.js';
import { md, inline, sectionColor, isFiche, ficheTopics } from './md.js';

export function cardColor(card) {
  if (card.color) return card.color;
  if (card.section) return sectionColor(card.section);
  const deck = getDeck(card.deckId);
  return getSubject(deck?.subjectId)?.color || sectionColor(card.front);
}

export function cardHead(card) {
  const parts = [card.section, card.sub].filter(Boolean);
  if (parts.length) return parts.join(' · ');
  return getDeck(card.deckId)?.name || '';
}

const trapHtml = (card) => (card.trap ? `<div class="fc-trap"><b>⚠️ Piège</b> ${inline(card.trap)}</div>` : '');

/**
 * @param opts.flipped  afficher le verso
 * @param opts.hint     texte affiché quand la carte n'est pas retournée
 * @param opts.corner   texte en haut à droite du bandeau
 */
export function cardFace(card, { flipped = true, hint = '', corner = '' } = {}) {
  const color = cardColor(card);
  // Carte « fiche » : le titre est dans le bandeau, le recto liste ce qu'il faut réciter
  if (isFiche(card.back)) {
    const deckName = getDeck(card.deckId)?.name || '';
    return `<div class="fc fiche-card ${flipped ? 'is-flipped' : ''}" style="--fc:${color}">
      <div class="fc-head fiche-head"><span>${inline(card.front)}</span><small>${esc(corner || deckName)}</small></div>
      <div class="fc-body">
        ${
          flipped
            ? `<div class="fiche-body md">${md(card.back)}</div>${trapHtml(card)}`
            : `<p class="fc-recite">Récite tout ce que tu sais sur :</p>
               <ul class="fc-topics">${ficheTopics(card.back).map((t) => `<li>${inline(t)}</li>`).join('')}</ul>
               ${hint ? `<p class="fc-hint">${hint}</p>` : ''}`
        }
      </div></div>`;
  }
  return `<div class="fc ${flipped ? 'is-flipped' : ''}" style="--fc:${color}">
    <div class="fc-head"><span>${esc(cardHead(card))}</span>${corner ? `<small>${esc(corner)}</small>` : ''}</div>
    <div class="fc-body">
      <div class="fc-q">${inline(card.front)}</div>
      ${flipped ? `<div class="fc-a md">${md(card.back)}</div>${trapHtml(card)}` : hint ? `<p class="fc-hint">${hint}</p>` : ''}
    </div></div>`;
}

export const allSections = () => [...new Set(state.cards.map((c) => c.section).filter(Boolean))];
