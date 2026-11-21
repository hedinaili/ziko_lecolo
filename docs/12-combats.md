# 12 — Combats

Sur une case ⚔️ **Combat**, une **créature née des déchets** attaque. Le combat est **court** (environ
40 s) et mélange **choix tactique** (quelle arme utiliser) et **adresse** (frapper au bon moment).

## Les créatures

| Créature | Née de… | Région (case) | Point faible | Effet si Ziko perd |
|---|---|---|---|---|
| 🛍️ **Sac-Zombie** | Sacs et emballages plastiques | Asie | 🦾 Pince à déchets | Êtres marins −10 ans |
| 🛞 **Golem de pneus** | Pneus et vieilles voitures | Amérique du Nord | 🔧 Clé à recycler | Gaz +1 % |
| 🛢️ **Méduse de pétrole** | Marées noires | Océan Atlantique | 🧴 Éponge absorbante | Êtres marins −15 ans, marée noire sur la carte |
| ☁️ **Nuage de smog** | Fumées d'usines et de pots d'échappement | Europe | 🌀 Aspirateur à smog | Maladies +1 % |
| 👑 **Roi des Ordures** (boss final, facultatif) | Toutes les décharges réunies | Monde | Toutes les armes, à tour de rôle | Voir plus bas |

La **force** d'une créature (ses points de vie, PV) dépend de l'époque **et** du niveau de créatures
dans le Statut :

> **PV** = 3 + n° de l'époque (Enfant = 0, Jeune = 1, Adulte = 2, Super-héros = 3)
> + 1 si le niveau de créatures est ≥ 8 (🔴)

## Apparence des créatures (référence visuelle)

![Planche de référence des ennemis](images/ennemis.png)

Une deuxième planche, plus proche de **fiches de créatures** (nom, origine, région, point faible, effet
de la défaite), sert de modèle pour les fiches du jeu et pour le style des monstres :

![Fiches de référence des ennemis](images/ennemis-fiches.png)

Ces planches servent de **référence officielle** pour l'apparence des créatures. Elle est en accord avec
les noms, les régions, les points faibles et le boss décrits dans ce document.

**Style commun à toutes les créatures** : un corps **sombre** (noir et gris anthracite) fait de
déchets, des **yeux jaunes ou rouges qui brillent**, une bouche en dents de scie et un air méchant mais
**pas trop effrayant** pour des enfants. Un **décor typique de la région** se trouve derrière chaque
créature.

| Créature | Apparence | Décor de combat | Animations à prévoir |
|---|---|---|---|
| 🛍️ **Sac-Zombie** | Un gros sac-poubelle noir et déchiré, fermé par un nœud rouge. Des déchets sortent de sa bouche. Il a des bras de zombie verts et tient une bouteille en plastique. | Asie : pagodes, cerisiers en fleurs, déchets au sol | Il marche en traînant les pieds, lance des bouteilles, et se dégonfle quand il est vaincu |
| 🛞 **Golem de pneus** | Un géant fait de pneus empilés, avec des jantes en guise d'épaules et des yeux rouges. Il est massif et lent. | Amérique du Nord : panneau « Route 66 », voitures abandonnées | Il frappe le sol (l'écran tremble), roule sur lui-même, puis s'écroule en pneus qui rebondissent |
| 🛢️ **Méduse de pétrole** | Une méduse luisante de pétrole noir, avec de longs tentacules qui dégoulinent. | Océan Atlantique : plateforme pétrolière, mouettes, plage tachée | Elle flotte et ondule, projette des gouttes de pétrole, puis fond en flaque que l'éponge absorbe |
| ☁️ **Nuage de smog** | Un nuage de fumée gris foncé, sans contour net, avec des yeux jaunes en colère. | Europe : cheminées d'usines, silhouette de ville avec la tour Eiffel | Il se gonfle, souffle de la fumée qui cache une partie de la barre de timing, puis se fait aspirer en spirale |
| 👑 **Roi des Ordures** | Un monstre géant de déchets mélangés, avec une couronne dorée, une cape rouge à bordure d'hermine et un sceptre avec le logo du recyclage (qu'il a volé). Il est assis sur un trône de déchets. | Une décharge géante, avec la Terre en arrière-plan | Voir les 3 phases ci-dessous |

**Boss final : apparence des 3 phases** (avec un fondu entre chaque phase) :

| Phase | Apparence | Point faible |
|---|---|---|
| 1 — **Sac** | Son corps est fait de sacs plastiques de toutes les couleurs | 🦾 Pince à déchets |
| 2 — **Pneu** | Il se reconstruit en pneus, et sa cape est en partie arrachée | 🔧 Clé à recycler |
| 3 — **Smog** | Il devient un nuage noir, seuls sa couronne et ses yeux restent visibles | 🌀 Aspirateur à smog |

