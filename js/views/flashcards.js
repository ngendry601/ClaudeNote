// Onglet « Flashcards » : le cours synthétisé, une notion par carte (tableaux, schémas), révision espacée.
import { state, save, getCourse, cardsOf, isDue, dueCards, logReview, newCard, subjectColor, dayKey } from '../store.js';
import { esc, icon, confirmBox, openModal, toast, $ } from '../ui.js';
import { md, inline } from '../md.js';
import { schedule, intervalLabel, GRADES, mastery, shuffle } from '../srs.js';
import { studyModal } from './create.js';

const masteryPct = (cards) => (cards.length ? Math.round((cards.filter((c) => mastery(c) === 2).length / cards.length) * 100) : 0);

/* ---------- Liste des paquets (un par cours) ---------- */
export function flashcardsHome(el) {
  const due = dueCards().length;
  const withCards = state.courses.filter((c) => cardsOf(c.id).length);
  const without = state.courses.filter((c) => !cardsOf(c.id).length);
  el.innerHTML = `
    <header class="page-head"><h1>Flashcards</h1></header>
    ${
      withCards.length
        ? `<a class="hero ${due ? '' : 'done'}" href="${due ? '#/flashcards/tout/revoir' : '#/quiz'}">
            <span class="hero-ic">${due ? '🃏' : '✅'}</span>
            <div><b>${due ? `${due} carte${due > 1 ? 's' : ''} à revoir` : 'Tout est à jour'}</b><small>${due ? 'Tous cours confondus · appuie pour commencer' : 'Bravo ! Entraîne-toi avec un quiz'}</small></div>
            <span class="hero-go">${icon('play', 20)}</span></a>`
        : ''
    }
    ${
      withCards.length
        ? `<div class="decks">${withCards
            .map((c) => {
              const cards = cardsOf(c.id);
              const d = cards.filter((x) => isDue(x)).length;
              const pct = masteryPct(cards);
              return `<div class="deck" style="--c:${subjectColor(c.subject)}">
                <a class="deck-main" href="#/flashcards/${c.id}"><span class="tag">${esc(c.subject || 'Sans matière')}</span><b>${esc(c.title)}</b>
                  <small>${cards.length} cartes · ${d ? `<span class="due-txt">${d} à revoir</span>` : 'à jour'} · ${pct} % maîtrisées</small>
                  <span class="bar"><i style="width:${pct}%"></i></span></a>
                <div class="deck-btns"><a class="btn ${d ? 'primary' : ''}" href="#/flashcards/${c.id}/revoir${d ? '' : '?libre=1'}">${d ? 'Réviser' : 'Revoir'}</a>
                  <a class="btn ghost" href="#/flashcards/${c.id}/parcourir">Parcourir</a></div></div>`;
            })
            .join('')}</div>`
        : `<div class="empty">${icon('cards', 44)}<h3>Pas encore de flashcards</h3><p>Ajoute un cours : Claude en tire des flashcards claires, avec tableaux et schémas.</p><a class="btn primary" href="#/cours?ajouter=1">${icon('plus')} Ajouter un cours</a></div>`
    }
    ${
      without.length && withCards.length
        ? `<section class="group"><h2 class="group-title">Cours sans flashcards</h2>${without
            .map((c) => `<button class="row-card" data-study="${c.id}"><div class="rc-main"><b>${esc(c.title)}</b><small>✨ Créer les flashcards et le quiz</small></div></button>`)
            .join('')}</section>`
        : ''
    }`;
  el.onclick = (e) => {
    const s = e.target.closest('[data-study]');
    if (s) studyModal(s.dataset.study);
  };
}

/* ---------- Un paquet : ses cartes ---------- */
function cardEditor(card, courseId, onDone) {
  openModal(
    `<form class="form"><h3>${card ? 'Modifier la carte' : 'Nouvelle carte'}</h3>
      <label class="field"><span>Question (recto)</span><textarea name="front" rows="2" required>${esc(card?.front || '')}</textarea></label>
      <label class="field"><span>Réponse (verso) — tableaux, **gras**, ==surligné==, schémas \`\`\`flux</span><textarea name="back" rows="9" required>${esc(card?.back || '')}</textarea></label>
      <div class="modal-actions">${card ? '<button type="button" class="btn ghost danger-txt" data-del>Supprimer</button>' : ''}<span class="spacer"></span>
        <button type="button" class="btn ghost" data-close>Annuler</button><button class="btn primary">Enregistrer</button></div></form>`,
    {
      wide: true,
      onMount: (m, close) => {
        $('form', m).onsubmit = (e) => {
          e.preventDefault();
          const f = new FormData(e.target);
          if (card) Object.assign(card, { front: f.get('front').trim(), back: f.get('back').trim() });
          else state.cards.push(newCard(courseId, f.get('front').trim(), f.get('back').trim()));
          save();
          close();
          onDone();
        };
        const del = $('[data-del]', m);
        if (del)
          del.onclick = async () => {
            if (!(await confirmBox('Supprimer cette carte ?', { danger: true, ok: 'Supprimer' }))) return;
            state.cards = state.cards.filter((c) => c.id !== card.id);
            save();
            close();
            onDone();
          };
      },
    },
  );
}

