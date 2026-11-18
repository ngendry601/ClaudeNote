#!/usr/bin/env python3
# Source du cours prêt à l'emploi « CEJM » → data/cejm.json
# Usage : python3 scripts/packs/cejm.py
import json, os

TITLE = "CEJM — BTS SIO"
SUBJECT = "CEJM"

COURSE = r"""
## 1. Méthodes de l'épreuve (4 h)

### Question juridique
Syllogisme : **FAITS → PROBLÈME → RÈGLE → SOLUTION**

1. **Faits** : qui contre qui, que s'est-il passé, qualifiés juridiquement (« M. X, acheteur » ; « la société Y, prestataire »). Pas de recopie du document.
2. **Problème de droit** : une question générale sans les noms (« Un mensonge déterminant permet-il d'annuler un contrat ? »).
3. **Règle de droit** : article + conditions énumérées (« Selon l'art. 1137 C. civ., le dol suppose… »).
4. **Solution** : on applique chaque condition aux faits puis on conclut oui / non : « donc M. X peut demander la nullité ».

### Question d'analyse
- Notion définie → fait précis du doc (n° du doc) → conclusion. Sans fait du dossier = moitié des points.
- Verbes : **identifier** = nommer ; **qualifier** = donner le nom juridique / la catégorie ; **caractériser** = décrire les traits ; **analyser** = expliquer et justifier ; **justifier** = prouver avec le doc.

### Calculs
- **Taux d'évolution** = (V arrivée − V départ) / V départ × 100 (toujours diviser par le départ).
- **Part** = partie / total × 100 · **VA** = CA − consommations intermédiaires · **Seuil d'abonnement** = coût annuel / prix unitaire, arrondi à l'entier supérieur · mensuel × 12 = annuel.
- Toujours : formule → calcul posé → résultat + unité → phrase d'interprétation.

### Développement structuré (argumentation)
- **Intro** : accroche, définitions des mots du sujet, problématique, annonce du plan.
- « Est-ce… ? » → plan **oui / mais** (dialectique) ; « En quoi… ? » → plan **thématique**.
- 2 parties × 2 sous-parties. Chaque argument = **notion + exemple** (doc ou culture éco). **Conclusion** nuancée + ouverture.

## 2. Économie — mots à savoir par cœur

### Agents et circuit
- **Agent économique** : centre de décision autonome. **Ménages** (consommer, épargner), **entreprises** (produire), **administrations** (services non marchands, redistribuer), **banques / assurances** (financer, couvrir), **ISBLSM / associations**, **reste du monde**.
- **Circuit économique** : flux réels (biens, travail) en sens inverse des flux monétaires (salaires, paiements, impôts).
- **Valeur ajoutée** = CA − consommations intermédiaires. Partagée : salariés (salaires), État (impôts), prêteurs (intérêts), actionnaires (dividendes), entreprise (autofinancement).
- **PIB** = somme des VA produites sur le territoire en 1 an.
- **Financement** : **autofinancement** (CAF) · **indirect** = crédit bancaire, la banque est intermédiaire · **direct** = actions, obligations, levée de fonds auprès d'investisseurs (marché financier si cotée).

### Marché et concurrence
- **Marché** : rencontre offre / demande → **prix d'équilibre**. Demande ↑ ou offre ↓ → prix ↑.
- **Concurrence pure et parfaite (5 conditions)** : atomicité, homogénéité des produits, libre entrée / sortie, transparence de l'information, mobilité des facteurs.
- **Monopole** (1 offreur, fixe le prix) · **oligopole** (quelques offreurs, risque d'entente) · **concurrence monopolistique** (produits différenciés).
- **Barrière à l'entrée** : obstacle (capital, brevet, réglementation, effet de réseau) qui empêche un nouvel entrant.
- **Économies d'échelle** : le coût unitaire baisse quand la quantité produite augmente. **Coût marginal** = coût d'une unité de plus.

### Défaillances du marché
- **Externalité** : effet (positif ou négatif) de l'activité d'un agent sur un autre **sans compensation par le prix**.
- **Négative** : pollution d'une usine, CO2, eau et électricité des data centers. **Positive** : formation des salariés qui profite à d'autres entreprises, chaleur récupérée d'un data center, recherche, vaccination.
- **Internaliser** une externalité négative : **taxe** (pollueur-payeur, taxe pigouvienne), **norme** / interdiction, **marché de quotas** (droits à polluer). Positive : **subvention**.
- **Asymétrie d'information** : une partie en sait plus que l'autre (vendeur de voiture d'occasion). → **antisélection** (avant contrat) et **aléa moral** (après contrat). Réponse : garantie, label, obligation d'information.
- **Bien collectif** : non rival + non exclusif (éclairage public, défense) → produit par l'État.
- **Effet de réseau** : un utilisateur de plus augmente la valeur pour tous (direct) ou pour l'autre face (croisé).

### État et régulation
- **Musgrave — 3 fonctions** : **allocation** (biens collectifs), **redistribution** (réduire les inégalités), **stabilisation** (croissance, emploi, prix).
- **Politique budgétaire** (État : dépenses, impôts) · **politique monétaire** (BCE : taux directeurs, objectif inflation 2 %).
- **Régulation** : action publique qui encadre un marché (Autorité de la concurrence, ARCEP, CNIL).

### Numérique
- **Dématérialisation** : support physique → flux numérique · **automatisation** : traitement sans humain (format structuré). PDF par mail = dématérialisé, pas automatisé.
- **Désintermédiation** : un intermédiaire disparaît · **réintermédiation** : un nouveau arrive (plateforme, Spotify, plateforme agréée de e-facture).
- **Plateforme / marché biface** : sert 2 groupes, une face paie, l'autre souvent gratuite (Doctolib). **Place de marché** : met en relation vendeurs tiers et acheteurs.
- **Freemium** (gratuit + premium, indicateur = **taux de conversion**), abonnement, publicité, commission. **Prosommateur** (Toffler) : consommateur qui produit. **Économie collaborative** ; **économie de l'usage** (usage > propriété).
- **Licorne** : start-up non cotée > 1 Md$ · **décacorne** > 10 Md$. Valorisation ≠ CA.
- **B to B, B to C, C to C, B to G, G to C** : selon le statut de l'acteur.

### Travail et mondialisation
- **Chômage** frictionnel (transition), conjoncturel (crise), structurel (inadéquation compétences). **Polarisation** de l'emploi.
- **Flexibilité** quantitative externe (CDD, intérim) / interne (horaires) / qualitative (polyvalence) / salariale / externalisation.
- **Destruction créatrice** (Schumpeter) · **déversement** (Sauvy). Innovation de produit, procédé, organisation, commercialisation.
- **FMN**, **IDE** (filiale à l'étranger), **DIPP** / chaîne de valeur mondiale. Compétitivité **prix** (coûts, change) et **hors prix** (qualité, innovation, image).

## 3. Droit — mots à savoir par cœur

### Bases
- **Hiérarchie des normes** : Constitution > traités / droit UE > lois > règlements > contrats. + jurisprudence, conventions collectives.
- **Personne physique / personne morale** (société, association) : titulaire de droits, patrimoine propre.
- **Droit objectif** (règles) / **droits subjectifs** (prérogatives d'une personne : droits patrimoniaux, extrapatrimoniaux).

### Le contrat — formation
- **Contrat** : accord de volontés qui crée des obligations (art. 1101). **Liberté contractuelle** (1102) dans le respect de l'ordre public.
- **Pourparlers** : libres, **bonne foi** (1104), **obligation d'information** (1112-1), **confidentialité** (1112-2). Rupture abusive = responsabilité extracontractuelle.
- **Avant-contrats** : pacte de préférence, promesse unilatérale, promesse synallagmatique.
- **Offre** (précise + ferme) + **acceptation** = contrat formé.
- **Validité (1128) — 3 conditions** : consentement des parties, capacité de contracter, contenu licite et certain.
- **Vices du consentement (1130)** : **erreur** (sur les qualités essentielles, excusable) · **dol** (1137 : manœuvres, mensonge ou silence volontaire pour tromper, déterminant) · **violence** (contrainte physique ou morale, y compris abus de dépendance économique 1143).
- **Nullité** : sanction d'une condition de formation → le contrat est censé n'avoir jamais existé (restitutions). **Relative** (protège une partie : vice du consentement, 5 ans) / **absolue** (intérêt général : contenu illicite).

### Le contrat — effets et inexécution
- **Force obligatoire** (1103) : le contrat « tient lieu de loi ». Modification d'un commun accord (1193). **Imprévision** (1195) : changement imprévisible → renégociation. **Effet relatif** : n'engage que les parties.
- **Clause pénale** : indemnité forfaitaire fixée d'avance (réductible par le juge si excessive) · **limitative de responsabilité** : plafonne les dommages et intérêts (écartée si faute lourde ou dolosive ou si elle vide l'obligation essentielle, art. 1170) · **réserve de propriété** : propriété transférée au paiement complet · **résolutoire** : fin automatique si inexécution · **attributive de compétence** : tribunal choisi (entre commerçants) · **confidentialité**, **non-concurrence**, **indexation**.
- **Inexécution (1217) — 5 sanctions** : exception d'inexécution, exécution forcée, réduction du prix, résolution (fin du contrat), dommages et intérêts.
- **Résolution ≠ nullité** : résolution = problème d'exécution ; nullité = problème de formation.
- **Obligation de moyens** (tout faire, faute à prouver) / **de résultat** (le résultat seul compte). Prestataire informatique : souvent moyens + **obligation de conseil**.

### Responsabilité civile
- **3 conditions** : fait générateur + dommage (certain, direct, personnel) + lien de causalité.
- **Contractuelle** : inexécution d'un contrat. **Extracontractuelle** : faute (1240), négligence (1241), fait des choses / des personnes dont on répond, ex. l'employeur pour ses salariés (1242).
- **Exonération** : force majeure (imprévisible, irrésistible, extérieure), faute de la victime, fait d'un tiers.
- **Responsabilité pénale** : infraction punie par la loi (amende, prison) ; personne morale aussi responsable.

### Propriété intellectuelle

| Droit | Protège | Conditions | Durée / formalité |
|---|---|---|---|
| **Droit d'auteur** | œuvre de l'esprit, logiciel, site web | originalité + forme (pas les idées) | dès la création, sans dépôt ; patrimonial 70 ans après la mort ; droit moral perpétuel |
| **Brevet** | invention technique | nouveauté, activité inventive, application industrielle | dépôt INPI, 20 ans, redevances annuelles |
| **Marque** | signe distinctif (nom, logo, son) | distinctive, licite, disponible | dépôt INPI, 10 ans, renouvelable à l'infini |
| **Dessins, modèles** | apparence d'un produit | nouveauté, caractère propre | 5 ans renouvelables, max 25 ans |
| **Base de données** | le travail du producteur | gros investissement | 15 ans (droit sui generis) |

- **Logiciel** : protégé par le droit d'auteur, pas par brevet en principe. Créé par un salarié dans ses fonctions → droits à l'employeur.
- **Exploiter** : **cession** (on vend le droit) ou **licence** (on autorise l'usage contre redevance). Logiciel libre (GPL…).
- **Contrefaçon** : atteinte à un droit de PI → sanction civile (dommages et intérêts) et pénale (jusqu'à 3 ans et 300 000 €). Sans droit de PI → action en **concurrence déloyale** (1240 : dénigrement, confusion, parasitisme).

### Numérique et données
- **Donnée personnelle** : identifie une personne directement ou indirectement (nom, IP, photo). **Donnée sensible** (art. 9) : santé, origine, opinions, religion, syndicat, biométrie, vie sexuelle → interdite sauf exception.
- **Principes RGPD** : licéité, finalité, minimisation, exactitude, durée de conservation limitée, sécurité, responsabilité (accountability, registre des traitements). Consentement libre et éclairé.
- **Droits** : accès, rectification, effacement (oubli), opposition, portabilité, limitation. Responsable de traitement, sous-traitant, DPO, CNIL. Sanction : 4 % du CA mondial ou 20 M€. Violation de données = notification CNIL sous 72 h.
- **Contrats informatiques** : licence, maintenance, infogérance, SaaS / cloud, **SLA** (niveau de service : disponibilité, temps de réponse / rétablissement, pénalités).
- **Preuve électronique** (1366) : même valeur que le papier si auteur identifié + intégrité. Signature électronique (eIDAS).
- **Cybercriminalité** : accès / maintien frauduleux dans un STAD (art. 323-1 C. pén.). NIS2, DMA (contrôleurs d'accès, a priori, 10 % CA), DSA (contenus).

### Concurrence
- **Entente** (L420-1) et **abus de position dominante** (L420-2) interdits. Position dominante = légale, c'est l'abus qui est sanctionné (vente liée, exclusivité, prix prédateurs). Contrôle des concentrations. Autorité de la concurrence (a posteriori, amende).

### Sociétés et travail
- **EI** (patrimoine pro séparé depuis 2022) · **EURL/SARL** (gérant, responsabilité limitée aux apports) · **SAS/SASU** (statuts libres, président) · **SA** (37 000 € min., cotable).
- **Contrat de travail** = prestation + rémunération + lien de subordination. Requalification d'un indépendant (Uber 2020). CDI, CDD / intérim (cas limités), apprentissage.
- **Pouvoirs de l'employeur** : direction, réglementaire (règlement intérieur ≥ 50 salariés), disciplinaire. **Rupture** : démission, licenciement (cause réelle et sérieuse), rupture conventionnelle. Télétravail, droit à la déconnexion, CSE ≥ 11 salariés, convention collective.

## 4. Management — mots à savoir par cœur

### Organisation et finalités
- **Finalités** : économique (profit, pérennité), sociale (emploi), sociétale (**RSE** : intégrer volontairement les enjeux sociaux et environnementaux). Drucker : profit = conséquence de la satisfaction client.
- **Partie prenante** (Freeman) : acteur qui affecte ou est affecté par l'entreprise. Internes / externes. **Mendelow** : pouvoir × intérêt.
- **Gouvernance** : actionnariale / partenariale. **Loi PACTE 2019** : raison d'être, société à mission. **Devoir de vigilance** 2017, **CSRD**.
- **ESS** (associations, coopératives, mutuelles). Taille : TPE < 10, PME < 250, ETI < 5 000.
- **Logique entrepreneuriale** (opportunité, risque, innovation) / **managériale** (planifier, organiser, diriger, contrôler).
- **Structures** : simple, fonctionnelle, divisionnelle, matricielle, en réseau / par projet. **Coordination** (Mintzberg) : ajustement mutuel, supervision directe, standardisation.
- **Performance** : **efficace** (objectif atteint), **efficient** (avec moins de ressources), **pertinent** (moyens adaptés). Performance globale. Tableau de bord, KPI.

### Décision
- **Ansoff — 3 niveaux** : **stratégique** (long terme, direction, irréversible, rare) / **tactique** (moyen terme, cadres) / **opérationnelle** (court terme, quotidienne, réversible). Citer 3 critères.
- **Simon — IMC** : Intelligence (problème, infos), Modélisation (solutions), Choix. **Rationalité limitée** → solution satisfaisante pas optimale. Facteurs de contingence internes / externes.

### Stratégie — démarche et diagnostic
- **Stratégie** : choix à long terme qui engagent l'entreprise pour atteindre ses buts et obtenir un avantage concurrentiel durable. Finalité > but > **objectif** (précis, chiffré, daté).
- **LCAG 1965** : diagnostic → choix → mise en œuvre → contrôle (boucle). **Mintzberg** : délibérée + émergente = réalisée.
- **PESTEL** (macro, indirect) : Politique, Économique, Socioculturel, Technologique, Écologique, Légal → O / M.
- **5 forces de Porter 1979** (micro, secteur) : rivalité, nouveaux entrants, substituts, pouvoir des clients, pouvoir des fournisseurs (+ État). Forces fortes = secteur peu attractif.
- **Ressources** (Penrose) tangibles / intangibles · **compétence distinctive** (Hamel et Prahalad) : valeur perçue, rare, difficile à imiter.
- **Chaîne de valeur 1985** : 5 principales (logistique amont, production, logistique aval, vente, services) + 4 soutien (infrastructure, GRH, développement technologique / SI, achats).
- **FCS** : ce qu'il faut maîtriser pour réussir sur un marché. **SWOT** : forces / faiblesses (internes) + opportunités / menaces (externes).

### Stratégie — choix
- Spécialisation · diversification **liée** (synergies) / **conglomérale** (sans lien) · recentrage · intégration verticale amont / aval · externalisation (→ SLA).
- **Matrice d'Ansoff** : pénétration, développement de produits, développement de marchés, diversification.
- **DAS** : produits avec mêmes clients, concurrents, FCS. **Porter** : domination par les coûts, différenciation, focalisation (niche). Risque : enlisement.
- **BCG** (croissance du marché × part relative) : vedette, vache à lait, dilemme, poids mort.
- **Croissance interne** (organique, lente, contrôlée) / **externe** (fusion, acquisition, rapide, coûteuse) / **conjointe** (alliance, joint-venture, franchise).
- **Internationalisation** : exportation, IDE (investissement direct à l'étranger), contractuelle (licence, franchise).

### Ressources humaines
- **Maslow** : physiologique, sécurité, appartenance, estime, accomplissement · **Herzberg** : facteurs d'hygiène (évitent l'insatisfaction) / moteurs (motivent).
- **Likert** : autoritaire, paternaliste, consultatif, participatif. GEPP, formation, marque employeur, fidélisation, QVCT.

## 5. Auteurs et dates

| Auteur | Idée |
|---|---|
| Penrose 1959 | ressources |
| Ansoff 1965 | niveaux de décision, matrice |
| LCAG 1965 | démarche stratégique |
| Simon | IMC, rationalité limitée |
| Porter 1979 / 1985 | 5 forces / chaîne de valeur, 3 stratégies |
| Freeman 1984 | parties prenantes |
| Mintzberg 1989 | délibérée / émergente, coordination |
| Hamel et Prahalad 1990 | compétences distinctives |
| Schumpeter | destruction créatrice, innovation |
| Sauvy | déversement |
| Toffler | prosommateur |
| Drucker | profit = satisfaction client |
| Musgrave | 3 fonctions de l'État |
| Maslow / Herzberg / Likert | motivation / styles de direction |

**Articles C. civ.** : 1101 contrat · 1102 liberté · 1103 force obligatoire · 1104 bonne foi · 1112-1 information · 1128 validité · 1130 vices · 1137 dol · 1143 dépendance · 1170 obligation essentielle · 1195 imprévision · 1217 inexécution · 1240-1242 responsabilité · 1366 écrit électronique. **C. com.** L420-1 entente, L420-2 abus. **C. pén.** 323-1 STAD.

## 6. Pièges à ne pas faire
- Concurrents dans le PESTEL → **non, 5 forces**.
- Faiblesse (**interne**) ≠ menace (**externe**) : le critère est l'origine, pas le négatif.
- Ressource (ce qu'on a) ≠ compétence (ce qu'on sait faire) ≠ FCS (exigence du marché).
- Nullité (formation) ≠ résolution (exécution). Dol = nullité, pas résolution.
- Clause pénale (forfait) ≠ clause limitative (plafond).
- Logiciel = droit d'auteur, pas brevet. Marque 10 ans renouvelables ≠ brevet 20 ans non renouvelable.
- Externalité = **sans compensation par le prix**.
- Position dominante légale ; **abus** sanctionné.
- Dématérialisation ≠ automatisation ; désintermédiation ≠ réintermédiation.
- CA ≠ volume de transactions ≠ valorisation. Taux d'évolution : diviser par la **valeur de départ**.
- Objectif = **chiffré et daté** ; sinon c'est un but.
- Toujours un **fait du document** dans chaque réponse.
"""

