# 09 — Carte du monde (planisphère)

Le bouton 🗺️ **Carte** de la barre latérale ouvre un **planisphère**. Il montre **où** se trouvent les
problèmes et **où** Ziko agit. Le plateau reste le lieu où l'on joue. La carte est le **tableau de bord
visuel** de la mission.

## Les régions

La carte est découpée en **10 régions**, qui correspondent aux régions des cases du plateau
(voir [05 — Plateau et cases](05-plateau-et-cases.md#ordre-des-cases-sur-le-plateau)) :

- **Continents** : Amérique du Nord, Amérique du Sud, Europe, Afrique, Asie, Océanie.
- **Océans et pôles** : Océan Pacifique, Océan Atlantique, Océan Indien, Arctique / Antarctique.

## Les types de points

| Point | Signification | Apparition | Disparition |
|---|---|---|---|
| 👹 **Créature** | Une créature des déchets (Sac-Zombie, Golem, Méduse, Smog). Sa taille dépend de sa force. | Au départ, autant de points que le **niveau des créatures** (6). Un point de plus à chaque niveau gagné. | Quand la créature est vaincue en combat, ou quand le niveau baisse |
| 🟤 **Zone polluée** | Décharge, plastique dans l'océan, ville sous le smog | 8 au départ, puis d'autres quand les gaz augmentent | Grâce à une campagne de nettoyage dans la région |
| 🛢️ **Marée noire** | Pollution au pétrole | Carte « ? » Marée noire, combat perdu contre une Méduse | Nettoyage dans l'océan concerné |
| 🌋 **Catastrophe** | Tempête, inondation, éruption volcanique, séisme | Événement de fin d'année (voir [04 — Boucle](04-boucle-de-jeu.md#catastrophes-naturelles)) | Quand les bénévoles vont aider (Nettoyage), ou après 3 ans |
| 🧹 **Campagne de nettoyage** | Un nettoyage organisé par Ziko | Case Nettoyage | Reste sur la carte, en plus pâle après 1 an |
| 📣 **Manifestation** | Une manifestation organisée par Ziko. Le cercle grossit avec le nombre de participants. | Case Manifestation | Reste sur la carte. Elle devient 📜 si une loi est votée. |
| 📜 **Loi** | Une loi votée (5 lois possibles) (icône sur la région où a eu lieu la manifestation) | Loi votée | Permanente |
| 📺 **Interview** | Une onde qui s'étend sur la zone d'audience : une ville quand Ziko est enfant, une région quand il est jeune, un pays quand il est adulte, **le monde entier** quand il est super-héros | Case Télé | S'efface après 1 an |
| 🐢 **Espèce sauvée** | Un animal de l'Arche de Ziko, dans sa région | Case Animal à sauver | Permanente |
| ⚠️ **Espèce en danger** | Un animal que Ziko n'a pas sauvé | Refus sur une case Animal | Quand l'espèce est sauvée plus tard |
| 🌳 / ☀️ / 🏥 / 🐋 / ♻️ **Grand projet** | Forêt géante, centrale solaire, hôpital écolo, sanctuaire marin, usine de recyclage | Achat du grand projet | Permanent |
| 🔌 / 🌬️ / 🌳 / 🦌 / 🐞… **Chantier vert** | Borne de recharge, éolienne, réserve naturelle, potager… (voir [18](18-chantiers-et-quetes.md)). Les chantiers d'un même type dans une région sont regroupés avec un badge ×N. | Case Chantier vert | Permanent |

## L'apparence de la carte change avec les métriques

La carte **reflète l'état de la planète** :
- **Gaz toxiques** : un voile gris recouvre la carte, plus ou moins épais.
- **Température** : la couleur des océans et la taille de la banquise changent (la banquise grandit
  quand la température baisse).
- **Biodiversité** : les continents sont plus ou moins verts.
- **Énergie propre** : de petites éoliennes et des panneaux solaires apparaissent sur la carte.

Une partie réussie se voit donc au premier coup d'œil : la carte passe du gris-brun au bleu-vert.

## Interactions

- **Survol ou appui sur un point** : une bulle d'information s'affiche. Exemple : « 👹 Golem de pneus —
  Amérique du Nord — Force 3 — Point faible : clé à recycler ».
- **Filtres** (cases à cocher) : Problèmes (👹 🟤 🛢️ 🌋 ⚠️) · Actions de Ziko (🧹 📣 📜 📺) · Nature
  (🐢 et projets).
- **Compteurs** en bas : « 6 créatures · 8 zones polluées · 2 catastrophes · 3 nettoyages ·
  1 manifestation ».
- **Ligne du temps** (option) : un curseur 2500 → 2540 permet de **revoir l'évolution** de la carte.
  Il est aussi utilisé dans l'épilogue.
- Les nouveaux points de l'année **clignotent** la première fois qu'on ouvre la carte.

## Exemple

```
┌──────────────────────────── 🗺️ CARTE DU MONDE · An 2512 ────────────────────────────┐
│   [✓ Problèmes] [✓ Actions] [✓ Nature]                                    ✖         │
│                                                                                     │
│        🟤📣              🟤 👹                👹🟤 📺                                │
│     Amérique du N.     Europe 🧹         Asie  🟤                                   │
│                  🛢️                                                                 │
│       🧹 Amérique du S.    Afrique 📣         Océan Indien 👹      🐢 Océanie        │
│                                                                                     │
│  6 👹 · 7 🟤 · 1 🛢️ · 0 🌋 · 3 🧹 · 2 📣 · 1 🐢                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Remarque technique

Les points sont **calculés à partir de l'état du jeu** : métriques, historique des actions, régions des
cases. Ils ne sont pas enregistrés à part. Chaque région a une liste d'emplacements possibles, pour
éviter que les points se chevauchent.
