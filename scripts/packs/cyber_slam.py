#!/usr/bin/env python3
# Source du cours prêt à l'emploi « Cybersécurité — BTS SIO SLAM » → data/cyber-slam.json
# Usage : python3 scripts/packs/cyber_slam.py
import json, os

TITLE = "Cybersécurité — BTS SIO SLAM"
SUBJECT = "Cybersécurité"

COURSE = r"""
## 0. L'épreuve

Épreuve écrite **« Cybersécurité des services informatiques »**, option SLAM : **4 heures, coefficient 4** (unité U6).

- Le sujet présente une **organisation** (contexte, application existante, extraits de code, schéma de base de données, documentation) et des **dossiers** de questions.
- Thèmes fréquents des sujets récents : **authentification**, **habilitations** (gestion des droits), **authentification unique (SSO)**, failles de l'**OWASP**, **RGPD**, **journalisation**, **tests**.
- Questions types : *repérer une vulnérabilité dans un extrait de code*, *proposer et écrire une correction*, *justifier un choix technique*, *compléter un test*, *identifier les obligations RGPD*.

> 📌 Toujours **justifier** : nommer la faille, expliquer le risque (ce que l'attaquant peut faire), puis donner la correction précise.

## 1. Les fondamentaux

### Les critères de sécurité (DICP)

| Critère | Question | Exemple d'atteinte |
|---|---|---|
| **Disponibilité** | Le service est-il accessible quand on en a besoin ? | attaque par déni de service, panne |
| **Intégrité** | Les données sont-elles exactes et non modifiées ? | modification d'une note en base |
| **Confidentialité** | Seules les personnes autorisées y accèdent-elles ? | fuite de la base clients |
| **Preuve** (traçabilité) | Peut-on savoir qui a fait quoi et quand ? | action impossible à attribuer |

### Menace, vulnérabilité, risque
- **Vulnérabilité** : faiblesse du système (ex. : une requête SQL construite par concaténation).
- **Menace** : ce qui peut exploiter cette faiblesse (ex. : un attaquant qui envoie une injection SQL).
- **Risque** = probabilité qu'une menace exploite une vulnérabilité × **impact** pour l'organisation.
- **Mesure de sécurité** : ce qui réduit la vulnérabilité, la probabilité ou l'impact.

### Principes de base
- **Moindre privilège** : chaque utilisateur, compte de service ou programme n'a que les droits strictement nécessaires.
- **Défense en profondeur** : plusieurs couches de protection (pare-feu, authentification, validation, journalisation…), pour qu'une seule défaillance ne suffise pas.
- **Sécurité dès la conception** (*security by design*) : la sécurité se pense dès l'analyse, pas à la fin.
- **Ne jamais faire confiance aux données du client** : tout ce qui vient du navigateur (formulaires, URL, cookies, en-têtes) peut être modifié.

## 2. L'OWASP Top 10

L'**OWASP** (Open Worldwide Application Security Project) publie la liste des 10 risques les plus critiques pour les applications web.

### Le classement 2021 (celui des annales)

| Rang | Risque | En clair | Parade principale |
|---|---|---|---|
| **A01** | Contrôle d'accès défaillant | accéder à des données ou fonctions non autorisées | vérifier les droits **côté serveur** à chaque requête |
| **A02** | Défaillances cryptographiques | données sensibles en clair, algorithmes faibles | HTTPS, hachage adapté, chiffrement des données sensibles |
| **A03** | Injection (SQL, commandes, XSS) | des données sont interprétées comme du code | requêtes préparées, échappement, validation |
| **A04** | Conception non sécurisée | faille dans la logique même de l'application | analyse de risques, sécurité dès la conception |
| **A05** | Mauvaise configuration de sécurité | mode debug, comptes par défaut, messages d'erreur détaillés | durcissement, configuration revue |
| **A06** | Composants vulnérables et obsolètes | bibliothèques non mises à jour | inventaire, mises à jour, audit des dépendances |
| **A07** | Défaillances d'identification et d'authentification | mots de passe faibles, force brute, sessions mal gérées | MFA, limitation des tentatives, gestion des sessions |
| **A08** | Manque d'intégrité des données et du logiciel | mises à jour ou données non vérifiées | signatures, vérification d'intégrité |
| **A09** | Carences de journalisation et de surveillance | attaques non détectées | journaliser les événements de sécurité, alertes |
| **A10** | Falsification de requête côté serveur (SSRF) | le serveur appelle une URL choisie par l'attaquant | liste blanche des destinations |

### Ce qui change dans la version 2025
- **A01 Contrôle d'accès défaillant** reste n°1 et **absorbe la SSRF**.
- La **mauvaise configuration** monte à la 2ᵉ place.
- Deux nouvelles catégories : **défaillances de la chaîne d'approvisionnement logicielle** (dépendances, outils de build) et **mauvaise gestion des conditions exceptionnelles** (erreurs qui révèlent des informations ou laissent passer).

> 📌 À l'examen, cite la catégorie OWASP **et** explique la faille concrète dans le code du sujet.

## 3. Les failles à savoir repérer dans le code

### Injection SQL
La requête est construite en **concaténant** une donnée saisie par l'utilisateur :

```php
$sql = "SELECT * FROM utilisateur WHERE login = '" . $_POST['login'] . "'";
$res = $pdo->query($sql);
```

Avec la saisie `' OR '1'='1' -- `, la condition devient toujours vraie : l'attaquant se connecte sans mot de passe, lit ou supprime des données.

**Correction : requête préparée** (la donnée n'est jamais interprétée comme du SQL) :

```php
$stmt = $pdo->prepare("SELECT * FROM utilisateur WHERE login = :login");
$stmt->execute(['login' => $_POST['login']]);
```

Équivalents : `PreparedStatement` en Java, paramètres (`SqlParameter`) en C#, ORM (Doctrine, Entity Framework…).

### Cross-Site Scripting (XSS)
Une donnée saisie est **réaffichée sans échappement** : l'attaquant injecte du JavaScript qui s'exécute chez les autres utilisateurs (vol de session, redirection, faux formulaire).

```php
echo "Bonjour " . $_GET['nom'];   // vulnérable
echo "Bonjour " . htmlspecialchars($_GET['nom'], ENT_QUOTES, 'UTF-8');   // corrigé
```

- **XSS stocké** : le script est enregistré en base (commentaire, profil) et touche tous les visiteurs.
- **XSS réfléchi** : le script est dans l'URL envoyée à la victime.
- Parades : **échapper toutes les sorties**, moteurs de templates qui échappent par défaut (Twig, Blade), en-tête **Content-Security-Policy**, cookies **HttpOnly**.

### Falsification de requête intersite (CSRF)
Un site piégé fait envoyer à la victime, **connectée**, une requête qu'elle n'a pas voulue (changer son e-mail, faire un virement), car son navigateur joint automatiquement son cookie de session.

**Parade : jeton anti-CSRF**, aléatoire, stocké en session et vérifié à chaque formulaire :

```php
$_SESSION['csrf'] = bin2hex(random_bytes(32));          // à l'affichage du formulaire
// <input type="hidden" name="csrf" value="...">
if (!hash_equals($_SESSION['csrf'], $_POST['csrf'] ?? '')) { http_response_code(403); exit; }
```

Compléments : cookies `SameSite`, ne jamais modifier de données avec une requête GET.

### Contrôle d'accès défaillant (IDOR)
L'application fait confiance à un identifiant transmis par le client : en remplaçant `facture.php?id=1042` par `id=1043`, un client voit la facture d'un autre.

**Parade :** vérifier **côté serveur**, à chaque requête, que l'utilisateur connecté a le droit d'accéder à cette ressource :

```php
if ($facture->getIdClient() !== $_SESSION['idClient']) { http_response_code(403); exit; }
```

> ⚠️ Masquer un bouton ou un lien dans l'interface **ne protège rien** : l'attaquant appelle directement l'URL.

### Mauvaise configuration et gestion des erreurs
- Mode debug actif en production, messages d'erreur affichant la requête SQL ou la pile d'appels.
- Comptes et mots de passe par défaut, répertoires listables, fichiers de configuration accessibles.
- Message de connexion trop précis : « mot de passe incorrect pour cet utilisateur » révèle que le login existe → afficher un **message générique** (« identifiant ou mot de passe incorrect »).

### Composants vulnérables
Les bibliothèques (Composer, npm, Maven, NuGet…) peuvent contenir des failles connues (référencées par un identifiant **CVE**).
**Parade :** inventaire des dépendances, mises à jour régulières, outils d'audit (`composer audit`, `npm audit`), suivi des alertes (CERT-FR).

## 4. Authentification et mots de passe

### Stocker un mot de passe
- On ne **chiffre** pas un mot de passe (le chiffrement est réversible) : on le **hache**.
- On ajoute un **sel** (valeur aléatoire propre à chaque utilisateur) pour que deux mots de passe identiques n'aient pas la même empreinte et pour contrer les tables précalculées (*rainbow tables*).
- On utilise un algorithme **lent et adapté** : **bcrypt** ou **Argon2**. MD5 et SHA-1 sont **à proscrire** (trop rapides, cassables).

```php
$hash = password_hash($motDePasse, PASSWORD_DEFAULT);   // bcrypt + sel automatique
if (password_verify($saisie, $hash)) { /* connexion acceptée */ }
```

### Politique de mots de passe
- Longueur minimale suffisante (la CNIL recommande par exemple **12 caractères** mélangeant majuscules, minuscules, chiffres et caractères spéciaux pour un mot de passe seul).
- Vérifier qu'il ne figure pas dans une liste de mots de passe compromis.
- Renouvellement en cas de compromission plutôt que changement forcé trop fréquent.

### Contrer la force brute
- **Limiter les tentatives** : délai croissant, blocage temporaire du compte, CAPTCHA.
- Journaliser les échecs et alerter en cas d'anomalie.

### Authentification forte (multifacteur, MFA)
Combiner au moins **deux facteurs de catégories différentes** :

| Facteur | Exemple |
|---|---|
| **Ce que je sais** | mot de passe, code PIN |
| **Ce que je possède** | téléphone (code, notification), clé de sécurité, carte à puce |
| **Ce que je suis** | empreinte digitale, reconnaissance faciale |

> ⚠️ Mot de passe + question secrète = **un seul facteur** (deux choses que je sais).

### Sessions et cookies
- **Régénérer l'identifiant de session** après la connexion (`session_regenerate_id(true)`) contre la fixation de session.
- Cookie de session : **HttpOnly** (inaccessible au JavaScript), **Secure** (envoyé seulement en HTTPS), **SameSite** (limite le CSRF).
- Expiration après inactivité, vraie déconnexion (destruction de la session côté serveur).

### Mot de passe oublié
Lien de réinitialisation **à usage unique**, **expirant** (quelques minutes), avec un jeton aléatoire ; ne jamais envoyer le mot de passe par e-mail.

## 5. Habilitations (gestion des droits)

- **Authentification** : *qui es-tu ?* (prouver son identité).
- **Autorisation / habilitation** : *as-tu le droit ?* (accès à une ressource ou une action).

### Contrôle d'accès basé sur les rôles (RBAC)
On attribue des **droits à des rôles**, puis des **rôles aux utilisateurs** : plus simple à gérer et à vérifier qu'utilisateur par utilisateur.

| Rôle | Consulter | Modifier | Supprimer | Administrer |
|---|---|---|---|---|
| Visiteur | ✅ | ❌ | ❌ | ❌ |
| Employé | ✅ | ✅ | ❌ | ❌ |
| Responsable | ✅ | ✅ | ✅ | ❌ |
| Administrateur | ✅ | ✅ | ✅ | ✅ |

- Appliquer le **moindre privilège** et la **séparation des tâches**.
- Vérifier les droits **côté serveur**, de façon centralisée (middleware, filtres, attributs comme `[Authorize(Roles = "Admin")]`).
- **Revue périodique des droits** et suppression des comptes des personnes parties.
- Le compte utilisé par l'application pour accéder à la base ne doit pas être administrateur du SGBD.

## 6. Authentification unique (SSO) et fédération d'identité

- **SSO** : l'utilisateur s'authentifie **une seule fois** auprès d'un **fournisseur d'identité (IdP)** et accède ensuite à plusieurs applications (**fournisseurs de services**).
- Avantages : un seul mot de passe à retenir (donc plus robuste), MFA centralisée, désactivation d'un compte en un point.
- Risque : l'IdP devient un **point unique de défaillance** et une cible prioritaire → le protéger fortement (MFA).

| Protocole | Rôle |
|---|---|
| **OAuth 2.0** | **autorisation** : donner à une application un accès limité à des ressources (jeton d'accès) |
| **OpenID Connect (OIDC)** | **authentification** construite sur OAuth 2.0 (jeton d'identité) |
| **SAML** | fédération d'identité par échange de messages XML signés (fréquent en entreprise) |

### Le jeton JWT
Format `en-tête.charge_utile.signature`, encodé en **Base64URL**.
- La **signature** garantit que le jeton n'a pas été **modifié**.
- Le contenu est **lisible** par tous (encodé, pas chiffré) → ne jamais y mettre de donnée sensible.
- Vérifier la signature, l'algorithme attendu et la **date d'expiration** côté serveur.

## 7. Cryptographie

| Technique | Principe | Assure | Exemples |
|---|---|---|---|
| **Chiffrement symétrique** | une **même clé** pour chiffrer et déchiffrer | confidentialité | AES |
| **Chiffrement asymétrique** | une **clé publique** pour chiffrer, la **clé privée** pour déchiffrer | confidentialité, échange de clé | RSA |
| **Hachage** | empreinte **irréversible** de taille fixe | intégrité | SHA-256 ; bcrypt / Argon2 pour les mots de passe |
| **Signature numérique** | empreinte chiffrée avec la **clé privée** de l'émetteur, vérifiée avec sa clé publique | intégrité, authenticité, non-répudiation | certificats, JWT |

- Pour envoyer un message **confidentiel** à Bob : on chiffre avec la **clé publique de Bob** (lui seul a la clé privée).
- Pour **signer** : l'émetteur utilise **sa propre clé privée**.
- **Certificat** : document signé par une **autorité de certification** qui associe une clé publique à une identité (site web, organisation).
- **HTTPS (TLS)** : chiffre les échanges et authentifie le serveur ; combine asymétrique (établir la clé) et symétrique (chiffrer les données).

## 8. Journalisation et traçabilité

- **À journaliser** : connexions réussies et échouées, déconnexions, modifications de droits, actions sensibles (suppression, export), erreurs de sécurité.
- **Chaque ligne** : date et heure, utilisateur, adresse IP, action, ressource, résultat.
- **Ne jamais journaliser** : mots de passe, numéros de carte, données sensibles en clair.
- Protéger les journaux (accès restreint, intégrité), les **centraliser** et définir une **durée de conservation** (la CNIL recommande en général de 6 mois à 1 an).
- La journalisation sert à **détecter** une attaque, à **comprendre** un incident et à **prouver** qui a fait quoi (le « P » de DICP).

## 9. Développement sécurisé et tests

- **Valider toutes les entrées** côté serveur : type, longueur, format, de préférence par **liste blanche** (valeurs autorisées).
- **Échapper toutes les sorties** selon le contexte (HTML, SQL, URL).
- **Gérer les erreurs** sans révéler d'informations techniques à l'utilisateur ; les détails vont dans les journaux.
- **Secrets hors du code** : mots de passe de base, clés d'API dans des variables d'environnement ou un coffre, jamais dans le dépôt Git.
- **Téléversement de fichiers** : vérifier le type réel et la taille, renommer, stocker hors de la racine web.
- **Tests de sécurité** : tests unitaires vérifiant qu'un accès non autorisé est refusé (code 403), qu'une injection échoue ; revue de code ; analyse statique ; tests d'intrusion.

## 10. Le RGPD côté développeur

- **Donnée personnelle** : toute information qui identifie une personne directement ou indirectement (nom, e-mail, IP, identifiant…). **Donnée sensible** : santé, opinions, religion, appartenance syndicale, biométrie… → interdite sauf exceptions.
- **Principes** : licéité, **finalité** déterminée, **minimisation** (seulement les données nécessaires), exactitude, **durée de conservation** limitée, **sécurité**, responsabilité (*accountability*).
- **Protection des données dès la conception et par défaut** (art. 25) : prévoir la protection dès la conception et, par défaut, ne traiter que le strict nécessaire (champs facultatifs, paramètres les plus protecteurs).
- **Droits des personnes** à rendre possibles dans l'application : accès, rectification, effacement, opposition, **portabilité**, limitation.
- **Consentement** : libre, éclairé, spécifique, et aussi simple à retirer qu'à donner. **Cookies** : consentement obligatoire sauf cookies strictement nécessaires (session, panier).
- **Pseudonymisation** (on peut encore réidentifier : donnée toujours personnelle) ≠ **anonymisation** (réidentification impossible : hors RGPD).
- **Obligations** : **registre des traitements**, **DPO** dans certains cas, **analyse d'impact (AIPD)** si le traitement présente un risque élevé, contrat avec les sous-traitants.
- **Violation de données** : notification à la **CNIL sous 72 heures**, information des personnes si le risque est élevé, inscription au registre des violations.
- **Sanctions** : jusqu'à **20 M€ ou 4 % du chiffre d'affaires mondial**.

## 11. Cadre légal et organisation

- **Code pénal, art. 323-1 et suivants** : l'accès ou le maintien frauduleux dans un système de traitement automatisé de données (**STAD**), ainsi que l'entrave ou la modification des données, sont des délits.
- **Acteurs** : **CNIL** (données personnelles), **ANSSI** (sécurité des systèmes d'information), **CERT-FR** (alertes et avis de vulnérabilité).
- **Charte informatique** : règles d'usage des outils numériques signées par les utilisateurs. **PSSI** : politique de sécurité de l'organisation.
- **Sauvegardes** : règle **3-2-1** (3 copies, sur 2 supports différents, dont 1 hors site), à tester régulièrement.
- **Sensibilisation** des utilisateurs (hameçonnage, mots de passe) : l'humain reste la première porte d'entrée.
"""

