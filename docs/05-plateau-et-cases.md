# 05 — Plateau et cases

## Le plateau

La [maquette proposée](images/maquette-plateau.png) distingue le parcours et le carnet : la **Boutique** est un menu permanent, pas une case. La consulter ne coûte ni déplacement ni tour. La répartition ci-dessous est la cible pour le futur plateau jouable.

- C'est une **boucle de 36 cases** en forme d'**ovale**, posée en perspective sur le sol de la scène
  illustrée, dans la partie gauche de l'écran (voir [06 — Interface](06-interface.md#écran-principal-le-plateau)).
- Les cases sont des **pastilles arrondies** avec une icône et la couleur de leur type. Les cases du
  fond sont un peu plus petites pour donner de la profondeur. Un espace d’au moins 4 pixels de jeu sépare leurs zones tactiles, même dans les virages.
- La face et le pictogramme sont en **couleurs unies**. Une tranche sombre et un liseré clair sur le bord donnent le relief. À chaque saut de Ziko, un anneau lumineux souligne brièvement la case touchée, y compris à l’arrivée, sans masquer son symbole.
- Au-dessus du plateau, l'**arrière-plan vivant** (la Terre et la ville de Ziko) change d'aspect avec
  les métriques.
- Si 36 pastilles sont trop serrées à l'écran, on peut passer à un **ovale double** (deux anneaux
  reliés) sans changer la répartition des cases.
- Chaque case porte une **icône**, une **couleur** et souvent une **région du monde**. Quand une action a
  lieu sur une case, un point apparaît dans cette région sur la [carte du monde](09-carte-du-monde.md).
- En 40 tours, avec une moyenne de 3,5 cases par lancer de dé, Ziko fait environ **4 tours de
  plateau**.

## Couleurs des cases

Les notes disent : **case verte = bonne action**. On complète ainsi :

| Couleur | Famille | Cases |
|---|---|---|
| 🟩 Vert gazon, pomme ou feuille | Bonne action | Nettoyage, Animal à sauver, Chantier vert |
| Rose framboise | Mobilisation | Manifestation |
| 🟦 Bleu vif | Jeu | Mini-jeu |
| 🟥 Rouge | Danger | Combat |
| ⬛ Gris foncé | Danger caché | Piège |
| 🟨 Jaune | Surprise | Case « ? » |
| 🟧 Orange | Argent | Petit boulot |
| 🩵 Cyan | Médias | Télé |
| ⭐ Or | Départ | Maison de Ziko |

## Répartition des 36 cases

| Type | Nombre | Origine |
|---|---|---|
| ⭐ Départ (maison de Ziko) | 1 | ajout |
| ❓ Case « ? » | 3 | notes |
| 🏗️ Chantier vert | 3 | ajout (voir [18](18-chantiers-et-quetes.md)) |
| 🎮 Mini-jeu | 6 | notes |
| 🧹 Nettoyage | 5 | notes |
| ⚔️ Combat | 4 | notes |
| 📣 Manifestation | 4 | notes |
| 🪤 Piège | 3 | notes |
| 📺 Télé | 2 | ajout |
| 💼 Petit boulot | 3 | ajout |
| 🐢 Animal à sauver | 2 | ajout |

## Ordre des cases sur le plateau

