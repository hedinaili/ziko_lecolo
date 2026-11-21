import * as Phaser from 'phaser';
import { COLORS, css, FONT, TEXT_COLOR } from './theme';

const FOREST = 0x25532a;

function sprout(scene: Phaser.Scene, x: number, y: number, size: number) {
  const key = 'ui-eco-sprout';
  if (!scene.textures.exists(key)) {
    const tex = scene.textures.createCanvas(key, 128, 128);
    if (!tex) throw new Error('Impossible de créer la texture des feuilles.');
    const ctx = tex.context;
    ctx.scale(2, 2);
    const leaf = (shape: string, vein: string, light: string, dark: string) => {
      const green = ctx.createLinearGradient(20, 5, 43, 55);
      green.addColorStop(0, light);
      green.addColorStop(1, dark);
      const path = new Path2D(shape);
      ctx.fillStyle = green;
      ctx.fill(path);
      ctx.strokeStyle = '#345b28';
      ctx.lineWidth = 1.4;
      ctx.lineJoin = ctx.lineCap = 'round';
      ctx.stroke(path);
      ctx.stroke(new Path2D(vein));
    };
    leaf('M31 59 Q6 57 3 22 Q29 25 31 59Z', 'M31 59 Q20 45 10 31', '#aad76b', '#377333');
    leaf('M31 59 Q21 21 58 3 Q67 39 31 59Z', 'M31 59 Q44 36 54 12 M43 37 Q49 32 54 30', '#c2de60', '#578d2d');
    tex.refresh();
  }
  return scene.add.image(x, y, key).setOrigin(0.5, 0.93).setDisplaySize(size, size);
}

export function hintPill(scene: Phaser.Scene, x: number, y: number, text: string, size = 24) {
  const label = scene.add.text(0, 0, text, { fontFamily: FONT, resolution: 2, fontSize: `${size}px`, color: '#ffffff' }).setOrigin(0.5);
  const w = label.width + 32, h = label.height + 6;
  const bg = scene.add.graphics().fillStyle(0x241b15, 0.86).fillRoundedRect(-w / 2, -h / 2, w, h, h / 2);
  return scene.add.container(x, y, [bg, label]);
}

/** Cream card with a thick brown border and a soft shadow (docs/17 "Cadres et interface"). */
export function drawFrame(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, radius = 22): void {
  g.fillStyle(0x000000, 0.25).fillRoundedRect(x + 6, y + 8, w, h, radius);
  g.fillStyle(COLORS.cream, 1).fillRoundedRect(x, y, w, h, radius);
  g.lineStyle(5, COLORS.brown, 1).strokeRoundedRect(x, y, w, h, radius);
  sprout(g.scene, x + w - 38, y + h - 15, 39);
}

export interface ButtonOptions {
  width?: number;
  height?: number;
  hitHeight?: number;
  outline?: boolean;
  fontSize?: number;
  fill?: number;
}

