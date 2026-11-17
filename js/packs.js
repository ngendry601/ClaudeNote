// Paquets prêts à l'emploi (cours + flashcards générées)
import { state, save, uid, ensureDeckForCourse, cardsOf, newCard } from './store.js';
import { extractCards } from './srs.js';

export const PACKS = [
  {
    id: 'cejm',
    version: 2,
    title: 'CEJM — BTS SIO SLAM',
    desc: '5 fiches à réciter : méthodes, économie, droit, management, pièges et auteurs.',
    url: 'data/cejm.md',
    subject: { name: 'CEJM', color: '#b91c1c' },
  },
];

export const packInstalled = (id) => state.courses.some((c) => c.packId === id);

/** Paquets installés dont une nouvelle version existe */
export const outdatedPacks = () => PACKS.filter((p) => packInstalled(p.id) && (state.packVersions[p.id] || 1) < p.version);

/** Importe ou synchronise un paquet : les cartes du paquet qui n'existent plus sont retirées. Retourne { added, updated, removed }. */
export async function importPack(id) {
  const p = PACKS.find((x) => x.id === id);
  const txt = await (await fetch(p.url, { cache: 'no-cache' })).text();
  let subject = state.subjects.find((s) => s.name === p.subject.name);
  if (!subject) {
    subject = { id: uid(), ...p.subject, createdAt: Date.now() };
    state.subjects.push(subject);
  }
  let course = state.courses.find((c) => c.packId === id);
  if (!course) {
    course = { id: uid(), packId: id, title: p.title, subjectId: subject.id, tags: [], attachments: [], createdAt: Date.now() };
    state.courses.push(course);
  }
  course.content = txt;
  course.updatedAt = Date.now();
  const deck = ensureDeckForCourse(course);
  deck.subjectId = subject.id;
  const existing = new Map(cardsOf(deck.id).map((c) => [c.front.trim().toLowerCase(), c]));
  const fresh = extractCards(txt);
  const keep = new Set(fresh.map((c) => c.front.trim().toLowerCase()));
  const before = state.cards.length;
  state.cards = state.cards.filter((c) => c.deckId !== deck.id || keep.has(c.front.trim().toLowerCase()));
  const removed = before - state.cards.length;
  let added = 0;
  let updated = 0;
  for (const c of fresh) {
    const ex = existing.get(c.front.trim().toLowerCase());
    if (ex) {
      Object.assign(ex, { back: c.back, trap: c.trap || '', section: c.section, sub: c.sub, color: c.color });
      updated++;
    } else {
      state.cards.push(newCard(deck.id, c.front, c.back, { trap: c.trap || '', section: c.section, sub: c.sub, color: c.color }));
      added++;
    }
  }
  course.title = p.title;
  deck.name = p.title;
  state.packVersions[id] = p.version;
  save();
  return { added, updated, removed, deckId: deck.id, courseId: course.id };
}
