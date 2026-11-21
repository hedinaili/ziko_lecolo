# 18 — Chantiers verts et quêtes d'époque

Les **bonnes actions** de Ziko grandissent avec lui. Quand il est enfant, il construit un hôtel à
insectes. Jeune, il installe des **bornes de recharge pour véhicules électriques**. Adulte, il construit
des **éoliennes** et des **réserves naturelles**. Super-héros, il lance des chantiers à l'échelle
mondiale.

## 🏗️ La case Chantier vert

C'est une nouvelle case **verte** (bonne action), avec **2 cases** sur le plateau (voir
[05 — Plateau et cases](05-plateau-et-cases.md)).

**Déroulé :**
1. Une fenêtre propose les chantiers **débloqués pour l'époque de Ziko**. Ceux des époques précédentes
   restent disponibles.
2. Le joueur peut en construire **plusieurs** pendant la visite, tant qu'il a assez de pièces. Il peut
   aussi **passer**, sans pénalité.
3. Un chantier coûte des **pièces**. Certains demandent aussi un **minimum de bénévoles**.
4. Le chantier est construit : une animation courte montre l'objet construit, puis les effets
   apparaissent en toasts et un point apparaît sur la [carte](09-carte-du-monde.md). Le chantier apparaît
   aussi dans l'**arrière-plan vivant**.
5. On peut construire **le même chantier plusieurs fois**. Son prix augmente alors de **+20 %** à chaque
   fois, pour pousser le joueur à varier.

**Comme le magasin**, la fenêtre prévient si l'achat ne laisse pas assez de pièces pour le coût de la
vie de l'année suivante. Le joueur peut toujours fermer la fenêtre sans rien construire.

### Les chantiers par époque

> Effets de base. Ils sont multipliés par **×1,5** (`BALANCE.chantierEffect`), un réglage issu de la
> simulation d'équilibrage.

| Époque | Chantier | Prix | Bénévoles min. | Effets | Carte |
|---|---|---|---|---|---|
| 🧒 Enfant | 🥕 **Potager de l'école** | 5 | — | Biodiversité +1, maladies −0,5 % | 🥕 |
| 🧒 Enfant | 🐞 **Hôtel à insectes** | 4 | — | Biodiversité +1,5 | 🐞 |
| 🧒 Enfant | 🐦 **Nichoirs à oiseaux** | 4 | — | Biodiversité +1 | 🐦 |
| 🧒 Enfant | 🪱 **Composteur de quartier** | 6 | — | Gaz −0,3 %, créatures −0,25 | 🪱 |
| 🧑 Jeune | 🔌 **Borne de recharge pour véhicules électriques** | 15 | — | Gaz −0,8 %, énergie propre +1 %, maladies −0,3 %, +1 pièce/an | 🔌 |
| 🧑 Jeune | 🚴 **Piste cyclable** | 12 | 10 | Gaz −0,6 %, espérance de vie +0,3 an | 🚴 |
| 🧑 Jeune | 🌿 **Toit végétalisé** | 10 | — | Température −0,02 °C, biodiversité +1 | 🌿 |
| 🧑 Jeune | 🐝 **Ruches** | 8 | — | Biodiversité +2 | 🐝 |
| 🧑 Jeune | 🧺 **Marché de producteurs locaux** | 10 | — | Produits locaux +3 %, gaz −0,2 % | 🧺 |
| 🧔 Adulte | 🌬️ **Éolienne** | 30 | — | Énergie propre +3 %, gaz −1 %, +1 pièce/an | 🌬️ |
| 🧔 Adulte | 🌳 **Réserve naturelle de plantes** | 35 | 50 | Biodiversité +5, gaz −1 % | 🌳 |
| 🧔 Adulte | 🦌 **Réserve naturelle d'animaux** | 40 | 50 | Biodiversité +4, et **une espèce de l'Arche est sauvée** (au hasard parmi celles qui ne le sont pas encore) | 🦌 |
| 🧔 Adulte | 💧 **Dépollution de rivière** | 30 | 20 | Êtres marins +30 ans, maladies −1 % | 💧 |
| 🦸 Super-héros | 🌊 **Parc éolien en mer** | 60 | — | Énergie propre +8 %, gaz −2 %, +2 pièces/an | 🌊 |
| 🦸 Super-héros | 🌍 **Réserve naturelle mondiale** | 70 | 500 | Biodiversité +8, êtres marins +50 ans | 🌍 |
| 🦸 Super-héros | ⚡ **Réseau national de bornes de recharge** | 50 | — | Gaz −2,5 %, énergie propre +3 % | ⚡ |
| 🦸 Super-héros | 🚧 **Barrière anti-plastique océanique** | 60 | 200 | Êtres marins +80 ans, créatures −1 | 🚧 |

