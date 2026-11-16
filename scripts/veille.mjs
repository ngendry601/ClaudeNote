#!/usr/bin/env node
// Exécuté par la GitHub Action toutes les ~30 min :
//  1. récupère les flux RSS de veille et les publie dans <OUT_DIR>/feeds/<id>.xml (l'appli les lit sans souci de CORS)
//  2. compare avec le passage précédent (feeds/state.json publié sur le site) pour trouver les nouveautés
//  3. si le secret PUSH_CONFIG existe : notification push pour les actus qui matchent tes mots-clés
//     + rappel de révision quotidien à l'heure choisie
import fs from 'node:fs/promises';
import path from 'node:path';
import webpush from 'web-push';
import { DEFAULT_SOURCES } from '../js/sources.js';

const OUT = process.env.OUT_DIR || '_site';
const SITE = (process.env.SITE_URL || '').replace(/\/$/, '');
const MAX_SEEN = 4000;

const log = (...a) => console.log('•', ...a);

function readConfig() {
  const raw = process.env.PUSH_CONFIG;
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw.trim(), 'base64').toString('utf8'));
  } catch (e) {
    console.warn('⚠️ PUSH_CONFIG illisible : recopie le code depuis Réglages > Notifications.');
    return null;
  }
}

async function get(url, json = false) {
  const r = await fetch(url, {
    headers: { 'User-Agent': 'ClaudeNote-veille/1.0 (+GitHub Actions)', Accept: json ? 'application/json' : 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*' },
    redirect: 'follow',
    signal: AbortSignal.timeout(20000),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return json ? r.json() : r.text();
}

const decode = (s = '') =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

function parseFeed(xml, src) {
  const blocks = xml.match(/<(item|entry)[\s>][\s\S]*?<\/\1>/g) || [];
  return blocks.slice(0, 40).map((b) => {
    const tag = (t) => decode((b.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`)) || [])[1]);
    let link = tag('link');
    if (!link) link = (b.match(/<link[^>]*href="([^"]+)"/) || [])[1] || tag('guid');
    const title = tag('title');
    const summary = tag('description') || tag('summary');
    // même identifiant que dans l'appli (js/news.js) : `${src.id}:${link}`
    return { id: `${src.id}:${link || title}`, source: src.name, title, url: link, summary };
  });
}

async function fetchSource(src) {
  if (src.type === 'hn') {
    const ids = (await get('https://hacker-news.firebaseio.com/v0/topstories.json', true)).slice(0, 30);
    const items = await Promise.all(ids.map((id) => get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, true).catch(() => null)));
    return items.filter((i) => i?.title).map((i) => ({ id: `hn:${i.id}`, source: src.name, title: i.title, url: i.url || `https://news.ycombinator.com/item?id=${i.id}`, summary: '' }));
  }
  if (src.type === 'devto') {
    const arts = await get('https://dev.to/api/articles?top=2&per_page=30', true);
    return arts.map((a) => ({ id: `devto:${a.id}`, source: src.name, title: a.title, url: a.url, summary: `${a.description || ''} ${(a.tag_list || []).join(' ')}` }));
  }
  const xml = await get(src.url);
  await fs.writeFile(path.join(OUT, 'feeds', `${src.id}.xml`), xml);
  return parseFeed(xml, src);
}

function matches(item, keywords) {
  const hay = `${item.title} ${item.summary}`.toLowerCase();
  return keywords.filter((k) => {
    const kw = k.toLowerCase();
    if (kw.length <= 3) return new RegExp(`(^|[^\\p{L}\\d])${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\p{L}\\d]|$)`, 'iu').test(hay);
    return hay.includes(kw);
  });
}

function localParts(tz) {
  const f = new Intl.DateTimeFormat('fr-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' });
  const p = Object.fromEntries(f.formatToParts(new Date()).map((x) => [x.type, x.value]));
  return { day: `${p.year}-${p.month}-${p.day}`, hour: +p.hour };
}

async function main() {
  await fs.mkdir(path.join(OUT, 'feeds'), { recursive: true });
  const cfg = readConfig();

  // État du passage précédent, publié sur le site
  let prev = null;
  if (SITE) {
    try {
      prev = await get(`${SITE}/feeds/state.json?t=${Date.now()}`, true);
    } catch {
      log('Pas d’état précédent (premier passage) : aucune notification de veille cette fois.');
    }
  }
  const seen = new Set(prev?.seen || []);

  const wanted = cfg?.sources?.length ? new Set(cfg.sources) : null;
  const all = [];
  for (const src of DEFAULT_SOURCES) {
    try {
      const items = await fetchSource(src);
      log(`${src.name} : ${items.length} articles`);
      if (!wanted || wanted.has(src.id)) all.push(...items);
    } catch (e) {
      log(`${src.name} : échec (${e.message})`);
    }
  }

  const fresh = prev ? all.filter((i) => !seen.has(i.id)) : [];
  log(`${fresh.length} nouveauté(s)`);
  const state = { updatedAt: new Date().toISOString(), lastReminder: prev?.lastReminder || '', seen: [] };

  if (cfg?.subscription) {
    webpush.setVapidDetails(SITE.startsWith('https:') ? SITE : 'https://github.com', cfg.vapidPublic, cfg.vapidPrivate);
    const send = async (payload) => {
      try {
        await webpush.sendNotification(cfg.subscription, JSON.stringify(payload), { TTL: 6 * 3600, urgency: 'normal' });
        log('Push envoyé :', payload.title || payload.type);
      } catch (e) {
        if (e.statusCode === 404 || e.statusCode === 410) console.warn('⚠️ Abonnement expiré : réactive les notifications dans l’appli et recopie le code.');
        else console.warn('⚠️ Échec du push :', e.statusCode || '', e.body || e.message);
      }
    };

    // Alertes de veille (mots-clés)
    const kws = cfg.keywords || [];
    const alerts = kws.length ? fresh.map((i) => ({ ...i, kw: matches(i, kws) })).filter((i) => i.kw.length) : [];
    if (alerts.length === 1) {
      const a = alerts[0];
      await send({ type: 'news', title: `🔔 ${a.kw.join(', ')} — ${a.source}`, body: a.title, url: a.url, tag: 'news-' + a.id.slice(-40) });
    } else if (alerts.length > 1) {
      await send({
        type: 'news',
        title: `🔔 ${alerts.length} actus pour tes alertes`,
        body: alerts.slice(0, 4).map((a) => `• ${a.title}`).join('\n'),
        hash: '#/veille?f=alerts',
        tag: 'news-digest',
      });
    }

    // Rappel de révision quotidien (le contenu est calculé sur le téléphone par le service worker)
    const { day, hour } = localParts(cfg.tz || 'Europe/Paris');
    const remindHour = Number.isFinite(cfg.remindHour) ? cfg.remindHour : 18;
    if (hour >= remindHour && state.lastReminder !== day) {
      await send({ type: 'reminder', tag: 'reminder' });
      state.lastReminder = day;
    }
  } else {
    log('Pas de secret PUSH_CONFIG : pas de notification push (les flux sont quand même publiés).');
  }

  state.seen = [...new Set([...all.map((i) => i.id), ...seen])].slice(0, MAX_SEEN);
  await fs.writeFile(path.join(OUT, 'feeds', 'state.json'), JSON.stringify(state));
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
