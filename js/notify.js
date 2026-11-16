export const notifSupported = () => 'Notification' in window;
export const notifPermission = () => (notifSupported() ? Notification.permission : 'unsupported');

export async function askPermission() {
  if (!notifSupported()) return 'unsupported';
  return Notification.requestPermission();
}

export async function notify(title, body, hash = '#/veille', tag) {
  if (notifPermission() !== 'granted') return false;
  const opts = { body, icon: 'icon.svg', badge: 'icon.svg', tag, data: { hash } };
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) {
      await reg.showNotification(title, opts);
      return true;
    }
  } catch (e) {
    /* on retombe sur l'API classique */
  }
  const n = new Notification(title, opts);
  n.onclick = () => {
    window.focus();
    location.hash = hash;
    n.close();
  };
  return true;
}
