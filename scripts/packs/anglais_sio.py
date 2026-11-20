#!/usr/bin/env python3
# Source du cours prêt à l'emploi « Anglais — BTS SIO » → data/anglais-sio.json
# Usage : python3 scripts/packs/anglais_sio.py
import json, os

TITLE = "Anglais — BTS SIO : connecteurs et vocabulaire"
SUBJECT = "Anglais"

COURSE = r"""
## 0. À quoi sert ce cours

En BTS SIO, l'anglais s'évalue à l'**écrit** (comprendre un document technique ou d'actualité, en rendre compte) et à l'**oral** (présenter, réagir, argumenter). Deux outils font gagner le plus de points :

- les **connecteurs logiques** : ils structurent ta pensée et rendent ton texte ou ton oral clair ;
- le **vocabulaire du métier** : cybersécurité, IA, développement, réseaux, données, entreprise.

> 📌 Un bon réflexe : apprends chaque mot **dans une phrase**, pas seul. Les exemples ci-dessous sont faits pour ça.

## 1. Les connecteurs logiques

### Ajouter une idée
| Anglais | Français | Exemple |
|---|---|---|
| **and** / **also** | et / aussi | The app is fast **and** secure. |
| **moreover** / **furthermore** | de plus | **Moreover**, the data is encrypted. |
| **in addition (to)** | en plus (de) | **In addition to** MFA, we use logging. |
| **besides** | d'ailleurs, en outre | **Besides**, it's free. |
| **as well as** | ainsi que | Java **as well as** Python. |
| **not only… but also** | non seulement… mais aussi | It is **not only** cheap **but also** reliable. |

### Opposer, nuancer
| Anglais | Français | Exemple |
|---|---|---|
| **but** | mais | It's powerful **but** expensive. |
| **however** | cependant | **However**, AI can make mistakes. |
| **whereas** / **while** | alors que (comparaison) | Python is easy, **whereas** C is harder. |
| **on the one hand… on the other hand** | d'un côté… de l'autre | |
| **on the contrary** | au contraire | |
| **instead (of)** | au lieu (de) | Use bcrypt **instead of** MD5. |
| **nevertheless** / **yet** | néanmoins / pourtant | |

### Concéder
| Anglais | Français | Exemple |
|---|---|---|
| **although** / **even though** + phrase | bien que, même si | **Although** AI is useful, it is not perfect. |
| **despite** / **in spite of** + nom ou -ing | malgré | **Despite** the patch, the bug remains. |
| **even if** | même si (hypothèse) | **Even if** you use a VPN, be careful. |

> ⚠️ **Despite** n'est **jamais** suivi de *of* : ~~despite of~~ → **despite** the risks / **in spite of** the risks.

### Cause
| Anglais | Français | Exemple |
|---|---|---|
| **because** + phrase | parce que | The site crashed **because** the server was overloaded. |
| **because of** / **due to** + nom | à cause de, en raison de | The delay is **due to** a bug. |
| **since** / **as** | puisque, comme | **Since** the data is personal, GDPR applies. |
| **thanks to** | grâce à | **Thanks to** backups, nothing was lost. |
| **indeed** / **in fact** | en effet | The app is popular. **Indeed**, it has 10,000 users. |

> ⚠️ « En effet » se dit **indeed** (ou **in fact**), jamais ~~in effect~~ (= en pratique, en vigueur). *Indeed* sert à **confirmer ou justifier** ce qu'on vient de dire.

### Conséquence
| Anglais | Français | Exemple |
|---|---|---|
| **so** | donc | The password was weak, **so** it was cracked. |
| **therefore** / **thus** | par conséquent, ainsi | **Therefore**, we must update the library. |
| **as a result** / **consequently** | en conséquence | **As a result**, users lost their data. |
| **that's why** | c'est pourquoi | |

### But
| Anglais | Français | Exemple |
|---|---|---|
| **to** / **in order to** + verbe | pour, afin de | We hash passwords **in order to** protect them. |
| **so that** + phrase | pour que | We log actions **so that** we can trace attacks. |

### Exemple, reformulation
| Anglais | Français |
|---|---|
| **for example** / **for instance** | par exemple |
| **such as** | tel que, comme |
| **in other words** / **that is to say** | autrement dit |
| **especially** / **in particular** | surtout, en particulier |

### Organiser son discours
| Anglais | Français |
|---|---|
| **first(ly)** / **to begin with** | d'abord, pour commencer |
| **then** / **next** / **after that** | ensuite, puis |
| **finally** / **lastly** | enfin |
| **to sum up** / **in short** | pour résumer, bref |
| **to conclude** / **in conclusion** | pour conclure |
| **all in all** / **overall** | dans l'ensemble |

```flux
First / To begin with -> Then / Moreover -> However -> As a result -> To conclude
```

## 2. Vocabulaire : cybersécurité

| Anglais | Français |
|---|---|
| **a threat** | une menace |
| **a vulnerability** / **a flaw** | une vulnérabilité, une faille |
| **a breach** / **a data breach** | une violation / une fuite de données |
| **an attacker** / **a hacker** | un attaquant / un pirate |
| **malware** | un logiciel malveillant |
| **ransomware** | un rançongiciel |
| **phishing** | l'hameçonnage |
| **a password** / **a passphrase** | un mot de passe / une phrase de passe |
| **two-factor authentication (2FA)** / **MFA** | double authentification |
| **encryption** / **to encrypt** | le chiffrement / chiffrer |
| **hashing** / **to hash** | le hachage / hacher |
| **a firewall** | un pare-feu |
| **a patch** / **an update** / **to patch** | un correctif / une mise à jour / corriger |
| **a backup** / **to back up** | une sauvegarde / sauvegarder |
| **access control** / **permissions** | contrôle d'accès / droits |
| **to log in** / **to log out** | se connecter / se déconnecter |
| **logs** / **logging** | les journaux / la journalisation |
| **a denial-of-service attack (DoS)** | une attaque par déni de service |
| **SQL injection** / **cross-site scripting (XSS)** | injection SQL / XSS |
| **a leak** / **to leak** | une fuite / fuiter |
| **a scam** | une arnaque |

## 3. Vocabulaire : intelligence artificielle

| Anglais | Français |
|---|---|
| **artificial intelligence (AI)** | intelligence artificielle (IA) |
| **machine learning** | apprentissage automatique |
| **deep learning** / **a neural network** | apprentissage profond / un réseau de neurones |
| **a large language model (LLM)** | un grand modèle de langage |
| **a chatbot** / **an AI assistant** | un agent conversationnel / un assistant IA |
| **generative AI** | IA générative |
| **a prompt** | une instruction, une requête |
| **training data** / **to train a model** | données d'entraînement / entraîner un modèle |
| **an algorithm** | un algorithme |
| **a bias** / **biased** | un biais / biaisé |
| **a hallucination** | une hallucination (réponse inventée) |
| **a deepfake** | un hypertrucage |
| **automation** / **to automate** | l'automatisation / automatiser |
| **an AI agent** | un agent IA (qui agit seul) |
| **reliable** / **accurate** | fiable / exact, précis |
| **to replace jobs** / **job losses** | remplacer des emplois / pertes d'emplois |
| **the AI Act** | le règlement européen sur l'IA |

## 4. Vocabulaire : développement (SLAM)

| Anglais | Français |
|---|---|
| **software** / **a software developer** | un logiciel / un développeur |
| **source code** / **to code** | le code source / coder |
| **a programming language** | un langage de programmation |
| **a bug** / **to debug** / **to fix a bug** | un bogue / déboguer / corriger un bogue |
| **a feature** | une fonctionnalité |
| **a framework** / **a library** | un cadriciel / une bibliothèque |
| **a database** / **a query** | une base de données / une requête |
| **a table** / **a field** / **a record** | une table / un champ / un enregistrement |
| **an API** | une interface de programmation |
| **the front end** / **the back end** | la partie client / la partie serveur |
| **user interface (UI)** / **user experience (UX)** | interface / expérience utilisateur |
| **a test** / **unit testing** | un test / tests unitaires |
| **to deploy** / **deployment** | déployer / le déploiement |
| **a repository (repo)** / **a commit** | un dépôt / une validation |
| **a branch** / **to merge** | une branche / fusionner |
| **open source** | libre, au code ouvert |
| **a requirement** / **specifications (specs)** | une exigence / le cahier des charges |
| **to maintain** / **maintenance** | maintenir / la maintenance |

## 5. Vocabulaire : réseaux, matériel, cloud

| Anglais | Français |
|---|---|
| **hardware** / **software** | matériel / logiciel |
| **a network** / **a server** | un réseau / un serveur |
| **a router** / **a switch** | un routeur / un commutateur |
| **bandwidth** | la bande passante |
| **the cloud** / **cloud computing** | le nuage / l'informatique en nuage |
| **storage** / **to store** | le stockage / stocker |
| **a data center** | un centre de données |
| **a device** | un appareil |
| **to download** / **to upload** | télécharger / téléverser, envoyer |
| **a laptop** / **a desktop** | un ordinateur portable / fixe |
| **a screen** / **a keyboard** | un écran / un clavier |
| **to install** / **to set up** | installer / configurer |
| **an outage** / **downtime** | une panne / une interruption de service |

## 6. Vocabulaire : données, RGPD, entreprise

| Anglais | Français |
|---|---|
| **personal data** | données personnelles |
| **the GDPR** (General Data Protection Regulation) | le RGPD |
| **privacy** | la vie privée, la confidentialité |
| **consent** / **to consent** | le consentement / consentir |
| **a data controller** | un responsable de traitement |
| **a customer** / **a client** / **a user** | un client / un client (service) / un utilisateur |
| **a company** / **a firm** / **a start-up** | une entreprise / une jeune pousse |
| **a project manager** / **a team** | un chef de projet / une équipe |
| **a deadline** | une date limite, une échéance |
| **a meeting** | une réunion |
| **a stakeholder** | une partie prenante |
| **a budget** / **costs** | un budget / les coûts |
| **an internship** / **an intern** | un stage / un stagiaire |
| **a job interview** / **a résumé (US) / a CV (UK)** | un entretien d'embauche / un CV |
| **skills** / **soft skills** | compétences / savoir-être |
| **remote work** / **to work from home** | le télétravail / télétravailler |

## 7. Les faux amis à connaître

| Anglais | Veut dire | ≠ | Pour dire… en anglais |
|---|---|---|---|
| **actually** | en fait | actuellement | **currently**, **nowadays** |
| **eventually** | finalement | éventuellement | **possibly** |
| **a library** | une bibliothèque | une librairie | **a bookshop** |
| **sensible** | raisonnable | sensible | **sensitive** (sensitive data) |
| **to control** | maîtriser, diriger | contrôler (vérifier) | **to check** |
| **in effect** | en pratique, en vigueur | en effet | **indeed** |
| **a computer** | un ordinateur | — | — |
| **to achieve** | réussir, atteindre | achever | **to finish** |
| **to attend** | assister à | attendre | **to wait for** |
| **a formation** | une disposition, une formation géologique | une formation (études) | **training** |
| **data** | des données (indénombrable) | — | ~~datas~~ |
| **information** | des informations (indénombrable) | — | ~~informations~~ → **some information** |

> ⚠️ **Data**, **information**, **software**, **hardware**, **advice** sont **indénombrables** : jamais de *s*, jamais *a/an* → **a piece of software**, **some advice**.

## 8. Phrases utiles

### Présenter un document
- *This document is an article from… published in…* — Ce document est un article de… publié dans…
- *It deals with…* / *It is about…* — Il traite de…
- *The author explains / points out / warns that…* — L'auteur explique / souligne / avertit que…
- *According to the article,…* — D'après l'article,…

### Donner son avis
- *In my opinion,…* / *I think that…* / *As far as I'm concerned,…* — À mon avis,…
- *I agree / disagree with…* — Je suis d'accord / pas d'accord avec…
- *It seems to me that…* — Il me semble que…
- *The main advantage / drawback is…* — Le principal avantage / inconvénient est…

### Présenter un projet (oral, stage)
- *During my internship, I worked on…* — Pendant mon stage, j'ai travaillé sur…
- *I was in charge of…* — J'étais chargé de…
- *I developed a web application which allows users to…* — J'ai développé une appli web qui permet aux utilisateurs de…
- *I used PHP and MySQL to…* — J'ai utilisé PHP et MySQL pour…
- *The main difficulty was…, so I…* — La principale difficulté était…, donc j'ai…

> 💡 À l'oral, enchaîne tes idées avec **first, then, moreover, however, so, to conclude** : c'est simple et ça montre une vraie structure.
"""

