#!/usr/bin/env python3
# Source du cours prêt à l'emploi « CGE — Le vrai du faux » → data/cge-vrai-faux.json
# Usage : python3 scripts/packs/cge_vrai_faux.py
import json, os

TITLE = "CGE — Le vrai du faux"
SUBJECT = "Culture Générale"

COURSE = r"""
## Comprendre le thème

« Le vrai du faux », c'est la difficulté à **distinguer** ce qui est vrai de ce qui ne l'est pas — et le constat que **le faux n'est pas toujours l'ennemi du vrai**. Quatre grands axes reviennent dans les sujets :

| Axe | Idée | Références utiles |
|---|---|---|
| **1. Le faux qui trompe** | mensonges, manipulations, fausses informations | Le Corbeau et le Renard, 1984, deepfake du pape, Derrière nos écrans de fumée, Don't Look Up, Among Us |
| **2. Le faux qui dit vrai** | la fiction, la satire et le masque révèlent une vérité | Barbie, GTA VI, Les Habits neufs de l'empereur, Romain Gary / Émile Ajar |
| **3. De vraies émotions pour du faux** | on s'attache à des personnages ou des êtres artificiels | GTA VI, Her, Detroit: Become Human, The Last of Us |
| **4. Une vérité difficile à atteindre** | illusion, point de vue, doute | Allégorie de la caverne, The Truman Show, Inception, Anatomie d'une chute, D'après une histoire vraie, Black Mirror |

> 💡 **Méthode :** une référence s'utilise en 3 temps : **présenter** (titre, auteur, date, genre) → **résumer** en une phrase utile → **relier** clairement à ton argument.

## 1. Le faux qui trompe

### Jean de La Fontaine, « Le Corbeau et le Renard » (Fables, 1668)
Le Renard flatte le Corbeau sur son plumage et sa voix pour lui faire lâcher son fromage. Morale : « Apprenez que tout flatteur / Vit aux dépens de celui qui l'écoute. »
**Intérêt :** le mensonge le plus efficace est celui qui **dit ce qu'on a envie d'entendre**. C'est le principe de la flatterie, de la publicité, et des contenus qui flattent nos opinions sur les réseaux.

### George Orwell, *1984* (roman, 1949)
Winston Smith travaille au **ministère de la Vérité**, où il réécrit les archives pour qu'elles collent à la version officielle du Parti. Slogans : « La guerre, c'est la paix. La liberté, c'est l'esclavage. L'ignorance, c'est la force. » Le Parti finit par faire admettre que **2 + 2 = 5**.
**Intérêt :** le pouvoir qui contrôle l'information **fabrique la vérité**. Référence incontournable sur la propagande et la réécriture des faits.

### L'image du pape François en doudoune (mars 2023)
Une image du pape en doudoune blanche de luxe, générée avec l'IA **Midjourney**, devient virale ; beaucoup d'internautes la croient vraie.
**Intérêt :** avec l'IA générative, **voir n'est plus croire**. L'image, longtemps considérée comme une preuve, peut être entièrement fausse et pourtant très crédible.

### *Derrière nos écrans de fumée* (documentaire Netflix, Jeff Orlowski, 2020)
D'anciens ingénieurs de Google ou Facebook (dont Tristan Harris) expliquent que les algorithmes nous montrent ce qui nous retient le plus longtemps, ce qui enferme dans des **bulles** et favorise la désinformation. Une étude du MIT (revue *Science*, 2018) a montré que les fausses informations se diffusent environ **six fois plus vite** que les vraies sur Twitter.
**Intérêt :** le faux circule mieux que le vrai parce qu'il est plus **surprenant et émotionnel**.

### *Don't Look Up* (film, Adam McKay, 2021)
Deux astronomes (Leonardo DiCaprio, Jennifer Lawrence) découvrent qu'une comète va détruire la Terre. Médias et dirigeants minimisent, tournent l'alerte en dérision ou en font un spectacle ; une partie de la population scande « Don't look up ».
**Intérêt :** satire du **déni** face à une vérité scientifique (allégorie du climat) : une vérité dérangeante peut être rejetée au profit d'un récit plus confortable.

### *Among Us* (jeu vidéo, Innersloth, 2018, succès mondial en 2020)
Dans un vaisseau, des « imposteurs » sabotent la mission et éliminent l'équipage en se faisant passer pour des coéquipiers. Les joueurs débattent et votent pour démasquer les menteurs.
**Intérêt :** un jeu entièrement fondé sur le **mensonge et la détection du mensonge**. Il montre qu'on juge souvent sur l'aplomb et les apparences plutôt que sur les preuves.

## 2. Le faux qui dit vrai

### Hans Christian Andersen, « Les Habits neufs de l'empereur » (conte, 1837)
Deux escrocs prétendent tisser une étoffe invisible aux yeux des sots. Personne n'ose dire qu'il ne voit rien, jusqu'à ce qu'un enfant s'écrie : « Mais il n'a pas d'habit du tout ! »
**Intérêt :** un **mensonge collectif** tient par peur du regard des autres ; la vérité vient de celui qui n'a rien à perdre.

### *Barbie* (film, Greta Gerwig, 2023)
Barbie quitte le monde parfait de Barbieland pour le « monde réel » et découvre qu'il ne ressemble pas à l'image idéale de la poupée. Le monologue de Gloria (America Ferrera) énumère les injonctions contradictoires faites aux femmes.
**Intérêt :** un univers en plastique, totalement artificiel, sert à dire des **vérités très concrètes** sur la société. La fiction révèle le réel.

### *GTA VI* (jeu vidéo, Rockstar Games, sortie annoncée en novembre 2026)
D'après les bandes-annonces (2023 et 2025), le jeu suit **Lucia et Jason**, un couple de criminels dans l'État de Leonida, une Floride caricaturale (Vice City). Les bandes-annonces mettent en avant la **relation amoureuse** du couple, façon Bonnie et Clyde, et des vidéos virales de réseaux sociaux qui parodient l'Amérique réelle.
**Intérêt :**
- **Le faux qui dit vrai** : comme toute la série, le jeu est une **satire** : en exagérant la société américaine (réseaux sociaux, argent, violence), il en montre les excès réels.
- **De vraies émotions pour du faux** : le joueur s'attache à Lucia, partage ses choix et peut ressentir de la peur, de la tendresse ou de la tristesse pour un personnage qui n'existe pas. Les philosophes appellent cela le **paradoxe de la fiction**.

> ⚠️ Le jeu sortant fin 2026, appuie-toi sur les bandes-annonces et, si tu y as joué, sur ta propre expérience de la relation avec Lucia : c'est un exemple personnel très apprécié dans l'essai.

### Romain Gary et Émile Ajar
Romain Gary obtient le prix Goncourt en 1956 (*Les Racines du ciel*). En 1975, *La Vie devant soi*, signé **Émile Ajar**, reçoit aussi le Goncourt, alors que ce prix ne peut être attribué qu'une fois au même auteur. La supercherie n'est révélée qu'après la mort de Gary (1980), dans *Vie et mort d'Émile Ajar* (1981).
**Intérêt :** un **faux nom** permet à l'écrivain d'être lu sans préjugés et d'exprimer une part de lui-même : le masque libère une vérité.

## 3. De vraies émotions pour du faux

### *Her* (film, Spike Jonze, 2013)
Theodore (Joaquin Phoenix) tombe amoureux de Samantha, une intelligence artificielle qui n'a qu'une voix (Scarlett Johansson).
**Intérêt :** une relation avec un être artificiel produit des **sentiments bien réels**. Le film pose la question : un amour est-il « faux » si l'autre n'existe pas comme nous ?

### *Detroit: Become Human* (jeu vidéo, Quantic Dream, 2018)
En 2038, des androïdes au service des humains deviennent « déviants » : ils semblent éprouver de la peur, de l'amour, de la colère. Le joueur incarne trois d'entre eux (Kara, Connor, Markus) et fait des choix qui changent l'histoire.
**Intérêt :** où s'arrête la **simulation** et où commence l'émotion vraie ? Le joueur lui-même finit par s'attacher à des machines.

### *The Last of Us* (jeu vidéo, Naughty Dog, 2013 ; série HBO, 2023)
Joel escorte Ellie, immunisée contre l'infection. À la fin, il l'empêche d'être sacrifiée pour créer un vaccin, puis lui **ment** : il affirme qu'aucun remède n'était possible. Ellie lui demande de jurer ; il jure.
**Intérêt :** un **mensonge par amour**. Le joueur, qui sait la vérité, est partagé : le mensonge peut-il être justifié quand il protège ?

## 4. Une vérité difficile à atteindre

### Platon, l'allégorie de la caverne (*La République*, livre VII, vers 375 av. J.-C.)
Des prisonniers enchaînés dans une caverne ne voient que des ombres projetées sur un mur et les prennent pour la réalité. Celui qui sort découvre le vrai monde, mais les autres refusent de le croire.
**Intérêt :** texte fondateur : nous pouvons prendre des **apparences pour la vérité**, et sortir de l'illusion est difficile et inconfortable.

### *The Truman Show* (film, Peter Weir, 1998)
Truman (Jim Carrey) découvre que toute sa vie est une émission de télévision filmée dans un décor géant, où tous ses proches sont des acteurs. Le producteur, Christof, résume : « Nous acceptons la réalité du monde qui nous est présentée. »
**Intérêt :** version moderne de la caverne de Platon. Une vie entièrement **mise en scène** peut sembler vraie tant qu'on ne la questionne pas.

### *Inception* (film, Christopher Nolan, 2010)
Cobb (Leonardo DiCaprio) s'infiltre dans les rêves des autres. Pour savoir s'il rêve, il fait tourner une **toupie** : dans un rêve, elle ne s'arrête jamais. Le film se termine sur la toupie qui tourne, sans qu'on sache si elle tombe.
**Intérêt :** il peut être **impossible de prouver** que l'on n'est pas dans l'illusion ; Cobb choisit de ne plus regarder.

### *Anatomie d'une chute* (film, Justine Triet, 2023, Palme d'or)
Samuel est retrouvé mort au pied de son chalet ; sa femme, Sandra, est accusée. Au procès, chaque témoignage propose une version différente du couple. Leur fils Daniel, malvoyant, s'entend dire que lorsqu'on ne peut pas savoir, il faut **décider** de ce que l'on croit.
**Intérêt :** la **vérité judiciaire** n'est pas forcément la vérité des faits ; elle est une construction à partir de récits.

### Delphine de Vigan, *D'après une histoire vraie* (roman, 2015, prix Renaudot)
La narratrice, une romancière nommée Delphine, est peu à peu manipulée par L., une femme qui l'incite à écrire « la vérité » plutôt que de la fiction. Le lecteur ne sait jamais ce qui est réel.
**Intérêt :** **autofiction** : le livre joue sur la frontière entre vécu et invention, et montre qu'un récit « vrai » est toujours construit.

### *Black Mirror*, « Joan Is Awful » (série Netflix, saison 6, 2023)
Joan découvre qu'une plateforme diffuse une série sur sa propre vie, jouée par une version de Salma Hayek générée par IA, à partir de ses données personnelles (elle avait accepté les conditions d'utilisation).
**Intérêt :** les **deepfakes** et les données permettent de fabriquer une version fausse mais crédible de nous-mêmes. Qui détient alors la vérité sur notre vie ?
"""

