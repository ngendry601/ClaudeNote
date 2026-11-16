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

### ⚡ Flashcards (style fiche de révision)
- Bandeau coloré par thème, **mots-clés en gras**, l'essentiel ==surligné==, encadré **⚠️ Piège**
- **Paquet CEJM BTS SIO prêt à l'emploi** (132 cartes : méthodes, économie, droit, management, auteurs, articles, pièges), installé au premier lancement
- **Carte riche** dans un cours :
  ```
  ::: Vices du consentement (art. 1130)
  - **Erreur** : sur les qualités essentielles, excusable
  - **Dol** (1137) : manœuvres, mensonge… déterminant
  - **Violence** : y compris ==abus de dépendance économique==
  !! Dol = nullité, pas résolution.
  :::
  ```
  La section (titre `##`) donne la couleur du bandeau.
- **Génération automatique depuis tes cours**, avec d'autres formats possibles
  ```
  Quelle couche gère le routage ? :: La couche 3 (Réseau)

  Q : Port HTTPS par défaut ?
  R : 443

  - **DNS** : traduit un nom de domaine en adresse IP
  ```
  puis clique sur **Générer les flashcards**. Les doublons sont détectés.
- **Répétition espacée** (algorithme de type SM-2, comme Anki) : À revoir, Difficile, Bien, Facile
- Raccourcis clavier pendant la révision : `Espace` pour retourner la carte, `1` à `4` pour noter
- Mode **entraînement libre**, qui ne modifie pas le planning
- Import en masse (copier-coller depuis Excel ou Anki : `question :: réponse`, tabulation ou `;`)

### ❓ Quiz
- **QCM** (avec des réponses pièges tirées du même thème), **vrai / faux**, **réponse écrite** (tolère les fautes de frappe et les accents), ou un mélange des trois
- Par paquet, par thème (Droit, Économie…) ou sur **tes erreurs**
- Correction détaillée après chaque question, historique des scores
- Les questions ratées repassent automatiquement en révision

### 🔔 Veille techno et notifications
- Sources par défaut : Hacker News, DEV, Korben, Next, CERT-FR (alertes de sécurité). Le Monde Informatique, Numerama, ZDNet et Lobsters sont désactivées par défaut et s'activent dans les Réglages.
- **Ajout de n'importe quel flux RSS ou Atom**
- **Mots-clés d'alerte** (ex. `CVE`, `Rust`, `ransomware`) : notification système quand une actu correspond
- Badge du nombre de non-lus, favoris, filtres, recherche
- Bouton 📝 pour envoyer un article dans ta note « Ma veille techno »
- Actualisation automatique (10 min à 6 h)

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
- Génération de flashcards et de quiz **par IA** à partir d'un cours ou d'un PDF
- Synchronisation entre appareils (compte et backend)
- Import de PDF avec extraction du texte
- Cartes à trous (cloze), cartes avec images
- Statistiques détaillées par matière, prévision de la charge de révision