F = []
def card(front, back):
    F.append({"front": front, "back": back.strip()})

card("Quels sont les 4 critères de sécurité (DICP) ?", r"""
| Critère | Question |
|---|---|
| **Disponibilité** | le service est-il accessible ? |
| **Intégrité** | les données sont-elles exactes, non modifiées ? |
| **Confidentialité** | seuls les autorisés y accèdent-ils ? |
| **Preuve** | sait-on qui a fait quoi, et quand ? |

> 💡 **Exemple :** une fuite de la base clients = atteinte à la ==confidentialité==.
""")

card("Menace, vulnérabilité, risque : quelle différence ?", r"""
```flux
Menace (attaquant) -> exploite une Vulnérabilité (faille) -> Risque (impact)
```

| Notion | Exemple |
|---|---|
| **Vulnérabilité** | requête SQL concaténée |
| **Menace** | attaquant qui tente une injection |
| **Risque** | ==probabilité × impact== (vol de la base) |

> 📌 Principes : **moindre privilège**, **défense en profondeur**, ne jamais faire confiance au client.
""")

card("Quel est le classement OWASP Top 10 (2021) ?", r"""
| | Risque |
|---|---|
| A01 | ==Contrôle d'accès défaillant== |
| A02 | Défaillances cryptographiques |
| A03 | Injection (SQL, XSS…) |
| A04 | Conception non sécurisée |
| A05 | Mauvaise configuration |
| A06 | Composants vulnérables |
| A07 | Défaillances d'authentification |
| A08 | Intégrité des données et du logiciel |
| A09 | Journalisation et surveillance |
| A10 | SSRF |

> 💡 **2025 :** A01 reste n°1 (absorbe la SSRF) ; nouveautés : chaîne d'approvisionnement, gestion des erreurs.
""")

