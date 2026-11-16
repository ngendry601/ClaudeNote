import { load, state, onChange } from './store.js';
import { icon, $, $$ } from './ui.js';
import { applyTheme } from './theme.js';
import { startAutoRefresh, unreadFresh } from './news.js';
import { timer, onTick, setMode, fmt, MODES } from './timer.js';
import dashboard from './views/dashboard.js';
import { coursesList, courseView } from './views/courses.js';
import { decksList, deckView } from './views/flashcards.js';
import review from './views/review.js';
import newsView from './views/news.js';
import pomodoroView from './views/pomodoro.js';
import settingsView from './views/settings.js';
import searchView from './views/search.js';

const NAV = [
  { href: '#/', label: 'Accueil', icon: 'home', match: /^\/$/ },
  { href: '#/cours', label: 'Cours', icon: 'book', match: /^\/cours/ },
  { href: '#/flashcards', label: 'Flashcards', icon: 'cards', match: /^\/(flashcards|reviser)/ },
  { href: '#/veille', label: 'Veille', icon: 'bell', match: /^\/veille/, badge: true },
  { href: '#/pomodoro', label: 'Pomodoro', icon: 'timer', match: /^\/pomodoro/ },
  { href: '#/reglages', label: 'Réglages', icon: 'settings', match: /^\/reglages/ },
];

const routes = [
  [/^\/$/, dashboard],
  [/^\/cours$/, coursesList],
  [/^\/cours\/([\w-]+)$/, courseView],
  [/^\/flashcards$/, decksList],
  [/^\/flashcards\/([\w-]+)$/, deckView],
  [/^\/reviser\/([\w-]+)$/, review],
  [/^\/veille$/, newsView],
  [/^\/pomodoro$/, pomodoroView],
  [/^\/reglages$/, settingsView],
  [/^\/recherche$/, searchView],
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
  ['onclick', 'oninput', 'onchange', 'onsubmit', 'onkeydown'].forEach((h) => (view[h] = null));
  const h = location.hash.slice(1) || '/';
  const [path, qs] = h.split('?');
  const query = new URLSearchParams(qs || '');
  $$('.nav a').forEach((a) => {
    const item = NAV.find((n) => n.href === a.getAttribute('href'));
    a.classList.toggle('active', !!item?.match.test(path));
  });
  if (path !== '/recherche') $('#search').value = '';
  document.body.classList.toggle('focus-mode', path.startsWith('/reviser'));
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
    (n) => `<a href="${n.href}" title="${n.label}">${icon(n.icon, 20)}<span>${n.label}</span>${n.badge ? '<b class="badge" data-badge hidden></b>' : ''}</a>`,
  ).join('');
  $('#search-ic').innerHTML = icon('search', 16);
}

function setupSearch() {
  const input = $('#search');
  let t;
  input.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      const q = input.value.trim();
      if (q) location.hash = `#/recherche?q=${encodeURIComponent(q)}`;
    }, 300);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !e.target.matches('input, textarea, select')) {
      e.preventDefault();
      input.focus();
    }
  });
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
  await load();
  applyTheme();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
  buildNav();
  setupSearch();
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