F = []
def card(front, back):
    F.append({"front": front, "back": back.strip()})

card("Connecteurs pour AJOUTER une idée", r"""
| 🇬🇧 | 🇫🇷 |
|---|---|
| **moreover** / **furthermore** | de plus |
| **in addition (to)** | en plus (de) |
| **besides** | d'ailleurs |
| **as well as** | ainsi que |
| **not only… but also** | non seulement… mais aussi |

> 💡 *==Moreover==, the data is encrypted.*
""")

card("Connecteurs pour OPPOSER deux idées", r"""
| 🇬🇧 | 🇫🇷 |
|---|---|
| **however** | cependant |
| **whereas** / **while** | alors que |
| **on the other hand** | d'un autre côté |
| **instead of** | au lieu de |
| **nevertheless** / **yet** | néanmoins / pourtant |

> 💡 *Python is easy, ==whereas== C is harder.*
""")

card("Although, despite, even if : comment les utiliser ?", r"""
| 🇬🇧 | 🇫🇷 | suivi de |
|---|---|---|
| **although** / **even though** | bien que | une **phrase** |
| **despite** / **in spite of** | malgré | un **nom** ou **-ing** |
| **even if** | même si | une hypothèse |

> ⚠️ **Piège :** ~~despite of~~ → ==despite the risks==.
""")

