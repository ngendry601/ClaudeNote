// Un cours : sa fiche A4, 3 actions (Réviser, Quiz, Modifier), le plein écran et l'éditeur.
import { state, save, getSubject, getCourse, deckForCourse, uid } from '../store.js';
import { files } from '../db.js';
import { esc, icon, relTime, confirmBox, openModal, toast, download, debounce, fmtSize, $, $$ } from '../ui.js';
import { courseCards, courseDue, syncCourseCards } from '../library.js';
import { coursePageHtml, mountA4 } from '../a4.js';
import { MAX_CARDS } from '../ai.js';

const notFound = (el) => (el.innerHTML = `<div class="empty"><h3>Cours introuvable</h3><a class="btn" href="#/cours">Mes cours</a></div>`);

/* ---------- Page du cours ---------- */
export function courseView(el, { params: [id] }) {
  const course = getCourse(id);
  if (!course) return notFound(el);
  course.attachments ||= [];
  let a4 = null;
  const blobUrls = [];

  function draw() {
    const sub = getSubject(course.subjectId);
    const cards = courseCards(course);
    const due = courseDue(course);
    const deck = deckForCourse(course.id);
    el.innerHTML = `
      <div class="course-top"><a href="#/cours" class="back-link">${icon('back', 16)} Mes cours</a>
        <button class="icon-btn big" data-act="menu" title="Plus d'options">⋯</button></div>
      <h1 class="course-title">${esc(course.title)}</h1>
      <p class="muted course-sub"><span class="dot" style="background:${sub?.color || '#94a3b8'}"></span> ${esc(sub?.name || 'Sans matière')} · ${cards.length} flashcard${cards.length > 1 ? 's' : ''} · modifié ${relTime(course.updatedAt)}</p>
      <div class="course-actions">
        ${
          cards.length
            ? `<a class="btn primary lg" href="#/reviser/${deck.id}${due ? '' : '?libre=1'}">▶ Réviser${due ? ` (${due})` : ''}</a>
               <a class="btn lg" href="#/quiz?scope=d:${deck.id}">❓ Quiz</a>`
            : ''
        }
        <a class="btn lg" href="#/cours/${course.id}/modifier">✏️ Modifier</a>
      </div>
      ${cards.length ? '' : `<p class="info-box">Ce cours n'a pas encore de flashcards. Touche <b>Modifier</b> puis <b>+ Partie</b> : chaque partie devient une flashcard.</p>`}
      <a class="a4-stage course-stage" href="#/page/${course.id}" data-stage title="Afficher en plein écran"></a>
      <p class="muted small center">Touche la fiche pour l'afficher en plein écran</p>
      ${
        course.attachments.length
          ? `<section class="block"><h2>${icon('clip', 16)} Fichiers joints</h2><ul class="attach-list">${course.attachments
              .map((a) => `<li><button class="link" data-open="${a.id}">${esc(a.name)}</button><small>${fmtSize(a.size)}</small><button class="icon-btn" data-rm="${a.id}" title="Retirer">${icon('x', 14)}</button></li>`)
              .join('')}</ul></section>`
          : ''
      }
      <input type="file" multiple hidden data-file>`;
    a4?.destroy();
    a4 = mountA4($('[data-stage]', el), coursePageHtml(course), { mode: 'width' });
  }
  draw();

  function menu() {
    openModal(
      `<h3>${esc(course.title)}</h3>
       <div class="choice-list">
         <button class="choice" data-m="subject"><span>🏷️</span><div><b>Changer de matière</b></div></button>
         <button class="choice" data-m="attach"><span>📎</span><div><b>Joindre un fichier</b><small>PDF, photo du cours original…</small></div></button>
         <a class="choice" href="#/page/${course.id}?imprimer=1" data-close><span>🖨️</span><div><b>Imprimer / enregistrer en PDF</b></div></a>
         <button class="choice" data-m="export"><span>⬇️</span><div><b>Exporter le texte</b><small>Fichier .md</small></div></button>
         <button class="choice danger" data-m="delete"><span>🗑️</span><div><b>Supprimer le cours</b></div></button>
       </div>
       <div class="modal-actions"><button class="btn ghost" data-close>Fermer</button></div>`,
      {
        onMount: (m, close) =>
          m.addEventListener('click', async (e) => {
            const a = e.target.closest('[data-m]')?.dataset.m;
            if (!a) return;
            close();
            if (a === 'attach') $('[data-file]', el).click();
            if (a === 'export') download(`${course.title.replace(/[^\w\-éèàùç ]+/gi, '_')}.md`, course.content, 'text/markdown');
            if (a === 'subject') pickSubject();
            if (a === 'delete' && (await confirmBox(`Supprimer « ${course.title} » ?`, { danger: true, ok: 'Supprimer', detail: 'Ses flashcards seront supprimées aussi.' }))) {
              for (const at of course.attachments) await files.del(at.id).catch(() => {});
              const deck = deckForCourse(course.id);
              if (deck) {
                state.cards = state.cards.filter((c) => c.deckId !== deck.id);
                state.decks = state.decks.filter((d) => d.id !== deck.id);
              }
              state.courses = state.courses.filter((c) => c.id !== course.id);
              save();
              location.hash = '#/cours';
            }
          }),
      },
    );
  }

  function pickSubject() {
    openModal(
      `<h3>Matière</h3><div class="choice-list">
        <button class="choice" data-s=""><span>—</span><div><b>Sans matière</b></div></button>
        ${state.subjects.map((s) => `<button class="choice" data-s="${s.id}"><span class="dot lg" style="background:${s.color}"></span><div><b>${esc(s.name)}</b></div></button>`).join('')}
        <button class="choice" data-new><span>＋</span><div><b>Nouvelle matière…</b></div></button></div>`,
      {
        onMount: (m, close) =>
          m.addEventListener('click', (e) => {
            const b = e.target.closest('[data-s], [data-new]');
            if (!b) return;
            let sid = b.dataset.s ?? '';
            if (b.hasAttribute('data-new')) {
              const name = prompt('Nom de la matière');
              if (!name?.trim()) return;
              const s = { id: uid(), name: name.trim(), color: '#6366f1', createdAt: Date.now() };
              state.subjects.push(s);
              sid = s.id;
            }
            course.subjectId = sid || null;
            syncCourseCards(course);
            save();
            close();
            draw();
          }),
      },
    );
  }

  el.onclick = async (e) => {
    if (e.target.closest('[data-act="menu"]')) return menu();
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
    if (rm && (await confirmBox('Retirer ce fichier ?', { danger: true, ok: 'Retirer' }))) {
      await files.del(rm.dataset.rm).catch(() => {});
      course.attachments = course.attachments.filter((a) => a.id !== rm.dataset.rm);
      save();
      draw();
    }
  };
  el.onchange = async (e) => {
    if (!e.target.matches('[data-file]')) return;
    for (const f of e.target.files) {
      const fid = uid();
      try {
        await files.set(fid, f);
        course.attachments.push({ id: fid, name: f.name, type: f.type, size: f.size });
      } catch {
        toast(`Impossible d'enregistrer ${f.name}`, 'error');
      }
    }
    save();
    draw();
    toast('Fichier joint', 'success');
  };
  return () => {
    a4?.destroy();
    blobUrls.forEach((u) => setTimeout(() => URL.revokeObjectURL(u), 60e3));
  };
}

