// Création : nouveau cours (photos, appli Claude, texte, cours prêt) et génération des flashcards + quiz d'un cours.
import { state, save, uid, getCourse, createCourse, setCourseStudy, subjects } from '../store.js';
import { files } from '../db.js';
import { esc, openModal, toast, $, $$ } from '../ui.js';
import { APP_INSTRUCTIONS, generateStudy, parsePasted } from '../ai.js';
import { PACKS, importPack, packCourse } from '../packs.js';

const subjectField = (value = '') => `<label class="field"><span>Matière</span>
  <input data-subject list="subjects-dl" value="${esc(value)}" placeholder="Ex : CEJM, Maths, Développement…" autocomplete="off">
  <datalist id="subjects-dl">${subjects().map((s) => `<option value="${esc(s)}">`).join('')}</datalist></label>`;

const keySetup = `<div class="key-setup">
  <p><b>Une seule fois :</b> colle ta clé API Claude. Ensuite tout se fait ici, sans quitter l'appli.</p>
  <ol class="steps small">
    <li>Ouvre <a href="https://platform.claude.com/" target="_blank" rel="noopener">platform.claude.com</a> et connecte-toi</li>
    <li>Ajoute un peu de crédit (Billing) : compte environ 15 à 30 centimes par cours</li>
    <li>API Keys → <b>Create Key</b> → copie la clé (sk-ant-…)</li>
  </ol>
  <label class="field"><span>Ta clé API</span><input type="password" data-newkey autocomplete="off" placeholder="sk-ant-…"></label>
  <button class="btn primary block" data-savekey>Enregistrer et continuer</button>
  <p class="muted small">Compte différent de ton abonnement Claude, payé à l'usage. La clé reste sur cet appareil.</p>
</div>`;

function bindKeySetup(m, close, reopen) {
  m.addEventListener('click', (e) => {
    if (!e.target.closest('[data-savekey]')) return;
    const k = $('[data-newkey]', m).value.trim();
    if (!/^sk-ant-/.test(k)) return toast('La clé doit commencer par sk-ant-', 'error');
    state.settings.apiKey = k;
    save();
    close();
    toast('Clé enregistrée ✅', 'success');
    reopen();
  });
}

const summary = (st) => `${st.flashcards.length} flashcard${st.flashcards.length > 1 ? 's' : ''} et ${st.quiz.length} question${st.quiz.length > 1 ? 's' : ''}`;

/** Enregistre le résultat de Claude : nouveau cours, ou ajout au cours existant */
async function saveStudy(study, { courseId, subject, pictures = [] }) {
  let course = courseId && getCourse(courseId);
  if (!course) {
    const attachments = [];
    for (const f of pictures) {
      const id = uid();
      try {
        await files.set(id, f);
        attachments.push({ id, name: f.name, type: f.type, size: f.size });
      } catch {
        /* la photo d'origine n'est pas indispensable */
      }
    }
    course = createCourse({ title: study.title || 'Nouveau cours', subject: subject || study.subject, content: study.course, attachments });
  } else if (study.course && !course.content.trim()) course.content = study.course;
  setCourseStudy(course.id, study);
  return course;
}

/* ---------- Choisir comment ajouter un cours ---------- */
export function addCourseModal() {
  const packs = PACKS.filter((p) => !packCourse(p.id));
  openModal(
    `<h3>Ajouter un cours</h3>
     <div class="choice-list">
       <button class="choice" data-c="photos"><span>📸</span><div><b>Depuis des photos ou un PDF</b><small>Claude recopie le cours en entier et crée les flashcards et le quiz</small></div></button>
       <button class="choice" data-c="app"><span>💬</span><div><b>Via l'appli Claude (gratuit)</b><small>Tu envoies les photos à Claude, puis tu colles sa réponse ici</small></div></button>
       <button class="choice" data-c="write"><span>✍️</span><div><b>Écrire ou coller le texte</b><small>Tu tapes ou colles ton cours, les flashcards et le quiz viendront ensuite</small></div></button>
       ${packs.map((p) => `<button class="choice" data-pack="${p.id}"><span>📦</span><div><b>${esc(p.title)}</b><small>${esc(p.desc)}</small></div></button>`).join('')}
     </div>
     <button class="btn ghost block" data-close>Annuler</button>`,
    {
      onMount: (m, close) =>
        m.addEventListener('click', async (e) => {
          const c = e.target.closest('[data-c]')?.dataset.c;
          const pk = e.target.closest('[data-pack]')?.dataset.pack;
          if (!c && !pk) return;
          close();
          if (c === 'photos') photosModal();
          if (c === 'app') appModal();
          if (c === 'write') {
            const course = createCourse({ title: 'Nouveau cours', content: '' });
            location.hash = `#/cours/${course.id}/modifier`;
          }
          if (pk) {
            try {
              const course = await importPack(pk);
              toast('Cours ajouté ✨', 'success');
              location.hash = `#/cours/${course.id}`;
            } catch {
              toast('Impossible de charger ce cours (hors ligne ?)', 'error');
            }
          }
        }),
    },
  );
}

