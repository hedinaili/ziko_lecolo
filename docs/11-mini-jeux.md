# 11 — Mini-jeux

Les mini-jeux sont de **vrais petits jeux d'action** (arcade), pas des questionnaires.

## Règles communes

| Règle | Valeur |
|---|---|
| Durée de jeu | **30 secondes** exactement, avec un chrono visible |
| Avant le jeu | Écran de présentation (environ 5 s) : titre, but en une phrase, commandes, bouton **GO !** |
| Après le jeu | Écran de résultat (environ 5 s) : score, médaille, pièces gagnées |
| Récompense | Des **pièces écolo**, selon la médaille |
| Commandes | Clavier (flèches / ZQSD + Espace) **ou** souris **ou** tactile, au choix pour chaque jeu |
| Difficulté | Elle augmente avec l'**époque** de Ziko : vitesse, nombre d'ennemis |
| Pièges dans le jeu | Il y a toujours des **animaux ou objets à ne pas toucher**. Les toucher fait perdre des points. Ça apprend à faire attention. |
| Record | Le meilleur score de chaque mini-jeu est sauvegardé |

### Barème des récompenses

| Résultat | Score | Pièces | Bonus |
|---|---|---|---|
| Aucune médaille | < 40 % de l'objectif | **2** (pour la participation) | — |
| 🥉 Bronze | 40 – 69 % | **6** | — |
| 🥈 Argent | 70 – 89 % | **12** | Petit bonus sur la métrique du jeu |
| 🥇 Or | ≥ 90 % | **20** | Bonus sur la métrique + 1 graine ou 1 kit |

Le **bonus sur la métrique** est petit : par exemple gaz −0,3 %, ou êtres marins +5 ans. Il apparaît en
toast. L'objectif de score est réglé pour qu'un enfant de 10 ans obtienne souvent le bronze ou l'argent.

Pour les deux jeux jouables, seul le palier or est relevé : 100 % de l’objectif dans Astro-Ziko et 135 % dans Tri Express. Enfant, cela représente respectivement 120 et 270 points (dix bons tris consécutifs). Les gains en pièces restent identiques.

## Les 6 mini-jeux (un par case Mini-jeu)

### 1. 🚀 Astro-Ziko — *shoot'em up* (Océan Pacifique)
- **Version jouable** : la case 1 lance une manche de 30 secondes. Flèches, souris ou doigt pour piloter ; tir automatique. Un sac vaut 10 points, une bouteille 15, une mouette touchée coûte 10 points (minimum zéro). Le résultat crédite le budget avant le retour au plateau. Pour tester sans attendre le bon lancer, ouvrir `/?defi=astro` : seul le premier dé de l’aperçu est fixé à 1. Les sacs géants, variantes d’ennemis et bonus ci-dessous sont prévus pour une version ultérieure.
- **Le but** : Ziko pilote un petit **vaisseau spatial** au-dessus de l'océan et **désintègre les sacs
  plastiques** qui flottent dans le ciel et tombent vers la mer.
- **Commandes** : flèches, ZQSD ou WASD, souris, ou doigt maintenu et glissé. Le tir est automatique. Plus la navette parcourt de distance latéralement, plus la coque s’incline autour de son axe longitudinal, jusqu’à 45° de chaque côté. Elle se redresse progressivement quand le déplacement latéral cesse. Le décor marin oscille doucement ; ses reflets et sa légère parallaxe restent indépendants des collisions.
- **Impact** : un petit anneau turquoise et quelques étincelles apparaissent sur le déchet touché. L’anneau est plus discret au premier impact sur une bouteille. Une mouette touchée déclenche un anneau ambré sans étincelles.
- **Avant le départ** : le briefing illustre les trois cibles avec leurs icônes de jeu et leur barème. La rubrique « Étoiles et pièces » détaille les seuils en points pour l’âge actuel. Le chronomètre démarre seulement après validation.
- **Turbo** : Espace ou clic gauche ; sur écran tactile, bouton translucide à droite utilisable avec un deuxième doigt pendant le pilotage. La vitesse de déplacement augmente de 80 % pendant 2 secondes et les flammes s’allongent. La jauge se recharge ensuite en 5 secondes ; le tir automatique reste inchangé.
- Pendant la recharge, la barre orange se remplit sans halo. Une fois le turbo prêt, le contour s’allume en orange et un point lumineux en fait le tour en boucle. Ces deux effets disparaissent dès l’activation.
- À l’activation, un souffle d’air filtré et un grondement grave montent en régime puis s’estompent. Un nouvel appui pendant la poussée ou la recharge ne relance pas le son.
- **Mouette** : le nombre de points effectivement perdus apparaît en rouge à l’impact, monte et s’efface en moins d’une seconde. Le score ne descend jamais sous zéro.
- **Son** : un tir doux, un impact mat pour le sac, cristallin pour la bouteille, descendant pour la mouette. L’icône de haut-parleur sous les cartes de droite du plateau règle le son pour toute la manche et son bilan ; elle est barrée en sourdine. Chaque étoile gagnée joue une note ascendante ; la troisième déclenche deux petites gerbes lumineuses (sauf en mode animations réduites).
- **Bilan de manche** : les icônes des bouteilles, sacs et mouettes accompagnent le nombre de cibles distinctes touchées et leur contribution au score. Une bouteille touchée une seule fois compte comme cible touchée mais ne rapporte pas encore de points.
- **Étoiles** : au-dessus du score, trois emplacements gris bien visibles forment un petit arc. Après une courte pause, seules les étoiles gagnées deviennent dorées, de gauche à droite (participation 0, bronze 1, argent 2, or 3). Les autres restent grises jusqu’à la fermeture du bilan. En mode animations réduites, le résultat est visible immédiatement.
- **Ennemis** : des sacs (1 tir), des bouteilles (2 tirs), des **sacs géants** qui se divisent en
  2 petits sacs. Plus rarement, un **mini Sac-Zombie** (5 tirs, rapporte beaucoup de points).