export function deckView(el, { params: [id] }) {
  const course = getCourse(id);
  if (!course) return (el.innerHTML = `<div class="empty"><h3>Cours introuvable</h3><a class="btn" href="#/flashcards">Flashcards</a></div>`);
  function draw() {
    const cards = cardsOf(id);
    const d = cards.filter((c) => isDue(c)).length;
    el.innerHTML = `
      <div class="topline"><a href="#/flashcards" class="back">${icon('back', 18)} Flashcards</a><a class="link-btn" href="#/cours/${id}">Voir le cours</a></div>
      <h1 class="doc-title">${esc(course.title)}</h1>
      <p class="doc-meta">${cards.length} cartes · ${d} à revoir · ${masteryPct(cards)} % maîtrisées</p>
      <div class="btn-row">
        <a class="btn primary lg" href="#/flashcards/${id}/revoir${d ? '' : '?libre=1'}">${d ? `▶ Réviser (${d})` : '▶ Revoir tout'}</a>
        <a class="btn lg" href="#/flashcards/${id}/parcourir">📖 Parcourir</a>
      </div>
      <div class="card-grid">${cards
        .map(
          (c, i) => `<button class="mini-card m${mastery(c)}" data-open="${c.id}" style="--c:${subjectColor(course.subject)}">
            <span class="mc-n">${i + 1}</span><b>${inline(c.front)}</b><small>${['Nouvelle', 'En cours', 'Maîtrisée'][mastery(c)]}</small></button>`,
        )
        .join('')}
        <button class="mini-card add" data-add>${icon('plus', 22)}<b>Ajouter une carte</b></button></div>`;
  }
  draw();
  el.onclick = (e) => {
    if (e.target.closest('[data-add]')) return cardEditor(null, id, draw);
    const o = e.target.closest('[data-open]');
    if (!o) return;
    const card = state.cards.find((c) => c.id === o.dataset.open);
    openModal(`${cardHtml(card, course, true)}<div class="modal-actions"><button class="btn ghost" data-edit>Modifier</button><button class="btn primary" data-close>Fermer</button></div>`, {
      wide: true,
      onMount: (m, close) => ($('[data-edit]', m).onclick = () => (close(), cardEditor(card, id, draw))),
    });
  };
}

/* ---------- Rendu d'une carte ---------- */
function cardHtml(card, course, flipped) {
  return `<div class="flash ${flipped ? 'flipped' : ''}" style="--c:${subjectColor(course?.subject)}">
    <div class="flash-top"><span>${esc(course?.title || '')}</span></div>
    ${
      flipped
        ? `<div class="flash-back"><h2 class="flash-q-small">${inline(card.front)}</h2><div class="flash-content prose">${md(card.back)}</div></div>`
        : `<div class="flash-front"><p class="flash-q">${inline(card.front)}</p><p class="flash-hint">Réfléchis à la réponse, puis touche la carte</p></div>`
    }</div>`;
}

