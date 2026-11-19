# ClaudeNote — contexte pour les assistants IA

> Fichier lu automatiquement par Claude Code (et pointé par `AGENTS.md` pour les autres IA).
> Il sert à reprendre le projet dans une nouvelle session sans tout réexpliquer.
> **Mets-le à jour** quand tu changes l'architecture, ajoutes un cours ou qu'une préférence de l'utilisateur évolue.

## Qui, quoi

- Utilisateur : étudiant en **BTS SIO option SLAM** (France). Il parle **français**, en langage oral, souvent dicté (fautes de reconnaissance vocale fréquentes : « O. WASP » = OWASP, « Flash carde » = flashcard…). Réponds en français, simplement, sans jargon inutile.
- Il utilise l'appli **sur son téléphone** (PWA installée depuis le navigateur) : https://ngendry601.github.io/ClaudeNote/
- ClaudeNote = appli personnelle de révision : cours, flashcards, quiz, veille techno.

## Ce que veut l'utilisateur (préférences fortes)

- **5 onglets, pas plus** : Accueil · Cours · Flashcards · Quiz · Veille. L'appli a été refaite de zéro parce qu'elle était « pas ergonomique, on s'y perd » → privilégier la simplicité.
- **Cours** = le cours **complet, non synthétisé**.
- **Flashcards** = **peu nombreuses** (~15-20 par gros cours, jamais 100+), **très synthétiques et lisibles** : une notion par carte, tableaux, schémas (`flux`, `arbre`, `matrice`), mots-clés surlignés `==…==`, encadrés pièges `> ⚠️`. Pas de pavés de texte.
- **Quiz** = de **qualité** (les premiers étaient « nuls ») : questions variées (6 types), mises en situation (`context`), **explication** systématique, distracteurs plausibles.
- **Veille** = uniquement **failles de sécurité / mises à jour** et **actu IA**, avec notifications push même appli fermée.
- Créer un cours **depuis des photos directement dans l'appli** (API Claude avec sa clé), ou gratuitement via l'appli Claude (copier-coller du JSON).
- Contenu CGE : références **récentes** (films, jeux vidéo, séries) + quelques livres/fables.

## Stack

- **JS vanilla, modules ES, aucune étape de build.** Pas de framework, pas de npm côté appli.
- Données dans **IndexedDB** (`js/db.js` : stores `kv` et `files`), état unique dans `js/store.js` (`STATE_VERSION = 3`, migration v1/v2 intégrée).
- Routeur par hash dans `js/app.js`. PWA : `manifest.webmanifest` + `sw.js`.
- Hébergement **GitHub Pages** via GitHub Actions (`.github/workflows/deploy.yml`) : publie à chaque push sur la branche par défaut **et toutes les 30 min** (cron), en lançant `scripts/veille.mjs` (cache des flux RSS + Web Push, secret `PUSH_CONFIG`).

