# 10 — Inventaire

Le bouton 🎒 **Inventaire** de la barre latérale ouvre l'inventaire. Il contient **tous les objets
récoltés**. On peut avoir **plusieurs exemplaires d'un même objet** : ils s'empilent et un badge **×N**
s'affiche sur l'icône. L'inventaire sert aussi à **augmenter le nombre de personnes qui participent aux
nettoyages** organisés par Ziko.

## Organisation de l'écran

```
┌──────────────────────────── 🎒 INVENTAIRE ────────────────────────────┐
│ 🪙 127 pièces écolo                                        ✖          │
│ [ Objets ]  [ Matériel & bénévoles ]  [ Arche de Ziko ]               │
│                                                                       │
│  🧽 Serpillière  🦾 Pince ×2  🔧 Clé ×1  🧴 Éponge ×1  🚲 Vélo         │
│  📢 Mégaphone   🌱 Graines ×7  ☀️ Panneau ×2  🩹 Trousse ×3            │
│                                                                       │
│  ── Fiche de l'objet sélectionné ──────────────────────────────────── │
│  🦾 Pince à déchets ×2                                                │
│  Arme efficace contre le Sac-Zombie (dégâts ×2).                      │
│  La 2ᵉ pince équipe 3 bénévoles de plus pour les nettoyages.          │
│  [ Utiliser ]  (grisé si l'objet ne s'utilise pas maintenant)          │
└───────────────────────────────────────────────────────────────────────┘
```

Cet écran reprend la maquette des notes (pièces en haut, rangée d'icônes d'objets) en ajoutant des
onglets et une fiche par objet.

## Les objets

> Les prix et les sources sont détaillés dans [14 — Économie](14-economie.md#magasin-écolo).

| Objet | Catégorie | Empilable | Effet |
|---|---|---|---|
| 🧽 **Serpillière de Ziko** | Outil de combat (de base) | Non (unique, on ne peut pas la perdre) | Arme de base : dégâts ×1 contre toutes les créatures. Elle évolue avec les époques (voir [01 — Histoire](01-histoire.md#la-serpillière-de-ziko)). |
| 🦾 **Pince à déchets** | Outil de combat | Oui | Dégâts ×2 contre le **Sac-Zombie** |
| 🔧 **Clé à recycler** | Outil de combat | Oui | Dégâts ×2 contre le **Golem de pneus** |
| 🧴 **Éponge absorbante** | Outil de combat | Oui | Dégâts ×2 contre la **Méduse de pétrole**. Protège de la carte « Marée noire ». |
| 🌀 **Aspirateur à smog** | Outil de combat | Oui | Dégâts ×2 contre le **Nuage de smog** |
| 🥅 **Filet à déchets** | Outil | Oui | Bonus dans le mini-jeu Filet Océan (filet plus grand). Peut remplacer le paiement pour sauver une tortue ou une baleine (l'objet est consommé). |
| 🧰 **Kit de nettoyage** (gants, sacs, gilets) | Matériel | Oui | **+10 places** de participants aux nettoyages |
| 🚲 **Vélo** | Passif | Non | +1 au dé une fois par tour (au choix). Évite le piège Embouteillage. |
| 📢 **Mégaphone** | Passif | Non | +50 % de participants aux manifestations |
| 🎤 **Micro pro** | Passif | Non | Audience de la télé ×1,5 |
| 🔍 **Loupe anti-greenwashing** | Passif | Non | Annule les pièges Greenwashing et Arnaque au panneau solaire |
| ☀️ **Panneau solaire** | Passif | Oui (5 maximum) | Chacun : +2 pièces/an, énergie propre +1 %/an, gaz −0,3 %/an |
| 🌬️ **Filtre à air** | Passif | Oui (3 maximum) | Chacun : maladies −0,3 %/an |
| 🌱 **Graines d'arbres** | Consommable | Oui | Bouton « Planter » à tout moment hors combat, 1 graine : biodiversité +0,5, gaz −0,2 %. Un petit point 🌳 apparaît sur la carte. |
| 🩹 **Trousse de soin** | Consommable | Oui | En combat : rend 1 cœur |

**Plusieurs exemplaires d'un objet, à quoi ça sert ?**
- **Kits** : chaque kit ajoute 10 places de nettoyage. C'est la façon principale d'agrandir les
  nettoyages.
- **Outils de combat en plusieurs exemplaires** : chaque exemplaire **au-delà du premier** est prêté à
  des bénévoles et donne **+3 places** de nettoyage.
- **Panneaux et filtres** : leurs effets s'additionnent, jusqu'au maximum indiqué.
- **Consommables** : on peut en faire des réserves.

## Bénévoles et matériel

L'onglet **Matériel & bénévoles** montre comment Ziko agrandit son équipe de nettoyage :

```
🙋 Bénévoles inscrits ........ 140
🧰 Capacité en matériel ....... 1 (Ziko) + 10 × 9 kits + 3 × 2 outils en plus = 97
──────────────────────────────────────────────
🧹 Participants au prochain nettoyage : 97  →  multiplicateur ×2
💡 Conseil : achète 1 kit de plus pour passer à 107 participants.
```

- **Participants** = le plus petit nombre entre les **bénévoles inscrits** et la **capacité en
  matériel**.
- Le joueur doit donc **équilibrer** les deux : recruter des gens (télé, manifestations, nettoyages,
  cartes « ? ») **et** les équiper (kits, outils en plusieurs exemplaires).
- Les paliers de multiplicateur (×1 / ×1,5 / ×2 / ×3 / ×4) sont rappelés sous une barre de progression.
  Voir [05 — Plateau et cases](05-plateau-et-cases.md#-nettoyage).

**Comment gagner des bénévoles :**

| Source | Gain |
|---|---|
| Nettoyage | +2 |
| Manifestation | +20 % (au moins +3) |
| Télé | dépend de l'audience (voir [13 — Télé](13-tele-interview.md)) |
| Cartes « ? » | +5 ou +10 % |
| Piège Fausse info | −5 |

Au départ, Ziko est seul : 1 bénévole, lui-même.

## Arche de Ziko (collection)

Cet onglet montre les **10 espèces** à sauver, sous forme de vignettes. Celles qui ne sont pas encore
sauvées sont en silhouette. Pour chaque espèce sauvée, on voit l'année et la région où elle a été
sauvée, et une petite fiche « Le savais-tu ? ».

## Comment obtenir des objets

| Source | Objets |
|---|---|
| 🛒 Magasin écolo | Tous (catalogue selon l'époque) |
| ⚔️ Combat gagné | 30 % de chance de gagner l'outil efficace contre la créature suivante, ou une trousse de soin |
| 🎮 Mini-jeu avec médaille d'or | 1 graine d'arbre ou 1 kit (au hasard) |
| ❓ Carte Trouvaille | 1 objet à 15 pièces ou moins |
| 📺 Télé avec une très bonne audience | Cadeau d'un sponsor écolo : 2 kits |
| 🪤 Piège Sac troué | −1 kit |

## Notifications

Chaque nouvel objet déclenche un toast **bleu** (« 🎒 +1 Pince à déchets ») et une pastille sur le
bouton Inventaire (voir [06 — Interface](06-interface.md#notifications)).
