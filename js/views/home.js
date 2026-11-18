// Accueil : ce qu'il y a à faire aujourd'hui.
import { state, save, uid, dueCards, questionsOf, streak, dayKey, startOfDay, DAY, subjects, subjectColor } from '../store.js';
import { esc, icon, relTime, formModal, confirmBox } from '../ui.js';
import { matchesKeywords } from '../news.js';

export default function home(el) {
  function draw() {
    const due = dueCards().length;
    const today = state.reviewLog[dayKey()] || 0;
    const st = streak();
    const h = new Date().getHours();
    const hello = h < 6 ? 'Bonne nuit' : h < 18 ? 'Bonjour' : 'Bonsoir';
    // quiz conseillé : le cours au plus faible score (ou jamais fait)
    const quizCourses = state.courses.filter((c) => questionsOf(c.id).length);
    const scoreOf = (c) => {
      const l = state.quizLog.filter((x) => x.courseId === c.id).at(-1);
      return l ? l.score / l.total : -1;
    };
    const suggest = [...quizCourses].sort((a, b) => scoreOf(a) - scoreOf(b))[0];
    const sugScore = suggest ? scoreOf(suggest) : -1;
    const exams = state.exams
      .map((e) => ({ ...e, days: Math.round((new Date(e.date + 'T00:00').getTime() - startOfDay()) / DAY) }))
      .filter((e) => e.days >= 0)
      .sort((a, b) => a.days - b.days);
    const always = new Set(state.news.sources.filter((s) => s.alwaysNotify).map((s) => s.id));
    const alerts = state.news.items.filter((i) => !i.read && (always.has(i.sourceId) || matchesKeywords(i).length)).slice(0, 3);
    const recent = [...state.courses].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3);

    el.innerHTML = `
      <header class="home-head">
        <div><h1>${hello} 👋</h1><p class="muted">${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p></div>
        <a class="icon-btn" href="#/reglages" aria-label="Réglages">${icon('settings', 22)}</a>
      </header>

      ${
        !state.courses.length
          ? `<a class="hero" href="#/cours?ajouter=1"><span class="hero-ic">📸</span><div><b>Ajoute ton premier cours</b><small>Prends-le en photo : Claude le recopie et crée flashcards et quiz</small></div><span class="hero-go">${icon('plus', 20)}</span></a>`
          : `<a class="hero ${due ? '' : 'done'}" href="${due ? '#/flashcards/tout/revoir' : '#/flashcards'}">
              <span class="hero-ic">${due ? '🃏' : '✅'}</span>
              <div><b>${due ? `${due} flashcard${due > 1 ? 's' : ''} à revoir` : 'Flashcards à jour'}</b>
                <small>${due ? 'Quelques minutes suffisent' : today ? `${today} carte${today > 1 ? 's' : ''} revue${today > 1 ? 's' : ''} aujourd'hui` : 'Rien à revoir pour l\'instant'}${st ? ` · 🔥 ${st} jour${st > 1 ? 's' : ''} de suite` : ''}</small></div>
              <span class="hero-go">${icon('play', 20)}</span></a>`
      }

      ${
        suggest
          ? `<a class="tile-link" href="#/quiz/${suggest.id}"><span class="tl-ic">❓</span><div><b>Quiz conseillé</b>
              <small>${esc(suggest.title)} · ${sugScore < 0 ? 'jamais fait' : `dernier score ${Math.round(sugScore * 100)} %`}</small></div>${icon('back', 18).replace('<svg', '<svg class="chev"')}</a>`
          : ''
      }

      <section class="block">
        <div class="block-head"><h2>📅 Examens</h2><button class="link-btn" data-act="add-exam">+ Ajouter</button></div>
        ${
          exams.length
            ? `<ul class="exams">${exams
                .slice(0, 4)
                .map(
                  (e) => `<li class="${e.days <= 7 ? 'soon' : ''}"><span class="jday">${e.days === 0 ? "Auj." : 'J-' + e.days}</span>
                    <div><b>${esc(e.title)}</b><small>${new Date(e.date + 'T00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}${e.subject ? ' · ' + esc(e.subject) : ''}</small></div>
                    <button class="icon-btn" data-act="del-exam" data-id="${e.id}" aria-label="Supprimer">${icon('x', 16)}</button></li>`,
                )
                .join('')}</ul>`
            : '<p class="empty-txt">Ajoute tes partiels et BTS blancs pour voir le compte à rebours.</p>'
        }
      </section>

      ${
        recent.length
          ? `<section class="block"><div class="block-head"><h2>📚 Reprendre</h2><a class="link-btn" href="#/cours">Tous les cours</a></div>
              ${recent.map((c) => `<a class="row-card" href="#/cours/${c.id}" style="--c:${subjectColor(c.subject)}"><div class="rc-main"><b>${esc(c.title)}</b><small>${esc(c.subject || 'Sans matière')} · ${relTime(c.updatedAt)}</small></div>${icon('back', 18).replace('<svg', '<svg class="chev"')}</a>`).join('')}</section>`
          : ''
      }

      <section class="block">
        <div class="block-head"><h2>🛡️ Veille</h2><a class="link-btn" href="#/veille">Tout voir</a></div>
        ${
          alerts.length
            ? alerts.map((a) => `<a class="row-card" href="${esc(a.url)}" target="_blank" rel="noopener" data-read="${esc(a.id)}"><div class="rc-main"><b>${esc(a.title)}</b><small>${relTime(a.date)}</small></div></a>`).join('')
            : '<p class="empty-txt">Aucune alerte de sécurité ou IA non lue.</p>'
        }
      </section>`;
  }
  draw();
  el.onclick = async (e) => {
    const r = e.target.closest('[data-read]');
    if (r) {
      const it = state.news.items.find((x) => x.id === r.dataset.read);
      if (it) (it.read = true), save();
      return;
    }
    const b = e.target.closest('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'add-exam') {
      const v = await formModal('Nouvel examen', [
        { name: 'title', label: 'Intitulé', placeholder: 'Ex : BTS blanc de maths', required: true },
        { name: 'date', label: 'Date', type: 'date', required: true, value: dayKey(Date.now() + 7 * DAY) },
        { name: 'subject', label: 'Matière', type: 'select', value: '', options: [{ value: '', label: '—' }, ...subjects().map((s) => ({ value: s, label: s }))] },
      ]);
      if (v?.title && v.date) {
        state.exams.push({ id: uid(), ...v });
        save();
        draw();
      }
    }
    if (b.dataset.act === 'del-exam' && (await confirmBox('Supprimer cet examen ?', { danger: true, ok: 'Supprimer' }))) {
      state.exams = state.exams.filter((x) => x.id !== b.dataset.id);
      save();
      draw();
    }
  };
}
