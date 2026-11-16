// Minuteur Pomodoro global (continue de tourner quand on change d'onglet dans l'appli)
import { state, save, dayKey } from './store.js';
import { notify } from './notify.js';

export const MODES = { work: 'Concentration', short: 'Pause courte', long: 'Pause longue' };

export const timer = {
  mode: 'work',
  running: false,
  endAt: 0,
  remaining: 0,
  doneInCycle: 0,
  courseId: '',
};

const subs = new Set();
export const onTick = (fn) => (subs.add(fn), () => subs.delete(fn));
const emit = () => subs.forEach((f) => f(timer));

export const duration = (mode) => (state.settings.pomodoro[mode] || 25) * 60e3;

export function setMode(mode) {
  timer.mode = mode;
  timer.running = false;
  timer.remaining = duration(mode);
  emit();
}

export function start() {
  if (timer.running) return;
  if (!timer.remaining) timer.remaining = duration(timer.mode);
  timer.endAt = Date.now() + timer.remaining;
  timer.running = true;
  emit();
}
export function pause() {
  if (!timer.running) return;
  timer.remaining = Math.max(0, timer.endAt - Date.now());
  timer.running = false;
  emit();
}
export function reset() {
  setMode(timer.mode);
}
export function skip() {
  complete(false);
}

function complete(natural = true) {
  const wasWork = timer.mode === 'work';
  if (wasWork && natural) {
    const k = dayKey();
    state.pomodoroLog[k] = (state.pomodoroLog[k] || 0) + 1;
    save();
    timer.doneInCycle++;
  }
  let next = 'work';
  if (wasWork) next = timer.doneInCycle % (state.settings.pomodoro.every || 4) === 0 && timer.doneInCycle ? 'long' : 'short';
  if (natural) {
    notify(wasWork ? '🍅 Session terminée !' : '⏰ Pause terminée', wasWork ? `Prends une ${MODES[next].toLowerCase()}.` : 'On reprend la concentration 💪', '#/pomodoro', 'pomodoro');
    beep();
  }
  setMode(next);
}

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.25, 0.5].forEach((t) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.15, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.2);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + t);
      o.stop(ctx.currentTime + t + 0.2);
    });
  } catch (e) {
    /* pas de son */
  }
}

setInterval(() => {
  if (!timer.running) return;
  timer.remaining = Math.max(0, timer.endAt - Date.now());
  if (timer.remaining <= 0) complete(true);
  else emit();
}, 500);

export const fmt = (ms) => {
  const s = Math.ceil(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};