- **À éviter** : les mouettes et les tortues volantes du bonus. Les toucher fait perdre des points.
- **Bonus à ramasser** : tir triple, bouclier, aimant à déchets.
- **Bonus de métrique (argent / or)** : êtres marins +10 / +20 ans.

### 2. ♻️ Tri Express — tri rapide (Europe)
- **Version jouable** : case 7. Pour essayer sans attendre, `/?defi=tri` place la figurine sur la case 6 et fixe le premier dé à 1. La manche dure 30 secondes, puis le bilan récapitule les bons tris, les erreurs, les objets passés, les étoiles et les pièces.
- Glisser l’objet ou toucher directement un bac ; au clavier, touches 1 à 4 (5 pour la pile), ou gauche/droite puis Entrée. Les bons tris consécutifs rapportent 10, 20 puis 30 points par objet. Une erreur enlève 5 points sans passer sous zéro ; une erreur ou un objet passé remet la série à zéro.
- **Le but** : des déchets défilent sur un tapis roulant. Il faut les envoyer dans la **bonne
  poubelle** : jaune (emballages), verte (verre), marron (compost), grise (le reste).
- **Commandes** : glisser-déposer ; ou les touches 1-2-3-4 ; ou les flèches.
- **Difficulté** : le tapis accélère, des déchets « pièges » apparaissent (pot de yaourt, pile…). Les
  **piles** vont dans le cinquième bac, toujours visible. Chaque bac porte un pictogramme au-dessus de son nom. L’objet voyage seul sur un convoyeur à rouleaux ; le voyant de l’atelier réagit au tri.
- **Bilan par bac** : « Jetés » compte les dépôts dans ce bac, « Dont erreurs » les dépôts incorrects parmi eux, « Ratés » les objets destinés à ce bac qui sont sortis du tapis.
- **Décor** : une verrière panoramique ouvre l’atelier sur les collines. L’extracteur et la presse à carton encadrent la piste ; le centre reste dégagé pour suivre le déchet.
- **Combo** : chaque bonne réponse d'affilée multiplie les points.
- **Bonus de métrique** : gaz −0,6 / −1,2 %.

### 3. 🥅 Filet Océan — adresse (Océan Indien)
- **Décor** : vue mi-air, mi-eau d’un lagon, avec îles à l’horizon, lumière filtrée par les vagues et récifs sur les côtés. Le bateau et les animaux utilisent des illustrations détourées ; la zone centrale reste dégagée pour viser. Le téléphone charge une version allégée du paysage.
- **Version jouable** : case 12 ; `/?defi=filet` place la figurine juste avant pour tester. Pendant 30 secondes, le cercle montre la zone de chute selon la charge. Anticipe la dérive pendant le vol : tous les objets dans le filet comptent (+10 par sac, +15 par bouteille, −10 par animal ; score minimum zéro). Flèches et Espace permettent aussi de viser, charger et relâcher. Le bilan indique les prises et crédite la récompense une seule fois.
- **Le but** : depuis un bateau, Ziko **lance un filet** pour attraper les déchets qui flottent entre
  deux eaux.
- **Commandes** : viser avec la souris ou le doigt, maintenir pour la puissance, relâcher pour lancer.
- **À éviter** : les poissons, les dauphins et les méduses (les vraies). Attraper un animal fait perdre
  des points.
- **Avec l'objet 🥅 Filet à déchets** : le filet est 30 % plus grand.
- **Bonus de métrique** : êtres marins +10 / +20 ans.

