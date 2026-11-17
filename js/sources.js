// Sources de veille (partagées avec scripts/veille.mjs, sans dépendance au navigateur).
// La veille est centrée sur 2 thèmes : 🛡️ failles / mises à jour de sécurité, et 🤖 IA.
//   topic 'secu' | 'ia' : source spécialisée, tous ses articles sont gardés
//   topic 'mix'         : source généraliste, seuls les articles sécu / IA sont gardés
//   alwaysNotify        : chaque nouvel article déclenche une notification (alertes critiques)
export const DEFAULT_SOURCES = [
  { id: 'certfr-alertes', name: 'CERT-FR — Alertes', type: 'rss', topic: 'secu', url: 'https://cert.cyber.gouv.fr/alerte/feed/', enabled: true, alwaysNotify: true, color: '#dc2626' },
  { id: 'certfr-avis', name: 'CERT-FR — Avis (failles & correctifs)', type: 'rss', topic: 'secu', url: 'https://cert.cyber.gouv.fr/avis/feed/', enabled: true, color: '#b91c1c' },
  { id: 'lmi-secu', name: 'Le Monde Informatique — Sécurité', type: 'rss', topic: 'secu', url: 'https://www.lemondeinformatique.fr/flux-rss/thematique/securite/rss.xml', enabled: true, color: '#16a34a' },
  { id: 'numerama-cyber', name: 'Numerama — Cyberguerre', type: 'rss', topic: 'secu', url: 'https://www.numerama.com/cyberguerre/feed/', enabled: true, color: '#9333ea' },
  { id: 'zataz', name: 'ZATAZ', type: 'rss', topic: 'secu', url: 'https://www.zataz.com/feed/', enabled: false, color: '#0f766e' },
  { id: 'bleeping', name: 'BleepingComputer (EN)', type: 'rss', topic: 'secu', url: 'https://www.bleepingcomputer.com/feed/', enabled: false, color: '#1d4ed8' },
  { id: 'thn', name: 'The Hacker News (EN)', type: 'rss', topic: 'secu', url: 'https://feeds.feedburner.com/TheHackersNews', enabled: false, color: '#334155' },
  { id: 'lmi-ia', name: 'Le Monde Informatique — IA', type: 'rss', topic: 'ia', url: 'https://www.lemondeinformatique.fr/flux-rss/thematique/intelligence-artificielle/rss.xml', enabled: true, color: '#15803d' },
  { id: 'actuia', name: 'ActuIA', type: 'rss', topic: 'ia', url: 'https://www.actuia.com/feed/', enabled: true, color: '#0369a1' },
  { id: 'bdm-ia', name: 'Blog du Modérateur — IA', type: 'rss', topic: 'ia', url: 'https://www.blogdumoderateur.com/tools/ia/feed/', enabled: true, color: '#c2410c' },
  { id: 'next', name: 'Next (filtré sécu / IA)', type: 'rss', topic: 'mix', url: 'https://next.ink/feed/', enabled: true, color: '#0ea5e9' },
  { id: 'korben', name: 'Korben (filtré sécu / IA)', type: 'rss', topic: 'mix', url: 'https://korben.info/feed', enabled: true, color: '#e11d48' },
  { id: 'hn', name: 'Hacker News (filtré sécu / IA)', type: 'hn', topic: 'mix', enabled: false, color: '#ff6600' },
];

export const TOPICS = {
  secu: { label: 'Failles & MAJ', emoji: '🛡️' },
  ia: { label: 'IA', emoji: '🤖' },
};

const SECU_RE =
  /(faille|vulnerabilit|\bcve\b|cve-\d|correctif|\bpatch|mises? a jour (de securite|critique|urgente)|zero.?day|\b0.?day|exploit|ransomware|rancongiciel|malware|logiciel malveillant|piratage|pirate|\bhack|cyberattaque|cyber-attaque|fuite de donnees|data breach|\bbreach|phishing|hameconnage|backdoor|porte derobee|botnet|\bddos|vulnerabilit|security (update|flaw|fix|patch)|cybersecurit|\banssi|cert-fr|spyware|logiciel espion|trojan|cheval de troie|infostealer|compromis|intrusion)/;
const IA_RE =
  /(\bia\b|intelligence artificielle|\bai\b|\bllms?\b|\bgpt|chatgpt|openai|anthropic|\bclaude\b|gemini|mistral ai|\bmistral\b|copilot|deepseek|\bllama|machine learning|apprentissage automatique|deep learning|reseaux? de neurones|neural|modeles? de langage|language models?|\bagents? (ia|ai)\b|\bai agents?|genai|ia generative|generative ai|hugging ?face)/;

const norm = (s = '') =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

/** Retourne les thèmes d'un article (['secu'], ['ia'], les deux, ou [] = hors sujet). */
export function classify(item, src) {
  const hay = norm(`${item.title || ''} ${item.summary || ''} ${(item.tags || []).join(' ')}`);
  const topics = [];
  if (src?.topic === 'secu' || SECU_RE.test(hay)) topics.push('secu');
  if (src?.topic === 'ia' || IA_RE.test(hay)) topics.push('ia');
  return topics;
}

export const DEFAULT_KEYWORDS = ['critique', 'zero-day', 'activement exploitée', 'Windows', 'Android', 'iPhone', 'Chrome', 'OpenAI', 'Claude', 'Mistral'];