/* ---------- Automatique : photos / PDF → Claude ---------- */
export function photosModal() {
  if (!state.settings.apiKey?.trim()) {
    openModal(`<h3>📸 Cours depuis des photos</h3>${keySetup}<button class="btn ghost block" data-close>Annuler</button>
      <p class="center small"><button class="link-btn" data-free>Je préfère passer par l'appli Claude (gratuit)</button></p>`, {
      onMount: (m, close) => {
        bindKeySetup(m, close, photosModal);
        $('[data-free]', m).onclick = () => (close(), appModal());
      },
    });
    return;
  }
  openModal(
    `<h3>📸 Cours depuis des photos</h3>
     <label class="drop"><input type="file" accept="image/*,application/pdf" multiple data-files><span>📷 Prendre ou choisir les photos du cours (ou un PDF)</span></label>
     <p class="muted small" data-count>Aucun fichier · mets les pages dans l'ordre</p>
     ${subjectField()}
     <label class="field"><span>Précision (facultatif)</span><input data-hint placeholder="Ex : chapitre 4, les jointures SQL"></label>
     <p class="gen-status" data-status hidden></p>
     <div class="modal-actions"><button class="btn ghost" data-close>Annuler</button><button class="btn primary" data-go disabled>Créer le cours</button></div>`,
    {
      onMount: (m, close) => {
        let picked = [];
        m.addEventListener('change', (e) => {
          if (!e.target.matches('[data-files]')) return;
          picked = [...e.target.files];
          $('[data-count]', m).textContent = picked.length ? `${picked.length} fichier${picked.length > 1 ? 's' : ''} sélectionné${picked.length > 1 ? 's' : ''}` : 'Aucun fichier';
          $('[data-go]', m).disabled = !picked.length;
        });
        m.addEventListener('click', async (e) => {
          const go = e.target.closest('[data-go]');
          if (!go || !picked.length) return;
          const status = $('[data-status]', m);
          go.disabled = true;
          status.hidden = false;
          status.textContent = '⏳ Envoi des pages à Claude…';
          try {
            const study = await generateStudy({
              files: picked,
              hint: $('[data-hint]', m).value.trim(),
              onProgress: (n) => (status.textContent = `✍️ Claude rédige le cours, les flashcards et le quiz… (${Math.round(n / 1000)} k caractères)`),
            });
            const course = await saveStudy(study, { subject: $('[data-subject]', m).value.trim(), pictures: picked });
            close();
            toast(`Cours créé : ${summary(study)} ✨`, 'success');
            location.hash = `#/cours/${course.id}`;
          } catch (err) {
            status.textContent = `❌ ${err.message}`;
            go.disabled = false;
          }
        });
      },
    },
  );
}