card("Connecteurs de CAUSE", r"""
| 🇬🇧 | 🇫🇷 | suivi de |
|---|---|---|
| **because** | parce que | phrase |
| **because of** / **due to** | à cause de | nom |
| **since** / **as** | puisque | phrase |
| **thanks to** | grâce à | nom |
| **indeed** / **in fact** | ==en effet== | phrase |

> ⚠️ **En effet** = *indeed*, jamais ~~in effect~~.
""")

card("Connecteurs de CONSÉQUENCE et de BUT", r"""
| 🇬🇧 | 🇫🇷 |
|---|---|
| **so** | donc |
| **therefore** / **thus** | par conséquent |
| **as a result** / **consequently** | en conséquence |
| **in order to** + verbe | afin de |
| **so that** + phrase | pour que |

> 💡 *We hash passwords ==in order to== protect them.*
""")

card("Organiser son texte ou son oral", r"""
```flux
First -> Then -> Moreover -> However -> To conclude
```

| 🇬🇧 | 🇫🇷 |
|---|---|
| **to begin with** | pour commencer |
| **for instance** / **such as** | par exemple / tel que |
| **in other words** | autrement dit |
| **to sum up** / **in short** | pour résumer |
| **all in all** | dans l'ensemble |
""")

card("Cybersécurité : les attaques (EN → FR)", r"""
| 🇬🇧 | 🇫🇷 |
|---|---|
| **a threat** | une menace |
| **a flaw** / **a vulnerability** | une faille |
| **a data breach** | une fuite de données |
| **malware** / **ransomware** | logiciel malveillant / rançongiciel |
| **phishing** | hameçonnage |
| **a scam** | une arnaque |
| **a leak** | une fuite |
""")

