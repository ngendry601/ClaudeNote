// Onglet « Quiz » : vraies questions (QCM, cas pratiques, vrai/faux, association, remise en ordre, texte à trous),
// correction expliquée après chaque réponse, priorité aux questions ratées et jamais vues.
import { state, save, getCourse, questionsOf, subjectColor } from '../store.js';
import { esc, icon, relTime, $, $$ } from '../ui.js';
import { inline } from '../md.js';
import { shuffle } from '../srs.js';
import { studyModal } from './create.js';

const LETTERS = 'ABCDEF';
const HINT = { qcm: 'Une seule bonne réponse', multi: 'Plusieurs bonnes réponses', vf: 'Vrai ou faux ?', trou: 'Complète la phrase', ordre: 'Remets dans le bon ordre', assoc: 'Relie chaque élément' };

const stat = (q) => state.qstats[q.id] || { seen: 0, wrong: 0, lastOk: null };
const mistakesOf = (qs) => qs.filter((q) => stat(q).lastOk === false);
const bestScore = (courseId) => {
  const logs = state.quizLog.filter((l) => l.courseId === courseId);
  return logs.length ? Math.max(...logs.map((l) => Math.round((l.score / l.total) * 100))) : null;
};

/* ---------- Accueil du quiz ---------- */
export function quizHome(el) {
  const courses = state.courses.filter((c) => questionsOf(c.id).length);
  const totalQ = state.questions.length;
  const totalWrong = mistakesOf(state.questions).length;
  el.innerHTML = `
    <header class="page-head"><h1>Quiz</h1></header>
    ${
      !courses.length
        ? `<div class="empty">${icon('quiz', 44)}<h3>Pas encore de quiz</h3><p>Chaque cours peut avoir son quiz : cas pratiques, QCM, vrai/faux, associations…</p>
           ${state.courses.length ? `<a class="btn primary" href="#/cours">Choisir un cours</a>` : `<a class="btn primary" href="#/cours?ajouter=1">${icon('plus')} Ajouter un cours</a>`}</div>`
        : `${
            courses.length > 1
              ? `<a class="hero" href="#/quiz/tout"><span class="hero-ic">🎲</span><div><b>Quiz mélangé</b><small>10 questions tirées de tous tes cours</small></div><span class="hero-go">${icon('play', 20)}</span></a>`
              : ''
          }
          ${totalWrong ? `<a class="row-card warn-row" href="#/quiz/tout?mode=erreurs"><div class="rc-main"><b>🔁 Retravailler mes erreurs</b><small>${totalWrong} question${totalWrong > 1 ? 's' : ''} ratée${totalWrong > 1 ? 's' : ''} la dernière fois</small></div></a>` : ''}
          <div class="decks">${courses
            .map((c) => {
              const qs = questionsOf(c.id);
              const best = bestScore(c.id);
              const last = state.quizLog.filter((l) => l.courseId === c.id).at(-1);
              const wrong = mistakesOf(qs).length;
              return `<div class="deck" style="--c:${subjectColor(c.subject)}">
                <div class="deck-main"><span class="tag">${esc(c.subject || 'Sans matière')}</span><b>${esc(c.title)}</b>
                  <small>${qs.length} questions · ${best === null ? 'jamais fait' : `meilleur score ${best} %`}${last ? ` · ${relTime(last.date)}` : ''}</small>
                  ${best !== null ? `<span class="bar"><i style="width:${best}%"></i></span>` : ''}</div>
                <div class="deck-btns"><a class="btn primary" href="#/quiz/${c.id}">▶ ${Math.min(10, qs.length)} questions</a>
                  ${qs.length > 10 ? `<a class="btn ghost" href="#/quiz/${c.id}?n=tout">Tout (${qs.length})</a>` : ''}
                  ${wrong ? `<a class="btn ghost" href="#/quiz/${c.id}?mode=erreurs">🔁 Erreurs (${wrong})</a>` : ''}</div></div>`;
            })
            .join('')}</div>
          <p class="muted small center">${totalQ} questions au total. Les questions ratées et jamais vues passent en priorité.</p>`
    }
    ${
      state.courses.some((c) => !questionsOf(c.id).length) && courses.length
        ? `<section class="group"><h2 class="group-title">Cours sans quiz</h2>${state.courses
            .filter((c) => !questionsOf(c.id).length)
            .map((c) => `<button class="row-card" data-study="${c.id}"><div class="rc-main"><b>${esc(c.title)}</b><small>✨ Créer les flashcards et le quiz</small></div></button>`)
            .join('')}</section>`
        : ''
    }`;
  el.onclick = (e) => {
    const s = e.target.closest('[data-study]');
    if (s) studyModal(s.dataset.study);
  };
}

