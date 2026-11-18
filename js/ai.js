// Claude crée, à partir de photos / PDF / texte :
//   1. le COURS complet (retranscription fidèle, non résumée),
//   2. des FLASHCARDS synthétiques et lisibles (tableaux, schémas),
//   3. un QUIZ de qualité (QCM, vrai/faux justifié, cas pratiques, association, remise en ordre, texte à trous).
// Deux voies : automatique (clé API Claude de l'utilisateur, stockée sur l'appareil) ou gratuite
// (instructions à coller dans l'appli Claude, réponse JSON à recoller ici).
import { state } from './store.js';

const SDK_URL = 'https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@1.4.0/+esm';
const MODEL = 'claude-opus-5-5';

/* ---------- Consignes ---------- */
const RULES = `Tu prépares le matériel de révision d'un étudiant en BTS SIO option SLAM (développement), en français.

1. COURS (champ "course") — retranscription FIDÈLE et COMPLÈTE des documents, sans résumer :
- Reprends tout le contenu, dans l'ordre, avec les exemples, définitions, formules et exercices.
- Structure en Markdown : "## " pour les grandes parties, "### " pour les sous-parties, listes, **gras** pour les termes définis.
- Reproduis les tableaux en tableaux Markdown, les formules en texte lisible (ex : (V1 − V0) / V0 × 100), le code dans des blocs \`\`\`.
- Corrige les fautes évidentes de lecture. Si un passage est illisible, écris [illisible].
- Ne mets pas le titre principal dans "course" (il va dans "title").

2. FLASHCARDS (champ "flashcards") — une carte = UNE notion, compréhensible en 20 secondes :
- "front" : une question claire ou le nom de la notion (max 12 mots). Ex : « Quelles sont les 3 conditions de validité d'un contrat ? »
- "back" : la réponse en Markdown, COURTE (40 à 90 mots), aérée, jamais un paragraphe compact.
  · Commence par la réponse essentielle en une ligne (avec ==surlignage== sur l'idée clé).
  · Utilise un TABLEAU Markdown dès qu'il y a une comparaison ou plusieurs éléments à caractériser.
  · Utilise un SCHÉMA quand c'est un processus, une classification ou une matrice :
    \`\`\`flux
    Étape 1 -> Étape 2 -> Étape 3
    \`\`\`
    \`\`\`arbre
    Notion
      Sous-notion A
      Sous-notion B
    \`\`\`
    \`\`\`matrice
    **Case 1** : … | **Case 2** : …
    **Case 3** : … | **Case 4** : …
    \`\`\`
  · Ajoute si utile un encadré piège : « > ⚠️ **Piège :** … » ou un exemple : « > 💡 **Exemple :** … ».
- Entre 8 et 16 cartes selon la longueur du cours. Couvre tout le cours, sans doublon.

3. QUIZ (champ "quiz") — entre 15 et 25 questions qui testent la COMPRÉHENSION, pas la récitation mot à mot :
- Varie les types : environ 50 % "qcm", 10 % "multi", 15 % "vf", et le reste en "assoc", "ordre", "trou".
- Pour les matières juridiques / économiques / de gestion : au moins 4 cas pratiques (champ "context" = une courte situation : « La société X… »).
- Pour les maths / l'algorithmique / le code : des questions de calcul ou de lecture de code avec un résultat précis.
- "qcm" : 4 choix plausibles du même domaine, une seule bonne réponse ("answer" = index de 0 à 3). Varie la position de la bonne réponse. Jamais « toutes les réponses » ni « aucune ».
- "multi" : 4 ou 5 choix, plusieurs bonnes réponses ("answers" = liste d'index).
- "vf" : une affirmation précise, souvent construite sur un piège classique ("answer" = true/false).
- "trou" : une phrase avec "___" ; "answers" = les réponses acceptées (variantes d'écriture), une réponse courte (1 à 3 mots).
- "ordre" : 3 à 6 éléments d'une démarche, donnés DANS LE BON ORDRE dans "items" (l'appli les mélange).
- "assoc" : 3 à 5 paires "left" / "right" à relier (notion ↔ définition, auteur ↔ idée…).
- "explain" : 1 à 2 phrases qui expliquent POURQUOI c'est la bonne réponse (et pourquoi le piège est faux).
- "context" vaut "" quand il n'y a pas de situation.

Reste fidèle aux documents : n'invente pas de notions absentes du cours.`;

