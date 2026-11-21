import type * as Phaser from 'phaser';
import type { TrackKind } from './board-track';
import { shade } from './paint/canvas';

// Each pictogram has a distinct silhouette and at most two interior details at token size.
export const motifs = {
  start: ['Départ', '#ffdb42', 'M4 15L16 4 28 15V28H4Z', 'M3 15L16 3 29 15', 'M13 19H20V28H13Z'],
  cleanup: ['Nettoyage', '#279e27', 'M21 3L25 5 18 17 24 21 18 29 4 21 11 12 15 14Z', 'M11 17L20 22', 'M8 22L12 17M13 25L16 20'],
  minigame: ['Mini-jeu', '#058ff5', 'M8 9Q16 11 23 9Q28 8 30 23Q30 30 22 23L20 21H12L9 25Q1 32 3 21Q4 10 8 9Z', 'M7 16H14M10 13V19', 'M21 17h1M25 14h1'],
  card: ['Surprise', '#ffca24', 'M5 4H26V28H5Z', 'M11 12Q12 6 18 8Q24 10 18 15Q15 17 15 19', 'M15 23h1'],
  job: ['Petit boulot', '#ff8009', 'M4 11H28V27H4Z M11 11V6H21V11', 'M5 16Q16 20 27 16', 'M15 16H18V20H15Z'],
  combat: ['Créature', '#df252f', 'M5 7L12 11 16 5 20 11 27 7 28 21 22 28 10 28 4 21Z', 'M8 15L13 17M24 15L19 17', 'M12 23L15 21 18 23 21 21'],
  trap: ['Piège', '#41444c', 'M16 3L30 28H2Z', 'M16 12V19', 'M16 23h0.5'],
  demo: ['Manifestation', '#e82a55', 'M4 5L28 3 29 19 19 20 20 29 15 29 14 21 5 21Z', 'M11 15Q12 8 23 8Q21 16 11 15Z', ''],
  animal: ['Animal à sauver', '#65ad18', 'M7 24Q8 19 13 16Q16 11 20 16Q27 22 26 25Q24 30 18 26Q15 25 12 27Q6 30 7 24Z M3 13a3 4 0 1 0 6 0a3 4 0 1 0 -6 0 M11 8a3 4 0 1 0 6 0a3 4 0 1 0 -6 0 M20 9a3 4 0 1 0 6 0a3 4 0 1 0 -6 0', '', ''],
  tv: ['Interview télé', '#00a4eb', 'M3 11H29V28H3Z', 'M9 3L16 11 23 4', 'M7 15H21V24H7Z M25 17v1'],
  chantier: ['Chantier vert', '#32a337', 'M10 13L13 10 27 24Q29 28 25 29Z M4 12L15 2 22 8 18 12 15 9 8 16Z', '', ''],
} satisfies Record<TrackKind, [string, string, string, string, string]>;

export function tokenKey(scene: Phaser.Scene, kind: TrackKind, width = 96): string {
  const key = `tile-${kind}-${width}`;
  if (scene.textures.exists(key)) return key;
  const [, color, outline, detail, accent] = motifs[kind];
  // Supersample the vector master, then area-filter to the actual sprite size.
  // Uploading the large master directly skips fine lines during minification.
  const master = document.createElement('canvas');
  master.width = 560; master.height = 520;
  const ctx = master.getContext('2d')!;
    ctx.scale(10, 10);
    const disc = (y: number, fill: string) => {
      ctx.beginPath(); ctx.ellipse(28, y, 25, 20, 0, 0, 2 * Math.PI);
      ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = '#44382d'; ctx.lineWidth = 1.4; ctx.stroke();
    };
    disc(29, shade(color, -0.5));
    disc(24, color);
    ctx.lineCap = 'round';
    for (const [from, to, edge] of [[1.02, 1.83, shade(color, 0.65)], [0.02, 0.78, shade(color, -0.36)]] as const) {
      ctx.beginPath();
      ctx.ellipse(28, 24, 23.4, 18.4, 0, from * Math.PI, to * Math.PI);
      ctx.lineWidth = 1.6; ctx.strokeStyle = edge; ctx.stroke();
    }
    ctx.translate(10, 7); ctx.scale(1.12, 1.07);
    ctx.lineJoin = ctx.lineCap = 'round'; ctx.strokeStyle = '#293735';
    const path = new Path2D(outline);
    ctx.fillStyle = '#fffdf5'; ctx.fill(path); ctx.lineWidth = 1.8; ctx.stroke(path);
    ctx.lineWidth = 2.6; ctx.stroke(new Path2D(detail)); ctx.stroke(new Path2D(accent));
    const texture = scene.textures.createCanvas(key, width * 2, Math.round(width * 104 / 112) * 2);
    if (!texture) throw new Error(`Texture de case indisponible : ${kind}`);
    texture.context.imageSmoothingEnabled = true;
    texture.context.imageSmoothingQuality = 'high';
    texture.context.drawImage(master, 0, 0, texture.width, texture.height);
    texture.refresh();
    return key;
}