F = []
def card(front, back):
    F.append({"front": front, "back": back.strip()})

card("Quels sont les 4 grands axes du thème « Le vrai du faux » ?", r"""
```arbre
Le vrai du faux
  1. Le faux qui trompe : mensonge, manipulation, fake news
  2. Le faux qui dit vrai : fiction, satire, masque
  3. De vraies émotions pour du faux : personnages, IA
  4. Une vérité difficile à atteindre : illusion, point de vue
```

> 📌 ==Le faux n'est pas toujours l'ennemi du vrai== : c'est l'idée qui nuance le mieux un essai.
""")

card("Comment utiliser une référence dans l'essai ?", r"""
```flux
Présenter l'œuvre -> La résumer en 1 phrase -> La relier à l'argument
```

| Étape | Exemple |
|---|---|
| **Présenter** | *Barbie*, film de Greta Gerwig (2023) |
| **Résumer** | Barbie quitte un monde parfait pour le monde réel |
| **Relier** | ==la fiction révèle des vérités sur la société== |

> ⚠️ **Piège :** raconter toute l'histoire sans dire en quoi elle prouve ton idée.
""")

card("🎮 GTA VI (Lucia et Jason) : quel lien avec le vrai et le faux ?", r"""
🎮 **Jeu vidéo**, Rockstar Games · sortie annoncée en novembre 2026

**L'histoire :** Lucia et Jason, couple de criminels façon Bonnie et Clyde, dans Leonida, une Floride caricaturée.

| Axe | Idée |
|---|---|
| **De vraies émotions** | on s'attache à Lucia, ==on ressent pour quelqu'un qui n'existe pas== (paradoxe de la fiction) |
| **Le faux qui dit vrai** | la satire exagère réseaux sociaux, argent, violence pour montrer l'Amérique réelle |

> 💡 **Dans l'essai :** « Un personnage virtuel comme Lucia peut provoquer des émotions bien réelles. »
""")

