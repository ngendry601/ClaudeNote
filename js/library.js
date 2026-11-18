// Un cours = une fiche A4. Ses flashcards (3 à 5 « parties ») sont tirées automatiquement de son texte :
// l'utilisateur ne gère jamais de « paquet » à la main.
import { state, save, uid, getCourse, ensureDeckForCourse, deckForCourse, cardsOf, newCard, isDue } from './store.js';
import { extractCards } from './srs.js';
import { isFiche } from './md.js';

const key = (s) => s.trim().toLowerCase();

/** Met les flashcards d'un cours en accord avec son texte (la progression de révision est conservée). */
export function syncCourseCards(course) {
  const fresh = extractCards(course.content || '');
  let deck = deckForCourse(course.id);
  if (!fresh.length && !deck) return { total: 0, added: 0, removed: 0 };
  deck ||= ensureDeckForCourse(course);
  deck.name = course.title;
  deck.subjectId = course.subjectId || null;
  const existing = new Map(cardsOf(deck.id).map((c) => [key(c.front), c]));
  const keep = new Set(fresh.map((c) => key(c.front)));
  const before = state.cards.length;
  state.cards = state.cards.filter((c) => c.deckId !== deck.id || keep.has(key(c.front)));
  const removed = before - state.cards.length;
  let added = 0;
  const order = [];
  for (const c of fresh) {
    const extra = { trap: c.trap || '', section: c.section, sub: c.sub, color: c.color };
    const ex = existing.get(key(c.front));
    if (ex) {
      Object.assign(ex, { back: c.back, ...extra });
      order.push(ex);
    } else {
      const n = newCard(deck.id, c.front, c.back, extra);
      state.cards.push(n);
      order.push(n);
      added++;
    }
  }
  // même ordre que dans le cours
  order.forEach((c, i) => (c.order = i));
  save();
  return { total: fresh.length, added, removed };
}

export const courseCards = (course) => {
  const deck = deckForCourse(course.id);
  return deck ? cardsOf(deck.id).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : [];
};
export const courseDue = (course, now = Date.now()) => courseCards(course).filter((c) => isDue(c, now)).length;
export const courseOfCard = (card) => {
  const deck = state.decks.find((d) => d.id === card.deckId);
  return deck?.courseId ? getCourse(deck.courseId) : null;
};

/** Anciennes versions : des paquets pouvaient exister sans cours. On leur crée un cours pour tout regrouper. */
export function migrateOrphanDecks() {
  let changed = false;
  for (const deck of state.decks) {
    if (deck.courseId && getCourse(deck.courseId)) continue;
    const cards = cardsOf(deck.id);
    if (!cards.length) continue;
    const parts = cards.map((c) =>
      isFiche(c.back) || c.back.includes('\n') ? `::: ${c.front}\n${c.back}${c.trap ? `\n!! ${c.trap}` : ''}\n:::` : `- ${c.front} :: ${c.back}`,
    );
    const course = {
      id: uid(),
      title: deck.name,
      subjectId: deck.subjectId || null,
      content: `# ${deck.name}\n\n${parts.join('\n\n')}\n`,
      tags: [],
      attachments: [],
      createdAt: deck.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    state.courses.push(course);
    deck.courseId = course.id;
    changed = true;
  }
  // un cours dont les cartes n'existent pas encore (ancien cours sans « Générer ») : on les crée
  for (const c of state.courses) if (!deckForCourse(c.id) && /^:::\s+\S/m.test(c.content || '')) (syncCourseCards(c), (changed = true));
  if (changed) save();
}

/** Nouveau cours vide, prêt à être rempli */
export function createCourse({ title, subjectId = null, content }) {
  const course = {
    id: uid(),
    title: title.trim() || 'Nouveau cours',
    subjectId: subjectId || null,
    content: content ?? `# ${title.trim()}\n\n::: Première partie\n### Sous-partie\n- **Notion** : explication courte\n:::\n`,
    tags: [],
    attachments: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  state.courses.push(course);
  syncCourseCards(course);
  return course;
}
