import { expect, it } from 'vitest';
import { trackPoints } from '../../src/ui/board-track';

it('leaves a gap between all 36 tile hit areas, including across the start', () => {
  const layout = trackPoints();
  expect(layout).toHaveLength(36);
  for (const [i, a] of layout.entries()) {
    for (const b of layout.slice(i + 1)) {
      const gapX = Math.abs(a.x - b.x) - (a.width + b.width) / 2;
      const gapY = Math.abs(a.y - b.y) - (a.height + b.height) / 2;
      expect(Math.max(gapX, gapY)).toBeGreaterThanOrEqual(4 - 1e-9);
    }
  }
});