const SHAPE = `Format exact :
{
  "title": "titre court du cours",
  "subject": "matière (ex : CEJM, Maths, Développement, Réseaux…)",
  "course": "cours complet en Markdown",
  "flashcards": [ { "front": "…", "back": "…" } ],
  "quiz": [
    { "type": "qcm", "context": "", "q": "…", "choices": ["…","…","…","…"], "answer": 2, "explain": "…" },
    { "type": "multi", "context": "", "q": "…", "choices": ["…","…","…","…"], "answers": [0,2], "explain": "…" },
    { "type": "vf", "context": "", "q": "affirmation…", "answer": false, "explain": "…" },
    { "type": "trou", "context": "", "q": "Le ___ est …", "answers": ["…"], "explain": "…" },
    { "type": "ordre", "context": "", "q": "Remets dans l'ordre…", "items": ["1er","2e","3e"], "explain": "…" },
    { "type": "assoc", "context": "", "q": "Associe…", "pairs": [ { "left": "…", "right": "…" } ], "explain": "…" }
  ]
}`;

/** Instructions à coller dans l'appli Claude (voie gratuite) */
export const APP_INSTRUCTIONS = `${RULES}

Réponds UNIQUEMENT avec un objet JSON valide (dans un bloc \`\`\`json), sans aucun texte avant ou après.
${SHAPE}

Voici mon cours (photos jointes) :`;

/* ---------- Schéma JSON (sortie structurée de l'API) ---------- */
const str = { type: 'string' };
const strs = { type: 'array', items: str };
const int = { type: 'integer' };
const obj = (properties) => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });
const qBase = (type, extra) => obj({ type: { type: 'string', enum: [type] }, context: str, q: str, ...extra, explain: str });

const SCHEMA = obj({
  title: str,
  subject: str,
  course: str,
  flashcards: { type: 'array', items: obj({ front: str, back: str }) },
  quiz: {
    type: 'array',
    items: {
      anyOf: [
        qBase('qcm', { choices: strs, answer: int }),
        qBase('multi', { choices: strs, answers: { type: 'array', items: int } }),
        qBase('vf', { answer: { type: 'boolean' } }),
        qBase('trou', { answers: strs }),
        qBase('ordre', { items: strs }),
        qBase('assoc', { pairs: { type: 'array', items: obj({ left: str, right: str }) } }),
      ],
    },
  },
});

/* ---------- Validation (réponse de l'API ou JSON collé) ---------- */
const s = (v) => (typeof v === 'string' ? v.trim() : '');
function cleanQuestion(q) {
  if (!q || typeof q !== 'object') return null;
  const base = { type: q.type, context: s(q.context), q: s(q.q), explain: s(q.explain) };
  if (!base.q) return null;
  const choices = Array.isArray(q.choices) ? q.choices.map(s).filter(Boolean) : [];
  switch (q.type) {
    case 'qcm':
      return choices.length >= 2 && Number.isInteger(q.answer) && q.answer >= 0 && q.answer < choices.length ? { ...base, choices, answer: q.answer } : null;
    case 'multi': {
      const answers = [...new Set((q.answers || []).filter((i) => Number.isInteger(i) && i >= 0 && i < choices.length))];
      return choices.length >= 3 && answers.length ? { ...base, choices, answers } : null;
    }
    case 'vf':
      return typeof q.answer === 'boolean' ? { ...base, answer: q.answer } : null;
    case 'trou': {
      const answers = (q.answers || []).map(s).filter(Boolean);
      return answers.length && base.q.includes('___') ? { ...base, answers } : null;
    }
    case 'ordre': {
      const items = (q.items || []).map(s).filter(Boolean);
      return items.length >= 3 ? { ...base, items } : null;
    }
    case 'assoc': {
      const pairs = (q.pairs || []).map((p) => ({ left: s(p?.left), right: s(p?.right) })).filter((p) => p.left && p.right);
      return pairs.length >= 2 ? { ...base, pairs } : null;
    }
    default:
      return null;
  }
}

export function normalizeStudy(raw) {
  return {
    title: s(raw?.title),
    subject: s(raw?.subject),
    course: s(raw?.course),
    flashcards: (raw?.flashcards || []).map((f) => ({ front: s(f?.front), back: s(f?.back) })).filter((f) => f.front && f.back),
    quiz: (raw?.quiz || []).map(cleanQuestion).filter(Boolean),
  };
}

