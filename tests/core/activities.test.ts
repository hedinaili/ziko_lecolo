import { describe, expect, it } from 'vitest';
import { computeTv, LAUGH_BONUS, medalFor, minigameBonus, pickQuestions } from '../../src/core/activities';
import { Rng } from '../../src/core/rng';
import { QUIZ } from '../../src/data/quiz';
import { makeCtx } from './helpers';

/** A Rng whose range() always returns the middle value (no audience randomness). */
function flatRng(): Rng {
  const r = new Rng(1);
  r.range = (min: number, max: number) => (min + max) / 2;
  return r;
}

describe('TV interview (docs/13)', () => {
  it.each([
    ['child', ['correct', 'correct', 'correct'], false, 12_000, 6, 20],
    ['young', ['correct', 'correct', 'wrong'], false, 90_000, 45, 20],
    ['adult', ['correct', 'correct', 'wrong'], true, 1_350_000, 675, 25],
    ['hero', ['correct', 'correct', 'correct', 'correct'], true, 18_000_000, 9_000, 43],
  ] as const)('%s %j (micro %s) → audience %d', (era, answers, micro, audience, volunteers, coins) => {
    const r = computeTv(era, answers, micro, flatRng());
    expect(r.audience).toBe(audience);
    expect(r.volunteers).toBe(volunteers);
    expect(r.coins).toBe(coins);
  });

  it('makes the audience laugh with absurd answers (+5 % each)', () => {
    const serious = computeTv('young', ['correct', 'wrong', 'wrong'], false, flatRng());
    const funny = computeTv('young', ['correct', 'absurd', 'absurd'], false, flatRng());
    expect(funny.laughs).toBe(2);
    expect(funny.audience).toBe(Math.round(serious.audience * (1 + 2 * LAUGH_BONUS)));
  });

  it('gives sponsor kits only for a perfect interview and always at least one volunteer', () => {
    const perfect = computeTv('child', ['correct', 'correct', 'correct'], false, flatRng());
    expect(perfect.sponsorKits).toBe(2);
    expect(perfect.localDelta).toBe(4);
    const bad = computeTv('child', ['wrong', 'wrong', 'wrong'], false, flatRng());
    expect(bad.sponsorKits).toBe(0);
    expect(bad.volunteers).toBeGreaterThanOrEqual(1);
    expect(bad.gasDelta).toBeCloseTo(-0.4);
    expect(computeTv('child', [], false, flatRng()).ratio).toBe(0);
  });

  it('picks questions of the era without repeats, then falls back to other eras', () => {
    const ctx = makeCtx();
    const childCount = QUIZ.filter((q) => q.era === 'child').length;
    const first = pickQuestions(ctx.state, 'child', 3, ctx.rng);
    const second = pickQuestions(ctx.state, 'child', 3, ctx.rng);
    expect(new Set([...first, ...second]).size).toBe(6);
    for (const id of first) expect(QUIZ.find((q) => q.id === id)?.era).toBe('child');
    const third = pickQuestions(ctx.state, 'child', 3, ctx.rng);
    expect(third).toHaveLength(3);
    expect(childCount).toBe(6);
    expect(third.every((id) => QUIZ.find((q) => q.id === id)?.era !== 'child')).toBe(true);
  });

  it('still returns questions when the whole bank was used', () => {
    const ctx = makeCtx();
    ctx.state.usedQuestions = QUIZ.map((q) => q.id);
    const ids = pickQuestions(ctx.state, 'hero', 4, ctx.rng);
    expect(new Set(ids).size).toBe(4);
  });
});

describe('mini-game rewards (docs/11)', () => {
  it.each([
    [0, 'none', 2],
    [0.39, 'none', 2],
    [0.4, 'bronze', 6],
    [0.7, 'silver', 12],
    [0.9, 'gold', 20],
    [5, 'gold', 20],
    [Number.NaN, 'none', 2],
  ] as const)('ratio %d → %s (%d coins)', (ratio, medal, coins) => {
    expect(medalFor(ratio)).toEqual({ medal, coins });
  });

  it('adds a metric bonus for silver and gold only', () => {
    expect(minigameBonus('astroZiko', 'bronze')).toEqual({});
    expect(minigameBonus('astroZiko', 'silver')).toEqual({ marineSurvival: 10 });
    expect(minigameBonus('smogBuster', 'gold')).toEqual({ toxicGas: -1.2, diseases: -1 });
  });
});