/* ---------- Plein écran : la fiche A4 entière ---------- */
export function pageView(el, { params: [id], query }) {
  const course = getCourse(id);
  if (!course) return notFound(el);
  let mode = 'page';
  el.innerHTML = `
    <div class="page-view">
      <div class="ff-bar no-print">
        <button class="ff-btn" data-act="close" title="Fermer">${icon('x', 20)}</button>
        <span class="ff-title">${esc(course.title)}</span>
        <button class="ff-btn wide" data-act="zoom">🔍 Agrandir</button>
        <button class="ff-btn" data-act="print" title="Imprimer / PDF">🖨️</button>
      </div>
      <div class="a4-stage page-stage" data-stage></div>
    </div>`;
  const a4 = mountA4($('[data-stage]', el), coursePageHtml(course), { mode });
  const setMode = (m) => {
    mode = m;
    a4.setMode(m);
    $('[data-act="zoom"]', el).textContent = m === 'page' ? '🔍 Agrandir' : '📄 Page entière';
    $('[data-stage]', el).classList.toggle('scroll', m === 'width');
  };
  const back = () => (history.length > 1 ? history.back() : (location.hash = `#/cours/${id}`));
  el.onclick = (e) => {
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'close') back();
    if (a === 'print') window.print();
    if (a === 'zoom' || (!a && e.target.closest('.a4'))) setMode(mode === 'page' ? 'width' : 'page');
  };
  const onKey = (e) => e.key === 'Escape' && back();
  document.addEventListener('keydown', onKey);
  if (query.get('imprimer') === '1') setTimeout(() => window.print(), 400);
  return () => {
    a4.destroy();
    document.removeEventListener('keydown', onKey);
  };
}

/* ---------- Modifier un cours ---------- */
const SNIPPETS = {
  part: '\n::: Titre de la partie\n### Sous-partie\n- **Notion** : explication courte\n:::\n',
  sub: '\n### Sous-partie\n',
  item: '\n- **Notion** : ',
  trap: '\n!! ',
};

