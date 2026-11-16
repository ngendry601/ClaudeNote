// Répétition espacée (variante simplifiée de SM-2, proche d'Anki)
import { DAY, startOfDay } from './store.js';

export const GRADES = [
  { g: 0, label: 'À revoir', key: '1', cls: 'again' },
  { g: 1, label: 'Difficile', key: '2', cls: 'hard' },
  { g: 2, label: 'Bien', key: '3', cls: 'good' },
  { g: 3, label: 'Facile', key: '4', cls: 'easy' },
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
    else if (c.reps === 1) iv = grade === 1 ? 2 : grade === 2 ? 3 : 6;
    else {
      const base = Math.max(1, c.interval);
      iv = grade === 1 ? base * 1.2 : grade === 2 ? base * c.ease : base * c.ease * 1.3;
    }
    if (grade === 1) c.ease = Math.max(1.3, c.ease - 0.15);
    if (grade === 3) c.ease = c.ease + 0.15;
    c.interval = Math.max(1, Math.round(iv));
    c.reps += 1;
    c.due = startOfDay(now) + c.interval * DAY + 4 * 3600e3; // dispo à 4h du matin le jour J
  }
  c.lastReview = now;
  return c;
}

export function intervalLabel(card, grade) {
  const c = schedule(card, grade);
  if (grade === 0) return '10 min';
  const d = c.interval;
  if (d < 30) return `${d} j`;
  if (d < 365) return `${Math.round(d / 30)} mois`;
  return `${(d / 365).toFixed(1)} an`;
}

/**
 * Extrait des flashcards d'un texte de cours.
 * Formats reconnus :
 *   question :: réponse
 *   Q : question  (ligne suivante)  R : réponse
 *   - **Terme** : définition
 */
export function extractCards(text) {
  const out = [];
  const lines = text.replace(/\r/g, '').split('\n');
  let inCode = false;
  const clean = (s) => s.trim().replace(/^[-*+]\s+/, '').trim();
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^\s*```/.test(l)) {
      inCode = !inCode;
      continue;
    }
    if (inCode || /^\s*>/.test(l) || /`[^`]*::[^`]*`/.test(l)) continue;
    let m;
    if ((m = l.match(/^\s*(?:[-*+]\s+|\d+[.)]\s+)?(.+?)\s*::\s*(.+)$/))) {
      out.push({ front: clean(m[1]), back: clean(m[2]) });
    } else if ((m = l.match(/^\s*(?:[-*+]\s+)?(?:Q|Question)\s*[:–-]\s*(.+)$/i))) {
      const n = (lines[i + 1] || '').match(/^\s*(?:[-*+]\s+)?(?:R|A|Réponse|Reponse|Answer)\s*[:–-]\s*(.+)$/i);
      if (n) {
        out.push({ front: m[1].trim(), back: n[1].trim() });
        i++;
      }
    } else if ((m = l.match(/^\s*[-*+]\s+\*\*(.+?)\*\*\s*[:–—]\s*(.+)$/))) {
      out.push({ front: `Définition : ${m[1].trim()}`, back: m[2].trim() });
    }
  }
  return out;
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