card("Injection SQL : comment la repérer et la corriger ?", r"""
==Une donnée saisie est concaténée dans la requête.==

```php
// ❌ vulnérable
"... WHERE login = '" . $_POST['login'] . "'"
// ✅ requête préparée
$stmt = $pdo->prepare("... WHERE login = :login");
$stmt->execute(['login' => $_POST['login']]);
```

> ⚠️ **Attaque :** `' OR '1'='1' -- ` rend la condition toujours vraie.
""")

card("Faille XSS : comment la repérer et la corriger ?", r"""
==Une donnée saisie est réaffichée sans échappement== → du JavaScript s'exécute chez les autres utilisateurs.

```php
echo htmlspecialchars($_GET['nom'], ENT_QUOTES, 'UTF-8');
```

| Type | Où est le script ? |
|---|---|
| **Stocké** | en base (commentaire, profil) |
| **Réfléchi** | dans l'URL envoyée à la victime |

**Aussi :** templates qui échappent (Twig), en-tête CSP, cookie HttpOnly.
""")

card("Faille CSRF : de quoi s'agit-il et comment s'en protéger ?", r"""
==Un site piégé fait envoyer à la victime connectée une requête qu'elle n'a pas voulue==, avec son cookie de session.

```flux
Formulaire -> Jeton aléatoire en session -> Vérifié à l'envoi -> Sinon 403
```

**Aussi :** cookie `SameSite`, jamais de modification de données en GET.
""")

