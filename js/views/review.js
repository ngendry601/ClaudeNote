// Révision : chaque flashcard s'affiche comme une page A4 qui tient entièrement dans l'écran.
import { state, save, getDeck, cardsOf, isDue, logReview, dayKey } from '../store.js';
import { esc, icon, $ } from '../ui.js';
import { schedule, intervalLabel, GRADES, shuffle } from '../srs.js';
import { cardPageHtml, mountA4 } from '../a4.js';
import { cardColor } from '../cardview.js';

export default function review(el, { params: [id], query }) {
  const libre = query.get('libre') === '1';
  const deck = id === 'all' ? null : getDeck(id);
  const pool = id === 'all' ? state.cards : deck ? cardsOf(deck.id) : [];
  const now = Date.now();
  const queue = libre ? shuffle(pool) : pool.filter((c) => isDue(c, now)).sort((a, b) => a.due - b.due);
  const total = queue.length;
  let idx = 0;
  let flipped = false;
  let zoom = 'page';
  let a4 = null;
  const stats = [0, 0, 0, 0];
  const exitHref = deck?.courseId ? `#/cours/${deck.courseId}` : '#/reviser';
  const title = deck ? deck.name : 'Toutes mes fiches';

  function done(html) {
    a4?.destroy();
    a4 = null;
    el.innerHTML = `<div class="review-screen"><div class="review-done">${html}</div></div>`;
  }

  function draw() {
    if (!queue.length) {
      return done(`<div class="big-emoji">🎉</div><h2>Rien à réviser</h2><p class="muted">Toutes les fiches de « ${esc(title)} » sont à jour.</p>
        <div class="stack">${pool.length ? `<a class="btn primary lg" href="#/reviser/${id}?libre=1">Réviser quand même</a>` : ''}
        <a class="btn lg" href="#/quiz${deck ? `?scope=d:${deck.id}` : ''}">❓ Faire un quiz</a><a class="btn ghost" href="${exitHref}">Retour</a></div>`);
    }
    if (idx >= queue.length) {
      const n = stats.reduce((a, b) => a + b, 0);
      const ok = stats[2] + stats[3];
      return done(`<div class="big-emoji">${ok / n > 0.8 ? '🏆' : ok / n > 0.5 ? '💪' : '📚'}</div>
        <h2>Session terminée !</h2><p class="muted">${total} fiche${total > 1 ? 's' : ''} révisée${total > 1 ? 's' : ''}${libre ? ' (mode libre : le planning ne change pas)' : ''}</p>
        <div class="grade-stats">${GRADES.map((g) => `<div class="${g.cls}"><b>${stats[g.g]}</b><span>${g.label}</span></div>`).join('')}</div>
        <p>Aujourd'hui : <b>${state.reviewLog[dayKey()] || 0}</b> / ${state.settings.dailyGoal}</p>
        <div class="stack"><a class="btn primary lg" href="#/quiz${deck ? `?scope=d:${deck.id}` : ''}">❓ Enchaîner avec un quiz</a><a class="btn ghost" href="${exitHref}">Terminer</a></div>`);
    }
    const card = queue[idx];
    const d = state.decks.find((x) => x.id === card.deckId);
    el.innerHTML = `
      <div class="review-screen">
        <div class="review-bar">
          <a href="${exitHref}" class="ff-btn" title="Quitter">${icon('x', 20)}</a>
          <div class="review-prog"><span>${esc(d?.name || title)}${libre ? ' · libre' : ''}</span><div class="progress"><i style="width:${(idx / queue.length) * 100}%"></i></div></div>
          <span class="review-count">${idx + 1}/${queue.length}</span>
        </div>
        <div class="a4-stage review-stage ${zoom === 'width' ? 'scroll' : ''}" data-stage></div>
        <div class="review-actions">${
          flipped
            ? `<div class="grades">${GRADES.map((g) => `<button class="grade ${g.cls}" data-g="${g.g}"><b>${g.label}</b><small>${libre ? '' : intervalLabel(card, g.g)}</small></button>`).join('')}</div>
               <button class="link-btn zoom-btn" data-zoom>${zoom === 'page' ? '🔍 Agrandir le texte' : '📄 Voir la page entière'}</button>`
            : `<button class="btn primary lg block" data-flip>Voir la réponse</button>`
        }</div>
      </div>`;
    a4?.destroy();
    a4 = mountA4($('[data-stage]', el), cardPageHtml(card, { flipped, title: d?.name || '', color: cardColor(card) }), { mode: zoom, maxCols: 2, maxFont: 30 });
  }

  function grade(g) {
    const card = queue[idx];
    stats[g]++;
    if (!libre) {
      Object.assign(card, schedule(card, g));
      logReview();
      save();
    }
    if (g === 0) queue.push(card); // revue en fin de session
    idx++;
    flipped = false;
    zoom = 'page';
    draw();
  }
  const flip = () => {
    flipped = true;
    draw();
  };
  const toggleZoom = () => {
    zoom = zoom === 'page' ? 'width' : 'page';
    draw();
  };

  draw();
  el.onclick = (e) => {
    const g = e.target.closest('[data-g]');
    if (g) return grade(+g.dataset.g);
    if (e.target.closest('[data-flip]')) return flip();
    if (e.target.closest('[data-zoom]')) return toggleZoom();
    if (e.target.closest('.a4')) return flipped ? toggleZoom() : flip();
  };
  const onKey = (e) => {
    if (e.target.matches('input, textarea') || idx >= queue.length || !queue.length) return;
    if ((e.key === ' ' || e.key === 'Enter') && !flipped) {
      e.preventDefault();
      flip();
    } else if (flipped && ['1', '2', '3', '4'].includes(e.key)) grade(+e.key - 1);
  };
  document.addEventListener('keydown', onKey);
  return () => {
    a4?.destroy();
    document.removeEventListener('keydown', onKey);
  };
}
