import { describe, expect, it } from 'vitest';
import { AstroRound, type AstroHit } from '../../src/core/astro';
import { Rng } from '../../src/core/rng';

describe('Astro-Ziko', () => {
  it('accelerates for two seconds, then requires five full seconds to recharge', () => {
    const round = new AstroRound(new Rng(3),'child');
    round.activateTurbo();
    round.advance(100,1248,600);
    expect(round.x).toBeCloseTo(640 + 111.6);
    round.advance(1899,640,600);
    round.activateTurbo();
    expect(round.turboActive).toBe(true);
    round.advance(1,640,600);
    expect(round.turboGauge).toBe(0);
    round.advance(4999,640,600);
    round.activateTurbo();
    expect(round.turboActive).toBe(false);
    round.advance(1,640,600);
    round.activateTurbo();
    expect(round.turboActive).toBe(true);
  });
  it.each([[25, -10], [5, -5], [0, 0]])('reports the actual bird penalty starting at %i points', (score, delta) => {
    const round = new AstroRound(new Rng(3), 'child');
    round.score = score;
    round.targets.push({kind:'bird', hp:1, x:640, y:560, vx:0});
    const hits: AstroHit[] = [];
    round.advance(16,640,600, hit => hits.push(hit));
    expect(hits.map(hit => hit.scoreDelta)).toEqual([delta]);
    expect(round.score).toBe(score + delta);
    expect(round.breakdown.bird).toEqual({touched:1, points:delta});
  });
  it('stops at 30 seconds even if the last frame overruns; further input cannot score', () => {
    const round = new AstroRound(new Rng(7), 'child');
    round.advance(29_999, 700, 550);
    expect(round.finished).toBe(false);
    round.advance(700, 680, 500);
    expect(round.elapsed).toBe(30_000);
    expect(round.finished).toBe(true);
    const before = JSON.stringify(round);
    round.advance(500, 20, 0);
    expect(JSON.stringify(round)).toBe(before);
  });
  it('auto-fires, rewards waste and penalizes shooting a bird', () => {
    const round = new AstroRound(new Rng(3), 'child');
    const hits: AstroHit[] = [];
    for (const [kind,hp] of [['bag',1],['bottle',2],['bird',1]] as const) {
      round.targets.push({kind, hp, x:640, y:560, vx:0});
      if (kind !== 'bag') {
        for (let i=0;i<hp;i++) round.shots.push({x:640,y:570});
      }
      round.advance(16,640,600, hit => hits.push(hit));
      expect(round.score).toBe(kind === 'bag' ? 10 : kind === 'bottle' ? 25 : 15);
    }
    expect(hits.map(h => [h.kind, h.removed])).toEqual([
      ['bag', true], ['bottle', false], ['bottle', true], ['bird', true],
    ]);
    expect(hits.every(h => h.x === 640 && Math.abs(h.y - 560) < 4)).toBe(true);
    round.targets.push({kind:'bottle', hp:2, x:640, y:560, vx:0});
    round.shots.push({x:640,y:570});
    round.advance(16,640,600);
    expect(round.breakdown).toEqual({
      bottle:{touched:2, points:15}, bag:{touched:1, points:10}, bird:{touched:1, points:-10},
    });
  });
});
