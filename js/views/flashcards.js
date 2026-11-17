import { state, save, uid, getSubject, getDeck, getCourse, cardsOf, isDue, newCard } from '../store.js';
import { esc, icon, relTime, formModal, confirmBox, openModal, toast, $ } from '../ui.js';
import { inline, sectionColor } from '../md.js';
import { cardFace, cardColor, allSections } from '../cardview.js';
import { PACKS, importPack, packInstalled } from '../packs.js';
import { photosModal } from './courses.js';

const subjectOptions = () => [{ value: '', label: 'Sans matière' }, ...state.subjects.map((s) => ({ value: s.id, label: s.name }))];

export function decksList(el) {
  function draw() {
    const now = Date.now();
    const totalDue = state.cards.filter((c) => isDue(c, now)).length;
    const decks = [...state.decks].sort((a, b) => a.name.localeCompare(b.name));
    el.innerHTML = `
      <div class="page-head"><h1>Flashcards</h1>
        <div class="head-actions"><button class="btn ghost" data-act="new">${icon('plus')} Nouveau paquet</button>
        <button class="btn" data-act="photos">📸 Depuis mes photos</button>
        ${totalDue ? `<a class="btn primary" href="#/reviser/all">${icon('zap')} Tout réviser (${totalDue})</a>` : ''}</div></div>
      ${
        decks.length
          ? `<div class="deck-grid">${decks
              .map((d) => {
                const cards = cardsOf(d.id);
                const due = cards.filter((c) => isDue(c, now)).length;
                const fresh = cards.filter((c) => c.reps === 0 && !c.lastReview).length;
                const mature = cards.filter((c) => c.interval >= 21).length;
                const sub = getSubject(d.subjectId);
                const pct = cards.length ? Math.round((mature / cards.length) * 100) : 0;
                return `<div class="deck-card" style="--c:${sub?.color || '#6366f1'}">
                  <div class="cc-top"><span class="tag">${esc(sub?.name || 'Sans matière')}</span>${d.courseId && getCourse(d.courseId) ? `<a class="muted" href="#/cours/${d.courseId}" title="Voir le cours">${icon('book', 14)}</a>` : ''}</div>
                  <h3>${esc(d.name)}</h3>
                  <div class="deck-nums"><span><b class="due">${due}</b> à réviser</span><span><b>${fresh}</b> nouvelles</span><span><b>${cards.length}</b> total</span></div>
                  <div class="mini-bar" title="${pct}% de cartes maîtrisées (intervalle ≥ 21 j)"><i style="width:${pct}%"></i></div>
                  <div class="deck-actions">
                    ${due ? `<a class="btn sm primary" href="#/reviser/${d.id}">Réviser</a>` : cards.length ? `<a class="btn sm" href="#/reviser/${d.id}?libre=1">Entraînement libre</a>` : ''}
                    <a class="btn sm ghost" href="#/flashcards/${d.id}">Gérer</a></div></div>`;
              })
              .join('')}</div>`
          : `<div class="empty">${icon('cards', 40)}<h3>Aucun paquet</h3><p>Crée un paquet, ou génère des cartes automatiquement depuis un cours.</p><button class="btn primary" data-act="new">${icon('plus')} Nouveau paquet</button></div>`
      }
      <section class="panel library"><h2>📦 Paquets prêts à l'emploi</h2>
        ${PACKS.map((p) => `<div class="pack"><div><b>${esc(p.title)}</b><small>${esc(p.desc)}</small></div>
          <button class="btn sm ${packInstalled(p.id) ? 'ghost' : 'primary'}" data-pack="${p.id}">${packInstalled(p.id) ? 'Mettre à jour' : 'Installer'}</button></div>`).join('')}
      </section>`;
  }
  draw();
  el.onclick = async (e) => {
    const pk = e.target.closest('[data-pack]');
    if (pk) {
      pk.disabled = true;
      try {
        const r = await importPack(pk.dataset.pack);
        toast(`${r.added} ajoutée(s), ${r.updated} mise(s) à jour${r.removed ? `, ${r.removed} retirée(s)` : ''}`, 'success');
        draw();
      } catch (err) {
        toast('Import impossible (hors ligne ?)', 'error');
        pk.disabled = false;
      }
      return;
    }
    if (e.target.closest('[data-act="photos"]')) return photosModal();
    if (e.target.closest('[data-act="new"]')) {
      const v = await formModal('Nouveau paquet', [
        { name: 'name', label: 'Nom', required: true, placeholder: 'Ex : Commandes Linux' },
        { name: 'subjectId', label: 'Matière', type: 'select', value: '', options: subjectOptions() },
      ]);
      if (v?.name) {
        const d = { id: uid(), name: v.name.trim(), subjectId: v.subjectId || null, courseId: null, createdAt: Date.now() };
        state.decks.push(d);
        save();
        location.hash = `#/flashcards/${d.id}`;
      }
    }
  };
}

