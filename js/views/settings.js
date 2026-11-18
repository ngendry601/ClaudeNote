import { state, save, flush, uid, replaceState, resetState, DEFAULT_SOURCES, DEFAULT_PROXIES } from '../store.js';
import { files } from '../db.js';
import { esc, icon, toast, confirmBox, formModal, download, fmtDate } from '../ui.js';
import { askPermission, notifPermission, notify } from '../notify.js';
import { startAutoRefresh } from '../news.js';
import { applyTheme } from '../theme.js';
import { manageSubjects } from './courses.js';
import { pushSupported, isStandalone, isIOS, subscribePush, unsubscribePush, configCode, REPO } from '../push.js';

const blobToB64 = (b) =>
  new Promise((res) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.readAsDataURL(b);
  });

function pushHtml() {
  const p = state.push;
  const secure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  let body;
  if (!pushSupported() || !secure) {
    body = isIOS() && !isStandalone()
      ? `<p>Sur iPhone, installe d'abord l'appli : dans <b>Safari</b>, bouton <b>Partager</b> → <b>Sur l'écran d'accueil</b>, puis ouvre ClaudeNote depuis l'icône et reviens ici (iOS 16.4 minimum).</p>`
      : `<p class="muted">Les notifications push ne sont pas disponibles ici${secure ? ' (navigateur non compatible)' : ' : ouvre l\'appli depuis son adresse https (GitHub Pages)'}.</p>`;
  } else if (!p.subscription) {
    body = `<p>Reçois tes <b>alertes de veille</b> et un <b>rappel de révision quotidien</b> même quand l'appli est fermée.</p>
      ${isIOS() && !isStandalone() ? `<p class="banner small">Sur iPhone, installe d'abord l'appli sur l'écran d'accueil (Partager → Sur l'écran d'accueil) et ouvre-la depuis l'icône.</p>` : ''}
      <button class="btn primary" data-act="push-on">${icon('bell', 16)} Activer sur cet appareil</button>`;
  } else {
    const code = configCode();
    body = `<p>✅ Cet appareil est abonné. Dernière étape (une seule fois) : donne ce code à GitHub pour que le robot puisse t'envoyer les notifications.</p>
      <ol class="steps">
        <li><button class="btn sm primary" data-act="push-copy">Copier le code</button></li>
        <li>Ouvre <a href="https://github.com/${REPO}/settings/secrets/actions/new" target="_blank" rel="noopener">les secrets du dépôt sur GitHub</a></li>
        <li>Nom : <code>PUSH_CONFIG</code> · Valeur : colle le code · <b>Add secret</b></li>
      </ol>
      <textarea readonly rows="3" data-code>${esc(code)}</textarea>
      <label class="field inline"><span>Rappel de révision chaque jour à</span><select data-remind>${Array.from({ length: 24 }, (_, h) => `<option value="${h}" ${+p.remindHour === h ? 'selected' : ''}>${h} h</option>`).join('')}</select></label>
      <p class="muted small">Si tu changes l'heure du rappel, tes mots-clés ou tes sources, recopie le code dans le secret (bouton « Update »). Le robot passe environ toutes les 30 min.</p>
      <div class="row-set"><button class="btn sm ghost" data-act="push-test">Tester une notification</button><button class="btn sm ghost danger-txt" data-act="push-off">Désactiver</button></div>`;
  }
  return `<section class="panel push-box"><h2>📱 Notifications sur ton téléphone (appli fermée)</h2>${body}</section>`;
}

export default function settingsView(el) {
  function draw() {
    const n = state.news;
    const perm = notifPermission();
    el.innerHTML = `
      <div class="page-head"><h1>Réglages</h1></div>
      <section class="panel"><h2>Outils</h2>
        <div class="choice-list">
          <a class="choice" href="#/pomodoro"><span>⏱️</span><div><b>Pomodoro</b><small>Minuteur 25 min de travail / 5 min de pause</small></div></a>
          <a class="choice" href="#/cours" data-subjects><span>🏷️</span><div><b>Matières</b><small>Créer, renommer, changer les couleurs</small></div></a>
        </div></section>

      <section class="panel"><h2>Apparence</h2>
        <div class="seg">${[['auto', 'Automatique'], ['light', 'Clair'], ['dark', 'Sombre']].map(([k, l]) => `<button class="${state.settings.theme === k ? 'on' : ''}" data-theme="${k}">${l}</button>`).join('')}</div>
        <label class="field inline"><span>Objectif quotidien (cartes)</span><input type="number" min="1" max="1000" data-goal value="${state.settings.dailyGoal}"></label>
      </section>

      <section class="panel"><h2>${icon('bell')} Notifications & veille</h2>
        <div class="row-set">
          <label class="check"><input type="checkbox" data-notify ${n.notify && perm === 'granted' ? 'checked' : ''} ${perm === 'unsupported' ? 'disabled' : ''}> Notifications activées</label>
          <span class="muted">Permission navigateur : <b>${{ granted: 'accordée', denied: 'refusée', default: 'non demandée', unsupported: 'non supportée' }[perm]}</b></span>
          ${perm === 'granted' ? `<button class="btn sm ghost" data-act="test">Tester</button>` : ''}
        </div>
        <label class="field inline"><span>Actualiser toutes les</span><select data-interval>${[10, 15, 30, 60, 120, 360].map((m) => `<option value="${m}" ${+n.interval === m ? 'selected' : ''}>${m < 60 ? m + ' min' : m / 60 + ' h'}</option>`).join('')}</select></label>
        <p class="muted small">Les notifications arrivent tant que l'appli est ouverte (un onglet suffit, même en arrière-plan). Si tu as des mots-clés, seules les actus qui y correspondent te notifient.</p>

        <h3>Sources</h3>
        <ul class="src-list">${n.sources
          .map(
            (s) => `<li><label class="check"><input type="checkbox" data-src="${s.id}" ${s.enabled ? 'checked' : ''}><span class="dot" style="background:${s.color}"></span>${esc(s.name)}</label>
            <small class="muted">${s.type === 'rss' ? esc(s.url) : s.type === 'hn' ? 'API Hacker News' : 'API DEV.to'}</small>
            ${s.custom ? `<button class="icon-btn" data-rmsrc="${s.id}" title="Supprimer">${icon('trash', 15)}</button>` : ''}</li>`,
          )
          .join('')}</ul>
        <div class="row-set"><button class="btn sm" data-act="addsrc">${icon('plus', 16)} Ajouter un flux RSS</button><button class="btn sm ghost" data-act="resetsrc">Sources par défaut</button></div>

        <h3>Proxys CORS de secours</h3>
        <p class="muted small">Utilisés quand un site refuse les requêtes depuis le navigateur. Un par ligne ; l'URL du flux est ajoutée à la fin.</p>
        <textarea data-proxies rows="3">${esc(n.proxies.join('\n'))}</textarea>
      </section>

      ${pushHtml()}

      <section class="panel"><h2>🤖 Génération par IA</h2>
        <p>Pour créer un cours et ses flashcards <b>automatiquement</b> depuis tes photos (Cours → 📸 Depuis mes photos), colle ici une clé API Claude.</p>
        <label class="field"><span>Clé API Claude</span><input type="password" data-apikey autocomplete="off" placeholder="sk-ant-…" value="${esc(state.settings.apiKey || '')}"></label>
        <p class="muted small">Crée-la sur <a href="https://platform.claude.com/" target="_blank" rel="noopener">platform.claude.com</a> (rubrique API Keys). C'est payant à l'usage, en général quelques centimes par cours. La clé reste uniquement sur cet appareil et n'est pas incluse dans les exports. Sans clé, l'option « Via l'appli Claude » reste gratuite avec ton compte Claude.</p>
      </section>

      <section class="panel"><h2>${icon('download')} Sauvegarde</h2>
        <p class="muted">Tes données sont stockées uniquement dans ce navigateur. Pense à exporter régulièrement (ou pour les transférer sur un autre appareil).</p>
        <div class="row-set">
          <button class="btn primary" data-act="export">${icon('download', 16)} Exporter (JSON)</button>
          <label class="btn">${icon('upload', 16)} Importer<input type="file" accept=".json,application/json" hidden data-import></label>
          <button class="btn ghost danger-txt" data-act="reset">${icon('trash', 16)} Tout effacer</button>
        </div>
        <p class="muted small">${state.courses.length} cours · ${state.decks.length} paquets · ${state.cards.length} cartes · ${state.news.items.length} actus en cache</p>
      </section>`;
  }
  draw();

  el.onclick = async (e) => {
    if (e.target.closest('[data-subjects]')) {
      e.preventDefault();
      return manageSubjects(draw);
    }
    const th = e.target.closest('[data-theme]');
    if (th) {
      state.settings.theme = th.dataset.theme;
      save();
      applyTheme();
      draw();
      return;
    }
    const rm = e.target.closest('[data-rmsrc]');
    if (rm) {
      state.news.sources = state.news.sources.filter((s) => s.id !== rm.dataset.rmsrc);
      save();
      draw();
      return;
    }
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'push-on') {
      try {
        await subscribePush();
        toast('Abonnement push activé ✅', 'success');
      } catch (err) {
        toast(`Impossible d'activer : ${err.message}`, 'error');
      }
      draw();
    }
    if (a === 'push-copy') {
      const code = configCode();
      try {
        await navigator.clipboard.writeText(code);
        toast('Code copié 📋', 'success');
      } catch {
        const ta = el.querySelector('[data-code]');
        ta.select();
        document.execCommand('copy');
        toast('Code sélectionné : copie-le');
      }
    }
    if (a === 'push-test') {
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification('🔔 ClaudeNote', { body: 'Les notifications fonctionnent sur cet appareil !', icon: 'icons/icon-192.png', data: { hash: '#/' } });
    }
    if (a === 'push-off' && (await confirmBox('Désactiver les notifications push sur cet appareil ?', { ok: 'Désactiver' }))) {
      await unsubscribePush().catch(() => {});
      draw();
    }
    if (a === 'test') notify('🔔 Test ClaudeNote', 'Les notifications fonctionnent !', '#/veille', 'test');
    if (a === 'addsrc') {
      const v = await formModal('Ajouter un flux RSS', [
        { name: 'name', label: 'Nom', required: true, placeholder: 'Ex : Le blog de Stack Overflow' },
        { name: 'url', label: 'URL du flux RSS / Atom', type: 'url', required: true, placeholder: 'https://exemple.com/feed' },
      ]);
      if (v?.url) {
        state.news.sources.push({ id: 'c' + uid(), name: v.name.trim(), type: 'rss', url: v.url.trim(), enabled: true, custom: true, color: '#64748b' });
        save();
        draw();
      }
    }
    if (a === 'resetsrc' && (await confirmBox('Restaurer les sources par défaut ?', { detail: 'Les flux personnalisés seront supprimés.' }))) {
      state.news.sources = DEFAULT_SOURCES.map((s) => ({ ...s }));
      state.news.proxies = [...DEFAULT_PROXIES];
      save();
      draw();
    }
    if (a === 'export') {
      const keys = await files.keys().catch(() => []);
      const fileData = [];
      for (const k of keys) {
        const b = await files.get(k);
        if (b) fileData.push({ id: k, data: await blobToB64(b) });
      }
      const payload = { app: 'ClaudeNote', exportedAt: Date.now(), state: { ...state, settings: { ...state.settings, apiKey: '' }, news: { ...state.news, items: state.news.items.filter((i) => i.saved) } }, files: fileData };
      download(`claudenote-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(payload), 'application/json');
      toast('Export téléchargé', 'success');
    }
    if (a === 'reset' && (await confirmBox('Effacer toutes les données ?', { danger: true, ok: 'Tout effacer', detail: 'Cours, flashcards, pièces jointes… Action irréversible. Exporte d\'abord si besoin.' }))) {
      resetState();
      await files.clear().catch(() => {});
      await flush();
      toast('Données effacées');
      location.hash = '#/';
    }
  };
  el.onchange = async (e) => {
    const t = e.target;
    if (t.matches('[data-remind]')) {
      state.push.remindHour = +t.value;
      save();
      draw();
      toast("Pense à recopier le code dans le secret GitHub");
    }
    if (t.matches('[data-apikey]')) {
      state.settings.apiKey = t.value.trim();
      save();
      toast(state.settings.apiKey ? 'Clé enregistrée sur cet appareil' : 'Clé supprimée');
    }
    if (t.matches('[data-goal]')) {
      state.settings.dailyGoal = Math.max(1, +t.value || 30);
      save();
    }
    if (t.matches('[data-interval]')) {
      state.news.interval = +t.value;
      save();
      startAutoRefresh();
    }
    if (t.matches('[data-src]')) {
      const s = state.news.sources.find((x) => x.id === t.dataset.src);
      s.enabled = t.checked;
      save();
    }
    if (t.matches('[data-proxies]')) {
      state.news.proxies = t.value.split('\n').map((x) => x.trim()).filter(Boolean);
      save();
      toast('Proxys enregistrés');
    }
    if (t.matches('[data-notify]')) {
      if (t.checked) {
        const p = await askPermission();
        state.news.notify = p === 'granted';
        if (p !== 'granted') toast('Permission refusée par le navigateur', 'error');
      } else state.news.notify = false;
      save();
      draw();
    }
    if (t.matches('[data-import]') && t.files[0]) {
      try {
        const data = JSON.parse(await t.files[0].text());
        if (!data.state) throw new Error('format');
        if (!(await confirmBox('Remplacer tes données actuelles par cette sauvegarde ?', { ok: 'Importer', detail: `Sauvegarde du ${fmtDate(data.exportedAt)}` }))) return;
        replaceState(data.state);
        await files.clear().catch(() => {});
        for (const f of data.files || []) {
          const blob = await (await fetch(f.data)).blob();
          await files.set(f.id, blob);
        }
        await flush();
        applyTheme();
        toast('Sauvegarde importée ✅', 'success');
        draw();
      } catch (err) {
        toast('Fichier de sauvegarde invalide', 'error');
      }
    }
  };
}