card("🎮 The Last of Us : quel lien avec le vrai et le faux ?", r"""
🎮 **Jeu vidéo**, Naughty Dog, 2013 · 📺 série HBO, 2023

**L'histoire :** Joel sauve Ellie, immunisée, au lieu de la laisser sacrifier pour un vaccin, puis ==lui jure qu'aucun remède n'était possible==.

**Lien :** un **mensonge par amour**. Le joueur connaît la vérité et se demande si ce mensonge est justifiable.

> 💡 **Dans l'essai :** « Le mensonge de Joel montre qu'on peut mentir pour protéger. »
""")

card("🎮 Detroit: Become Human : quel lien avec le vrai et le faux ?", r"""
🎮 **Jeu vidéo**, Quantic Dream, 2018

**L'histoire :** en 2038, des androïdes deviennent « déviants » et semblent ressentir peur, amour, colère. Le joueur fait leurs choix.

**Lien :** ==simulation ou émotion vraie ?== La frontière se brouille, et le joueur s'attache à des machines.

> 💡 **Dans l'essai :** « Des émotions simulées peuvent susciter une empathie réelle. »
""")

card("🎮 Among Us : quel lien avec le vrai et le faux ?", r"""
🎮 **Jeu vidéo**, Innersloth, 2018 (phénomène mondial en 2020)

**Le principe :** des **imposteurs** mentent pour se faire passer pour l'équipage ; les joueurs débattent et votent pour les démasquer.

**Lien :** un jeu fondé sur ==le mensonge et sa détection==. On juge souvent sur l'aplomb plutôt que sur les preuves.

> 💡 **Dans l'essai :** « Comme dans *Among Us*, le menteur le plus sûr de lui convainc souvent le groupe. »
""")

