import { expect, it } from 'vitest';
import { diePose } from '../../src/ui/rolling-die';

it('starts on the previous result and lands on the requested face for every throw', () => {
  for (let from = 1; from <= 6; from++) {
    for (let to = 1; to <= 6; to++) {
      for (const [time, expected] of [[0, from], [1, to]] as const) {
        const pose = diePose(from, to, time);
        expect(pose.lift).toBeCloseTo(0);
        expect(pose.faces.at(-1)?.pips.length).toBe(expected);
      }
    }
  }
});
