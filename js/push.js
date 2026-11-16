// Notifications push « appli fermée » : l'appareil s'abonne avec une paire de clés VAPID générée localement.
// Le « code de configuration » est ensuite collé dans le secret GitHub PUSH_CONFIG ; la GitHub Action
// (scripts/veille.mjs) l'utilise pour envoyer les alertes de veille et le rappel de révision.
import { state, save } from './store.js';

export const REPO = 'ngendry601/ClaudeNote';

const b64u = (buf) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
const fromB64u = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));

export const pushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
export const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
export const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

async function ensureVapid() {
  if (state.push.vapidPublic && state.push.vapidPrivate) return;
  const kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  state.push.vapidPublic = b64u(await crypto.subtle.exportKey('raw', kp.publicKey));
  state.push.vapidPrivate = (await crypto.subtle.exportKey('jwk', kp.privateKey)).d;
  save();
}

export async function subscribePush() {
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') throw new Error('Permission refusée');
  await ensureVapid();
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (sub) {
    const key = sub.options?.applicationServerKey;
    if (!key || b64u(key) !== state.push.vapidPublic) {
      await sub.unsubscribe();
      sub = null;
    }
  }
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: fromB64u(state.push.vapidPublic) });
  state.push.subscription = sub.toJSON();
  state.news.notify = true;
  save();
  return sub;
}

export async function unsubscribePush() {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) await sub.unsubscribe();
  state.push.subscription = null;
  save();
}

/** Code à coller dans le secret GitHub PUSH_CONFIG */
export function configCode() {
  const p = state.push;
  if (!p.subscription) return '';
  const cfg = {
    v: 1,
    subscription: p.subscription,
    vapidPublic: p.vapidPublic,
    vapidPrivate: p.vapidPrivate,
    keywords: state.news.keywords,
    sources: state.news.sources.filter((s) => s.enabled).map((s) => s.id),
    remindHour: Number(p.remindHour),
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Paris',
  };
  return btoa(unescape(encodeURIComponent(JSON.stringify(cfg))));
}
