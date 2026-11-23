# 08 — Jalons et animations

Quand le joueur atteint un **palier** (un « jalon ») sur une métrique, le jeu le **fête avec une scène
animée**. Exemples : **+50 ans** avant l'extinction des êtres marins, **+5 ans** d'espérance de vie des
humains, **−5 %** de gaz toxiques. Le joueur **voit** ainsi l'effet de ses actions. Les scènes de jalons
reprennent la composition des [scènes d'ouverture](02-scenes-d-ouverture.md) : un arrière-plan qui
montre le changement, Ziko au premier plan avec une émotion, et un encadré de texte.

## Deux tailles de jalons

| Type | Quand | Affichage | Durée |
|---|---|---|---|
| ⭐ **Petit jalon** | Chaque palier régulier (voir le tableau ci-dessous) | Bandeau animé en haut de l'écran, avec une petite animation, Ziko en vignette et un son joyeux. Le jeu ne s'arrête pas. | environ 3 s |
| 🌟 **Grand jalon** | La jauge **change de couleur vers le mieux** (🔴→🟠→🟡→🟢), ou une « première fois » importante | **Scène plein écran** sur 3 couches : arrière-plan, Ziko, encadré. Musique et confettis. | 5 à 7 s, on peut passer |
| ⚠️ **Jalon d'alerte** | La jauge **change de couleur vers le pire** | Scène courte et sombre, Ziko inquiet, avec un conseil | 3 à 4 s, on peut passer |

**Règles de rythme**, pour tenir la durée de 20 à 25 minutes :
- Il y a **au maximum 1 scène plein écran par année** (par tour). Si plusieurs grands jalons arrivent
  la même année, ils sont regroupés en **une seule scène en plusieurs cases**, comme une planche de BD.
- Les petits jalons s'affichent **pendant** le jeu et ne le bloquent jamais.
- Les scènes ont lieu au **bilan de fin d'année**, ou juste après l'action qui les a déclenchées si
  c'est une « première fois ».
- Une option **Scènes de jalons : complètes / courtes / désactivées** est disponible dans les réglages.
- On estime qu'une partie contient environ **10 à 15 grands jalons**, soit environ 1 minute 30 au total.

## Paliers par métrique

Les paliers se comptent **par rapport à la valeur de départ** (an 2500). Si le joueur atteint un palier,
redescend puis le dépasse à nouveau, la scène n'est **pas rejouée**.

| Métrique | Un petit jalon tous les… | Exemples |
|---|---|---|
| 🐠 Extinction des êtres marins | **+50 ans** | 350, 400, 450… ans |
| ❤️ Espérance de vie des humains | **+5 ans** | 55, 60, 65… ans |
| ☁️ Gaz toxiques | **−5 %** | 35 %, 30 %, 25 %… |
| 🌡️ Température | **−0,5 °C** | +3,5, +3,0, +2,5 °C… |
| 🤒 Maladies | **−5 %** | 50 %, 45 %, 40 %… |
| 👹 Créatures | **−1 niveau** | 5, 4, 3… |
| 🦋 Biodiversité | **+10** | 35, 45, 55… |
| ⚡ Énergie propre | **+10 %** | 20 %, 30 %, 40 %… |
| 🛒 Produits locaux | **+10 %** | 30 %, 40 %, 50 %… |
| 🌍 Date de fin de la vie | **+500 ans** | 3 300, 3 800, 4 300… |
| 🙋 Bénévoles | ×10 | 10, 100, 1 000, 10 000 bénévoles |
| 🐢 Espèces sauvées | à chaque espèce | Ajoutée à la collection « Arche de Ziko » |

## Exemples d'animations par métrique

| Métrique | Arrière-plan animé | Ziko | Texte d'exemple |
|---|---|---|---|
| 🐠 Êtres marins | Des dauphins sautent, des poissons reviennent, le corail reprend ses couleurs, le compteur passe de 300 à 350 | joyeux, en tenue de plongée | « **+50 ans** pour les êtres marins ! Les océans respirent un peu mieux. » |
| ❤️ Espérance de vie | Une mamie danse avec ses petits-enfants dans un parc, la courbe remonte | ému | « **+5 ans** d'espérance de vie pour les humains ! » |
| ☁️ Gaz toxiques | Le nuage gris se déchire, le ciel redevient bleu, les gens enlèvent leurs masques | il respire à fond, bras ouverts | « **−5 %** de gaz toxiques. On voit enfin le ciel ! » |
| 🌡️ Température | Le thermomètre descend, la banquise se reforme, l'ours polaire saute sur la glace | soulagé, il s'évente | « La planète a perdu **0,5 °C** de fièvre. » |
| 🤒 Maladies | La salle d'attente de l'hôpital se vide, un enfant reprend le foot | content | « **5 %** de malades en moins ! » |
| 👹 Créatures | Un monstre se défait en déchets qui partent dans les bonnes poubelles | il pose en héros | « Les créatures reculent : niveau **5** ! » |
| 🦋 Biodiversité | Des fleurs poussent en accéléré, des abeilles et des papillons arrivent | il s'émerveille | « La nature reprend vie : biodiversité **+10** ! » |
| 🛒 Produits locaux | Un marché coloré se remplit de fruits et légumes, un cargo fait demi-tour au loin | il croque une pomme | « **30 %** de produits locaux ! Moins de cargos et d'avions qui polluent. » |
| ⚡ Énergie propre | Des éoliennes se mettent à tourner, des panneaux solaires s'allument | il lève le pouce | « **20 %** d'énergie propre ! Le pétrole n'est plus indispensable. » |
| 🌍 Date de fin | La Terre tourne, le compteur d'années défile | ébloui | « La vie sur Terre pourra durer jusqu'en l'an **3 300** ! » |
| 🙋 Bénévoles | Une foule grandit derrière Ziko sur la carte | fier | « Vous êtes maintenant **100** à nettoyer la planète ! » |

## Grands jalons : changement de couleur et premières fois

**Changement de couleur (vers le mieux)**, par exemple 🔴 → 🟠 :
> *Arrière-plan* : la jauge géante se remplit et change de couleur, puis l'image de la métrique (océan,
> ville, banquise…) passe en couleurs plus vives.
> *Ziko* : il saute de joie.
> *Encadré* : « Les gaz toxiques ne sont plus en zone CRITIQUE ! »

