# Ziko l'écolo — Document de conception

> **Ziko**, 10 ans, a **40 ans** pour repousser la date de fin de la vie sur Terre et améliorer la vie
> de tous les êtres vivants. C'est un jeu de plateau 2D, avec des mini-jeux d'action, des combats contre
> des monstres nés des déchets, des manifestations, des passages à la télé… et une serpillière.

## Fiche du jeu

| | |
|---|---|
| Genre | Jeu de plateau 2D, avec mini-jeux d'arcade et gestion |
| Public | Enfants dès 9 ou 10 ans, et toute la famille |
| Durée d'une partie | **20 à 25 minutes** (45 minutes au maximum) |
| Tours | **40** (1 tour = 1 an, de l'an 2500 à l'an 2540) |
| Fin | Les 40 ans sont écoulés, **ou** Ziko n'a plus d'argent |
| Score | **L'année estimée de fin de la vie sur Terre** (au départ : 2 800) et la **qualité de vie** (étoiles) |
| Plateforme | Web (HTML5), avec TypeScript et Phaser 4 |

## Les principes de conception

1. **Chaque action se voit** : notifications, jauges colorées, carte du monde, arrière-plan vivant et
   scènes de jalons.
2. **Une partie courte qui se termine toujours** : 40 tours, des mini-jeux de 30 s, des animations
   qu'on peut passer.
3. **Des choix, pas de l'accumulation** : on ne peut pas tout acheter, et l'argent gardé ne sert à
   rien.
4. **Apprendre en jouant** : tri, énergie, greenwashing, biodiversité… sans faire la leçon.
5. **De l'espoir** : on part d'une situation très grave, mais chaque progrès est fêté.

## Sommaire

| # | Document | Contenu |
|---|---|---|
| 01 | [Histoire et univers](01-histoire.md) | Prologue, Ziko et sa serpillière, les 4 époques |
| 02 | [Scènes d'ouverture](02-scenes-d-ouverture.md) | Les 15 cases de BD animées qui présentent les dangers et les sentiments de Ziko |
| 03 | [Tutoriel](03-tutoriel.md) | Le didacticiel guidé par Pousse, et les aides au bon moment |
| 04 | [Boucle de jeu](04-boucle-de-jeu.md) | Déroulé d'un tour, catastrophes, conditions de fin, budget temps |
| 05 | [Plateau et cases](05-plateau-et-cases.md) | Les 36 cases, leurs couleurs et leurs effets, les lois |
| 06 | [Interface](06-interface.md) | Disposition de l'écran, barre latérale Carte / Inventaire / Statut, notifications |
| 07 | [Statut et jauges](07-statut-et-jauges.md) | Les 8 métriques, les seuils et leurs couleurs, la dégradation |
| 08 | [Jalons et animations](08-jalons-et-animations.md) | Les scènes jouées quand un palier est atteint, les changements d'époque |
| 09 | [Carte du monde](09-carte-du-monde.md) | Le planisphère et ses points (créatures, manifestations, nettoyages…) |
| 10 | [Inventaire](10-inventaire.md) | Les objets en plusieurs exemplaires, les bénévoles et le matériel, l'Arche de Ziko |
| 11 | [Mini-jeux](11-mini-jeux.md) | 6 jeux d'arcade de 30 s, et leurs récompenses en pièces |
| 12 | [Combats](12-combats.md) | Charte arcade et duels jouables : Sac-Zombie, Méduse de pétrole et Golem de pneus |
| 13 | [Télé et interview](13-tele-interview.md) | Le quiz, l'audience, « Le lendemain… » |
| 14 | [Économie](14-economie.md) | Les pièces, le magasin, les grands projets, l'équilibrage |
| 15 | [Fin et score](15-fin-et-score.md) | Les formules de score, les fins, l'épilogue |
| 16 | [Technique](16-technique.md) | Phaser, TypeScript, architecture, simulation |
| 17 | [Direction artistique](17-direction-artistique.md) | L'atmosphère, la palette, l'arrière-plan vivant, les cadres de l'interface |
| 18 | [Chantiers verts et quêtes](18-chantiers-et-quetes.md) | Les bonnes actions selon l'âge (bornes de recharge, éoliennes, réserves naturelles…) et les quêtes d'époque |
| 19 | [Humour et dialogues](19-humour-et-dialogues.md) | Les règles de l'humour, les répliques des créatures et du boss, les interviews télé drôles |

## D'où vient ce document

Il s'appuie sur les **notes manuscrites** du projet : la page de prologue avec le statut et
l'inventaire, la page d'introduction avec le bouton Commencer, la page des cases avec les pièces, et le
dessin du super-héros. Il ajoute les idées discutées ensuite. Les **chiffres** (prix, gains, seuils)
sont des **valeurs de départ** : ils seront réglés avec la simulation d'équilibrage.

## Glossaire

| Terme | Définition |
|---|---|
| **Tour** | 1 an de la vie de Ziko |
| **Époque** | Enfant, Jeune, Adulte ou Super-héros |
| **Métrique** | Une mesure de l'état de la planète, affichée avec une jauge |
| **Niveau** | La couleur d'une jauge : critique, alerte, normal ou confortable |
| **Jalon** | Un palier atteint sur une métrique, fêté par une animation |
| **Bénévoles** | Les personnes qui suivent Ziko |
| **Participants** | Les bénévoles qui ont du matériel pour un nettoyage |
| **Loi** | Un effet permanent obtenu grâce aux manifestations |
| **Grand projet** | Un achat cher, unique et très efficace |
| **Arche de Ziko** | La collection des espèces sauvées |
| **Pièces écolo** | La monnaie du jeu |
| **Pousse** | La petite plante qui guide le joueur dans le tutoriel |
| **Greenwashing** | Faire croire qu'un produit est écologique alors qu'il ne l'est pas |