function editCard(card, onDone) {
  openModal(
    `<form class="form"><h3>Modifier la carte</h3>
      <label class="field"><span>Recto (question)</span><textarea name="front" rows="3">${esc(card.front)}</textarea></label>
      <label class="field"><span>Verso (réponse) — Markdown : **gras**, ==surligné==, listes « - »</span><textarea name="back" rows="6">${esc(card.back)}</textarea></label>
      <label class="field"><span>⚠️ Piège à éviter (optionnel)</span><input name="trap" value="${esc(card.trap || '')}"></label>
      <label class="field"><span>Section (bandeau coloré, optionnel)</span><input name="section" list="sections-dl" value="${esc(card.section || '')}" placeholder="Ex : Droit"></label>
      <datalist id="sections-dl">${allSections().map((x) => `<option value="${esc(x)}">`).join('')}</datalist>
      <label class="check"><input type="checkbox" name="reset"> Réinitialiser la progression</label>
      <div class="modal-actions"><button type="button" class="btn ghost" data-close>Annuler</button><button class="btn primary">Enregistrer</button></div></form>`,
    {
      onMount: (m, close) => {
        $('form', m).onsubmit = (e) => {
          e.preventDefault();
          const f = new FormData(e.target);
          card.front = f.get('front').trim();
          card.back = f.get('back').trim();
          card.trap = f.get('trap').trim();
          card.section = f.get('section').trim();
          card.color = card.section ? sectionColor(card.section) : '';
          if (f.get('reset')) Object.assign(card, { ease: 2.5, interval: 0, reps: 0, lapses: 0, due: Date.now(), lastReview: 0 });
          save();
          close();
          onDone();
        };
      },
    },
  );
}

function bulkImport(deck, onDone) {
  openModal(
    `<form class="form"><h3>Importer des cartes</h3>
      <p class="muted">Une carte par ligne. Séparateur : <code>::</code>, tabulation (copier-coller depuis Excel/Anki) ou <code>;</code></p>
      <textarea name="txt" rows="10" placeholder="Capitale de la France :: Paris\nls -la\tliste les fichiers, y compris cachés"></textarea>
      <p class="muted" data-count>0 carte détectée</p>
      <div class="modal-actions"><button type="button" class="btn ghost" data-close>Annuler</button><button class="btn primary">Importer</button></div></form>`,
    {
      wide: true,
      onMount: (m, close) => {
        const parse = (t) =>
          t
            .split('\n')
            .map((l) => {
              const sep = l.includes('::') ? '::' : l.includes('\t') ? '\t' : l.includes(';') ? ';' : null;
              if (!sep) return null;
              const i = l.indexOf(sep);
              const front = l.slice(0, i).trim();
              const back = l.slice(i + sep.length).trim();
              return front && back ? { front, back } : null;
            })
            .filter(Boolean);
        const ta = $('textarea', m);
        ta.oninput = () => ($('[data-count]', m).textContent = `${parse(ta.value).length} carte(s) détectée(s)`);
        $('form', m).onsubmit = (e) => {
          e.preventDefault();
          const cards = parse(ta.value);
          cards.forEach((c) => state.cards.push(newCard(deck.id, c.front, c.back)));
          save();
          toast(`${cards.length} carte(s) importée(s)`, 'success');
          close();
          onDone();
        };
      },
    },
  );
}