card("Contrôle d'accès défaillant (IDOR) : comment le corriger ?", r"""
==L'application fait confiance à un identifiant envoyé par le client.==

> 💡 **Exemple :** `facture.php?id=1042` → `id=1043` affiche la facture d'un autre client.

```php
if ($facture->getIdClient() !== $_SESSION['idClient']) {
  http_response_code(403); exit;
}
```

> ⚠️ **Piège :** masquer un bouton ne protège rien : vérifier **côté serveur**.
""")

card("Comment stocker un mot de passe ?", r"""
==On le hache avec un sel, on ne le chiffre pas.==

| ✅ | ❌ |
|---|---|
| bcrypt, Argon2 (lents) | MD5, SHA-1 (trop rapides) |
| sel unique par utilisateur | même empreinte pour tous |
| `password_hash` / `password_verify` | chiffrement réversible (AES) |

> 📌 Le **sel** empêche les tables précalculées (rainbow tables).
""")

card("Qu'est-ce que l'authentification forte (MFA) ?", r"""
==Au moins 2 facteurs de catégories différentes.==

| Facteur | Exemple |
|---|---|
| **Je sais** | mot de passe, PIN |
| **Je possède** | téléphone, clé de sécurité |
| **Je suis** | empreinte, visage |

> ⚠️ **Piège :** mot de passe + question secrète = 1 seul facteur.

**Contre la force brute :** limiter les tentatives (délai, blocage temporaire, CAPTCHA).
""")