card("Cybersécurité : les protections (EN → FR)", r"""
| 🇬🇧 | 🇫🇷 |
|---|---|
| **encryption** / **to encrypt** | chiffrement / chiffrer |
| **to hash** | hacher |
| **a firewall** | un pare-feu |
| **a patch** / **an update** | un correctif / une mise à jour |
| **a backup** / **to back up** | sauvegarde / sauvegarder |
| **two-factor authentication** | double authentification |
| **logs** | les journaux |
""")

card("Intelligence artificielle (EN → FR)", r"""
| 🇬🇧 | 🇫🇷 |
|---|---|
| **machine learning** | apprentissage automatique |
| **a large language model (LLM)** | grand modèle de langage |
| **training data** | données d'entraînement |
| **a prompt** | une instruction |
| **a bias** | un biais |
| **a hallucination** | une réponse inventée |
| **a deepfake** | un hypertrucage |
| **reliable** | fiable |
""")

card("Développement (EN → FR)", r"""
| 🇬🇧 | 🇫🇷 |
|---|---|
| **a bug** / **to fix** | un bogue / corriger |
| **a feature** | une fonctionnalité |
| **a library** / **a framework** | bibliothèque / cadriciel |
| **a query** | une requête |
| **the back end** | la partie serveur |
| **to deploy** | déployer |
| **a repository** / **to merge** | un dépôt / fusionner |
| **specifications (specs)** | cahier des charges |
""")

