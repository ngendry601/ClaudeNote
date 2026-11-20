// Onglet « Cours » : le cours complet, tel quel (pas de synthèse ici).
import { state, save, uid, getCourse, cardsOf, questionsOf, subjects, subjectColor, deleteCourse, getFolder, sortedFolders, coursesIn, createFolder, deleteFolder } from '../store.js';
import { files } from '../db.js';
import { esc, icon, relTime, confirmBox, openModal, toast, download, debounce, $, $$ } from '../ui.js';
import { md, stripMd, outline } from '../md.js';
import { addCourseModal, studyModal } from './create.js';

const readingTime = (c) => Math.max(1, Math.round(stripMd(c.content).split(' ').length / 200));
const notFound = (el) => (el.innerHTML = `<div class="empty"><h3>Cours introuvable</h3><a class="btn" href="#/cours">Mes cours</a></div>`);

/* ---------- Dossiers ---------- */
const chev = () => icon('back', 18).replace('<svg', '<svg class="chev"');

/** Créer un dossier, ou modifier un dossier existant (nom + cours qu'il contient) */
export function folderModal(folder = null, onDone = () => {}) {
  const courses = [...state.courses].sort((a, b) => a.title.localeCompare(b.title, 'fr'));
  // nouveau dossier : on coche par défaut tous les cours qui ne sont encore dans aucun dossier
  const checked = (c) => (folder ? c.folderId === folder.id : !getFolder(c.folderId));
  const suggested = state.folders.some((f) => f.name.toLowerCase() === 'bts sio') ? '' : 'BTS SIO';
  openModal(
    `<form class="form"><h3>${folder ? 'Modifier le dossier' : '📁 Nouveau dossier'}</h3>
      <label class="field"><span>Nom du dossier</span><input name="name" required maxlength="60" value="${esc(folder?.name || suggested)}" placeholder="Ex : BTS SIO, Bac, Perso…"></label>
      ${
        courses.length
          ? `<div class="check-head"><span>Cours à mettre dedans</span><button type="button" class="link-btn" data-all>Tout cocher</button></div>
             <div class="check-list">${courses
               .map((c) => {
                 const other = getFolder(c.folderId);
                 return `<label class="check-row"><input type="checkbox" name="c" value="${c.id}" ${checked(c) ? 'checked' : ''}>
                   <div><b>${esc(c.title)}</b><small>${esc(c.subject || 'Sans matière')}${other && other.id !== folder?.id ? ` · actuellement dans « ${esc(other.name)} »` : ''}</small></div></label>`;
               })
               .join('')}</div>`
          : ''
      }
      <div class="modal-actions"><span class="spacer"></span><button type="button" class="btn ghost" data-close>Annuler</button><button class="btn primary">${folder ? 'Enregistrer' : 'Créer le dossier'}</button></div></form>`,
    {
      onMount: (m, close) => {
        const boxes = () => [...m.querySelectorAll('input[name="c"]')];
        const allBtn = $('[data-all]', m);
        const syncAll = () => allBtn && (allBtn.textContent = boxes().every((b) => b.checked) ? 'Tout décocher' : 'Tout cocher');
        syncAll();
        m.addEventListener('change', syncAll);
        if (allBtn)
          allBtn.onclick = () => {
            const on = !boxes().every((b) => b.checked);
            boxes().forEach((b) => (b.checked = on));
            syncAll();
          };
        $('form', m).onsubmit = (e) => {
          e.preventDefault();
          const name = new FormData(e.target).get('name').trim();
          const f = folder || createFolder(name);
          f.name = name || f.name;
          for (const b of boxes()) {
            const c = getCourse(b.value);
            if (b.checked) c.folderId = f.id;
            else if (c.folderId === f.id) delete c.folderId;
          }
          save();
          close();
          toast(folder ? 'Dossier enregistré' : `Dossier « ${f.name} » créé`, 'success');
          onDone(f);
        };
      },
    },
  );
}

