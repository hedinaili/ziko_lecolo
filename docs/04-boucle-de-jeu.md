# 04 — Boucle de jeu

## Vue d'ensemble

```
Écran titre → Scènes d'ouverture (15 cases) → Texte d'intro + [COMMENCER] → Tutoriel
   → 40 tours (1 tour = 1 an, de 2500 à 2540)
   → Épilogue (année estimée de fin de la vie + qualité de vie)
```

## Déroulé d'un tour (= 1 an)

1. **Début de l'année** : le HUD affiche l'année, l'âge de Ziko et son époque.
2. **Actions libres** : le joueur peut ouvrir 🗺️ Carte, 🎒 Inventaire et 📊 Statut, ou utiliser un
   objet utilisable hors case (par exemple des graines d'arbres).
3. **Lancer le dé** (1 à 6). Avec le **vélo** (voir [10 — Inventaire](10-inventaire.md)), le joueur peut
   ajouter +1 au résultat, une fois par tour.
4. **Déplacement** de Ziko case par case sur le plateau en boucle. S'il passe sur la case **Départ**,
   il reçoit son allocation.
5. **Résolution de la case** (voir [05 — Plateau et cases](05-plateau-et-cases.md)) : mini-jeu, combat,
   télé, magasin, etc.
6. **Notifications** des changements de métriques (voir [06 — Interface](06-interface.md#notifications)).
7. **Fin de l'année**, dans cet ordre :
   1. évolution automatique de la planète (voir [07 — Statut](07-statut-et-jauges.md#évolution-automatique-chaque-année)) ;
   2. effets des lois, des objets passifs (panneaux solaires…) et des grands projets ;
   3. événement **catastrophe naturelle** possible (voir ci-dessous) ;
   4. paiement du **coût de la vie** (voir [14 — Économie](14-economie.md#coût-de-la-vie)) ;
   5. **bilan de l'année** et scènes de jalons (voir [08 — Jalons](08-jalons-et-animations.md)) ;
   6. Ziko prend 1 an. À 18, 30 et 42 ans, une scène de changement d'époque se joue.
8. **Sauvegarde automatique.**

## Catastrophes naturelles

À la fin de chaque année, il peut y avoir une catastrophe. Plus la planète est chaude, plus le risque
est grand :

| Température | Chance de catastrophe par an |
|---|---|
| ≥ +3,5 °C | 25 % |
| +2,5 à +3,4 °C | 15 % |
| +1,5 à +2,4 °C | 8 % |
| < +1,5 °C | 3 % |

Il y a 4 types de catastrophes : **tempête, inondation, éruption volcanique, séisme**. Chacune apparaît
sur la [carte](09-carte-du-monde.md) dans une région au hasard et a des effets : biodiversité −1 à −2,
maladies +0 à +1 %, perte de 0 à 5 pièces. Le joueur peut envoyer ses bénévoles à l'aide la fois
suivante qu'il tombe sur une case Nettoyage. La catastrophe est alors réparée et le joueur gagne un
bonus.

## Conditions de fin

La partie se termine dans 2 cas :

| Condition | Quand | Écran |
|---|---|---|
| ⏳ **40 ans écoulés** | Fin du 40ᵉ tour : Ziko a 50 ans, on est en l'an 2540 | Épilogue normal |
| 💸 **Plus d'argent** | Au paiement du coût de la vie, Ziko ne peut pas payer (pièces < coût) | Épilogue « mission interrompue » : on calcule quand même l'année estimée |

Le magasin **prévient** le joueur avant un achat qui ne lui laisserait pas assez de pièces pour payer
l'année suivante. Ainsi, le joueur ne perd jamais « par accident ». Voir
[15 — Fin et score](15-fin-et-score.md).

## Budget temps (objectif : 20 à 25 minutes, 45 minutes au maximum)

| Élément | Durée moyenne | Fréquence | Total |
|---|---|---|---|
| Scènes d'ouverture + texte d'intro | 2 min | 1 fois | 2 min (on peut passer) |
| Tutoriel | 1 min 30 | 1 fois | 1 min 30 (on peut passer) |
| Tour simple (dé, déplacement, case rapide, bilan) | 12 s | 40 tours | 8 min |
| Mini-jeu (30 s de jeu + 15 s d'intro et de résultat) | 45 s | ~6,7 tours | 5 min |
| Combat | 40 s | ~4,4 tours | 3 min |
| Interview télé (quiz + « Le lendemain… ») | 45 s | ~2,2 tours | 1 min 40 |
| Magasin | 30 s | ~3,3 tours | 1 min 40 |
| Scènes de jalons et d'époques | — | ~15 | 1 min 30 |
| Épilogue | 1 min | 1 fois | 1 min |
| **Total** | | | **≈ 25 minutes** |

**Moyens de garder le rythme :**
- Un bouton **avance rapide** pour les déplacements et les animations.
- Les petits jalons ne bloquent jamais le jeu.
- Les mini-jeux durent **toujours 30 s** de jeu.
- Il y a toujours exactement **40 tours**, donc le jeu se termine toujours.
- Le jeu se **sauvegarde automatiquement** à chaque fin d'année, pour reprendre plus tard.