card("Réseaux, matériel, cloud (EN → FR)", r"""
| 🇬🇧 | 🇫🇷 |
|---|---|
| **hardware** / **software** | matériel / logiciel |
| **a device** | un appareil |
| **a router** / **a switch** | routeur / commutateur |
| **bandwidth** | bande passante |
| **storage** | stockage |
| **to upload** / **to download** | envoyer / télécharger |
| **an outage** | une panne |
""")

card("Données et entreprise (EN → FR)", r"""
| 🇬🇧 | 🇫🇷 |
|---|---|
| **personal data** | données personnelles |
| **the GDPR** | le RGPD |
| **privacy** | vie privée |
| **consent** | consentement |
| **a deadline** | une échéance |
| **a stakeholder** | une partie prenante |
| **an internship** | un stage |
| **remote work** | télétravail |
""")

card("Les faux amis les plus piégeux", r"""
| 🇬🇧 | = | ≠ |
|---|---|---|
| **actually** | ==en fait== | actuellement (*currently*) |
| **eventually** | ==finalement== | éventuellement (*possibly*) |
| **a library** | bibliothèque | librairie (*bookshop*) |
| **sensible** | raisonnable | sensible (*sensitive*) |
| **to achieve** | réussir | achever (*to finish*) |
| **to attend** | assister à | attendre (*to wait for*) |
""")

card("Data, information, software : quel piège ?", r"""
==Ce sont des noms **indénombrables**== : jamais de *s*, jamais *a/an*.

| ❌ | ✅ |
|---|---|
| ~~datas~~ | **data** |
| ~~an information~~ | **a piece of information** |
| ~~softwares~~ | **software** / **programs** |
| ~~an advice~~ | **some advice** |

> 💡 Idem : **hardware**, **equipment**, **feedback**.
""")

card("Présenter un document en anglais", r"""
| 🇬🇧 | 🇫🇷 |
|---|---|
| *This document is an article from…* | Ce document est un article de… |
| *It deals with…* | Il traite de… |
| *The author points out that…* | L'auteur souligne que… |
| *The author warns that…* | L'auteur avertit que… |
| *According to the article,…* | D'après l'article,… |
""")

card("Donner son avis en anglais", r"""
| 🇬🇧 | 🇫🇷 |
|---|---|
| *In my opinion,…* | À mon avis,… |
| *As far as I'm concerned,…* | En ce qui me concerne,… |
| *I agree / disagree with…* | Je suis d'accord / pas d'accord |
| *It seems to me that…* | Il me semble que… |
| *The main drawback is…* | Le principal inconvénient est… |
""")

card("Présenter son stage ou un projet", r"""
```flux
During my internship… -> I was in charge of… -> I developed… -> The main difficulty was…
```

- *I developed a web app ==which allows users to==…*
- *I used **PHP and MySQL** to…*
- *So, I learned how to…*

> 💡 Structure : **contexte → mission → réalisation → difficulté → bilan**.
""")

Q = []
def add(**q):
    q.setdefault("context", "")
    Q.append(q)

# --- Connecteurs ---
add(type="qcm", q="Que veut dire « however » ?", choices=["cependant", "de plus", "donc", "parce que"], answer=0,
    explain="« However » introduit une opposition : cependant, pourtant. « De plus » = moreover, « donc » = so / therefore.")
add(type="qcm", q="Quel connecteur exprime une CONSÉQUENCE ?", choices=["Although", "Therefore", "Whereas", "Besides"], answer=1,
    explain="Therefore = par conséquent. Although = bien que (concession), whereas = alors que (opposition), besides = d'ailleurs (ajout).")
add(type="trou", q="Complète : « The password was weak, ___ it was cracked in seconds. » (donc)", answers=["so", "therefore", "thus"],
    explain="« so » (ou therefore / thus) introduit la conséquence.")
add(type="qcm", q="Choisis la phrase correcte.", choices=["Despite of the patch, the bug remains.", "Despite the patch, the bug remains.", "Although the patch, the bug remains.", "Even the patch, the bug remains."], answer=1,
    explain="Despite + nom, sans « of ». Although doit être suivi d'une phrase complète : although the patch was installed…")
add(type="trou", q="Complète : « ___ AI is useful, it can make mistakes. » (bien que)", answers=["Although", "Even though", "Though"],
    explain="Although / even though + phrase = bien que, même si.")
add(type="qcm", q="« We hash passwords ___ protect them. »", choices=["so that", "in order to", "because", "due to"], answer=1,
    explain="In order to + verbe = afin de. « So that » est suivi d'une phrase (so that they are protected).")