/** Ranger un cours : choisir son dossier */
function moveCourseModal(course, onDone) {
  openModal(
    `<h3>Ranger « ${esc(course.title)} »</h3>
     <div class="choice-list">
       ${sortedFolders()
         .map((f) => `<button class="choice ${course.folderId === f.id ? 'on' : ''}" data-f="${f.id}"><span>📁</span><div><b>${esc(f.name)}</b><small>${coursesIn(f.id).length} cours${course.folderId === f.id ? ' · ici actuellement' : ''}</small></div></button>`)
         .join('')}
       <button class="choice" data-f="new"><span>➕</span><div><b>Nouveau dossier…</b></div></button>
       ${getFolder(course.folderId) ? `<button class="choice" data-f=""><span>↩️</span><div><b>Sortir du dossier</b></div></button>` : ''}
     </div><button class="btn ghost block" data-close>Annuler</button>`,
    {
      onMount: (m, close) =>
        m.addEventListener('click', (e) => {
          const b = e.target.closest('[data-f]');
          if (!b) return;
          close();
          if (b.dataset.f === 'new') {
            // nouveau dossier avec ce cours déjà coché
            const f = createFolder(state.folders.some((x) => x.name.toLowerCase() === 'bts sio') ? 'Nouveau dossier' : 'BTS SIO');
            course.folderId = f.id;
            save();
            return folderModal(f, onDone);
          }
          if (b.dataset.f) course.folderId = b.dataset.f;
          else delete course.folderId;
          save();
          toast(b.dataset.f ? `Rangé dans « ${getFolder(b.dataset.f).name} »` : 'Sorti du dossier', 'success');
          onDone();
        }),
    },
  );
}

const courseRows = (cs) => {
  const groups = new Map();
  cs.forEach((c) => groups.set(c.subject || 'Sans matière', [...(groups.get(c.subject || 'Sans matière') || []), c]));
  return [...groups]
    .map(
      ([sub, list]) => `<section class="group"><h2 class="group-title"><span class="dot" style="background:${subjectColor(sub === 'Sans matière' ? '' : sub)}"></span>${esc(sub)}</h2>
      ${list
        .map(
          (c) => `<a class="row-card" href="#/cours/${c.id}" style="--c:${subjectColor(c.subject)}">
            <div class="rc-main"><b>${esc(c.title)}</b><small>${readingTime(c)} min de lecture · modifié ${relTime(c.updatedAt)}</small></div>
            <div class="rc-tags">${cardsOf(c.id).length ? `<span class="pill">🃏 ${cardsOf(c.id).length}</span>` : ''}${questionsOf(c.id).length ? `<span class="pill">❓ ${questionsOf(c.id).length}</span>` : ''}</div>
            ${chev()}</a>`,
        )
        .join('')}</section>`,
    )
    .join('');
};

/** Contenu d'un dossier */
function folderView(el, folder) {
  const draw = () => {
    const list = coursesIn(folder.id).sort((a, b) => b.updatedAt - a.updatedAt);
    el.innerHTML = `
      <div class="topline"><a href="#/cours" class="back">${icon('back', 18)} Cours</a><button class="icon-btn" data-act="fmenu" aria-label="Options du dossier">⋯</button></div>
      <header class="page-head"><h1>📁 ${esc(folder.name)}</h1></header>
      ${
        list.length
          ? courseRows(list)
          : `<div class="empty"><h3>Dossier vide</h3><p>Choisis les cours à ranger ici.</p></div>`
      }
      <button class="btn block" data-act="edit">📁 Choisir les cours de ce dossier</button>`;
  };
  draw();
  el.onclick = async (e) => {
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'edit') folderModal(folder, draw);
    if (a === 'fmenu')
      openModal(
        `<h3>📁 ${esc(folder.name)}</h3><div class="choice-list">
          <button class="choice" data-m="edit"><span>✏️</span><div><b>Renommer / choisir les cours</b></div></button>
          <button class="choice danger" data-m="del"><span>🗑️</span><div><b>Supprimer le dossier</b><small>Les cours ne sont pas supprimés</small></div></button>
        </div><button class="btn ghost block" data-close>Fermer</button>`,
        {
          onMount: (m, close) =>
            m.addEventListener('click', async (ev) => {
              const k = ev.target.closest('[data-m]')?.dataset.m;
              if (!k) return;
              close();
              if (k === 'edit') folderModal(folder, draw);
              if (k === 'del' && (await confirmBox(`Supprimer le dossier « ${folder.name} » ?`, { danger: true, ok: 'Supprimer', detail: 'Ses cours restent dans l\'onglet Cours, hors dossier.' }))) {
                deleteFolder(folder.id);
                location.hash = '#/cours';
              }
            }),
        },
      );
  };
}

