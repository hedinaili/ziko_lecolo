# 15 — Fin de partie, score et épilogue

## Quand la partie se termine

| Fin | Condition |
|---|---|
| ⏳ **Mission accomplie** | Fin du 40ᵉ tour : Ziko a **50 ans**, on est en l'an **2540** |
| 💸 **Mission interrompue** | Ziko ne peut plus payer le coût de la vie, après le prêt unique de Mamie (voir [14 — Économie](14-economie.md#faillite)) |

En cas de **mission interrompue**, les années qui restent jusqu'en 2540 sont **simulées sans action** :
seule la dégradation automatique, les lois et les projets jouent. Ensuite, le score est calculé
normalement. Le joueur voit donc ce que son action a quand même permis, mais la faillite reste moins
bonne que d'aller au bout.

## Les deux scores

### 1. Calcul de l'année estimée

C'est **le score principal** : « La vie sur Terre pourra durer jusqu'en l'an X ».

**Étape 1 — Normaliser** chaque métrique entre 0 et 100 (100 = la meilleure valeur), avec les pires et
meilleures valeurs de [07 — Statut](07-statut-et-jauges.md#les-métriques) :

```
note(métrique) = 100 × (pire − valeur) / (pire − meilleure)     bornée entre 0 et 100
```

**Étape 2 — Calculer l'indice de durée D** :

| Métrique | Poids |
|---|---|
| 🌡️ Température | 25 % |
| ☁️ Gaz toxiques | 15 % |
| 🐠 Extinction des êtres marins | 20 % |
| 🦋 Biodiversité | 15 % |
| ⚡ Énergie propre | 10 % |
| 👹 Créatures | 10 % |
| 🛒 Produits locaux | 5 % |

Au départ, **D₀ ≈ 28,75** (valeur exacte calculée à partir des métriques de départ).

**Étape 3 — Convertir en année.** On calcule le gain **ΔD = D − D₀**, puis on lit l'année sur une
**courbe par paliers**. Entre deux paliers, la valeur est interpolée en ligne droite et arrondie à la
dizaine. La courbe a été calibrée avec la simulation (voir [14 — Économie](14-economie.md#équilibrage)) :

| ΔD | −30 ou moins | −15 | −10 | −5 | **0 (départ)** | +5 | +10 | +15 | +20 | +25 | +30 | +40 | +60 | +75 ou plus |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Année | 2 500 | 2 550 | 2 650 | 2 720 | **2 800** | 3 400 | 4 500 | 5 600 | 7 300 | 9 200 | 11 000 | 13 500 | 20 000 | 25 000 |

À titre indicatif, un joueur passif obtient environ ΔD = −6, un joueur moyen environ +8, et un expert
environ +22. Au départ, D₀ ≈ 28,75.

> Code : `YEAR_CURVE` et `estimatedYear()` dans `src/core/score.ts`.

Cette valeur est aussi affichée **en direct** dans le HUD (carte 🌍) et dans le Statut.

### 2. Qualité de vie Q (sur 100)

| Élément | Poids |
|---|---|
| ❤️ Espérance de vie des humains | 35 % |
| 🤒 Maladies | 25 % |
| ☁️ Gaz toxiques | 15 % |
| 🦋 Biodiversité | 15 % |
| 🐢 Espèces sauvées (sur 10) | 10 % |

Au départ, **Q ≈ 30**. Elle est affichée sous forme d'**étoiles** :

| Q | < 30 | 30 – 49 | 50 – 69 | 70 – 84 | ≥ 85 |
|---|---|---|---|---|---|
| Étoiles | ★ | ★★ | ★★★ | ★★★★ | ★★★★★ |

## Les fins

| Année estimée | Qualité de vie | Titre | Phrase finale |
|---|---|---|---|
| < 2 800 | toutes | **La Terre en danger** | « La vie sur Terre est encore en grand danger… mais Ziko a montré le chemin. Et si tu réessayais ? » |
| 2 800 – 3 999 | toutes | **Quelques siècles gagnés** | « On estime que la vie sur Terre pourra durer encore **quelques siècles**. C'est un début ! » |
| 4 000 – 7 999 | < 70 | **Une planète qui tient bon** | « On estime que la vie sur Terre pourra durer encore **quelques milliers d'années**… mais la vie y reste difficile. » |
| 4 000 – 7 999 | ≥ 70 | **Une planète qui revit** | « On estime que la vie sur Terre pourra durer encore **quelques milliers d'années**, et les êtres vivants y vivent mieux ! » |
| ≥ 8 000 | < 70 | **Une planète solide** | « La planète tiendra **très longtemps**… mais il reste du travail pour que tous y vivent bien. » |
| ≥ 8 000 | ≥ 70 | 🦸 **Ziko, super-héros de la Terre** | « Grâce à Ziko, la vie sur Terre pourra durer encore **plus de X ans**, et les êtres vivants y vivent heureux. » |

La phrase donne toujours le **nombre d'années** : « …jusqu'en l'an 5 300, soit encore environ
**2 760 ans** » (année estimée − année de fin).

## L'épilogue (scènes de fin)

Il reprend le format en BD des [scènes d'ouverture](02-scenes-d-ouverture.md) : arrière-plan, Ziko au
premier plan (à 50 ans, avec sa serpillière) et un encadré. Il y a **6 cases**. Chacune a une
**version bonne ou mauvaise**, selon la couleur de la métrique concernée :

| Case | Métrique | Version 🟢 / 🟡 | Version 🟠 / 🔴 |
|---|---|---|---|
| 1 | Année | « An 2540. Ziko a 50 ans. » (Ziko regarde le paysage) | Pareil, avec un ciel sombre |
| 2 | 🐠 Êtres marins | Les dauphins et le corail sont pleins de couleurs | Un océan terne, quelques poissons |
| 3 | ☁️ Gaz / 🤒 Maladies | Des enfants jouent sans masque | Des gens masqués |
| 4 | 🦋 Biodiversité / 🐢 Arche | Les espèces sauvées défilent | Des silhouettes d'espèces disparues |
| 5 | 👹 Créatures | Les décharges sont devenues des parcs | Des créatures rôdent encore |
| 6 | 🌍 Résultat | La Terre tourne, le compteur s'arrête sur l'**année estimée** et le **titre de fin** s'affiche | |

En cas de **mission interrompue**, une case est ajoutée au début : « À X ans, Ziko n'a plus les moyens
de continuer sa mission… mais ce qu'il a commencé continue. »

## Écran de résultats

Après les scènes :

```
┌──────────────────────── 🦸 ZIKO, SUPER-HÉROS DE LA TERRE ────────────────────────┐
│ 🌍 La vie sur Terre pourra durer jusqu'en l'an 9 120 (encore ≈ 6 580 ans)         │
│ Qualité de vie : ★★★★☆                                                          │
│                                                                                 │
│               An 2500        An 2540                                            │
│ ❤️ Espérance   50 ans 🔴  →  71 ans 🟡                                           │
│ 🐠 Marins      300 ans 🔴 →  1 050 ans 🟢                                        │
│ 🌡️ Température +4,0 °C 🔴 →  +2,1 °C 🟡                                          │
│ ...                                                                             │
│ 🐢 Espèces sauvées 6/10 · 📜 Lois 3/4 · 🏗️ Projets 2 · 🙋 Bénévoles 12 400        │
│ 👹 Créatures vaincues 7 · 📺 Meilleure audience 18 000 000 · 🥇 Médailles d'or 3  │
│ 🪙 Pièces non utilisées : 12 (elles auraient pu planter 7 arbres)                 │
│ ⏱️ Durée de la partie : 23 min                                                   │
│                                                                                 │
│        [ 🗺️ Revoir la carte 2500 → 2540 ]   [ 🔁 Rejouer ]   [ 🏠 Menu ]          │
└─────────────────────────────────────────────────────────────────────────────────┘
```

- **Revoir la carte** : l'évolution du planisphère défile de 2500 à 2540 (voir
  [09 — Carte du monde](09-carte-du-monde.md#interactions)).
- Le **meilleur score** (l'année estimée) est sauvegardé sur l'appareil.
