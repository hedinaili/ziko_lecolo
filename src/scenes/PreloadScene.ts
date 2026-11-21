import * as Phaser from 'phaser';
import { debugInfo } from '../app';
import { artUrl, CRITICAL_ART } from '../data/art';
import { useSmallArt } from '../ui/device';
import { drawFrame } from '../ui/components';
import { COLORS, css, FONT, HEIGHT, WIDTH } from '../ui/theme';

/** Loads the illustrations needed first, with a progress bar (≈1 MB, ≈0.5 MB on phones). */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload(): void {
    debugInfo.scene = 'Preload';
    drawFrame(this.add.graphics(), WIDTH / 2 - 334, HEIGHT / 2 - 114, 668, 196);
    const g = this.add.graphics();
    const label = this.add
      .text(WIDTH / 2, HEIGHT / 2 - 50, 'Chargement…', { fontFamily: FONT, fontSize: '40px', color: css(COLORS.brown) })
      .setOrigin(0.5);
    const barW = 520;
    this.load.on('progress', (value: number) => {
      g.clear();
      g.fillStyle(COLORS.brown, 1).fillRoundedRect(WIDTH / 2 - barW / 2 - 6, HEIGHT / 2 - 6, barW + 12, 40, 18);
      g.fillStyle(COLORS.leaf, 1).fillRoundedRect(WIDTH / 2 - barW / 2, HEIGHT / 2, Math.max(28, barW * value), 28, 14);
      label.setText(`Chargement… ${Math.round(value * 100)} %`);
    });
    // A missing file must never block the game: the procedural painting is used instead.
    this.load.on('loaderror', (file: Phaser.Loader.File) => console.warn(`Illustration manquante : ${file.key}`));
    const small = useSmallArt();
    for (const name of CRITICAL_ART) this.load.image(name, artUrl(name, small));
  }

  create(): void {
    this.scene.start('Title');
  }
}
