import { state, save, getDeck, cardsOf, isDue, logReview, dayKey } from '../store.js';
import { esc, icon } from '../ui.js';
import { md } from '../md.js';
import { schedule, intervalLabel, GRADES, shuffle } from '../srs.js';

export default function review(el, { params: [id], query }) {
  const libre = query.get('libre') === '1';
  const deck = id === 'all' ? null : getDeck(id);
  const pool = id === 'all' ? state.cards : deck ? cardsOf(deck.id) : [];
  const now = Date.now();
  let queue = libre ? shuffle(pool) : pool.filter((c) => isDue(c, now)).sort((a, b) => a.due - b.due);
  const total = queue.length;
  let idx = 0;
  let flipped = false;
  const stats = [0, 0, 0, 0];
  const backHref = deck ? `#/flashcards/${deck.id}` : '#/flashcards';
  const title = deck ? deck.name : 'Toutes les cartes';

  function draw() {
    if (!queue.length) {
      el.innerHTML = `<div class="empty">${icon('check', 40)}<h3>Rien à réviser 🎉</h3><p>Toutes les cartes de « ${esc(title)} » sont à jour.</p>
        <div class="head-actions">${pool.length ? `<a class="btn" href="#/reviser/${id}?libre=1">Entraînement libre</a>` : ''}<a class="btn primary" href="${backHref}">Retour</a></div></div>`;
      return;
    }
    if (idx >= queue.length) {
      const done = stats.reduce((a, b) => a + b, 0);
      const ok = stats[2] + stats[3];
      el.innerHTML = `<div class="review-done panel">
        <div class="big-emoji">${ok / done > 0.8 ? '🏆' : ok / done > 0.5 ? '💪' : '📚'}</div>
        <h2>Session terminée !</h2><p class="muted">${done} réponse${done > 1 ? 's' : ''} · ${total} carte${total > 1 ? 's' : ''}${libre ? ' · mode libre (planning inchangé)' : ''}</p>
        <div class="grade-stats">${GRADES.map((g) => `<div class="${g.cls}"><b>${stats[g.g]}</b><span>${g.label}</span></div>`).join('')}</div>
        <p>Aujourd'hui : <b>${state.reviewLog[dayKey()] || 0}</b> / ${state.settings.dailyGoal} cartes</p>
        <div class="head-actions"><a class="btn" href="#/">Accueil</a><a class="btn primary" href="${backHref}">Terminer</a></div></div>`;
      return;
    }
    const card = queue[idx];
    const d = state.decks.find((x) => x.id === card.deckId);
    el.innerHTML = `
      <div class="review-top"><a href="${backHref}" class="back-link">${icon('x', 16)} Quitter</a>
        <span class="muted">${esc(title)}${libre ? ' · <b>mode libre</b>' : ''}</span><span class="muted">${Math.min(idx + 1, queue.length)} / ${queue.length}</span></div>
      <div class="progress"><i style="width:${(idx / queue.length) * 100}%"></i></div>
      <div class="flash ${flipped ? 'flipped' : ''}" data-flip tabindex="0">
        ${id === 'all' && d ? `<span class="flash-deck">${esc(d.name)}</span>` : ''}
        <div class="flash-front md">${md(card.front)}</div>
        ${flipped ? `<hr><div class="flash-back md">${md(card.back)}</div>` : `<p class="muted flash-hint">Clique ou appuie sur <kbd>Espace</kbd> pour voir la réponse</p>`}
      </div>
      <div class="grades">${
        flipped
          ? GRADES.map((g) => `<button class="grade ${g.cls}" data-g="${g.g}"><b>${g.label}</b><small>${libre ? '' : intervalLabel(card, g.g)}</small><kbd>${g.key}</kbd></button>`).join('')
          : `<button class="btn primary lg" data-flip>Afficher la réponse <kbd>Espace</kbd></button>`
      }</div>`;
  }

  function grade(g) {
    const card = queue[idx];
    stats[g]++;
    if (!libre) {
      Object.assign(card, schedule(card, g));
      logReview();
      save();
    }
    if (g === 0) queue.push(card); // on la revoit en fin de session
    idx++;
    flipped = false;
    draw();
  }

  draw();
  el.onclick = (e) => {
    const g = e.target.closest('[data-g]');
    if (g) return grade(+g.dataset.g);
    if (e.target.closest('[data-flip]') && !flipped && !e.target.closest('a')) {
      flipped = true;
      draw();
    }
  };
  const onKey = (e) => {
    if (e.target.matches('input, textarea') || idx >= queue.length) return;
    if ((e.key === ' ' || e.key === 'Enter') && !flipped) {
      e.preventDefault();
      flipped = true;
      draw();
    } else if (flipped && ['1', '2', '3', '4'].includes(e.key)) grade(+e.key - 1);
    else if (flipped && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      grade(2);
    }
  };
  document.addEventListener('keydown', onKey);
  return () => document.removeEventListener('keydown', onKey);
}