/* ---------- Liste ---------- */
export function coursesList(el, { query }) {
  let q = '';
  if (query.get('ajouter') === '1') {
    history.replaceState(null, '', '#/cours');
    setTimeout(addCourseModal, 50);
  }
  const folder = getFolder(query.get('dossier'));
  if (folder) return folderView(el, folder);
  const listHtml = () => {
    const list = state.courses
      .filter((c) => !q || `${c.title} ${c.subject} ${c.content}`.toLowerCase().includes(q))
      .sort((a, b) => b.updatedAt - a.updatedAt);
    if (!state.courses.length)
      return `<div class="empty">${icon('book', 44)}<h3>Aucun cours pour l'instant</h3><p>Prends ton cours en photo : Claude le recopie et prépare tes flashcards et ton quiz.</p><button class="btn primary" data-act="add">${icon('plus')} Ajouter un cours</button></div>`;
    if (!list.length) return `<p class="empty-txt">Aucun cours ne contient « ${esc(q)} ».</p>`;
    if (q) return courseRows(list);
    const folders = sortedFolders();
    const loose = list.filter((c) => !getFolder(c.folderId));
    return `${
      folders.length
        ? `<section class="group"><h2 class="group-title">Dossiers</h2>${folders
            .map((f) => {
              const cs = coursesIn(f.id);
              const nCards = cs.reduce((n, c) => n + cardsOf(c.id).length, 0);
              return `<a class="row-card folder-card" href="#/cours?dossier=${f.id}"><span class="folder-ic">📁</span>
                <div class="rc-main"><b>${esc(f.name)}</b><small>${cs.length} cours${nCards ? ` · ${nCards} flashcards` : ''}</small></div>${chev()}</a>`;
            })
            .join('')}</section>`
        : `<button class="row-card folder-card ghost-card" data-act="folder"><span class="folder-ic">📁</span><div class="rc-main"><b>Ranger mes cours dans un dossier</b><small>Ex : tous tes cours dans « BTS SIO »</small></div></button>`
    }${courseRows(loose)}`;
  };
  el.innerHTML = `
    <header class="page-head"><h1>Cours</h1><div class="head-btns">${state.courses.length ? `<button class="btn" data-act="folder" aria-label="Nouveau dossier">📁 Dossier</button>` : ''}<button class="btn primary" data-act="add">${icon('plus')} Ajouter</button></div></header>
    ${state.courses.length ? `<label class="search">${icon('search', 18)}<input type="search" placeholder="Chercher dans mes cours…" data-q></label>` : ''}
    <div data-list>${listHtml()}</div>`;
  el.onclick = (e) => {
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'add') addCourseModal();
    if (a === 'folder') folderModal(null, () => ($('[data-list]', el).innerHTML = listHtml()));
  };
  el.oninput = (e) => {
    if (!e.target.matches('[data-q]')) return;
    q = e.target.value.trim().toLowerCase();
    $('[data-list]', el).innerHTML = listHtml();
  };
}