/* ---------- Préparation ---------- */
function pick(pool, n) {
  // priorité : ratée la dernière fois > jamais vue > réussie ; hasard à priorité égale
  const prio = (q) => (stat(q).lastOk === false ? 3 : stat(q).seen === 0 ? 2 : 1);
  const sorted = shuffle(pool).sort((a, b) => prio(b) - prio(a));
  return shuffle(sorted.slice(0, n));
}

function prepare(q) {
  const p = { q, done: false, ok: false };
  if (q.type === 'qcm' || q.type === 'multi') p.order = shuffle(q.choices.map((_, i) => i));
  if (q.type === 'multi') p.sel = new Set();
  if (q.type === 'ordre') {
    let o;
    do o = shuffle(q.items.map((_, i) => i));
    while (o.every((v, i) => v === i) && q.items.length > 1);
    p.avail = o;
    p.seq = [];
  }
  if (q.type === 'assoc') {
    p.rights = shuffle(q.pairs.map((_, i) => i));
    p.match = {}; // index gauche -> index droite
    p.cur = null;
  }
  return p;
}

const norm = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/^(le|la|les|l'|un|une|des)\s*/, '')
    .replace(/[^a-z0-9%€ ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
function close(a, b) {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 2 || b.length < 5) return false;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length] <= (b.length > 8 ? 2 : 1);
}

function correctText(q) {
  switch (q.type) {
    case 'qcm':
      return inline(q.choices[q.answer]);
    case 'multi':
      return q.answers.map((i) => inline(q.choices[i])).join(' · ');
    case 'vf':
      return q.answer ? 'Vrai' : 'Faux';
    case 'trou':
      return inline(q.answers[0]);
    case 'ordre':
      return q.items.map((t, i) => `${i + 1}. ${inline(t)}`).join('<br>');
    case 'assoc':
      return q.pairs.map((p) => `${inline(p.left)} → ${inline(p.right)}`).join('<br>');
  }
  return '';
}

/* ---------- Partie ---------- */
export function quizPlay(el, { params: [id], query }) {
  const all = id === 'tout';
  const course = all ? null : getCourse(id);
  const base = all ? state.questions : questionsOf(id);
  const mode = query.get('mode');
  const pool = mode === 'erreurs' ? mistakesOf(base) : base;
  const n = query.get('n') === 'tout' ? pool.length : 10;
  let items = pick(pool, n).map(prepare);
  let i = 0;
  const backHref = course ? '#/quiz' : '#/quiz';

  if (!items.length) {
    el.innerHTML = `<div class="immersive"><div class="end"><div class="big">${mode === 'erreurs' ? '🎉' : '🤔'}</div><h2>${mode === 'erreurs' ? 'Plus aucune erreur à retravailler' : 'Pas de questions'}</h2><div class="stack"><a class="btn primary lg" href="#/quiz">Retour aux quiz</a></div></div></div>`;
    return;
  }

  function questionHtml(p) {
    const q = p.q;
    let body = '';
    if (q.type === 'qcm' || q.type === 'multi')
      body = `<div class="choices">${p.order
        .map((ci, k) => {
          let cls = '';
          const right = q.type === 'qcm' ? ci === q.answer : q.answers.includes(ci);
          if (p.done) cls = right ? 'right' : (q.type === 'qcm' ? p.picked === ci : p.sel.has(ci)) ? 'wrong' : 'dim';
          else if (q.type === 'multi' && p.sel.has(ci)) cls = 'sel';
          return `<button class="choice-btn ${cls}" data-ci="${ci}" ${p.done ? 'disabled' : ''}><span class="letter">${q.type === 'multi' ? (p.sel.has(ci) ? '☑' : '☐') : LETTERS[k]}</span><span>${inline(q.choices[ci])}</span></button>`;
        })
        .join('')}</div>${q.type === 'multi' && !p.done ? `<button class="btn primary lg block" data-validate ${p.sel.size ? '' : 'disabled'}>Valider</button>` : ''}`;
    if (q.type === 'vf')
      body = `<div class="vf">${[true, false]
        .map((v) => `<button class="choice-btn big ${p.done ? (v === q.answer ? 'right' : p.picked === v ? 'wrong' : 'dim') : ''}" data-vf="${v}" ${p.done ? 'disabled' : ''}>${v ? '✔ Vrai' : '✘ Faux'}</button>`)
        .join('')}</div>`;
    if (q.type === 'trou')
      body = `<form class="trou" data-trou><input name="a" autocomplete="off" autocapitalize="off" placeholder="Ta réponse…" value="${esc(p.typed || '')}" ${p.done ? 'disabled' : ''} class="${p.done ? (p.ok ? 'right' : 'wrong') : ''}">
        ${p.done ? '' : '<button class="btn primary lg">Valider</button>'}</form>`;
    if (q.type === 'ordre')
      body = `<div class="order">
        <p class="small muted">Ton ordre :</p>
        <ol class="slots">${q.items.map((_, k) => {
          const it = p.seq[k];
          const cls = p.done ? (it === k ? 'right' : 'wrong') : '';
          return `<li class="slot ${it === undefined ? 'empty' : 'filled'} ${cls}" ${it !== undefined && !p.done ? `data-unplace="${k}"` : ''}><span class="num">${k + 1}</span>${it === undefined ? '' : inline(q.items[it])}</li>`;
        }).join('')}</ol>
        ${p.done ? '' : `<p class="small muted">Touche les étapes dans l'ordre :</p><div class="pool">${p.avail.map((it) => `<button class="chip-btn" data-place="${it}">${inline(q.items[it])}</button>`).join('')}</div>
          <button class="btn primary lg block" data-validate ${p.avail.length ? 'disabled' : ''}>Valider</button>`}</div>`;
    if (q.type === 'assoc') {
      const colorOf = (l) => `hsl(${(l * 67) % 360} 70% 45%)`;
      const owner = Object.fromEntries(Object.entries(p.match).map(([l, r]) => [r, +l]));
      body = `<div class="assoc">
        <div class="col">${q.pairs
          .map((pair, l) => {
            const st = p.done ? (p.match[l] === l ? 'right' : 'wrong') : p.cur === l ? 'cur' : p.match[l] !== undefined ? 'linked' : '';
            return `<button class="assoc-item left ${st}" data-left="${l}" ${p.done ? 'disabled' : ''} style="--k:${colorOf(l)}"><span class="num">${l + 1}</span>${inline(pair.left)}</button>`;
          })
          .join('')}</div>
        <div class="col">${p.rights
          .map((r) => {
            const l = owner[r];
            return `<button class="assoc-item rcol ${l !== undefined ? 'linked' : ''}" data-right="${r}" ${p.done ? 'disabled' : ''} style="--k:${l !== undefined ? colorOf(l) : 'transparent'}">${l !== undefined ? `<span class="num">${l + 1}</span>` : ''}${inline(q.pairs[r].right)}</button>`;
          })
          .join('')}</div></div>
        ${p.done ? '' : `<p class="small muted center">Touche un élément à gauche, puis sa réponse à droite.</p><button class="btn primary lg block" data-validate ${Object.keys(p.match).length === q.pairs.length ? '' : 'disabled'}>Valider</button>`}`;
    }
    const feedback = p.done
      ? `<div class="feedback ${p.ok ? 'ok' : 'ko'}"><b>${p.ok ? '✅ Bonne réponse !' : '❌ Pas tout à fait'}</b>
          ${p.ok || q.type === 'qcm' || q.type === 'vf' ? '' : `<div class="answer"><small>La bonne réponse :</small><div>${correctText(q)}</div></div>`}
          ${q.explain ? `<p class="explain">💡 ${inline(q.explain)}</p>` : ''}</div>`
      : '';
    const qText = q.type === 'trou' ? inline(q.q).replace(/_{3,}/g, '<span class="blank">______</span>') : inline(q.q);
    return `
      ${q.context ? `<div class="situation"><small>📋 Situation</small><p>${inline(q.context)}</p></div>` : ''}
      <h2 class="question">${qText}</h2>
      <p class="q-hint">${HINT[q.type]}</p>
      ${body}${feedback}`;
  }

  function draw() {
    if (i >= items.length) return finish();
    const p = items[i];
    const c = course || getCourse(p.q.courseId);
    el.innerHTML = `<div class="immersive quiz">
      <div class="imm-bar"><a class="icon-btn" href="${backHref}" aria-label="Quitter">${icon('x', 20)}</a>
        <div class="progress"><i style="width:${(i / items.length) * 100}%"></i></div><span class="count">${i + 1}/${items.length}</span></div>
      <div class="quiz-body"><p class="q-course" style="--c:${subjectColor(c?.subject)}">${esc(c?.title || '')}</p>${questionHtml(p)}</div>
      ${p.done ? `<div class="imm-actions"><button class="btn primary lg block" data-next>${i + 1 < items.length ? 'Continuer' : 'Voir mon score'}</button></div>` : ''}
    </div>`;
    if (p.q.type === 'trou' && !p.done) $('[data-trou] input', el)?.focus();
    if (p.done) $(".feedback", el)?.scrollIntoView({ behavior: "smooth", block: "end" });
  }

  function validate(ok) {
    const p = items[i];
    p.done = true;
    p.ok = ok;
    const s = stat(p.q);
    state.qstats[p.q.id] = { seen: s.seen + 1, wrong: s.wrong + (ok ? 0 : 1), lastOk: ok };
    save();
    draw();
  }

  function finish() {
    const score = items.filter((p) => p.ok).length;
    const pct = Math.round((score / items.length) * 100);
    state.quizLog.push({ date: Date.now(), courseId: id, score, total: items.length });
    if (state.quizLog.length > 200) state.quizLog.shift();
    save();
    const wrong = items.filter((p) => !p.ok);
    el.innerHTML = `<div class="immersive"><div class="end wide">
      <div class="ring" style="--p:${pct}"><span>${pct} %</span></div>
      <h2>${score} / ${items.length} — ${pct >= 90 ? 'Excellent ! 🏆' : pct >= 70 ? 'Très bien ! 🎉' : pct >= 50 ? 'Pas mal, continue 💪' : 'À retravailler 📚'}</h2>
      <div class="stack">
        ${wrong.length ? `<button class="btn primary lg" data-redo>🔁 Refaire mes ${wrong.length} erreur${wrong.length > 1 ? 's' : ''}</button>` : ''}
        <a class="btn lg" href="#/quiz/${id}" data-again>Nouveau quiz</a>
        ${course ? `<a class="btn ghost" href="#/flashcards/${id}">Revoir les flashcards</a>` : ''}
        <a class="btn ghost" href="#/quiz">Terminer</a>
      </div>
      ${
        wrong.length
          ? `<h3 class="review-title">À retenir</h3>${wrong
              .map((p) => `<div class="mistake"><p class="m-q">${inline(p.q.context ? `${p.q.context} — ${p.q.q}` : p.q.q)}</p><p class="m-a">✅ ${correctText(p.q)}</p>${p.q.explain ? `<p class="m-e">${inline(p.q.explain)}</p>` : ''}</div>`)
              .join('')}`
          : ''
      }</div></div>`;
    const redo = $('[data-redo]', el);
    if (redo)
      redo.onclick = () => {
        items = shuffle(wrong.map((p) => prepare(p.q)));
        i = 0;
        draw();
      };
    const again = $('[data-again]', el);
    if (again) again.onclick = (e) => (e.preventDefault(), (items = pick(base, n).map(prepare)), (i = 0), draw());
  }

  el.onclick = (e) => {
    const p = items[i];
    if (!p) return;
    if (e.target.closest('[data-next]')) {
      i++;
      draw();
      window.scrollTo(0, 0);
      return;
    }
    if (p.done) return;
    const q = p.q;
    const ci = e.target.closest('[data-ci]');
    if (ci) {
      const v = +ci.dataset.ci;
      if (q.type === 'qcm') {
        p.picked = v;
        return validate(v === q.answer);
      }
      p.sel.has(v) ? p.sel.delete(v) : p.sel.add(v);
      return draw();
    }
    const vfb = e.target.closest('[data-vf]');
    if (vfb) {
      p.picked = vfb.dataset.vf === 'true';
      return validate(p.picked === q.answer);
    }
    const place = e.target.closest('[data-place]');
    if (place) {
      const it = +place.dataset.place;
      p.avail = p.avail.filter((x) => x !== it);
      p.seq.push(it);
      return draw();
    }
    const un = e.target.closest('[data-unplace]');
    if (un) {
      const k = +un.dataset.unplace;
      const removed = p.seq.splice(k);
      p.avail.push(...removed);
      return draw();
    }
    const left = e.target.closest('[data-left]');
    if (left) {
      p.cur = +left.dataset.left;
      return draw();
    }
    const right = e.target.closest('[data-right]');
    if (right) {
      const r = +right.dataset.right;
      const owner = Object.keys(p.match).find((l) => p.match[l] === r);
      if (p.cur === null) {
        if (owner !== undefined) delete p.match[owner]; // toucher une réponse liée la détache
        return draw();
      }
      if (owner !== undefined) delete p.match[owner];
      p.match[p.cur] = r;
      // passe automatiquement à l'élément de gauche suivant non relié
      const next = q.pairs.findIndex((_, l) => p.match[l] === undefined);
      p.cur = next === -1 ? null : next;
      return draw();
    }
    if (e.target.closest('[data-validate]')) {
      if (q.type === 'multi') return validate(p.sel.size === q.answers.length && q.answers.every((a) => p.sel.has(a)));
      if (q.type === 'ordre') return validate(p.seq.every((v, k) => v === k));
      if (q.type === 'assoc') return validate(q.pairs.every((_, l) => p.match[l] === l));
    }
  };
  el.onsubmit = (e) => {
    if (!e.target.matches('[data-trou]')) return;
    e.preventDefault();
    const p = items[i];
    p.typed = e.target.a.value;
    const a = norm(p.typed);
    validate(!!a && p.q.answers.some((x) => close(a, norm(x))));
  };
  const onKey = (e) => {
    const p = items[i];
    if (!p || e.target.matches('input, textarea')) return;
    if (p.done && e.key === 'Enter') {
      e.preventDefault();
      i++;
      return draw();
    }
    if (p.done) return;
    if (p.q.type === 'qcm') {
      const k = /^[1-6]$/.test(e.key) ? +e.key - 1 : LETTERS.toLowerCase().indexOf(e.key.toLowerCase());
      if (k >= 0 && k < p.order.length) {
        p.picked = p.order[k];
        validate(p.picked === p.q.answer);
      }
    }
    if (p.q.type === 'vf' && /^[vf]$/i.test(e.key)) {
      p.picked = e.key.toLowerCase() === 'v';
      validate(p.picked === p.q.answer);
    }
  };
  document.addEventListener('keydown', onKey);
  draw();
  return () => document.removeEventListener('keydown', onKey);
}