### 4. 🌳 Forêt Éclair — rythme et rapidité (Afrique)
- **Décor** : une clairière de savane en lumière matinale, avec de la terre ocre, des herbes sèches et des escarpements au loin. Les parcelles teintées laissent voir la texture du sol. Les acacias détourés reprennent la lumière du paysage, et le téléphone charge une version allégée du décor.
- **Version jouable** : case 18 (`/?defi=foret` pour y arriver au premier lancer). Six parcelles, 30 secondes. Un arbre arrosé vaut 20 points ; une pousse séchée ou une tentative sur un sol pollué coûte 5 points, sans passer sous zéro. Flèches puis Entrée/Espace, clic ou toucher. La cadence augmente avec l’âge de Ziko. Les acacias sauvés poussent en accéléré avant le bilan et la remise des pièces.
- **Le but** : sur une terre sèche, des **zones fertiles** s'allument. Il faut planter une graine
  dedans au bon moment, puis l'arroser quand une goutte apparaît.
- **Commandes** : clic ou appui (planter), deuxième clic (arroser). Ou les touches de direction pour
  choisir une zone.
- **À éviter** : planter sur une zone polluée (marron), ou laisser une pousse sécher.
- **Résultat** : à la fin, la forêt plantée **pousse en accéléré**, pour le plaisir.
- **Bonus de métrique** : biodiversité +2 / +4.

### 5. 🌀 Smog Buster — action (Asie)
- **Décor** : vue réaliste depuis les toits d’une ville au bord du fleuve, avec un pont et des montagnes dans la brume. Le panorama est distinct de celui du prologue et existe en version allégée pour téléphone. Les volutes de pollution sont grises ou, pour les nuages rapides, orangées.
- **Version jouable** : case 24 (`/?defi=smog` pour y arriver au premier lancer). En 30 secondes, approcher et aspirer un nuage gris (+10) ou un rapide orangé (+15). Un nuage qui atteint la rue coûte 5 points ; aspirer un oiseau coûte 10 points, avec un score minimum de zéro. Au tactile, maintenir et glisser pour voler et aspirer ; lever le doigt pour refroidir. À pleine chaleur, l’aspiration s’interrompt jusqu’au refroidissement complet. Le bilan récapitule nuages, oiseaux, étoiles et pièces.
- **Le but** : Ziko vole avec un **jetpack à aspirateur** au-dessus d'une ville et **aspire les nuages
  de smog** avant qu'ils touchent les habitants.
- **Commandes** : se déplacer dans les 4 directions, maintenir Espace ou le clic pour aspirer (avec une
  jauge de surchauffe).
- **Ennemis** : des petits nuages, et des **nuages qui foncent** sur Ziko.
- **À éviter** : les oiseaux qui traversent l'écran.
- **Bonus de métrique** : gaz −0,6 / −1,2 %, maladies −0,6 / −1 %.

### 6. 🚲 Vélo Turbo — course sans fin (Amérique du Sud)
- **Graphismes** : chaque âge de Ziko a son cycliste illustré en pied avec casque et vélo. Deux poses alternent au pédalage ; une troisième le montre penché sur le guidon. Le panorama andin possède une version allégée pour téléphone.
- **Version jouable** : case 30 (`/?defi=velo` pour y arriver au premier lancer). Pendant 30 secondes, les canettes valent 10 points et les pièces de piste 15. Sauter par-dessus les obstacles au sol et se baisser sous les gaz des voitures (touche ↓ ou bouton à maintenir). Un contact enlève 5 points, sans passer sous zéro. Le bilan distingue les objets de piste des pièces écolo créditées au plateau.
- **Le but** : Ziko pédale sur une route qui défile. Il doit **sauter** les obstacles (flaques de
  pétrole, pneus) et **ramasser** des pièces et des canettes à recycler.
- **Commandes** : Espace, flèche du haut ou appui pour sauter (appui long = saut plus haut), flèche du
  bas pour se baisser.
- **À éviter** : les voitures polluantes, et les hérissons qui traversent la route (on passe au-dessus
  en sautant).
- **Avec l'objet 🚲 Vélo** : vitesse et points +10 %.
- **Bonus de métrique** : énergie propre +1 / +2 %.

## Évolution de la difficulté selon l'époque

| Époque | Vitesse | Ennemis | Objectif de score |
|---|---|---|---|
| Enfant | ×1,0 | peu | ×1,0 |
| Jeune | ×1,15 | + variantes | ×1,15 |
| Adulte | ×1,3 | + ennemis résistants | ×1,3 |
| Super-héros | ×1,45 | + mini-boss | ×1,45 |

Les gains en pièces **ne changent pas** avec l'époque. C'est le coût de la vie qui augmente (voir
[14 — Économie](14-economie.md)). Ainsi, les mini-jeux restent importants jusqu'à la fin.

## Idées de mini-jeux supplémentaires (plus tard)

- 💡 **Coupe-Lumière** : éteindre les fenêtres allumées inutilement dans un immeuble (jeu de rapidité).
- 🪸 **Récif** : reconstruire un récif de corail en reliant des coraux de même couleur.
- 🐝 **Ruche** : guider des abeilles vers les fleurs en évitant les pesticides.

Ils pourront être tirés au sort par des cartes « ? », pour varier les parties.