/* ---------- Lecture du cours complet ---------- */
export function courseView(el, { params: [id] }) {
  const course = getCourse(id);
  if (!course) return notFound(el);
  course.attachments ||= [];
  const urls = [];

  async function draw() {
    const nCards = cardsOf(id).length;
    const nQ = questionsOf(id).length;
    const toc = outline(course.content);
    el.innerHTML = `
      <div class="topline"><a href="#/cours${getFolder(course.folderId) ? `?dossier=${course.folderId}` : ''}" class="back">${icon('back', 18)} ${getFolder(course.folderId) ? `📁 ${esc(getFolder(course.folderId).name)}` : 'Cours'}</a><button class="icon-btn" data-act="menu" aria-label="Options">⋯</button></div>
      <h1 class="doc-title">${esc(course.title)}</h1>
      <p class="doc-meta"><span class="tag" style="--c:${subjectColor(course.subject)}">${esc(course.subject || 'Sans matière')}</span> ${readingTime(course)} min de lecture</p>
      ${
        nCards || nQ
          ? `<div class="study-links">
               <a class="study-link" href="#/flashcards/${id}"><span>🃏</span><b>${nCards} flashcards</b></a>
               <a class="study-link" href="#/quiz/${id}"><span>❓</span><b>${nQ} questions</b></a></div>`
          : `<button class="cta" data-act="study"><span>✨</span><div><b>Créer les flashcards et le quiz</b><small>Claude synthétise ce cours pour toi</small></div></button>`
      }
      ${
        toc.length > 2
          ? `<details class="toc"><summary>Sommaire (${toc.filter((t) => t.level === 2).length} parties)</summary><ol>${toc
              .map((t) => `<li class="l${t.level}"><a href="#${t.id}" data-anchor="${t.id}">${esc(t.text)}</a></li>`)
              .join('')}</ol></details>`
          : ''
      }
      <article class="prose">${course.content.trim() ? md(course.content) : `<p class="muted">Ce cours est vide. <a href="#/cours/${id}/modifier">Écris-le ou colle-le ici</a>.</p>`}</article>
      ${course.attachments.length ? `<section class="originals"><h2>📎 Documents d'origine</h2><div class="thumbs" data-thumbs></div></section>` : ''}
      <a class="btn block edit-btn" href="#/cours/${id}/modifier">${icon('edit', 16)} Modifier le cours</a>
      <input type="file" multiple hidden accept="image/*,application/pdf" data-file>`;
    // vignettes des photos / PDF d'origine
    const box = $('[data-thumbs]', el);
    if (box)
      for (const a of course.attachments) {
        const blob = await files.get(a.id).catch(() => null);
        if (!blob) continue;
        const url = URL.createObjectURL(blob);
        urls.push(url);
        box.insertAdjacentHTML(
          'beforeend',
          a.type?.startsWith('image/')
            ? `<a href="${url}" target="_blank" rel="noopener" class="thumb"><img src="${url}" alt="${esc(a.name)}"></a>`
            : `<a href="${url}" target="_blank" rel="noopener" class="thumb file">📄<small>${esc(a.name)}</small></a>`,
        );
      }
  }
  draw();

  function menu() {
    const n = cardsOf(id).length + questionsOf(id).length;
    openModal(
      `<h3>${esc(course.title)}</h3>
       <div class="choice-list">
         <a class="choice" href="#/cours/${id}/modifier" data-close><span>✏️</span><div><b>Modifier le cours</b></div></a>
         <button class="choice" data-m="folder"><span>📁</span><div><b>Ranger dans un dossier</b><small>${getFolder(course.folderId) ? `Actuellement : ${esc(getFolder(course.folderId).name)}` : 'Ex : BTS SIO'}</small></div></button>
         <button class="choice" data-m="study"><span>✨</span><div><b>${n ? 'Refaire' : 'Créer'} les flashcards et le quiz</b><small>${n ? 'Remplace les actuels' : 'Avec Claude'}</small></div></button>
         <button class="choice" data-m="attach"><span>📎</span><div><b>Joindre des photos ou un PDF</b></div></button>
         <button class="choice" data-m="export"><span>⬇️</span><div><b>Télécharger le texte</b><small>Fichier .md</small></div></button>
         <button class="choice danger" data-m="delete"><span>🗑️</span><div><b>Supprimer le cours</b><small>Avec ses flashcards et son quiz</small></div></button>
       </div><button class="btn ghost block" data-close>Fermer</button>`,
      {
        onMount: (m, close) =>
          m.addEventListener('click', async (e) => {
            const a = e.target.closest('[data-m]')?.dataset.m;
            if (!a) return;
            close();
            if (a === 'study') studyModal(id);
            if (a === 'folder') moveCourseModal(course, draw);
            if (a === 'attach') $('[data-file]', el).click();
            if (a === 'export') download(`${course.title.replace(/[^\w\-éèàùç ]+/gi, '_')}.md`, `# ${course.title}\n\n${course.content}`, 'text/markdown');
            if (a === 'delete' && (await confirmBox(`Supprimer « ${course.title} » ?`, { danger: true, ok: 'Supprimer', detail: 'Ses flashcards et son quiz seront supprimés aussi.' }))) {
              for (const at of course.attachments) await files.del(at.id).catch(() => {});
              deleteCourse(id);
              location.hash = '#/cours';
            }
          }),
      },
    );
  }

  el.onclick = (e) => {
    const anchor = e.target.closest('[data-anchor]');
    if (anchor) {
      e.preventDefault();
      document.getElementById(anchor.dataset.anchor)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'menu') menu();
    if (a === 'study') studyModal(id);
  };
  el.onchange = async (e) => {
    if (!e.target.matches('[data-file]')) return;
    for (const f of e.target.files) {
      const fid = uid();
      await files.set(fid, f).then(() => course.attachments.push({ id: fid, name: f.name, type: f.type, size: f.size })).catch(() => toast(`Impossible d'enregistrer ${f.name}`, 'error'));
    }
    save();
    draw();
  };
  return () => urls.forEach((u) => URL.revokeObjectURL(u));
}

