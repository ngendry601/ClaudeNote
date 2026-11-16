import { state, save, dayKey } from '../store.js';
import { icon, esc } from '../ui.js';
import { timer, MODES, onTick, setMode, start, pause, reset, skip, duration, fmt } from '../timer.js';

export default function pomodoroView(el) {
  const R = 120;
  const C = 2 * Math.PI * R;
  function draw() {
    const today = state.pomodoroLog[dayKey()] || 0;
    const p = state.settings.pomodoro;
    el.innerHTML = `
      <div class="page-head"><h1>Pomodoro</h1></div>
      <div class="pomo panel mode-${timer.mode}">
        <div class="seg">${Object.entries(MODES).map(([k, l]) => `<button class="${timer.mode === k ? 'on' : ''}" data-mode="${k}">${l}</button>`).join('')}</div>
        <div class="ring">
          <svg viewBox="0 0 280 280"><circle cx="140" cy="140" r="${R}" class="ring-bg"/><circle cx="140" cy="140" r="${R}" class="ring-fg" data-ring stroke-dasharray="${C}" stroke-dashoffset="0"/></svg>
          <div class="ring-txt"><b data-time>${fmt(timer.remaining)}</b><span>${MODES[timer.mode]}</span></div>
        </div>
        <div class="pomo-ctrl">
          <button class="btn ghost" data-act="reset">Réinitialiser</button>
          <button class="btn primary lg round" data-act="toggle">${timer.running ? icon('pause', 22) + ' Pause' : icon('play', 22) + ' Démarrer'}</button>
          <button class="btn ghost" data-act="skip">Passer</button>
        </div>
        <label class="field inline"><span>Je travaille sur</span>
          <select data-course><option value="">—</option>${state.courses.map((c) => `<option value="${c.id}" ${timer.courseId === c.id ? 'selected' : ''}>${esc(c.title)}</option>`).join('')}</select>
          ${timer.courseId ? `<a class="btn sm ghost" href="#/cours/${timer.courseId}">Ouvrir</a>` : ''}</label>
        <p class="pomo-today">${'🍅'.repeat(Math.min(today, 12))}${today > 12 ? ` +${today - 12}` : ''} ${today ? `${today} session${today > 1 ? 's' : ''} aujourd'hui` : 'Aucune session aujourd\'hui'}</p>
      </div>
      <details class="panel"><summary>Durées</summary>
        <form class="pomo-settings" data-settings>
          <label class="field"><span>Concentration (min)</span><input type="number" name="work" min="1" max="120" value="${p.work}"></label>
          <label class="field"><span>Pause courte</span><input type="number" name="short" min="1" max="60" value="${p.short}"></label>
          <label class="field"><span>Pause longue</span><input type="number" name="long" min="1" max="60" value="${p.long}"></label>
          <label class="field"><span>Pause longue toutes les</span><input type="number" name="every" min="2" max="10" value="${p.every}"></label>
        </form></details>`;
    tick();
  }
  function tick() {
    const t = el.querySelector('[data-time]');
    if (!t) return;
    t.textContent = fmt(timer.remaining);
    const ratio = timer.remaining / duration(timer.mode);
    el.querySelector('[data-ring]').style.strokeDashoffset = String(C * (1 - ratio));
  }
  let lastMode = timer.mode;
  let lastRunning = timer.running;
  const off = onTick(() => {
    if (timer.mode !== lastMode || timer.running !== lastRunning) {
      lastMode = timer.mode;
      lastRunning = timer.running;
      draw();
    } else tick();
  });
  draw();
  el.onclick = (e) => {
    const m = e.target.closest('[data-mode]');
    if (m) return setMode(m.dataset.mode);
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'toggle') timer.running ? pause() : start();
    if (a === 'reset') reset();
    if (a === 'skip') skip();
  };
  el.onchange = (e) => {
    if (e.target.matches('[data-course]')) {
      timer.courseId = e.target.value;
      draw();
    }
    if (e.target.closest('[data-settings]')) {
      const v = Math.max(1, Number(e.target.value) || 1);
      state.settings.pomodoro[e.target.name] = v;
      save();
      if (!timer.running && e.target.name === timer.mode) setMode(timer.mode);
    }
  };
  return off;
}