card("Comment sécuriser les sessions et les cookies ?", r"""
| Mesure | Contre |
|---|---|
| `session_regenerate_id(true)` après connexion | fixation de session |
| Cookie **HttpOnly** | vol par XSS |
| Cookie **Secure** | interception (HTTPS seulement) |
| Cookie **SameSite** | CSRF |
| Expiration + vraie déconnexion | session volée réutilisée |

> 💡 **Mot de passe oublié :** lien à usage unique et ==qui expire==.
""")

card("Authentification ou autorisation ? Et le RBAC ?", r"""
| | Question |
|---|---|
| **Authentification** | ==qui es-tu ?== |
| **Autorisation** | ==as-tu le droit ?== |

```arbre
RBAC
  Droits attribués à des rôles
  Rôles attribués aux utilisateurs
  Moindre privilège + revue des droits
```

> ⚠️ Le compte de l'application sur la base ne doit pas être administrateur.
""")

card("SSO, OAuth 2.0, OpenID Connect : à quoi servent-ils ?", r"""
**SSO** : ==une seule authentification== auprès d'un fournisseur d'identité, accès à plusieurs applications.

| Protocole | Rôle |
|---|---|
| **OAuth 2.0** | **autorisation** (jeton d'accès) |
| **OpenID Connect** | **authentification** (sur OAuth 2.0) |
| **SAML** | fédération d'identité (XML signé) |

> ⚠️ Le fournisseur d'identité devient un **point unique de défaillance** : le protéger (MFA).
""")

card("Qu'est-ce qu'un jeton JWT ?", r"""
```flux
En-tête -> Charge utile -> Signature
```

- Encodé en **Base64URL** : ==lisible par tous, pas chiffré==
- La **signature** prouve qu'il n'a pas été modifié
- Vérifier côté serveur : signature, algorithme, **expiration**

> ⚠️ **Piège :** ne jamais mettre de donnée sensible dans un JWT.
""")

card("Chiffrement, hachage, signature : quelles différences ?", r"""
| Technique | Clé | Assure |
|---|---|---|
| **Symétrique** (AES) | une même clé | confidentialité |
| **Asymétrique** (RSA) | publique / privée | confidentialité |
| **Hachage** (SHA-256) | aucune, irréversible | intégrité |
| **Signature** | privée de l'émetteur | intégrité + authenticité |

> 📌 Message secret pour Bob : ==clé publique de Bob==. Signer : ==ma clé privée==.
""")

card("Que faut-il journaliser (et ne jamais journaliser) ?", r"""
| ✅ À journaliser | ❌ Jamais |
|---|---|
| connexions réussies / échouées | mots de passe |
| changements de droits | numéros de carte |
| actions sensibles (suppression, export) | données sensibles en clair |

**Chaque ligne :** date-heure, utilisateur, IP, action, résultat.

> 📌 Conservation : en général ==6 mois à 1 an== (CNIL). Les journaux servent à détecter, comprendre, **prouver**.
""")

card("Quelles bonnes pratiques de développement sécurisé ?", r"""
| Pratique | Comment |
|---|---|
| **Entrées** | valider côté serveur (liste blanche) |
| **Sorties** | échapper selon le contexte |
| **Erreurs** | message générique, détails dans les logs |
| **Secrets** | hors du code (variables d'environnement) |
| **Dépendances** | à jour, `composer audit`, `npm audit` |
| **Tests** | vérifier qu'un accès interdit renvoie ==403== |

> ⚠️ « Mot de passe incorrect pour cet utilisateur » révèle que le login existe.
""")

card("RGPD : que doit faire le développeur ?", r"""
==Protection dès la conception et par défaut (art. 25).==

| Principe | Dans l'application |
|---|---|
| **Finalité** | une raison précise à chaque donnée |
| **Minimisation** | seulement les champs nécessaires |
| **Conservation** | purge automatique après la durée prévue |
| **Droits** | accès, rectification, effacement, portabilité |
| **Sécurité** | hachage, HTTPS, droits limités |

> 💡 **Cookies :** consentement obligatoire, sauf cookies strictement nécessaires (session, panier).
""")

