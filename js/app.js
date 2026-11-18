import { load, state, onChange } from './store.js';
import { icon, toast, $, $$ } from './ui.js';
import { applyTheme } from './theme.js';
import { startAutoRefresh, unreadFresh } from './news.js';
import { importPack, outdatedPacks, packCourse } from './packs.js';
import home from './views/home.js';
import { coursesList, courseView, courseEdit } from './views/courses.js';
import { flashcardsHome, deckView, reviewView, browseView } from './views/flashcards.js';
import { quizHome, quizPlay } from './views/quiz.js';
import newsView from './views/news.js';
import settingsView from './views/settings.js';

const NAV = [
  { href: '#/', label: 'Accueil', icon: 'home', match: /^\/(reglages)?$/ },
  { href: '#/cours', label: 'Cours', icon: 'book', match: /^\/cours/ },
  { href: '#/flashcards', label: 'Flashcards', icon: 'cards', match: /^\/flashcards/ },
  { href: '#/quiz', label: 'Quiz', icon: 'quiz', match: /^\/quiz/ },
  { href: '#/veille', label: 'Veille', icon: 'bell', match: /^\/veille/, badge: true },
];

const routes = [
  [/^\/$/, home],
  [/^\/cours$/, coursesList],
  [/^\/cours\/([\w-]+)$/, courseView],
  [/^\/cours\/([\w-]+)\/modifier$/, courseEdit],
  [/^\/flashcards$/, flashcardsHome],
  [/^\/flashcards\/([\w-]+)$/, deckView],
  [/^\/flashcards\/([\w-]+)\/revoir$/, reviewView],
  [/^\/flashcards\/([\w-]+)\/parcourir$/, browseView],
  [/^\/quiz$/, quizHome],
  [/^\/quiz\/([\w-]+)$/, quizPlay],
  [/^\/veille$/, newsView],
  [/^\/reglages$/, settingsView],
];

// anciennes adresses (favoris, notifications des versions précédentes)
const REDIRECTS = [
  [/^\/reviser(\/.*)?$/, '#/flashcards/tout/revoir'],
  [/^\/(page|fiche|feuille)\/.*$/, '#/cours'],
  [/^\/pomodoro$/, '#/'],
];

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
  ['onclick', 'oninput', 'onchange', 'onsubmit'].forEach((h) => (view[h] = null));
  const [path, qs] = (location.hash.slice(1) || '/').split('?');
  const to = REDIRECTS.find(([re]) => re.test(path));
  if (to) return location.replace(to[1]);
  $$('.nav a').forEach((a) => a.classList.toggle('active', !!NAV.find((n) => n.href === a.getAttribute('href'))?.match.test(path)));
  // révision et quiz en plein écran, sans barre d'onglets
  document.body.classList.toggle('immersive-mode', /^\/(flashcards\/[\w-]+\/(revoir|parcourir)|quiz\/[\w-]+)$/.test(path));
  for (const [re, fn] of routes) {
    const m = path.match(re);
    if (m) {
      view.innerHTML = '';
      cleanup = fn(view, { params: m.slice(1), query: new URLSearchParams(qs || '') }, { updateBadge }) || null;
      window.scrollTo(0, 0);
      return;
    }
  }
  view.innerHTML = `<div class="empty"><h3>Page introuvable</h3><a class="btn" href="#/">Accueil</a></div>`;
}

async function init() {
  const firstRun = await load();
  applyTheme();
  if (firstRun || (state.migratedFrom && !packCourse('cejm'))) await importPack('cejm').catch((e) => console.warn('CEJM', e));
  for (const p of outdatedPacks()) await importPack(p.id).catch(() => {});
  if (state.migratedFrom) {
    delete state.migratedFrom;
    setTimeout(() => toast('Nouvelle version de ClaudeNote : tes cours ont été conservés ✨', 'success'), 600);
  }
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
  $('#nav').innerHTML = NAV.map((n) => `<a href="${n.href}">${icon(n.icon, 22)}<span>${n.label}</span>${n.badge ? '<b class="badge" data-badge hidden></b>' : ''}</a>`).join('');
  window.addEventListener('hashchange', render);
  onChange(updateBadge);
  render();
  updateBadge();
  startAutoRefresh();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch((e) => console.warn('SW', e));
    navigator.serviceWorker.addEventListener('message', (e) => e.data?.hash && (location.hash = e.data.hash));
  }
}

init();
