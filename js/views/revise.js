// Onglet « Réviser » : tout ce qui sert à s'entraîner, cours par cours (flashcards + quiz).
import { state, isDue, getSubject, deckForCourse } from '../store.js';
import { esc } from '../ui.js';
import { courseCards, courseDue } from '../library.js';

export default function reviseView(el) {
  const due = state.cards.filter((c) => isDue(c)).length;
  const courses = state.courses
    .filter((c) => courseCards(c).length)
    .sort((a, b) => courseDue(b) - courseDue(a) || b.updatedAt - a.updatedAt);
  const last = state.quizLog.at(-1);
  el.innerHTML = `
    <div class="page-head"><h1>Réviser</h1></div>
    <a class="hero ${due ? '' : 'done'}" href="${due ? '#/reviser/all' : '#/quiz'}">
      <div class="hero-ic">${due ? '📚' : '✅'}</div>
      <div class="hero-txt"><b>${due ? `Réviser tout (${due} fiche${due > 1 ? 's' : ''})` : 'Tout est à jour'}</b>
        <span>${due ? 'Les fiches de tous tes cours qui sont dues aujourd\'hui' : 'Lance un quiz pour t\'entraîner'}</span></div>
    </a>
    <a class="quick-wide" href="#/quiz"><span>❓</span><div><b>Quiz</b><small>${last ? `Dernier score : ${last.score}/${last.total}` : 'QCM, vrai/faux, réponses écrites'}</small></div></a>

    <section class="block"><div class="block-head"><h2>Par cours</h2></div>
      ${
        courses.length
          ? `<div class="revise-list">${courses
              .map((c) => {
                const d = courseDue(c);
                const n = courseCards(c).length;
                const deck = deckForCourse(c.id);
                const sub = getSubject(c.subjectId);
                return `<div class="revise-row" style="--c:${sub?.color || '#94a3b8'}">
                  <a class="rr-info" href="#/cours/${c.id}"><b>${esc(c.title)}</b><small>${esc(sub?.name || 'Sans matière')} · ${n} fiche${n > 1 ? 's' : ''}${d ? ` · <span class="due-txt">${d} à réviser</span>` : ' · à jour'}</small></a>
                  <a class="btn sm ${d ? 'primary' : ''}" href="#/reviser/${deck.id}${d ? '' : '?libre=1'}">▶ Fiches</a>
                  <a class="btn sm" href="#/quiz?scope=d:${deck.id}">❓ Quiz</a></div>`;
              })
              .join('')}</div>`
          : `<p class="empty-txt">Aucun cours avec des flashcards. <a href="#/cours?ajouter=1">Ajoute un cours</a>.</p>`
      }
    </section>`;
}
