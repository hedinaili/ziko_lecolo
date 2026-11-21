# 07 — Statut et jauges

L'écran **Statut** s'ouvre avec le bouton 📊 de la barre latérale (voir [06 — Interface](06-interface.md)).
Il montre l'état de la planète avec une **jauge par métrique**. Chaque jauge est découpée en
**4 niveaux** de couleur.

> ⚠️ Toutes les valeurs ci-dessous sont des **valeurs de départ à équilibrer** avec une simulation
> (voir [14 — Économie](14-economie.md#équilibrage)).

## Les niveaux de couleur

| Niveau | Couleur | Icône | Sens |
|---|---|---|---|
| **Critique** | 🔴 rouge | ☠️ | Danger immédiat : la jauge clignote doucement |
| **Alerte** | 🟠 orange | ⚠️ | Situation préoccupante |
| **Normal** | 🟡 jaune | ➖ | Situation acceptable |
| **Confortable** | 🟢 vert | 🌿 | Bonne situation |

Pour les joueurs daltoniens, chaque niveau a aussi une **icône** et un **mot écrit** (CRITIQUE, ALERTE,
NORMAL, CONFORTABLE), pas seulement une couleur.

## Les métriques

| # | Métrique | Unité | Départ (an 2500) | 🔴 Critique | 🟠 Alerte | 🟡 Normal | 🟢 Confortable | Pire / meilleure valeur |
|---|---|---|---|---|---|---|---|---|
| 1 | ❤️ **Espérance de vie des humains** | ans | **50** 🔴 | < 55 | 55 – 64 | 65 – 74 | ≥ 75 | 30 / 90 |
| 2 | 🐠 **Extinction des êtres marins** (temps restant) | ans | **300** 🔴 | < 400 | 400 – 699 | 700 – 999 | ≥ 1000 | 0 / 1500 |
| 3 | 🌡️ **Température globale** (écart avec la normale) | °C | **+4,0** 🔴 | ≥ +3,5 | +2,5 à +3,4 | +1,5 à +2,4 | < +1,5 | +6 / +1 |
| 4 | ☁️ **Gaz toxiques dans l'air** | % | **40** 🔴 | ≥ 35 | 20 – 34 | 10 – 19 | < 10 | 60 / 0 |
| 5 | 🤒 **Maladies liées à la pollution** (part des humains) | % | **55** 🔴 | ≥ 50 | 30 – 49 | 15 – 29 | < 15 | 90 / 0 |
| 6 | 👹 **Niveau des créatures** | 0 – 10 | **6** 🟠 | ≥ 8 | 5 – 7 | 2 – 4 | 0 – 1 | 10 / 0 |
| 7 | 🦋 **Biodiversité** (santé des espèces) | /100 | **25** 🔴 | < 30 | 30 – 49 | 50 – 74 | ≥ 75 | 0 / 100 |
| 8 | ⚡ **Énergie propre** (part des énergies renouvelables, remplace le pétrole) | % | **10** 🔴 | < 20 | 20 – 39 | 40 – 69 | ≥ 70 | 0 / 100 |
| 9 | 🛒 **Consommation de produits locaux** (moyenne mondiale) | % | **20** 🔴 | < 25 | 25 – 44 | 45 – 64 | ≥ 65 | 0 / 100 |

**Pourquoi les produits locaux ?** Un produit qui vient de loin voyage en **cargo** ou en **avion**,
deux transports très polluants. Plus le monde consomme local, moins il y a de gaz toxiques et de
pollution des océans par le transport maritime. Cette métrique monte surtout grâce à la
**sensibilisation** : manifestations, interviews télé, marchés de producteurs locaux, petits boulots de
maraîcher.

Au départ, presque tout est **rouge** : le joueur voit tout de suite que la situation est grave. Les
jauges qui passent au vert sont les grandes victoires du jeu.

### La métrique résumé : la date de fin de la vie sur Terre

En haut de l'écran Statut, une grande ligne montre :

> 🌍 **La vie sur Terre pourra durer jusqu'en l'an 2 800** *(estimation)*

Cette date est **calculée** à partir des autres métriques (formule dans
[15 — Fin et score](15-fin-et-score.md#1-calcul-de-lannée-estimée)). Elle se met à jour en direct.

| 🔴 Critique | 🟠 Alerte | 🟡 Normal | 🟢 Confortable |
|---|---|---|---|
| < an 3 000 | 3 000 – 3 999 | 4 000 – 7 999 | ≥ 8 000 |

## Évolution automatique chaque année

À la fin de chaque année (tour), la planète **évolue toute seule**. Chaque métrique dépend des autres,
comme dans la réalité. Si le joueur ne fait rien, la situation se dégrade lentement. C'est ce qui crée
la pression du jeu. Mais quand le joueur fait baisser les gaz et monter l'énergie propre, la planète
**commence à guérir d'elle-même**.

| Métrique | Évolution par an | Au départ |
|---|---|---|
| 🌡️ Température | +0,015 °C, + 0,0006 × (gaz − 30), − 0,0008 × (énergie propre − 10) | +0,021 °C |
| ☁️ Gaz toxiques | +0,3 % − 0,01 × énergie propre | +0,2 % |
| 🤒 Maladies | se rapprochent de 8 % par an de **1,2 × gaz** (un air propre soigne) | −0,56 % |
| ❤️ Espérance de vie | se rapproche de 8 % par an de **85 − 0,6 × maladies** | +0,16 an |
| 🐠 Êtres marins | −2 ans − 1 × (température − 3) | −3 ans |
| 🦋 Biodiversité | −0,05 − 0,15 × (température − 3) − 0,05 × (créatures − 5) | −0,25 |
| 👹 Créatures | +0,08 | +0,08 |
| ⚡ Énergie propre | +0,3 % (le monde progresse un peu tout seul) | +0,3 % |
| 🛒 Produits locaux | −0,1 % (la mondialisation continue) | −0,1 % |
| ↳ effet des produits locaux | gaz − 0,01 × (local − 20), êtres marins + 0,1 × (local − 20) ans, température − 0,0002 × (local − 20) | aucun au départ |

**Exemple** : avec 70 % d'énergie propre et 10 % de gaz, la température **baisse** chaque année, les
maladies reculent et l'espérance de vie remonte.

Les **lois** obtenues par les manifestations, les **objets passifs** (panneaux solaires, filtres) et
certains **grands projets** s'ajoutent à cette évolution (voir
[05 — Plateau et cases](05-plateau-et-cases.md#-manifestation) et
[14 — Économie](14-economie.md#grands-projets)).

> Les valeurs exactes sont dans `src/data/balance.ts` (`yearly` et `laws`). Elles ont été réglées avec la
> simulation d'équilibrage (voir [14 — Économie](14-economie.md#équilibrage)).

## L'écran Statut

```
┌───────────────────────── STATUT ──────────────────────────┐
│ 🌍 La vie sur Terre pourra durer jusqu'en l'an 2 800       │
│ ───────────────────────────────────────────────────────── │
│ ❤️ Espérance de vie   [███░░░░░░░] 50 ans   ☠️ CRITIQUE ▼  │
│ 🐠 Êtres marins       [██░░░░░░░░] 300 ans  ☠️ CRITIQUE ▼  │
│ 🌡️ Température        [██░░░░░░░░] +4,0 °C  ☠️ CRITIQUE ▲  │
│ ☁️ Gaz toxiques       [███░░░░░░░] 40 %     ☠️ CRITIQUE ▲  │
│ 🤒 Maladies           [██░░░░░░░░] 55 %     ☠️ CRITIQUE    │
│ 👹 Créatures          [████░░░░░░] 6/10     ⚠️ ALERTE      │
│ 🦋 Biodiversité       [██░░░░░░░░] 25/100   ☠️ CRITIQUE    │
│ ⚡ Énergie propre     [█░░░░░░░░░] 10 %     ☠️ CRITIQUE    │
│ 🛒 Produits locaux    [██░░░░░░░░] 20 %     ☠️ CRITIQUE    │
│ ───────────────────────────────────────────────────────── │
│ 🐢 Espèces sauvées : 0   📜 Lois : 0   🏗️ Grands projets : 0 │
└───────────────────────────────────────────────────────────┘
```

- **Toutes les jauges se remplissent dans le même sens** : plein = bonne situation. Par exemple, une
  température basse donne une jauge pleine.
- Des **traits** sur chaque jauge montrent les seuils entre les niveaux, et la couleur de la jauge
  change avec le niveau.
- Les flèches ▲ ▼ montrent la tendance de l'année passée (vert = mieux, rouge = pire).
- Un clic sur une métrique ouvre une **fiche explicative** pour l'enfant (« Pourquoi les gaz rendent
  malade ? ») et une **mini-courbe** de l'évolution depuis l'an 2500.

## Notifications

Chaque changement d'une métrique déclenche une notification (voir
[06 — Interface](06-interface.md#notifications)). Quand un **palier** est franchi, une scène animée se
joue (voir [08 — Jalons et animations](08-jalons-et-animations.md)).