| N° | Case | Détail / région | N° | Case | Détail / région |
|---|---|---|---|---|---|
| 0 | ⭐ Départ | Maison de Ziko | 18 | 🎮 Mini-jeu | Forêt Éclair — Afrique |
| 1 | 🎮 Mini-jeu | Astro-Ziko — Océan Pacifique | 19 | 📣 Manifestation | Océanie |
| 2 | ❓ ? | | 20 | 🏗️ Chantier vert | |
| 3 | 🧹 Nettoyage | Plage — Océan Atlantique | 21 | ⚔️ Combat | Golem de pneus — Amérique du Nord |
| 4 | 💼 Petit boulot | | 22 | 📣 Manifestation | Europe |
| 5 | ⚔️ Combat | Sac-Zombie — Asie | 23 | 🧹 Nettoyage | Rivière — Asie |
| 6 | 🧹 Nettoyage | Europe | 24 | 🎮 Mini-jeu | Smog Buster — Asie |
| 7 | 🎮 Mini-jeu | Tri Express — Europe | 25 | 🐢 Animal à sauver | Grande Barrière de corail — Océanie |
| 8 | 🪤 Piège | | 26 | 💼 Petit boulot | |
| 9 | 📣 Manifestation | Amérique du Nord | 27 | 🪤 Piège | |
| 10 | 🐢 Animal à sauver | Banquise — Arctique | 28 | ❓ ? | |
| 11 | ❓ ? | | 29 | ⚔️ Combat | Nuage de smog — Europe |
| 12 | 🎮 Mini-jeu | Filet Océan — Océan Indien | 30 | 🎮 Mini-jeu | Vélo Turbo — Amérique du Sud |
| 13 | ⚔️ Combat | Méduse de pétrole — Océan Atlantique | 31 | 📺 Télé | |
| 14 | 📺 Télé | | 32 | 🏗️ Chantier vert | |
| 15 | 🧹 Nettoyage | Forêt amazonienne — Amérique du Sud | 33 | 📣 Manifestation | Afrique |
| 16 | 💼 Petit boulot | | 34 | 🧹 Nettoyage | Océan Austral — Antarctique |
| 17 | 🪤 Piège | | 35 | 🏗️ Chantier vert | |

## Détail des cases

### ⭐ Départ
Chaque fois que Ziko **passe** ou **s'arrête** sur la case Départ, il reçoit **+15 pièces** (son
allocation).

### 🎮 Mini-jeu
Lance le mini-jeu de la case, qui dure 30 s. Il rapporte de **0 à 20 pièces** selon le score, et parfois
un petit bonus sur une métrique. Voir [11 — Mini-jeux](11-mini-jeux.md).

### 🧹 Nettoyage
Ziko organise une **campagne de nettoyage** dans la région de la case.
- **Participants** = le plus petit nombre entre les **bénévoles** et la **capacité en matériel**
  (1 + 10 par *kit de nettoyage* de l'inventaire). Voir [10 — Inventaire](10-inventaire.md#bénévoles-et-matériel).
- Le **multiplicateur** dépend du nombre de participants :

| Participants | 1 – 9 | 10 – 49 | 50 – 199 | 200 – 999 | 1 000 et plus |
|---|---|---|---|---|---|
| Multiplicateur | ×1 | ×1,5 | ×2 | ×3 | ×4 |

- **Effets de base** (à multiplier) : gaz −1,2 %, biodiversité +2, créatures −0,5 (un point de pollution
  disparaît de la carte), et êtres marins +15 ans si la région est un océan.
- **Gains** : +3 pièces (vente du recyclage), plus 1 pièce par palier de multiplicateur atteint, et
  **+2 bénévoles** (des passants qui viennent aider).
- Si une **catastrophe** est en cours, les bénévoles vont aider : la catastrophe est réparée et le
  joueur gagne un bonus de biodiversité +2.
- Un point 🧹 apparaît sur la carte.

### ⚔️ Combat
Une créature des déchets attaque. Voir [12 — Combats](12-combats.md).

### 📣 Manifestation
Ziko organise une manifestation dans la région de la case.
- **Participants** = les bénévoles, avec +50 % si Ziko a un **mégaphone**.
- Chaque manifestation donne : **+20 % de bénévoles** (au moins +3), gaz −1 %, énergie propre +0,5 %,
  produits locaux +1 % (sensibilisation), et un point 📣 sur la
  carte. Ce point grossit avec le nombre de participants.
- Si les participants atteignent un **seuil**, une **loi** est votée. C'est un grand jalon. Les lois ont
  un effet **permanent** :

| Loi | Participants nécessaires | Époque minimum | Effet permanent |
|---|---|---|---|
| 📜 Loi anti-plastique | 50 | Enfant | Les créatures augmentent 2 fois moins vite. Êtres marins +5 ans/an. |
| 📜 Loi air pur | 200 | Jeune | Gaz toxiques −0,5 %/an. Maladies −0,3 %/an. |
| 📜 Loi protection des océans | 1 000 | Jeune | Êtres marins +10 ans/an. |
| 📜 Loi sur les centrales propres : interdit les centrales électriques très polluantes (charbon, fioul…) ou qui consomment énormément d'eau | 2 500 | Adulte | Énergie propre +1,5 %/an, gaz −0,3 %/an, biodiversité +0,1/an (rivières préservées), êtres marins +2 ans/an. |
| 📜 Accord mondial pour le climat | 5 000 | Super-héros | Température −0,04 °C/an. Énergie propre +1,5 %/an. |

- Les lois sont votées dans l'ordre du tableau. Une manifestation fait voter **toutes les lois dont le
  seuil et l'époque sont atteints**, en s'arrêtant à la première loi qui n'est pas encore possible.
  Avec environ 3 manifestations par partie, c'est ce qui rend les 5 lois atteignables.

### 🐢 Animal à sauver
Une espèce est en danger dans la région de la case. Ziko peut la sauver en payant **15 pièces** (ou
20 pièces à partir de l'époque Adulte), **ou** en utilisant l'objet adapté (filet, graines…).
- L'espèce rejoint la collection **« Arche de Ziko »**, visible dans l'inventaire.
- Effets : biodiversité +3, et un effet spécial selon l'animal (tortue marine → êtres marins +20 ans ;
  abeille → biodiversité +2 de plus ; ours polaire → une scène de jalon dédiée).
- Un point 🐢 apparaît sur la carte.
- Le joueur peut **refuser**. L'espèce reste alors en danger et biodiversité −1.
- L'animal proposé change à chaque passage (ours polaire, tortue marine, abeille, orang-outan, baleine,
  koala, éléphant, panda roux…), avec 10 espèces en tout.