**Premières fois** (une seule fois par partie) :
- Première créature vaincue : « Ces monstres ne sont pas invincibles ! »
- Première manifestation : « Ziko n'est plus seul. »
- Premier passage à la télé : « Le monde entier commence à écouter. »
- Première loi votée : « Une loi ! La planète est protégée par la loi. »
- Premier grand projet construit
- Première espèce sauvée

## Jalons d'alerte (vers le pire)

Une scène courte et sombre, avec un **conseil** pour aider le joueur :

> *Arrière-plan* : une fumée qui s'épaissit. *Ziko* : inquiet.
> *Encadré* : « Les gaz toxiques repassent en zone CRITIQUE… »
> *Conseil* : « Les panneaux solaires et les manifestations peuvent faire baisser les gaz. »

## Scènes de changement d'époque

Quatre scènes de transition, avec la même composition (environ 6 s chacune) :

| Âge | Scène | Texte |
|---|---|---|
| 10 ans (début) | Ziko avec son sac à dos devant sa maison | « Ta mission commence. » |
| 18 ans | Ziko grandit en fondu, puis prend son vélo | « Ziko a 18 ans. Il peut maintenant organiser des manifestations en ville ! » |
| 30 ans | Ziko dans un atelier, avec des plans d'inventions | « Ziko a 30 ans. Les grands projets sont débloqués ! » |
| 42 ans | Ziko enfile sa combinaison bleue et rouge. Trois flèches blanches de recyclage ornent sa poitrine et sa cape rouge flotte au vent. Sa serpillière s'illumine et devient la **Super-Serpillière** | « Ziko est devenu un **super-héros de la Terre** ! » |

## Bilan de fin d'année

À la fin de chaque tour, un petit panneau **« Bilan de l'an 25XX »** (environ 3 s) résume :
- les changements de l'année (flèches vertes et rouges) ;
- le coût de la vie payé ;
- la scène de jalon de l'année, s'il y en a une.

## Éléments à produire

- Une animation courte (arrière-plan) par métrique, réutilisée pour tous ses paliers. Seul le chiffre
  change.
- Une version « plein écran » par métrique pour les changements de couleur.
- Une version « alerte » (couleurs sombres) par métrique.
- Les 4 scènes d'époque.
- Les sons : petit jalon (carillon), grand jalon (fanfare), alerte (son grave).
