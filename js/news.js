// Service de veille technologique : récupère HN, DEV et des flux RSS, détecte les nouveautés et notifie.
import { state, save } from './store.js';
import { notify } from './notify.js';

const MAX_ITEMS = 500;

async function fetchText(url, { json = false, cached = null } = {}) {
  const tries = [...(cached ? [cached] : []), url, ...state.news.proxies.filter(Boolean).map((p) => p + encodeURIComponent(url))];
  let lastErr;
  for (const u of tries) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 12000);
      const r = await fetch(u, { signal: ctrl.signal });
      clearTimeout(t);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return json ? await r.json() : await r.text();
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('Échec du chargement');
}

const stripHtml = (html = '') => {
  const d = new DOMParser().parseFromString(html, 'text/html');
  return (d.body.textContent || '').replace(/\s+/g, ' ').trim();
};
const cut = (s, n = 220) => (s.length > n ? s.slice(0, n).trimEnd() + '…' : s);

async function fetchHN(src) {
  const ids = (await fetchText('https://hacker-news.firebaseio.com/v0/topstories.json', { json: true })).slice(0, 30);
  const items = await Promise.all(
    ids.map((id) => fetchText(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, { json: true }).catch(() => null)),
  );
  return items
    .filter((it) => it && it.title)
    .map((it) => ({
      id: `hn:${it.id}`,
      sourceId: src.id,
      title: it.title,
      url: it.url || `https://news.ycombinator.com/item?id=${it.id}`,
      comments: `https://news.ycombinator.com/item?id=${it.id}`,
      date: it.time * 1000,
      score: it.score,
      summary: '',
    }));
}

async function fetchDevto(src) {
  const arts = await fetchText('https://dev.to/api/articles?top=2&per_page=30', { json: true });
  return arts.map((a) => ({
    id: `devto:${a.id}`,
    sourceId: src.id,
    title: a.title,
    url: a.url,
    date: Date.parse(a.published_at),
    score: a.positive_reactions_count,
    summary: cut(a.description || ''),
    tags: a.tag_list,
  }));
}

async function fetchRSS(src) {
  // feeds/<id>.xml est généré toutes les 30 min par la GitHub Action (voir scripts/veille.mjs)
  const txt = await fetchText(src.url, { cached: src.custom ? null : `feeds/${src.id}.xml` });
  const doc = new DOMParser().parseFromString(txt, 'text/xml');
  if (doc.querySelector('parsererror')) throw new Error('Flux RSS invalide');
  const nodes = [...doc.querySelectorAll('item, entry')].slice(0, 40);
  const get = (n, sel) => n.getElementsByTagName(sel)[0]?.textContent?.trim() || '';
  return nodes
    .map((n) => {
      const linkEl = [...n.getElementsByTagName('link')].find((l) => !l.getAttribute('rel') || l.getAttribute('rel') === 'alternate');
      const link = (linkEl && (linkEl.getAttribute('href') || linkEl.textContent.trim())) || get(n, 'guid');
      const date = Date.parse(get(n, 'pubDate') || get(n, 'published') || get(n, 'updated') || get(n, 'dc:date')) || Date.now();
      const summary = cut(stripHtml(get(n, 'description') || get(n, 'summary') || get(n, 'content')));
      return { id: `${src.id}:${link || get(n, 'title')}`, sourceId: src.id, title: stripHtml(get(n, 'title')), url: link, date, summary };
    })
    .filter((it) => it.title && it.url);
}

export function matchesKeywords(item) {
  const kws = state.news.keywords;
  if (!kws.length) return [];
  const hay = `${item.title} ${item.summary || ''} ${(item.tags || []).join(' ')}`.toLowerCase();
  return kws.filter((k) => {
    const kw = k.toLowerCase();
    // mot entier pour les mots-clés courts (évite "IA" dans "social")
    if (kw.length <= 3) return new RegExp(`(^|[^\\p{L}\\d])${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\p{L}\\d]|$)`, 'iu').test(hay);
    return hay.includes(kw);
  });
}

let refreshing = null;
export const isRefreshing = () => !!refreshing;

export function refreshNews({ silent = false } = {}) {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const n = state.news;
    const firstFetch = !n.lastFetch;
    const enabled = n.sources.filter((s) => s.enabled);
    const results = await Promise.allSettled(
      enabled.map((s) => (s.type === 'hn' ? fetchHN(s) : s.type === 'devto' ? fetchDevto(s) : fetchRSS(s))),
    );
    const known = new Set(n.items.map((i) => i.id));
    const added = [];
    n.errors = {};
    results.forEach((r, idx) => {
      const src = enabled[idx];
      if (r.status === 'rejected') {
        n.errors[src.id] = String(r.reason?.message || r.reason);
        return;
      }
      for (const it of r.value) {
        if (known.has(it.id)) continue;
        known.add(it.id);
        const item = { ...it, fetchedAt: Date.now(), read: false, saved: false };
        n.items.push(item);
        added.push(item);
      }
    });
    n.items.sort((a, b) => b.date - a.date);
    if (n.items.length > MAX_ITEMS) {
      const keep = n.items.filter((i) => i.saved);
      const rest = n.items.filter((i) => !i.saved).slice(0, MAX_ITEMS - keep.length);
      n.items = [...keep, ...rest].sort((a, b) => b.date - a.date);
    }
    n.lastFetch = Date.now();
    save();

    if (!firstFetch && !silent && n.notify && added.length) {
      const alerts = added.filter((i) => matchesKeywords(i).length);
      if (alerts.length === 1) {
        await notify(`🔔 ${matchesKeywords(alerts[0]).join(', ')}`, alerts[0].title, '#/veille?f=alerts', 'news-alert');
      } else if (alerts.length > 1) {
        await notify(`🔔 ${alerts.length} actus correspondent à tes alertes`, alerts.slice(0, 3).map((a) => '• ' + a.title).join('\n'), '#/veille?f=alerts', 'news-alert');
      } else if (!n.keywords.length) {
        await notify(`📰 ${added.length} nouvelles actus tech`, added.slice(0, 3).map((a) => '• ' + a.title).join('\n'), '#/veille', 'news');
      }
    }
    return { added: added.length, errors: Object.keys(n.errors).length };
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

export const unreadFresh = () => state.news.items.filter((i) => !i.read && i.fetchedAt > state.news.lastVisit).length;

let timer = null;
export function startAutoRefresh() {
  clearInterval(timer);
  const ms = Math.max(5, Number(state.news.interval) || 30) * 60e3;
  timer = setInterval(() => refreshNews(), ms);
  if (Date.now() - state.news.lastFetch > ms) refreshNews();
}
