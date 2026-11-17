import { state, save, uid, getSubject, getCourse, deckForCourse, ensureDeckForCourse, cardsOf, newCard, SUBJECT_COLORS } from '../store.js';
import { files } from '../db.js';
import { esc, icon, relTime, formModal, confirmBox, openModal, toast, download, debounce, fmtSize, $, $$ } from '../ui.js';
import { md, stripMd } from '../md.js';
import { extractCards } from '../srs.js';
import { INSTRUCTIONS, MAX_CARDS, generateFromFiles, importCourseMarkdown } from '../ai.js';

const subjectOptions = (withNone = true) => [
  ...(withNone ? [{ value: '', label: 'Sans matière' }] : []),
  ...state.subjects.map((s) => ({ value: s.id, label: s.name })),
];

export async function newCourse(subjectId = '') {
  const v = await formModal(
    'Nouveau cours',
    [
      { name: 'title', label: 'Titre', placeholder: 'Ex : Chapitre 3 — Les arbres binaires', required: true },
      { name: 'subjectId', label: 'Matière', type: 'select', value: subjectId, options: subjectOptions() },
    ],
    'Créer',
  );
  if (!v?.title) return;
  const c = { id: uid(), title: v.title.trim(), subjectId: v.subjectId || null, content: `# ${v.title.trim()}\n\n`, tags: [], attachments: [], createdAt: Date.now(), updatedAt: Date.now() };
  state.courses.push(c);
  save();
  location.hash = `#/cours/${c.id}`;
}

async function manageSubjects(onDone) {
  const render = () =>
    `<h3>Matières</h3>
     <ul class="subject-admin">${
       state.subjects
         .map(
           (s) => `<li><span class="dot lg" style="background:${s.color}"></span><b>${esc(s.name)}</b>
             <small>${state.courses.filter((c) => c.subjectId === s.id).length} cours</small>
             <button class="icon-btn" data-edit="${s.id}" title="Modifier">${icon('edit', 16)}</button>
             <button class="icon-btn" data-del="${s.id}" title="Supprimer">${icon('trash', 16)}</button></li>`,
         )
         .join('') || '<li class="muted">Aucune matière</li>'
     }</ul>
     <div class="modal-actions"><button class="btn ghost" data-close>Fermer</button><button class="btn primary" data-add>${icon('plus')} Nouvelle matière</button></div>`;
  openModal(render(), {
    onClose: onDone,
    onMount: (m) => {
      m.onclick = async (e) => {
        const t = e.target.closest('button');
        if (!t) return;
        if (t.dataset.add !== undefined || t.dataset.edit) {
          const s = t.dataset.edit ? getSubject(t.dataset.edit) : null;
          const v = await formModal(s ? 'Modifier la matière' : 'Nouvelle matière', [
            { name: 'name', label: 'Nom', value: s?.name, required: true, placeholder: 'Ex : Bases de données' },
            { name: 'color', label: 'Couleur', type: 'color', value: s?.color || SUBJECT_COLORS[state.subjects.length % SUBJECT_COLORS.length], options: SUBJECT_COLORS },
          ]);
          if (v?.name) {
            if (s) Object.assign(s, { name: v.name.trim(), color: v.color || s.color });
            else state.subjects.push({ id: uid(), name: v.name.trim(), color: v.color || SUBJECT_COLORS[0], createdAt: Date.now() });
            save();
          }
        } else if (t.dataset.del) {
          if (await confirmBox('Supprimer cette matière ?', { danger: true, ok: 'Supprimer', detail: 'Les cours associés sont conservés (sans matière).' })) {
            state.subjects = state.subjects.filter((s) => s.id !== t.dataset.del);
            state.courses.forEach((c) => c.subjectId === t.dataset.del && (c.subjectId = null));
            state.decks.forEach((d) => d.subjectId === t.dataset.del && (d.subjectId = null));
            save();
          }
        } else return;
        const html = render();
        m.innerHTML = html;
        $$('[data-close]', m).forEach((b) => (b.onclick = () => m.parentElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))));
      };
    },
  });
}