F = []  # flashcards
def card(front, back):
    F.append({"front": front, "back": back.strip()})

card("Comment rédiger une question juridique ?", r"""
==Le syllogisme, en 4 étapes==

```flux
Faits -> Problème de droit -> Règle -> Solution
```

| Étape | Ce que j'écris |
|---|---|
| **Faits** | Qui contre qui, faits **qualifiés** (« M. X, acheteur ») |
| **Problème** | Une question **générale, sans les noms** |
| **Règle** | L'article + ses **conditions** |
| **Solution** | Chaque condition appliquée aux faits → **oui / non** |

> ⚠️ **Piège :** ne jamais recopier le document dans les faits.
""")

card("Comment répondre à une question d'analyse ?", r"""
```flux
Notion définie -> Fait précis du doc (n°) -> Conclusion
```

| Verbe de la consigne | Ce qu'on attend |
|---|---|
| **Identifier** | nommer |
| **Qualifier** | donner le nom juridique / la catégorie |
| **Caractériser** | décrire les traits |
| **Analyser** | expliquer et justifier |
| **Justifier** | prouver avec le document |

> ⚠️ **Piège :** sans fait du dossier, c'est la moitié des points.
""")

card("Quelles formules de calcul connaître ?", r"""
| Calcul | Formule |
|---|---|
| **Taux d'évolution** | (V arrivée − V départ) / ==V départ== × 100 |
| **Part** | partie / total × 100 |
| **Valeur ajoutée** | CA − consommations intermédiaires |
| **Seuil d'abonnement** | coût annuel / prix unitaire → **arrondi au-dessus** |
| **Annuel** | mensuel × 12 |

```flux
Formule -> Calcul posé -> Résultat + unité -> Phrase d'interprétation
```

> 💡 **Exemple :** CA de 200 000 € à 250 000 € → 50 000 / 200 000 × 100 = **+25 %**.
""")

