# 📚 ClaudeNote

Une appli pour **stocker tous tes cours**, **réviser avec des flashcards** (répétition espacée) et suivre ta **veille techno** avec des notifications.

Web app installable (PWA), sans dépendance, qui fonctionne hors-ligne. Tes données restent **dans ton navigateur** (IndexedDB).

## 📱 L'installer sur ton téléphone

L'appli est publiée gratuitement sur **GitHub Pages** : https://ngendry601.github.io/ClaudeNote/

**À faire une seule fois (sur GitHub)** : *Settings → Pages → Build and deployment → Source : **GitHub Actions***, puis *Actions → « Publier l'appli + veille » → Re-run*.

Ensuite, sur le téléphone :
- **Android (Chrome)** : ouvre le lien → menu ⋮ → **Installer l'application**
- **iPhone (Safari, iOS 16.4+)** : ouvre le lien → bouton **Partager** → **Sur l'écran d'accueil**, puis ouvre l'appli depuis son icône

### 🔔 Notifications appli fermée
1. Dans l'appli installée : **Réglages → Notifications sur ton téléphone → Activer sur cet appareil**
2. **Copier le code**, puis sur GitHub : *Settings → Secrets and variables → Actions → New repository secret* → nom `PUSH_CONFIG`, valeur = le code
3. C'est tout. Toutes les ~30 min, la GitHub Action (`scripts/veille.mjs`) récupère la veille, t'envoie une notification quand une actu correspond à tes **mots-clés**, et t'envoie chaque jour un **rappel de révision** (« 📚 12 cartes à réviser ») à l'heure choisie.

> Si tu changes tes mots-clés, tes sources ou l'heure du rappel, recopie le code dans le secret.
> GitHub met en pause les tâches planifiées d'un dépôt sans activité pendant 60 jours : il suffit alors de les réactiver dans l'onglet Actions.

## 💻 Lancer l'appli sur ton ordinateur

## ✨ Fonctionnalités

### 📖 Cours
- Organisation par **matières** (avec couleurs)
- Éditeur **Markdown** avec aperçu en direct (côte à côte, écriture seule ou lecture seule) : titres, listes, tableaux, code, citations, surlignage `==texte==`, tâches `- [ ]`
- **Pièces jointes** (PDF, images, slides…) stockées en local
- Enregistrement automatique, export `.md`, raccourcis `Ctrl+S`, `Ctrl+B` et `Ctrl+I`

### ⚡ Flashcards = fiches de révision (3 à 5 par cours)
- Chaque flashcard est une **fiche à réciter**, comme une fiche papier : bandeau coloré, sous-parties en couleur, **notions en gras**, l'essentiel ==surligné==, encadré **⚠️ Piège**
- Recto : la liste des sous-parties à réciter · verso : la fiche complète · répétition espacée (À revoir / Difficile / Bien / Facile)
- **Paquet CEJM BTS SIO SLAM** : 5 fiches (méthodes, économie, droit, management, pièges et auteurs), installé au premier lancement
- Format d'une fiche dans un cours :
  ```
  ::: Droit
  ### Contrat
  - **Validité (1128)** : ==consentement, capacité, contenu licite et certain==
  - **Nullité** : défaut de formation → le contrat n'a jamais existé
  !! Nullité (formation) ≠ résolution (exécution)
  :::
  ```
- Les formats courts restent possibles (`question :: réponse`)

### 📸 Nouveau cours depuis des photos
Cours → **📸 Depuis mes photos** : Claude lit tes photos (ou un PDF) et crée le cours + 3 à 5 fiches dans ce format.
- **Automatique** : avec une clé API Claude (Réglages → Génération par IA). Payant à l'usage, quelques centimes par cours. La clé reste sur l'appareil.
- **Via l'appli Claude** (gratuit avec ton compte) : copie les instructions, colle-les dans Claude avec tes photos, puis colle la réponse dans l'appli.

### ❓ Quiz
- **Une question par notion en gras** de tes fiches (82 questions pour la CEJM)
- **QCM** (avec des réponses pièges tirées du même thème), **vrai / faux**, **réponse écrite** (tolère les fautes de frappe et les accents), ou un mélange des trois
- Par paquet, par thème (Droit, Économie…) ou sur **tes erreurs**
- Correction détaillée après chaque question, historique des scores
- Les questions ratées repassent automatiquement en révision

### 🛡️🤖 Veille sécurité & IA
- Centrée sur **les failles et mises à jour de sécurité** et sur **l'actu IA** ; tout le reste est filtré
- Sécurité : CERT-FR (alertes + avis de vulnérabilité), Le Monde Informatique Sécurité, Numerama Cyberguerre (+ ZATAZ, BleepingComputer, The Hacker News activables)
- IA : Le Monde Informatique IA, ActuIA, Blog du Modérateur IA
- Next et Korben gardés mais **filtrés** (seulement les articles sécu / IA)
- Onglets 🛡️ Failles & MAJ · 🤖 IA · 🔔 Alertes · ★ Favoris
- **Notification** pour chaque alerte CERT-FR et pour chaque actu contenant un de tes mots-clés (critique, zero-day, Windows, OpenAI…)

### 🎁 Fonctionnalités en plus
- **Tableau de bord** : cartes à réviser, série de jours, objectif quotidien, carte d'activité façon GitHub
- **Compte à rebours des examens** (J-12…)
- **Pomodoro** intégré, lié au cours que tu travailles, avec notification de fin
- **Recherche globale** (touche `/`) dans les cours, cartes et actus
- **Thème clair/sombre**, interface responsive (PC et mobile)
- **Sauvegarde/restauration** en JSON, pièces jointes incluses

## 🗂 Structure

```
index.html          page unique
css/style.css       styles (clair/sombre, responsive)
js/app.js           routeur et navigation
js/store.js         état et persistance (IndexedDB)
js/srs.js           répétition espacée et extraction de flashcards
js/cardview.js      rendu des cartes « fiche de révision »
js/packs.js         paquets prêts à l'emploi (data/cejm.md)
js/ai.js            création d'un cours depuis des photos (API Claude)
js/sources.js       sources de veille et filtre sécurité / IA
js/push.js          abonnement aux notifications push
js/md.js            moteur Markdown sécurisé
js/news.js          récupération HN / DEV / RSS et alertes
js/timer.js         Pomodoro
js/views/*.js       écrans
sw.js               service worker (hors-ligne et clic sur les notifications)
server.js           serveur local et relais RSS
scripts/veille.mjs  robot GitHub Actions : flux de veille et notifications push
.github/workflows/  publication sur GitHub Pages toutes les 30 min
```

## ⚠️ À savoir
- Sans le secret `PUSH_CONFIG`, les notifications de veille arrivent seulement **tant que l'appli est ouverte**.
- Les données sont liées au navigateur : **exporte régulièrement** (Réglages → Sauvegarde).

## 💡 Idées pour la suite
- Synchronisation entre appareils (compte et backend)
- Cartes à trous (cloze), cartes avec images
- Statistiques détaillées par matière, prévision de la charge de révision
