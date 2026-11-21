/**
 * Low-level Canvas 2D painting helpers (docs/17: painted 2D look, depth, soft light).
 * Everything is deterministic (seeded) so the same panel always looks the same.
 */

export type Ctx2D = CanvasRenderingContext2D;

export class Seeded {
  private s: number;
  constructor(seed: number) {
    this.s = seed >>> 0 || 1;
  }
  next(): number {
    this.s = (this.s + 0x6d2b79f5) >>> 0;
    let t = this.s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}

/** Lighten (amount > 0) or darken (amount < 0) a #rrggbb colour. */
export function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(amount >= 0 ? v + (255 - v) * amount : v * (1 + amount))));
  const r = ch((n >> 16) & 255);
  const g = ch((n >> 8) & 255);
  const b = ch(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function rgba(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

/** Mixes two colours (t = 0 → a, t = 1 → b). */
export function mix(a: string, b: string, t: number): string {
  const x = parseInt(a.slice(1), 16);
  const y = parseInt(b.slice(1), 16);
  const c = (s: number) => Math.round(((x >> s) & 255) * (1 - t) + ((y >> s) & 255) * t);
  return `#${((c(16) << 16) | (c(8) << 8) | c(0)).toString(16).padStart(6, '0')}`;
}

export function vGradient(ctx: Ctx2D, y0: number, y1: number, stops: readonly (readonly [number, string])[]): CanvasGradient {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}

export function fillSky(ctx: Ctx2D, w: number, h: number, stops: readonly (readonly [number, string])[]): void {
  ctx.fillStyle = vGradient(ctx, 0, h, stops);
  ctx.fillRect(0, 0, w, h);
}

/** Soft radial light (sun, lamp, glow). */
export function glow(ctx: Ctx2D, x: number, y: number, r: number, color: string, alpha = 0.6): void {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(color, alpha));
  g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

/** Shaded disc lit from the top-left. */
export function ball(ctx: Ctx2D, x: number, y: number, r: number, color: string, light = 0.35, dark = -0.35): void {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
  g.addColorStop(0, shade(color, light));
  g.addColorStop(0.6, color);
  g.addColorStop(1, shade(color, dark));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/** Fluffy cloud made of shaded puffs. */
export function cloud(ctx: Ctx2D, x: number, y: number, s: number, color = '#ffffff', shadow = '#c9cfe8', alpha = 0.95): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  const puffs = [
    [0, 0, 1],
    [0.9, -0.35, 1.25],
    [1.9, -0.1, 1.05],
    [2.7, 0.15, 0.8],
    [-0.8, 0.2, 0.75],
  ] as const;
  for (const [dx, dy, r] of puffs) {
    const px = x + dx * 40 * s;
    const py = y + dy * 40 * s;
    const g = ctx.createRadialGradient(px - 12 * s, py - 18 * s, 4 * s, px, py, 44 * r * s);
    g.addColorStop(0, color);
    g.addColorStop(0.7, color);
    g.addColorStop(1, shadow);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(px, py, 44 * r * s, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Rolling hill band with a lit crest (atmospheric perspective via colour). */
export function hills(ctx: Ctx2D, w: number, h: number, baseY: number, amp: number, color: string, seed: number, freq = 3): void {
  const r = new Seeded(seed);
  const phase = r.range(0, Math.PI * 2);
  const phase2 = r.range(0, Math.PI * 2);
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 8) {
    const y = baseY + Math.sin((x / w) * Math.PI * freq + phase) * amp + Math.sin((x / w) * Math.PI * freq * 2.7 + phase2) * amp * 0.35;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fillStyle = vGradient(ctx, baseY - amp, h, [
    [0, shade(color, 0.12)],
    [0.35, color],
    [1, shade(color, -0.3)],
  ]);
  ctx.fill();
}

/** Tufts of grass along a line. */
export function grass(ctx: Ctx2D, x0: number, x1: number, y: number, color: string, seed: number, density = 0.5, height = 18): void {
  const r = new Seeded(seed);
  ctx.lineCap = 'round';
  for (let x = x0; x < x1; x += 1 / density) {
    const hh = height * r.range(0.5, 1.2);
    ctx.strokeStyle = r.next() < 0.5 ? shade(color, 0.15) : shade(color, -0.15);
    ctx.lineWidth = r.range(1.5, 3);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + r.range(-4, 4), y - hh * 0.6, x + r.range(-8, 8), y - hh);
    ctx.stroke();
  }
}

/** Round painted tree with clustered foliage and a shadow. */
export function tree(ctx: Ctx2D, x: number, y: number, s: number, leaf: string, seed: number, blossom?: string): void {
  const r = new Seeded(seed);
  contactShadow(ctx, x, y + 4 * s, 80 * s, 16 * s, 0.25);
  ctx.fillStyle = vGradient(ctx, y - 120 * s, y, [
    [0, '#7a5232'],
    [1, '#4e321d'],
  ]);
  ctx.beginPath();
  ctx.moveTo(x - 12 * s, y);
  ctx.quadraticCurveTo(x - 6 * s, y - 70 * s, x - 2 * s, y - 120 * s);
  ctx.lineTo(x + 8 * s, y - 120 * s);
  ctx.quadraticCurveTo(x + 10 * s, y - 60 * s, x + 16 * s, y);
  ctx.fill();
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    ball(ctx, x + Math.cos(a) * 48 * s + r.range(-8, 8) * s, y - 150 * s + Math.sin(a) * 36 * s, r.range(34, 46) * s, leaf, 0.3, -0.35);
  }
  ball(ctx, x, y - 160 * s, 50 * s, shade(leaf, 0.06), 0.35, -0.25);
  if (blossom) {
    for (let i = 0; i < 26; i++) {
      ctx.fillStyle = r.next() < 0.5 ? blossom : shade(blossom, 0.35);
      ctx.beginPath();
      ctx.arc(x + r.range(-80, 80) * s, y - 150 * s + r.range(-60, 50) * s, r.range(3, 6) * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function flower(ctx: Ctx2D, x: number, y: number, s: number, petal: string, center = '#ffd45c'): void {
  ctx.strokeStyle = '#3f8a3a';
  ctx.lineWidth = 3 * s;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + 4 * s, y + 18 * s, x, y + 34 * s);
  ctx.stroke();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.fillStyle = i % 2 ? petal : shade(petal, 0.2);
    ctx.beginPath();
    ctx.ellipse(x + Math.cos(a) * 9 * s, y + Math.sin(a) * 9 * s, 8 * s, 5 * s, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ball(ctx, x, y, 5 * s, center);
}

/** City silhouette with lit windows; `lit` = probability of a lit window. */
export function city(ctx: Ctx2D, w: number, baseY: number, color: string, seed: number, lit = 0.3, maxH = 260, windowColor = '#ffd98a'): void {
  const r = new Seeded(seed);
  let x = -20;
  while (x < w) {
    const bw = r.range(60, 130);
    const bh = r.range(maxH * 0.35, maxH);
    ctx.fillStyle = vGradient(ctx, baseY - bh, baseY, [
      [0, shade(color, 0.08)],
      [1, shade(color, -0.2)],
    ]);
    ctx.fillRect(x, baseY - bh, bw, bh);
    for (let wy = baseY - bh + 14; wy < baseY - 14; wy += 22) {
      for (let wx = x + 10; wx < x + bw - 14; wx += 18) {
        if (r.next() < lit) {
          ctx.fillStyle = windowColor;
          ctx.fillRect(wx, wy, 8, 11);
        }
      }
    }
    x += bw + r.range(2, 10);
  }
}

/** Smoke plume or smog made of translucent blurred puffs. */
export function smoke(ctx: Ctx2D, x: number, y: number, s: number, color: string, seed: number, alpha = 0.5, drift = 1): void {
  const r = new Seeded(seed);
  ctx.save();
  ctx.filter = `blur(${Math.round(6 * s)}px)`;
  for (let i = 0; i < 12; i++) {
    const t = i / 12;
    ctx.fillStyle = rgba(color, alpha * (1 - t * 0.6));
    ctx.beginPath();
    ctx.arc(x + t * 160 * s * drift + r.range(-14, 14) * s, y - t * 220 * s, (16 + t * 46) * s, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Light rays (sun or underwater). */
export function rays(ctx: Ctx2D, x: number, y: number, len: number, color: string, count: number, seed: number, alpha = 0.12): void {
  const r = new Seeded(seed);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < count; i++) {
    const a = Math.PI / 2 + r.range(-0.6, 0.6);
    const wdt = r.range(20, 70);
    ctx.fillStyle = rgba(color, alpha * r.range(0.5, 1));
    ctx.beginPath();
    ctx.moveTo(x - wdt / 4, y);
    ctx.lineTo(x + wdt / 4, y);
    ctx.lineTo(x + Math.cos(a) * len + wdt, y + Math.sin(a) * len);
    ctx.lineTo(x + Math.cos(a) * len - wdt, y + Math.sin(a) * len);
    ctx.fill();
  }
  ctx.restore();
}

/** Dark edges that focus the eye on the centre. */
export function vignette(ctx: Ctx2D, w: number, h: number, strength = 0.45): void {
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(20,12,30,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/** Subtle paint grain. */
export function grain(ctx: Ctx2D, w: number, h: number, seed: number, amount = 0.05): void {
  const r = new Seeded(seed);
  for (let i = 0; i < (w * h) / 180; i++) {
    ctx.fillStyle = r.next() < 0.5 ? `rgba(255,255,255,${amount})` : `rgba(0,0,0,${amount})`;
    ctx.fillRect(r.range(0, w), r.range(0, h), 2, 2);
  }
}

/** Soft elliptical contact shadow under an object. */
export function contactShadow(ctx: Ctx2D, x: number, y: number, rw: number, rh: number, alpha = 0.28): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, rh / rw);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rw);
  g.addColorStop(0, `rgba(0,0,0,${alpha})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, rw, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Rounded rectangle path helper. */
export function roundRect(ctx: Ctx2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