card("Comment construire le développement structuré ?", r"""
| Le sujet commence par… | Plan à faire |
|---|---|
| « Est-ce… ? » | **oui / mais** (dialectique) |
| « En quoi… ? » | **thématique** |

```arbre
Développement structuré
  Introduction : accroche, définitions, problématique, annonce du plan
  2 parties × 2 sous-parties : chaque argument = notion + exemple
  Conclusion : réponse nuancée + ouverture
```
""")

card("Qui sont les agents économiques et comment la VA est-elle partagée ?", r"""
**Agent économique** = centre de décision autonome.

| Agent | Rôle |
|---|---|
| Ménages | consommer, épargner |
| Entreprises | produire |
| Administrations | services non marchands, redistribuer |
| Banques / assurances | financer, couvrir |

==VA = CA − consommations intermédiaires==, partagée entre salariés (salaires), État (impôts), prêteurs (intérêts), actionnaires (dividendes) et l'entreprise (autofinancement).

**PIB** = somme des VA produites sur le territoire en 1 an.
""")

card("Comment une entreprise se finance-t-elle ?", r"""
| Financement | Comment | Exemple |
|---|---|---|
| **Autofinancement** | avec ses propres bénéfices (CAF) | réinvestir ses profits |
| **Indirect** | la **banque** sert d'intermédiaire | crédit bancaire |
| **Direct** | auprès des investisseurs, sans intermédiaire | actions, obligations, levée de fonds |

> 💡 Si l'entreprise est cotée, le financement direct passe par le **marché financier**.
""")

