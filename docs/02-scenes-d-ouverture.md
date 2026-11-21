# 02 — Scènes d'ouverture (cinématique en BD)

Avant le texte d'introduction et le bouton **Commencer**, le jeu montre une **suite de 15 cases** façon
bande dessinée animée. Elles présentent les dangers qui menacent la Terre, le mystère des créatures, et
ce que ressent Ziko. Le but est d'**accrocher le joueur** dès la première minute.

## Composition d'une case

Chaque case occupe tout l'écran (16:9) et se compose de **3 couches** :

```
┌──────────────────────────────────────────────────────────┐
│ ┌──────────────────────────────┐                         │
│ │ ENCADRÉ NARRATEUR (texte qui │      ARRIÈRE-PLAN       │
│ │ apparaît lettre par lettre)  │   (illustre le danger   │
│ └──────────────────────────────┘    ou l'événement)      │
│                                                          │
│                         ╭──────────────────╮             │
│   ZIKO                  │ Bulle de Ziko :  │             │
│   (premier plan,        │ ce qu'il ressent │             │
│    expression qui       ╰──────────────────╯             │
│    change)                                     [Passer ⏭]│
└──────────────────────────────────────────────────────────┘
```

| Couche | Rôle | Animation |
|---|---|---|
| **Arrière-plan** | Montre le danger ou l'événement décrit | Zoom lent (effet « Ken Burns »), éléments animés (vagues, fumée, monstres) |
| **Ziko au premier plan** | Montre l'émotion de Ziko | Il entre en glissant, puis son expression change |
| **Encadré narrateur** | Texte qui raconte | Le texte s'écrit lettre par lettre (environ 30 caractères par seconde) |
| **Bulle de Ziko** (facultative) | Ses propres mots, dans une bulle crème signée « Ziko ». Le contour et la pointe forment un seul tracé lissé, sans raccord visible. | Elle apparaît après le texte du narrateur |

**Règles :**
- Un clic, la barre Espace ou un appui sur l'écran affiche tout le texte. Un deuxième appui passe à la
  case suivante.
- Le bouton **Passer ⏭** permet de passer toute la cinématique. Il est visible tout de suite si le
  joueur a déjà vu l'intro.
- Ziko apparaît une fois à gauche, une fois à droite, pour varier les cases.
- Entre les cases, les transitions changent : fondu, page de BD qui tourne, écran qui grésille pour
  les monstres, écran qui tremble pour les catastrophes.
- La séquence dure **environ 2 minutes** (15 cases × 6 à 9 secondes).
- **Mode vitrine** : sur l'écran titre, si personne ne touche à rien pendant 20 secondes, les cases
  défilent toutes seules, sans les bulles, pour donner envie de jouer.
