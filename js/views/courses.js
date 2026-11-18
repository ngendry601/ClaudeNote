// Onglet « Cours » : le cours complet, tel quel (pas de synthèse ici).
import { state, save, uid, getCourse, cardsOf, questionsOf, subjects, subjectColor, deleteCourse } from '../store.js';
import { files } from '../db.js';
import { esc, icon, relTime, confirmBox, openModal, toast, download, debounce, $, $$ } from '../ui.js';
import { md, stripMd, outline } from '../md.js';
import { addCourseModal, studyModal } from './create.js';

const readingTime = (c) => Math.max(1, Math.round(stripMd(c.content).split(' ').length / 200));
const notFound = (el) => (el.innerHTML = `<div class="empty"><h3>Cours introuvable</h3><a class="btn" href="#/cours">Mes cours</a></div>`);

/* ---------- Liste ---------- */
export function coursesList(el, { query }) {
  let q = '';
  if (query.get('ajouter') === '1') {
    history.replaceState(null, '', '#/cours');
    setTimeout(addCourseModal, 50);
  }
  const listHtml = () => {
    const list = state.courses
      .filter((c) => !q || `${c.title} ${c.subject} ${c.content}`.toLowerCase().includes(q))
      .sort((a, b) => b.updatedAt - a.updatedAt);
    if (!state.courses.length)
      return `<div class="empty">${icon('book', 44)}<h3>Aucun cours pour l'instant</h3><p>Prends ton cours en photo : Claude le recopie et prépare tes flashcards et ton quiz.</p><button class="btn primary" data-act="add">${icon('plus')} Ajouter un cours</button></div>`;
    if (!list.length) return `<p class="empty-txt">Aucun cours ne contient « ${esc(q)} ».</p>`;
    const groups = new Map();
    list.forEach((c) => groups.set(c.subject || 'Sans matière', [...(groups.get(c.subject || 'Sans matière') || []), c]));
    return [...groups]
      .map(
        ([sub, cs]) => `<section class="group"><h2 class="group-title"><span class="dot" style="background:${subjectColor(sub === 'Sans matière' ? '' : sub)}"></span>${esc(sub)}</h2>
        ${cs
          .map(
            (c) => `<a class="row-card" href="#/cours/${c.id}" style="--c:${subjectColor(c.subject)}">
              <div class="rc-main"><b>${esc(c.title)}</b><small>${readingTime(c)} min de lecture · modifié ${relTime(c.updatedAt)}</small></div>
              <div class="rc-tags">${cardsOf(c.id).length ? `<span class="pill">🃏 ${cardsOf(c.id).length}</span>` : ''}${questionsOf(c.id).length ? `<span class="pill">❓ ${questionsOf(c.id).length}</span>` : ''}</div>
              ${icon('back', 18).replace('<svg', '<svg class="chev"')}</a>`,
          )
          .join('')}</section>`,
      )
      .join('');
  };
  el.innerHTML = `
    <header class="page-head"><h1>Cours</h1><button class="btn primary" data-act="add">${icon('plus')} Ajouter</button></header>
    ${state.courses.length ? `<label class="search">${icon('search', 18)}<input type="search" placeholder="Chercher dans mes cours…" data-q></label>` : ''}
    <div data-list>${listHtml()}</div>`;
  el.onclick = (e) => e.target.closest('[data-act="add"]') && addCourseModal();
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
      <div class="topline"><a href="#/cours" class="back">${icon('back', 18)} Cours</a><button class="icon-btn" data-act="menu" aria-label="Options">⋯</button></div>
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