card("RGPD : quelles obligations et quelles sanctions ?", r"""
| Obligation | Quand |
|---|---|
| **Registre des traitements** | toujours |
| **AIPD** (analyse d'impact) | traitement à **risque élevé** |
| **Notifier la CNIL** | violation de données, ==sous 72 h== |
| **Informer les personnes** | si le risque pour elles est élevé |

**Sanction :** jusqu'à **20 M€ ou 4 % du CA mondial**.

> ⚠️ **Piège :** pseudonymisé = toujours personnel ; seul l'**anonymisé** sort du RGPD.
""")

card("Cadre légal et acteurs de la cybersécurité", r"""
| Acteur / texte | Rôle |
|---|---|
| **Art. 323-1 C. pén.** | accès frauduleux à un **STAD** = délit |
| **CNIL** | protection des données personnelles |
| **ANSSI** | sécurité des systèmes d'information |
| **CERT-FR** | alertes et avis de vulnérabilité |
| **Charte informatique / PSSI** | règles internes de l'organisation |

> 📌 Sauvegardes : règle ==3-2-1== (3 copies, 2 supports, 1 hors site).
""")

Q = []
def add(**q):
    q.setdefault("context", "")
    Q.append(q)

# --- Lecture de code ---
add(type="qcm", context="Code PHP : `$sql = \"SELECT * FROM utilisateur WHERE login = '\" . $_POST['login'] . \"'\";`",
    q="Quelle vulnérabilité présente cette ligne ?",
    choices=["Une faille XSS", "Une injection SQL", "Une faille CSRF", "Une SSRF"], answer=1,
    explain="La saisie est concaténée dans la requête : avec ' OR '1'='1' -- la condition devient toujours vraie. C'est une injection SQL (A03 de l'OWASP 2021).")
add(type="qcm", q="Quelle est la meilleure correction d'une injection SQL ?",
    choices=["Supprimer les apostrophes de la saisie", "Utiliser une requête préparée avec des paramètres", "Masquer les messages d'erreur", "Passer le site en HTTPS"], answer=1,
    explain="La requête préparée sépare le code SQL des données : la saisie n'est jamais interprétée comme du SQL. Filtrer les caractères est contournable.")
add(type="qcm", context="Code PHP : `echo \"Bonjour \" . $_GET['nom'];`",
    q="Quelle faille et quelle correction ?",
    choices=["Injection SQL → requête préparée", "XSS → htmlspecialchars() sur la sortie", "CSRF → jeton anti-CSRF", "IDOR → contrôle des droits"], answer=1,
    explain="La donnée est réaffichée sans échappement : on peut injecter du JavaScript. htmlspecialchars() transforme < et > en texte inoffensif.")
add(type="qcm", context="Un client remplace `facture.php?id=1042` par `facture.php?id=1043` et voit la facture d'un autre client.",
    q="Quelle catégorie OWASP est en cause ?",
    choices=["A01 — Contrôle d'accès défaillant", "A02 — Défaillances cryptographiques", "A03 — Injection", "A06 — Composants vulnérables"], answer=0,
    explain="Le serveur ne vérifie pas que la facture appartient au client connecté (IDOR). Il faut contrôler les droits côté serveur à chaque requête.")
add(type="qcm", context="Code PHP : `if (md5($saisie) == $utilisateur['mdp']) { ... }`",
    q="Quel est le problème principal ?",
    choices=["md5 est trop lent", "md5 est un algorithme trop rapide et cassable pour les mots de passe", "Il faudrait chiffrer le mot de passe avec AES", "Il manque une requête préparée"], answer=1,
    explain="MD5 est trop rapide et sans sel : les empreintes se cassent facilement. Il faut password_hash() (bcrypt / Argon2) et password_verify().")
add(type="trou", q="En PHP, pour stocker un mot de passe, on utilise la fonction ___ (puis password_verify pour le vérifier).",
    answers=["password_hash", "password_hash()"],
    explain="password_hash() utilise un algorithme lent (bcrypt par défaut) et ajoute automatiquement un sel.")
add(type="qcm", q="Que faut-il appeler juste après une connexion réussie pour éviter la fixation de session ?",
    choices=["session_destroy()", "session_regenerate_id(true)", "setcookie()", "header('Location: …')"], answer=1,
    explain="On change l'identifiant de session à la connexion : un identifiant imposé ou volé avant la connexion devient inutile.")
add(type="vf", q="Masquer le bouton « Supprimer » aux utilisateurs non administrateurs suffit à protéger cette action.", answer=False,
   explain="Faux : l'attaquant peut appeler directement l'URL ou l'API. Les droits doivent être vérifiés côté serveur.")

# --- Authentification ---
add(type="vf", q="La bonne pratique consiste à chiffrer les mots de passe avec AES avant de les stocker.", answer=False,
   explain="Faux : le chiffrement est réversible (avec la clé, on retrouve tous les mots de passe). On hache avec un sel et un algorithme lent (bcrypt, Argon2).")
add(type="trou", q="La valeur aléatoire propre à chaque utilisateur, ajoutée avant de hacher son mot de passe, s'appelle le ___.",
    answers=["sel", "salage", "salt"],
    explain="Le sel donne des empreintes différentes à deux mots de passe identiques et rend inutiles les tables précalculées.")