/** Lit la réponse collée depuis l'appli Claude (JSON, éventuellement dans un bloc ```json) */
export function parsePasted(text) {
  const t = String(text);
  const a = t.indexOf('{');
  const b = t.lastIndexOf('}');
  if (a < 0 || b <= a) throw new Error("Je ne trouve pas de JSON : colle toute la réponse de Claude.");
  let data;
  try {
    data = JSON.parse(t.slice(a, b + 1));
  } catch {
    throw new Error('Réponse incomplète ou abîmée : recopie-la en entier (bouton « Copier » de Claude).');
  }
  const study = normalizeStudy(data);
  if (!study.flashcards.length && !study.quiz.length && !study.course) throw new Error('La réponse ne contient ni cours, ni flashcards, ni quiz.');
  return study;
}

/* ---------- Fichiers → blocs pour l'API ---------- */
const toB64 = (blob) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(',')[1]);
    r.onerror = () => rej(r.error);
    r.readAsDataURL(blob);
  });

async function shrinkImage(file, maxSide = 1800) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close?.();
  return new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.88));
}

async function fileToBlock(file) {
  if (file.type === 'application/pdf') {
    if (file.size > 30 * 1024 * 1024) throw new Error(`${file.name} dépasse 30 Mo`);
    return { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: await toB64(file) } };
  }
  if (file.type.startsWith('image/')) return { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: await toB64(await shrinkImage(file)) } };
  throw new Error(`${file.name} : format non pris en charge (photo ou PDF)`);
}

/* ---------- Appel à Claude ---------- */
/**
 * @param files   photos / PDF du cours (création d'un cours)
 * @param text    texte d'un cours existant (création des flashcards et du quiz seulement)
 */
export async function generateStudy({ files = [], text = '', hint = '', onProgress } = {}) {
  const apiKey = state.settings.apiKey?.trim();
  if (!apiKey) throw new Error('Ajoute ta clé API Claude dans les Réglages.');
  const blocks = [];
  for (const f of files) blocks.push(await fileToBlock(f));
  const ask = text
    ? `Voici le texte complet de mon cours${hint ? ` (${hint})` : ''}. Le cours existe déjà : laisse "course" vide ("") et crée seulement "title", "subject", "flashcards" et "quiz".\n\n${text}`
    : `Voici mon cours${hint ? ` (${hint})` : ''}. Crée le cours complet, les flashcards et le quiz.`;

  const { default: Anthropic } = await import(SDK_URL);
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true }); // clé personnelle, gardée sur l'appareil
  try {
    const stream = client.beta.messages.stream({
      model: MODEL,
      max_tokens: 64000,
      output_config: { effort: 'high', format: { type: 'json_schema', schema: SCHEMA } },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: RULES,
      messages: [{ role: 'user', content: [...blocks, { type: 'text', text: ask }] }],
    });
    let chars = 0;
    stream.on('text', (t) => onProgress?.((chars += t.length)));
    const msg = await stream.finalMessage();
    if (msg.stop_reason === 'refusal') throw new Error('Claude a refusé de traiter ces documents.');
    if (msg.stop_reason === 'max_tokens') throw new Error('Cours trop long pour une seule fois : envoie les photos en plusieurs cours.');
    const out = msg.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('');
    return normalizeStudy(JSON.parse(out));
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) throw new Error('Clé API invalide : vérifie-la dans les Réglages.');
    if (e instanceof Anthropic.PermissionDeniedError) throw new Error("Cette clé API n'a pas accès à ce modèle.");
    if (e instanceof Anthropic.RateLimitError) throw new Error('Trop de demandes : réessaie dans une minute.');
    if (e instanceof Anthropic.BadRequestError) throw new Error(`Requête refusée : ${e.message}`);
    if (e instanceof Anthropic.APIConnectionError) throw new Error('Pas de connexion à Claude : vérifie ta connexion internet.');
    if (e instanceof Anthropic.APIError) throw new Error(`Erreur Claude (${e.status}) : ${e.message}`);
    if (e instanceof SyntaxError) throw new Error('Réponse de Claude illisible : réessaie.');
    throw e;
  }
}
