# 13 — Télé et interview

Sur une case 📺 **Télé**, Ziko est **invité sur un plateau de télévision** pour parler de sa mission.
Le joueur répond à un **quiz**. Plus il donne de bonnes réponses, plus l'**audience** est grande.
Ensuite, une animation **« Le lendemain… »** montre **tout de suite** le résultat : le **nombre de
spectateurs** de l'interview, les nouveaux bénévoles et les dons.

## Déroulé (environ 45 s)

1. **Entrée sur le plateau** (environ 3 s) : générique, la présentatrice accueille Ziko (avec sa
   serpillière). L'émission dépend de l'époque :

   | Époque | Émission | Audience de base |
   |---|---|---|
   | Enfant | « Le Petit Journal du quartier », télé locale | 10 000 |
   | Jeune | « Planète Région », télé régionale | 100 000 |
   | Adulte | « Le 20 h », télé nationale | 1 000 000 |
   | Super-héros | « World Live », diffusion mondiale | 10 000 000 |

2. **Le quiz** : **3 questions** (4 quand Ziko est super-héros). Chaque question a **3 réponses
   possibles** et **10 secondes** pour répondre.
   - Les questions portent sur l'écologie et sur la **situation de la partie**. Exemples : « Quelle
     métrique est la plus en danger aujourd'hui ? », « Dans quelle poubelle va le verre ? », « Pourquoi
     les abeilles sont-elles importantes ? ».
   - Bonne réponse : le public applaudit, un compteur d'audience monte en direct. Mauvaise réponse : le
     public murmure.
   - Une banque d'**au moins 60 questions**, rangées par époque, pour éviter les répétitions.

3. **« Le lendemain… »** (environ 6 s) : fondu au noir, le texte *Le lendemain…*, puis la **une d'un
   journal** et l'écran d'un téléphone avec des notifications :

   ```
   ┌──────────────── LA GAZETTE VERTE · An 2515 ────────────────┐
   │  ZIKO À LA TÉLÉ : 1 240 000 SPECTATEURS !                  │
   │  « Si personne ne commence, alors ce sera moi. »            │
   │                                                            │
   │  🙋 +620 bénévoles     🪙 +31 pièces de dons                │
   │  ☁️ Gaz toxiques −0,8 %  (les gens changent leurs habitudes) │
   └────────────────────────────────────────────────────────────┘
   ```

4. Un point 📺 apparaît sur la [carte](09-carte-du-monde.md), avec une onde qui s'étend sur la zone
   d'audience.

## Calculs

> Toutes les valeurs sont **de départ, à équilibrer**.

```
réussite    = bonnes réponses / nombre de questions        (0 à 1)
audience    = audience de base × (0,3 + 0,9 × réussite) × bonus micro (×1,5 si Micro pro)
              × variation au hasard (0,9 à 1,1)
bénévoles   = arrondi(audience × 0,0005)                   (au moins 1)
dons        = arrondi(5 + 15 × réussite × facteur d'époque) facteur : 1 / 1,5 / 2 / 2,5
gaz toxiques = −(0,4 + 1 × réussite) %
produits locaux = +(1 + 3 × réussite) %   (le public est sensibilisé)
chaque réponse absurde = +5 % d'audience (le public rit, voir docs/19)
```

| Exemple | Audience | Bénévoles | Dons |
|---|---|---|---|
| Enfant, 3/3, sans micro | 12 000 | +6 | +20 |
| Jeune, 2/3, sans micro | 90 000 | +45 | +20 |
| Adulte, 2/3, avec micro | 1 350 000 | +675 | +25 |
| Super-héros, 4/4, avec micro | 18 000 000 | +9 000 | +43 |

- Une **très bonne audience** (réussite = 100 %) apporte un **cadeau de sponsor** : +2 kits de
  nettoyage (voir [10 — Inventaire](10-inventaire.md#comment-obtenir-des-objets)).
- L'audience atteinte est enregistrée dans le journal **« Pendant ce temps… »** et dans les statistiques
  de l'épilogue (« Meilleure audience : 18 000 000 »).

## Pourquoi c'est important

C'est le moyen le plus rapide de **gagner des bénévoles**. Les bénévoles servent pour les
**nettoyages**, à condition de les équiper avec des kits, et pour les **manifestations**, qui font voter
les lois. L'**Accord mondial pour le climat** (5 000 participants) n'est réaliste qu'en passant à la
télé mondiale.
