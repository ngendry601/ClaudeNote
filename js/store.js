// État de l'application, sauvegardé dans IndexedDB.
// Modèle :
//   courses   : le cours complet (texte intégral, non synthétisé) + fichiers d'origine
//   cards     : flashcards synthétiques d'un cours (répétition espacée)
//   questions : questions de quiz d'un cours (QCM, vrai/faux, cas, association, ordre, texte à trous)
import { kv } from './db.js';
import { DEFAULT_SOURCES, DEFAULT_KEYWORDS } from './sources.js';

export { DEFAULT_SOURCES } from './sources.js';
export const STATE_VERSION = 3;
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

export const DEFAULT_PROXIES = ['proxy?url=', 'https://api.allorigins.win/raw?url=', 'https://api.codetabs.com/v1/proxy?quest='];

function defaults() {
  return {
    version: STATE_VERSION,
    courses: [],
    cards: [],
    questions: [],
    qstats: {}, // id de question -> { seen, wrong, last }
    quizLog: [], // { date, courseId, score, total }
    exams: [],
    reviewLog: {},
    packVersions: {},
    push: { vapidPublic: '', vapidPrivate: '', subscription: null, remindHour: 18 },
    news: {
      items: [],
      lastFetch: 0,
      lastVisit: 0,
      sources: DEFAULT_SOURCES.map((s) => ({ ...s })),
      keywords: [...DEFAULT_KEYWORDS],
      notify: false,
      interval: 30,
      proxies: [...DEFAULT_PROXIES],
      errors: {},
    },
    settings: { theme: 'auto', dailyGoal: 20, apiKey: '' },
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

/** Ancien format de cours (blocs « ::: ») → texte de cours normal */
function legacyToMarkdown(content = '') {
  return content
    .replace(/^\s*#\s+.+\n?/, '') // le titre est déjà affiché au-dessus du cours
    .replace(/^:::\s+(.+)$/gm, '## $1')
    .replace(/^:::\s*$/gm, '')
    .replace(/^\s*!!\s*(.+)$/gm, '> ⚠️ **Piège :** $1')
    .replace(/^(.+?)\s*::\s*(.+)$/gm, '- **$1** : $2')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Les versions 1 et 2 de l'appli : on garde les cours (texte), les examens, la veille et les réglages. */
function migrate(old) {
  if ((old.version || 1) >= 3) return old;
  const fresh = defaults();
  const subjectName = (id) => (old.subjects || []).find((s) => s.id === id)?.name || '';
  fresh.courses = (old.courses || [])
    .filter((c) => !c.packId) // les cours prêts à l'emploi sont réinstallés dans leur nouvelle version
    .map((c) => ({
      id: c.id,
      title: c.title,
      subject: subjectName(c.subjectId),
      content: legacyToMarkdown(c.content),
      attachments: c.attachments || [],
      createdAt: c.createdAt || Date.now(),
      updatedAt: c.updatedAt || Date.now(),
    }));
  fresh.exams = (old.exams || []).map((e) => ({ id: e.id, title: e.title, date: e.date, subject: subjectName(e.subjectId) }));
  fresh.reviewLog = old.reviewLog || {};
  if (old.news) fresh.news = mergeDefaults(old.news, defaults().news);
  if (old.push) fresh.push = { ...fresh.push, ...old.push };
  fresh.settings.theme = old.settings?.theme || 'auto';
  fresh.settings.apiKey = old.settings?.apiKey || '';
  fresh.migratedFrom = old.version || 1;
  return fresh;
}

export async function load() {
  let saved = null;
  try {
    saved = await kv.get('state');
  } catch (e) {
    console.warn('IndexedDB indisponible', e);
  }
  if (saved) {
    Object.assign(state, mergeDefaults(migrate(saved), defaults()));
    await flush();
    return false;
  }
  await flush();
  return true; // premier lancement
}

export function replaceState(newState) {
  for (const k of Object.keys(state)) delete state[k];
  Object.assign(state, mergeDefaults(migrate(newState), defaults()));
}
export const resetState = () => replaceState(defaults());

let saveTimer = null;
const listeners = new Set();
export const onChange = (fn) => (listeners.add(fn), () => listeners.delete(fn));
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

/* ---------- Accès pratiques ---------- */
export const getCourse = (id) => state.courses.find((c) => c.id === id);
export const cardsOf = (courseId) => state.cards.filter((c) => c.courseId === courseId);
export const questionsOf = (courseId) => state.questions.filter((q) => q.courseId === courseId);
export const isDue = (c, now = Date.now()) => c.due <= now;
export const dueCards = (courseId, now = Date.now()) => state.cards.filter((c) => (!courseId || c.courseId === courseId) && isDue(c, now));
export const subjects = () => [...new Set(state.courses.map((c) => c.subject).filter(Boolean))].sort();

const PALETTE = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626', '#db2777', '#7c3aed', '#0d9488', '#65a30d'];
export function subjectColor(name = '') {
  if (!name) return '#64748b';
  let h = 0;
  for (const ch of name.toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function newCard(courseId, front, back) {
  return { id: uid(), courseId, front, back, ease: 2.5, interval: 0, reps: 0, lapses: 0, due: Date.now(), lastReview: 0, createdAt: Date.now() };
}

export function createCourse({ title, subject = '', content = '', attachments = [], packId }) {
  const c = { id: uid(), title: title?.trim() || 'Nouveau cours', subject: subject.trim(), content, attachments, createdAt: Date.now(), updatedAt: Date.now() };
  if (packId) c.packId = packId;
  state.courses.push(c);
  save();
  return c;
}

/** Remplace (ou ajoute) les flashcards et le quiz d'un cours */
export function setCourseStudy(courseId, { flashcards = [], quiz = [] }, { replace = true } = {}) {
  if (replace) {
    state.cards = state.cards.filter((c) => c.courseId !== courseId);
    state.questions = state.questions.filter((q) => q.courseId !== courseId);
  }
  flashcards.forEach((f) => state.cards.push(newCard(courseId, f.front, f.back)));
  quiz.forEach((q) => state.questions.push({ ...q, id: uid(), courseId }));
  save();
}

export function deleteCourse(id) {
  state.courses = state.courses.filter((c) => c.id !== id);
  state.cards = state.cards.filter((c) => c.courseId !== id);
  state.questions = state.questions.filter((q) => q.courseId !== id);
  save();
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
