// Cours prêts à l'emploi : cours complet + flashcards + quiz, rédigés à la main (data/*.json)
import { state, save, createCourse, setCourseStudy } from './store.js';
import { normalizeStudy } from './ai.js';

export const PACKS = [
  { id: 'cejm', version: 4, url: 'data/cejm.json', title: 'CEJM — BTS SIO', desc: 'Cours complet, flashcards et quiz' },
  { id: 'cge-vrai-faux', version: 1, url: 'data/cge-vrai-faux.json', title: 'CGE — Le vrai du faux', desc: '20 références (films, jeux vidéo, livres) pour l\'essai' },
];

/** Cours prêts jamais installés sur cet appareil (un cours supprimé par l'utilisateur ne revient pas) */
export const newPacks = () => PACKS.filter((p) => !packCourse(p.id) && state.packVersions[p.id] === undefined);

export const packCourse = (id) => state.courses.find((c) => c.packId === id);
export const outdatedPacks = () => PACKS.filter((p) => !packCourse(p.id) ? false : (state.packVersions[p.id] || 0) < p.version);

export async function importPack(id) {
  const p = PACKS.find((x) => x.id === id);
  const data = normalizeStudy(await (await fetch(p.url, { cache: 'no-cache' })).json());
  let course = packCourse(id);
  if (course) Object.assign(course, { title: data.title, subject: data.subject, content: data.course, updatedAt: Date.now() });
  else course = createCourse({ title: data.title, subject: data.subject, content: data.course, packId: id });
  // on garde la progression des cartes qui existaient déjà (même question)
  const before = new Map(state.cards.filter((c) => c.courseId === course.id).map((c) => [c.front, c]));
  setCourseStudy(course.id, data);
  for (const c of state.cards.filter((x) => x.courseId === course.id)) {
    const old = before.get(c.front);
    if (old) Object.assign(c, { ease: old.ease, interval: old.interval, reps: old.reps, lapses: old.lapses, due: old.due, lastReview: old.lastReview });
  }
  state.packVersions[id] = p.version;
  save();
  return course;
}