/* ---------- Révision (répétition espacée) ---------- */
export function reviewView(el, { params: [id], query }) {
  const libre = query.get('libre') === '1';
  const all = id === 'tout';
  const course = all ? null : getCourse(id);
  const pool = all ? state.cards : cardsOf(id);
  const now = Date.now();
  // ordre du cours pour une première découverte, sinon les plus en retard d'abord
  const queue = libre ? shuffle(pool) : pool.filter((c) => isDue(c, now)).sort((a, b) => (a.reps === 0 && b.reps === 0 ? 0 : a.due - b.due));
  const total = queue.length;
  const back = course ? `#/flashcards/${id}` : '#/flashcards';
  let i = 0;
  let flipped = false;
  const stats = { 0: 0, 2: 0, 3: 0 };

  function draw() {
    if (!queue.length) {
      el.innerHTML = `<div class="immersive"><div class="end"><div class="big">🎉</div><h2>Rien à revoir</h2><p class="muted">Toutes les cartes sont à jour.</p>
        <div class="stack">${pool.length ? `<a class="btn primary lg" href="#/flashcards/${id}/revoir?libre=1">Revoir quand même</a>` : ''}<a class="btn lg" href="${course ? `#/quiz/${id}` : '#/quiz'}">❓ Faire un quiz</a><a class="btn ghost" href="${back}">Retour</a></div></div></div>`;
      return;
    }
    if (i >= queue.length) {
      el.innerHTML = `<div class="immersive"><div class="end"><div class="big">${stats[0] === 0 ? '🏆' : '💪'}</div><h2>Session terminée</h2>
        <p class="muted">${total} carte${total > 1 ? 's' : ''} revue${total > 1 ? 's' : ''}${libre ? ' (mode libre : le planning ne change pas)' : ''}</p>
        <div class="tally"><div class="again"><b>${stats[0]}</b><span>À revoir</span></div><div class="good"><b>${stats[2]}</b><span>Bien</span></div><div class="easy"><b>${stats[3]}</b><span>Facile</span></div></div>
        <p>Aujourd'hui : <b>${state.reviewLog[dayKey()] || 0}</b> carte${(state.reviewLog[dayKey()] || 0) > 1 ? 's' : ''}</p>
        <div class="stack"><a class="btn primary lg" href="${course ? `#/quiz/${id}` : '#/quiz'}">❓ Enchaîner avec le quiz</a><a class="btn ghost" href="${back}">Terminer</a></div></div></div>`;
      return;
    }
    const card = queue[i];
    const c = course || getCourse(card.courseId);
    el.innerHTML = `<div class="immersive">
      <div class="imm-bar"><a class="icon-btn" href="${back}" aria-label="Quitter">${icon('x', 20)}</a>
        <div class="progress"><i style="width:${(i / queue.length) * 100}%"></i></div><span class="count">${i + 1}/${queue.length}</span></div>
      <div class="flash-stage" data-flip>${cardHtml(card, c, flipped)}</div>
      <div class="imm-actions">${
        flipped
          ? `<div class="grades">${GRADES.map((g) => `<button class="grade ${g.cls}" data-g="${g.g}"><b>${g.label}</b><small>${libre ? '' : intervalLabel(card, g.g)}</small></button>`).join('')}</div>`
          : `<button class="btn primary lg block" data-show>Voir la réponse</button>`
      }</div></div>`;
  }
  function grade(g) {
    const card = queue[i];
    stats[g]++;
    if (!libre) {
      Object.assign(card, schedule(card, g));
      logReview();
      save();
    }
    if (g === 0) queue.push(card);
    i++;
    flipped = false;
    draw();
  }
  draw();
  el.onclick = (e) => {
    const g = e.target.closest('[data-g]');
    if (g) return grade(+g.dataset.g);
    if ((e.target.closest('[data-show]') || e.target.closest('[data-flip]')) && !flipped && !e.target.closest('a')) {
      flipped = true;
      draw();
    }
  };
  const onKey = (e) => {
    if (i >= queue.length || !queue.length) return;
    if ((e.key === ' ' || e.key === 'Enter') && !flipped) {
      e.preventDefault();
      flipped = true;
      draw();
    } else if (flipped) {
      const g = GRADES.find((x) => x.key === e.key);
      if (g) grade(g.g);
    }
  };
  document.addEventListener('keydown', onKey);
  return () => document.removeEventListener('keydown', onKey);
}

/* ---------- Parcourir (sans notation) ---------- */
export function browseView(el, { params: [id] }) {
  const course = getCourse(id);
  const cards = course ? cardsOf(id) : [];
  if (!cards.length) return (el.innerHTML = `<div class="empty"><h3>Aucune carte</h3><a class="btn" href="#/flashcards">Flashcards</a></div>`);
  let i = 0;
  let flipped = false;
  const draw = () => {
    el.innerHTML = `<div class="immersive">
      <div class="imm-bar"><a class="icon-btn" href="#/flashcards/${id}" aria-label="Quitter">${icon('x', 20)}</a>
        <div class="progress"><i style="width:${((i + 1) / cards.length) * 100}%"></i></div><span class="count">${i + 1}/${cards.length}</span></div>
      <div class="flash-stage" data-flip>${cardHtml(cards[i], course, flipped)}</div>
      <div class="imm-actions"><div class="nav-btns">
        <button class="btn lg" data-prev ${i ? '' : 'disabled'}>← Précédente</button>
        <button class="btn lg" data-turn>${flipped ? 'Question' : 'Réponse'}</button>
        <button class="btn primary lg" data-next ${i < cards.length - 1 ? '' : 'disabled'}>Suivante →</button></div></div></div>`;
  };
  const go = (d) => {
    const n = i + d;
    if (n < 0 || n >= cards.length) return;
    i = n;
    flipped = false;
    draw();
  };
  draw();
  el.onclick = (e) => {
    if (e.target.closest('[data-prev]')) return go(-1);
    if (e.target.closest('[data-next]')) return go(1);
    if (e.target.closest('[data-turn]') || (e.target.closest('[data-flip]') && !e.target.closest('a'))) {
      flipped = !flipped;
      draw();
    }
  };
  let x0 = null;
  const ts = (e) => (x0 = e.touches[0].clientX);
  const te = (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
  };
  const onKey = (e) => {
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
    if (e.key === ' ') {
      e.preventDefault();
      flipped = !flipped;
      draw();
    }
  };
  el.addEventListener('touchstart', ts, { passive: true });
  el.addEventListener('touchend', te);
  document.addEventListener('keydown', onKey);
  return () => {
    el.removeEventListener('touchstart', ts);
    el.removeEventListener('touchend', te);
    document.removeEventListener('keydown', onKey);
  };
}
