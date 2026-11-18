// Onglet « Cours » : la liste des cours (vignettes A4), la recherche, et l'ajout d'un cours.
import { state, save, uid, getSubject, SUBJECT_COLORS } from '../store.js';
import { esc, icon, relTime, formModal, confirmBox, openModal, toast, $, $$ } from '../ui.js';
import { stripMd } from '../md.js';
import { INSTRUCTIONS, MAX_CARDS, generateFromFiles, importCourseMarkdown } from '../ai.js';
import { PACKS, importPack, packInstalled } from '../packs.js';
import { courseCards, courseDue, createCourse } from '../library.js';
import { coursePageHtml, mountA4 } from '../a4.js';

const subjectOptions = (withNone = true) => [
  ...(withNone ? [{ value: '', label: 'Sans matière' }] : []),
  ...state.subjects.map((s) => ({ value: s.id, label: s.name })),
];

/* ---------- Ajouter un cours : 4 façons, présentées simplement ---------- */
export function addCourseModal(subjectId = '') {
  const packs = PACKS.filter((p) => !packInstalled(p.id));
  openModal(
    `<h3>Ajouter un cours</h3>
     <div class="choice-list">
       <button class="choice" data-c="photos"><span>📸</span><div><b>Depuis mes photos</b><small>Prends ton cours en photo (ou un PDF) : Claude crée la fiche et les flashcards</small></div></button>
       <button class="choice" data-c="paste"><span>📋</span><div><b>Coller une réponse de Claude</b><small>Tu as fait la fiche dans l'appli Claude ? Colle-la ici</small></div></button>
       <button class="choice" data-c="write"><span>✍️</span><div><b>Écrire moi-même</b><small>Une fiche vide à remplir</small></div></button>
       ${packs.map((p) => `<button class="choice" data-pack="${p.id}"><span>📦</span><div><b>${esc(p.title)}</b><small>Cours prêt à l'emploi : ${esc(p.desc)}</small></div></button>`).join('')}
     </div>
     <div class="modal-actions"><button class="btn ghost" data-close>Annuler</button></div>`,
    {
      onMount: (m, close) => {
        m.addEventListener('click', async (e) => {
          const c = e.target.closest('[data-c]')?.dataset.c;
          const pk = e.target.closest('[data-pack]')?.dataset.pack;
          if (!c && !pk) return;
          close();
          if (c === 'photos') photosModal(subjectId, 'auto');
          if (c === 'paste') photosModal(subjectId, 'manual');
          if (c === 'write') {
            const v = await formModal(
              'Nouveau cours',
              [
                { name: 'title', label: 'Titre', placeholder: 'Ex : SQL — les jointures', required: true },
                { name: 'subjectId', label: 'Matière', type: 'select', value: subjectId, options: subjectOptions() },
              ],
              'Créer',
            );
            if (v?.title) location.hash = `#/cours/${createCourse({ title: v.title, subjectId: v.subjectId }).id}/modifier`;
          }
          if (pk) {
            try {
              const r = await importPack(pk);
              toast('Cours ajouté ✨', 'success');
              location.hash = `#/cours/${r.courseId}`;
            } catch {
              toast('Impossible de charger ce cours (hors ligne ?)', 'error');
            }
          }
        });
      },
    },
  );
}

export function manageSubjects(onDone) {
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
    onMount: (m, close) => {
      m.onclick = async (e) => {
        const t = e.target.closest('button');
        if (!t || t.hasAttribute('data-close')) return;
        if (t.dataset.add !== undefined || t.dataset.edit) {
          const s = t.dataset.edit ? getSubject(t.dataset.edit) : null;
          const v = await formModal(s ? 'Modifier la matière' : 'Nouvelle matière', [
            { name: 'name', label: 'Nom', value: s?.name, required: true, placeholder: 'Ex : Maths' },
            { name: 'color', label: 'Couleur', type: 'color', value: s?.color || SUBJECT_COLORS[state.subjects.length % SUBJECT_COLORS.length], options: SUBJECT_COLORS },
          ]);
          if (v?.name) {
            if (s) Object.assign(s, { name: v.name.trim(), color: v.color || s.color });
            else state.subjects.push({ id: uid(), name: v.name.trim(), color: v.color || SUBJECT_COLORS[0], createdAt: Date.now() });
            save();
          }
        } else if (t.dataset.del) {
          if (await confirmBox('Supprimer cette matière ?', { danger: true, ok: 'Supprimer', detail: 'Les cours sont conservés (sans matière).' })) {
            state.subjects = state.subjects.filter((s) => s.id !== t.dataset.del);
            state.courses.forEach((c) => c.subjectId === t.dataset.del && (c.subjectId = null));
            state.decks.forEach((d) => d.subjectId === t.dataset.del && (d.subjectId = null));
            save();
          }
        } else return;
        m.innerHTML = render();
        $$('[data-close]', m).forEach((b) => (b.onclick = close));
      };
    },
  });
}

