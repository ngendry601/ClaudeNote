// Création d'un cours + flashcards à partir de photos / PDF.
// Deux voies :
//  1. Automatique : appel direct à l'API Claude depuis le navigateur avec la clé de l'utilisateur
//     (stockée uniquement sur l'appareil). SDK officiel chargé à la demande depuis un CDN.
//  2. Gratuite : on copie les instructions, l'utilisateur les colle dans l'appli Claude avec ses photos,
//     puis colle la réponse ici.
import { state } from './store.js';
import { createCourse } from './library.js';

const SDK_URL = 'https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@1.4.0/+esm';
const MODEL = 'claude-opus-5-5';
export const MAX_CARDS = 5;

export const INSTRUCTIONS = `Tu aides un étudiant en BTS SIO option SLAM à réviser. À partir des documents fournis (photos ou PDF d'un cours), rédige une fiche de révision très synthétique, en Markdown, dans le format exact ci-dessous. Elle sert à la fois de cours lisible et de flashcards : chaque bloc ::: est une flashcard que l'étudiant récite.

Format :
# Titre court du cours

::: Grand thème 1
### Sous-partie
- **Notion** : explication courte
- **Notion** : explication courte
==l'idée essentielle à retenir==
!! Le piège ou la confusion classique à éviter
:::

Règles :
- Entre 3 et 5 blocs ::: au total, jamais plus. Regroupe le cours en grands thèmes.
- Dans chaque bloc : 2 à 5 sous-parties ###, et 2 à 6 puces par sous-partie.
- Chaque puce tient sur une ligne : « - **Notion** : explication », avec moins de 15 mots après les deux-points. L'appli pose une question de quiz par puce : la notion en gras est la question, l'explication est la réponse.
- Utilise ==…== pour 1 ou 2 idées essentielles par bloc, pas plus.
- Au plus une ligne « !! » par bloc, seulement s'il y a un vrai piège.
- Pour un cours de développement (programmation, SQL, POO, web…), une puce peut contenir un court \`code\` en ligne.
- Reste fidèle au document : n'ajoute pas de notions absentes du cours. Ignore une photo illisible.
- Rédige en français. Pas d'introduction, pas de conclusion, aucun texte en dehors du format.

Réponds uniquement avec le Markdown.`;

/* ---------- Préparation des fichiers ---------- */
const toB64 = (blob) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(',')[1]);
    r.onerror = () => rej(r.error);
    r.readAsDataURL(blob);
  });

/** Réduit une photo (les photos de téléphone font souvent 4000 px et plusieurs Mo) */
async function shrinkImage(file, maxSide = 1568) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close?.();
  return new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.85));
}

async function fileToBlock(file) {
  if (file.type === 'application/pdf') {
    if (file.size > 30 * 1024 * 1024) throw new Error(`${file.name} dépasse 30 Mo`);
    return { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: await toB64(file) } };
  }
  if (file.type.startsWith('image/')) {
    const img = await shrinkImage(file);
    return { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: await toB64(img) } };
  }
  throw new Error(`${file.name} : format non pris en charge (photo ou PDF)`);
}

/* ---------- Appel à Claude ---------- */
export async function generateFromFiles(files, { hint = '', onProgress } = {}) {
  const apiKey = state.settings.apiKey?.trim();
  if (!apiKey) throw new Error('Ajoute ta clé API dans Réglages → Génération par IA');
  const blocks = [];
  for (const f of files) blocks.push(await fileToBlock(f));

  const { default: Anthropic } = await import(SDK_URL);
  // La clé reste sur l'appareil de l'utilisateur : c'est son appli personnelle.
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  try {
    const stream = client.beta.messages.stream({
      model: MODEL,
      max_tokens: 32000,
      output_config: { effort: 'high' },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: INSTRUCTIONS,
      messages: [
        {
          role: 'user',
          content: [...blocks, { type: 'text', text: `Voici mon cours${hint ? ` (${hint})` : ''}. Crée la fiche.` }],
        },
      ],
    });
    let chars = 0;
    stream.on('text', (t) => {
      chars += t.length;
      onProgress?.(chars);
    });
    const msg = await stream.finalMessage();
    if (msg.stop_reason === 'refusal') throw new Error('Claude a refusé de traiter ces documents.');
    const text = msg.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('');
    if (msg.stop_reason === 'max_tokens') console.warn('Réponse tronquée (max_tokens)');
    return text;
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) throw new Error('Clé API invalide : vérifie-la dans les Réglages.');
    if (e instanceof Anthropic.PermissionDeniedError) throw new Error("Cette clé API n'a pas accès à ce modèle.");
    if (e instanceof Anthropic.RateLimitError) throw new Error('Trop de demandes : réessaie dans une minute.');
    if (e instanceof Anthropic.BadRequestError) throw new Error(`Requête refusée : ${e.message}`);
    if (e instanceof Anthropic.APIConnectionError) throw new Error('Pas de connexion à Claude : vérifie ta connexion internet.');
    if (e instanceof Anthropic.APIError) throw new Error(`Erreur Claude (${e.status}) : ${e.message}`);
    throw e;
  }
}

/* ---------- Import du Markdown produit ---------- */
export function cleanMarkdown(text) {
  return text
    .replace(/^\s*```(?:markdown|md)?\s*\n/i, '')
    .replace(/\n```\s*$/, '')
    .trim();
}

/** Crée le cours et ses flashcards. Retourne { course, cards } */
export function importCourseMarkdown(text, subjectId = null) {
  const content = cleanMarkdown(text);
  const title = (content.match(/^#\s+(.+)$/m) || [])[1]?.trim() || 'Nouveau cours';
  const course = createCourse({ title, subjectId, content: content + '\n' });
  const deck = state.decks.find((d) => d.courseId === course.id);
  return { course, cards: deck ? state.cards.filter((c) => c.deckId === deck.id).length : 0 };
}