/* ---------- Création depuis des photos ---------- */
export function photosModal(subjectId = '') {
  const hasKey = !!state.settings.apiKey?.trim();
  const subjOpts = `<option value="">Sans matière</option>${state.subjects.map((s) => `<option value="${s.id}" ${s.id === subjectId ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}`;
  openModal(
    `<h3>📸 Nouveau cours depuis tes photos</h3>
     <p class="muted small">Claude lit tes photos ou ton PDF et crée une fiche synthétique de ${MAX_CARDS} flashcards maximum, dans le même style que la CEJM.</p>
     <div class="seg" data-tabs><button class="on" data-tab="auto">⚡ Tout dans l'appli</button><button data-tab="manual">💬 Via l'appli Claude</button></div>

     <div data-pane="auto">
       ${
         hasKey
           ? `<label class="drop"><input type="file" accept="image/*,application/pdf" multiple data-files><span>📷 Prendre ou choisir des photos (ou un PDF)</span></label>
              <p class="muted small" data-count>Aucun fichier</p>
              <label class="field"><span>Matière</span><select data-subject>${subjOpts}</select></label>
              <label class="field"><span>Précision (optionnel)</span><input data-hint placeholder="Ex : chapitre 4, les jointures SQL"></label>
              <p class="gen-status" data-status hidden></p>
              <div class="modal-actions"><button class="btn ghost" data-close>Annuler</button><button class="btn primary" data-gen disabled>Créer la fiche</button></div>`
           : `<div class="key-setup">
                <p><b>Une seule fois :</b> colle ta clé API Claude. Ensuite tu prends tes photos et l'appli crée tout, sans quitter ClaudeNote.</p>
                <ol class="steps small">
                  <li>Ouvre <a href="https://platform.claude.com/" target="_blank" rel="noopener">platform.claude.com</a> et connecte-toi</li>
                  <li>Ajoute un peu de crédit (Billing) : compte environ 10 à 15 centimes par cours</li>
                  <li>API Keys → <b>Create Key</b> → copie la clé (sk-ant-…)</li>
                </ol>
                <label class="field"><span>Ta clé API</span><input type="password" data-newkey autocomplete="off" placeholder="sk-ant-…"></label>
                <div class="modal-actions"><button class="btn primary" data-savekey>Enregistrer et continuer</button></div>
                <p class="muted small">C'est un compte différent de ton abonnement Claude, payé à l'usage. La clé reste uniquement sur ce téléphone.</p>
              </div>`
       }
     </div>

     <div data-pane="manual" hidden>
       <ol class="steps">
         <li><button class="btn sm primary" data-copy>Copier les instructions</button></li>
         <li>Ouvre <a href="https://claude.ai/new" target="_blank" rel="noopener">Claude</a>, colle les instructions et ajoute tes photos</li>
         <li>Copie la réponse de Claude et colle-la ici :</li>
       </ol>
       <textarea rows="7" data-paste placeholder="# Titre du cours&#10;&#10;::: Grand thème&#10;### Sous-partie&#10;- **Notion** : explication&#10;:::"></textarea>
       <label class="field"><span>Matière</span><select data-subject2>${subjOpts}</select></label>
       <div class="modal-actions"><button class="btn ghost" data-close>Annuler</button><button class="btn primary" data-import>Créer le cours</button></div>
     </div>`,
    {
      wide: true,
      onMount: (m, close) => {
        let picked = [];
        const finish = (r) => {
          close();
          toast(`Cours créé avec ${r.cards} flashcard${r.cards > 1 ? 's' : ''} ✨`, 'success');
          location.hash = `#/cours/${r.course.id}`;
        };
        m.addEventListener('click', async (e) => {
          if (e.target.closest('[data-savekey]')) {
            const k = $('[data-newkey]', m).value.trim();
            if (!/^sk-ant-/.test(k)) return toast('La clé doit commencer par sk-ant-', 'error');
            state.settings.apiKey = k;
            save();
            close();
            toast('Clé enregistrée ✅', 'success');
            photosModal(subjectId); // on rouvre directement sur la prise de photos
            return;
          }
          const tab = e.target.closest('[data-tab]');
          if (tab) {
            $$('[data-tab]', m).forEach((b) => b.classList.toggle('on', b === tab));
            $$('[data-pane]', m).forEach((p) => (p.hidden = p.dataset.pane !== tab.dataset.tab));
            return;
          }
          if (e.target.closest('[data-copy]')) {
            try {
              await navigator.clipboard.writeText(INSTRUCTIONS);
              toast('Instructions copiées 📋', 'success');
            } catch {
              toast('Copie impossible : réessaie', 'error');
            }
            return;
          }
          if (e.target.closest('[data-import]')) {
            const txt = $('[data-paste]', m).value.trim();
            if (!/:::\s+\S/.test(txt)) return toast("Je ne trouve pas de bloc « ::: » : colle toute la réponse de Claude", 'error');
            finish(importCourseMarkdown(txt, $('[data-subject2]', m).value));
            return;
          }
          const gen = e.target.closest('[data-gen]');
          if (gen && picked.length) {
            const status = $('[data-status]', m);
            gen.disabled = true;
            status.hidden = false;
            status.textContent = '⏳ Envoi des documents à Claude…';
            try {
              const text = await generateFromFiles(picked, {
                hint: $('[data-hint]', m).value.trim(),
                onProgress: (n) => (status.textContent = `✍️ Claude rédige ta fiche… ${n} caractères`),
              });
              finish(importCourseMarkdown(text, $('[data-subject]', m).value));
            } catch (err) {
              status.textContent = `❌ ${err.message}`;
              gen.disabled = false;
            }
          }
        });
        m.addEventListener('change', (e) => {
          if (!e.target.matches('[data-files]')) return;
          picked = [...e.target.files];
          $('[data-count]', m).textContent = picked.length ? `${picked.length} fichier${picked.length > 1 ? 's' : ''} : ${picked.map((f) => f.name).join(', ')}` : 'Aucun fichier';
          $('[data-gen]', m).disabled = !picked.length;
        });
      },
    },
  );
}

