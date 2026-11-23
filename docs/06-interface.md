# 06 — Interface

Le jeu est en **2D**, affiché en **1280 × 720** (16:9) et adapté à la taille de l'écran. Il se joue à la
**souris**, au **tactile** ou au **clavier**.

> **Référence de disposition** : on s'inspire d'un jeu de plateau 2D existant **uniquement pour
> l'emplacement** des éléments. À gauche, une grande scène illustrée avec le plateau en ovale. À droite,
> quatre cartes indépendantes flottent en grille 2 × 2, sans fond ni bande verticale entre elles. Le décor reste visible sur toute la largeur. « Lancer le dé » est centré sous le plateau. Le **contenu**,
> les **textes** et le **style graphique** de Ziko l'écolo sont propres au jeu (voir
> [17 — Direction artistique](17-direction-artistique.md)).

## Écran principal (le plateau)

```
┌──────────────────────────────────────────────────────┬─────────────────────────────┐
│                SCÈNE PEINTE SUR TOUTE LA LARGEUR     ·   CARTES FLOTTANTES          │
│                                                      │ ┌─────────────┐ ┌─────────┐ │
│      ARRIÈRE-PLAN VIVANT (haut de la zone)           │ │🌍 VIE SUR   │ │ MISSION │ │
│      La Terre / la ville de Ziko, qui change         │ │ TERRE       │ │  ENCORE │ │
│      d'aspect avec les métriques                     │ │ an 2 870    │ │   38    │ │
│      (ciel gris → ciel bleu, arbres, éoliennes…)     │ │ 🔴 CRITIQUE │ │   ans   │ │
│                                                      │ └─────────────┘ └─────────┘ │
│                                                      │ ┌─────────────┐ ┌─────────┐ │
│            ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯                       │ │🙋 BÉNÉVOLES │ │🪙 PIÈCES│ │
│         ◯                       ◯                    │ │ 14 / 50     │ │ 63      │ │
│       ◯     PLATEAU EN OVALE      ◯                  │ │ ▓▓░░░░ loi  │ │ vie: 1/an│ │
│         ◯   (36 cases-pastilles) ◯                   │ └─────────────┘ └─────────┘ │
│            ◯ ◯ ◯ ◯ ◯ 🧒 ◯ ◯ ◯ ◯                       │ [🗺️ Carte][🎒 Invent.][📊 Statut]│
│                     Ziko + serpillière               │                             │
│                                                      │   [ 📰 Pendant ce temps… ]  │
│  🧒 Ziko 12 ans · An 2502 · Enfant      [toasts →]   │                             │
│              [ 🎲  LANCER LE DÉ  ]        [⏩]       │                             │
└──────────────────────────────────────────────────────┴─────────────────────────────┘
```

### Zone de gauche : scène et plateau
- **Arrière-plan vivant**, en haut de la zone : un grand décor illustré (la Terre vue depuis la colline
  de Ziko, avec sa ville). Il **reflète l'état de la planète** : ciel gris ou bleu selon les gaz, arbres
  et animaux selon la biodiversité, éoliennes et panneaux selon l'énergie propre, silhouettes de
  créatures au loin selon leur niveau. C'est l'**objectif visuel** du joueur : rendre ce paysage
  vivant.
