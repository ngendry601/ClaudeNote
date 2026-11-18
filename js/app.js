import { load, state, onChange } from './store.js';
import { icon, toast, $, $$ } from './ui.js';
import { applyTheme } from './theme.js';
import { startAutoRefresh, unreadFresh } from './news.js';
import { timer, onTick, setMode, fmt, MODES } from './timer.js';
import { importPack, outdatedPacks } from './packs.js';
import { migrateOrphanDecks } from './library.js';
import home from './views/home.js';
import coursesView from './views/courses.js';
import { courseView, courseEdit, pageView } from './views/course.js';
import reviseView from './views/revise.js';
import review from './views/review.js';
import quizView from './views/quiz.js';
import newsView from './views/news.js';
import pomodoroView from './views/pomodoro.js';
import settingsView from './views/settings.js';
import searchView from './views/search.js';

// 5 onglets, toujours les mêmes, sur ordinateur comme sur téléphone
const NAV = [
  { href: '#/', label: 'Accueil', icon: 'home', match: /^\/$/ },
  { href: '#/cours', label: 'Cours', icon: 'book', match: /^\/(cours|page)/ },
  { href: '#/reviser', label: 'Réviser', icon: 'cards', match: /^\/(reviser|quiz)/ },
  { href: '#/veille', label: 'Veille', icon: 'bell', match: /^\/veille/, badge: true },
  { href: '#/reglages', label: 'Réglages', icon: 'settings', match: /^\/(reglages|pomodoro)/ },
];

const routes = [
  [/^\/$/, home],
  [/^\/cours$/, coursesView],
  [/^\/cours\/([\w-]+)$/, courseView],
  [/^\/cours\/([\w-]+)\/modifier$/, courseEdit],
  [/^\/page\/([\w-]+)$/, pageView],
  [/^\/reviser$/, reviseView],
  [/^\/reviser\/([\w-]+)$/, review],
  [/^\/quiz$/, quizView],
  [/^\/veille$/, newsView],
  [/^\/pomodoro$/, pomodoroView],
  [/^\/reglages$/, settingsView],
  [/^\/recherche$/, searchView],
];

// anciennes adresses (favoris, notifications) → nouveaux écrans
function redirect(path) {
  let m;
  if (path === '/flashcards') return '#/reviser';
  if ((m = path.match(/^\/flashcards\/([\w-]+)$/)) || (m = path.match(/^\/feuille\/([\w-]+)$/))) {
    const deck = state.decks.find((d) => d.id === m[1]);
    return deck?.courseId ? `#/cours/${deck.courseId}` : '#/reviser';
  }
  if ((m = path.match(/^\/fiche\/([\w-]+)$/))) {
    const card = state.cards.find((c) => c.id === m[1]);
    const deck = card && state.decks.find((d) => d.id === card.deckId);
    return deck?.courseId ? `#/page/${deck.courseId}` : '#/reviser';
  }
  return null;
}

const view = $('#view');
let cleanup = null;

function updateBadge() {
  const n = unreadFresh();
  $$('[data-badge]').forEach((b) => {
    b.textContent = n > 99 ? '99+' : n;
    b.hidden = !n;
  });
  document.title = n ? `(${n}) ClaudeNote` : 'ClaudeNote';
}

function render() {
  try {
    cleanup?.();
  } catch (e) {
    console.error(e);
  }
  cleanup = null;
  ['onclick', 'oninput', 'onchange', 'onsubmit', 'onkeydown'].forEach((h) => (view[h] = null));
  const h = location.hash.slice(1) || '/';
  const [path, qs] = h.split('?');
  const to = redirect(path);
  if (to) return location.replace(to);
  const query = new URLSearchParams(qs || '');
  $$('.nav a').forEach((a) => {
    const item = NAV.find((n) => n.href === a.getAttribute('href'));
    a.classList.toggle('active', !!item?.match.test(path));
  });
  // écrans « immersifs » : révision et fiche en plein écran, sans la barre de navigation
  const immersive = /^\/(reviser\/|page\/)/.test(path);
  document.body.classList.toggle('focus-mode', immersive);
  for (const [re, fn] of routes) {
    const m = path.match(re);
    if (m) {
      view.innerHTML = '';
      cleanup = fn(view, { params: m.slice(1), query }, { updateBadge }) || null;
      window.scrollTo(0, 0);
      return;
    }
  }
  view.innerHTML = `<div class="empty"><h3>Page introuvable</h3><a class="btn" href="#/">Accueil</a></div>`;
}

function buildNav() {
  $('#nav').innerHTML = NAV.map(
    (n) => `<a href="${n.href}" title="${n.label}">${icon(n.icon, 22)}<span>${n.label}</span>${n.badge ? '<b class="badge" data-badge hidden></b>' : ''}</a>`,
  ).join('');
}

function setupMiniTimer() {
  const el = $('#mini-timer');
  onTick(() => {
    const show = timer.running || (timer.remaining && timer.remaining < (state.settings.pomodoro[timer.mode] || 25) * 60e3);
    el.hidden = !show;
    if (show) el.innerHTML = `${icon('timer', 16)} <b>${fmt(timer.remaining)}</b> <small>${MODES[timer.mode]}${timer.running ? '' : ' (pause)'}</small>`;
  });
}

async function init() {
  const firstRun = await load();
  applyTheme();
  if (firstRun) await importPack('cejm').catch((e) => console.warn('Paquet CEJM', e));
  for (const p of outdatedPacks()) {
    try {
      await importPack(p.id);
      setTimeout(() => toast(`« ${p.title} » mis à jour`, 'success'), 800);
    } catch (e) {
      console.warn('Mise à jour du paquet', p.id, e);
    }
  }
  migrateOrphanDecks();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
  buildNav();
  setMode('work');
  setupMiniTimer();
  window.addEventListener('hashchange', render);
  onChange(updateBadge);
  render();
  updateBadge();
  startAutoRefresh();

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch((e) => console.warn('SW', e));
    navigator.serviceWorker.addEventListener('message', (e) => {
      if (e.data?.hash) location.hash = e.data.hash;
    });
  }
}

init();