export function coursesList(el, { query }) {
  let filter = query.get('s') || '';
  let q = '';
  function draw() {
    const list = state.courses
      .filter((c) => !filter || (filter === 'none' ? !c.subjectId : c.subjectId === filter))
      .filter((c) => !q || (c.title + ' ' + c.content).toLowerCase().includes(q))
      .sort((a, b) => b.updatedAt - a.updatedAt);
    const count = (id) => state.courses.filter((c) => c.subjectId === id).length;
    el.innerHTML = `
      <div class="page-head"><h1>Mes cours</h1>
        <div class="head-actions"><button class="btn ghost" data-act="subjects">Matières</button>
        <button class="btn" data-act="new">${icon('plus')} Nouveau cours</button>
        <button class="btn primary" data-act="photos">📸 Depuis mes photos</button></div></div>
      <div class="filter-bar">
        <div class="chips">
          <button class="chip ${!filter ? 'on' : ''}" data-f="">Tous <small>${state.courses.length}</small></button>
          ${state.subjects.map((s) => `<button class="chip ${filter === s.id ? 'on' : ''}" data-f="${s.id}"><span class="dot" style="background:${s.color}"></span>${esc(s.name)} <small>${count(s.id)}</small></button>`).join('')}
          ${state.courses.some((c) => !c.subjectId) ? `<button class="chip ${filter === 'none' ? 'on' : ''}" data-f="none">Sans matière</button>` : ''}
        </div>
        <label class="search-in">${icon('search', 16)}<input type="search" placeholder="Filtrer…" value="${esc(q)}" data-q></label>
      </div>
      ${
        list.length
          ? `<div class="course-grid">${list
              .map((c) => {
                const sub = getSubject(c.subjectId);
                const deck = deckForCourse(c.id);
                const n = deck ? cardsOf(deck.id).length : 0;
                return `<a class="course-card" href="#/cours/${c.id}" style="--c:${sub?.color || '#94a3b8'}">
                  <div class="cc-top"><span class="tag">${esc(sub?.name || 'Sans matière')}</span>${c.attachments?.length ? `<span class="muted">${icon('clip', 14)}${c.attachments.length}</span>` : ''}</div>
                  <h3>${esc(c.title)}</h3>
                  <p>${esc(stripMd(c.content.replace(/^#.*$/m, '')).slice(0, 140)) || '<i>Vide</i>'}</p>
                  <div class="cc-foot"><span>${icon('cards', 14)} ${n} carte${n > 1 ? 's' : ''}</span><time>${relTime(c.updatedAt)}</time></div></a>`;
              })
              .join('')}</div>`
          : `<div class="empty">${icon('book', 40)}<h3>Aucun cours ici</h3><p>Crée ton premier cours et prends tes notes en Markdown.</p><button class="btn primary" data-act="new">${icon('plus')} Nouveau cours</button></div>`
      }`;
  }
  draw();
  el.onclick = (e) => {
    const f = e.target.closest('[data-f]');
    if (f) {
      filter = f.dataset.f;
      draw();
      return;
    }
    const a = e.target.closest('[data-act]');
    if (a?.dataset.act === 'new') newCourse(filter && filter !== 'none' ? filter : '');
    if (a?.dataset.act === 'photos') photosModal(filter && filter !== 'none' ? filter : '');
    if (a?.dataset.act === 'subjects') manageSubjects(draw);
  };
  el.oninput = (e) => {
    if (e.target.matches('[data-q]')) {
      q = e.target.value.toLowerCase();
      const pos = e.target.selectionStart;
      draw();
      const inp = $('[data-q]', el);
      inp.focus();
      inp.setSelectionRange(pos, pos);
    }
  };
}