/* ---------- Gratuit : via l'appli Claude ---------- */
export function appModal(courseId = null) {
  const course = courseId && getCourse(courseId);
  const instructions = course
    ? APP_INSTRUCTIONS.replace('Voici mon cours (photos jointes) :', 'Le cours existe déjà : laisse "course" vide (""). Voici le texte de mon cours :') + '\n\n' + course.content
    : APP_INSTRUCTIONS;
  openModal(
    `<h3>💬 ${course ? 'Flashcards et quiz' : 'Nouveau cours'} via l'appli Claude</h3>
     <ol class="steps">
       <li><button class="btn sm primary" data-copy>Copier les instructions</button></li>
       <li>Ouvre <a href="https://claude.ai/new" target="_blank" rel="noopener">Claude</a>, colle${course ? '' : ' les instructions et ajoute les photos de ton cours'}${course ? ' (le texte du cours est déjà inclus)' : ''}</li>
       <li>Quand Claude a fini, appuie sur <b>Copier</b> sous sa réponse et colle-la ici :</li>
     </ol>
     <textarea rows="6" data-paste placeholder="{ &quot;title&quot;: …, &quot;flashcards&quot;: […], &quot;quiz&quot;: […] }"></textarea>
     ${course ? '' : subjectField()}
     <div class="modal-actions"><button class="btn ghost" data-close>Annuler</button><button class="btn primary" data-import>${course ? 'Ajouter au cours' : 'Créer le cours'}</button></div>`,
    {
      onMount: (m, close) =>
        m.addEventListener('click', async (e) => {
          if (e.target.closest('[data-copy]')) {
            try {
              await navigator.clipboard.writeText(instructions);
              toast('Instructions copiées 📋', 'success');
            } catch {
              toast('Copie impossible : réessaie', 'error');
            }
            return;
          }
          if (!e.target.closest('[data-import]')) return;
          try {
            const study = parsePasted($('[data-paste]', m).value);
            const c = await saveStudy(study, { courseId, subject: $('[data-subject]', m)?.value.trim() });
            close();
            toast(`${summary(study)} ajoutés ✨`, 'success');
            location.hash = `#/cours/${c.id}`;
          } catch (err) {
            toast(err.message, 'error');
          }
        }),
    },
  );
}

/* ---------- Flashcards + quiz pour un cours existant ---------- */
export function studyModal(courseId) {
  const course = getCourse(courseId);
  if (!course.content.trim()) return toast("Écris d'abord le cours (bouton Modifier)", 'error');
  const hasKey = !!state.settings.apiKey?.trim();
  openModal(
    `<h3>✨ Créer les flashcards et le quiz</h3>
     <p class="muted small">Claude lit « ${esc(course.title)} » et prépare des flashcards synthétiques (tableaux, schémas) et un quiz complet.</p>
     <div class="choice-list">
       <button class="choice" data-c="auto"><span>⚡</span><div><b>Automatique</b><small>${hasKey ? 'Avec ta clé API, en une minute environ' : 'Nécessite une clé API Claude (payant à l\'usage)'}</small></div></button>
       <button class="choice" data-c="app"><span>💬</span><div><b>Via l'appli Claude (gratuit)</b><small>Copier, coller dans Claude, recoller la réponse</small></div></button>
     </div>
     <p class="gen-status" data-status hidden></p>
     <button class="btn ghost block" data-close>Annuler</button>`,
    {
      onMount: (m, close) =>
        m.addEventListener('click', async (e) => {
          const c = e.target.closest('[data-c]')?.dataset.c;
          if (c === 'app') return close(), appModal(courseId);
          if (c !== 'auto') return;
          if (!hasKey) {
            close();
            openModal(`<h3>Clé API Claude</h3>${keySetup}<button class="btn ghost block" data-close>Annuler</button>`, { onMount: (m2, close2) => bindKeySetup(m2, close2, () => studyModal(courseId)) });
            return;
          }
          const status = $('[data-status]', m);
          $$('.choice', m).forEach((b) => (b.disabled = true));
          status.hidden = false;
          status.textContent = '⏳ Claude lit le cours…';
          try {
            const study = await generateStudy({ text: course.content, hint: course.title, onProgress: (n) => (status.textContent = `✍️ Claude prépare les flashcards et le quiz… (${Math.round(n / 1000)} k caractères)`) });
            setCourseStudy(courseId, study);
            close();
            toast(`${summary(study)} créés ✨`, 'success');
            location.hash = `#/cours/${courseId}`;
            dispatchEvent(new HashChangeEvent('hashchange'));
          } catch (err) {
            status.textContent = `❌ ${err.message}`;
            $$('.choice', m).forEach((b) => (b.disabled = false));
          }
        }),
    },
  );
}
