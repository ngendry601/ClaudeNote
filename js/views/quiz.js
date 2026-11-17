import { state, save, uid, getDeck } from '../store.js';
import { esc, icon, relTime, $ } from '../ui.js';
import { md, stripMd } from '../md.js';
import { cardFace, cardColor } from '../cardview.js';
import { shuffle, extractFacts } from '../srs.js';
import { isFiche } from '../md.js';

/**
 * Le quiz travaille sur des « faits » : chaque puce « **Notion** : explication » d'une fiche
 * devient une question. Les flashcards restent peu nombreuses (3 à 5 fiches par cours)
 * tandis que le quiz reste varié.
 */
let ITEMS = [];
function buildItems() {
  ITEMS = [];
  for (const c of state.cards) {
    const facts = extractFacts(c);
    facts.forEach((f, i) =>
      ITEMS.push({
        id: `${c.id}#${i}`,
        cardId: c.id,
        deckId: c.deckId,
        front: f.q,
        back: f.a,
        section: c.section || (isFiche(c.back) ? c.front : ''),
        sub: f.topic,
        color: cardColor(c),
        trap: facts.length === 1 ? c.trap || '' : '',
      }),
    );
  }
  return ITEMS;
}

const TYPES = { mix: 'Mixte', qcm: 'QCM', tf: 'Vrai / Faux', write: 'Réponse écrite' };
const TYPE_LABEL = { qcm: 'QCM', tf: 'Vrai ou faux ?', write: 'Réponse écrite' };