function generateModal(course, onDone) {
  const found = extractCards(course.content);
  const deck = deckForCourse(course.id);
  const existing = new Set((deck ? cardsOf(deck.id) : []).map((c) => c.front.trim().toLowerCase()));
  if (!found.length) {
    openModal(`<h3>Aucune flashcard détectée</h3>
      <p>Écris tes cartes directement dans ton cours avec l'une de ces syntaxes :</p>
      <pre><code>::: Question (carte riche)
- **mot-clé** : explication
==l'essentiel surligné==
!! piège à éviter
:::

Question :: Réponse
Q : Question
R : Réponse
- **Terme** : définition</code></pre>
      <div class="modal-actions"><button class="btn primary" data-close>OK</button></div>`);
    return;
  }
  openModal(
    `<h3>${icon('zap')} ${found.length} flashcard${found.length > 1 ? 's' : ''} détectée${found.length > 1 ? 's' : ''}</h3>
     <p class="muted">Elles seront ajoutées au paquet « ${esc(course.title)} ».</p>
     <ul class="gen-list">${found
       .map((c, i) => {
         const dup = existing.has(c.front.trim().toLowerCase());
         return `<li class="${dup ? 'dup' : ''}" style="--fc:${c.color}"><label><input type="checkbox" data-i="${i}" ${dup ? '' : 'checked'}>
           <div>${c.section ? `<small class="cl-sec">${esc(c.section)}${c.sub ? ' · ' + esc(c.sub) : ''}</small>` : ''}<b>${esc(c.front)}</b><span>${esc(stripMd(c.back)).slice(0, 160)}</span>${c.trap ? `<span class="gen-trap">⚠️ ${esc(c.trap)}</span>` : ''}${dup ? '<em>déjà dans le paquet — coche pour la mettre à jour</em>' : ''}</div></label></li>`;
       })
       .join('')}</ul>
     <div class="modal-actions"><button class="btn ghost" data-close>Annuler</button><button class="btn primary" data-go>Ajouter la sélection</button></div>`,
    {
      wide: true,
      onMount: (m, close) => {
        $('[data-go]', m).onclick = () => {
          const picked = $$('input[data-i]:checked', m).map((i) => found[+i.dataset.i]);
          if (!picked.length) return close();
          const d = ensureDeckForCourse(course);
          let added = 0;
          let updated = 0;
          picked.forEach((c) => {
            const extra = { trap: c.trap || '', section: c.section, sub: c.sub, color: c.color };
            const ex = cardsOf(d.id).find((x) => x.front.trim().toLowerCase() === c.front.trim().toLowerCase());
            if (ex) {
              Object.assign(ex, { back: c.back, ...extra });
              updated++;
            } else {
              state.cards.push(newCard(d.id, c.front, c.back, extra));
              added++;
            }
          });
          save();
          toast(`${added} carte(s) ajoutée(s)${updated ? `, ${updated} mise(s) à jour` : ''} ✨`, 'success');
          close();
          onDone?.();
        };
      },
    },
  );
}

