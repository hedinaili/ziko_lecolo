import type { Emotion } from '../../data/introPanels';
import { ball, contactShadow, roundRect, shade, vGradient, type Ctx2D } from './canvas';

/** Canvas size of a painted Ziko; his feet are at (ZIKO_W / 2, ZIKO_FEET). */
export const ZIKO_W = 360;
export const ZIKO_H = 600;
export const ZIKO_FEET = 580;

const OUTLINE = '#3b2a20';
const SKIN = '#f2c79b';
const HAIR = '#5a3a22';
const SHIRT = '#6bbf59';
const PANTS = '#35507a';

function outlined(ctx: Ctx2D, fill: string | CanvasGradient, width = 4): void {
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = width;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
}

export interface ZikoPaintOptions {
  emotion: Emotion;
  back?: boolean;
  backpack?: boolean;
}

/** Painted Ziko (docs/01): shaded body, outlines, curly hair and his inseparable mop. */
export function paintZiko(ctx: Ctx2D, opts: ZikoPaintOptions): void {
  const { emotion, back = false, backpack = false } = opts;
  const cx = ZIKO_W / 2;
  const f = ZIKO_FEET;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  contactShadow(ctx, cx, f + 4, 110, 18, 0.35);

  // Mop: wooden stick and grey cotton strands (in his right hand).
  const stick = ctx.createLinearGradient(cx + 70, 0, cx + 84, 0);
  stick.addColorStop(0, '#b98552');
  stick.addColorStop(1, '#7a4f2a');
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(cx + 78, f - 40);
  ctx.lineTo(cx + 128, f - 340);
  ctx.stroke();
  ctx.strokeStyle = stick;
  ctx.lineWidth = 9;
  ctx.stroke();
  ctx.fillStyle = '#b0aa9c';
  roundRect(ctx, cx + 100, f - 356, 62, 18, 8);
  outlined(ctx, '#b0aa9c', 3);
  for (let i = 0; i < 9; i++) {
    const sx = cx + 104 + i * 6.5;
    ctx.strokeStyle = i % 2 ? '#e8e3d6' : '#cfc8b8';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(sx, f - 340);
    ctx.quadraticCurveTo(sx + (i % 3) * 2 - 2, f - 330 + 30, sx + (i - 4) * 1.5, f - 282);
    ctx.stroke();
  }

  if (back) {
    ctx.beginPath();
    ctx.moveTo(cx - 64, f - 250);
    ctx.quadraticCurveTo(cx - 110, f - 120, cx - 90, f - 30);
    ctx.lineTo(cx + 90, f - 30);
    ctx.quadraticCurveTo(cx + 110, f - 120, cx + 64, f - 250);
    ctx.closePath();
    outlined(
      ctx,
      vGradient(ctx, f - 250, f - 30, [
        [0, '#e85a4f'],
        [1, '#9e2a22'],
      ]),
    );
  } else if (backpack) {
    roundRect(ctx, cx - 74, f - 230, 40, 100, 14);
    outlined(ctx, vGradient(ctx, f - 230, f - 130, [[0, '#f2a04a'], [1, '#b8641e']]));
  }

  // Legs and shoes.
  for (const lx of [cx - 36, cx + 6]) {
    roundRect(ctx, lx, f - 120, 30, 108, 12);
    outlined(ctx, vGradient(ctx, f - 120, f, [[0, shade(PANTS, 0.15)], [1, shade(PANTS, -0.3)]]));
    roundRect(ctx, lx - 6, f - 22, 42, 22, 10);
    outlined(ctx, '#4a3426');
  }
  // Body with a shaded t-shirt.
  roundRect(ctx, cx - 50, f - 250, 100, 146, 30);
  outlined(
    ctx,
    vGradient(ctx, f - 250, f - 104, [
      [0, shade(SHIRT, 0.2)],
      [1, shade(SHIRT, -0.25)],
    ]),
  );
  if (!back) {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.arc(cx, f - 190, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4f9c45';
    ctx.beginPath();
    ctx.ellipse(cx - 4, f - 192, 8, 5, -0.6, 0, Math.PI * 2);
    ctx.ellipse(cx + 5, f - 188, 8, 5, 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  // Arms and hands.
  for (const [ax, hx] of [
    [cx - 76, cx - 62],
    [cx + 48, cx + 74],
  ] as const) {
    roundRect(ctx, ax, f - 240, 28, 100, 13);
    outlined(ctx, vGradient(ctx, f - 240, f - 140, [[0, shade(SHIRT, 0.1)], [1, shade(SHIRT, -0.3)]]));
    ctx.beginPath();
    ctx.arc(hx, f - 134, 14, 0, Math.PI * 2);
    outlined(ctx, SKIN, 3);
  }

  // Head.
  const hy = f - 318;
  ctx.beginPath();
  ctx.arc(cx, hy, 66, 0, Math.PI * 2);
  const skin = ctx.createRadialGradient(cx - 22, hy - 24, 10, cx, hy, 70);
  skin.addColorStop(0, shade(SKIN, 0.2));
  skin.addColorStop(1, shade(SKIN, -0.18));
  outlined(ctx, skin);
  // Curly hair.
  const curls = back
    ? [[0, -10, 70]]
    : [
        [-50, -30, 26],
        [-28, -56, 28],
        [4, -64, 30],
        [36, -54, 28],
        [56, -28, 24],
        [-62, -6, 18],
        [64, -4, 16],
      ];
  for (const [dx, dy, r] of curls) {
    ctx.beginPath();
    ctx.arc(cx + dx!, hy + dy!, r!, 0, Math.PI * 2);
    outlined(ctx, HAIR, 3);
  }
  for (const [dx, dy, r] of curls) ball(ctx, cx + dx! - 2, hy + dy! - 2, r! - 4, HAIR, 0.25, -0.2);
  if (!back) paintFace(ctx, cx, hy, emotion);
}

function paintFace(ctx: Ctx2D, cx: number, hy: number, emotion: Emotion): void {
  const eyeY = hy + 2;
  const big = emotion === 'shocked' || emotion === 'scared';
  for (const ex of [cx - 23, cx + 23]) {
    ctx.beginPath();
    ctx.ellipse(ex, eyeY, big ? 14 : 12, big ? 17 : 14, 0, 0, Math.PI * 2);
    outlined(ctx, '#ffffff', 2.5);
    const look = emotion === 'hopeful' ? -5 : emotion === 'curious' ? 3 : 0;
    ball(ctx, ex + 2 + look / 2, eyeY + 2 + (emotion === 'hopeful' ? -4 : 0), big ? 5 : 7, '#3a2418', 0.3, -0.3);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ex + 4, eyeY - 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  const brows: Record<Emotion, [number, number]> = {
    joyful: [0, 0],
    curious: [-6, 6],
    worried: [8, 8],
    sad: [10, 10],
    shocked: [-8, -8],
    scared: [7, 7],
    angry: [-11, -11],
    determined: [-6, -6],
    hopeful: [4, 4],
  };
  const [l, r] = brows[emotion];
  ctx.strokeStyle = HAIR;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(cx - 38, eyeY - 24);
  ctx.lineTo(cx - 10, eyeY - 24 - l);
  ctx.moveTo(cx + 10, eyeY - 24 - r);
  ctx.lineTo(cx + 38, eyeY - 24);
  ctx.stroke();
  ctx.fillStyle = 'rgba(240,140,120,0.45)';
  ctx.beginPath();
  ctx.arc(cx - 40, hy + 26, 11, 0, Math.PI * 2);
  ctx.arc(cx + 40, hy + 26, 11, 0, Math.PI * 2);
  ctx.fill();
  const my = hy + 36;
  ctx.strokeStyle = '#7a2e22';
  ctx.lineWidth = 5;
  ctx.beginPath();
  switch (emotion) {
    case 'joyful':
    case 'hopeful':
      ctx.arc(cx, my - 10, 18, 0.25, Math.PI - 0.25);
      ctx.stroke();
      if (emotion === 'joyful') {
        ctx.fillStyle = '#7a2e22';
        ctx.beginPath();
        ctx.arc(cx, my - 6, 13, 0.3, Math.PI - 0.3);
        ctx.fill();
      }
      return;
    case 'determined':
      ctx.arc(cx, my - 16, 16, 0.6, Math.PI - 0.6);
      break;
    case 'sad':
    case 'angry':
      ctx.arc(cx, my + 12, 15, Math.PI + 0.5, -0.5);
      break;
    case 'shocked':
      ctx.fillStyle = '#7a2e22';
      ctx.ellipse(cx, my, 10, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      return;
    case 'curious':
      ctx.fillStyle = '#7a2e22';
      ctx.arc(cx + 6, my, 6, 0, Math.PI * 2);
      ctx.fill();
      return;
    case 'scared':
      ctx.moveTo(cx - 14, my);
      for (let i = 1; i <= 4; i++) ctx.lineTo(cx - 14 + i * 7, my - (i % 2 ? 5 : 0));
      break;
    case 'worried':
      ctx.moveTo(cx - 12, my + 2);
      ctx.lineTo(cx + 12, my - 2);
      break;
  }
  ctx.stroke();
  if (emotion === 'sad') {
    ctx.fillStyle = 'rgba(126,200,242,0.9)';
    ctx.beginPath();
    ctx.ellipse(cx - 28, hy + 30, 5, 9, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}