/* ---------- Écrire / modifier ---------- */
const SNIPPETS = {
  h2: ['\n## ', 'Grande partie', '\n'],
  h3: ['\n### ', 'Sous-partie', '\n'],
  bold: ['**', 'mot important', '**'],
  mark: ['==', "l'essentiel", '=='],
  list: ['\n- ', 'élément', '\n'],
  table: ['\n| Colonne 1 | Colonne 2 |\n|---|---|\n| ', 'case', ' | case |\n'],
  flux: ['\n```flux\n', 'Étape 1 -> Étape 2 -> Étape 3', '\n```\n'],
  warn: ['\n> ⚠️ **Piège :** ', 'à ne pas confondre…', '\n'],
};

export function courseEdit(el, { params: [id] }) {
  const course = getCourse(id);
  if (!course) return notFound(el);
  el.innerHTML = `
    <div class="topline"><a href="#/cours/${id}" class="back">${icon('back', 18)} Retour</a><a class="btn primary sm" href="#/cours/${id}">✓ Terminé</a></div>
    <input class="title-input" data-title value="${esc(course.title)}" placeholder="Titre du cours">
    <label class="field"><span>Matière</span><input data-subject list="subj-dl" value="${esc(course.subject)}" placeholder="Ex : CEJM, Maths…" autocomplete="off">
      <datalist id="subj-dl">${subjects().map((s) => `<option value="${esc(s)}">`).join('')}</datalist></label>
    <div class="seg full"><button class="on" data-view="edit">✏️ Écrire</button><button data-view="preview">👁️ Aperçu</button></div>
    <div data-pane="edit">
      <div class="insert-bar">${[['h2', 'Titre'], ['h3', 'Sous-titre'], ['bold', 'Gras'], ['mark', 'Surligner'], ['list', 'Liste'], ['table', 'Tableau'], ['flux', 'Schéma'], ['warn', 'Piège']]
        .map(([k, l]) => `<button data-ins="${k}">${l}</button>`)
        .join('')}</div>
      <textarea class="editor" data-editor placeholder="Écris ou colle ton cours ici…">${esc(course.content)}</textarea>
    </div>
    <article class="prose" data-pane="preview" hidden></article>
    <p class="save-line" data-status>Enregistré automatiquement</p>`;
  const editor = $('[data-editor]', el);
  const status = $('[data-status]', el);
  const persist = debounce(() => {
    course.content = editor.value;
    course.updatedAt = Date.now();
    save();
    status.textContent = '✓ Enregistré';
  }, 400);
  editor.addEventListener('input', () => ((status.textContent = 'Enregistrement…'), persist()));
  el.oninput = (e) => {
    if (e.target.matches('[data-title]')) course.title = e.target.value || 'Sans titre';
    else if (e.target.matches('[data-subject]')) course.subject = e.target.value.trim();
    else return;
    course.updatedAt = Date.now();
    save();
  };
  el.onclick = (e) => {
    const v = e.target.closest('[data-view]');
    if (v) {
      $$('[data-view]', el).forEach((b) => b.classList.toggle('on', b === v));
      $$('[data-pane]', el).forEach((p) => (p.hidden = p.dataset.pane !== v.dataset.view));
      if (v.dataset.view === 'preview') $('[data-pane="preview"]', el).innerHTML = md(editor.value);
      return;
    }
    const k = e.target.closest('[data-ins]')?.dataset.ins;
    if (!k) return;
    const [a, ph, b] = SNIPPETS[k];
    const { selectionStart: s, selectionEnd: t } = editor;
    const sel = editor.value.slice(s, t) || ph;
    editor.setRangeText(a + sel + b, s, t, 'end');
    editor.setSelectionRange(s + a.length, s + a.length + sel.length);
    editor.focus();
    persist();
  };
  if (!course.content) editor.focus();
  return () => {
    course.content = editor.value;
    save();
  };
}