export class Button extends Phaser.GameObjects.Container {
  private readonly bg: Phaser.GameObjects.Graphics;
  private readonly label: Phaser.GameObjects.Text;
  private readonly zone: Phaser.GameObjects.Zone;
  private enabled = true;
  private pressedBy: number | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    private readonly onClick: () => void,
    private readonly opts: ButtonOptions = {},
  ) {
    super(scene, x, y);
    const w = opts.width ?? 260;
    const h = opts.height ?? 72;
    this.bg = scene.add.graphics();
    this.label = scene.add
      .text(0, 2, text, { resolution: 2, fontFamily: FONT, fontSize: `${opts.fontSize ?? 32}px`, color: TEXT_COLOR, fontStyle: 'bold' })
      .setOrigin(0.5);
    this.zone = scene.add.zone(0, 0, w, opts.hitHeight ?? h).setInteractive({ useHandCursor: true });
    this.add([this.bg, this.label, this.zone]);
    this.redraw(false);
    this.zone.on('pointerover', () => this.enabled && this.redraw(true));
    this.zone.on('pointerout', (p: Phaser.Input.Pointer) => {
      if (this.pressedBy === p.id) this.pressedBy = null;
      this.redraw(false);
    });
    this.zone.on('pointerdown', (p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      if (this.enabled && this.pressedBy === null && p.button === 0) {
        this.pressedBy = p.id;
        this.redraw(true);
      }
    });
    this.zone.on('pointerup', (p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      if (this.pressedBy !== p.id) return;
      this.pressedBy = null;
      this.redraw(false);
      if (this.enabled && !p.wasCanceled && p.button === 0) this.onClick();
    });
    scene.add.existing(this);
  }

  setEnabled(enabled: boolean): this {
    this.enabled = enabled;
    this.pressedBy = null;
    this.redraw(false);
    this.setAlpha(enabled ? 1 : 0.5);
    return this;
  }

  private redraw(hover: boolean): void {
    const w = this.opts.width ?? 260;
    const h = this.opts.height ?? 72;
    this.bg.clear();
    this.bg.y = this.pressedBy !== null ? 3 : 0;
    this.label.y = this.bg.y + 2;
    const x = -w / 2, y = -h / 2, r = 29;
    this.bg.fillStyle(0x291908, 0.45).fillRoundedRect(x + 3, y + 7, w, h, r);
    this.bg.fillStyle(0xdb9423).fillRoundedRect(x, y, w, h, r);
    if (this.opts.outline !== false) this.bg.lineStyle(5, FOREST).strokeRoundedRect(x, y, w, h, r);
    const top = hover ? 0xffed85 : (this.opts.fill ?? 0xffdf52);
    this.bg.fillStyle(top).fillGradientStyle(top, top, 0xffbc29, 0xffc332).fillRoundedRect(x + 4, y + 4, w - 8, h - 12, r - 4);
    this.bg.lineStyle(2, 0xffed99).strokeRoundedRect(x + 6, y + 5, w - 12, h - 14, r - 6);
    this.bg.lineStyle(3, 0xfff7d1).lineBetween(x + 16, y + 20, x + 23, y + 12);
    this.bg.lineStyle(3, 0xffedaa).beginPath().arc(-x - r, -y - r - 4, r - 9, 0.25, 1.2).strokePath();
  }
}

/** Speech bubble with a tail pointing down towards the speaker. */
export function drawBubble(scene: Phaser.Scene, x: number, y: number, text: string, tailX: number, maxWidth = 420): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  const label = scene.add
    .text(-12, 4, text, { resolution: 2, fontFamily: FONT, fontSize: '29px', fontStyle: 'bold', color: TEXT_COLOR, wordWrap: { width: maxWidth - 78 }, align: 'center', lineSpacing: 2 })
    .setOrigin(0.5);
  const w = Math.max(180, label.width + 78);
  const h = label.height + 44;
  // One antialiased silhouette: no overlapping strokes where the tail meets the body.
  const key = `bubble-${Phaser.Utils.String.UUID()}`;
  const tex = scene.textures.createCanvas(key, (w + 20) * 2, (h + 46) * 2);
  if (!tex) throw new Error('Impossible de créer la texture de dialogue.');
  const ctx = tex.context;
  ctx.scale(2, 2);
  ctx.translate(6, 6);
  const tx = Phaser.Math.Clamp(tailX - x + w / 2, 40, w - 40);
  const tip = tx + Math.sign(tailX - x) * 24;
  ctx.beginPath();
  ctx.moveTo(26, 0);
  ctx.arcTo(w, 0, w, h, 26);
  ctx.arcTo(w, h, 0, h, 26);
  ctx.lineTo(tx + 14, h);
  ctx.lineTo(tip, h + 26);
  ctx.lineTo(tx - 14, h);
  ctx.arcTo(0, h, 0, 0, 26);
  ctx.arcTo(0, 0, w, 0, 26);
  ctx.closePath();
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowOffsetX = 8;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = css(COLORS.cream);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = css(FOREST);
  ctx.stroke();
  tex.refresh();
  const g = scene.add.image(-w / 2 - 6, -h / 2 - 6, key).setOrigin(0).setScale(0.5);
  g.once('destroy', () => scene.textures.remove(key));
  const badge = scene.add.graphics();
  badge.fillStyle(0x187637).fillRoundedRect(-w / 2 + 25, -h / 2 - 19, 96, 36, 12);
  badge.lineStyle(2, FOREST).strokeRoundedRect(-w / 2 + 25, -h / 2 - 19, 96, 36, 12);
  const name = scene.add.text(-w / 2 + 37, -h / 2, 'Ziko', {
    resolution: 2, fontFamily: FONT, fontSize: '25px', fontStyle: 'bold', color: '#ffffff',
  }).setOrigin(0, 0.5);
  c.add([g, badge, sprout(scene, -w / 2 + 110, -h / 2 + 12, 23), sprout(scene, w / 2 - 26, h / 2 - 13, 24), label, name]);
  return c;
}
