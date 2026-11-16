// Paquets prêts à l'emploi (cours + flashcards générées)
import { state, save, uid, ensureDeckForCourse, cardsOf, newCard } from './store.js';
import { extractCards } from './srs.js';

export const PACKS = [
  {
    id: 'cejm',
    title: 'CEJM — BTS SIO (thèmes 1 à 6)',
    desc: 'Méthodes, économie, droit, management, auteurs, articles et pièges. Style fiche de révision.',
    url: 'data/cejm.md',
    subject: { name: 'CEJM', color: '#b91c1c' },
  },
];

export const packInstalled = (id) => state.courses.some((c) => c.packId === id);

/** Importe (ou met à jour) un paquet. Retourne { added, updated }. */
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
  let added = 0;
  let updated = 0;
  for (const c of extractCards(txt)) {
    const ex = existing.get(c.front.trim().toLowerCase());
    if (ex) {
      Object.assign(ex, { back: c.back, trap: c.trap || '', section: c.section, sub: c.sub, color: c.color });
      updated++;
    } else {
      state.cards.push(newCard(deck.id, c.front, c.back, { trap: c.trap || '', section: c.section, sub: c.sub, color: c.color }));
      added++;
    }
  }
  save();
  return { added, updated, deckId: deck.id, courseId: course.id };
}