card("🎬 The Truman Show : quel lien avec le vrai et le faux ?", r"""
🎬 **Film**, Peter Weir, 1998 (Jim Carrey)

**L'histoire :** Truman découvre que ==toute sa vie est une émission de télé==, dans un décor où ses proches sont des acteurs.

**Lien :** une vie entièrement mise en scène paraît vraie tant qu'on ne la questionne pas ; version moderne de la caverne de Platon.

> 💡 **Citation :** « Nous acceptons la réalité du monde qui nous est présentée. »
""")

card("🎬 Inception : quel lien avec le vrai et le faux ?", r"""
🎬 **Film**, Christopher Nolan, 2010

**L'histoire :** Cobb voyage dans les rêves. Sa **toupie** lui dit s'il rêve (elle ne s'arrête jamais dans un rêve). Fin : la toupie tourne encore…

**Lien :** ==on ne peut pas toujours prouver qu'on n'est pas dans l'illusion==.

> 💡 **Dans l'essai :** « Comme Cobb, nous choisissons parfois de ne plus vérifier ce qui est vrai. »
""")

card("🎬 Her : quel lien avec le vrai et le faux ?", r"""
🎬 **Film**, Spike Jonze, 2013 (Joaquin Phoenix)

**L'histoire :** Theodore tombe amoureux de **Samantha**, une intelligence artificielle qui n'est qu'une voix.

**Lien :** une relation avec un être artificiel produit ==des sentiments bien réels==. Un amour est-il faux si l'autre n'existe pas comme nous ?

> 💡 **À rapprocher de :** l'attachement du joueur à Lucia dans *GTA VI*.
""")

