import { state, getSubject, getDeck } from '../store.js';
import { esc, icon } from '../ui.js';

function snippet(text, q) {
  const i = text.toLowerCase().indexOf(q);
  if (i < 0) return esc(text.slice(0, 140));
  const s = Math.max(0, i - 60);
  const part = text.slice(s, i + q.length + 80);
  const j = part.toLowerCase().indexOf(q);
  return (s ? '…' : '') + esc(part.slice(0, j)) + '<mark>' + esc(part.slice(j, j + q.length)) + '</mark>' + esc(part.slice(j + q.length)) + '…';
}

export default function searchView(el, { query }) {
  const q = (query.get('q') || '').trim().toLowerCase();
  if (!q) {
    el.innerHTML = `<div class="empty">${icon('search', 40)}<h3>Recherche</h3><p>Tape un mot dans la barre de recherche en haut.</p></div>`;
    return;
  }
  const courses = state.courses.filter((c) => (c.title + ' ' + c.content).toLowerCase().includes(q));
  const cards = state.cards.filter((c) => (c.front + ' ' + c.back).toLowerCase().includes(q)).slice(0, 50);
  const news = state.news.items.filter((i) => (i.title + ' ' + (i.summary || '')).toLowerCase().includes(q)).slice(0, 20);
  el.innerHTML = `
    <div class="page-head"><h1>Résultats pour « ${esc(q)} »</h1></div>
    <section class="panel"><h2>${icon('book')} Cours (${courses.length})</h2>
      ${courses.length ? `<ul class="link-list">${courses.map((c) => `<li><a href="#/cours/${c.id}"><span class="dot" style="background:${getSubject(c.subjectId)?.color || '#94a3b8'}"></span><div><b>${esc(c.title)}</b><small>${snippet(c.content.replace(/\s+/g, ' '), q)}</small></div></a></li>`).join('')}</ul>` : '<p class="empty-txt">Aucun cours.</p>'}</section>
    <section class="panel"><h2>${icon('cards')} Flashcards (${cards.length})</h2>
      ${cards.length ? `<ul class="link-list">${cards.map((c) => `<li><a href="#/flashcards/${c.deckId}"><div><b>${snippet(c.front, q)}</b><small>${snippet(c.back, q)} · ${esc(getDeck(c.deckId)?.name || '')}</small></div></a></li>`).join('')}</ul>` : '<p class="empty-txt">Aucune carte.</p>'}</section>
    <section class="panel"><h2>${icon('bell')} Veille (${news.length})</h2>
      ${news.length ? `<ul class="link-list">${news.map((n) => `<li><a href="${esc(n.url)}" target="_blank" rel="noopener"><div><b>${esc(n.title)}</b></div></a></li>`).join('')}</ul>` : '<p class="empty-txt">Aucune actu.</p>'}</section>`;
}
