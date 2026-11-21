import * as Phaser from 'phaser';
import { debugInfo, ui } from '../app';
import { INTRO_TEXT } from '../data/introPanels';
import { Button, drawFrame } from '../ui/components';
import { TITLE_ART } from '../data/art';
import { addPainted, addZiko } from '../ui/paint/textures';
import { FONT, HEIGHT, TEXT_COLOR, WIDTH } from '../ui/theme';

/** docs/01 "Le texte d'introduction" with the COMMENCER button. */
export class IntroTextScene extends Phaser.Scene {
  constructor() {
    super('IntroText');
  }

  create(): void {
    debugInfo.scene = 'IntroText';
    const g = this.add.graphics();
    const key = this.textures.exists(TITLE_ART) ? TITLE_ART : 'title-bg';
    addPainted(this, WIDTH / 2, HEIGHT / 2, key, WIDTH, HEIGHT).setDepth(-1);
    drawFrame(g, 60, 190, 625, 375);
    this.add.text(94, 214, 'La mission de Ziko', { fontFamily: FONT, fontSize: '44px', color: TEXT_COLOR, fontStyle: 'bold' });
    this.add.text(94, 286, INTRO_TEXT, { fontFamily: FONT, fontSize: '28px', color: TEXT_COLOR, wordWrap: { width: 557 }, lineSpacing: 3 });
    addZiko(this, 1050, HEIGHT - 10, { emotion: 'determined', height: 520, faceLeft: true });
    new Button(this, 470, 640, 'COMMENCER', () => this.begin(), { width: 340, height: 84, fontSize: 40 });
    this.cameras.main.fadeIn(250);

    const kb = this.input.keyboard;
    kb?.on('keydown-ENTER', () => this.begin());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => kb?.removeAllListeners());
  }

  private begin(): void {
    if (ui.send({ type: 'begin' })) this.scene.start('Board');
  }
}