card("🎬 Arrête-moi si tu peux : quel lien avec le vrai et le faux ?", r"""
🎬 **Film**, Steven Spielberg, 2002 (Leonardo DiCaprio)

**L'histoire :** Frank Abagnale, jeune faussaire, se fait passer pour pilote, médecin et avocat.

**Lien :** l'imposteur réussit grâce à l'**assurance** et à l'uniforme. ==Ironie : l'« histoire vraie » d'Abagnale a elle-même été en grande partie remise en cause== (enquête d'Alan Logan, 2020).

> 💡 **Dans l'essai :** « Même une histoire vraie peut être une fiction. »
""")

card("🎬 Don't Look Up : quel lien avec le vrai et le faux ?", r"""
🎬 **Film**, Adam McKay, 2021 (DiCaprio, Jennifer Lawrence)

**L'histoire :** deux astronomes annoncent qu'une comète va détruire la Terre ; médias et dirigeants minimisent et en font un spectacle.

**Lien :** satire du ==déni face à une vérité scientifique== (allégorie du climat). Une vérité dérangeante perd face à un récit plus confortable.

> 💡 **Dans l'essai :** « Avoir raison ne suffit pas : encore faut-il être cru. »
""")

card("🎬 Barbie : quel lien avec le vrai et le faux ?", r"""
🎬 **Film**, Greta Gerwig, 2023

**L'histoire :** Barbie quitte le monde parfait de Barbieland et découvre le « monde réel ». Monologue de Gloria (America Ferrera) sur les injonctions faites aux femmes.

**Lien :** un univers en plastique, ==totalement artificiel, dit des vérités très concrètes== sur la société.

> 💡 **Dans l'essai :** « La fiction peut être le chemin le plus court vers la vérité. »
""")

card("🎬 Anatomie d'une chute : quel lien avec le vrai et le faux ?", r"""
🎬 **Film**, Justine Triet, 2023 · ==Palme d'or==

**L'histoire :** Sandra est jugée pour la mort de son mari. Chaque témoin raconte une version différente ; leur fils Daniel doit **décider** de ce qu'il croit.

**Lien :** la **vérité judiciaire** est une construction à partir de récits ; la vérité des faits reste peut-être inaccessible.

> 💡 **Dans l'essai :** « Quand on ne peut pas savoir, il faut choisir ce que l'on croit. »
""")

card("📺 Black Mirror « Joan Is Awful » : quel lien avec le vrai et le faux ?", r"""
📺 **Série** Netflix, saison 6, 2023

**L'histoire :** Joan découvre une série sur sa propre vie, jouée par une ==version de Salma Hayek générée par IA==, à partir de ses données.

**Lien :** les **deepfakes** fabriquent une version fausse mais crédible de nous-mêmes. Qui détient la vérité sur notre vie ?

> ⚠️ **Piège :** Joan avait accepté les conditions d'utilisation sans les lire.
""")

card("📰 Le pape en doudoune (2023) : quel lien avec le vrai et le faux ?", r"""
📰 **Fait d'actualité**, mars 2023

**Les faits :** une image du pape François en doudoune blanche de luxe, ==générée par l'IA Midjourney==, devient virale ; beaucoup la croient vraie.

**Lien :** avec l'IA générative, **voir n'est plus croire**. L'image n'est plus une preuve.

> 💡 **Dans l'essai :** « Une image crédible n'est pas une image vraie. »
""")