Les bandeaux de l'image (nom, région, point faible, et « 12 PV · 3 phases · Victoire : +30 pièces,
créatures −3 ») servent aussi de **modèle pour la fiche de la créature**. Cette fiche s'affiche avant
chaque combat et quand on clique sur un point 👹 de la [carte](09-carte-du-monde.md).

**À produire pour le jeu** : pour chaque créature, une feuille de sprites (au repos, attaque, coup reçu,
défaite) et son décor de combat. Pour le boss : 3 versions, une par phase, plus son apparition et sa
défaite.

## Style visuel : un RPG rétro « 32 bits »

Les combats ressemblent à un **jeu de rôle rétro au tour par tour**, avec un rendu de **l'ère 32 bits**
(PlayStation 1, Saturn, Game Boy Advance). C'est du pixel art **détaillé**, assez fin pour bien voir les
détails des monstres et du boss : couronne, cape, sceptre, déchets qui composent leur corps.

| Élément | Règle |
|---|---|
| **Résolution interne** | 480 × 270, agrandie ×2,666 en 1280 × 720 sans flou (rendu « pixel parfait ») |
| **Créatures** | Grands sprites : environ 96 px de haut pour une créature, 160 px pour le Roi des Ordures. Palette riche (jusqu'à 64 couleurs par sprite), ombrage en plusieurs tons, contours foncés. |
| **Animations** | 4 à 8 images par animation : au repos (respiration), attaque, coup reçu (clignotement blanc), défaite |
| **Ziko** | Vu de dos ou de trois quarts, en bas à gauche. La créature est en haut à droite, sur son décor de région (comme sur la [planche de référence](images/ennemis.png)). |
| **Effets 32 bits** | Transparence (fumée du smog, pétrole), zoom à l'apparition du boss, flash de l'écran sur un coup « Super efficace ! », tremblement sur les coups puissants, particules en pixels (gouttes, morceaux de plastique) |
| **Interface** | Des cadres en pixel art aux couleurs du jeu : crème, contour brun (voir [17 — Direction artistique](17-direction-artistique.md#cadres-et-interface)). Les barres de PV et de cœurs sont pixelisées. Le texte s'écrit lettre par lettre, avec un petit son de « bip » rétro. |
| **Son** | Une musique chiptune enrichie (style 32 bits), et des effets sonores rétro pour les coups, l'esquive et la victoire |

```
┌─────────────────────────────────────────────────────────────────┐
│                                   ┌───────────────────────┐     │
│                                   │ SAC-ZOMBIE   PV ▓▓▓░░ │     │
│        (décor de région)          └───────────────────────┘     │
│                                          👾 (grand sprite)       │
│                                                                 │
│   🧒 (Ziko de dos, avec sa serpillière)                          │
│   ┌──────────────────┐                                          │
│   │ ZIKO   ❤️❤️❤️     │                                          │
│   └──────────────────┘                                          │
│ ┌───────────────────────────────┬─────────────────────────────┐ │
│ │ « Grrr… Je suis à usage       │ ▶ 🦾 Pince à déchets         │ │
│ │ UNIQUE… mais je vais durer    │   Impact     ▓▓▓▓▓▓▓▓░░      │ │
│ │ 400 ans ! Mouahaha ! »        │   Efficacité ★★★ SUPER !     │ │
│ │                               │   Précision  ▓▓▓▓▓▓▓░░░      │ │
│ │                               │   🧽 Serpillière  🌀 Aspi…   │ │
│ │                               │   🩹 Soin (2)                │ │
│ └───────────────────────────────┴─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Les armes

Toutes les armes sont des **outils de nettoyage ou de lutte contre la pollution**. Chacune a une
**puissance**, une **précision** (la taille de la zone de réussite sur la barre de timing) et des
**affinités** avec chaque créature :

| Arme | Puissance | Précision | Super efficace (×2) contre | Peu efficace (×0,5) contre | Pourquoi |
|---|---|---|---|---|---|
| 🧽 **Serpillière** | 1 | ★★★ (très facile) | — | — | Elle nettoie un peu tout, sans être spécialiste |
| 🦾 **Pince à déchets** | 1 | ★★☆ | Sac-Zombie | Nuage de smog | On attrape un sac, pas un nuage |
| 🔧 **Clé à recycler** | 1,25 | ★★☆ | Golem de pneus | Méduse de pétrole | On démonte la mécanique, mais elle glisse sur le pétrole |
| 🧴 **Éponge absorbante** | 1 | ★★★ | Méduse de pétrole | Golem de pneus | Elle absorbe le pétrole, mais rebondit sur le caoutchouc |
| 🌀 **Aspirateur à smog** | 1,25 | ★☆☆ (difficile) | Nuage de smog | — | Puissant, mais difficile à viser |

Le **boss** change de forme à chaque phase : sacs, puis pneus, puis smog. Les affinités suivent sa
forme du moment : la pince est super efficace pendant la phase Sac, la clé pendant la phase Pneu,
l'aspirateur pendant la phase Smog.

> Les valeurs exactes sont dans `src/data/weapons.ts`. Les statistiques affichées sont calculées par
> `weaponStats()` dans `src/core/combat.ts`.

## Choix de l'arme : les jauges

À chaque tour, le **menu des armes** montre, pour chaque arme possédée et **contre l'ennemi affronté**
(ou contre la forme actuelle du boss) :

| Jauge | Ce qu'elle montre | Affichage |
|---|---|---|
| 💥 **Impact** | Les dégâts attendus (puissance × affinité) | Une barre de 0 à 100 % et les dégâts estimés (« 2 à 4 dégâts ») |
| 🎯 **Efficacité** | L'affinité avec cet ennemi | ★★★ **SUPER EFFICACE !** (vert) · ★★☆ Efficace (jaune) · ★☆☆ Peu efficace… (rouge) |
| 🎚️ **Précision** | La facilité à réussir le timing | Une barre : plus elle est pleine, plus la zone de réussite est large |

- Le curseur se place d'abord sur l'**arme la plus efficace**, pour aider les plus jeunes. Le joueur
  peut choisir une autre arme.
- Quand le joueur survole une arme, sa **barre de timing** s'affiche en aperçu avec la taille réelle de
  ses zones.
- Les armes que Ziko n'a pas encore sont affichées **grisées, avec un cadenas** et l'indication « En
  vente au magasin ». Ainsi, le joueur comprend quoi acheter.

## Déroulé d'un combat

1. **Apparition** : la créature surgit d'un tas de déchets (environ 2 s), avec sa réplique d'entrée
   (voir [19 — Humour et dialogues](19-humour-et-dialogues.md)). Elle a ses PV, Ziko a **3 cœurs**.
2. **Tour de Ziko** :
   - il **choisit une arme** avec les jauges. La serpillière est toujours disponible ;
   - une **barre de timing** apparaît : un curseur va et vient, il faut appuyer quand il est dans la
     bonne zone. La taille des zones dépend de la **précision** de l'arme.

   | Timing | Dégâts |
   |---|---|
   | Raté (zone rouge) | 0 |
   | Bon (zone jaune) | 1 × multiplicateur |
   | Parfait (zone verte, étroite) | 2 × multiplicateur |

   - **multiplicateur** = puissance de l'arme × affinité (×2, ×1 ou ×0,5) × bonus de la
     Super-Serpillière (×1,5 à l'époque Super-héros).
   - Le texte « SUPER EFFICACE ! » ou « Peu efficace… » s'affiche après le coup, façon RPG rétro.
3. **Tour de la créature** : elle attaque. Ziko peut **esquiver** avec une touche fléchée, s'il appuie
   au bon moment (environ 0,5 s pour réagir). Esquive ratée : −1 cœur.
4. On répète jusqu'à ce que la créature ou Ziko n'ait plus de PV. Le combat dure **au maximum 5 tours** :
   si la créature n'est pas vaincue après 5 tours, elle s'enfuit (match nul).
5. **Trousse de soin** : à la place d'attaquer, Ziko peut l'utiliser pour récupérer 1 cœur.

Avec la bonne arme, un combat bien joué prend **2 à 3 tours**. Avec la serpillière seule, il en faut
plutôt 4 ou 5. Avec une arme peu efficace, la créature risque de s'enfuir.

## Résultats

| Résultat | Effets |
|---|---|
| 🏆 **Victoire** | **+8 pièces**, créatures −0,7, le point 👹 disparaît de la [carte](09-carte-du-monde.md), 30 % de chance de gagner un objet. La première victoire déclenche un **grand jalon**. |
| 🤝 **Match nul** (la créature s'enfuit) | +2 pièces, aucun effet sur les métriques |
| 💥 **Défaite** | −5 pièces, créatures +0,5, effet de la créature (tableau plus haut). Ziko se relève en s'appuyant sur sa serpillière : on ne perd jamais la partie à cause d'un combat. |

## Évolution de la serpillière

La serpillière est l'arme de base (puissance 1, aucune faiblesse). Elle évolue automatiquement avec les époques :

| Époque | Nom | Bonus |
|---|---|---|
| Enfant | Serpillière | — |
| Jeune | Serpillière renforcée | La zone « bon » de la barre de timing est plus large |
| Adulte | Serpillière high-tech | La zone « parfait » est plus large |
| Super-héros | **Super-Serpillière** ✨ | ×1,5 contre toutes les créatures |

## Boss final : le Roi des Ordures (facultatif)

- Il apparaît **une seule fois**, quand Ziko a entre 45 et 49 ans, sur la prochaine case Combat, **si
  le niveau de créatures est ≥ 5**. Sinon, une scène montre que le Roi « n'a pas pu naître » grâce aux
  efforts de Ziko. C'est un grand jalon.
- Il a 12 PV et 3 phases. Son point faible change à chaque phase : sac, puis pneu, puis smog.
- **Victoire** : créatures −3, +30 pièces, une scène spéciale.
- **Défaite** : créatures +1, sans autre punition.
