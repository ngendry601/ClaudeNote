# 📚 ClaudeNote

Une appli pour **stocker tous tes cours**, **réviser avec des flashcards** (répétition espacée) et suivre ta **veille techno** avec des notifications.

Web app installable (PWA), sans dépendance, qui fonctionne hors-ligne. Tes données restent **dans ton navigateur** (IndexedDB).

## 🚀 Lancer l'appli

```bash
node server.js
# puis ouvre http://localhost:8080
```

`server.js` (Node 18+, aucune dépendance) sert l'appli **et** relaie les flux RSS. Certains sites (Korben, CERT-FR…) bloquent les requêtes faites directement depuis un navigateur (CORS) ; le relais local règle le problème.

> Autre option : `python3 -m http.server 8080`. L'appli marche aussi, mais certains flux RSS passeront par des proxys publics, moins fiables.

**L'installer comme une appli** : dans Chrome/Edge, clique sur l'icône « Installer » dans la barre d'adresse. Sur mobile, utilise « Ajouter à l'écran d'accueil ».

## ✨ Fonctionnalités

### 📖 Cours
- Organisation par **matières** (avec couleurs)
- Éditeur **Markdown** avec aperçu en direct (côte à côte, écriture seule ou lecture seule) : titres, listes, tableaux, code, citations, surlignage `==texte==`, tâches `- [ ]`
- **Pièces jointes** (PDF, images, slides…) stockées en local
- Enregistrement automatique, export `.md`, raccourcis `Ctrl+S`, `Ctrl+B` et `Ctrl+I`

### ⚡ Flashcards
- **Génération automatique depuis tes cours** : écris directement dans tes notes
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
js/md.js            moteur Markdown sécurisé
js/news.js          récupération HN / DEV / RSS et alertes
js/timer.js         Pomodoro
js/views/*.js       écrans
sw.js               service worker (hors-ligne et clic sur les notifications)
server.js           serveur local et relais RSS
```

## ⚠️ À savoir
- Les notifications de veille arrivent **tant que l'appli est ouverte** (un onglet en arrière-plan suffit). Pour des notifications appli fermée, il faudrait un serveur de push (voir les idées ci-dessous).
- Les données sont liées au navigateur : **exporte régulièrement** (Réglages → Sauvegarde).

## 💡 Idées pour la suite
- Génération de flashcards et de quiz **par IA** à partir d'un cours ou d'un PDF
- Synchronisation entre appareils (compte et backend)
- Notifications push même appli fermée
- Import de PDF avec extraction du texte
- Cartes à trous (cloze), cartes avec images
- Statistiques détaillées par matière, prévision de la charge de révision
