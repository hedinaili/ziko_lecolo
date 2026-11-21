import type { BackgroundId } from '../../data/introPanels';
import {
  ball,
  city,
  cloud,
  contactShadow,
  fillSky,
  flower,
  glow,
  grain,
  grass,
  hills,
  rays,
  roundRect,
  Seeded,
  shade,
  smoke,
  tree,
  vGradient,
  vignette,
  type Ctx2D,
} from './canvas';
import {
  bee,
  bigWave,
  bubbles,
  chimneyFactory,
  coral,
  crackedHouse,
  earthGlobe,
  fish,
  golemPneus,
  maskedPerson,
  orangutan,
  polarBearOnIce,
  sacZombie,
  stump,
  tornado,
  trashMound,
  turtle,
  volcano,
  whale,
} from './props';

export const W = 1280;
export const H = 720;

export interface PanelPainting {
  /** Far layer (sky, distant scenery): moves slowly. */
  back: (ctx: Ctx2D) => void;
  /** Near layer (ground, props, vignette): moves faster for parallax depth. */
  front: (ctx: Ctx2D) => void;
}

function finish(ctx: Ctx2D, seed: number, vig = 0.45): void {
  vignette(ctx, W, H, vig);
  grain(ctx, W, H, seed, 0.035);
}

const PAINTINGS: Record<BackgroundId, PanelPainting> = {
  garden: {
    back(ctx) {
      fillSky(ctx, W, H, [
        [0, '#7ec8f2'],
        [0.6, '#b9a7e8'],
        [1, '#f6d1e3'],
      ]);
      glow(ctx, 1080, 140, 260, '#fff1b8', 0.7);
      ball(ctx, 1080, 140, 70, '#ffd45c', 0.4, -0.1);
      rays(ctx, 1080, 140, 700, '#fff6d0', 7, 4, 0.08);
      cloud(ctx, 140, 130, 1.1);
      cloud(ctx, 760, 90, 0.8, '#ffffff', '#d7d2ef', 0.85);
      hills(ctx, W, H, 430, 30, '#9fcfa8', 1, 2);
      hills(ctx, W, H, 480, 36, '#7fbf6a', 2, 3);
      tree(ctx, 980, 500, 0.9, '#5aa64e', 3, '#f4a6c8');
      tree(ctx, 1180, 520, 1.1, '#4f9c45', 5, '#f4a6c8');
    },
    front(ctx) {
      hills(ctx, W, H, 570, 14, '#6bbf59', 3, 2);
      grass(ctx, 0, W, 600, '#5aa64e', 7, 0.35, 22);
      const r = new Seeded(11);
      for (let i = 0; i < 26; i++) flower(ctx, r.range(380, 1260), r.range(600, 690), r.range(0.8, 1.3), ['#f4a6c8', '#ffd45c', '#ffffff', '#b9a7e8'][i % 4]!);
      bee(ctx, 640, 470, 1.1);
      bee(ctx, 860, 410, 0.9);
      finish(ctx, 12, 0.3);
    },
  },
  livingRoom: {
    back(ctx) {
      fillSky(ctx, W, H, [
        [0, '#2d2440'],
        [1, '#1b1528'],
      ]);
      ctx.fillStyle = '#3a2f52';
      for (let x = 0; x < W; x += 80) ctx.fillRect(x, 0, 40, 560);
      ctx.fillStyle = vGradient(ctx, 560, H, [
        [0, '#6b4f3a'],
        [1, '#3e2c20'],
      ]);
      ctx.fillRect(0, 560, W, 160);
    },
    front(ctx) {
      glow(ctx, 640, 320, 420, '#5aa8ff', 0.35);
      ctx.fillStyle = '#121019';
      roundRect(ctx, 370, 130, 540, 340, 20);
      ctx.fill();
      ctx.fillStyle = vGradient(ctx, 150, 450, [
        [0, '#3d86d0'],
        [1, '#1d4f8a'],
      ]);
      ctx.fillRect(395, 155, 490, 290);
      ctx.fillStyle = '#e5483b';
      ctx.fillRect(395, 395, 490, 50);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FLASH SPÉCIAL — AN 2500', 640, 430);
      ball(ctx, 640, 280, 80, '#2e8fd0', 0.4, -0.4);
      ctx.fillStyle = '#121019';
      ctx.fillRect(610, 470, 60, 40);
      ctx.fillStyle = vGradient(ctx, 520, 700, [
        [0, '#a0473d'],
        [1, '#5e2520'],
      ]);
      roundRect(ctx, 60, 540, 420, 160, 40);
      ctx.fill();
      roundRect(ctx, 40, 500, 80, 200, 30);
      ctx.fill();
      finish(ctx, 21, 0.55);
    },
  },
  ocean: {
    back(ctx) {
      fillSky(ctx, W, H, [
        [0, '#1d5b8a'],
        [0.5, '#0b2a4a'],
        [1, '#020b16'],
      ]);
      rays(ctx, 640, -40, 760, '#9fd8ff', 9, 31, 0.07);
      whale(ctx, 820, 220, 1.1, 0.35);
      for (let i = 0; i < 7; i++) fish(ctx, 260 + i * 110, 300 + (i % 3) * 70, 0.9, '#f2b93b', i % 2 === 0, 0.85 - i * 0.1);
    },
    front(ctx) {
      ctx.fillStyle = vGradient(ctx, 600, H, [
        [0, '#3a3a40'],
        [1, '#141418'],
      ]);
      ctx.beginPath();
      ctx.moveTo(0, 640);
      ctx.quadraticCurveTo(400, 600, 800, 650);
      ctx.quadraticCurveTo(1050, 680, W, 630);
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.fill();
      for (const [x, c] of [
        [520, '#8a8890'],
        [600, '#77757c'],
        [1100, '#8a8890'],
      ] as const)
        coral(ctx, x, 650, 1.2, c, x);
      turtle(ctx, 960, 470, 1.2, 0.75);
      bubbles(ctx, 960, 430, 260, 9);
      finish(ctx, 32, 0.6);
    },
  },
  smogCity: {
    back(ctx) {
      fillSky(ctx, W, H, [
        [0, '#9b9384'],
        [1, '#6a655e'],
      ]);
      glow(ctx, 300, 150, 160, '#d8c9a0', 0.35);
      city(ctx, W, 520, '#7a7570', 41, 0.05, 220);
      smoke(ctx, 200, 420, 2.4, '#8a857c', 42, 0.35, 2);
      city(ctx, W, 560, '#4f4b4d', 43, 0.12, 300);
    },
    front(ctx) {
      chimneyFactory(ctx, 900, 560, 1, '#55505a', 44);
      ctx.fillStyle = vGradient(ctx, 560, H, [
        [0, '#5a5658'],
        [1, '#2f2c2e'],
      ]);
      ctx.fillRect(0, 560, W, 160);
      maskedPerson(ctx, 560, 640, 1, '#6a7a9a');
      maskedPerson(ctx, 700, 660, 0.9, '#9a6a5a');
      maskedPerson(ctx, 820, 650, 0.8, '#7a8a6a');
      ctx.fillStyle = 'rgba(120,115,105,0.35)';
      ctx.fillRect(0, 0, W, H);
      finish(ctx, 45, 0.55);
    },
  },
  hospital: {
    back(ctx) {
      fillSky(ctx, W, H, [
        [0, '#eef3f6'],
        [1, '#c3cfd8'],
      ]);
      ctx.fillStyle = '#d7e1e8';
      for (let x = 60; x < W; x += 220) ctx.fillRect(x, 60, 160, 200);
    },
    front(ctx) {
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      roundRect(ctx, 368, 118, 580, 380, 18);
      ctx.fill();
      ctx.fillStyle = '#1e2a36';
      roundRect(ctx, 360, 110, 580, 380, 18);
      ctx.fill();
      ctx.fillStyle = vGradient(ctx, 130, 470, [
        [0, '#12303a'],
        [1, '#0b1d24'],
      ]);
      ctx.fillRect(380, 130, 540, 340);
      ctx.strokeStyle = 'rgba(80,200,160,0.25)';
      ctx.lineWidth = 1;
      for (let y = 150; y < 470; y += 30) {
        ctx.beginPath();
        ctx.moveTo(380, y);
        ctx.lineTo(920, y);
        ctx.stroke();
      }
      ctx.strokeStyle = '#ff6b5b';
      ctx.lineWidth = 7;
      ctx.shadowColor = '#ff6b5b';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(400, 190);
      ctx.lineTo(520, 215);
      ctx.lineTo(620, 280);
      ctx.lineTo(720, 330);
      ctx.lineTo(900, 420);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#9fe0c8';
      ctx.font = '28px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Espérance de vie', 400, 165);
      ctx.fillText('80', 400, 230);
      ctx.fillStyle = '#ff6b5b';
      ctx.font = 'bold 64px sans-serif';
      ctx.fillText('50', 840, 400);
      ctx.fillStyle = vGradient(ctx, 600, H, [
        [0, '#b8c4cc'],
        [1, '#8a98a2'],
      ]);
      ctx.fillRect(0, 600, W, 120);
      finish(ctx, 51, 0.35);
    },
  },
  heat: {
    back(ctx) {
      fillSky(ctx, W, H, [
        [0, '#ff9a4a'],
        [0.6, '#e5483b'],
        [1, '#8a2a1e'],
      ]);
      glow(ctx, 980, 170, 380, '#ffd36b', 0.8);
      ball(ctx, 980, 170, 110, '#ffe08a', 0.4, -0.05);
      hills(ctx, W, H, 520, 26, '#a0663a', 61, 2);
    },
    front(ctx) {
      ctx.fillStyle = vGradient(ctx, 570, H, [
        [0, '#b47a48'],
        [1, '#6a4020'],
      ]);
      ctx.fillRect(0, 570, W, 150);
      ctx.strokeStyle = '#4a2a14';
      ctx.lineWidth = 3;
      const r = new Seeded(62);
      for (let i = 0; i < 18; i++) {
        let x = r.range(0, W);
        let y = 580;
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let k = 0; k < 4; k++) {
          x += r.range(-40, 40);
          y += r.range(20, 40);
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      stump(ctx, 1140, 600, 1.4);
      // Thermometer.
      ctx.fillStyle = '#f4efe2';
      roundRect(ctx, 600, 150, 60, 330, 30);
      ctx.fill();
      ball(ctx, 630, 500, 55, '#e5483b', 0.4, -0.3);
      ctx.fillStyle = '#e5483b';
      roundRect(ctx, 615, 165, 30, 330, 15);
      ctx.fill();
      ctx.strokeStyle = '#4a3426';
      ctx.lineWidth = 5;
      roundRect(ctx, 600, 150, 60, 330, 30);
      ctx.stroke();
      ctx.fillStyle = '#fff6e3';
      ctx.font = 'bold 56px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('+4 °C', 690, 230);
      finish(ctx, 63, 0.5);
    },
  },
  gasStation: {
    back(ctx) {
      fillSky(ctx, W, H, [
        [0, '#d6c4a4'],
        [1, '#8f7f68'],
      ]);
      hills(ctx, W, H, 470, 20, '#9c8a6e', 71, 2);
    },
    front(ctx) {
      ctx.fillStyle = vGradient(ctx, 560, H, [
        [0, '#6a6563'],
        [1, '#3a3634'],
      ]);
      ctx.fillRect(0, 560, W, 160);
      ctx.fillStyle = '#e8e1d2';
      ctx.fillRect(400, 220, 520, 36);
      ctx.fillStyle = '#9a948a';
      ctx.fillRect(430, 256, 20, 304);
      ctx.fillRect(870, 256, 20, 304);
      for (const px of [520, 720]) {
        ctx.fillStyle = vGradient(ctx, 330, 560, [
          [0, '#e5483b'],
          [1, '#8a2a1e'],
        ]);
        roundRect(ctx, px, 330, 90, 230, 12);
        ctx.fill();
        ctx.fillStyle = '#1e1a18';
        ctx.fillRect(px + 15, 360, 60, 40);
      }
      ctx.fillStyle = '#fff6e3';
      roundRect(ctx, 400, 110, 520, 80, 16);
      ctx.fill();
      ctx.strokeStyle = '#4a3426';
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.fillStyle = '#e5483b';
      ctx.font = 'bold 44px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⛔ PLUS DE PÉTROLE', 660, 166);
      for (const [cx, col] of [
        [1000, '#5a7d9a'],
        [1170, '#9a5a5a'],
      ] as const) {
        contactShadow(ctx, cx, 640, 90, 14);
        ctx.fillStyle = col;
        roundRect(ctx, cx - 90, 570, 180, 60, 18);
        ctx.fill();
        roundRect(ctx, cx - 55, 530, 110, 50, 16);
        ctx.fill();
        ball(ctx, cx - 50, 635, 20, '#222');
        ball(ctx, cx + 50, 635, 20, '#222');
      }
      finish(ctx, 72, 0.5);
    },
  },
  dumpNight: {
    back(ctx) {
      fillSky(ctx, W, H, [
        [0, '#0e0c18'],
        [1, '#2a2238'],
      ]);
      ball(ctx, 180, 120, 40, '#e8e4d8', 0.2, -0.2);
      glow(ctx, 180, 120, 140, '#c9c4ff', 0.25);
      trashMound(ctx, 640, 640, 900, 420, 81, '#2f2836');
    },
    front(ctx) {
      trashMound(ctx, 1000, 700, 700, 300, 82, '#3b3340');
      trashMound(ctx, 250, 720, 600, 220, 83, '#3b3340');
      glow(ctx, 620, 380, 60, '#ffe14d', 0.5);
      ctx.fillStyle = '#ffe14d';
      for (const [x, y] of [
        [605, 380],
        [645, 380],
        [905, 470],
        [935, 470],
      ] as const) {
        ctx.beginPath();
        ctx.ellipse(x, y, 9, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(40,20,60,0.25)';
      ctx.fillRect(0, 0, W, H);
      finish(ctx, 84, 0.7);
    },
  },
  parkAttack: {
    back(ctx) {
      fillSky(ctx, W, H, [
        [0, '#8ea6ba'],
        [1, '#5e6e7c'],
      ]);
      hills(ctx, W, H, 470, 30, '#6f8a62', 91, 2);
      tree(ctx, 160, 520, 0.8, '#4f7a45', 92);
      tree(ctx, 330, 540, 0.7, '#557f4a', 93);
    },
    front(ctx) {
      hills(ctx, W, H, 580, 10, '#5f7f45', 94, 2);
      grass(ctx, 0, W, 610, '#5a7a40', 95, 0.3, 18);
      trashMound(ctx, 880, 650, 760, 90, 96, '#4a4250');
      sacZombie(ctx, 760, 600, 1.15);
      golemPneus(ctx, 1080, 620, 0.95);
      finish(ctx, 97, 0.5);
    },
  },
  endangered: {
    back(ctx) {
      fillSky(ctx, W, H, [
        [0, '#a9d1ee'],
        [1, '#5f86a8'],
      ]);
      ctx.fillStyle = vGradient(ctx, 560, H, [
        [0, '#3c8fc8'],
        [1, '#123e66'],
      ]);
      ctx.fillRect(0, 560, W, 160);
    },
    front(ctx) {
      polarBearOnIce(ctx, 370, 590, 1.25);
      ctx.fillStyle = '#5a7a40';
      ctx.fillRect(820, 300, 460, 300);
      for (let i = 0; i < 5; i++) stump(ctx, 860 + i * 90, 600, 1.2);
      orangutan(ctx, 1000, 560, 1.3);
      bee(ctx, 700, 380, 1.4, 0.6);
      bee(ctx, 640, 460, 1.0, 0.4);
      finish(ctx, 101, 0.5);
    },
  },
  disasters: {
    back(ctx) {
      const q: [number, number, [string, string]][] = [
        [0, 0, ['#d9683a', '#5a2018']],
        [W / 2, 0, ['#6a7a96', '#2a3346']],
        [0, H / 2, ['#5fa8d8', '#1d4f78']],
        [W / 2, H / 2, ['#a08a6a', '#4a3a28']],
      ];
      for (const [x, y, [a, b]] of q) {
        ctx.fillStyle = vGradient(ctx, y, y + H / 2, [
          [0, a],
          [1, b],
        ]);
        ctx.fillRect(x, y, W / 2, H / 2);
      }
    },
    front(ctx) {
      volcano(ctx, 320, 360, 380, 230, 111);
      tornado(ctx, 960, 350, 300);
      bigWave(ctx, 60, 720, 520, 300);
      crackedHouse(ctx, 860, 700, 1.3);
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(W / 2, 0);
      ctx.lineTo(W / 2, H);
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();
      finish(ctx, 112, 0.45);
    },
  },
  bedroom: {
    back(ctx) {
      fillSky(ctx, W, H, [
        [0, '#232a4d'],
        [1, '#141832'],
      ]);
      ctx.fillStyle = '#2b335c';
      roundRect(ctx, 700, 110, 320, 250, 14);
      ctx.fill();
      fillSkyRect(ctx, 720, 130, 280, 210);
      ball(ctx, 900, 200, 34, '#f4efd8', 0.2, -0.2);
      glow(ctx, 900, 200, 120, '#c9c4ff', 0.3);
    },
    front(ctx) {
      rays(ctx, 860, 340, 380, '#b9c4ff', 3, 121, 0.06);
      ctx.fillStyle = vGradient(ctx, 600, H, [
        [0, '#3a3050'],
        [1, '#221c30'],
      ]);
      ctx.fillRect(0, 600, W, 120);
      ctx.fillStyle = '#4a3a2a';
      roundRect(ctx, 260, 470, 520, 160, 20);
      ctx.fill();
      ctx.fillStyle = vGradient(ctx, 440, 560, [
        [0, '#7a8ad0'],
        [1, '#3e4a8a'],
      ]);
      roundRect(ctx, 270, 430, 500, 120, 30);
      ctx.fill();
      ctx.fillStyle = '#e8e4f8';
      roundRect(ctx, 290, 420, 130, 60, 26);
      ctx.fill();
      ctx.fillStyle = '#8a5a3a';
      roundRect(ctx, 820, 350, 60, 50, 8);
      ctx.fill();
      ctx.strokeStyle = '#4f9c45';
      ctx.lineWidth = 6;
      for (const a of [-0.6, 0, 0.6]) {
        ctx.beginPath();
        ctx.moveTo(850, 352);
        ctx.quadraticCurveTo(850 + a * 30, 320, 850 + a * 60, 300);
        ctx.stroke();
      }
      finish(ctx, 122, 0.65);
    },
  },
  sprout: {
    back(ctx) {
      fillSky(ctx, W, H, [
        [0, '#fde7b6'],
        [1, '#f4b07e'],
      ]);
      glow(ctx, 900, 200, 400, '#fff1c8', 0.6);
      city(ctx, W, 520, '#d3a88a', 131, 0.0, 200);
    },
    front(ctx) {
      ctx.fillStyle = vGradient(ctx, 520, H, [
        [0, '#a6a39f'],
        [1, '#6f6c69'],
      ]);
      ctx.fillRect(0, 520, W, 200);
      ctx.strokeStyle = 'rgba(60,60,60,0.35)';
      ctx.lineWidth = 2;
      for (let x = 0; x < W; x += 160) {
        ctx.beginPath();
        ctx.moveTo(x, 520);
        ctx.lineTo(x - 60, H);
        ctx.stroke();
      }
      ctx.strokeStyle = '#4a4744';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(560, 520);
      ctx.lineTo(610, 590);
      ctx.lineTo(600, 640);
      ctx.lineTo(640, 720);
      ctx.stroke();
      glow(ctx, 610, 540, 180, '#fff1a8', 0.55);
      ctx.strokeStyle = '#4f9c45';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(610, 592);
      ctx.quadraticCurveTo(606, 540, 616, 500);
      ctx.stroke();
      for (const [dx, rot] of [
        [-34, -0.5],
        [34, 0.5],
      ] as const) {
        ctx.fillStyle = vGradient(ctx, 470, 520, [
          [0, '#9be07a'],
          [1, '#4f9c45'],
        ]);
        ctx.beginPath();
        ctx.ellipse(616 + dx, 500, 38, 18, rot, 0, Math.PI * 2);
        ctx.fill();
      }
      finish(ctx, 132, 0.35);
    },
  },
  doorstep: {
    back(ctx) {
      fillSky(ctx, W, H, [
        [0, '#ffb36b'],
        [0.5, '#f6a6a0'],
        [1, '#b9a7e8'],
      ]);
      glow(ctx, 960, 560, 420, '#ffe0a0', 0.7);
      earthGlobe(ctx, 960, 230, 130, 0.25);
      hills(ctx, W, H, 540, 24, '#8fa07a', 141, 2);
    },
    front(ctx) {
      ctx.fillStyle = vGradient(ctx, 600, H, [
        [0, '#9a7a5f'],
        [1, '#5e4634'],
      ]);
      ctx.fillRect(0, 600, W, 120);
      ctx.fillStyle = '#6b4a33';
      ctx.fillRect(60, 120, 300, 490);
      ctx.fillStyle = vGradient(ctx, 150, 600, [
        [0, '#fff1c8'],
        [1, '#f2c78a'],
      ]);
      ctx.fillRect(90, 150, 240, 460);
      glow(ctx, 210, 400, 220, '#fff1c8', 0.4);
      tree(ctx, 1180, 610, 0.8, '#5aa64e', 142);
      finish(ctx, 143, 0.35);
    },
  },
  earth: {
    back(ctx) {
      fillSky(ctx, W, H, [
        [0, '#0b1230'],
        [1, '#3c2f6e'],
      ]);
      const r = new Seeded(151);
      for (let i = 0; i < 180; i++) {
        ctx.fillStyle = `rgba(255,255,255,${r.range(0.2, 0.9)})`;
        ctx.beginPath();
        ctx.arc(r.range(0, W), r.range(0, H), r.range(0.6, 2.2), 0, Math.PI * 2);
        ctx.fill();
      }
      glow(ctx, 300, 200, 300, '#8a6ad0', 0.25);
    },
    front(ctx) {
      earthGlobe(ctx, 800, 340, 240, 0.4);
      smoke(ctx, 700, 260, 1.1, '#6e6e78', 152, 0.25, 1.5);
      finish(ctx, 153, 0.5);
    },
  },
};

function fillSkyRect(ctx: Ctx2D, x: number, y: number, w: number, h: number): void {
  ctx.fillStyle = vGradient(ctx, y, y + h, [
    [0, '#0d1026'],
    [1, '#232a5a'],
  ]);
  ctx.fillRect(x, y, w, h);
  const r = new Seeded(x + y);
  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillRect(x + r.range(0, w), y + r.range(0, h), 2, 2);
  }
  shade('#000000', 0);
}

export function panelPainting(id: BackgroundId): PanelPainting {
  return PAINTINGS[id];
}
