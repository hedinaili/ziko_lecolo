import * as Phaser from 'phaser';
import { debugInfo, ui } from '../app';
import { Game } from '../core/game';
import { Rng } from '../core/rng';
import { TITLE_ART, PAINTED_BACKGROUNDS, PAWN_ART } from '../data/art';
import { track, trackPoints } from '../ui/board-track';
import { showTileDialog } from '../ui/tile-dialog';
import { motifs, tokenKey } from '../ui/board-tokens';
import { createRollingDie } from '../ui/rolling-die';
import { Button, drawFrame, hintPill } from '../ui/components';
import { addPainted, addZiko } from '../ui/paint/textures';
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
    addPainted(this, 450, HEIGHT / 2, key, WIDTH, HEIGHT);
    const paper = this.add.graphics();
    paper.fillStyle(0xfff4dc).fillRect(837, 0, WIDTH - 837, HEIGHT);
    paper.fillStyle(0x815d3a).fillRect(834, 0, 3, HEIGHT);
    const text = (x: number, y: number, value: string, size: number, bold = false) =>
      this.add.text(x, y, value, { fontFamily: FONT, resolution: 2, fontSize: `${size}px`, fontStyle: bold ? 'bold' : 'normal',
        color: TEXT_COLOR, wordWrap: { width: 355 } });
    hintPill(this, 163, 43, `Ziko · ${game.age} ans   |   An ${game.year}`);
    hintPill(this, 1049, 52, 'CARNET DE ZIKO');
    const cards = [
      ['Vie sur Terre', `An ${game.estimatedYear.toLocaleString('fr-FR')}`, 'Estimation'],
      ['Mission', '40 ans', 'Temps restant'],
      ['Équipe', '1 bénévole', 'Ziko'],
      ['Budget', `${game.state.coins} pièces`, 'Coût : 1 pièce / an'],
    ];
    cards.forEach(([title, value, note], i) => {
      const x = 854 + (i % 2) * 207, y = 100 + Math.floor(i / 2) * 128;
      drawFrame(paper, x, y, 192, 112, 18);
      text(x + 12, y + 8, title!, 20);
      text(x + 12, y + 35, value!, 28, true);
      text(x + 12, y + 78, note!, 16);
    });
    drawFrame(paper, 855, 383, 397, 198, 19);
    text(874, 400, 'Journal de Ziko', 25, true);
    const news = text(874, 451, 'Ziko est sur la case Départ.', 23);
    text(860, 624, 'Touche une case pour voir son nom.', 20);

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
    const start = pts[0]!;
    const pawnFrame = this.textures.exists(PAWN_ART) && this.textures.getFrame(PAWN_ART);
    const pawn = pawnFrame
      ? this.add.image(start.x, start.y, PAWN_ART).setOrigin(0.55, 0.95).setDisplaySize(108 * pawnFrame.width / pawnFrame.height, 108)
      : addZiko(this, start.x, start.y, { emotion: 'hopeful', height: 108, backpack: true });
    let popup: HTMLDialogElement | undefined;
    const throwDie = createRollingDie(this, 417, 612);
    let position = 0;
    const roll = () => {
      if (!ui.send({ type: 'roll' })) return;
      button.setEnabled(false);
      const die = rng.int(1, 6);
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
            popup = showTileDialog(kind, motifs[kind][0], brief => {
              popup = undefined;
              news.setText(brief);
              ui.notify({ type: 'tileDone' });
              ui.send({ type: 'continue' });
              button.setEnabled(true);
            });
          },
        });
      };
      throwDie(die, () => {
        news.setText(`Dé : ${die} · Ziko avance…`);
        hop();
      });
    };
    const button = new Button(this, 417, 672, 'Lancer le dé', roll, { width: 212, height: 58, hitHeight: 84, fontSize: 29, outline: false });
    const onSpace = (event: KeyboardEvent) => { if (!event.repeat) roll(); };
    this.input.keyboard?.on('keydown-SPACE', onSpace);
    this.events.once('shutdown', () => {
      this.input.keyboard?.off('keydown-SPACE', onSpace);
      popup?.remove();
    });
  }
}
