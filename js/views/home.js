// Accueil : une seule grande action (réviser), puis l'essentiel de la journée.
import { state, save, uid, isDue, streak, dayKey, getSubject, startOfDay, DAY } from '../store.js';
import { esc, icon, relTime, formModal, confirmBox } from '../ui.js';
import { courseDue } from '../library.js';
import { matchesKeywords } from '../news.js';

export default function home(el) {
  function draw() {
    const now = Date.now();
    const due = state.cards.filter((c) => isDue(c, now)).length;
    const today = state.reviewLog[dayKey()] || 0;
    const goal = state.settings.dailyGoal || 30;
    const st = streak();
    const h = new Date().getHours();
    const hello = h < 6 ? 'Bonne nuit' : h < 18 ? 'Bonjour' : 'Bonsoir';
    const exams = [...state.exams]
      .map((e) => ({ ...e, days: Math.round((new Date(e.date + 'T00:00').getTime() - startOfDay()) / DAY) }))
      .filter((e) => e.days >= 0)
      .sort((a, b) => a.days - b.days);
    const recent = [...state.courses].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 4);
    const alwaysIds = new Set(state.news.sources.filter((s) => s.alwaysNotify).map((s) => s.id));
    const alerts = state.news.items.filter((i) => !i.read && (alwaysIds.has(i.sourceId) || matchesKeywords(i).length));

    el.innerHTML = `
      <header class="home-head"><h1>${hello} 👋</h1>
        <p class="muted">${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}${st ? ` · 🔥 ${st} jour${st > 1 ? 's' : ''} de suite` : ''}</p></header>

      <a class="hero ${due ? '' : 'done'}" href="${due ? '#/reviser/all' : '#/reviser'}">
        <div class="hero-ic">${due ? '📚' : '✅'}</div>
        <div class="hero-txt"><b>${due ? `${due} fiche${due > 1 ? 's' : ''} à réviser` : 'Tout est révisé !'}</b>
          <span>${due ? 'Appuie pour commencer' : 'Fais un quiz pour t\'entraîner'}</span>
          <div class="mini-bar"><i style="width:${Math.min(100, (today / goal) * 100)}%"></i></div>
          <small>${today} / ${goal} aujourd'hui</small></div>
        <span class="hero-go">${icon('play', 22)}</span>
      </a>

      <div class="quick">
        <a class="quick-btn" href="#/cours?ajouter=1"><span>📸</span>Ajouter un cours</a>
        <a class="quick-btn" href="#/quiz"><span>❓</span>Quiz</a>
        <a class="quick-btn" href="#/pomodoro"><span>⏱️</span>Pomodoro</a>
      </div>

      <section class="block">
        <div class="block-head"><h2>Mes cours</h2><a href="#/cours">Tout voir</a></div>
        ${
          recent.length
            ? `<div class="course-rows">${recent
                .map((c) => {
                  const d = courseDue(c);
                  const sub = getSubject(c.subjectId);
                  return `<a class="course-row" href="#/cours/${c.id}" style="--c:${sub?.color || '#94a3b8'}">
                    <span class="cr-bar"></span><div><b>${esc(c.title)}</b><small>${esc(sub?.name || 'Sans matière')} · ${relTime(c.updatedAt)}</small></div>
                    ${d ? `<span class="pill due">${d} à réviser</span>` : ''}</a>`;
                })
                .join('')}</div>`
            : `<p class="empty-txt">Aucun cours. <a href="#/cours?ajouter=1">Ajoute ton premier cours</a>.</p>`
        }
      </section>

      <section class="block">
        <div class="block-head"><h2>Examens</h2><button class="link-btn" data-act="add-exam">+ Ajouter</button></div>
        ${
          exams.length
            ? `<ul class="exam-list">${exams
                .slice(0, 4)
                .map((e) => {
                  const sub = getSubject(e.subjectId);
                  return `<li class="${e.days <= 7 ? 'soon' : ''}"><span class="jday">${e.days === 0 ? "Aujourd'hui" : 'J-' + e.days}</span>
                    <div><b>${esc(e.title)}</b><small>${new Date(e.date + 'T00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}${sub ? ' · ' + esc(sub.name) : ''}</small></div>
                    <button class="icon-btn" data-act="del-exam" data-id="${e.id}" title="Supprimer">${icon('x', 16)}</button></li>`;
                })
                .join('')}</ul>`
            : '<p class="empty-txt">Ajoute tes partiels pour voir le compte à rebours.</p>'
        }
      </section>

      <a class="block veille-link" href="#/veille">
        <span>🛡️🤖</span><div><b>Veille sécu & IA</b><small>${alerts.length ? `${alerts.length} alerte${alerts.length > 1 ? 's' : ''} non lue${alerts.length > 1 ? 's' : ''}` : 'Rien d\'urgent'}</small></div>${icon('back', 18).replace('<svg', '<svg style="transform:rotate(180deg)"')}
      </a>`;
  }

  draw();
  el.onclick = async (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'add-exam') {
      const v = await formModal('Nouvel examen', [
        { name: 'title', label: 'Intitulé', placeholder: 'Ex : BTS blanc de maths', required: true },
        { name: 'date', label: 'Date', type: 'date', required: true, value: dayKey(Date.now() + 7 * DAY) },
        { name: 'subjectId', label: 'Matière', type: 'select', value: '', options: [{ value: '', label: '—' }, ...state.subjects.map((s) => ({ value: s.id, label: s.name }))] },
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
