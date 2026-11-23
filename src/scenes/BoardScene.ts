import * as Phaser from 'phaser';
import { debugInfo, ui } from '../app';
import { Game } from '../core/game';
import { astroGoal } from '../core/astro';
import { itemCount } from '../core/state';
import { CombatSession, creatureHp } from '../core/combat';
import { WEAPONS } from '../data/weapons';
import type { ItemId } from '../core/types';
import type { SacOptions } from './SacScene';
import { medalThreshold } from '../core/activities';
import { Rng } from '../core/rng';
import { TITLE_ART, PAINTED_BACKGROUNDS, boardLook } from '../data/art';
import { BALANCE } from '../data/balance';
import { TILES } from '../data/board';
import { CREATURES } from '../data/content';
import type { MinigameOptions } from '../ui/minigame';
import { track, trackPoints } from '../ui/board-track';
import { showTileDialog } from '../ui/tile-dialog';
import { motifs, tokenKey } from '../ui/board-tokens';
import { createRollingDie } from '../ui/rolling-die';
import { boardSoundButton } from '../ui/astro-sound';
import { isTouch } from '../ui/device';
import { Button } from '../ui/components';
import { addPainted } from '../ui/paint/textures';
import { FONT, HEIGHT, TEXT_COLOR, WIDTH } from '../ui/theme';

export class BoardScene extends Phaser.Scene {
  constructor() {
    super('Board');
  }

