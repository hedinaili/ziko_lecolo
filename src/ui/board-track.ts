import { TILES } from '../data/board';
import type { TileKind } from '../core/types';

export type TrackKind = Exclude<TileKind, 'shop'>;
// The headless economy simulation still models shop visits as stops. The playable
// movement preview uses the revised route in docs/05, without changing that simulation.
const replacements: Readonly<Record<number, TrackKind | undefined>> = { 6: 'cleanup', 19: 'demo', 32: 'chantier' };
export const track = TILES.map(({ index, kind }): TrackKind => {
  if (kind !== 'shop') return kind;
  const replacement = replacements[index];
  if (!replacement) throw new Error(`Case boutique sans remplacement : ${index}`);
  return replacement;
});

export function trackPoints() {
  // Equal arc lengths keep the tokens apart at the narrow ends of the oval.
  const points = Array.from({ length: 721 }, (_, i) => {
    const angle = Math.PI / 2 + i * Math.PI / 360;
    return { x: 417 + 376 * Math.cos(angle), y: 410 + 135 * Math.sin(angle) };
  });
  let length = 0;
  const distances = points.map((p, i) => {
    if (i) length += Math.hypot(p.x - points[i - 1]!.x, p.y - points[i - 1]!.y);
    return length;
  });
  const centers = track.map((_, i) => points[distances.findIndex(d => d >= length * i / track.length)]!);
  const aspect = 104 / 112;
  const gap = 4;
  return centers.map(({ x, y }, index) => {
    // Keep the entire rectangular hit areas separate, including at the ends of the oval.
    let width = 44 + (y - 275) / 30;
    for (const [j, other] of centers.entries()) {
      if (j !== index) width = Math.min(width, Math.max(Math.abs(other.x - x) - gap, (Math.abs(other.y - y) - gap) / aspect));
    }
    return { x, y, width, height: width * aspect };
  });
}