- La séquence peut être revue depuis le menu (**Revoir l'intro**).

## Expressions de Ziko à dessiner

`joyeux` · `curieux` · `inquiet` · `triste` · `choqué` · `effrayé` · `en colère` · `déterminé` ·
`plein d'espoir`. Ces expressions servent aussi pour les scènes de jalons
(voir [08 — Jalons et animations](08-jalons-et-animations.md)).
Ziko a **toujours sa serpillière à la main**, sur toutes les cases.

## Le scénario case par case

| N° | Arrière-plan | Ziko | Encadré narrateur | Bulle de Ziko | Ambiance |
|---|---|---|---|---|---|
| 1 | Un jardin fleuri, des oiseaux, des papillons | joyeux, il sent une fleur | « Voici Ziko. Il a 10 ans, et ce qu'il aime le plus au monde, c'est la nature. » | « Je crois que je suis un peu une plante ! » | Musique douce, chants d'oiseaux |
| 2 | Un salon le soir, une télé allumée : **FLASH SPÉCIAL — AN 2500** | inquiet dès l’annonce du flash spécial | « Un soir, les scientifiques font une annonce à la télévision… » | — | La musique s'arrête, jingle de journal télé |
| 3 | Un océan sombre, des poissons qui s'éteignent un par un, un compteur **300** | choqué | « Les êtres marins n'ont plus que **300 ans** avant de disparaître. » | « 300 ans ?! Et les tortues ? Et les baleines ? » | Son sous-marin grave |
| 4 | Une ville grise dans le brouillard, des gens qui toussent avec des masques | inquiet, il regarde sa mamie qui tousse | « Plus de **la moitié des humains** sont malades à cause de la pollution. » | « Mamie tousse tout le temps… C'est pour ça ? » | Bruit de toux, ville étouffée |
| 5 | Une courbe sur un tableau d'hôpital qui descend de 80 à **50 ans** | triste | « L'espérance de vie des humains est tombée à **50 ans**. » | « C'est presque l'âge de Papa… » | Piano triste |
| 6 | Un thermomètre géant qui déborde, un soleil rouge, la terre craquelée | il a chaud et s'essuie le front | « La Terre a **4 °C** de plus que d'habitude, et ça monte vite. » | « Il fait chaud, même la nuit… » | Chaleur qui fait onduler l'image |
| 7 | Une station-service vide avec un panneau **PLUS DE PÉTROLE** et des voitures arrêtées | inquiet, il serre sa serpillière | « La planète commence à **manquer de pétrole**. » | « Mais alors… comment on va faire ? » | Silence, vent |
| 8 | Une montagne de déchets la nuit, des yeux qui brillent dans l'ombre | effrayé, caché derrière une poubelle | « Dans les montagnes de déchets, quelque chose **bouge**… » | « … C'était quoi, ça ? » | Musique de suspense, l'écran grésille |
| 9 | Un Sac-Zombie et un Golem de pneus attaquent un parc, les animaux s'enfuient | en colère | « Des **créatures monstrueuses** surgissent des déchets et attaquent les êtres vivants ! » | « Laissez-les tranquilles ! » | Rugissement, l'écran tremble |
| 10 | Un ours polaire sur un glaçon qui fond, des abeilles qui tombent, un orang-outan dans une forêt coupée | triste, une larme | « De plus en plus d'animaux sont **menacés d'extinction**. » | « Ils n'ont rien fait de mal… » | Violon triste |
| 11 | Un écran coupé en 4 : un volcan, une tempête, une inondation, un séisme | il serre les poings | « Les **catastrophes naturelles** sont de plus en plus nombreuses. » | — | Grondement, l'écran tremble fort |
| 12 | La chambre de Ziko la nuit, une plante sur le rebord de la fenêtre | inquiet, assis sur son lit, il ne dort pas | « Cette nuit-là, Ziko n'arrive pas à dormir. » | « Pourquoi personne ne fait rien ? Est-ce qu'il est trop tard ? » | Tic-tac d'horloge |
| 13 | Le matin, une petite pousse verte sort d'une fissure du béton | intrigué, il s'accroupit | « Au matin, Ziko remarque une petite pousse qui a traversé le béton. » | « Elle n'a pas abandonné, elle… » | La musique reprend doucement |
| 14 | Le pas de la porte au lever du soleil, la Terre immense dans le ciel | déterminé, avec un sac à dos, il attrape sa **serpillière** et la lève comme une épée | « Ziko prend une grande décision. » | « Si personne ne commence… alors ce sera moi ! » | Musique héroïque qui monte |
| 15 | Ziko de dos devant la Terre. Un compteur s'affiche : **Vie sur Terre : jusqu'en l'an 2800 ?** Puis le logo **ZIKO L'ÉCOLO** | de dos, sa serpillière sur l'épaule, cape au vent (clin d'œil au futur super-héros) | « Ziko a **40 ans** pour protéger la vie sur Terre. » | — | Thème principal, puis le logo apparaît |

Après la case 15, on affiche le [texte d'introduction](01-histoire.md#le-texte-dintroduction-après-les-scènes)
avec le bouton **Commencer**, puis le [tutoriel](03-tutoriel.md).

## Liste des illustrations à produire

- 13 arrière-plans (les cases 3 à 11 et 12 à 15), plus le jardin et le salon.
- 2 créatures déjà dessinées pour l'intro : le Sac-Zombie et le Golem de pneus
  (voir [12 — Combats](12-combats.md)).
- Ziko enfant avec sa serpillière et les 9 expressions, plus Ziko de dos avec une cape.
- Style : voir [17 — Direction artistique](17-direction-artistique.md). Les dessins originaux des notes
  servent de croquis de référence et sont redessinés dans le style peint du jeu.