export function deckView(el, { params: [id] }) {
  const deck = getDeck(id);
  if (!deck) {
    el.innerHTML = `<div class="empty"><h3>Paquet introuvable</h3><a class="btn" href="#/flashcards">Retour</a></div>`;
    return;
  }
  let q = '';
  function listHtml() {
    const now = Date.now();
    const cards = cardsOf(deck.id)
      .filter((c) => !q || (c.front + ' ' + c.back).toLowerCase().includes(q))
      .sort((a, b) => a.due - b.due);
    if (!cards.length) return `<p class="empty-txt">${q ? 'Aucun résultat.' : 'Aucune carte pour le moment. Ajoute ta première carte ci-dessus.'}</p>`;
    return `<ul class="card-list">${cards
      .map(
        (c) => `<li style="--fc:${cardColor(c)}"><div class="cl-front" data-preview="${c.id}">${c.section ? `<small class="cl-sec">${esc(c.section)}</small>` : ''}${inline(c.front)}</div><div class="cl-back">${inline(c.back.split('\n')[0])}${c.back.includes('\n') ? ' …' : ''}</div>
        <div class="cl-meta">${isDue(c, now) ? '<span class="pill due">à réviser</span>' : `<span class="muted">${relTime(c.due)}</span>`}
        <button class="icon-btn" data-edit="${c.id}" title="Modifier">${icon('edit', 15)}</button>
        <button class="icon-btn" data-del="${c.id}" title="Supprimer">${icon('trash', 15)}</button></div></li>`,
      )
      .join('')}</ul>`;
  }
  function draw() {
    const cards = cardsOf(deck.id);
    const due = cards.filter((c) => isDue(c)).length;
    const sub = getSubject(deck.subjectId);
    el.innerHTML = `
      <a href="#/flashcards" class="back-link">${icon('back', 16)} Flashcards</a>
      <div class="page-head"><div><h1>${esc(deck.name)}</h1><p class="muted">${esc(sub?.name || 'Sans matière')} · ${cards.length} carte${cards.length > 1 ? 's' : ''}${deck.courseId && getCourse(deck.courseId) ? ` · <a href="#/cours/${deck.courseId}">voir le cours</a>` : ''}</p></div>
        <div class="head-actions">
          ${due ? `<a class="btn primary" href="#/reviser/${deck.id}">${icon('zap')} Réviser (${due})</a>` : cards.length ? `<a class="btn" href="#/reviser/${deck.id}?libre=1">Entraînement libre</a>` : ''}
          <button class="btn ghost" data-act="import">${icon('upload', 16)} Importer</button>
          <button class="btn ghost" data-act="rename">${icon('edit', 16)}</button>
          <button class="btn ghost danger-txt" data-act="delete">${icon('trash', 16)}</button></div></div>
      <form class="add-card panel" data-add>
        <textarea name="front" rows="2" placeholder="Recto — la question" required></textarea>
        <textarea name="back" rows="2" placeholder="Verso — la réponse (- **mot-clé** : …, ==essentiel==)" required></textarea>
        <button class="btn primary">${icon('plus')} Ajouter <kbd>Ctrl+Entrée</kbd></button>
        <details class="add-more"><summary>Options : piège, section</summary>
          <input name="trap" placeholder="⚠️ Piège à éviter (optionnel)">
          <input name="section" list="sections-dl2" placeholder="Section (ex : Droit)">
          <datalist id="sections-dl2">${allSections().map((x) => `<option value="${esc(x)}">`).join('')}</datalist></details>
      </form>
      <div class="filter-bar"><label class="search-in">${icon('search', 16)}<input type="search" placeholder="Rechercher une carte…" data-q value="${esc(q)}"></label></div>
      <div data-list>${listHtml()}</div>`;
  }
  draw();

  el.onsubmit = (e) => {
    if (!e.target.matches('[data-add]')) return;
    e.preventDefault();
    const f = new FormData(e.target);
    const front = f.get('front').trim();
    const back = f.get('back').trim();
    if (!front || !back) return;
    const section = (f.get('section') || '').trim();
    state.cards.push(newCard(deck.id, front, back, { trap: (f.get('trap') || '').trim(), section, color: section ? sectionColor(section) : '' }));
    save();
    e.target.reset();
    $('[data-list]', el).innerHTML = listHtml();
    e.target.front.focus();
    toast('Carte ajoutée', 'success');
  };
  el.onkeydown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && e.target.closest('[data-add]')) $('[data-add]', el).requestSubmit();
  };
  el.oninput = (e) => {
    if (e.target.matches('[data-q]')) {
      q = e.target.value.toLowerCase();
      $('[data-list]', el).innerHTML = listHtml();
    }
  };
  el.onclick = async (e) => {
    const pv = e.target.closest('[data-preview]');
    if (pv) {
      const c = state.cards.find((x) => x.id === pv.dataset.preview);
      openModal(`${cardFace(c)}<div class="modal-actions"><button class="btn primary" data-close>Fermer</button></div>`, { wide: true });
      return;
    }
    const ed = e.target.closest('[data-edit]');
    if (ed) return editCard(state.cards.find((c) => c.id === ed.dataset.edit), () => ($('[data-list]', el).innerHTML = listHtml()));
    const del = e.target.closest('[data-del]');
    if (del) {
      state.cards = state.cards.filter((c) => c.id !== del.dataset.del);
      save();
      $('[data-list]', el).innerHTML = listHtml();
      return;
    }
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'import') bulkImport(deck, draw);
    if (a === 'rename') {
      const v = await formModal('Modifier le paquet', [
        { name: 'name', label: 'Nom', value: deck.name, required: true },
        { name: 'subjectId', label: 'Matière', type: 'select', value: deck.subjectId || '', options: subjectOptions() },
      ]);
      if (v?.name) {
        deck.name = v.name.trim();
        deck.subjectId = v.subjectId || null;
        save();
        draw();
      }
    }
    if (a === 'delete' && (await confirmBox(`Supprimer le paquet « ${deck.name} » et ses ${cardsOf(deck.id).length} cartes ?`, { danger: true, ok: 'Supprimer' }))) {
      state.cards = state.cards.filter((c) => c.deckId !== deck.id);
      state.decks = state.decks.filter((d) => d.id !== deck.id);
      save();
      location.hash = '#/flashcards';
    }
  };
}
