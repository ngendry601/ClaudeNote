// Rendu d'une flashcard façon « fiche de révision » : bandeau coloré, mots-clés en gras, surlignage, encadré piège
import { state, getDeck, getSubject } from './store.js';
import { esc } from './ui.js';
import { md, inline, sectionColor } from './md.js';

export function cardColor(card) {
  if (card.color) return card.color;
  if (card.section) return sectionColor(card.section);
  const deck = getDeck(card.deckId);
  return getSubject(deck?.subjectId)?.color || '#4338ca';
}

export function cardHead(card) {
  const parts = [card.section, card.sub].filter(Boolean);
  if (parts.length) return parts.join(' · ');
  return getDeck(card.deckId)?.name || '';
}

/**
 * @param card
 * @param opts.flipped  afficher le verso
 * @param opts.hint     texte affiché quand la carte n'est pas retournée
 * @param opts.corner   texte en haut à droite du bandeau
 */
export function cardFace(card, { flipped = true, hint = '', corner = '' } = {}) {
  return `<div class="fc ${flipped ? 'is-flipped' : ''}" style="--fc:${cardColor(card)}">
    <div class="fc-head"><span>${esc(cardHead(card))}</span>${corner ? `<small>${esc(corner)}</small>` : ''}</div>
    <div class="fc-body">
      <div class="fc-q">${inline(card.front)}</div>
      ${
        flipped
          ? `<div class="fc-a md">${md(card.back)}</div>${card.trap ? `<div class="fc-trap"><b>⚠️ Piège</b> ${inline(card.trap)}</div>` : ''}`
          : hint
            ? `<p class="fc-hint">${hint}</p>`
            : ''
      }
    </div></div>`;
}

export const allSections = () => [...new Set(state.cards.map((c) => c.section).filter(Boolean))];
