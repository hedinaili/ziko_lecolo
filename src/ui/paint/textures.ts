import type * as Phaser from 'phaser';
import { zikoArtFor } from '../../data/art';
import type { BackgroundId, Emotion } from '../../data/introPanels';
import type { Ctx2D } from './canvas';
import { H, panelPainting, W } from './panels';
import { paintZiko, ZIKO_FEET, ZIKO_H, ZIKO_W } from './ziko';

/**
 * Painting resolution (docs/16 performance, phones): small screens get smaller textures
 * (less memory, faster generation) since they cannot show the extra pixels anyway.
 * `?paint=0.5` forces a value (tests).
 */
export function paintScale(): number {
  const forced = Number(new URLSearchParams(window.location.search).get('paint'));
  if (Number.isFinite(forced) && forced > 0) return Math.min(1, forced);
  const screenPixels = Math.max(window.innerWidth, window.innerHeight) * (window.devicePixelRatio || 1);
  return Math.min(1, Math.max(0.5, screenPixels / W));
}

/** Paints once into a canvas texture and caches it. Returns the texture key. */
export function ensureTexture(scene: Phaser.Scene, key: string, width: number, height: number, draw: (ctx: Ctx2D) => void): string {
  if (scene.textures.exists(key)) return key;
  const scale = paintScale();
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D not supported');
  ctx.scale(scale, scale);
  draw(ctx);
  scene.textures.addCanvas(key, canvas);
  return key;
}

export function releaseTexture(scene: Phaser.Scene, key: string): void {
  if (scene.textures.exists(key)) scene.textures.remove(key);
}

export function panelKeys(id: BackgroundId): { back: string; front: string } {
  return { back: `panel-${id}-back`, front: `panel-${id}-front` };
}

export function ensurePanelTextures(scene: Phaser.Scene, id: BackgroundId): { back: string; front: string } {
  const keys = panelKeys(id);
  const p = panelPainting(id);
  ensureTexture(scene, keys.back, W, H, p.back);
  ensureTexture(scene, keys.front, W, H, p.front);
  return keys;
}

export function releasePanelTextures(scene: Phaser.Scene, id: BackgroundId): void {
  const keys = panelKeys(id);
  releaseTexture(scene, keys.back);
  releaseTexture(scene, keys.front);
}

export function zikoKey(emotion: Emotion, back = false, backpack = false): string {
  return `ziko-${emotion}-${back ? 'back' : 'front'}-${backpack ? 'bag' : 'nobag'}`;
}

export function ensureZikoTexture(scene: Phaser.Scene, emotion: Emotion, back = false, backpack = false): string {
  return ensureTexture(scene, zikoKey(emotion, back, backpack), ZIKO_W, ZIKO_H, (ctx) => paintZiko(ctx, { emotion, back, backpack }));
}

/** Adds an image sized in game units whatever the painting resolution. */
export function addPainted(scene: Phaser.Scene, x: number, y: number, key: string, width: number, height: number): Phaser.GameObjects.Image {
  return scene.add.image(x, y, key).setDisplaySize(width, height);
}

export interface ZikoPlacement {
  emotion: Emotion;
  /** Displayed height in game pixels (feet to top of the mop). */
  height: number;
  back?: boolean;
  backpack?: boolean;
  /** Make Ziko look to the left. */
  faceLeft?: boolean;
}

/**
 * Ziko with his feet at (x, feetY): the painted illustration when loaded (docs/17),
 * otherwise the procedural fallback. Painted art faces right.
 */
export function addZiko(scene: Phaser.Scene, x: number, feetY: number, p: ZikoPlacement): Phaser.GameObjects.Image {
  const art = zikoArtFor(p.emotion, p.back ?? false);
  if (scene.textures.exists(art)) {
    const frame = scene.textures.getFrame(art);
    const width = (frame.width / frame.height) * p.height;
    return scene.add.image(x, feetY, art).setOrigin(0.5, 1).setDisplaySize(width, p.height).setFlipX(p.faceLeft ?? false);
  }
  const key = ensureZikoTexture(scene, p.emotion, p.back ?? false, p.backpack ?? false);
  const scale = p.height / (ZIKO_FEET - 20);
  return scene.add
    .image(x, feetY, key)
    .setOrigin(0.5, ZIKO_FEET / ZIKO_H)
    .setDisplaySize(ZIKO_W * scale, ZIKO_H * scale)
    .setFlipX((p.faceLeft ?? false) && !p.back);
}
