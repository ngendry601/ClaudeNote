import { kv } from './db.js';

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
export const DAY = 864e5;

export function dayKey(d = new Date()) {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
}
export function startOfDay(ts = Date.now()) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export const DEFAULT_SOURCES = [
  { id: 'hn', name: 'Hacker News', type: 'hn', enabled: true, color: '#ff6600' },
  { id: 'devto', name: 'DEV Community', type: 'devto', enabled: true, color: '#3b49df' },
  { id: 'korben', name: 'Korben', type: 'rss', url: 'https://korben.info/feed', enabled: true, color: '#e11d48' },
  { id: 'next', name: 'Next', type: 'rss', url: 'https://next.ink/feed/', enabled: true, color: '#0ea5e9' },
  { id: 'certfr', name: 'CERT-FR (alertes sécu)', type: 'rss', url: 'https://cert.cyber.gouv.fr/feed/', enabled: true, color: '#dc2626' },
  { id: 'lmi', name: 'Le Monde Informatique', type: 'rss', url: 'https://www.lemondeinformatique.fr/rss.xml', enabled: false, color: '#16a34a' },
  { id: 'numerama', name: 'Numerama', type: 'rss', url: 'https://www.numerama.com/feed/', enabled: false, color: '#9333ea' },
  { id: 'zdnet', name: 'ZDNet France', type: 'rss', url: 'https://www.zdnet.fr/feeds/rss/actualites/', enabled: false, color: '#ca8a04' },
  { id: 'lobsters', name: 'Lobsters', type: 'rss', url: 'https://lobste.rs/rss', enabled: false, color: '#ac130d' },
];

export const DEFAULT_PROXIES = [
  'proxy?url=', // fourni par server.js (le plus fiable)
  'https://api.allorigins.win/raw?url=',
  'https://api.codetabs.com/v1/proxy?quest=',
];

function defaults() {
  return {
    version: 1,
    subjects: [],
    courses: [],
    decks: [],
    cards: [],
    exams: [],
    reviewLog: {},
    pomodoroLog: {},
    news: {
      items: [],
      lastFetch: 0,
      lastVisit: 0,
      sources: DEFAULT_SOURCES.map((s) => ({ ...s })),
      keywords: ['faille', 'CVE', 'IA', 'Linux', 'Python'],
      notify: false,
      interval: 30,
      proxies: [...DEFAULT_PROXIES],
      errors: {},
    },
    settings: { theme: 'auto', pomodoro: { work: 25, short: 5, long: 15, every: 4 }, dailyGoal: 30 },
  };
}

export const state = defaults();

function mergeDefaults(target, def) {
  for (const k of Object.keys(def)) {
    if (target[k] === undefined) target[k] = def[k];
    else if (def[k] && typeof def[k] === 'object' && !Array.isArray(def[k])) mergeDefaults(target[k], def[k]);
  }
  return target;
}

export async function load() {
  let saved = null;
  try {
    saved = await kv.get('state');
  } catch (e) {
    console.warn('IndexedDB indisponible', e);
  }
  if (saved) {
    Object.assign(state, mergeDefaults(saved, defaults()));
  } else {
    seed();
    await flush();
  }
}

export function replaceState(newState) {
  for (const k of Object.keys(state)) delete state[k];
  Object.assign(state, mergeDefaults(newState, defaults()));
}

export function resetState() {
  replaceState(defaults());
}

let saveTimer = null;
const listeners = new Set();
export function onChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
export function save() {
  listeners.forEach((fn) => fn());
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, 250);
}
export async function flush() {
  clearTimeout(saveTimer);
  try {
    await kv.set('state', JSON.parse(JSON.stringify(state)));
  } catch (e) {
    console.error('Sauvegarde impossible', e);
  }
}
window.addEventListener('beforeunload', () => flush());
document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && flush());

/* ---------- Helpers métier ---------- */
export const getSubject = (id) => state.subjects.find((s) => s.id === id);
export const getCourse = (id) => state.courses.find((c) => c.id === id);
export const getDeck = (id) => state.decks.find((d) => d.id === id);
export const cardsOf = (deckId) => state.cards.filter((c) => c.deckId === deckId);
export const isDue = (c, now = Date.now()) => c.due <= now;
export const deckForCourse = (courseId) => state.decks.find((d) => d.courseId === courseId);

export function ensureDeckForCourse(course) {
  let deck = deckForCourse(course.id);
  if (!deck) {
    deck = { id: uid(), name: course.title, subjectId: course.subjectId || null, courseId: course.id, createdAt: Date.now() };
    state.decks.push(deck);
  }
  return deck;
}

export function logReview() {
  const k = dayKey();
  state.reviewLog[k] = (state.reviewLog[k] || 0) + 1;
}

export function streak() {
  let n = 0;
  const d = new Date();
  if (!state.reviewLog[dayKey(d)]) d.setDate(d.getDate() - 1);
  while (state.reviewLog[dayKey(d)]) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export const SUBJECT_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6', '#64748b'];

/* ---------- Données d'exemple au premier lancement ---------- */
function seed() {
  const now = Date.now();
  const s1 = { id: uid(), name: 'Réseaux', color: '#0ea5e9', createdAt: now };
  const s2 = { id: uid(), name: 'Algorithmique', color: '#10b981', createdAt: now };
  state.subjects.push(s1, s2);

  const c1 = {
    id: uid(),
    subjectId: s1.id,
    title: 'Le modèle OSI (exemple)',
    tags: ['exemple'],
    attachments: [],
    createdAt: now,
    updatedAt: now,
    content: `# Le modèle OSI

Ceci est un **cours d'exemple** pour te montrer comment ça marche. Tu peux le modifier ou le supprimer.

## Les 7 couches

| N° | Couche | Exemple |
|----|--------|---------|
| 7 | Application | HTTP, DNS |
| 4 | Transport | TCP, UDP |
| 3 | Réseau | IP |
| 2 | Liaison | Ethernet |

> Astuce : toute ligne de la forme \`question :: réponse\` devient une flashcard !

## Flashcards détectées automatiquement

- Combien de couches a le modèle OSI ? :: 7
- Quelle couche gère le routage ? :: La couche 3 (Réseau)
- TCP ou UDP : lequel garantit l'ordre des paquets ? :: TCP
- **DNS** : système qui traduit un nom de domaine en adresse IP

Q : Sur quel port écoute HTTPS par défaut ?
R : 443

## Code

\`\`\`bash
ping -c 4 8.8.8.8
\`\`\`
`,
  };
  state.courses.push(c1);

  const deck = ensureDeckForCourse(c1);
  [
    ['Combien de couches a le modèle OSI ?', '7'],
    ['Quelle couche gère le routage ?', 'La couche 3 (Réseau)'],
    ['Sur quel port écoute HTTPS par défaut ?', '443'],
  ].forEach(([front, back]) => state.cards.push(newCard(deck.id, front, back)));

  const exam = new Date();
  exam.setDate(exam.getDate() + 12);
  state.exams.push({ id: uid(), title: 'Partiel Réseaux', date: dayKey(exam), subjectId: s1.id });
}

export function newCard(deckId, front, back, extra = {}) {
  return { id: uid(), deckId, front, back, ease: 2.5, interval: 0, reps: 0, lapses: 0, due: Date.now(), createdAt: Date.now(), lastReview: 0, ...extra };
}