card("📺 Derrière nos écrans de fumée : quel lien avec le vrai et le faux ?", r"""
📺 **Documentaire** Netflix, Jeff Orlowski, 2020

**Le propos :** d'anciens ingénieurs de Google ou Facebook expliquent que les algorithmes nous enferment dans des **bulles** et favorisent la désinformation.

**Chiffre :** selon une étude du MIT (*Science*, 2018), ==le faux se diffuse environ 6 fois plus vite que le vrai== sur Twitter.

> 💡 **Dans l'essai :** « Le faux circule mieux parce qu'il est plus surprenant et plus émotionnel. »
""")

card("📖 La caverne de Platon : quel lien avec le vrai et le faux ?", r"""
📖 **Philosophie**, Platon, *La République*, livre VII (vers 375 av. J.-C.)

**L'image :** des prisonniers ne voient que des **ombres** sur un mur et les prennent pour la réalité. Celui qui sort n'est pas cru par les autres.

**Lien :** ==on peut prendre des apparences pour la vérité==, et sortir de l'illusion est inconfortable.

> 💡 **À rapprocher de :** *The Truman Show*, les bulles des réseaux sociaux.
""")

card("📖 « Le Corbeau et le Renard » : quel lien avec le vrai et le faux ?", r"""
📖 **Fable**, Jean de La Fontaine, 1668

**L'histoire :** le Renard flatte le Corbeau pour lui faire lâcher son fromage.

**Morale :** « Apprenez que ==tout flatteur / Vit aux dépens de celui qui l'écoute==. »

**Lien :** le mensonge le plus efficace dit **ce qu'on a envie d'entendre** : flatterie, publicité, contenus qui confirment nos opinions.
""")

card("📖 « Les Habits neufs de l'empereur » : quel lien avec le vrai et le faux ?", r"""
📖 **Conte**, Hans Christian Andersen, 1837

**L'histoire :** des escrocs vendent un tissu « invisible aux sots ». Personne n'ose dire qu'il ne voit rien, jusqu'à ce qu'un enfant crie : « Mais il n'a pas d'habit du tout ! »

**Lien :** un ==mensonge collectif tient par peur du regard des autres== ; la vérité vient de celui qui n'a rien à perdre.
""")

card("📖 1984 d'Orwell : quel lien avec le vrai et le faux ?", r"""
📖 **Roman**, George Orwell, 1949

**L'histoire :** Winston travaille au ==ministère de la Vérité==, où il réécrit le passé selon la version du Parti.

**Repères :** « La guerre, c'est la paix » · faire admettre que **2 + 2 = 5** · Big Brother.

**Lien :** celui qui contrôle l'information **fabrique la vérité** (propagande, fake news d'État).
""")

card("📖 Romain Gary / Émile Ajar : quel lien avec le vrai et le faux ?", r"""
📖 **Supercherie littéraire**

| Date | Fait |
|---|---|
| 1956 | Romain Gary reçoit le Goncourt |
| 1975 | *La Vie devant soi*, signé **Émile Ajar**, reçoit aussi le Goncourt |
| 1981 | révélation posthume : Ajar, c'était Gary |

**Lien :** le Goncourt ne se donne qu'une fois ; ==le faux nom permet d'être lu sans préjugés== et libère une vérité de l'auteur.
""")

card("📖 D'après une histoire vraie (de Vigan) : quel lien avec le vrai et le faux ?", r"""
📖 **Roman**, Delphine de Vigan, 2015 · prix Renaudot

**L'histoire :** une romancière, Delphine, est manipulée par L., qui la pousse à écrire « la vérité » plutôt que de la fiction.

**Lien :** **autofiction** : ==le lecteur ne sait jamais ce qui est vécu ou inventé==. Un récit « vrai » est toujours construit.
""")

Q = []
def add(**q):
    q.setdefault("context", "")
    Q.append(q)

add(type="qcm", q="Quelle œuvre montre un homme dont toute la vie est une émission de télévision ?",
    choices=["Inception", "The Truman Show", "Her", "Don't Look Up"], answer=1,
    explain="Dans The Truman Show (1998), Truman vit sans le savoir dans un décor où ses proches sont des acteurs.")