add(type="qcm", q="Quelle différence entre « because » et « because of » ?",
    choices=["Aucune", "because + phrase ; because of + nom", "because + nom ; because of + phrase", "because of est familier"], answer=1,
    explain="Because the server crashed (phrase) / because of the crash (nom). Même logique pour due to + nom.")
add(type="qcm", q="Comment dit-on « en effet » en anglais ?", choices=["in effect", "indeed", "effectively", "in fact of"], answer=1,
    explain="En effet = indeed (ou in fact). « In effect » = en pratique ; « effectively » = efficacement. Ex. : The app is popular. Indeed, it has 10,000 users.")
add(type="trou", context="« Passwords must be hashed. ___, a stolen database would otherwise expose every account. »", q="Complète avec le connecteur qui veut dire « en effet » : ___", answers=["Indeed", "In fact"],
    explain="Indeed justifie l'idée précédente : en effet, sinon une base volée exposerait tous les comptes.")
add(type="assoc", q="Associe chaque connecteur à sa fonction.", pairs=[
    {"left": "Moreover", "right": "Ajouter"},
    {"left": "However", "right": "Opposer"},
    {"left": "Since", "right": "Expliquer la cause"},
    {"left": "As a result", "right": "Donner la conséquence"},
    {"left": "For instance", "right": "Donner un exemple"}],
    explain="Connaître la fonction de chaque connecteur permet de construire un paragraphe logique.")
add(type="ordre", q="Remets les connecteurs dans l'ordre logique d'un paragraphe.", items=["First", "Then", "Moreover", "However", "To conclude"],
    explain="On introduit, on enchaîne, on ajoute un argument, on nuance, puis on conclut.")
add(type="qcm", context="« Python is easy to learn, ___ C requires more practice. »", q="Quel connecteur convient ?",
    choices=["whereas", "moreover", "therefore", "thanks to"], answer=0,
    explain="Whereas = alors que : on compare deux éléments qui s'opposent.")
add(type="trou", q="Traduis « pour résumer » : « To ___ up, AI brings both opportunities and risks. »", answers=["sum"],
    explain="« To sum up » = pour résumer. Variantes : in short, all in all.")
add(type="vf", q="« Besides » veut dire « à côté de » quand il est utilisé comme connecteur en début de phrase.", answer=False,
    explain="Faux : en connecteur, « Besides, … » = d'ailleurs, en outre. « Beside » (sans s) = à côté de.")

# --- Vocabulaire ---
add(type="qcm", q="Comment dit-on « une faille de sécurité » ?", choices=["a security fail", "a security flaw", "a security fault line", "a security hole-up"], answer=1,
    explain="A flaw (ou a vulnerability). « A fail » n'est pas correct dans ce sens.")
add(type="qcm", q="Que signifie « a data breach » ?", choices=["une sauvegarde de données", "une fuite / violation de données", "une base de données", "un transfert de données"], answer=1,
    explain="A breach = une brèche, une violation. A data breach doit être notifiée sous 72 h (GDPR).")
add(type="trou", q="Traduis : « un pare-feu » = a ___", answers=["firewall"],
    explain="A firewall filtre le trafic réseau.")
add(type="trou", q="Traduis : « le chiffrement » = ___", answers=["encryption"],
    explain="Encryption / to encrypt. Ne pas confondre avec hashing (hachage, irréversible).")
add(type="assoc", q="Associe le mot anglais à sa traduction.", pairs=[
    {"left": "ransomware", "right": "rançongiciel"},
    {"left": "phishing", "right": "hameçonnage"},
    {"left": "a patch", "right": "un correctif"},
    {"left": "a backup", "right": "une sauvegarde"},
    {"left": "a threat", "right": "une menace"}],
    explain="Le vocabulaire cyber revient très souvent dans les articles d'actualité.")
add(type="qcm", q="Que veut dire « training data » ?", choices=["des données de formation professionnelle", "des données d'entraînement d'un modèle d'IA", "des données de test", "des données de sport"], answer=1,
    explain="To train a model = entraîner un modèle. Training data = les données qui servent à l'entraîner.")