export function courseEdit(el, { params: [id] }) {
  const course = getCourse(id);
  if (!course) return notFound(el);
  let preview = false;
  let a4 = null;
  el.innerHTML = `
    <div class="edit-top">
      <a href="#/cours/${id}" class="back-link">${icon('back', 16)} Retour</a>
      <div class="seg"><button class="on" data-view="edit">✏️ Texte</button><button data-view="preview">📄 Aperçu</button></div>
      <a class="btn primary sm" href="#/cours/${id}">✓ Terminé</a>
    </div>
    <input class="title-input" value="${esc(course.title)}" data-title aria-label="Titre du cours" placeholder="Titre du cours">
    <div data-editpane>
      <div class="insert-bar">
        <button data-ins="part">＋ Partie</button><button data-ins="sub">＋ Sous-titre</button><button data-ins="item">＋ Notion</button>
        <button data-ins="mark">Surligner</button><button data-ins="bold">Gras</button><button data-ins="trap">＋ Piège</button>
      </div>
      <textarea class="editor" data-editor spellcheck="true">${esc(course.content)}</textarea>
      <details class="help"><summary>Comment ça marche ?</summary>
        <ul>
          <li><b>Une partie</b> = un bloc qui commence par <code>::: Titre</code> et finit par <code>:::</code>. Chaque partie devient <b>une flashcard</b> (vise ${MAX_CARDS} parties maximum).</li>
          <li><code>### Sous-titre</code> : les sous-parties à réciter.</li>
          <li><code>- **Notion** : explication</code> : une ligne = une question du quiz.</li>
          <li><code>==texte==</code> surligne l'essentiel · <code>!! texte</code> ajoute un encadré piège.</li>
        </ul></details>
    </div>
    <a class="a4-stage course-stage" data-previewpane hidden></a>
    <p class="save-line" data-status>Enregistré</p>`;

  const editor = $('[data-editor]', el);
  const status = $('[data-status]', el);
  const updateStatus = () => {
    const n = courseCards(course).length;
    status.innerHTML = `✓ Enregistré · ${n} flashcard${n > 1 ? 's' : ''}${n > MAX_CARDS ? ` · <span class="warn">⚠️ vise ${MAX_CARDS} parties maximum</span>` : ''}`;
  };
  const sync = debounce(() => {
    syncCourseCards(course);
    updateStatus();
  }, 700);
  const persist = () => {
    course.content = editor.value;
    const t = (editor.value.match(/^#\s+(.+)$/m) || [])[1];
    if (t && !$('[data-title]', el).dataset.touched) {
      course.title = t.trim();
      $('[data-title]', el).value = course.title;
    }
    course.updatedAt = Date.now();
    save();
    status.textContent = 'Enregistrement…';
    sync();
  };
  updateStatus();

  editor.addEventListener('input', persist);
  editor.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      editor.setRangeText('  ', editor.selectionStart, editor.selectionEnd, 'end');
      persist();
    }
  });
  el.oninput = (e) => {
    if (!e.target.matches('[data-title]')) return;
    e.target.dataset.touched = '1';
    course.title = e.target.value || 'Sans titre';
    course.content = editor.value = editor.value.match(/^#\s+.*$/m) ? editor.value.replace(/^#\s+.*$/m, `# ${course.title}`) : `# ${course.title}\n\n${editor.value}`;
    course.updatedAt = Date.now();
    save();
    sync();
  };
  el.onclick = (e) => {
    const v = e.target.closest('[data-view]');
    if (v) {
      preview = v.dataset.view === 'preview';
      $$('[data-view]', el).forEach((b) => b.classList.toggle('on', b === v));
      $('[data-editpane]', el).hidden = preview;
      const pane = $('[data-previewpane]', el);
      pane.hidden = !preview;
      a4?.destroy();
      a4 = preview ? mountA4(pane, coursePageHtml(course), { mode: 'width' }) : null;
      return;
    }
    const ins = e.target.closest('[data-ins]')?.dataset.ins;
    if (!ins) return;
    const { selectionStart: s, selectionEnd: t } = editor;
    const sel = editor.value.slice(s, t);
    if (ins === 'mark' || ins === 'bold') {
      const w = ins === 'mark' ? '==' : '**';
      editor.setRangeText(`${w}${sel || (ins === 'mark' ? "l'essentiel" : 'mot')}${w}`, s, t, 'select');
    } else editor.setRangeText(SNIPPETS[ins], s, t, 'end');
    editor.focus();
    persist();
  };
  return () => {
    a4?.destroy();
    if (editor.value !== course.content) course.content = editor.value;
    syncCourseCards(course);
  };
}