### ❓ Case « ? »
Le joueur tire une **carte surprise**. En moyenne, elles sont un peu favorables.

| Carte | Effet |
|---|---|
| Pluie de recyclage | +8 pièces |
| Un voisin rejoint ta cause | +5 bénévoles |
| Quiz éclair | Bonne réponse : +5 pièces |
| Marée noire ! | Êtres marins −10 ans (évité si Ziko a une éponge absorbante) |
| Trouvaille | Un objet du magasin au hasard (prix ≤ 15) |
| Vague de chaleur | Température +0,05 °C, maladies +1 % |
| Article dans le journal | +10 % de bénévoles |
| Panne d'électricité | Avec au moins 1 panneau solaire : +5 pièces. Sinon : −3 pièces |
| Ruche sauvée | Biodiversité +2 |
| Créature errante | Créatures +0,5 (nouveau point 👹 sur la carte) |
| Prix de l'école / de la ville | +10 pièces |
| Raccourci | Avance de 3 cases |

### 🪤 Piège
Les pièges **apprennent** quelque chose, souvent à reconnaître les fausses bonnes idées. En moyenne, ils
font perdre environ 8 pièces.

| Piège | Effet | Comment l'éviter |
|---|---|---|
| **Greenwashing** : un produit « 100 % écolo » qui ne l'est pas | −8 pièces | Avoir la loupe anti-greenwashing |
| **Arnaque au panneau solaire** | −10 pièces | Avoir la loupe anti-greenwashing |
| **Fausse info sur Internet** | −5 bénévoles | Répondre juste à une question vrai/faux |
| **Sac troué** | −1 kit de nettoyage | — |
| **Embouteillage** | Recule de 2 cases | Avoir le vélo |
| **Flaque glissante** : Ziko glisse… mais sa serpillière sauve la situation ! | Aucune perte, petit gag | — |

### 💼 Petit boulot
Ziko travaille pour gagner des pièces. Il a **le choix** :

| Choix | Enfant | Jeune | Adulte | Super-héros | Bonus |
|---|---|---|---|---|---|
| **Boulot classique** | +6 | +10 | +14 | +18 | — |
| **Boulot écolo** (réparateur, maraîcher, installateur solaire…) | +3 | +5 | +7 | +9 | Énergie propre +1 % **ou** biodiversité +1 **ou** gaz −0,3 % **ou** produits locaux +1,5 % (maraîcher) |

### 🏗️ Chantier vert
Ziko construit une bonne action adaptée à son âge : potager, borne de recharge pour véhicules électriques,
éolienne, réserve naturelle… Voir [18 — Chantiers verts et quêtes](18-chantiers-et-quetes.md).

### Boutique (hors plateau)
Le bouton du carnet ouvre le [magasin écolo](14-economie.md#magasin-écolo). À la fermeture, Ziko reste sur sa case.

### 📺 Télé
Ziko est invité à la télévision. Voir [13 — Télé et interview](13-tele-interview.md).