**Différence avec les grands projets** (voir [14 — Économie](14-economie.md#grands-projets)) : les
chantiers sont **petits, nombreux et répétables**, et liés à l'âge. Les grands projets sont **uniques,
chers et très puissants**.

**Premières fois** (grands jalons, voir [08 — Jalons](08-jalons-et-animations.md)) : première borne de
recharge, première éolienne, première réserve naturelle.

## 📋 Les quêtes d'époque

À chaque époque, Ziko reçoit **3 quêtes**. Elles donnent un **but clair** au joueur et le poussent à
essayer toutes les actions du jeu.

- Les quêtes sont présentées au début de l'époque, dans la scène de changement d'époque.
- On les retrouve dans le **journal** (bouton 📰), dans l'onglet **Quêtes**, avec une barre de
  progression.
- Une quête réussie déclenche un **petit jalon** et donne une **récompense**.
- Une quête qui n'est pas terminée à la fin de l'époque **expire**, sans pénalité.

| Époque | Quête | Objectif | Récompense |
|---|---|---|---|
| 🧒 Enfant | Petit jardinier | Construire 2 chantiers verts | 8 pièces |
| 🧒 Enfant | Premier nettoyage | Faire 2 nettoyages | 8 pièces + 3 bénévoles |
| 🧒 Enfant | Champion en herbe | Gagner une médaille (bronze ou mieux) dans un mini-jeu | 8 pièces |
| 🧑 Jeune | Rouler propre | Installer 2 bornes de recharge | 10 pièces |
| 🧑 Jeune | La loi, c'est nous | Faire voter la loi anti-plastique | 10 pièces + 10 bénévoles |
| 🧑 Jeune | Ça grandit ! | Atteindre 100 bénévoles | 10 pièces |
| 🧔 Adulte | Le vent tourne | Construire 2 éoliennes | 12 pièces |
| 🧔 Adulte | Sanctuaire | Créer une réserve naturelle (plantes ou animaux) | 12 pièces |
| 🧔 Adulte | Respirer enfin | Faire passer les gaz toxiques sous 35 % (sortir de la zone critique) | 12 pièces |
| 🦸 Super-héros | Planète protégée | Créer une réserve naturelle mondiale | 15 pièces |
| 🦸 Super-héros | Tous ensemble | Faire voter l'Accord mondial pour le climat | 15 pièces |
| 🦸 Super-héros | Le dernier combat | Vaincre le Roi des Ordures, ou empêcher sa naissance | 15 pièces |

Si toutes les quêtes sont réussies, elles rapportent 135 pièces au maximum. Un joueur moyen devrait en
réussir environ la moitié.

## Effets sur le reste du jeu

- **Plateau** : les cases 20 et 35 deviennent des 🏗️ Chantiers verts. Il y a donc 3 cases « ? » au lieu
  de 5. Voir [05 — Plateau et cases](05-plateau-et-cases.md).
- **Carte** : les chantiers apparaissent sous forme de points (🔌 🌬️ 🌳 …). Voir
  [09 — Carte du monde](09-carte-du-monde.md).
- **Arrière-plan vivant** : les éoliennes, bornes et réserves construites apparaissent dans le décor
  (voir [17 — Direction artistique](17-direction-artistique.md)).
- **Économie** : les chantiers sont une nouvelle dépense **utile**, et les quêtes une nouvelle source
  de pièces. Voir [14 — Économie](14-economie.md).
