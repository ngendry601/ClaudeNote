import { state, save, uid } from '../store.js';
import { esc, icon, relTime, toast, $ } from '../ui.js';
import { refreshNews, isRefreshing, matchesKeywords } from '../news.js';
import { askPermission, notifPermission } from '../notify.js';

const NOTE_TITLE = '📰 Ma veille techno';

export default function newsView(el, { query }, { updateBadge }) {
  const n = state.news;
  const freshSince = n.lastVisit;
  n.lastVisit = Date.now();
  save();
  updateBadge();

  let tab = query.get('f') || 'all';
  let source = '';
  let q = '';
  let limit = 40;
  const srcOf = (id) => n.sources.find((s) => s.id === id) || { name: id, color: '#64748b' };

  function filtered() {
    return n.items.filter((i) => {
      if (tab === 'unread' && i.read) return false;
      if (tab === 'saved' && !i.saved) return false;
      if (tab === 'alerts' && !matchesKeywords(i).length) return false;
      if (source && i.sourceId !== source) return false;
      if (q && !(i.title + ' ' + (i.summary || '')).toLowerCase().includes(q)) return false;
      return true;
    });
  }

  function itemHtml(i) {
    const s = srcOf(i.sourceId);
    const kws = matchesKeywords(i);
    const fresh = i.fetchedAt > freshSince && freshSince > 0;
    return `<article class="news-item ${i.read ? 'read' : ''} ${kws.length ? 'alert' : ''}" data-id="${esc(i.id)}">
      <div class="ni-meta"><span class="src" style="--c:${s.color}">${esc(s.name)}</span><time>${relTime(i.date)}</time>
        ${i.score ? `<span>▲ ${i.score}</span>` : ''}${fresh && !i.read ? '<span class="pill new">nouveau</span>' : ''}
        ${kws.map((k) => `<span class="pill kw">🔔 ${esc(k)}</span>`).join('')}</div>
      <a class="ni-title" href="${esc(i.url)}" target="_blank" rel="noopener" data-open>${esc(i.title)}</a>
      ${i.summary ? `<p class="ni-sum">${esc(i.summary)}</p>` : ''}
      <div class="ni-actions">
        <button class="icon-btn ${i.saved ? 'on' : ''}" data-save title="${i.saved ? 'Retirer des favoris' : 'Ajouter aux favoris'}">${icon('star', 16)}</button>
        <button class="icon-btn" data-toggle-read title="${i.read ? 'Marquer non lu' : 'Marquer lu'}">${icon(i.read ? 'eye' : 'check', 16)}</button>
        <button class="icon-btn" data-note title="Ajouter à ma note de veille">${icon('note', 16)}</button>
        ${i.comments ? `<a class="icon-btn" href="${esc(i.comments)}" target="_blank" rel="noopener" title="Discussion">${icon('external', 16)}</a>` : ''}
      </div></article>`;
  }

  function listHtml() {
    const items = filtered();
    if (!n.items.length) return `<div class="empty">${icon('bell', 40)}<h3>Pas encore d'actus</h3><p>Clique sur « Actualiser » pour charger la veille.</p></div>`;
    if (!items.length) return '<p class="empty-txt">Aucun article pour ce filtre.</p>';
    return items.slice(0, limit).map(itemHtml).join('') + (items.length > limit ? `<button class="btn ghost block" data-more>Voir plus (${items.length - limit})</button>` : '');
  }

  function draw() {
    const perm = notifPermission();
    const unread = n.items.filter((i) => !i.read).length;
    const alerts = n.items.filter((i) => !i.read && matchesKeywords(i).length).length;
    const errs = Object.entries(n.errors || {});
    el.innerHTML = `
      <div class="page-head"><div><h1>Veille techno</h1><p class="muted">${n.lastFetch ? `Mis à jour ${relTime(n.lastFetch)}` : 'Jamais actualisé'} · actualisation auto toutes les ${n.interval} min</p></div>
        <div class="head-actions"><button class="btn ghost" data-act="readall">${icon('check', 16)} Tout marquer lu</button>
        <button class="btn primary" data-act="refresh" ${isRefreshing() ? 'disabled' : ''}>${icon('refresh', 16)} ${isRefreshing() ? 'Chargement…' : 'Actualiser'}</button></div></div>

      ${
        perm !== 'granted' || !n.notify
          ? `<div class="banner">${icon('bell')}<div><b>Active les notifications</b><p>Reçois une alerte quand une actu correspond à tes mots-clés${perm === 'denied' ? ' (bloquées dans ton navigateur : autorise-les dans les paramètres du site)' : ''}.</p></div>
            ${perm !== 'denied' && perm !== 'unsupported' ? `<button class="btn primary sm" data-act="notif">Activer</button>` : ''}</div>`
          : ''
      }

      <div class="kw-bar"><span class="muted">Alertes :</span>
        ${n.keywords.map((k) => `<span class="chip kw">${esc(k)}<button data-rmkw="${esc(k)}" aria-label="Retirer">×</button></span>`).join('')}
        <form data-kwform class="kw-form"><input name="kw" placeholder="+ mot-clé (ex : Rust, ransomware)" maxlength="40"></form></div>

      <div class="filter-bar">
        <div class="seg">${[['all', `Tout`], ['unread', `Non lus (${unread})`], ['alerts', `🔔 Alertes (${alerts})`], ['saved', '★ Favoris']]
          .map(([k, l]) => `<button class="${tab === k ? 'on' : ''}" data-tab="${k}">${l}</button>`)
          .join('')}</div>
        <select data-src><option value="">Toutes les sources</option>${n.sources.filter((s) => s.enabled).map((s) => `<option value="${s.id}" ${source === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select>
        <label class="search-in">${icon('search', 16)}<input type="search" placeholder="Rechercher…" data-q value="${esc(q)}"></label>
      </div>
      ${errs.length ? `<details class="errors"><summary>${errs.length} source(s) en erreur</summary><ul>${errs.map(([id, msg]) => `<li><b>${esc(srcOf(id).name)}</b> : ${esc(msg)}</li>`).join('')}</ul><p class="muted">Astuce : certains sites bloquent les requêtes directes ; un proxy est utilisé en secours (configurable dans Réglages).</p></details>` : ''}
      <div class="news-list" data-list>${listHtml()}</div>`;
  }
  const redrawList = () => ($('[data-list]', el).innerHTML = listHtml());

  async function doRefresh() {
    const p = refreshNews({ silent: false });
    draw();
    const r = await p;
    toast(r.added ? `${r.added} nouvel(le)s actu(s)` : 'Déjà à jour', r.errors ? 'info' : 'success');
    n.lastVisit = Date.now();
    save();
    updateBadge();
    if (el.isConnected) draw();
  }

  draw();
  if (!n.items.length && !isRefreshing()) doRefresh();

  el.onclick = async (e) => {
    const art = e.target.closest('[data-id]');
    const item = art && n.items.find((i) => i.id === art.dataset.id);
    if (item) {
      if (e.target.closest('[data-open]')) {
        item.read = true;
        save();
        setTimeout(() => art.classList.add('read'), 300);
        return;
      }
      if (e.target.closest('[data-save]')) {
        item.saved = !item.saved;
        save();
        art.outerHTML = itemHtml(item);
        return;
      }
      if (e.target.closest('[data-toggle-read]')) {
        item.read = !item.read;
        save();
        art.outerHTML = itemHtml(item);
        return;
      }
      if (e.target.closest('[data-note]')) {
        let note = state.courses.find((c) => c.title === NOTE_TITLE);
        if (!note) {
          note = { id: uid(), title: NOTE_TITLE, subjectId: null, tags: ['veille'], attachments: [], createdAt: Date.now(), updatedAt: Date.now(), content: `# ${NOTE_TITLE}\n\nArticles mis de côté depuis l'onglet Veille.\n\n` };
          state.courses.push(note);
        }
        note.content += `- [${item.title.replace(/[[\]]/g, '')}](${item.url}) — *${srcOf(item.sourceId).name}, ${new Date(item.date).toLocaleDateString('fr-FR')}*\n`;
        note.updatedAt = Date.now();
        item.saved = true;
        save();
        art.outerHTML = itemHtml(item);
        toast('Ajouté à « Ma veille techno » dans tes cours', 'success');
        return;
      }
    }
    if (e.target.closest('[data-more]')) {
      limit += 40;
      redrawList();
      return;
    }
    const t = e.target.closest('[data-tab]');
    if (t) {
      tab = t.dataset.tab;
      limit = 40;
      draw();
      return;
    }
    const rk = e.target.closest('[data-rmkw]');
    if (rk) {
      n.keywords = n.keywords.filter((k) => k !== rk.dataset.rmkw);
      save();
      draw();
      return;
    }
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'refresh') doRefresh();
    if (a === 'readall') {
      filtered().forEach((i) => (i.read = true));
      save();
      updateBadge();
      draw();
    }
    if (a === 'notif') {
      const p = await askPermission();
      if (p === 'granted') {
        n.notify = true;
        save();
        toast('Notifications activées 🔔', 'success');
      } else toast('Permission refusée', 'error');
      draw();
    }
  };
  el.onsubmit = (e) => {
    if (!e.target.matches('[data-kwform]')) return;
    e.preventDefault();
    const kw = e.target.kw.value.trim();
    if (kw && !n.keywords.some((k) => k.toLowerCase() === kw.toLowerCase())) {
      n.keywords.push(kw);
      save();
    }
    draw();
    $('[data-kwform] input', el)?.focus();
  };
  el.onchange = (e) => {
    if (e.target.matches('[data-src]')) {
      source = e.target.value;
      redrawList();
    }
  };
  el.oninput = (e) => {
    if (e.target.matches('[data-q]')) {
      q = e.target.value.toLowerCase();
      redrawList();
    }
  };
}