  create(): void {
    debugInfo.scene = 'Board';
    const game = Game.create();
    const rng = new Rng(game.state.seed);
    const key = [PAINTED_BACKGROUNDS.doorstep, TITLE_ART].find(k => this.textures.exists(k)) ?? 'title-bg';
    addPainted(this, WIDTH / 2, HEIGHT / 2, key, WIDTH, HEIGHT);
    const paper = this.add.graphics();
    const text = (x: number, y: number, value: string, size: number, bold = false) =>
      this.add.text(x, y, value, { fontFamily: FONT, resolution: 2, fontSize: `${size}px`, fontStyle: bold ? 'bold' : 'normal',
        color: TEXT_COLOR, wordWrap: { width: 355 } });
    paper.fillStyle(0x34291e, .88).fillRoundedRect(18, 18, 312, 60, 30);
    const avatar = this.add.image(49, 48, boardLook(game.age).avatar).setDisplaySize(58, 58);
    const identity = text(87, 29, '', 24, true).setColor('#fff6e3');
    const cards = [
      ['Vie sur Terre', `An ${game.estimatedYear.toLocaleString('fr-FR')}`, 0x23586a],
      ['Mission', '', 0x9e4333],
      ['Équipe', `${game.state.volunteers} bénévole`, 0x356746],
      ['Budget', `${game.state.coins} pièces`, 0x855719],
    ] as const;
    const values = cards.map(([title, value, color], i) => {
      const x = 844 + (i % 2) * 212, y = 22 + Math.floor(i / 2) * 112;
      paper.fillStyle(0x34271e).fillRoundedRect(x, y + 5, 193, 95, 16);
      paper.fillStyle(0xfff7e8).fillRoundedRect(x, y, 193, 95, 16);
      paper.lineStyle(4, 0x443627).strokeRoundedRect(x, y, 193, 95, 16);
      paper.fillStyle(color).fillRoundedRect(x + 6, y + 5, 181, 31, 10);
      text(x + 18, y + 5, title, 20, true).setColor('#ffffff');
      return text(x + 15, y + 42, value, 30, true);
    });
    const news = text(857, 490, 'Ziko est sur la case Départ.', 23)
      .setColor('#fff6e3').setBackgroundColor('#382e24').setPadding(12, 6);
    const sound = boardSoundButton(this.sound);
    (document.fullscreenElement ?? document.body).append(sound);
    const placeSound = () => {
      const rect = this.game.canvas.getBoundingClientRect();
      sound.style.left = `${rect.left + rect.width * 1249 / WIDTH}px`;
      sound.style.top = `${rect.top + rect.height * 255 / HEIGHT}px`;
    };
    placeSound();
    this.scale.on('resize', placeSound);
    this.events.on('sleep', () => { sound.hidden = true; });
    this.events.on('wake', () => { sound.hidden = false; placeSound(); });

    const layout = trackPoints();
    const pts = layout.map(({ x, y }) => new Phaser.Math.Vector2(x, y));
    const path = this.add.graphics();
    path.lineStyle(9, 0x57432e, 0.8).strokePoints(pts, true);
    path.lineStyle(4, 0xf7dda1).strokePoints(pts, true);
    const tokens = layout.map(({ x, y, width, height }, i) => {
      const kind = track[i]!;
      const token = this.add.image(x, y, tokenKey(this, kind, Math.round(width))).setDisplaySize(width, height).setInteractive();
      const describe = () => { if (ui.state.mode === 'board') news.setText(`Case ${i} · ${motifs[kind][0]}`); };
      token.on('pointerover', describe).on('pointerup', describe);
      return token;
    });
    // One non-interactive ring, reused at every footfall below the pawn.
    const light = this.add.graphics().setVisible(false);
    light.lineStyle(6, 0xffcc48, 0.65).strokeEllipse(0, -1, 49, 40);
    light.lineStyle(2, 0xfffbd1).strokeEllipse(0, -1, 49, 40);
    const lightTile = (index: number) => {
      const token = tokens[index]!;
      this.tweens.killTweensOf(light);
      light.setPosition(token.x, token.y).setScale(token.displayWidth / 51)
        .setAlpha(1).setVisible(true);
      this.tweens.add({ targets: light, alpha: 0, duration: 360, ease: 'Sine.easeIn',
        onComplete: () => light.setVisible(false) });
    };
    const preview = new URLSearchParams(location.search).get('defi');
    let position = preview === 'velo' ? 29 : preview === 'smog' ? 23 : preview === 'foret' ? 17 : preview === 'filet' ? 11 : preview === 'tri' ? 6 : 0;
    const pinceDemo = preview === 'pince';
    const meduseDemo = preview === 'meduse';
    const golemDemo = preview === 'golem';
    if (pinceDemo) position = 4;
    if (meduseDemo) position = 12;
    if (golemDemo) position = 20;
    const start = pts[position]!;
    if (position) news.setText(`Prochain arrêt : ${preview === 'velo' ? 'Vélo Turbo' : preview === 'smog' ? 'Smog Buster' : preview === 'foret' ? 'Forêt Éclair' : preview === 'filet' ? 'Filet Océan' : 'Tri Express'} !`);
    const pawn = this.add.image(start.x, start.y, boardLook(game.age).pawn).setOrigin(0.55, 0.95);
    if (pinceDemo) news.setText('Essai : Sac-Zombie avec la pince à déchets.');
    if (meduseDemo) news.setText('Essai : Méduse de pétrole avec une éponge prêtée.');
    if (golemDemo) news.setText('Essai : Golem de pneus avec une clé à recycler prêtée.');
    const refreshYear = () => {
      const look = boardLook(game.age);
      pawn.setTexture(look.pawn).setDisplaySize(108 * pawn.frame.width / pawn.frame.height, 108);
      avatar.setTexture(look.avatar).setDisplaySize(58, 58);
      identity.setText(`Ziko · ${game.age} ans | ${game.year}`);
      values[1]!.setText(`${BALANCE.totalYears - game.state.turn} ans`);
      values[0]!.setText(`An ${game.estimatedYear.toLocaleString('fr-FR')}`);
      values[3]!.setText(`${game.state.coins} pièces`);
      debugInfo.boardCoins = game.state.coins;
    };
    refreshYear();
    let popup: HTMLDialogElement | undefined;
    const throwDie = createRollingDie(this, 417, 612);
    const roll = () => {
      if (!ui.send({ type: 'roll' })) return;
      button.setEnabled(false);
      const demo = game.state.turn === 0 && (preview === 'astro' || position !== 0);
      const die = demo ? 1 : rng.int(1, 6);
      news.setText('Le dé roule…');
      let steps = 0;
      const hop = () => {
        const next = (position + 1) % track.length, target = pts[next]!, from = pts[position]!;
        this.tweens.addCounter({ from: 0, to: 1, duration: 190,
          onUpdate: tween => {
            const t = tween.getValue() ?? 0;
            pawn.setPosition(from.x + (target.x - from.x) * t, from.y + (target.y - from.y) * t - Math.sin(Math.PI * t) * 16);
          },
          onComplete: () => {
            position = next;
            lightTile(next);
            if (++steps < die) return hop();
            news.setText(`Dé : ${die}\nCase ${next} · ${motifs[track[next]!][0]}`);
            ui.notify({ type: 'moveDone', next: 'tile' });
            const kind = track[next]!;
            const id = TILES[next]?.minigame;
            const creature = TILES[next]?.creature;
            const duel = creature === 'sacZombie' || creature === 'meduse' || creature === 'golemPneus';
            const meduse = creature === 'meduse';
            const golem = creature === 'golemPneus';
            const opponent = duel ? `${meduse?'la':'le'} ${CREATURES[creature].label}` : '';
            const astro = id === 'astroZiko', tri = id === 'triExpress', ocean=id==='filetOcean';
            const forest=id==='foretEclair', smog=id==='smogBuster', velo=id==='veloTurbo';
            const title = astro ? 'Astro-Ziko' : tri ? 'Tri Express' : forest ? 'Forêt Éclair' : smog ? 'Smog Buster' : velo ? 'Vélo Turbo' : 'Filet Océan';
            const complete = (brief: string, activity: boolean) => {
              news.setText(brief);
              ui.notify({ type: activity ? 'activityDone' : 'tileDone' });
              ui.send({ type: 'continue' });
              // This preview advances the calendar only, not the economy simulation.
              game.state.turn++;
              refreshYear();
              if (game.state.turn === BALANCE.totalYears) {
                news.setText('Ziko a 50 ans. Sa mission de 40 ans est terminée.');
                button.setVisible(false);
                new Button(this, 417, 672, 'Rejouer', () => this.scene.restart(), { width: 212, height: 58, hitHeight: 84 });
                return;
              }
              button.setEnabled(true);
            };
            popup = showTileDialog(kind, duel ? `${CREATURES[creature].label} · ${golem?'Amérique du Nord':meduse?'Océan Atlantique':'Asie'}` : astro ? 'Astro-Ziko · Océan Pacifique' : tri ? 'Tri Express · Europe' : ocean ? 'Filet Océan · Océan Indien' : forest ? 'Forêt Éclair · Afrique' : smog ? 'Smog Buster · Asie' : velo ? 'Vélo Turbo · Amérique du Sud' : motifs[kind][0], (brief, accepted) => {
              popup = undefined;
              if (duel && accepted) {
                if (!ui.notify({type:'startActivity'})) throw new Error('Transition combat impossible');
                const weapons=(Object.keys(WEAPONS) as ItemId[]).filter(w=>itemCount(game.state,w)>0);
                if (pinceDemo && game.state.turn===0) weapons.push('pince');
                if (meduseDemo && meduse && game.state.turn===0) weapons.push('eponge');
                if (golemDemo && golem && game.state.turn===0) weapons.push('cle');
                const session=new CombatSession({creature,boss:false,hp:creatureHp(game.era,game.state.metrics.creatures,false),
                  era:game.era,weapons,medkits:0});
                const options:SacOptions={session,age:game.age,settle:(outcome)=>{
                  const before=game.state.coins;
                  const gift=game.applyCombatResult(session,outcome,0,next);
                  return {delta:game.state.coins-before,gift};
                },leave:()=>{debugInfo.scene='Board';complete(`Le combat contre ${opponent} est terminé.`,true);}};
                this.scene.launch('Sac',options);this.scene.sleep();return;
              }
              if (!id || !accepted) return complete(brief, false);
              if (!ui.notify({type: 'startActivity'})) throw new Error(`Transition ${title} impossible`);
              let earned = 0;
              const options: MinigameOptions = {
                seed: rng.int(1, 0x7fffffff), era: game.era,
                reward: ratio => {
                  const result = game.awardMinigame(id, ratio, next);
                  earned = result.coins;
                  return result;
                },
                leave: () => { debugInfo.scene = 'Board'; complete(`${title} : +${earned} pièces écolo !`, true); },
              };
              if (ocean) this.scene.launch('Ocean',{...options,largeNet:itemCount(game.state,'filet')>0});
              else if (velo) this.scene.launch('Velo',{...options,equipped:itemCount(game.state,'velo')>0});
              else this.scene.launch(astro ? 'Astro' : forest ? 'Forest' : smog ? 'Smog' : 'Tri', options);
              this.scene.sleep();
            }, duel ? { description:golem?'Tu as 40 secondes pour recycler le Golem de pneus. Garde tes distances pendant sa ruée, puis riposte.':meduse?'Tu as 40 secondes pour nettoyer le rivage. Garde tes distances pendant la ruée de la Méduse, puis riposte.':'Tu as 40 secondes pour recycler le Sac-Zombie. Prends le temps de découvrir les commandes avant de commencer.', details:this.duelBriefing(creature),
              action:`Affronter ${opponent}` } : astro ? { description: 'Nettoie le Pacifique en 30 secondes ! Le tir est automatique.',
              details: this.flightBriefing(astroGoal(game.era)), action: 'Jouer à Astro-Ziko' } : tri ? {
                description: '30 secondes pour trier les objets du tapis ! Glisse chaque objet dans son bac ou touche le bac. Au clavier : 1 à 4, ou ← → puis Entrée. Pour une pile, choisis le bac spécial 5. Les bons tris enchaînés valent 10, 20 puis 30 points. Une erreur coûte 5 points ; un objet manqué brise la série.',
                action:'Jouer à Tri Express',
              } : ocean ? {
                description:'Depuis le bateau de Ziko, récupère les sacs (+10 pts) et les bouteilles (+15 pts) en 30 secondes. Évite poissons, dauphins et méduses (−10 pts chacun). Vise avec la souris ou le doigt, maintiens pour augmenter la portée, puis relâche. Au clavier : flèches pour viser, maintiens puis relâche Espace.',
                action:'Jouer à Filet Océan',
              } : forest ? {
                description:'En 30 secondes, fais pousser des acacias ! Touche la terre verte pour planter, puis la même parcelle quand la goutte apparaît pour arroser (+20 pts). Une pousse séchée ou un sol pollué touché coûte 5 points. Au clavier : flèches pour choisir, Entrée ou Espace pour agir.',
                action:'Jouer à Forêt Éclair',
              } : smog ? {
                description:'En 30 secondes, aspire les nuages gris (+10 pts) et les rapides orangés (+15 pts) avant la rue (−5 pts). Évite les oiseaux (−10 pts). Pilote avec les flèches et maintiens Espace, ou maintiens le clic ou le doigt en glissant. Relâche pour refroidir : si la jauge est pleine, l’aspiration se bloque jusqu’au refroidissement complet.',
                action:'Jouer à Smog Buster',
              } : velo ? {
                description:'30 secondes sur la route des Andes ! Ramasse les canettes (+10 pts) et les pièces (+15 pts). Saute les pneus, les flaques et les hérissons avec ↑, Espace ou un appui ; maintiens pour sauter plus haut. Maintiens ↓ ou « Se baisser » pour passer sous les gaz des voitures. Un contact coûte 5 points.',
                action:'Jouer à Vélo Turbo',
              } : undefined);
          },
        });
      };
      throwDie(die, () => {
        news.setText(`Dé : ${die} · Ziko avance…`);
        hop();
      });
    };
    const button = new Button(this, 417, 672, 'Lancer le dé', roll, { width: 212, height: 58, hitHeight: 84, fontSize: 29, outline: false });
    const onSpace = (event: KeyboardEvent) => { if (!event.repeat && game.state.turn < BALANCE.totalYears) roll(); };
    this.input.keyboard?.on('keydown-SPACE', onSpace);
    this.events.once('shutdown', () => {
      this.scale.off('resize', placeSound);
      sound.remove();
      this.input.keyboard?.off('keydown-SPACE', onSpace);
      popup?.remove();
    });
  }
  private duelBriefing(creature: 'sacZombie'|'meduse'|'golemPneus'): HTMLElement {
    const meduse=creature==='meduse', golem=creature==='golemPneus';
    const touch=isTouch();
    const list=document.createElement('ul');
    list.className='duel-brief';
    list.setAttribute('aria-label',touch?'Commandes tactiles':'Commandes clavier');
    for(const [icon,key,action] of [
      ['👣',touch?'Joystick ← →':'← →','Avancer ou reculer.'],
      ['🦘',touch?'Joystick ↑':'↑',golem?'Sauter par-dessus le balayage bas ou le pneu qui roule. En l’air, Frappe donne un seul coup de pied.':meduse?'Sauter par-dessus le fouet bas ou la nappe basse. En l’air, Frappe donne un seul coup de pied.':'Sauter. En l’air, Frappe donne un seul coup de pied.'],
      ['⬇️',touch?'Joystick ↓':'↓',golem?'S’accroupir sous le boulon lancé en arc. Sauter les petits pneus qui rebondissent.':meduse?'S’accroupir sous la goutte haute.':'S’accroupir pour éviter les bouteilles hautes.'],
      ['🥊',touch?'Frappe':'Espace','Au sol, appuie trois fois : poing, pied, puis outil si les coups touchent.'],
      ['🛡️',touch?'Parade':'Alt',golem?'Double rebond : saute à l’aller. Après la pause au bord, baisse-toi pour le retour en hauteur. Parade possible au contact ; un seul coup de 25 PV.':meduse?'Flaque qui bouillonne : saute avant le jet de pétrole ou pare au moment où il jaillit.':'Disparaître un instant. Pare quand la tornade te traverse.'],
      ['🧰',touch?'Ligne de statut':'E','Passer à l’outil suivant parmi ceux que tu possèdes.'],
    ] as const){
      const row=document.createElement('li'), symbol=document.createElement('span'), control=document.createElement(touch?'strong':'kbd');
      symbol.setAttribute('aria-hidden','true'); symbol.textContent=icon;
      control.textContent=key;
      row.append(symbol,control,document.createTextNode(action)); list.append(row);
    }
    return list;
  }
  private flightBriefing(goal: number): HTMLElement {
    const rules = document.createElement('section');
    rules.className = 'astro-brief';
    const list = document.createElement('ul');
    list.setAttribute('aria-label','Points par cible');
    for (const [kind, name, rule] of [
      ['bag','Sac','+10 pts en un tir'],
      ['bottle','Bouteille','+15 pts au deuxième tir'],
      ['bird','Mouette','−10 pts si touchée'],
    ] as const) {
      const li = document.createElement('li');
      const icon = document.createElement('img');
      icon.src = `art/astro-${kind}.webp`; icon.alt = '';
      const label = document.createElement('strong');
      label.textContent = name;
      li.append(icon, label, rule); list.append(li);
    }
    const prizes = document.createElement('details');
    const title = document.createElement('summary');
    title.textContent = `Étoiles et pièces · objectif : ${goal} pts`;
    prizes.append(title, 'Le score ne descend jamais sous zéro. Seul le meilleur palier atteint est récompensé.');
    for (const [stars, tier] of [...BALANCE.minigame.medals].reverse().entries()) {
      const line = document.createElement('div');
      line.textContent = `${stars} étoile${stars > 1 ? 's' : ''} dès ${Math.ceil(medalThreshold(tier,'astroZiko') * goal)} pts : ${tier.coins} pièces écolo`;
      prizes.append(line);
    }
    const controls = document.createElement('p');
    controls.textContent = isTouch()
      ? 'Pilote en glissant le doigt. Sans le lever, appuie sur TURBO avec un deuxième doigt.'
      : 'Pilote avec les flèches, ZQSD, WASD ou la souris. Appuie sur Espace ou fais un clic gauche pour activer le turbo.';
    controls.append(document.createElement('br'), 'Le turbo accélère la navette pendant 2 s. Attends que la jauge se remplisse (5 s) pour recommencer.');
    rules.append(list, prizes, controls);
    return rules;
  }
}
