# 16 — Technique

> Choix validé : **jeu web 2D en HTML5**, avec **TypeScript + Phaser 4**.

## Pile technique

| Besoin | Outil |
|---|---|
| Moteur 2D (scènes, sprites, animations, entrées clavier/souris/tactile, son) | **Phaser 4** |
| Langage | **TypeScript** (mode strict) |
| Build et serveur de développement | **Vite** |
| Tests | **Vitest** (unitaires et intégration du moteur), **Playwright** (interface dans le navigateur), **fast-check** (tests de propriétés) |
| Sauvegarde | `localStorage` (sauvegarde automatique à chaque fin d'année) |
| Mise en ligne | Site statique (GitHub Pages par exemple) |

## Architecture

Le principe clé est de **séparer les règles du jeu de l'affichage**.

```
src/
  core/            ← moteur de règles en TypeScript pur, SANS Phaser (testable, simulable)
    state.ts       ← GameState : année, âge, pièces, bénévoles, métriques, inventaire, lois, projets, historique
    metrics.ts     ← définitions, seuils, normalisation, dégradation, liens entre métriques
    tiles.ts       ← résolution des cases
    economy.ts     ← magasin, coût de la vie, faillite
    chantiers.ts   ← chantiers verts selon l'époque
    quests.ts      ← quêtes d'époque et progression
    milestones.ts  ← détection des paliers et des changements de niveau
    score.ts       ← indice D, année estimée, qualité de vie Q, choix de la fin
    events.ts      ← bus d'événements (MetricChanged, LevelChanged, MilestoneReached, ItemAdded…)
    rng.ts         ← générateur pseudo-aléatoire avec « graine » (parties rejouables, tests)
    ui-state.ts    ← UiStateMachine : un seul écran ou une seule fenêtre à la fois, transitions autorisées (sans Phaser, testable)
  data/            ← contenu en JSON (modifiable sans toucher au code)
    tiles.json  items.json  metrics.json  creatures.json  cards.json  traps.json
    quiz.json  animals.json  laws.json  projects.json  intro-panels.json  milestones.json
  scenes/          ← affichage avec Phaser
    Boot, Preload, Title (mode vitrine), IntroPanels, IntroText, Tutorial (couche par-dessus),
    Board (scène + plateau + colonne de droite), Map, Inventory, Status, News, Shop,
    Combat, TvInterview, YearSummary, Milestone, EraTransition, Epilogue, Results
    minigames/ AstroZiko, TriExpress, FiletOcean, ForetEclair, SmogBuster, VeloTurbo
  ui/              ← composants (boutons, cadres, bulles), séquence de BD (sequence.ts), appareil (device.ts)
    paint/         ← rendu peint de secours en Canvas 2D (décors, Ziko, créatures)
  sim/             ← robots joueurs (bot.ts) et simulation d'équilibrage (simulate.ts)
public/art/        ← illustrations peintes en WebP, pleine taille et demi-taille (@small)
tools/
  simulate.ts      ← simulation d'équilibrage en ligne de commande (npm run simulate)
  prepare-art.py   ← conversion des illustrations (recadrage 16:9, WebP, 2 tailles)
  screens.ts       ← captures d'écran de l'intro (contrôle visuel)
```

- Le **core** émet des **événements**. L'interface les écoute pour afficher les **toasts**, les
  **pastilles**, les **scènes de jalons** et les **points de carte**. Ainsi, aucune règle n'est codée
  dans l'affichage.
- Les **points de la carte** sont calculés à partir de `GameState` (métriques et historique des
  actions avec leur région).
- Les **cases de BD** (intro, jalons, épilogue) utilisent un seul composant `PanelComic` (arrière-plan,
  personnage, encadré, bulle), décrit en JSON dans `intro-panels.json` et `milestones.json`.

## Affichage

- Téléphones et petits écrans : voir [06 — Interface](06-interface.md#téléphones-et-petits-écrans).
- Illustrations : voir [17 — Direction artistique](17-direction-artistique.md#illustrations-peintes-niveau-de-qualité-de-référence).

- Résolution de référence **1280 × 720**, adaptée à l'écran (`Scale.FIT`).
- Disposition : **zone scène et plateau à gauche (environ 65 %), colonne à droite (environ 35 %)**.
  Voir [06 — Interface](06-interface.md).
- L'**arrière-plan vivant** est fait de calques. Chaque calque (ciel, arbres, éoliennes, créatures…) a
  plusieurs états, choisis selon les métriques.

## Simulation d'équilibrage

`tools/simulate.ts` joue des **milliers de parties** sans affichage, avec plusieurs profils de robots :
passif, moyen, expert, dépensier, économe. Les mini-jeux et combats sont simulés par des tirages selon
le profil. La simulation mesure :
- les pièces à la fin (cible : 0 à 50 pour un joueur moyen) ;
- le taux de faillite (cible : moins de 5 %) ;
- la répartition des années estimées et des fins ;
- le nombre de jalons et de scènes par partie (pour le budget temps) ;
- une estimation de la durée de la partie, à partir des durées moyennes de
  [04 — Boucle de jeu](04-boucle-de-jeu.md#budget-temps-objectif--20-à-25-minutes-45-minutes-au-maximum).

## Exigences de qualité

Ces 3 exigences sont **obligatoires**. Une fonctionnalité qui ne les respecte pas n'est pas terminée.

### 1. Performance : un jeu fluide, sans lag

| Cible | Valeur |
|---|---|
| Images par seconde | **60 FPS stables** sur un PC ou une tablette d'entrée de gamme, et aussi pendant les mini-jeux |
| Temps d'une image | < 16 ms, sans à-coups de plus de 33 ms |
| Premier chargement | < 5 s. Les écrans suivants s'ouvrent en < 300 ms. |
| Mémoire | stable sur une partie complète de 45 min, sans fuite |

**Règles d'implémentation :**
- **Atlas de textures** (feuilles de sprites) et chargement progressif. Les éléments d'un mini-jeu sont
  chargés pendant son écran de présentation.
- **Réserves d'objets** (*pooling*) pour les projectiles, les déchets, les particules et les toasts :
  pas de création ni de destruction d'objets à chaque image.
- **Aucun calcul lourd à chaque image** : les métriques, le score et les points de carte sont recalculés
  **seulement quand l'état change** (sur les événements), jamais dans `update()`.
- Les fenêtres qui ne sont pas visibles sont **mises en pause** (`scene.sleep`) et leurs objets
  graphiques ne sont pas mis à jour.
- Les animations utilisent les *tweens* de Phaser (accélérés par le processeur graphique). Le nombre de
  particules est limité.
- Chaque scène **libère** ses écouteurs d'événements et ses timers à l'arrêt (`shutdown`), pour éviter
  les fuites de mémoire.
- **Mesure continue** : un compteur de FPS en mode développement, et un test de performance automatisé
  (voir plus bas).

### 2. Pas de blocage (soft lock) et un seul menu à la fois

Un **soft lock** est une situation où le jeu tourne encore, mais où le joueur ne peut plus avancer.
Exemples : un bouton grisé pour toujours, un menu qu'on ne peut pas fermer, une animation qui ne se
termine jamais.

**Gestionnaire d'écrans unique** (`UiStateMachine`) : **un seul composant** décide de ce qui est
affiché. Aucune scène n'ouvre une fenêtre directement.

| État | Ce qui est affiché | Peut ouvrir |
|---|---|---|
| `Board.Idle` | Le plateau, en attente du dé | Carte, Inventaire, Statut, Journal, Aide, Menu ⚙️, Lancer le dé |
| `Board.Moving` | Ziko se déplace | Rien (il reste ⏩ avance rapide) |
| `Overlay.*` (Carte, Inventaire, Statut, Journal, Aide, Menu) | **Une seule** fenêtre par-dessus le plateau | Fermer, ou **remplacer** par une autre fenêtre : la première se ferme |
| `Tile.Resolving` | La résolution d'une case (Magasin, Animal, Petit boulot…) | Rien d'autre que la fenêtre de la case |
| `Activity.*` (Mini-jeu, Combat, Télé) | Une activité en plein écran | Pause uniquement |
| `Cinematic.*` (Intro, Jalon, Époque, Épilogue) | Une scène de BD | Passer ⏭ |
| `Tutorial` | Une couche par-dessus, qui n'autorise que l'action attendue | Passer le tutoriel |
| `YearSummary` | Le bilan de fin d'année | Continuer |

**Règles :**
- **Une seule fenêtre à la fois** : ouvrir la Carte alors que l'Inventaire est ouvert **remplace**
  l'Inventaire, sans jamais les superposer. Les boutons qui ne sont pas autorisés dans l'état actuel
  sont **grisés et ne réagissent pas**.
- Les clics sont **bloqués pendant les transitions** : un double-clic rapide n'ouvre pas deux fenêtres.
- Les **files d'attente** sont traitées dans l'ordre : toasts, jalons, aides « au bon moment ». Une
  scène de jalon attend toujours la fin de l'activité en cours.
- **Toujours une sortie** : chaque état a au moins une action qui permet d'en sortir. `Échap` ferme
  toujours la fenêtre du dessus.
- **Délai de sécurité** sur les animations et les transitions : si une animation ne se termine pas
  (par exemple un événement perdu), l'état passe quand même au suivant après un délai maximal.
- **Aucune impasse dans les règles** : il y a toujours un coup jouable. Exemples : le magasin peut
  toujours être quitté sans acheter, et un combat se termine toujours en 5 tours au maximum.
- Une **sauvegarde automatique** à chaque fin d'année. En cas d'erreur inattendue, le jeu propose de
  reprendre au début de l'année en cours.

### 3. Tests partout

| Niveau | Outil | Ce qui est testé |
|---|---|---|
| **Unitaires** | Vitest | Chaque module de `core/` : métriques (seuils, normalisation, dégradation), cases, économie, jalons, score, générateur aléatoire, gestionnaire d'écrans, calculs de la télé et des combats, règles des mini-jeux (scores, médailles) |
| **Intégration (moteur)** | Vitest | Des parties complètes jouées par des robots avec une graine fixe. Vérifications : la partie se termine toujours (40 tours ou faillite), aucun état impossible (pièces < 0, métrique hors limites), les événements sont bien émis, une sauvegarde rechargée donne le même état |
| **Intégration (interface)** | Playwright (navigateur) | Le parcours complet : écran titre → intro → tutoriel → quelques tours → épilogue. L'ouverture et la fermeture de chaque fenêtre. Des **clics au hasard** répétés (*monkey testing*) pour vérifier qu'il n'y a jamais deux fenêtres ouvertes ni de soft lock. |
| **Tests de propriétés** | fast-check | Pour toute suite d'actions au hasard, le gestionnaire d'écrans reste dans un état valide et il existe toujours une action possible |
| **Performance** | Playwright + mesure des FPS | Les FPS moyens et minimaux dans chaque mini-jeu et sur le plateau. Le test échoue sous le seuil. |
| **Équilibrage** | `tools/simulate.ts` | Les cibles de [14 — Économie](14-economie.md#équilibrage), en garde-fou |

- **Intégration continue** (GitHub Actions) : les tests unitaires, d'intégration et de performance
  tournent à chaque *push* et chaque *pull request*. Si un test échoue, la fusion est bloquée.
- **Couverture visée** : ≥ 90 % sur `core/`, ce qui inclut le gestionnaire d'écrans.
- Chaque bug corrigé reçoit un **test qui le reproduit**.

## Contenu et accessibilité

- Tous les textes sont dans les JSON, en **français** pour commencer, avec des clés prêtes pour une
  traduction plus tard.
- Mode daltonien, grande taille de texte, lecture vocale en option (voir [06 — Interface](06-interface.md#réglages)).
- Illustrations : dans le style peint décrit dans [17 — Direction artistique](17-direction-artistique.md).
  Les dessins originaux des notes servent de croquis de référence.