card("Comment fonctionne la concurrence sur un marché ?", r"""
**Marché** = offre + demande → ==prix d'équilibre==. Demande ↑ ou offre ↓ → prix ↑.

**Concurrence pure et parfaite (5 conditions)** : atomicité · homogénéité des produits · libre entrée / sortie · transparence · mobilité des facteurs.

| Structure | Caractéristique |
|---|---|
| **Monopole** | 1 offreur, il fixe le prix |
| **Oligopole** | quelques offreurs, risque d'**entente** |
| **Concurrence monopolistique** | produits **différenciés** |

**Barrière à l'entrée** : capital, brevet, réglementation, effet de réseau.
""")

card("Quelles sont les défaillances du marché ?", r"""
| Défaillance | Définition | Exemple | Solution |
|---|---|---|---|
| **Externalité** | effet sur autrui ==sans compensation par le prix== | pollution (−), formation (+) | taxe, norme, quotas / subvention |
| **Asymétrie d'info** | une partie en sait plus | voiture d'occasion | garantie, label |
| **Bien collectif** | non rival + non exclusif | éclairage public | produit par l'État |

> 📌 Asymétrie : **antisélection** = avant le contrat · **aléa moral** = après.
""")

card("Quel est le rôle de l'État dans l'économie ?", r"""
**Musgrave : 3 fonctions**

| Fonction | But |
|---|---|
| **Allocation** | fournir les biens collectifs |
| **Redistribution** | réduire les inégalités |
| **Stabilisation** | croissance, emploi, prix |

| Politique | Qui | Outils |
|---|---|---|
| **Budgétaire** | l'État | dépenses, impôts |
| **Monétaire** | la BCE | taux directeurs, objectif ==inflation 2 %== |

**Régulation** : Autorité de la concurrence, ARCEP, CNIL.
""")

