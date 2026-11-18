# 📚 ClaudeNote

Une appli pour **stocker tous tes cours**, **réviser avec des flashcards** (répétition espacée) et suivre ta **veille techno** avec des notifications.

Web app installable (PWA), sans dépendance, qui fonctionne hors-ligne. Tes données restent **dans ton navigateur** (IndexedDB).

## 🧭 Les 5 onglets

| Onglet | À quoi il sert |
|---|---|
| **Accueil** | Les flashcards à revoir aujourd'hui, un quiz conseillé, tes examens (J-n), les alertes de veille. ⚙️ = réglages |
| **Cours** | Le **cours complet**, tel quel (pas résumé) : sommaire, tableaux, photos d'origine. ➕ pour ajouter un cours |
| **Flashcards** | Le cours **synthétisé** : une notion par carte, avec tableaux et schémas. Révision espacée ou simple lecture |
| **Quiz** | QCM, cas pratiques, vrai/faux, association, remise en ordre, texte à trous, avec une explication après chaque réponse |
| **Veille** | Failles / mises à jour de sécurité et actu IA |

### Ajouter un cours
- **📸 Photos ou PDF** : Claude recopie le cours en entier, crée les flashcards et le quiz (clé API Claude, payant à l'usage).
- **💬 Via l'appli Claude** (gratuit) : copier les instructions, les coller dans Claude avec les photos, recoller la réponse.
- **✍️ Écrire ou coller le texte**, puis « ✨ Créer les flashcards et le quiz ».
- **📦 CEJM — BTS SIO** : cours complet, 22 flashcards et 40 questions, installé au premier lancement.

### Schémas dans les flashcards et les cours
````
```flux
Faits -> Problème de droit -> Règle -> Solution
```
```arbre
Validité du contrat
  Consentement
  Capacité
```
```matrice
**Forces** : interne + | **Faiblesses** : interne −
**Opportunités** : externe + | **Menaces** : externe −
```
> ⚠️ **Piège :** …   > 💡 **Exemple :** …   > 📌 À retenir
````

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

```bash
node server.js
# puis ouvre http://localhost:8080
```

`server.js` (Node 18+, aucune dépendance) sert l'appli et relaie les flux RSS de la veille.

## ✨ Détails

### 🛡️🤖 Veille sécurité & IA
- Centrée sur **les failles et mises à jour de sécurité** et sur **l'actu IA** ; tout le reste est filtré
- Sécurité : CERT-FR (alertes + avis de vulnérabilité), Le Monde Informatique Sécurité, Numerama Cyberguerre (+ ZATAZ, BleepingComputer, The Hacker News activables)
- IA : Le Monde Informatique IA, ActuIA, Blog du Modérateur IA
- Next et Korben gardés mais **filtrés** (seulement les articles sécu / IA)
- Onglets 🛡️ Failles & MAJ · 🤖 IA · 🔔 Alertes · ★ Favoris
- **Notification** pour chaque alerte CERT-FR et pour chaque actu contenant un de tes mots-clés (critique, zero-day, Windows, OpenAI…)

## 🗂 Structure

```
index.html, css/style.css      interface
js/store.js                    données (cours, flashcards, questions) et reprise des anciennes versions
js/md.js                       mise en forme : tableaux, schémas (flux, arbre, matrice), encadrés
js/ai.js                       Claude : cours complet + flashcards + quiz (sortie JSON structurée)
js/srs.js                      répétition espacée
js/packs.js, data/cejm.json    cours prêt à l'emploi (source : scripts/packs/cejm.py)
js/views/                      accueil, cours, flashcards, quiz, veille, réglages
js/news.js, js/sources.js      veille sécurité + IA
sw.js, manifest.webmanifest    appli installable, hors ligne, notifications
scripts/veille.mjs             robot GitHub Actions (flux + notifications push)
```

## ⚠️ À savoir
- Sans le secret `PUSH_CONFIG`, les notifications de veille arrivent seulement **tant que l'appli est ouverte**.
- Les données sont liées au navigateur : **exporte régulièrement** (Réglages → Sauvegarde).

## 💡 Idées pour la suite
- Synchronisation entre appareils (compte et backend)
- Cartes à trous (cloze), cartes avec images
- Statistiques détaillées par matière, prévision de la charge de révision