/* ---------- Création depuis des photos (ou en collant la réponse de Claude) ---------- */
export function photosModal(subjectId = '', tab = 'auto') {
  const hasKey = !!state.settings.apiKey?.trim();
  const subjOpts = `<option value="">Sans matière</option>${state.subjects.map((s) => `<option value="${s.id}" ${s.id === subjectId ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}`;
  openModal(
    `<h3>${tab === 'auto' ? '📸 Cours depuis mes photos' : '📋 Coller une réponse de Claude'}</h3>
     <div class="seg" data-tabs><button class="${tab === 'auto' ? 'on' : ''}" data-tab="auto">⚡ Tout dans l'appli</button><button class="${tab === 'manual' ? 'on' : ''}" data-tab="manual">💬 Via l'appli Claude</button></div>

     <div data-pane="auto" ${tab === 'auto' ? '' : 'hidden'}>
       ${
         hasKey
           ? `<label class="drop"><input type="file" accept="image/*,application/pdf" multiple data-files><span>📷 Prendre ou choisir des photos (ou un PDF)</span></label>
              <p class="muted small" data-count>Aucun fichier</p>
              <label class="field"><span>Matière</span><select data-subject>${subjOpts}</select></label>
              <label class="field"><span>Précision (optionnel)</span><input data-hint placeholder="Ex : chapitre 4, les jointures SQL"></label>
              <p class="gen-status" data-status hidden></p>
              <div class="modal-actions"><button class="btn ghost" data-close>Annuler</button><button class="btn primary" data-gen disabled>Créer le cours</button></div>`
           : `<div class="key-setup">
                <p><b>Une seule fois :</b> colle ta clé API Claude. Ensuite tu prends tes photos et l'appli crée tout, sans quitter ClaudeNote.</p>
                <ol class="steps small">
                  <li>Ouvre <a href="https://platform.claude.com/" target="_blank" rel="noopener">platform.claude.com</a> et connecte-toi</li>
                  <li>Ajoute un peu de crédit (Billing) : compte environ 10 à 15 centimes par cours</li>
                  <li>API Keys → <b>Create Key</b> → copie la clé (sk-ant-…)</li>
                </ol>
                <label class="field"><span>Ta clé API</span><input type="password" data-newkey autocomplete="off" placeholder="sk-ant-…"></label>
                <div class="modal-actions"><button class="btn primary" data-savekey>Enregistrer et continuer</button></div>
                <p class="muted small">Compte différent de ton abonnement Claude, payé à l'usage. La clé reste uniquement sur ce téléphone.</p>
              </div>`
       }
     </div>

     <div data-pane="manual" ${tab === 'manual' ? '' : 'hidden'}>
       <ol class="steps">
         <li><button class="btn sm primary" data-copy>Copier les instructions</button></li>
         <li>Ouvre <a href="https://claude.ai/new" target="_blank" rel="noopener">Claude</a>, colle les instructions et ajoute tes photos</li>
         <li>Copie la réponse de Claude et colle-la ici :</li>
       </ol>
       <textarea rows="7" data-paste placeholder="# Titre du cours&#10;&#10;::: Grand thème&#10;### Sous-partie&#10;- **Notion** : explication&#10;:::"></textarea>
       <label class="field"><span>Matière</span><select data-subject2>${subjOpts}</select></label>
       <div class="modal-actions"><button class="btn ghost" data-close>Annuler</button><button class="btn primary" data-import>Créer le cours</button></div>
     </div>
     <p class="muted small">Le cours fera ${MAX_CARDS} parties au maximum : chacune devient une flashcard.</p>`,
    {
      wide: true,
      onMount: (m, close) => {
        let picked = [];
        const finish = (r) => {
          close();
          toast(`Cours créé : ${r.cards} flashcard${r.cards > 1 ? 's' : ''} ✨`, 'success');
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
            photosModal(subjectId, 'auto');
            return;
          }
          const t = e.target.closest('[data-tab]');
          if (t) {
            $$('[data-tab]', m).forEach((b) => b.classList.toggle('on', b === t));
            $$('[data-pane]', m).forEach((p) => (p.hidden = p.dataset.pane !== t.dataset.tab));
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

/* ---------- Liste des cours ---------- */
export default function coursesView(el, { query }) {
  let filter = query.get('s') || '';
  let q = '';
  let mounted = [];

  function listHtml() {
    const list = state.courses
      .filter((c) => !filter || (filter === 'none' ? !c.subjectId : c.subjectId === filter))
      .filter((c) => !q || `${c.title} ${stripMd(c.content || '')}`.toLowerCase().includes(q))
      .sort((a, b) => b.updatedAt - a.updatedAt);
    if (!list.length)
      return `<div class="empty">${icon('book', 40)}<h3>${q ? 'Aucun cours trouvé' : 'Aucun cours ici'}</h3>${q ? '' : `<button class="btn primary" data-act="add">${icon('plus')} Ajouter un cours</button>`}</div>`;
    return `<div class="course-tiles">${list
      .map((c) => {
        const sub = getSubject(c.subjectId);
        const n = courseCards(c).length;
        const d = courseDue(c);
        return `<a class="tile" href="#/cours/${c.id}" style="--c:${sub?.color || '#94a3b8'}">
          <div class="tile-thumb" data-thumb="${c.id}"></div>
          <div class="tile-info"><span class="tag">${esc(sub?.name || 'Sans matière')}</span>
            <b>${esc(c.title)}</b>
            <small>${n ? `${n} flashcard${n > 1 ? 's' : ''}` : 'Pas de flashcard'}${d ? ` · <span class="due-txt">${d} à réviser</span>` : ''}</small></div></a>`;
      })
      .join('')}</div>`;
  }

  function mountThumbs() {
    mounted.forEach((m) => m.destroy());
    mounted = $$('[data-thumb]', el).map((stage) => {
      const c = state.courses.find((x) => x.id === stage.dataset.thumb);
      return mountA4(stage, coursePageHtml(c), { mode: 'width' });
    });
  }
  const redrawList = () => {
    $('[data-list]', el).innerHTML = listHtml();
    mountThumbs();
  };

  function draw() {
    const count = (id) => state.courses.filter((c) => c.subjectId === id).length;
    el.innerHTML = `
      <div class="page-head"><h1>Mes cours</h1><button class="btn primary" data-act="add">${icon('plus')} Ajouter un cours</button></div>
      <label class="search-in big">${icon('search', 18)}<input type="search" placeholder="Rechercher un cours, une notion…" data-q value="${esc(q)}"></label>
      <div class="chips scroll">
        <button class="chip ${!filter ? 'on' : ''}" data-f="">Tous <small>${state.courses.length}</small></button>
        ${state.subjects.map((s) => `<button class="chip ${filter === s.id ? 'on' : ''}" data-f="${s.id}"><span class="dot" style="background:${s.color}"></span>${esc(s.name)} <small>${count(s.id)}</small></button>`).join('')}
        <button class="chip ghost" data-act="subjects">⚙︎ Matières</button>
      </div>
      <div data-list>${listHtml()}</div>`;
    mountThumbs();
  }
  draw();
  if (query.get('ajouter') === '1') {
    history.replaceState(null, '', '#/cours');
    addCourseModal(filter);
  }

  el.onclick = (e) => {
    const f = e.target.closest('[data-f]');
    if (f) {
      filter = f.dataset.f;
      draw();
      return;
    }
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'add') addCourseModal(filter && filter !== 'none' ? filter : '');
    if (a === 'subjects') manageSubjects(draw);
  };
  el.oninput = (e) => {
    if (e.target.matches('[data-q]')) {
      q = e.target.value.trim().toLowerCase();
      redrawList();
    }
  };
  return () => mounted.forEach((m) => m.destroy());
}