add(type="multi", q="Lesquelles sont de vraies authentifications à deux facteurs ?",
    choices=["Mot de passe + code reçu sur le téléphone", "Mot de passe + question secrète", "Empreinte digitale + carte à puce", "Deux mots de passe différents", "Code PIN + clé de sécurité USB"], answers=[0, 2, 4],
    explain="Il faut deux catégories différentes (je sais / je possède / je suis). Mot de passe + question secrète, ou deux mots de passe, restent un seul facteur.")
add(type="qcm", context="Les journaux montrent 5 000 tentatives de connexion par minute sur le compte « admin ».",
    q="Quelle mesure est la plus adaptée ?",
    choices=["Afficher « mot de passe incorrect pour admin »", "Limiter les tentatives (délai croissant, blocage temporaire, CAPTCHA)", "Supprimer la journalisation", "Envoyer le mot de passe par e-mail"], answer=1,
    explain="C'est une attaque par force brute : limiter les tentatives la rend inefficace. La MFA renforce encore la protection.")
add(type="qcm", q="Pourquoi afficher « identifiant ou mot de passe incorrect » plutôt que « mot de passe incorrect pour cet utilisateur » ?",
    choices=["C'est plus court", "Pour ne pas révéler qu'un identifiant existe", "Pour respecter le RGPD", "Pour accélérer la connexion"], answer=1,
    explain="Un message précis permet d'énumérer les comptes existants, puis de les attaquer un par un.")
add(type="qcm", q="Que permet l'attribut HttpOnly sur un cookie de session ?",
    choices=["Le chiffrer", "L'empêcher d'être lu par du JavaScript", "L'envoyer seulement en HTTPS", "Le limiter au même site"], answer=1,
    explain="HttpOnly empêche un script XSS de voler le cookie. Secure = HTTPS uniquement ; SameSite limite le CSRF.")

# --- CSRF, SSO, JWT ---
add(type="qcm", context="Un site piégé contient un formulaire caché qui modifie l'e-mail du compte de la victime sur ton application, pendant qu'elle y est connectée.",
    q="Quelle protection mettre en place ?",
    choices=["Un jeton anti-CSRF vérifié à chaque formulaire", "Une requête préparée", "Le hachage du mot de passe", "Un antivirus"], answer=0,
    explain="C'est une attaque CSRF : le navigateur joint automatiquement le cookie. Un jeton aléatoire, inconnu de l'attaquant, permet de refuser la requête.")
add(type="vf", q="OAuth 2.0 est d'abord un protocole d'autorisation ; OpenID Connect y ajoute l'authentification.", answer=True,
   explain="Vrai : OAuth 2.0 délivre des jetons d'accès à des ressources ; OIDC ajoute un jeton d'identité pour savoir qui est l'utilisateur.")
add(type="vf", q="Le contenu d'un jeton JWT est chiffré : personne ne peut le lire sans la clé.", answer=False,
   explain="Faux : un JWT est encodé en Base64URL, donc lisible. Sa signature garantit seulement qu'il n'a pas été modifié.")
add(type="qcm", q="Quel est le principal risque d'une authentification unique (SSO) ?",
    choices=["Les utilisateurs ont trop de mots de passe", "Le fournisseur d'identité devient un point unique de défaillance", "Elle empêche la MFA", "Elle est interdite par le RGPD"], answer=1,
    explain="Si le fournisseur d'identité est compromis ou en panne, toutes les applications le sont : il faut le protéger fortement (MFA, supervision).")
add(type="ordre", q="Remets dans l'ordre une connexion par authentification unique (SSO).", items=[
    "L'utilisateur ouvre l'application", "L'application le redirige vers le fournisseur d'identité",
    "Il s'authentifie auprès du fournisseur d'identité", "Le fournisseur renvoie un jeton signé à l'application",
    "L'application vérifie le jeton et ouvre la session"],
    explain="L'application ne voit jamais le mot de passe : elle fait confiance au jeton signé par le fournisseur d'identité.")

# --- Crypto ---
add(type="qcm", q="Alice veut envoyer un message confidentiel à Bob. Avec quelle clé doit-elle chiffrer ?",
    choices=["Sa clé privée", "Sa clé publique", "La clé publique de Bob", "La clé privée de Bob"], answer=2,
    explain="Seul Bob possède la clé privée qui déchiffre ce qui a été chiffré avec sa clé publique.")
add(type="qcm", q="Pour signer numériquement un document, l'émetteur utilise…",
    choices=["sa clé privée", "sa clé publique", "la clé publique du destinataire", "une clé symétrique partagée"], answer=0,
    explain="On signe avec sa clé privée ; tout le monde vérifie avec sa clé publique. Cela prouve l'intégrité et l'authenticité.")
add(type="assoc", q="Associe chaque technique à ce qu'elle garantit.", pairs=[
    {"left": "Chiffrement", "right": "Confidentialité"},
    {"left": "Hachage", "right": "Intégrité"},
    {"left": "Signature numérique", "right": "Authenticité et intégrité"},
    {"left": "Journalisation", "right": "Preuve (traçabilité)"}],
    explain="Retrouver le bon critère DICP derrière chaque mesure est une question fréquente.")

# --- OWASP, DICP ---
add(type="assoc", q="Associe chaque faille à sa parade principale.", pairs=[
    {"left": "Injection SQL", "right": "Requête préparée"},
    {"left": "XSS", "right": "Échapper les sorties"},
    {"left": "CSRF", "right": "Jeton anti-CSRF"},
    {"left": "Contrôle d'accès défaillant", "right": "Vérifier les droits côté serveur"},
    {"left": "Mot de passe volé", "right": "Authentification multifacteur"}],
    explain="Nommer la faille puis donner la parade précise : c'est ce qu'attend la correction.")