add(type="qcm", q="Dans GTA VI, quel personnage forme un couple avec Jason ?",
    choices=["Ellie", "Lucia", "Samantha", "Kara"], answer=1,
    explain="Lucia et Jason sont le couple de criminels au cœur de GTA VI. Ellie vient de The Last of Us, Samantha de Her, Kara de Detroit: Become Human.")
add(type="qcm", q="Quelle référence illustre le mieux l'idée qu'on peut ressentir de vraies émotions pour un être qui n'existe pas ?",
    choices=["Le Corbeau et le Renard", "Her", "1984", "Don't Look Up"], answer=1,
    explain="Dans Her, Theodore aime sincèrement une IA. GTA VI et Detroit: Become Human illustrent aussi cette idée.")
add(type="qcm", context="Sujet d'essai : « La fiction nous éloigne-t-elle de la vérité ? »",
    q="Quelle référence permet de défendre que la fiction peut dire vrai ?",
    choices=["L'image du pape en doudoune", "Barbie", "Among Us", "Le Corbeau et le Renard"], answer=1,
    explain="Barbie se sert d'un monde totalement artificiel pour révéler des vérités sur la société. Le deepfake du pape illustre au contraire le faux qui trompe.")
add(type="qcm", q="Quel mensonge Joel fait-il à Ellie à la fin de The Last of Us ?",
    choices=["Qu'il n'est pas son père", "Qu'aucun remède n'était possible", "Qu'il a perdu sa fille", "Qu'elle n'est pas immunisée"], answer=1,
    explain="Joel l'a empêchée d'être sacrifiée pour un vaccin, puis lui jure qu'aucun remède n'était possible : un mensonge par amour.")
add(type="vf", q="Romain Gary a reçu deux fois le prix Goncourt, dont une fois sous le nom d'Émile Ajar.", answer=True,
   explain="Vrai : 1956 sous son nom, 1975 pour La Vie devant soi signé Émile Ajar. La supercherie n'a été révélée qu'après sa mort.")
add(type="trou", q="La Fontaine : « Apprenez que tout flatteur vit aux dépens de celui qui l'___ ».", answers=["écoute", "ecoute"],
    explain="C'est la morale du Corbeau et le Renard : le flatteur profite de celui qui croit ce qu'il a envie d'entendre.")
add(type="qcm", q="Dans 1984, comment s'appelle le ministère où Winston réécrit le passé ?",
    choices=["Le ministère de l'Amour", "Le ministère de la Vérité", "Le ministère de la Paix", "Le ministère de l'Abondance"], answer=1,
    explain="Ironie d'Orwell : c'est le ministère de la Vérité qui fabrique le mensonge officiel.")
add(type="vf", q="Dans Don't Look Up, les dirigeants croient immédiatement les scientifiques et agissent.", answer=False,
   explain="Faux : médias et dirigeants minimisent et tournent l'alerte en spectacle. C'est une satire du déni face à la vérité scientifique.")
add(type="multi", q="Quelles références parlent d'images ou de vidéos fabriquées par l'intelligence artificielle ?",
    choices=["Black Mirror « Joan Is Awful »", "Le pape en doudoune (2023)", "Les Habits neufs de l'empereur", "Anatomie d'une chute"], answers=[0, 1],
    explain="Joan Is Awful montre une série créée par IA à partir de la vie de Joan ; l'image du pape a été générée avec Midjourney.")
add(type="qcm", q="Dans Inception, à quoi sert la toupie de Cobb ?",
    choices=["À entrer dans les rêves", "À savoir s'il rêve ou non", "À hypnotiser ses cibles", "À mesurer le temps"], answer=1,
    explain="Dans un rêve, la toupie ne s'arrête jamais. La fin ambiguë laisse le doute : on ne peut pas toujours prouver qu'on n'est pas dans l'illusion.")
add(type="qcm", q="Dans Anatomie d'une chute (Palme d'or 2023), que doit finalement faire Daniel ?",
    choices=["Découvrir une preuve décisive", "Décider de ce qu'il croit", "Avouer qu'il a menti", "Quitter le procès"], answer=1,
    explain="Faute de pouvoir savoir, il doit décider : le film montre que la vérité judiciaire est une construction à partir de récits.")