export function courseView(el, { params: [id] }) {
  const course = getCourse(id);
  if (!course) {
    el.innerHTML = `<div class="empty"><h3>Cours introuvable</h3><a class="btn" href="#/cours">Retour aux cours</a></div>`;
    return;
  }
  course.attachments ||= [];
  // Un cours s'ouvre en lecture (mis en forme) ; « Écrire » sert seulement à modifier
  let mode = course.content.trim().split('\n').length > 2 ? 'read' : window.innerWidth > 1100 ? 'split' : 'edit';
  const blobUrls = [];

  const headerHtml = () => {
    const deck = deckForCourse(course.id);
    const n = deck ? cardsOf(deck.id).length : 0;
    const detected = extractCards(course.content).length;
    return `
      <a href="#/cours" class="back-link">${icon('back', 16)} Cours</a>
      <div class="course-head">
        <input class="title-input" value="${esc(course.title)}" data-title aria-label="Titre du cours">
        <div class="course-meta">
          <select data-subject>${subjectOptions().map((o) => `<option value="${o.value}" ${o.value === (course.subjectId || '') ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}</select>
          <span class="muted save-state" data-saved>Enregistré</span>
        </div>
      </div>
      <div class="toolbar">
        <div class="seg">${[['edit', 'Écrire'], ['split', 'Côte à côte'], ['read', 'Lire']].map(([k, l]) => `<button class="${mode === k ? 'on' : ''}" data-mode="${k}">${l}</button>`).join('')}</div>
        <button class="btn sm" data-act="gen">${icon('zap', 16)} Générer les flashcards <span class="pill">${detected}</span></button>
        ${n ? `<a class="btn sm" href="#/reviser/${deck.id}">${icon('cards', 16)} Réviser (${n})</a><a class="btn sm ghost" href="#/flashcards/${deck.id}">Gérer les cartes</a>` : ''}
        <span class="spacer"></span>
        ${n ? `<a class="btn sm" href="#/feuille/${deck.id}">⛶ Fiche complète</a>` : ''}
        <button class="btn sm ghost" data-act="attach">${icon('clip', 16)} Joindre</button>
        <button class="btn sm ghost" data-act="export" title="Exporter en Markdown">${icon('download', 16)}</button>
        <button class="btn sm ghost danger-txt" data-act="delete" title="Supprimer">${icon('trash', 16)}</button>
        <input type="file" multiple hidden data-file>
      </div>`;
  };

  const attachHtml = () =>
    course.attachments.length
      ? `<h4>${icon('clip', 16)} Pièces jointes</h4><ul class="attach-list">${course.attachments
          .map((a) => `<li><button class="link" data-open="${a.id}">${esc(a.name)}</button><small>${fmtSize(a.size)}</small><button class="icon-btn" data-rm="${a.id}" title="Retirer">${icon('x', 14)}</button></li>`)
          .join('')}</ul>`
      : '';

  el.innerHTML = `
    <div data-header>${headerHtml()}</div>
    <div class="editor-wrap mode-${mode}" data-wrap>
      <textarea class="editor" data-editor spellcheck="true" placeholder="Écris ton cours en Markdown…">${esc(course.content)}</textarea>
      <article class="preview md" data-preview>${md(course.content)}</article>
    </div>
    <div class="attachments" data-attach>${attachHtml()}</div>
    <details class="help"><summary>Aide Markdown & flashcards</summary>
      <div class="help-grid">
        <div><code># Titre</code>, <code>## Sous-titre</code></div><div><code>**gras**</code>, <code>*italique*</code>, <code>==surligné==</code></div>
        <div><code>- liste</code>, <code>1. liste</code>, <code>- [ ] tâche</code></div><div><code>\`code\`</code> et blocs <code>\`\`\`</code></div>
        <div><code>| a | b |</code> tableaux</div><div><code>&gt; citation</code>, <code>[lien](https://…)</code></div>
        <div><b>Carte riche :</b> <code>::: Question</code> … <code>!! piège</code> … <code>:::</code></div><div><b>Flashcard simple :</b> <code>Question :: Réponse</code></div><div><b>Ou :</b> <code>Q : …</code> puis <code>R : …</code>, ou <code>- **Terme** : déf</code></div>
      </div></details>`;

  const editor = $('[data-editor]', el);
  const preview = $('[data-preview]', el);
  const savedLbl = () => $('[data-saved]', el);

  const refreshHeader = () => ($('[data-header]', el).innerHTML = headerHtml());
  const persist = debounce(() => {
    course.content = editor.value;
    course.updatedAt = Date.now();
    save();
    savedLbl() && (savedLbl().textContent = 'Enregistré');
    refreshHeader();
  }, 500);
  // ajoute un lien « plein écran » sur chaque fiche du cours qui existe dans le paquet
  const setPreview = (src) => {
    preview.innerHTML = md(src);
    const deck = deckForCourse(course.id);
    if (!deck) return;
    const byFront = new Map(cardsOf(deck.id).map((c) => [c.front.trim().toLowerCase(), c.id]));
    $$('.fiche-head', preview).forEach((h) => {
      const id = byFront.get(h.textContent.trim().toLowerCase());
      if (id) h.insertAdjacentHTML('beforeend', `<a class="ff-open" href="#/fiche/${id}" title="Plein écran">⛶</a>`);
    });
  };
  setPreview(course.content);
  const renderPreview = debounce(() => setPreview(editor.value), 120);

  editor.addEventListener('input', () => {
    savedLbl() && (savedLbl().textContent = 'Modification…');
    renderPreview();
    persist();
  });
  editor.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      editor.setRangeText('  ', editor.selectionStart, editor.selectionEnd, 'end');
      editor.dispatchEvent(new Event('input'));
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      persist();
      toast('Cours enregistré', 'success');
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'i')) {
      e.preventDefault();
      const w = e.key === 'b' ? '**' : '*';
      const { selectionStart: s, selectionEnd: t } = editor;
      editor.setRangeText(w + editor.value.slice(s, t) + w, s, t, 'select');
      editor.dispatchEvent(new Event('input'));
    }
  });

  el.onchange = async (e) => {
    if (e.target.matches('[data-subject]')) {
      course.subjectId = e.target.value || null;
      const d = deckForCourse(course.id);
      if (d) d.subjectId = course.subjectId;
      save();
    }
    if (e.target.matches('[data-file]')) {
      for (const f of e.target.files) {
        const fid = uid();
        try {
          await files.set(fid, f);
          course.attachments.push({ id: fid, name: f.name, type: f.type, size: f.size });
        } catch (err) {
          toast(`Impossible d'enregistrer ${f.name}`, 'error');
        }
      }
      save();
      $('[data-attach]', el).innerHTML = attachHtml();
      toast('Fichier(s) joint(s)', 'success');
    }
  };
  el.oninput = (e) => {
    if (e.target.matches('[data-title]')) {
      course.title = e.target.value || 'Sans titre';
      course.updatedAt = Date.now();
      const d = deckForCourse(course.id);
      if (d) d.name = course.title;
      save();
    }
  };
  el.onclick = async (e) => {
    const m = e.target.closest('[data-mode]');
    if (m) {
      mode = m.dataset.mode;
      $('[data-wrap]', el).className = `editor-wrap mode-${mode}`;
      $$('[data-mode]', el).forEach((b) => b.classList.toggle('on', b === m));
      if (mode === 'read') setPreview(editor.value);
      return;
    }
    const op = e.target.closest('[data-open]');
    if (op) {
      const blob = await files.get(op.dataset.open);
      if (!blob) return toast('Fichier introuvable', 'error');
      const url = URL.createObjectURL(blob);
      blobUrls.push(url);
      window.open(url, '_blank');
      return;
    }
    const rm = e.target.closest('[data-rm]');
    if (rm && (await confirmBox('Retirer cette pièce jointe ?', { danger: true, ok: 'Retirer' }))) {
      await files.del(rm.dataset.rm).catch(() => {});
      course.attachments = course.attachments.filter((a) => a.id !== rm.dataset.rm);
      save();
      $('[data-attach]', el).innerHTML = attachHtml();
      return;
    }
    const a = e.target.closest('[data-act]');
    if (!a) return;
    const act = a.dataset.act;
    if (act === 'gen') {
      course.content = editor.value;
      generateModal(course, refreshHeader);
    }
    if (act === 'attach') $('[data-file]', el).click();
    if (act === 'export') download(`${course.title.replace(/[^\w\-éèàùç ]+/gi, '_')}.md`, editor.value, 'text/markdown');
    if (act === 'delete' && (await confirmBox(`Supprimer « ${course.title} » ?`, { danger: true, ok: 'Supprimer', detail: 'Les flashcards associées sont conservées.' }))) {
      for (const at of course.attachments) await files.del(at.id).catch(() => {});
      state.courses = state.courses.filter((c) => c.id !== course.id);
      const d = deckForCourse(course.id);
      if (d) d.courseId = null;
      save();
      location.hash = '#/cours';
    }
  };

  if (!course.content.trim() || course.content.trim() === `# ${course.title}`) editor.focus();

  return () => {
    if (editor.value !== course.content) {
      course.content = editor.value;
      course.updatedAt = Date.now();
      save();
    }
    blobUrls.forEach((u) => setTimeout(() => URL.revokeObjectURL(u), 60e3));
  };
}
