export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 21.5A2.5 2.5 0 0 1 6.5 19H20v3H6.5"/>',
  cards: '<rect x="3" y="6" width="14" height="14" rx="2"/><path d="M7 2h12a2 2 0 0 1 2 2v12"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"/>',
  star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-2.64-6.36L21 8"/><path d="M21 3v5h-5"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
  clip: '<path d="m21.4 11-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5"/>',
  back: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3.2.3 1.5 1.3 2.7 2.5 2.7"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  note: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
  play: '<path d="m6 4 14 8-14 8z"/>',
  pause: '<path d="M7 4h3v16H7zM14 4h3v16h-3z"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
  external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
};
export const icon = (name, size = 18) =>
  `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

export function toast(msg, type = 'info') {
  const root = document.getElementById('toast-root');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  root.append(el);
  setTimeout(() => el.classList.add('out'), 2600);
  setTimeout(() => el.remove(), 3000);
}

export function openModal(html, { onMount, onClose, wide } = {}) {
  const root = document.getElementById('modal-root');
  const back = document.createElement('div');
  back.className = 'modal-backdrop';
  back.innerHTML = `<div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true">${html}</div>`;
  root.append(back);
  let closed = false;
  const onKey = (e) => e.key === 'Escape' && close();
  const close = () => {
    if (closed) return;
    closed = true;
    back.remove();
    document.removeEventListener('keydown', onKey);
    onClose?.();
  };
  document.addEventListener('keydown', onKey);
  back.addEventListener('mousedown', (e) => e.target === back && close());
  $$('[data-close]', back).forEach((b) => (b.onclick = close));
  onMount?.(back.firstElementChild, close);
  setTimeout(() => $('input:not([type=checkbox]),textarea,select', back)?.focus(), 30);
  return close;
}

export function confirmBox(message, { ok = 'Confirmer', danger = false, detail = '' } = {}) {
  return new Promise((resolve) => {
    let result = false;
    openModal(
      `<h3>${esc(message)}</h3>${detail ? `<p class="muted">${esc(detail)}</p>` : ''}
       <div class="modal-actions"><button class="btn ghost" data-close>Annuler</button>
       <button class="btn ${danger ? 'danger' : 'primary'}" data-yes>${esc(ok)}</button></div>`,
      {
        onMount: (m, close) => ($('[data-yes]', m).onclick = () => ((result = true), close())),
        onClose: () => resolve(result),
      },
    );
  });
}

/** fields: [{name,label,type,value,options:[{value,label}],placeholder,required}] */
export function formModal(title, fields, submitLabel = 'Enregistrer') {
  return new Promise((resolve) => {
    let result = null;
    const f = fields
      .map((fd) => {
        const id = `f_${fd.name}`;
        let input;
        if (fd.type === 'select')
          input = `<select id="${id}" name="${fd.name}">${fd.options
            .map((o) => `<option value="${esc(o.value)}" ${o.value === fd.value ? 'selected' : ''}>${esc(o.label)}</option>`)
            .join('')}</select>`;
        else if (fd.type === 'textarea')
          input = `<textarea id="${id}" name="${fd.name}" rows="${fd.rows || 4}" placeholder="${esc(fd.placeholder || '')}">${esc(fd.value || '')}</textarea>`;
        else if (fd.type === 'color')
          input = `<div class="color-pick">${fd.options
            .map((c) => `<label><input type="radio" name="${fd.name}" value="${c}" ${c === fd.value ? 'checked' : ''}><span style="background:${c}"></span></label>`)
            .join('')}</div>`;
        else
          input = `<input id="${id}" name="${fd.name}" type="${fd.type || 'text'}" value="${esc(fd.value || '')}" placeholder="${esc(fd.placeholder || '')}" ${fd.required ? 'required' : ''}>`;
        return `<label class="field"><span>${esc(fd.label)}</span>${input}</label>`;
      })
      .join('');
    openModal(
      `<form class="form"><h3>${esc(title)}</h3>${f}
       <div class="modal-actions"><button type="button" class="btn ghost" data-close>Annuler</button>
       <button class="btn primary" type="submit">${esc(submitLabel)}</button></div></form>`,
      {
        onMount: (m, close) => {
          const form = $('form', m);
          form.onsubmit = (e) => {
            e.preventDefault();
            result = Object.fromEntries(new FormData(form).entries());
            close();
          };
        },
        onClose: () => resolve(result),
      },
    );
  });
}

export function relTime(ts) {
  const diff = Date.now() - ts;
  const abs = Math.abs(diff);
  const fut = diff < 0;
  const units = [
    [60e3, 's', 1e3],
    [3600e3, 'min', 60e3],
    [864e5, 'h', 3600e3],
    [30 * 864e5, 'j', 864e5],
    [365 * 864e5, 'mois', 30 * 864e5],
    [Infinity, 'an', 365 * 864e5],
  ];
  for (const [lim, u, div] of units) {
    if (abs < lim) {
      const n = Math.max(1, Math.round(abs / div));
      if (u === 's') return fut ? 'dans un instant' : "à l'instant";
      return fut ? `dans ${n} ${u}` : `il y a ${n} ${u}`;
    }
  }
}

export const fmtDate = (ts) => new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

export function fmtSize(b) {
  if (b < 1024) return `${b} o`;
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(0)} Ko`;
  return `${(b / 1024 ** 2).toFixed(1)} Mo`;
}

export function download(name, content, type = 'text/plain') {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function debounce(fn, ms) {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
}