add(type="qcm", q="Selon une étude du MIT (Science, 2018), les fausses informations se diffusent sur Twitter…",
    choices=["deux fois moins vite que les vraies", "à la même vitesse", "environ six fois plus vite", "cent fois plus vite"], answer=2,
    explain="Le faux circule environ six fois plus vite, car il est plus surprenant et plus émotionnel ; c'est le propos de Derrière nos écrans de fumée.")
add(type="vf", q="Dans Among Us, les imposteurs gagnent souvent en convainquant le groupe plutôt qu'avec des preuves.", answer=True,
   explain="Vrai : le jeu repose sur le mensonge et la persuasion ; on vote souvent selon l'aplomb des joueurs.")
add(type="assoc", q="Associe chaque œuvre à son auteur ou réalisateur.", pairs=[
    {"left": "Anatomie d'une chute", "right": "Justine Triet"},
    {"left": "Barbie", "right": "Greta Gerwig"},
    {"left": "Inception", "right": "Christopher Nolan"},
    {"left": "1984", "right": "George Orwell"},
    {"left": "Les Habits neufs de l'empereur", "right": "Hans Christian Andersen"}],
    explain="Citer précisément l'auteur et la date montre au correcteur que la référence est maîtrisée.")
add(type="assoc", q="Associe chaque référence à l'axe qu'elle illustre le mieux.", pairs=[
    {"left": "Le Corbeau et le Renard", "right": "Le faux qui trompe"},
    {"left": "Barbie", "right": "Le faux qui dit vrai"},
    {"left": "Her", "right": "De vraies émotions pour du faux"},
    {"left": "La caverne de Platon", "right": "Une vérité difficile à atteindre"}],
    explain="Les 4 axes structurent un essai : tromperie, fiction révélatrice, émotions, accès à la vérité.")
add(type="ordre", q="Remets ces références dans l'ordre chronologique.", items=[
    "Allégorie de la caverne (Platon)", "Le Corbeau et le Renard (1668)", "Les Habits neufs de l'empereur (1837)",
    "1984 (1949)", "The Truman Show (1998)", "Anatomie d'une chute (2023)"],
    explain="Le thème traverse les époques, de l'Antiquité aux films et jeux d'aujourd'hui : utile pour montrer qu'une question est universelle.")
add(type="ordre", q="Remets dans l'ordre les étapes pour utiliser une référence dans l'essai.", items=[
    "Présenter l'œuvre (titre, auteur, date, genre)", "La résumer en une phrase utile", "La relier clairement à l'argument"],
    explain="Une référence sans lien explicite avec l'argument ne rapporte presque rien.")
add(type="vf", q="Dans le film Arrête-moi si tu peux, l'histoire de Frank Abagnale est entièrement prouvée.", answer=False,
   explain="Faux : une enquête (Alan Logan, 2020) a montré qu'une grande partie de ses exploits avait été inventée. Même l'« histoire vraie » était en partie fausse.")
add(type="qcm", context="Sujet : « Peut-on être ému par ce qui n'existe pas ? »",
    q="Quelle référence récente du jeu vidéo est la plus adaptée ?",
    choices=["Among Us", "GTA VI et l'attachement à Lucia", "Le pape en doudoune", "1984"], answer=1,
    explain="Le joueur s'attache à Lucia et ressent de vraies émotions pour un personnage fictif : c'est le paradoxe de la fiction.")
add(type="trou", q="Dans le conte d'Andersen, c'est un ___ qui ose dire que l'empereur n'a pas d'habit.", answers=["enfant"],
    explain="L'enfant n'a pas peur du regard des autres : la vérité vient de celui qui n'a rien à perdre.")

data = {"title": TITLE, "subject": SUBJECT, "course": COURSE.strip(), "flashcards": F, "quiz": Q}
out = os.path.join(os.path.dirname(__file__), "..", "..", "data", "cge-vrai-faux.json")
with open(out, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=1)
print(f"{len(F)} flashcards, {len(Q)} questions")