card("Numérique : quelles notions ne pas confondre ?", r"""
| Notion | Ce que ça veut dire |
|---|---|
| **Dématérialisation** | papier → numérique (PDF par mail) |
| **Automatisation** | traitement **sans humain** |
| **Désintermédiation** | un intermédiaire **disparaît** |
| **Réintermédiation** | un **nouvel** intermédiaire arrive (plateforme) |
| **Marché biface** | 2 groupes, une face gratuite (Doctolib) |
| **Freemium** | gratuit + premium → **taux de conversion** |
| **Licorne** | start-up non cotée > 1 Md$ |

> ⚠️ **Piège :** un PDF envoyé par mail est dématérialisé, **pas** automatisé.
""")

card("Travail et innovation : l'essentiel", r"""
| Chômage | Cause |
|---|---|
| **Frictionnel** | transition entre 2 emplois |
| **Conjoncturel** | crise économique |
| **Structurel** | compétences inadaptées |

**Flexibilité** : quantitative externe (CDD, intérim) · interne (horaires) · qualitative (polyvalence).

```flux
Innovation -> Destruction créatrice (Schumpeter) -> Déversement des emplois (Sauvy)
```

Compétitivité **prix** (coûts, change) / **hors prix** (qualité, innovation, image).
""")

card("Quelles conditions pour qu'un contrat soit valable ?", r"""
==Offre (précise + ferme) + acceptation = contrat formé==

```arbre
Validité du contrat (art. 1128)
  Consentement des parties
    Vices (1130) : erreur, dol (1137), violence (1143)
  Capacité de contracter
  Contenu licite et certain
```

| Nullité | Protège | Exemple |
|---|---|---|
| **Relative** | une partie | vice du consentement (5 ans) |
| **Absolue** | l'intérêt général | contenu illicite |

> 📌 Nullité = le contrat est censé **n'avoir jamais existé** (restitutions).
""")

card("Que faire quand un contrat n'est pas exécuté ?", r"""
**Les 5 sanctions de l'inexécution (art. 1217)**
1. Exception d'inexécution
2. Exécution forcée
3. Réduction du prix
4. **Résolution** (fin du contrat)
5. Dommages et intérêts

| | Nullité | Résolution |
|---|---|---|
| Problème | **formation** | **exécution** |
| Exemple | dol | non-livraison |

> ⚠️ **Piège :** le dol entraîne la **nullité**, pas la résolution.
""")

card("Quelles clauses du contrat connaître ?", r"""
| Clause | Effet |
|---|---|
| **Pénale** | indemnité **forfaitaire** fixée d'avance |
| **Limitative de responsabilité** | **plafonne** les dommages et intérêts |
| **Réserve de propriété** | propriété transférée au paiement complet |
| **Résolutoire** | fin automatique si inexécution |
| **Attributive de compétence** | tribunal choisi (entre commerçants) |

> ⚠️ **Piège :** la clause limitative est écartée en cas de **faute lourde ou dolosive** (art. 1170).

**Obligation de moyens** (faute à prouver) / **de résultat** (seul le résultat compte).
""")

card("Quand engage-t-on sa responsabilité civile ?", r"""
```flux
Fait générateur + Dommage + Lien de causalité -> Réparation (dommages et intérêts)
```

| Responsabilité | Cas |
|---|---|
| **Contractuelle** | inexécution d'un contrat |
| **Extracontractuelle** | faute (1240), négligence (1241), fait d'autrui / des choses (1242) |

**Exonération** : force majeure (==imprévisible, irrésistible, extérieure==), faute de la victime, fait d'un tiers.
""")

card("Comment protéger une création (propriété intellectuelle) ?", r"""
| Droit | Protège | Durée |
|---|---|---|
| **Droit d'auteur** | œuvre, **logiciel**, site web | sans dépôt, 70 ans après la mort |
| **Brevet** | invention technique | dépôt INPI, 20 ans |
| **Marque** | nom, logo, son | INPI, 10 ans **renouvelables** |
| **Dessins et modèles** | apparence d'un produit | 5 ans, max 25 ans |
| **Base de données** | investissement du producteur | 15 ans |

> ⚠️ **Piège :** un logiciel est protégé par le **droit d'auteur**, pas par un brevet. Créé par un salarié → droits à l'**employeur**.
""")

card("RGPD : que faut-il retenir ?", r"""
**Donnée personnelle** : identifie une personne (nom, IP, photo). **Sensible** : santé, opinions, religion, syndicat, biométrie… → ==interdite sauf exception==.

| Principes | Droits des personnes |
|---|---|
| licéité, **finalité**, **minimisation** | accès, rectification |
| exactitude, durée limitée | effacement, opposition |
| sécurité, accountability | **portabilité**, limitation |

> 📌 Sanction : **4 % du CA mondial ou 20 M€**. Fuite de données → CNIL sous **72 h**.
""")

card("Concurrence, sociétés et travail : l'essentiel", r"""
**Interdits** : entente (L420-1) et **abus** de position dominante (L420-2).

| Forme | Particularité |
|---|---|
| **EI** | patrimoine pro séparé (depuis 2022) |
| **EURL / SARL** | gérant, responsabilité limitée aux apports |
| **SAS / SASU** | statuts libres, président |
| **SA** | 37 000 € minimum, cotable |

**Contrat de travail** = prestation + rémunération + ==lien de subordination== (requalification possible : Uber 2020).

> ⚠️ **Piège :** être en position dominante est **légal**, seul l'abus est sanctionné.
""")