const norm = (s) =>
  stripMd(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9%€$ ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
function typedOk(input, back) {
  const a = norm(input);
  const b = norm(back);
  if (!a) return false;
  if (a === b) return true;
  if (b.includes(a) && a.length >= b.length * 0.6) return true;
  return lev(a, b) <= Math.max(1, Math.floor(b.length * 0.2));
}
const isShort = (c) => !c.back.includes('\n') && stripMd(c.back).length <= 40;

function scopes() {
  const list = [{ v: 'all', l: `Tout`, n: ITEMS.length }];
  state.decks.forEach((d) => list.push({ v: 'd:' + d.id, l: `Paquet : ${d.name}`, n: ITEMS.filter((c) => c.deckId === d.id).length }));
  const secs = [...new Set(ITEMS.map((c) => c.section).filter(Boolean))];
  secs.forEach((s) => list.push({ v: 's:' + s, l: `Fiche : ${s}`, n: ITEMS.filter((c) => c.section === s).length }));
  const mistakes = ITEMS.filter((c) => state.quizMistakes.includes(c.id)).length;
  list.push({ v: 'mistakes', l: '🔁 Mes erreurs', n: mistakes });
  return list.filter((x) => x.n > 0 || x.v === 'mistakes');
}
function poolOf(scope) {
  if (scope === 'all') return ITEMS;
  if (scope === 'mistakes') return ITEMS.filter((c) => state.quizMistakes.includes(c.id));
  if (scope.startsWith('d:')) return ITEMS.filter((c) => c.deckId === scope.slice(2));
  if (scope.startsWith('s:')) return ITEMS.filter((c) => c.section === scope.slice(2));
  return [];
}
const scopeLabel = (scope) => scopes().find((s) => s.v === scope)?.l || 'Quiz';

function makeQuestion(card, type, universe) {
  const others = universe.filter((x) => x.id !== card.id && norm(x.back) !== norm(card.back));
  // les distracteurs les plus proches (même thème, même paquet) rendent le quiz plus exigeant
  const ranked = shuffle(others).sort(
    (a, b) => (b.section === card.section) * 2 + (b.deckId === card.deckId) - ((a.section === card.section) * 2 + (a.deckId === card.deckId)),
  );
  if (type === 'mix') {
    const opts = isShort(card) ? ['qcm', 'tf', 'write'] : ['qcm', 'qcm', 'tf'];
    type = opts[Math.floor(Math.random() * opts.length)];
  }
  if (type === 'write' && !isShort(card)) type = 'qcm';
  if (type === 'qcm' && others.length < 2) type = 'tf';
  if (type === 'tf' && !others.length) type = 'self';
  const q = { card, type, answered: false, correct: false };
  if (type === 'qcm') q.options = shuffle([card, ...ranked.slice(0, 3)]).map((c) => ({ id: c.id, text: c.back }));
  if (type === 'tf') {
    q.truth = Math.random() < 0.5;
    q.shown = q.truth ? card.back : ranked[0].back;
  }
  return q;
}

export default function quizView(el, { query }) {
  buildItems();
  let cfg = { scope: query.get('scope') || 'all', count: 10, type: 'mix' };
  let run = null;

  function setup() {
    const sc = scopes();
    if (!sc.some((s) => s.v === cfg.scope)) cfg.scope = 'all';
    const hist = state.quizLog.slice(-8).reverse();
    el.innerHTML = `
      <div class="page-head"><div><h1>Quiz</h1><p class="muted">Une question par notion de tes fiches : QCM, vrai/faux et réponses écrites.</p></div></div>
      ${
        !ITEMS.length
          ? `<div class="empty">${icon('cards', 40)}<h3>Pas encore de cartes</h3><p>Crée des flashcards ou installe un paquet prêt à l'emploi.</p><a class="btn primary" href="#/flashcards">Flashcards</a></div>`
          : `<section class="panel quiz-setup">
        <label class="field"><span>Sur quoi ?</span><select data-scope>${sc.map((s) => `<option value="${esc(s.v)}" ${s.v === cfg.scope ? 'selected' : ''} ${!s.n ? 'disabled' : ''}>${esc(s.l)} (${s.n})</option>`).join('')}</select></label>
        <div class="field"><span>Nombre de questions</span><div class="seg">${[10, 20, 30, 0].map((n) => `<button class="${cfg.count === n ? 'on' : ''}" data-count="${n}">${n || 'Tout'}</button>`).join('')}</div></div>
        <div class="field"><span>Type de questions</span><div class="seg">${Object.entries(TYPES).map(([k, l]) => `<button class="${cfg.type === k ? 'on' : ''}" data-type="${k}">${l}</button>`).join('')}</div></div>
        <button class="btn primary lg" data-act="start">${icon('zap')} Lancer le quiz</button>
        <p class="muted small">${ITEMS.length} questions disponibles. Les questions ratées vont dans « Mes erreurs » et leur fiche repasse en révision.</p>
      </section>`
      }
      ${
        hist.length
          ? `<section class="panel"><h2>Derniers quiz</h2><ul class="quiz-hist">${hist
              .map((h) => {
                const pct = Math.round((h.score / h.total) * 100);
                return `<li><div><b>${esc(h.label)}</b><small>${relTime(h.date)} · ${h.score}/${h.total}</small></div><div class="mini-bar"><i style="width:${pct}%"></i></div><span class="pct ${pct >= 80 ? 'good' : pct >= 50 ? 'mid' : 'bad'}">${pct}%</span></li>`;
              })
              .join('')}</ul></section>`
          : ''
      }`;
  }

  function start(scope = cfg.scope) {
    const universe = poolOf(scope);
    if (!universe.length) return;
    const distractorPool = scope === 'mistakes' ? ITEMS : universe.length >= 4 ? universe : ITEMS;
    const picked = shuffle(universe).slice(0, cfg.count || universe.length);
    run = { scope, label: scopeLabel(scope), idx: 0, score: 0, qs: picked.map((c) => makeQuestion(c, cfg.type, distractorPool)) };
    drawQ();
  }

  function drawQ() {
    const q = run.qs[run.idx];
    const n = run.qs.length;
    let body = '';
    if (q.type === 'qcm')
      body = `<div class="opts">${q.options
        .map((o, i) => {
          let cls = '';
          if (q.answered) cls = o.id === q.card.id ? 'right' : o.id === q.picked ? 'wrong' : 'dim';
          return `<div role="button" tabindex="0" class="opt ${cls}" data-opt="${o.id}"><span class="opt-l">${'ABCD'[i]}</span><div class="md">${md(o.text)}</div></div>`;
        })
        .join('')}</div>`;
    if (q.type === 'tf')
      body = `<div class="tf-shown"><small>Réponse proposée :</small><div class="md">${md(q.shown)}</div></div>
        <div class="tf-btns"><button class="btn lg ${q.answered ? (q.truth ? 'right' : q.pickedTf ? 'wrong' : '') : ''}" data-tf="1" ${q.answered ? 'disabled' : ''}>✔ Vrai <kbd>V</kbd></button>
        <button class="btn lg ${q.answered ? (!q.truth ? 'right' : !q.pickedTf ? 'wrong' : '') : ''}" data-tf="0" ${q.answered ? 'disabled' : ''}>✘ Faux <kbd>F</kbd></button></div>`;
    if (q.type === 'write')
      body = `<form class="write-form" data-write><input name="a" autocomplete="off" placeholder="Ta réponse…" value="${esc(q.typed || '')}" ${q.answered ? 'disabled' : ''}>
        ${q.answered ? '' : `<button class="btn primary">Valider</button><button type="button" class="btn ghost" data-skip>Je ne sais pas</button>`}</form>`;
    if (q.type === 'self')
      body = q.answered ? '' : `<div class="tf-btns"><button class="btn lg" data-reveal>Voir la réponse</button></div>`;

    const fb = q.answered
      ? `<div class="feedback ${q.selfPending ? '' : q.correct ? 'ok' : 'ko'}"><b>${q.selfPending ? '🤔 Alors, tu savais ?' : q.correct ? '✅ Bonne réponse !' : '❌ Raté'}</b>${q.type === 'write' && !q.correct && q.typed ? `<span>Tu as répondu : « ${esc(q.typed)} »</span>` : ''}</div>
         <div class="explain">${cardFace(q.card, { corner: 'Correction' })}</div>
         ${q.type === 'self' && q.selfPending ? `<div class="tf-btns"><button class="btn lg wrong" data-self="0">Je ne savais pas</button><button class="btn lg right" data-self="1">Je savais</button></div>` : `<button class="btn primary lg block" data-next>${run.idx + 1 < n ? 'Question suivante' : 'Voir mon score'} <kbd>Entrée</kbd></button>`}`
      : '';

    el.innerHTML = `
      <div class="review-top"><button class="back-link link-btn" data-quit>${icon('x', 16)} Quitter</button>
        <span class="muted">${esc(run.label)}</span><span class="muted">${run.idx + 1} / ${n} · ${run.score} pt${run.score > 1 ? 's' : ''}</span></div>
      <div class="progress"><i style="width:${(run.idx / n) * 100}%"></i></div>
      <div class="quiz-q">${cardFace(q.card, { flipped: false, corner: TYPE_LABEL[q.type] || 'Question' })}</div>
      ${body}${fb}`;
    if (q.type === 'write' && !q.answered) $('[data-write] input', el)?.focus();
    if (q.answered) $('.explain', el)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function answer(correct, extra = {}) {
    const q = run.qs[run.idx];
    if (q.answered) return;
    Object.assign(q, extra, { answered: true, correct });
    if (correct) run.score++;
    drawQ();
  }

  function finish() {
    const wrong = run.qs.filter((q) => !q.correct);
    const now = Date.now();
    const mistakes = new Set(state.quizMistakes);
    run.qs.forEach((q) => {
      if (q.correct) mistakes.delete(q.card.id);
      else {
        mistakes.add(q.card.id);
        const real = state.cards.find((c) => c.id === q.card.cardId);
        if (real) real.due = Math.min(real.due, now); // la fiche concernée repasse en révision
      }
    });
    state.quizMistakes = [...mistakes];
    state.quizLog.push({ id: uid(), date: now, label: run.label, score: run.score, total: run.qs.length });
    if (state.quizLog.length > 100) state.quizLog.shift();
    save();
    const pct = Math.round((run.score / run.qs.length) * 100);
    el.innerHTML = `
      <div class="review-done panel">
        <div class="big-emoji">${pct >= 90 ? '🏆' : pct >= 70 ? '🎉' : pct >= 50 ? '💪' : '📚'}</div>
        <h2>${run.score} / ${run.qs.length} — ${pct} %</h2>
        <p class="muted">${esc(run.label)}</p>
        <div class="score-ring" style="--p:${pct}"><span>${pct}%</span></div>
        <div class="head-actions">
          ${wrong.length ? `<button class="btn" data-act="redo-wrong">🔁 Refaire mes ${wrong.length} erreur${wrong.length > 1 ? 's' : ''}</button>` : ''}
          <button class="btn" data-act="again">Nouveau quiz</button>
          <a class="btn primary" href="#/flashcards">Réviser</a></div>
      </div>
      ${
        wrong.length
          ? `<h2>À retravailler</h2><div class="wrong-list">${wrong.map((q) => `<details class="panel"><summary>${esc(stripMd(q.card.front))}</summary>${cardFace(q.card)}</details>`).join('')}</div>`
          : ''
      }`;
    run.lastWrong = wrong.map((q) => q.card.id);
  }

  setup();

  el.onclick = (e) => {
    const t = e.target;
    if (!run) {
      const c = t.closest('[data-count]');
      if (c) return (cfg.count = +c.dataset.count), setup();
      const ty = t.closest('[data-type]');
      if (ty) return (cfg.type = ty.dataset.type), setup();
      if (t.closest('[data-act="start"]')) return start();
      return;
    }
    if (t.closest('[data-quit]')) return (run = null), setup();
    const act = t.closest('[data-act]')?.dataset.act;
    if (act === 'again') return (run = null), setup();
    if (act === 'redo-wrong') {
      const ids = new Set(run.lastWrong);
      const universe = ITEMS.filter((c) => ids.has(c.id));
      run = { scope: 'mistakes', label: 'Mes erreurs', idx: 0, score: 0, qs: shuffle(universe).map((c) => makeQuestion(c, cfg.type, ITEMS)) };
      return drawQ();
    }
    const q = run.qs[run.idx];
    if (!q) return;
    const o = t.closest('[data-opt]');
    if (o && !q.answered) return answer(o.dataset.opt === q.card.id, { picked: o.dataset.opt });
    const tf = t.closest('[data-tf]');
    if (tf && !q.answered) return answer((tf.dataset.tf === '1') === q.truth, { pickedTf: tf.dataset.tf === '1' });
    if (t.closest('[data-skip]')) return answer(false, { typed: '' });
    if (t.closest('[data-reveal]')) {
      q.answered = true;
      q.selfPending = true;
      return drawQ();
    }
    const sf = t.closest('[data-self]');
    if (sf) {
      q.selfPending = false;
      q.correct = sf.dataset.self === '1';
      if (q.correct) run.score++;
      return drawQ();
    }
    if (t.closest('[data-next]')) next();
  };
  function next() {
    if (run.idx + 1 < run.qs.length) {
      run.idx++;
      drawQ();
      window.scrollTo(0, 0);
    } else finish();
  }
  el.onsubmit = (e) => {
    if (!e.target.matches('[data-write]')) return;
    e.preventDefault();
    const q = run.qs[run.idx];
    const v = e.target.a.value;
    answer(typedOk(v, q.card.back), { typed: v });
  };
  el.onchange = (e) => {
    if (e.target.matches('[data-scope]')) cfg.scope = e.target.value;
  };
  const onKey = (e) => {
    if (!run || !run.qs[run.idx] || e.target.matches('input, textarea, select')) return;
    const q = run.qs[run.idx];
    if (q.answered && e.key === 'Enter' && !q.selfPending) {
      e.preventDefault();
      return next();
    }
    if (q.answered) return;
    if (q.type === 'qcm' && /^[1-4a-dA-D]$/.test(e.key)) {
      const i = /\d/.test(e.key) ? +e.key - 1 : 'abcd'.indexOf(e.key.toLowerCase());
      const opt = q.options[i];
      if (opt) answer(opt.id === q.card.id, { picked: opt.id });
    }
    if (q.type === 'tf' && /^[vVfF]$/.test(e.key)) {
      const v = e.key.toLowerCase() === 'v';
      answer(v === q.truth, { pickedTf: v });
    }
  };
  document.addEventListener('keydown', onKey);
  return () => document.removeEventListener('keydown', onKey);
}