## Carte des fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | coquille + script de secours « Réparer l'appli » si l'appli ne démarre pas en 6 s |
| `js/app.js` | navigation (5 onglets), routes, installation des cours prêts, enregistrement du SW |
| `js/store.js` | état, `createCourse`, `setCourseStudy`, `newCard`, `dueCards`, `subjects`, migration |
| `js/md.js` | rendu Markdown maison : tableaux, listes, `==surligné==`, encadrés, schémas `flux` / `arbre` / `matrice` |
| `js/srs.js` | répétition espacée (3 notes : À revoir / Bien / Facile) |
| `js/ai.js` | génération avec l'API Claude (photos → cours + flashcards + quiz), prompt `RULES`, schéma JSON, `normalizeStudy`, `parsePasted` |
| `js/packs.js` | liste `PACKS` des cours prêts à l'emploi + import qui conserve la progression |
| `js/views/*.js` | écrans : `home`, `courses`, `create` (modales d'ajout), `flashcards`, `quiz`, `news`, `settings` |
| `js/news.js`, `js/sources.js`, `js/push.js`, `js/notify.js` | veille RSS (filtres sécurité/IA) et notifications |
| `css/style.css` | tout le style (clair/sombre, mobile d'abord) |
| `sw.js` | hors-ligne (réseau d'abord en `no-cache`), push, clic notification |
| `server.js` | serveur local de test + proxy RSS `/proxy?url=` |
| `scripts/packs/*.py` | **sources** des cours prêts → génèrent `data/*.json` |

Routes : `#/`, `#/cours`, `#/cours/:id`, `#/cours/:id/modifier`, `#/flashcards`, `#/flashcards/:id`, `#/flashcards/:id/revoir` (`:id` peut valoir `tout`, `?libre=1`), `#/flashcards/:id/parcourir`, `#/quiz`, `#/quiz/:id` (`?n=tout`, `?mode=erreurs`), `#/veille`, `#/reglages`.

## Format d'un cours (JSON des packs et de l'IA)

```json
{
  "title": "…", "subject": "…",
  "course": "Markdown complet, titres ## et ###",
  "flashcards": [{ "front": "question courte", "back": "Markdown synthétique" }],
  "quiz": [ { "type": "qcm", "context": "", "q": "…", "choices": ["…"], "answer": 1, "explain": "…" } ]
}
```

Types de questions : `qcm` (`answer` = index), `multi` (`answers` = index[]), `vf` (`answer` booléen), `trou` (`q` contient `___`, `answers` = réponses acceptées, tolérance aux fautes), `ordre` (`items` dans le bon ordre), `assoc` (`pairs` de `{left, right}`). Toujours `context` (peut être vide) et `explain`.

Schémas dans le Markdown :
````
```flux
Étape A -> Étape B -> Étape C
```
```arbre
Racine
  Enfant
    Petit-enfant
```
```matrice
Case 1 | Case 2
Case 3 | Case 4
```
> ⚠️ piège   > 💡 exemple/astuce   > 📌 à retenir
````

## Cours prêts à l'emploi (packs)

| id | Source | Contenu |
|---|---|---|
| `cejm` (v4) | `scripts/packs/cejm.py` | CEJM complet, 22 flashcards, 40 questions |
| `cyber-slam` (v1) | `scripts/packs/cyber_slam.py` | Cybersécurité SLAM (OWASP, failles dans le code, auth, SSO, crypto, RGPD), 19 flashcards, 36 questions |
| `cge-vrai-faux` (v1) | `scripts/packs/cge_vrai_faux.py` | CGE « Le vrai du faux », ~20 références, 22 flashcards, 21 questions |

**Ajouter un cours prêt :**
1. Copier un script de `scripts/packs/` (modèle : `COURSE = r"""…"""`, `card(front, back)`, `add(type=…, …)`), puis `python3 scripts/packs/mon_cours.py` → `data/mon-cours.json`.
2. Ajouter une entrée dans `PACKS` (`js/packs.js`) : il s'installe tout seul chez l'utilisateur au prochain lancement (avec un toast).
3. Ajouter le JSON à la liste `SHELL` de `sw.js` **et incrémenter `CACHE`** (`claudenote-vNN`).

**Modifier un cours prêt :** éditer le `.py`, régénérer le JSON, **incrémenter `version`** dans `PACKS` → réimport automatique qui garde la progression des cartes dont le `front` n'a pas changé.

Le maths a été fourni en JSON dans le chat (collé par l'utilisateur via « Ajouter un cours → Coller »), il n'est pas dans le dépôt.

## Règles pour modifier le code

- **À chaque changement de fichier servi, incrémenter `CACHE` dans `sw.js`** (sinon le téléphone garde l'ancienne version). Ajouter tout nouveau fichier JS/JSON à `SHELL`.
- Ne jamais casser les données existantes : l'état est dans IndexedDB sur le téléphone. Si le modèle change, ajouter une migration dans `store.js`.
- Textes de l'interface **en français**, tutoiement.
- API Claude (dans `js/ai.js`) : SDK `@anthropic-ai/sdk` chargé depuis jsDelivr (version figée), streaming, sortie structurée par schéma JSON. Vérifier le skill `claude-api` avant de changer modèle/paramètres.
- Pas de build, pas de dépendances côté appli. `scripts/` a son propre `package.json` (uniquement pour le robot de veille en CI).

## Tester

```bash
PORT=8765 node server.js        # http://localhost:8765
# avec proxy d'entreprise : NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=… PORT=8765 node server.js
```

Tests manuels avec Playwright, profil `devices['iPhone 13']`, `serviceWorkers: 'block'`. Vérifier : l'appli démarre, les cartes s'affichent sans débordement, le quiz se joue jusqu'au bout sans erreur console (les erreurs CORS des flux RSS sont normales en local sans proxy). **Ne pas enregistrer de captures dans le dépôt.**

## Git / publication

- Le site publié = la **branche par défaut** du dépôt `ngendry601/ClaudeNote`. Un push dessus redéploie en ~1 min.
- Messages de commit en français.
- Si l'utilisateur dit que « ça n'a pas marché » après une mise à jour : souvent le cache du téléphone → fermer/rouvrir l'appli, sinon l’écran de secours « Réparer l’appli » apparaît si elle ne démarre pas. Les cours sont conservés.