card("Organisation et décision : l'essentiel", r"""
**Finalités** : économique · sociale · sociétale (RSE). **Partie prenante** (Freeman) : affecte ou est affectée par l'entreprise.

| Niveau (Ansoff) | Horizon | Exemple |
|---|---|---|
| **Stratégique** | long terme, irréversible | s'implanter à l'étranger |
| **Tactique** | moyen terme | choisir un fournisseur |
| **Opérationnel** | court terme, réversible | planning de la semaine |

```flux
Intelligence -> Modélisation -> Choix
```
Simon (IMC) : **rationalité limitée** → solution satisfaisante, pas optimale.
""")

card("Comment faire le diagnostic stratégique ?", r"""
```flux
Diagnostic -> Choix -> Mise en œuvre -> Contrôle
```
(démarche LCAG, en boucle)

```matrice
**Forces** : interne, positif | **Faiblesses** : interne, négatif
**Opportunités** : externe, positif | **Menaces** : externe, négatif
```

| Outil | Analyse |
|---|---|
| **PESTEL** | environnement **macro** (Politique, Éco, Socio, Techno, Écolo, Légal) |
| **5 forces de Porter** | le **secteur** : rivalité, entrants, substituts, clients, fournisseurs |

> ⚠️ **Piège :** les concurrents vont dans les 5 forces, **jamais** dans le PESTEL.
""")

card("Quels choix stratégiques une entreprise peut-elle faire ?", r"""
**Matrice d'Ansoff** (produits × marchés)
```matrice
**Pénétration** : produit actuel, marché actuel | **Développement de produits** : nouveau produit
**Développement de marchés** : nouveau marché | **Diversification** : nouveau produit + nouveau marché
```

**Matrice BCG**
```matrice
**Vedette** : forte croissance, forte part | **Dilemme** : forte croissance, faible part
**Vache à lait** : faible croissance, forte part | **Poids mort** : faible croissance, faible part
```

**Porter** : coûts · différenciation · focalisation. **Croissance** : interne (lente) · externe (rachat, rapide) · conjointe (alliance).
""")

card("Quels auteurs citer et pour quoi ?", r"""
| Auteur | Idée |
|---|---|
| **Penrose** (1959) | ressources |
| **Ansoff** (1965) | niveaux de décision, matrice |
| **Simon** | rationalité limitée (IMC) |
| **Porter** (1979 / 1985) | 5 forces, chaîne de valeur |
| **Freeman** (1984) | parties prenantes |
| **Mintzberg** (1989) | stratégie émergente |
| **Hamel et Prahalad** (1990) | compétences distinctives |
| **Schumpeter** | destruction créatrice |
| **Musgrave** | 3 fonctions de l'État |
| **Herzberg** | facteurs d'hygiène / moteurs |
""")

Q = []  # quiz
def qcm(q, choices, answer, explain, context=""):
    Q.append({"type": "qcm", "context": context, "q": q, "choices": choices, "answer": answer, "explain": explain})
def multi(q, choices, answers, explain, context=""):
    Q.append({"type": "multi", "context": context, "q": q, "choices": choices, "answers": answers, "explain": explain})
def vf(q, answer, explain, context=""):
    Q.append({"type": "vf", "context": context, "q": q, "answer": answer, "explain": explain})
def trou(q, answers, explain, context=""):
    Q.append({"type": "trou", "context": context, "q": q, "answers": answers, "explain": explain})
def ordre(q, items, explain, context=""):
    Q.append({"type": "ordre", "context": context, "q": q, "items": items, "explain": explain})
def assoc(q, pairs, explain, context=""):
    Q.append({"type": "assoc", "context": context, "q": q, "pairs": [{"left": a, "right": b} for a, b in pairs], "explain": explain})

# --- Méthodes ---
ordre("Remets dans l'ordre les étapes de la question juridique.",
      ["Qualifier juridiquement les faits", "Poser le problème de droit", "Énoncer la règle de droit et ses conditions", "Appliquer la règle aux faits et conclure"],
      "C'est le syllogisme : faits → problème → règle → solution.")
vf("Dans le problème de droit, on cite le nom des parties pour être précis.", False,
   "Faux : le problème de droit est une question générale, sans les noms (« Un mensonge déterminant permet-il d'annuler un contrat ? »).")
qcm("Le chiffre d'affaires passe de 200 000 € à 250 000 €. Quel est le taux d'évolution ?",
    ["+20 %", "+25 %", "+50 %", "+125 %"], 1,
    "(250 000 − 200 000) / 200 000 × 100 = +25 %. Le piège (+20 %) vient d'une division par la valeur d'arrivée au lieu de celle de départ.")
qcm("Un logiciel coûte 1 200 € par an en abonnement, ou 45 € par utilisation. À partir de combien d'utilisations par an l'abonnement est-il plus avantageux ?",
    ["26 utilisations", "27 utilisations", "25 utilisations", "30 utilisations"], 1,
    "Seuil = 1 200 / 45 = 26,7. On arrondit toujours à l'entier supérieur : 27 utilisations.")
assoc("Associe chaque verbe de consigne à ce qu'on attend.",
      [("Identifier", "Nommer"), ("Qualifier", "Donner le nom juridique ou la catégorie"), ("Caractériser", "Décrire les traits"), ("Justifier", "Prouver avec le document")],
      "Ces verbes ne demandent pas la même chose : lire la consigne évite de perdre des points.")
qcm("Le sujet de l'argumentation est : « Le numérique fait-il disparaître les intermédiaires ? ». Quel plan choisir ?",
    ["Un plan thématique", "Un plan oui / mais (dialectique)", "Un plan chronologique", "Une liste d'arguments sans parties"], 1,
    "Une question fermée (« Est-ce… ? », « …-t-il ? ») appelle un plan dialectique : oui (désintermédiation) / mais (réintermédiation par les plateformes).")

# --- Économie ---
multi("Lesquelles sont des conditions de la concurrence pure et parfaite ?",
      ["Atomicité du marché", "Homogénéité des produits", "Barrières à l'entrée élevées", "Transparence de l'information", "Effet de réseau"], [0, 1, 3],
      "Les 5 conditions : atomicité, homogénéité, libre entrée / sortie, transparence, mobilité des facteurs. Les barrières à l'entrée et l'effet de réseau s'y opposent.")
