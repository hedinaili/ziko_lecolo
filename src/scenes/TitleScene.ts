import * as Phaser from 'phaser';
import { debugInfo, ui } from '../app';
import { Button, hintPill } from '../ui/components';
import { isTouch } from '../ui/device';
import { vignette } from '../ui/paint/canvas';
import { panelPainting } from '../ui/paint/panels';
import { earthGlobe } from '../ui/paint/props';
import { artUrl, DEFERRED_ART, TITLE_ART } from '../data/art';
import { useSmallArt } from '../ui/device';
import { addPainted, addZiko, ensureTexture } from '../ui/paint/textures';
import { COLORS, css, FONT, HEIGHT, WIDTH } from '../ui/theme';

/** docs/02 "Mode vitrine": after 20 s without input, the comic plays by itself. */
export const ATTRACT_DELAY_MS = 20_000;

/** `?attractMs=1500` shortens the delay (used by end-to-end tests). */
function attractDelay(): number {
  const value = Number(new URLSearchParams(window.location.search).get('attractMs'));
  return Number.isFinite(value) && value > 0 ? value : ATTRACT_DELAY_MS;
}

export class TitleScene extends Phaser.Scene {
  private idleTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super('Title');
  }

  create(): void {
    debugInfo.scene = 'Title';
    debugInfo.attract = false;
    const bg = this.textures.exists(TITLE_ART)
      ? TITLE_ART
      : ensureTexture(this, 'title-bg', WIDTH, HEIGHT, (ctx) => {
          panelPainting('garden').back(ctx);
          earthGlobe(ctx, 930, 470, 190, 0.15);
          vignette(ctx, WIDTH, HEIGHT, 0.35);
        });
    const bgImage = addPainted(this, WIDTH / 2, HEIGHT / 2, bg, WIDTH, HEIGHT);
    this.tweens.add({ targets: bgImage, scaleX: bgImage.scaleX * 1.04, scaleY: bgImage.scaleY * 1.04, duration: 12000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    // Darkens the top so the logo stays readable on any illustration.
    const shadeTop = this.add.graphics();
    shadeTop.fillGradientStyle(0x1c1a24, 0x1c1a24, 0x1c1a24, 0x1c1a24, 0.45, 0.45, 0, 0).fillRect(0, 0, WIDTH, 300);

    this.add
      .text(WIDTH / 2, 120, "ZIKO L'ÉCOLO", { fontFamily: FONT, fontSize: '110px', color: css(COLORS.cream), fontStyle: 'bold' })
      .setOrigin(0.5)
      .setStroke(css(COLORS.brown), 14)
      .setShadow(4, 6, '#00000066', 8);
    this.add
      .text(WIDTH / 2, 215, 'Ziko a 40 ans pour protéger la vie sur Terre.', { fontFamily: FONT, fontSize: '38px', color: css(COLORS.cream) })
      .setOrigin(0.5)
      .setStroke(css(COLORS.brown), 8);

    const ziko = addZiko(this, 230, HEIGHT - 8, { emotion: 'joyful', height: 500, backpack: true });
    this.tweens.add({ targets: ziko, y: HEIGHT - 20, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    new Button(this, WIDTH / 2, 420, 'Jouer ▶', () => this.play(), { width: 320, height: 100, fontSize: 48 });
    if (!isTouch(this)) {
      hintPill(this, WIDTH / 2, 510, 'Entrée ou Espace');
    }

    const kb = this.input.keyboard;
    kb?.on('keydown-ENTER', () => this.play());
    kb?.on('keydown-SPACE', () => this.play());
    this.input.on('pointermove', () => this.resetIdle());
    kb?.on('keydown', () => this.resetIdle());
    this.resetIdle();
    this.loadDeferredArt();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      kb?.removeAllListeners();
      this.input.removeAllListeners();
    });
  }

  /** Loads the remaining comic illustrations in the background (docs/16: fast start on phones). */
  private loadDeferredArt(): void {
    const small = useSmallArt();
    let queued = 0;
    for (const name of DEFERRED_ART) {
      if (this.textures.exists(name)) continue;
      this.load.image(name, artUrl(name, small));
      queued++;
    }
    if (queued > 0) this.load.start();
  }

  private resetIdle(): void {
    this.idleTimer?.remove();
    this.idleTimer = this.time.delayedCall(attractDelay(), () => this.scene.start('Intro', { attract: true }));
  }

  private play(): void {
    if (ui.send({ type: 'start' })) this.scene.start('Intro', { attract: false });
  }
}