- **Plateau en ovale**, en bas et au centre : 36 cases en forme de **pastilles à icône**, avec la
  couleur de leur type (voir [05 — Plateau et cases](05-plateau-et-cases.md#couleurs-des-cases)). Elles
  sont posées en perspective sur le sol de la scène, et les cases du fond sont un peu plus petites.
- **Ziko** est une petite figurine avec sa serpillière, montée sur un socle ovale vert et ivoire. Figurine et socle se déplacent ensemble ; toucher une case affiche son nom dans le carnet.
- Une **étiquette** en haut à gauche montre le portrait de Ziko, son âge et l'année. Le portrait et la figurine passent ensemble aux versions jeune, adulte et super-héros à 18, 30 et 42 ans. Les boutons ⏩
  (avance rapide) et ⚙️ (menu : pause, réglages, revoir l'intro, refaire le tutoriel, quitter) sont
  dans le coin.
- Les **toasts** de notification apparaissent en haut à droite de cette zone.

### Cartes et commandes indépendantes, sans panneau latéral

**1. Cartes d'information** (2 × 2) :

| Carte | Contenu | Détail |
|---|---|---|
| 🌍 **Vie sur Terre** | La grande année estimée (« an 2 870 ») et son niveau en couleur | C'est l'indicateur principal. Clic → Statut. |
| ⏳ **Mission encore** | Le nombre d'**années restantes** (40 → 0) | Il devient orange à 10 ans de la fin, rouge à 5 ans. |
| 🙋 **Bénévoles** | Le nombre de bénévoles, l'**objectif de la prochaine loi** (ex. 14 / 50) et une barre de progression | Clic → Inventaire, onglet Matériel & bénévoles. |
| 🪙 **Pièces écolo** | Le nombre de pièces et le **coût de la vie** annuel | Le nombre « roule », en vert s'il monte, en rouge s'il baisse. Clignote si les pièces ne suffisent pas pour l'an prochain. |

**2. Boutons de consultation**, toujours visibles, comme demandé :

| Bouton | Raccourci | Ouvre |
|---|---|---|
| 🗺️ **Carte** | `C` | Le planisphère. Voir [09 — Carte du monde](09-carte-du-monde.md). |
| 🎒 **Inventaire** | `I` | Les objets, le matériel, les bénévoles et l'Arche de Ziko. Voir [10 — Inventaire](10-inventaire.md). |
| 📊 **Statut** | `S` | Les jauges. Voir [07 — Statut et jauges](07-statut-et-jauges.md). |
| ❔ Aide (petit bouton) | `H` | Le rappel des règles et la légende des cases. |

- Une **pastille** s'allume sur un bouton quand quelque chose de nouveau s'y trouve : un nouveau point
  sur la carte, un nouvel objet, une jauge qui a changé de couleur.
- Les écrans s'ouvrent **par-dessus le plateau**, en fenêtre. On les ferme avec ✖, `Échap` ou le même
  bouton.
- On ne peut pas les ouvrir pendant un mini-jeu ou un combat.

**3. 📰 « Pendant ce temps… »** : le **journal du monde**, avec 2 onglets.
- **Nouvelles** : les derniers événements (catastrophes, créatures apparues, résultats de la dernière
  interview, lois votées, bilan de l'année passée).
- **Quêtes** : les 3 quêtes de l'époque en cours, avec leur progression (voir
  [18 — Chantiers verts et quêtes](18-chantiers-et-quetes.md#-les-quêtes-dépoque)).

Une pastille s'allume s'il y a du nouveau.

**Sous le plateau — 🎲 Lancer le dé** : un bouton doré en relief, sans contour vert, centré sous l’ovale. Sa zone tactile est plus haute que sa face visible (raccourci `Espace`). Le dé bascule sur deux axes, rebondit et se stabilise au-dessus de son ombre. Ses points restent attachés aux faces. La face du résultat reste visible pendant le déplacement ; le bouton reste grisé jusqu’à l’arrivée de la figurine.

L’ovale est remonté de 20 px et le dé conserve 60 % de sa taille initiale. La figurine a son propre sprite transparent avec socle, distinct des portraits du prologue. À l’arrivée, une fenêtre présente le nom de la case, sa description et une action contextuelle. Dans l’aperçu, ce bouton affiche les consignes dans le journal ; il ne simule pas une récompense. Aucun autre lancer n’est possible tant que la fenêtre est ouverte.

### Mini-jauges
Sous les cartes d'information, ou au survol de la carte 🌍, **4 petites jauges** colorées montrent les
4 métriques les plus en danger. Ainsi, le joueur voit l'essentiel sans ouvrir le Statut.

## Notifications

À **chaque action** qui améliore ou dégrade une métrique, le joueur est **notifié**.

### Les « toasts » (petites notifications)
De petites bulles apparaissent en haut à droite du plateau, puis disparaissent après 2,5 s.

```
┌─────────────────────────────┐
│ ☁️ Gaz toxiques   −0,5 %  ▼ │  ← vert : amélioration
└─────────────────────────────┘
┌─────────────────────────────┐
│ 🌡️ Température   +0,04 °C ▲ │  ← rouge : dégradation
└─────────────────────────────┘
```

- **Vert** avec une flèche = amélioration. **Rouge** = dégradation. **Bleu** = information neutre (nouvel
  objet, nouveaux bénévoles).
- Une **petite icône vole** jusqu'au bouton 📊 Statut, puis la pastille du bouton s'allume.
- Au maximum **3 toasts** sont visibles à la fois. Les suivants attendent, ou sont regroupés : « +4
  changements ».
- Les changements d'une même action sont **regroupés** en une seule bulle à plusieurs lignes.
- Il y a un **son** différent pour les améliorations et les dégradations (on peut le couper).

### Changement de niveau de jauge
Quand une jauge change de couleur, un **bandeau plus grand** apparaît en plus du toast :
- vers le mieux : « 🎉 Les gaz toxiques passent en zone **ALERTE** ! »
- vers le pire : « ⚠️ La température repasse en zone **CRITIQUE**… »

Ces bandeaux préparent les scènes décrites dans [08 — Jalons et animations](08-jalons-et-animations.md).

### Bilan de fin d'année
À la fin de chaque tour, les changements dus à la **dégradation automatique** sont résumés dans **un
seul** panneau « Bilan de l'an 25XX ». Ainsi, le joueur ne reçoit pas 8 toasts d'un coup.

## Téléphones et petits écrans

Le jeu doit être confortable **sur téléphone**, et pas seulement sur ordinateur.

| Sujet | Règle |
|---|---|
| **Orientation** | Le jeu se joue en **paysage** (16:9). Sur un téléphone tenu en portrait, un écran « Tourne ton téléphone » s'affiche, avec une animation. |
| **Plein écran** | Au premier appui sur un appareil tactile, le jeu passe en plein écran et tente de verrouiller l'orientation en paysage. |
| **Encoches et bords arrondis** | Le jeu respecte les zones sûres de l'écran (`safe-area-inset`), pour que rien ne soit caché par l'encoche. |
| **Taille des boutons** | Toute zone à toucher fait au moins **44 px CSS** sur un téléphone en paysage. Comme le jeu est réduit d'environ ×0,55, les boutons font au moins 80 px dans le jeu. |
| **Texte** | Au moins 26 px dans le jeu pour le texte courant, et 33 px pour le récit de l'intro. Les textes clairs ont un contour brun pour rester lisibles sur les illustrations. |
| **Gestes** | Un appui fait avancer, comme Espace ou un clic. Le zoom par double-appui, le rafraîchissement en tirant vers le bas et la sélection de texte sont désactivés. |
| **Textes d'aide** | Ils s'adaptent à l'appareil : « Touche l'écran pour continuer » sur tactile, « Clic ou Espace pour continuer » sur ordinateur. Le type d'appareil est détecté par le pointeur principal (`pointer: coarse`). |
| **Images** | Les téléphones chargent les illustrations en **demi-taille** (`@small`, environ 1,7 Mo au total contre 3,5 Mo). |
| **Chargement** | L'écran titre s'affiche dès que les premières images sont prêtes. Les autres illustrations se chargent **en arrière-plan** pendant qu'on regarde l'écran titre. |
| **Tests** | `e2e/mobile.spec.ts` vérifie sur un iPhone simulé que les images demi-taille sont chargées, que les boutons ont la bonne taille, que l'intro se joue au doigt et que le message « tourne ton téléphone » s'affiche en portrait. |

## Réglages

- Volume de la musique et des effets.
- Vitesse des animations : normale ou rapide.
- Scènes de jalons : complètes, courtes ou désactivées.
- Taille du texte : normale ou grande.
- Mode daltonien : motifs en plus des couleurs sur les jauges et les cases.
- Lecture vocale des textes (option prévue pour les jeunes lecteurs).
