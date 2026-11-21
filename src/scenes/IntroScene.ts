import * as Phaser from 'phaser';
import { debugInfo, ui } from '../app';
import { INTRO_PANELS, type IntroPanel } from '../data/introPanels';
import { Button, drawBubble, drawFrame, hintPill } from '../ui/components';
import { continueHint } from '../ui/device';
import { PAINTED_BACKGROUNDS } from '../data/art';
import { addPainted, addZiko, ensurePanelTextures, releasePanelTextures } from '../ui/paint/textures';
import { ComicSequence, visibleChars } from '../ui/sequence';
import { COLORS, css, FONT, HEIGHT, TEXT_COLOR, WIDTH } from '../ui/theme';

const FADE_MS = 180;
const ATTRACT_PANEL_MS = 2500;
/** Safety net: a transition can never block the intro longer than this (docs/16). */
const TRANSITION_TIMEOUT_MS = 1000;
/** Parallax: the near layer zooms more than the far one, which gives depth. */
const ZOOM_BACK = 1.03;
const ZOOM_FRONT = 1.08;
const PANEL_MS = 9000;
const ZIKO_HEIGHT = 500;
const ZOOM_PAINTED = 1.07;

/** The 15-panel opening comic (docs/02), painted in layers (docs/17). */
export class IntroScene extends Phaser.Scene {
  private seq!: ComicSequence<IntroPanel>;
  private attract = false;
  private elapsed = 0;
  private transitioning = false;
  private panelLayer!: Phaser.GameObjects.Container;
  private narration!: Phaser.GameObjects.Text;
  private counter!: Phaser.GameObjects.Text;
  private hint!: Phaser.GameObjects.Container;
  private bubble?: Phaser.GameObjects.Container;
  private zikoX = 0;
  private autoTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super('Intro');
  }

  init(data: { attract?: boolean }): void {
    this.attract = data.attract ?? false;
    this.transitioning = false;
    this.elapsed = 0;
    this.bubble = undefined;
  }

  create(): void {
    debugInfo.scene = 'Intro';
    debugInfo.attract = this.attract;
    this.seq = new ComicSequence(INTRO_PANELS);
    this.panelLayer = this.add.container(0, 0);

    const g = this.add.graphics();
    drawFrame(g, 30, 20, 800, 128);
    this.narration = this.add.text(58, 36, '', { resolution: 2, fontFamily: FONT, fontStyle: 'bold', fontSize: '30px', color: TEXT_COLOR, wordWrap: { width: 690 }, lineSpacing: 2 });
    g.fillStyle(0x241b15, 0.86).fillRoundedRect(WIDTH - 128, 24, 104, 47, 24);
    this.counter = this.add
      .text(WIDTH - 76, 48, '', { resolution: 2, fontFamily: FONT, fontSize: '27px', fontStyle: 'bold', color: '#ffffff' })
      .setOrigin(0.5);
    this.hint = hintPill(this, WIDTH / 2 - 80, HEIGHT - 36, continueHint(this)).setVisible(false);

    if (this.attract) {
      hintPill(this, WIDTH / 2, HEIGHT - 80, 'Appuie ou touche l’écran pour jouer');
    } else {
      // 240×84 game px stays above 44 CSS px on a phone in landscape.
      new Button(this, WIDTH - 140, HEIGHT - 58, 'Passer ⏭', () => this.skip(), { width: 240, height: 84, fontSize: 32 });
    }

    const kb = this.input.keyboard;
    kb?.on('keydown-SPACE', () => this.onInput());
    kb?.on('keydown-ENTER', () => this.onInput());
    kb?.on('keydown-ESC', () => (this.attract ? this.backToTitle() : this.skip()));
    this.input.on('pointerdown', () => this.onInput());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      kb?.removeAllListeners();
      this.input.removeAllListeners();
      this.autoTimer?.remove();
      for (const p of INTRO_PANELS) releasePanelTextures(this, p.background);
    });

    this.showPanel();
  }

  override update(_time: number, delta: number): void {
    if (this.seq.step !== 'typing' || this.transitioning) return;
    this.elapsed += delta;
    const text = this.seq.panel.narration;
    const n = visibleChars(text.length, this.elapsed);
    if (n !== this.narration.text.length) this.narration.setText(text.slice(0, n));
    if (n >= text.length) {
      this.seq.typingFinished();
      this.onReady();
    }
  }

  private addLayer(key: string, zoom: number): Phaser.GameObjects.Image {
    const img = addPainted(this, WIDTH / 2, HEIGHT / 2, key, WIDTH, HEIGHT);
    const base = img.scaleX;
    this.panelLayer.add(img);
    this.tweens.add({ targets: img, scaleX: base * zoom, scaleY: base * zoom, duration: PANEL_MS, ease: 'Sine.easeOut' });
    return img;
  }

  private showPanel(): void {
    const panel = this.seq.panel;
    this.panelLayer.removeAll(true);
    this.bubble = undefined;
    this.elapsed = 0;
    this.narration.setText('');
    this.hint.setVisible(false);
    this.counter.setText(`${panel.id} / ${INTRO_PANELS.length}`);
    debugInfo.introIndex = this.seq.index;
    debugInfo.introStep = this.seq.step;

    // Painted illustration when available (docs/17), procedural layers otherwise.
    const painted = PAINTED_BACKGROUNDS[panel.background];
    let back: Phaser.GameObjects.Image;
    if (this.textures.exists(painted)) {
      back = this.addLayer(painted, ZOOM_PAINTED);
    } else {
      const keys = ensurePanelTextures(this, panel.background);
      back = this.addLayer(keys.back, ZOOM_BACK);
      this.addLayer(keys.front, ZOOM_FRONT);
    }
    if (panel.caption) {
      const caption = this.add
        .text(WIDTH / 2 + 120, HEIGHT - 120, panel.caption, { fontFamily: FONT, fontSize: '40px', color: '#ffe14d', fontStyle: 'bold' })
        .setOrigin(0.5)
        .setStroke('#2a1a40', 9)
        .setShadow(0, 0, '#ffe14d', 18, true, false)
        .setAlpha(0);
      this.panelLayer.add(caption);
      this.tweens.add({ targets: caption, alpha: 1, delay: 600, duration: 800 });
    }
    if (panel.bigNumber) {
      const big = this.add
        .text(1080, 230, panel.bigNumber, { fontFamily: FONT, fontSize: '150px', color: '#ff6b5b', fontStyle: 'bold' })
        .setOrigin(0.5)
        .setStroke('#2a0d10', 10)
        .setShadow(0, 0, '#ff6b5b', 30, true, true);
      this.panelLayer.add(big);
      this.tweens.add({ targets: big, scale: 1.08, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    this.zikoX = panel.side === 'left' ? 220 : WIDTH - 380;
    const ziko = addZiko(this, this.zikoX + (panel.side === 'left' ? -200 : 200), HEIGHT + 8, {
      emotion: panel.emotion,
      height: ZIKO_HEIGHT,
      back: panel.back ?? false,
      backpack: panel.id >= 14,
      faceLeft: panel.side === 'right',
    });
    this.panelLayer.add(ziko);
    this.tweens.add({ targets: ziko, x: this.zikoX, duration: 450, ease: 'Back.easeOut' });
    const baseY = ziko.scaleY;
    this.tweens.add({ targets: ziko, scaleY: baseY * 1.015, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    const cam = this.cameras.main;
    if (panel.effect === 'shake') cam.shake(450, 0.012);
    if (panel.effect === 'glitch') {
      cam.flash(160, 255, 255, 255);
      cam.shake(250, 0.006);
    }
    if (panel.effect === 'heat') this.tweens.add({ targets: back, x: { from: WIDTH / 2 - 5, to: WIDTH / 2 + 5 }, duration: 260, yoyo: true, repeat: -1 });

    // Prepare the next panel while the player reads this one (no hitch on transition).
    const next = INTRO_PANELS[this.seq.index + 1];
    if (next && !this.textures.exists(PAINTED_BACKGROUNDS[next.background]))
      this.time.delayedCall(120, () => ensurePanelTextures(this, next.background));
    const previous = INTRO_PANELS[this.seq.index - 1];
    if (previous && previous.background !== panel.background) releasePanelTextures(this, previous.background);
  }

  private onReady(): void {
    debugInfo.introStep = this.seq.step;
    this.narration.setText(this.seq.panel.narration);
    const bubbleText = this.seq.panel.bubble;
    if (bubbleText && !this.attract && !this.bubble) {
      const bx = Phaser.Math.Clamp(this.zikoX + (this.seq.panel.side === 'left' ? 340 : -340), 280, WIDTH - 280);
      this.bubble = drawBubble(this, bx, 262, bubbleText, this.zikoX).setScale(0.6).setAlpha(0);
      this.panelLayer.add(this.bubble);
      this.tweens.add({ targets: this.bubble, scale: 1, alpha: 1, duration: 220, ease: 'Back.easeOut' });
    }
    if (this.attract) {
      this.autoTimer?.remove();
      this.autoTimer = this.time.delayedCall(ATTRACT_PANEL_MS, () => this.advance());
    } else {
      this.hint.setVisible(true);
    }
  }

  private onInput(): void {
    if (this.attract) return this.backToTitle();
    this.advance();
  }

  private advance(): void {
    if (this.transitioning) return;
    const result = this.seq.advance();
    debugInfo.introStep = this.seq.step;
    if (result === 'completed') this.onReady();
    else if (result === 'next') this.transitionToNext();
    else if (result === 'finished') this.finish();
  }

  private transitionToNext(): void {
    this.transitioning = true;
    if (!this.attract) ui.notify({ type: 'lock' });
    let done = false;
    const complete = () => {
      if (done) return;
      done = true;
      this.showPanel();
      this.cameras.main.fadeIn(FADE_MS);
      this.transitioning = false;
      if (!this.attract) ui.notify({ type: 'unlock' });
    };
    this.cameras.main.fadeOut(FADE_MS, 0, 0, 0, (_c: Phaser.Cameras.Scene2D.Camera, progress: number) => {
      if (progress >= 1) complete();
    });
    this.time.delayedCall(TRANSITION_TIMEOUT_MS, complete);
  }

  private finish(): void {
    if (this.attract) return this.backToTitle();
    ui.notify({ type: 'unlock' });
    if (ui.notify({ type: 'cinematicDone' })) this.scene.start('IntroText');
  }

  private skip(): void {
    if (this.attract) return;
    ui.notify({ type: 'unlock' });
    this.seq.skip();
    if (ui.send({ type: 'skip' })) this.scene.start('IntroText');
  }

  private backToTitle(): void {
    this.scene.start('Title');
  }
}