add(type="qcm", q="Quel risque est n°1 de l'OWASP Top 10, en 2021 comme en 2025 ?",
    choices=["Injection", "Contrôle d'accès défaillant", "Mauvaise configuration", "Défaillances cryptographiques"], answer=1,
    explain="Le contrôle d'accès défaillant est en tête ; en 2025, il absorbe aussi la SSRF.")
add(type="qcm", context="Une attaque par déni de service rend le site de réservation inaccessible pendant 3 heures.",
    q="Quel critère de sécurité est atteint ?",
    choices=["Disponibilité", "Intégrité", "Confidentialité", "Preuve"], answer=0,
    explain="Le service n'est plus accessible quand on en a besoin : c'est la disponibilité.")
add(type="qcm", q="Que faire contre les composants vulnérables (A06) ?",
    choices=["Ne jamais utiliser de bibliothèque", "Tenir un inventaire des dépendances, les mettre à jour et les auditer", "Masquer la version utilisée", "Désactiver HTTPS"], answer=1,
    explain="Les failles connues (CVE) des bibliothèques sont exploitées en priorité : composer audit ou npm audit et des mises à jour régulières les traitent.")
add(type="vf", q="Il est acceptable d'écrire les mots de passe saisis dans les journaux pour faciliter le débogage.", answer=False,
   explain="Faux : on ne journalise jamais de mot de passe ni de donnée sensible. On journalise l'événement (échec de connexion), l'utilisateur, l'heure, l'IP.")
add(type="qcm", q="Quel principe impose de ne donner à un compte que les droits strictement nécessaires ?",
    choices=["La défense en profondeur", "Le moindre privilège", "La séparation des tâches", "La minimisation"], answer=1,
    explain="Le moindre privilège limite les dégâts si un compte est compromis. La minimisation est le principe équivalent du RGPD, pour les données.")

# --- RGPD, droit ---
add(type="qcm", context="Une application de gestion de clients subit une fuite de données personnelles.",
    q="Dans quel délai faut-il notifier la CNIL ?", choices=["24 heures", "72 heures", "15 jours", "1 mois"], answer=1,
    explain="Le RGPD impose une notification à la CNIL sous 72 heures, et l'information des personnes si le risque pour elles est élevé.")
add(type="vf", q="Des données pseudonymisées ne sont plus des données personnelles.", answer=False,
   explain="Faux : on peut encore réidentifier les personnes, les données restent soumises au RGPD. Seules les données vraiment anonymisées en sortent.")
add(type="multi", q="Lesquels sont des principes du RGPD ?",
    choices=["Minimisation des données", "Limitation de la durée de conservation", "Conservation illimitée pour les statistiques", "Finalité déterminée", "Collecte de toutes les données utiles un jour"], answers=[0, 1, 3],
    explain="On collecte seulement ce qui est nécessaire, pour une finalité précise et une durée limitée.")
add(type="qcm", context="Le formulaire d'inscription d'une application de covoiturage demande la date de naissance, la profession et la situation familiale, alors que seuls le nom, l'e-mail et le téléphone sont utiles.",
    q="Quel principe du RGPD n'est pas respecté ?",
    choices=["La portabilité", "La minimisation des données", "Le droit d'accès", "La notification des violations"], answer=1,
    explain="On ne collecte que les données nécessaires à la finalité. La protection par défaut (art. 25) va dans le même sens.")
add(type="qcm", q="Quels cookies peuvent être déposés sans le consentement de l'utilisateur ?",
    choices=["Les cookies publicitaires", "Les cookies strictement nécessaires (session, panier)", "Les cookies des réseaux sociaux", "Tous, s'il est informé"], answer=1,
    explain="Seuls les cookies indispensables au service demandé sont exemptés ; les autres demandent un consentement libre et éclairé.")
add(type="qcm", q="Quand une analyse d'impact (AIPD) est-elle obligatoire ?",
    choices=["Pour tout traitement", "Quand le traitement présente un risque élevé pour les personnes", "Uniquement après une violation", "Jamais pour une PME"], answer=1,
    explain="L'AIPD est requise pour les traitements à risque élevé (données sensibles à grande échelle, surveillance systématique…).")
add(type="qcm", q="Quel article du Code pénal sanctionne l'accès frauduleux à un système de traitement automatisé de données (STAD) ?",
    choices=["Art. 1240", "Art. 323-1", "Art. L420-1", "Art. 1128"], answer=1,
    explain="L'art. 323-1 du Code pénal ; 1240 et 1128 sont des articles du Code civil, L420-1 du Code de commerce.")
add(type="trou", q="La règle de sauvegarde ___ : 3 copies, sur 2 supports différents, dont 1 hors site.", answers=["3-2-1", "321", "3 2 1"],
    explain="Une copie hors site protège contre un sinistre ou un rançongiciel qui toucherait les copies locales.")

data = {"title": TITLE, "subject": SUBJECT, "course": COURSE.strip(), "flashcards": F, "quiz": Q}
out = os.path.join(os.path.dirname(__file__), "..", "..", "data", "cyber-slam.json")
with open(out, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=1)
types = {}
for q in Q:
    types[q["type"]] = types.get(q["type"], 0) + 1
print(f"{len(F)} flashcards, {len(Q)} questions {types}")