add(type="qcm", context="« The chatbot gave a confident answer, but the facts were completely made up. »", q="Comment appelle-t-on ce phénomène ?",
    choices=["a bias", "a hallucination", "a deepfake", "a prompt"], answer=1,
    explain="A hallucination = une réponse inventée présentée comme vraie. A bias = un biais, a deepfake = une fausse vidéo ou un faux audio.")
add(type="trou", q="Traduis : « une fonctionnalité » = a ___", answers=["feature"],
    explain="A feature. Ex. : the new version adds three features.")
add(type="qcm", q="Que veut dire « to deploy an application » ?", choices=["la supprimer", "la déployer, la mettre en production", "la déboguer", "la télécharger"], answer=1,
    explain="Deployment = mise en production. Debug = déboguer, download = télécharger.")
add(type="qcm", q="« A stakeholder » est…", choices=["un actionnaire uniquement", "une partie prenante d'un projet", "un serveur de stockage", "un chef de projet"], answer=1,
    explain="Stakeholder = toute personne concernée par le projet (client, utilisateurs, direction…).")
add(type="trou", q="Traduis : « une date limite » = a ___", answers=["deadline"],
    explain="A deadline. To meet a deadline = respecter une échéance.")
add(type="assoc", q="Associe le terme technique à sa traduction.", pairs=[
    {"left": "a query", "right": "une requête"},
    {"left": "a repository", "right": "un dépôt"},
    {"left": "bandwidth", "right": "la bande passante"},
    {"left": "an outage", "right": "une panne"}],
    explain="Vocabulaire fréquent dans les documents techniques.")

# --- Faux amis, grammaire ---
add(type="qcm", q="« Actually, the server is down. » signifie…", choices=["Actuellement, le serveur est en panne.", "En fait, le serveur est en panne.", "Finalement, le serveur est en panne.", "Normalement, le serveur est en panne."], answer=1,
    explain="Actually = en fait. « Actuellement » se dit currently ou nowadays.")
add(type="qcm", q="Comment dit-on « des données sensibles » ?", choices=["sensible data", "sensitive data", "sensibles datas", "sensitive datas"], answer=1,
    explain="Sensitive = sensible (délicat). Sensible = raisonnable. Et data ne prend jamais de s.")
add(type="vf", q="« Eventually » veut dire « éventuellement ».", answer=False,
    explain="Faux : eventually = finalement, à la fin. « Éventuellement » = possibly.")
add(type="vf", q="On peut écrire « I need an information about the GDPR. »", answer=False,
    explain="Faux : information est indénombrable → some information, a piece of information.")
add(type="multi", q="Lesquels de ces noms sont indénombrables (jamais de s) ?", choices=["data", "software", "computer", "advice", "device"], answers=[0, 1, 3],
    explain="Data, software, advice (et information, hardware, equipment) sont indénombrables. Computer et device se comptent : two computers, three devices.")
add(type="qcm", q="« I attended a meeting with the client. » signifie…", choices=["J'ai attendu une réunion", "J'ai assisté à une réunion", "J'ai annulé une réunion", "J'ai organisé une réunion"], answer=1,
    explain="To attend = assister à. Attendre = to wait for.")

# --- Phrases utiles ---
add(type="qcm", q="Pour dire « Ce document traite de la cybersécurité », on dit :", choices=["This document treats cybersecurity.", "This document deals with cybersecurity.", "This document talks cybersecurity.", "This document is treating of cybersecurity."], answer=1,
    explain="To deal with / to be about = traiter de. « To treat » = soigner ou traiter quelqu'un.")
add(type="trou", q="Complète : « During my ___, I developed a web application. » (stage)", answers=["internship"],
    explain="An internship = un stage ; an intern = un stagiaire. « Stage » en anglais veut dire « scène » ou « étape ».")
add(type="qcm", q="Quelle expression signifie « En ce qui me concerne » ?", choices=["As far as I'm concerned", "As long as I concern", "According to me concerned", "In my concern"], answer=0,
    explain="As far as I'm concerned = en ce qui me concerne. « According to me » est à éviter : dis plutôt « in my opinion ».")

data = {"title": TITLE, "subject": SUBJECT, "course": COURSE.strip(), "flashcards": F, "quiz": Q}
out = os.path.join(os.path.dirname(__file__), "..", "..", "data", "anglais-sio.json")
with open(out, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=1)
types = {}
for q in Q:
    types[q["type"]] = types.get(q["type"], 0) + 1
print(f"{len(F)} flashcards, {len(Q)} questions {types}")
