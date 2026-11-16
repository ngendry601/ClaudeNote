import { state, save, uid, isDue, streak, dayKey, getSubject, startOfDay, DAY } from '../store.js';
import { esc, icon, relTime, formModal, confirmBox } from '../ui.js';
import { stripMd } from '../md.js';

function heatmap() {
  const weeks = 17;
  const today = new Date();
  const start = new Date(startOfDay() - ((weeks - 1) * 7 + ((today.getDay() + 6) % 7)) * DAY);
  const cells = [];
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(start.getTime() + i * DAY + 12 * 3600e3);
    if (d > today) {
      cells.push('<i class="hm-cell empty"></i>');
      continue;
    }
    const n = state.reviewLog[dayKey(d)] || 0;
    const lvl = n === 0 ? 0 : n < 10 ? 1 : n < 25 ? 2 : n < 50 ? 3 : 4;
    cells.push(`<i class="hm-cell l${lvl}" title="${d.toLocaleDateString('fr-FR')} : ${n} carte(s)"></i>`);
  }
  return `<div class="heatmap">${cells.join('')}</div>`;
}

export default function dashboard(el) {
  function draw() {
    const now = Date.now();
    const due = state.cards.filter((c) => isDue(c, now)).length;
    const today = state.reviewLog[dayKey()] || 0;
    const goal = state.settings.dailyGoal || 30;
    const pomos = state.pomodoroLog[dayKey()] || 0;
    const st = streak();
    const h = new Date().getHours();
    const hello = h < 6 ? 'Bonne nuit' : h < 18 ? 'Bonjour' : 'Bonsoir';
    const exams = [...state.exams].sort((a, b) => a.date.localeCompare(b.date));
    const recent = [...state.courses].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 4);
    const news = state.news.items.filter((i) => !i.read).slice(0, 5);
    const srcName = (id) => state.news.sources.find((s) => s.id === id)?.name || id;

    el.innerHTML = `
      <div class="page-head"><div><h1>${hello} 👋</h1><p class="muted">${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p></div>
        ${due ? `<a class="btn primary lg" href="#/reviser/all">${icon('zap')} Réviser ${due} carte${due > 1 ? 's' : ''}</a>` : ''}</div>

      <div class="stats">
        <div class="stat"><span class="stat-ic" style="--c:#6366f1">${icon('cards')}</span><div><b>${due}</b><span>cartes à réviser</span></div></div>
        <div class="stat"><span class="stat-ic" style="--c:#f97316">${icon('flame')}</span><div><b>${st} j</b><span>série en cours</span></div></div>
        <div class="stat"><span class="stat-ic" style="--c:#10b981">${icon('check')}</span><div><b>${today}/${goal}</b><span>objectif du jour</span></div>
          <div class="mini-bar"><i style="width:${Math.min(100, (today / goal) * 100)}%"></i></div></div>
        <div class="stat"><span class="stat-ic" style="--c:#ef4444">${icon('timer')}</span><div><b>${pomos}</b><span>pomodoro${pomos > 1 ? 's' : ''} aujourd'hui</span></div></div>
      </div>

      <div class="grid-2">
        <section class="panel">
          <div class="panel-head"><h2>${icon('calendar')} Examens à venir</h2><button class="btn sm ghost" data-act="add-exam">${icon('plus')} Ajouter</button></div>
          ${
            exams.length
              ? `<ul class="exam-list">${exams
                  .map((e) => {
                    const days = Math.round((new Date(e.date + 'T00:00').getTime() - startOfDay()) / DAY);
                    const sub = getSubject(e.subjectId);
                    const cls = days < 0 ? 'past' : days <= 7 ? 'soon' : '';
                    return `<li class="${cls}"><span class="jday">${days < 0 ? 'passé' : days === 0 ? "Aujourd'hui" : 'J-' + days}</span>
                      <div><b>${esc(e.title)}</b><small>${new Date(e.date + 'T00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}${sub ? ' · ' + esc(sub.name) : ''}</small></div>
                      <button class="icon-btn" data-act="del-exam" data-id="${e.id}" title="Supprimer">${icon('x', 16)}</button></li>`;
                  })
                  .join('')}</ul>`
              : '<p class="empty-txt">Aucun examen. Ajoute tes partiels pour voir le compte à rebours.</p>'
          }
        </section>

        <section class="panel">
          <div class="panel-head"><h2>${icon('flame')} Activité de révision</h2></div>
          ${heatmap()}
          <div class="hm-legend">Moins <i class="hm-cell l0"></i><i class="hm-cell l1"></i><i class="hm-cell l2"></i><i class="hm-cell l3"></i><i class="hm-cell l4"></i> Plus</div>
        </section>

        <section class="panel">
          <div class="panel-head"><h2>${icon('book')} Cours récents</h2><a class="btn sm ghost" href="#/cours">Tout voir</a></div>
          ${
            recent.length
              ? `<ul class="link-list">${recent
                  .map((c) => {
                    const sub = getSubject(c.subjectId);
                    return `<li><a href="#/cours/${c.id}"><span class="dot" style="background:${sub?.color || '#94a3b8'}"></span>
                      <div><b>${esc(c.title)}</b><small>${esc(stripMd(c.content).slice(0, 80))}</small></div><time>${relTime(c.updatedAt)}</time></a></li>`;
                  })
                  .join('')}</ul>`
              : '<p class="empty-txt">Pas encore de cours.</p>'
          }
        </section>

        <section class="panel">
          <div class="panel-head"><h2>${icon('bell')} Dernières actus</h2><a class="btn sm ghost" href="#/veille">Veille</a></div>
          ${
            news.length
              ? `<ul class="link-list">${news
                  .map(
                    (n) => `<li><a href="${esc(n.url)}" target="_blank" rel="noopener" data-read="${esc(n.id)}"><div><b>${esc(n.title)}</b><small>${esc(srcName(n.sourceId))} · ${relTime(n.date)}</small></div></a></li>`,
                  )
                  .join('')}</ul>`
              : '<p class="empty-txt">Rien de neuf pour le moment. Va dans l\'onglet Veille pour charger les actus.</p>'
          }
        </section>
      </div>`;
  }

  draw();

  el.onclick = async (e) => {
    const r = e.target.closest('[data-read]');
    if (r) {
      const it = state.news.items.find((i) => i.id === r.dataset.read);
      if (it) {
        it.read = true;
        save();
      }
      return;
    }
    const b = e.target.closest('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'add-exam') {
      const v = await formModal('Nouvel examen', [
        { name: 'title', label: 'Intitulé', placeholder: 'Partiel de BDD', required: true },
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
