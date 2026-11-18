// Répétition espacée (proche d'Anki) avec 3 réponses : À revoir / Bien / Facile
import { DAY, startOfDay } from './store.js';

export const GRADES = [
  { g: 0, label: 'À revoir', cls: 'again', key: '1' },
  { g: 2, label: 'Bien', cls: 'good', key: '2' },
  { g: 3, label: 'Facile', cls: 'easy', key: '3' },
];

export function schedule(card, grade, now = Date.now()) {
  const c = { ...card };
  if (grade === 0) {
    if (c.reps > 0) c.lapses = (c.lapses || 0) + 1;
    c.reps = 0;
    c.interval = 0;
    c.ease = Math.max(1.3, c.ease - 0.2);
    c.due = now + 10 * 60e3;
  } else {
    let iv;
    if (c.reps === 0) iv = grade === 3 ? 4 : 1;
    else if (c.reps === 1) iv = grade === 3 ? 6 : 3;
    else iv = Math.max(1, c.interval) * c.ease * (grade === 3 ? 1.3 : 1);
    if (grade === 3) c.ease += 0.15;
    c.interval = Math.max(1, Math.round(iv));
    c.reps += 1;
    c.due = startOfDay(now) + c.interval * DAY + 4 * 3600e3;
  }
  c.lastReview = now;
  return c;
}

export function intervalLabel(card, grade) {
  if (grade === 0) return '10 min';
  const d = schedule(card, grade).interval;
  if (d < 30) return `${d} j`;
  if (d < 365) return `${Math.round(d / 30)} mois`;
  return `${(d / 365).toFixed(1)} an`;
}

/** 0 = nouvelle, 1 = en cours, 2 = maîtrisée */
export const mastery = (c) => (!c.lastReview ? 0 : c.interval >= 21 ? 2 : 1);

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