qcm("De quoi s'agit-il ?", ["Une externalité positive", "Une externalité négative", "Un bien collectif", "Une économie d'échelle"], 0,
    "Un agent (le data center) a un effet favorable sur un autre (la piscine) sans compensation par le prix : c'est une externalité positive.",
    context="Un data center rejette de la chaleur qui sert à chauffer gratuitement une piscine municipale voisine.")
qcm("Quel outil permet d'internaliser une externalité négative ?",
    ["Une subvention", "Une taxe pollueur-payeur", "Un label qualité", "Une garantie constructeur"], 1,
    "On internalise une externalité négative par une taxe (pigouvienne), une norme ou un marché de quotas. La subvention sert pour les externalités positives.")
qcm("Le vendeur connaît l'état réel de la voiture, l'acheteur non. De quoi s'agit-il ?",
    ["Une externalité", "Une asymétrie d'information", "Un monopole", "Un aléa moral"], 1,
    "Une partie en sait plus que l'autre avant le contrat : asymétrie d'information (qui peut provoquer de l'antisélection). L'aléa moral, lui, survient après le contrat.",
    context="Marché des voitures d'occasion.")
qcm("Un bien non rival et non exclusif, comme l'éclairage public, est…",
    ["Un bien collectif", "Un bien privé", "Une externalité", "Un monopole naturel"], 0,
    "Non rival (mon usage ne prive pas les autres) + non exclusif (on ne peut empêcher personne d'en profiter) = bien collectif, produit par l'État.")
vf("Envoyer ses factures en PDF par e-mail est un exemple d'automatisation.", False,
   "Faux : c'est de la dématérialisation (papier → numérique). L'automatisation suppose un traitement sans humain, avec un format structuré.")
qcm("Les patients prennent rendez-vous gratuitement, les médecins paient un abonnement. Quel est ce modèle ?",
    ["Un marché biface", "Une place de marché", "Un modèle freemium", "Une désintermédiation"], 0,
    "La plateforme sert deux groupes d'utilisateurs ; une face paie, l'autre est gratuite : c'est un marché biface.",
    context="Doctolib met en relation patients et médecins.")
trou("Une start-up non cotée valorisée à plus d'1 milliard de dollars est une ___.", ["licorne", "une licorne"],
     "Licorne > 1 Md$, décacorne > 10 Md$. Attention : la valorisation n'est pas le chiffre d'affaires.")
assoc("Associe chaque situation au type de chômage.",
      [("Un salarié démissionne et cherche un nouveau poste", "Frictionnel"), ("Une crise fait chuter les commandes", "Conjoncturel"), ("Les compétences ne correspondent plus aux emplois proposés", "Structurel")],
      "Frictionnel = transition, conjoncturel = crise, structurel = inadéquation des compétences.")
qcm("Qui est chargé de la politique monétaire dans la zone euro ?",
    ["Le gouvernement", "La BCE", "L'Autorité de la concurrence", "Le Parlement européen"], 1,
    "La BCE agit sur les taux directeurs avec un objectif d'inflation de 2 %. La politique budgétaire (dépenses, impôts) relève de l'État.")

# --- Droit ---
qcm("Sur quel fondement Mme Durand peut-elle agir ?",
    ["Le dol (art. 1137 C. civ.)", "L'erreur sur la valeur", "La violence (art. 1143)", "L'imprévision (art. 1195)"], 0,
    "Le vendeur a volontairement gardé le silence pour la tromper, et sans cela elle n'aurait pas acheté : manœuvre + intention de tromper + caractère déterminant = dol.",
    context="Mme Durand achète une voiture d'occasion. Le vendeur lui a volontairement caché que le véhicule avait été gravement accidenté ; elle ne l'aurait jamais acheté si elle l'avait su.")
qcm("Le dol étant établi, quelle sanction Mme Durand obtiendra-t-elle ?",
    ["La résolution du contrat", "La nullité relative du contrat", "Uniquement une réduction du prix", "La nullité absolue du contrat"], 1,
    "Le dol vicie le consentement, une condition de formation → nullité. Elle est relative car elle protège une partie. La résolution sanctionne un problème d'exécution.",
    context="Suite du cas : le dol du vendeur est reconnu.")
multi("Quelles sont les 3 conditions de validité d'un contrat (art. 1128 C. civ.) ?",
      ["Le consentement des parties", "La capacité de contracter", "Un contenu licite et certain", "Un écrit signé", "La présence d'un avocat"], [0, 1, 2],
      "Art. 1128 : consentement, capacité, contenu licite et certain. L'écrit n'est pas une condition de validité (sauf exceptions).")
qcm("Alpha veut mettre fin au contrat. Quelle sanction doit-elle demander ?",
    ["La nullité", "La résolution", "L'imprévision", "La clause attributive de compétence"], 1,
    "Le contrat était valablement formé mais n'est pas exécuté : c'est la résolution (art. 1217). La nullité sanctionne un défaut de formation.",
    context="Le prestataire informatique de la société Alpha ne livre jamais le logiciel commandé et payé.")
qcm("Quelle est cette clause ?", ["Une clause limitative de responsabilité", "Une clause pénale", "Une clause résolutoire", "Une clause de réserve de propriété"], 1,
    "Une indemnité forfaitaire fixée d'avance, quel que soit le préjudice réel, est une clause pénale (le juge peut la réduire si elle est excessive).",
    context="Le contrat prévoit : « En cas de retard, le prestataire versera 500 € par jour, quel que soit le préjudice subi. »")
vf("Une clause limitative de responsabilité s'applique même si le prestataire a commis une faute lourde.", False,
   "Faux : elle est écartée en cas de faute lourde ou dolosive, ou si elle vide l'obligation essentielle de sa substance (art. 1170).")
multi("Quelles sont les conditions de la responsabilité civile ?",
      ["Un fait générateur", "Un dommage", "Un lien de causalité", "Un contrat écrit", "Une intention de nuire"], [0, 1, 2],
      "Il faut les trois : fait générateur + dommage (certain, direct, personnel) + lien de causalité. L'intention de nuire n'est pas exigée.")
qcm("Qui détient les droits patrimoniaux sur ce logiciel, et sur quel fondement ?",
    ["Le salarié, grâce à un brevet", "L'employeur, au titre du droit d'auteur", "Le salarié, au titre du droit d'auteur", "L'employeur, grâce à un dépôt de marque"], 1,
    "Un logiciel est protégé par le droit d'auteur (pas par brevet). Créé par un salarié dans l'exercice de ses fonctions, ses droits patrimoniaux reviennent à l'employeur.",
    context="Un développeur salarié crée un logiciel de gestion dans le cadre de ses fonctions.")
