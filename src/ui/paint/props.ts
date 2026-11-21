import { ball, contactShadow, glow, roundRect, Seeded, shade, smoke, vGradient, type Ctx2D } from './canvas';

/** Painted props for the opening comic and future scenes. */

export function fish(ctx: Ctx2D, x: number, y: number, s: number, color: string, flip = false, alpha = 1): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(flip ? -s : s, s);
  ctx.fillStyle = shade(color, -0.2);
  ctx.beginPath();
  ctx.moveTo(-30, 0);
  ctx.lineTo(-52, -16);
  ctx.lineTo(-48, 0);
  ctx.lineTo(-52, 16);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = vGradient(ctx, -18, 18, [
    [0, shade(color, 0.3)],
    [1, shade(color, -0.25)],
  ]);
  ctx.beginPath();
  ctx.ellipse(0, 0, 34, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(18, -4, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(19, -4, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function turtle(ctx: Ctx2D, x: number, y: number, s: number, alpha = 1): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = '#7fb07a';
  for (const [fx, fy, r] of [
    [-38, -22, -0.6],
    [38, -22, 0.6],
    [-30, 26, -0.4],
    [30, 26, 0.4],
  ] as const) {
    ctx.beginPath();
    ctx.ellipse(fx, fy, 22, 10, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ball(ctx, 0, -48, 16, '#8cc285');
  ctx.fillStyle = vGradient(ctx, -36, 36, [
    [0, '#7c9a4a'],
    [1, '#3f5a2a'],
  ]);
  ctx.beginPath();
  ctx.ellipse(0, 0, 40, 36, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(30,40,20,0.5)';
  ctx.lineWidth = 3;
  for (const [hx, hy] of [
    [0, 0],
    [-20, -14],
    [20, -14],
    [-20, 14],
    [20, 14],
  ] as const) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.lineTo(hx + Math.cos(a) * 11, hy + Math.sin(a) * 11);
    }
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();
}

export function whale(ctx: Ctx2D, x: number, y: number, s: number, alpha = 0.5): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = vGradient(ctx, -60, 60, [
    [0, '#3d6f9a'],
    [1, '#1d3b5a'],
  ]);
  ctx.beginPath();
  ctx.moveTo(-200, 0);
  ctx.bezierCurveTo(-160, -70, 80, -80, 160, -20);
  ctx.lineTo(230, -60);
  ctx.lineTo(215, 0);
  ctx.lineTo(240, 50);
  ctx.lineTo(160, 15);
  ctx.bezierCurveTo(60, 70, -150, 60, -200, 0);
  ctx.fill();
  ctx.fillStyle = 'rgba(220,235,245,0.6)';
  ctx.beginPath();
  ctx.ellipse(-80, 30, 90, 16, 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function coral(ctx: Ctx2D, x: number, y: number, s: number, color: string, seed: number): void {
  const r = new Seeded(seed);
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  const branch = (bx: number, by: number, a: number, len: number, w: number, depth: number) => {
    const ex = bx + Math.cos(a) * len;
    const ey = by + Math.sin(a) * len;
    ctx.lineWidth = w;
    ctx.strokeStyle = shade(color, depth * 0.08);
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    if (depth < 4) {
      branch(ex, ey, a - r.range(0.2, 0.6), len * 0.75, w * 0.7, depth + 1);
      branch(ex, ey, a + r.range(0.2, 0.6), len * 0.75, w * 0.7, depth + 1);
    }
  };
  branch(x, y, -Math.PI / 2, 46 * s, 12 * s, 0);
}

export function bubbles(ctx: Ctx2D, x: number, y: number, h: number, seed: number): void {
  const r = new Seeded(seed);
  ctx.strokeStyle = 'rgba(200,235,255,0.6)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 14; i++) {
    ctx.beginPath();
    ctx.arc(x + r.range(-30, 30), y - r.range(0, h), r.range(3, 9), 0, Math.PI * 2);
    ctx.stroke();
  }
}

export function chimneyFactory(ctx: Ctx2D, x: number, baseY: number, s: number, color: string, seed: number, smokeColor = '#4a4650'): void {
  ctx.fillStyle = vGradient(ctx, baseY - 120 * s, baseY, [
    [0, shade(color, 0.1)],
    [1, shade(color, -0.25)],
  ]);
  ctx.fillRect(x, baseY - 110 * s, 200 * s, 110 * s);
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    ctx.moveTo(x + i * 50 * s, baseY - 110 * s);
    ctx.lineTo(x + i * 50 * s + 25 * s, baseY - 140 * s);
    ctx.lineTo(x + (i + 1) * 50 * s, baseY - 110 * s);
  }
  ctx.fill();
  for (const cx of [30, 120]) {
    ctx.fillStyle = shade(color, -0.1);
    ctx.fillRect(x + cx * s, baseY - 300 * s, 34 * s, 200 * s);
    ctx.fillStyle = '#c8433a';
    ctx.fillRect(x + cx * s, baseY - 290 * s, 34 * s, 12 * s);
    smoke(ctx, x + (cx + 17) * s, baseY - 310 * s, s * 1.2, smokeColor, seed + cx, 0.55);
  }
}

export function maskedPerson(ctx: Ctx2D, x: number, y: number, s: number, coat: string): void {
  contactShadow(ctx, x, y, 30 * s, 8 * s);
  ctx.fillStyle = vGradient(ctx, y - 150 * s, y, [
    [0, shade(coat, 0.15)],
    [1, shade(coat, -0.3)],
  ]);
  roundRect(ctx, x - 26 * s, y - 120 * s, 52 * s, 120 * s, 18 * s);
  ctx.fill();
  ball(ctx, x, y - 140 * s, 24 * s, '#e0b48c');
  ctx.fillStyle = '#e9f1f5';
  roundRect(ctx, x - 16 * s, y - 138 * s, 32 * s, 18 * s, 6 * s);
  ctx.fill();
  ctx.fillStyle = '#3a2a20';
  ctx.beginPath();
  ctx.arc(x - 8 * s, y - 148 * s, 2.5 * s, 0, Math.PI * 2);
  ctx.arc(x + 8 * s, y - 148 * s, 2.5 * s, 0, Math.PI * 2);
  ctx.fill();
}

export function trashMound(ctx: Ctx2D, cx: number, baseY: number, w: number, h: number, seed: number, dark = '#3b3340'): void {
  const r = new Seeded(seed);
  ctx.fillStyle = vGradient(ctx, baseY - h, baseY, [
    [0, shade(dark, 0.15)],
    [1, shade(dark, -0.3)],
  ]);
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, baseY);
  ctx.quadraticCurveTo(cx - w / 4, baseY - h * 1.1, cx, baseY - h);
  ctx.quadraticCurveTo(cx + w / 4, baseY - h * 0.9, cx + w / 2, baseY);
  ctx.fill();
  const colors = ['#5a7d9a', '#9a5a5a', '#d8d2c0', '#6a8a4a', '#2b2b33', '#c9a25a'];
  for (let i = 0; i < 60; i++) {
    const px = cx + r.range(-w / 2.4, w / 2.4);
    const top = baseY - h * (1 - Math.abs(px - cx) / (w / 2));
    const py = r.range(top + 10, baseY - 4);
    const c = colors[Math.floor(r.range(0, colors.length))] ?? '#555';
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(r.range(-1, 1));
    ctx.fillStyle = shade(c, -0.35);
    const k = r.next();
    if (k < 0.3) roundRect(ctx, -10, -6, 20, 12, 3);
    else if (k < 0.6) {
      ctx.beginPath();
      ctx.ellipse(0, 0, 12, 7, 0, 0, Math.PI * 2);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.restore();
  }
}

/** Glowing eyes for creatures (docs/12: yellow/red eyes that shine). */
export function evilEyes(ctx: Ctx2D, x: number, y: number, s: number, color = '#ffe14d', gap = 40): void {
  for (const dx of [-gap / 2, gap / 2]) {
    glow(ctx, x + dx * s, y, 26 * s, color, 0.55);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x + dx * s, y, 13 * s, 9 * s, dx < 0 ? 0.25 : -0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1208';
    ctx.beginPath();
    ctx.arc(x + dx * s + 2 * s, y + 1 * s, 4 * s, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = '#120d16';
  ctx.lineWidth = 6 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - (gap / 2 + 16) * s, y - 16 * s);
  ctx.lineTo(x - (gap / 2 - 8) * s, y - 8 * s);
  ctx.moveTo(x + (gap / 2 + 16) * s, y - 16 * s);
  ctx.lineTo(x + (gap / 2 - 8) * s, y - 8 * s);
  ctx.stroke();
}

function teeth(ctx: Ctx2D, x: number, y: number, w: number, s: number): void {
  ctx.fillStyle = '#2a0d10';
  ctx.beginPath();
  ctx.ellipse(x, y, w / 2, 16 * s, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = '#f4efe2';
  const n = 6;
  for (let i = 0; i < n; i++) {
    const tx = x - w / 2 + (i + 0.5) * (w / n);
    ctx.beginPath();
    ctx.moveTo(tx - 6 * s, y);
    ctx.lineTo(tx + 6 * s, y);
    ctx.lineTo(tx, y + 12 * s);
    ctx.fill();
  }
}

/** Sac-Zombie (docs/12, reference sheet): torn black bag with a red knot, green zombie arms. */
export function sacZombie(ctx: Ctx2D, x: number, y: number, s: number): void {
  contactShadow(ctx, x, y, 110 * s, 22 * s, 0.35);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = '#4b7a3a';
  ctx.lineWidth = 18;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-80, -140);
  ctx.quadraticCurveTo(-150, -120, -160, -60);
  ctx.moveTo(80, -140);
  ctx.quadraticCurveTo(150, -110, 150, -50);
  ctx.stroke();
  ctx.fillStyle = vGradient(ctx, -280, 0, [
    [0, '#4a4a58'],
    [0.5, '#25252e'],
    [1, '#121218'],
  ]);
  ctx.beginPath();
  ctx.moveTo(-30, -250);
  ctx.bezierCurveTo(-140, -230, -130, -20, -90, 0);
  ctx.lineTo(-60, -14);
  ctx.lineTo(-30, 0);
  ctx.lineTo(0, -16);
  ctx.lineTo(40, 0);
  ctx.lineTo(70, -14);
  ctx.lineTo(95, 0);
  ctx.bezierCurveTo(140, -40, 130, -230, 30, -250);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-70, -200);
  ctx.quadraticCurveTo(-90, -120, -70, -60);
  ctx.stroke();
  ctx.fillStyle = '#d8433a';
  ctx.beginPath();
  ctx.ellipse(0, -258, 30, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-4, -262);
  ctx.lineTo(-36, -300);
  ctx.lineTo(-10, -268);
  ctx.lineTo(28, -296);
  ctx.closePath();
  ctx.fill();
  evilEyes(ctx, 0, -170, 1, '#ffe14d', 70);
  teeth(ctx, 0, -120, 120, 1);
  ctx.fillStyle = '#cfe8f2';
  roundRect(ctx, 130, -90, 26, 60, 8);
  ctx.fill();
  ctx.restore();
}

/** Golem de pneus (docs/12): stacked tyres, hubcap shoulder, red eyes. */
export function golemPneus(ctx: Ctx2D, x: number, y: number, s: number): void {
  contactShadow(ctx, x, y, 130 * s, 24 * s, 0.35);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const tyre = (tx: number, ty: number, rx: number, ry: number) => {
    ctx.fillStyle = vGradient(ctx, ty - ry, ty + ry, [
      [0, '#4a4a4f'],
      [1, '#141416'],
    ]);
    ctx.beginPath();
    ctx.ellipse(tx, ty, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 3;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(tx + i * rx * 0.3, ty - ry * 0.8);
      ctx.lineTo(tx + i * rx * 0.3 + 6, ty + ry * 0.8);
      ctx.stroke();
    }
  };
  for (const lx of [-50, 50]) for (let i = 0; i < 3; i++) tyre(lx, -20 - i * 34, 40, 18);
  for (let i = 0; i < 4; i++) tyre(0, -130 - i * 36, 90, 26);
  for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) tyre(sx * (110 + i * 10), -230 + i * 40, 30, 22);
  tyre(0, -300, 70, 40);
  ball(ctx, -110, -250, 34, '#b9bcc2', 0.5, -0.4);
  ctx.fillStyle = '#6d7077';
  ctx.beginPath();
  ctx.arc(-110, -250, 10, 0, Math.PI * 2);
  ctx.fill();
  evilEyes(ctx, 0, -304, 1, '#ff5a3c', 56);
  ctx.restore();
}

export function polarBearOnIce(ctx: Ctx2D, x: number, y: number, s: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = vGradient(ctx, -10, 40, [
    [0, '#f4fbff'],
    [1, '#a9cde3'],
  ]);
  ctx.beginPath();
  ctx.moveTo(-150, 0);
  ctx.lineTo(140, -6);
  ctx.lineTo(120, 36);
  ctx.lineTo(-130, 40);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = vGradient(ctx, -130, 0, [
    [0, '#ffffff'],
    [1, '#d6e2ea'],
  ]);
  ctx.beginPath();
  ctx.ellipse(-10, -60, 90, 55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-80, -40, 28, 42);
  ctx.fillRect(40, -40, 28, 42);
  ball(ctx, 80, -110, 40, '#f4f7fa', 0.2, -0.15);
  ball(ctx, 60, -145, 12, '#eef3f6');
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(112, -106, 6, 0, Math.PI * 2);
  ctx.arc(90, -118, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7ec8f2';
  ctx.beginPath();
  ctx.ellipse(86, -100, 3, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function bee(ctx: Ctx2D, x: number, y: number, s: number, alpha = 1): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = 'rgba(220,240,255,0.7)';
  ctx.beginPath();
  ctx.ellipse(-6, -16, 12, 8, -0.5, 0, Math.PI * 2);
  ctx.ellipse(8, -16, 12, 8, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f2b93b';
  ctx.beginPath();
  ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2b2b33';
  ctx.fillRect(-6, -11, 5, 22);
  ctx.fillRect(4, -11, 5, 22);
  ctx.restore();
}

export function orangutan(ctx: Ctx2D, x: number, y: number, s: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = '#a4521f';
  ctx.lineWidth = 16;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-30, -60);
  ctx.quadraticCurveTo(-80, -140, -60, -220);
  ctx.stroke();
  ctx.fillStyle = vGradient(ctx, -120, 0, [
    [0, '#c46a2c'],
    [1, '#7d3a14'],
  ]);
  ctx.beginPath();
  ctx.ellipse(0, -50, 46, 60, 0, 0, Math.PI * 2);
  ctx.fill();
  ball(ctx, 0, -120, 32, '#b85e24');
  ctx.fillStyle = '#e2b48a';
  ctx.beginPath();
  ctx.ellipse(0, -112, 20, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2b1a10';
  ctx.beginPath();
  ctx.arc(-8, -120, 3, 0, Math.PI * 2);
  ctx.arc(8, -120, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function stump(ctx: Ctx2D, x: number, y: number, s: number): void {
  ctx.fillStyle = '#6b4a33';
  ctx.fillRect(x - 20 * s, y - 40 * s, 40 * s, 40 * s);
  ctx.fillStyle = '#c9a27a';
  ctx.beginPath();
  ctx.ellipse(x, y - 40 * s, 20 * s, 7 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function volcano(ctx: Ctx2D, cx: number, baseY: number, w: number, h: number, seed: number): void {
  ctx.fillStyle = vGradient(ctx, baseY - h, baseY, [
    [0, '#5a3a2e'],
    [1, '#2a1a14'],
  ]);
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, baseY);
  ctx.lineTo(cx - w * 0.1, baseY - h);
  ctx.lineTo(cx + w * 0.1, baseY - h);
  ctx.lineTo(cx + w / 2, baseY);
  ctx.fill();
  glow(ctx, cx, baseY - h, 120, '#ff7a2a', 0.8);
  ctx.strokeStyle = '#ff6a1a';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(cx, baseY - h);
  ctx.quadraticCurveTo(cx + 30, baseY - h / 2, cx + 60, baseY - 10);
  ctx.stroke();
  smoke(ctx, cx, baseY - h - 20, 1.3, '#3a2f2f', seed, 0.7, 0.4);
}

export function tornado(ctx: Ctx2D, cx: number, baseY: number, h: number): void {
  for (let i = 0; i < 18; i++) {
    const t = i / 18;
    ctx.fillStyle = `rgba(${170 - t * 40},${180 - t * 40},${195 - t * 40},0.7)`;
    ctx.beginPath();
    ctx.ellipse(cx + Math.sin(t * 7) * 20, baseY - t * h, 18 + t * 110, 10 + t * 18, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function bigWave(ctx: Ctx2D, x: number, baseY: number, w: number, h: number): void {
  ctx.fillStyle = vGradient(ctx, baseY - h, baseY, [
    [0, '#5fb3e6'],
    [1, '#174a78'],
  ]);
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.bezierCurveTo(x + w * 0.2, baseY - h * 0.4, x + w * 0.45, baseY - h * 1.05, x + w * 0.75, baseY - h * 0.9);
  ctx.bezierCurveTo(x + w * 0.9, baseY - h * 0.8, x + w * 0.85, baseY - h * 0.5, x + w * 0.7, baseY - h * 0.55);
  ctx.bezierCurveTo(x + w * 0.85, baseY - h * 0.3, x + w, baseY - h * 0.1, x + w, baseY);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.45, baseY - h * 1.0);
  ctx.bezierCurveTo(x + w * 0.6, baseY - h * 1.05, x + w * 0.85, baseY - h * 0.85, x + w * 0.72, baseY - h * 0.6);
  ctx.stroke();
}

export function crackedHouse(ctx: Ctx2D, x: number, baseY: number, s: number): void {
  ctx.fillStyle = '#c9b49a';
  ctx.fillRect(x, baseY - 140 * s, 200 * s, 140 * s);
  ctx.fillStyle = '#8a4a3a';
  ctx.beginPath();
  ctx.moveTo(x - 20 * s, baseY - 140 * s);
  ctx.lineTo(x + 100 * s, baseY - 220 * s);
  ctx.lineTo(x + 220 * s, baseY - 140 * s);
  ctx.fill();
  ctx.fillStyle = '#5a7d9a';
  ctx.fillRect(x + 30 * s, baseY - 110 * s, 40 * s, 40 * s);
  ctx.fillRect(x + 130 * s, baseY - 110 * s, 40 * s, 40 * s);
  ctx.strokeStyle = '#2b1a10';
  ctx.lineWidth = 5 * s;
  ctx.beginPath();
  ctx.moveTo(x + 100 * s, baseY - 200 * s);
  ctx.lineTo(x + 90 * s, baseY - 140 * s);
  ctx.lineTo(x + 115 * s, baseY - 90 * s);
  ctx.lineTo(x + 95 * s, baseY - 30 * s);
  ctx.lineTo(x + 110 * s, baseY);
  ctx.stroke();
}

export function earthGlobe(ctx: Ctx2D, cx: number, cy: number, r: number, sick = 0.4): void {
  glow(ctx, cx, cy, r * 1.35, '#7ec8f2', 0.45);
  const g = ctx.createRadialGradient(cx - r * 0.4, cy - r * 0.4, r * 0.1, cx, cy, r);
  g.addColorStop(0, '#6fc0f0');
  g.addColorStop(0.7, '#2e8fd0');
  g.addColorStop(1, '#123e66');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  const land = (lx: number, ly: number, rx: number, ry: number, rot: number) => {
    ctx.fillStyle = vGradient(ctx, cy + ly - ry, cy + ly + ry, [
      [0, '#8fd47a'],
      [1, '#3f8a3a'],
    ]);
    ctx.beginPath();
    ctx.ellipse(cx + lx, cy + ly, rx, ry, rot, 0, Math.PI * 2);
    ctx.fill();
  };
  land(-r * 0.3, -r * 0.25, r * 0.35, r * 0.22, -0.4);
  land(r * 0.25, r * 0.2, r * 0.25, r * 0.38, 0.3);
  land(-r * 0.4, r * 0.35, r * 0.18, r * 0.12, 0.2);
  land(r * 0.45, -r * 0.45, r * 0.2, r * 0.1, 0.5);
  ctx.fillStyle = `rgba(110,110,120,${sick})`;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  const shadow = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  shadow.addColorStop(0.45, 'rgba(0,0,20,0)');
  shadow.addColorStop(1, 'rgba(0,0,20,0.55)');
  ctx.fillStyle = shadow;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
}