assoc("Associe chaque droit de propriété intellectuelle à sa durée de protection.",
      [("Droit d'auteur", "70 ans après la mort de l'auteur, sans dépôt"), ("Brevet", "20 ans, dépôt à l'INPI"), ("Marque", "10 ans, renouvelable à l'infini"), ("Base de données", "15 ans (droit sui generis)")],
      "Attention au piège classique : la marque est renouvelable, le brevet ne l'est pas.")
qcm("Dans quel délai doit-elle prévenir la CNIL ?", ["24 heures", "72 heures", "8 jours", "1 mois"], 1,
    "Une violation de données personnelles doit être notifiée à la CNIL dans les 72 heures.",
    context="Une entreprise découvre que les données de ses clients ont été piratées.")
multi("Lesquelles sont des données sensibles au sens du RGPD (art. 9) ?",
      ["L'état de santé", "L'adresse IP", "Les convictions religieuses", "L'adresse e-mail", "L'appartenance syndicale"], [0, 2, 4],
      "L'IP et l'e-mail sont des données personnelles, mais pas sensibles. Les données sensibles (santé, religion, syndicat, opinions, biométrie…) sont interdites sauf exception.")
vf("Une entreprise est sanctionnée du seul fait qu'elle est en position dominante.", False,
   "Faux : la position dominante est légale. C'est son abus qui est sanctionné (art. L420-2 C. com.) : vente liée, prix prédateurs…")
qcm("Que peut-il demander en justice ?",
    ["La requalification en contrat de travail", "Le statut de SAS", "L'application d'une clause pénale", "Une licence d'exploitation"], 0,
    "Si la plateforme donne des ordres, contrôle et sanctionne, il existe un lien de subordination : le contrat peut être requalifié en contrat de travail (arrêt Uber, 2020).",
    context="Un livreur « indépendant » travaille pour une plateforme qui fixe ses tarifs, ses horaires et peut le sanctionner.")
trou("Un contrat de travail suppose une prestation, une rémunération et un lien de ___.", ["subordination"],
     "Le lien de subordination (pouvoir de donner des ordres, de contrôler et de sanctionner) distingue le salarié de l'indépendant.")

# --- Management ---
qcm("À quel niveau de décision (Ansoff) correspond ce choix ?", ["Opérationnel", "Tactique", "Stratégique", "Administratif"], 2,
    "Long terme, engage toute l'entreprise, difficilement réversible et prise par la direction : décision stratégique.",
    context="La direction décide de s'implanter en Asie pour les 10 prochaines années.")
ordre("Remets dans l'ordre la démarche stratégique (modèle LCAG).",
      ["Diagnostic", "Choix stratégique", "Mise en œuvre", "Contrôle"],
      "LCAG (1965) : diagnostic → choix → mise en œuvre → contrôle, en boucle.")
ordre("Remets dans l'ordre les étapes du modèle IMC de Simon.",
      ["Intelligence : identifier le problème, collecter l'information", "Modélisation : construire les solutions possibles", "Choix : retenir une solution"],
      "Avec une rationalité limitée, le décideur retient une solution satisfaisante, pas forcément optimale.")
qcm("Dans quel outil d'analyse classer ce fait ?", ["Le PESTEL", "Les 5 forces de Porter", "La chaîne de valeur", "La matrice BCG"], 1,
    "Un concurrent relève du secteur (micro) : menace de nouveaux entrants dans les 5 forces de Porter. Les concurrents ne vont jamais dans le PESTEL.",
    context="Un nouveau concurrent arrive sur le marché avec des prix très bas.")
vf("Une faiblesse se distingue d'une menace parce que la menace est plus grave.", False,
   "Faux : le critère est l'origine. Faiblesse = interne à l'entreprise ; menace = externe (environnement).")
assoc("Associe chaque case de la matrice BCG à sa situation.",
      [("Vedette", "Marché en forte croissance, forte part de marché"), ("Vache à lait", "Marché en faible croissance, forte part de marché"), ("Dilemme", "Marché en forte croissance, faible part de marché"), ("Poids mort", "Marché en faible croissance, faible part de marché")],
      "BCG = croissance du marché × part de marché relative.")
qcm("Quel est ce mode de croissance ?", ["Croissance interne", "Croissance externe", "Croissance conjointe", "Croissance organique"], 1,
    "Racheter une autre entreprise (fusion, acquisition) = croissance externe : rapide mais coûteuse. L'interne (organique) est lente et contrôlée ; la conjointe passe par une alliance.",
    context="L'entreprise rachète l'un de ses concurrents.")
trou("« Augmenter de 15 % le CA d'ici décembre 2027 » est un ___, car il est chiffré et daté.", ["objectif", "un objectif"],
     "Finalité > but > objectif. Sans chiffre ni date, ce ne serait qu'un but.")
assoc("Associe chaque auteur à son idée.",
      [("Schumpeter", "Destruction créatrice"), ("Freeman", "Parties prenantes"), ("Simon", "Rationalité limitée"), ("Toffler", "Prosommateur"), ("Herzberg", "Facteurs d'hygiène et facteurs moteurs")],
      "Citer le bon auteur montre au correcteur que la notion est maîtrisée.")
qcm("Quelle stratégie (matrice d'Ansoff) l'entreprise suit-elle ?",
    ["Pénétration de marché", "Développement de produits", "Développement de marchés", "Diversification"], 2,
    "Même produit, nouveau marché (géographique ou de clientèle) = développement de marchés.",
    context="Une entreprise française vend son logiciel de paie, inchangé, en Belgique et en Suisse.")

data = {"title": TITLE, "subject": SUBJECT, "course": COURSE.strip(), "flashcards": F, "quiz": Q}
out = os.path.join(os.path.dirname(__file__), "..", "..", "data", "cejm.json")
with open(out, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=1)
types = {}
for q in Q:
    types[q["type"]] = types.get(q["type"], 0) + 1
print(f"{len(F)} flashcards, {len(Q)} questions {types}")
