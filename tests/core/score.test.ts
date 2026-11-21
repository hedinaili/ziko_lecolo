import { describe, expect, it } from 'vitest';
import { initialMetrics } from '../../src/core/metrics';
import { D0, durationIndex, ending, estimatedYear, qualityIndex, stars, YEAR_CURVE, yearFromGain, yearLevel } from '../../src/core/score';
import type { Metrics } from '../../src/core/types';

describe('score (docs/15)', () => {
  it('estimates the year 2800 at the start', () => {
    expect(D0).toBeCloseTo(28.75, 1);
    expect(estimatedYear(initialMetrics())).toBe(2800);
  });

  it('grows with the duration index along the calibrated curve', () => {
    const best: Metrics = { lifeExpectancy: 90, marineSurvival: 1500, temperature: 1, toxicGas: 0, diseases: 0, creatures: 0, biodiversity: 100, cleanEnergy: 100, localProducts: 100 };
    expect(durationIndex(best)).toBeCloseTo(100);
    expect(estimatedYear(best)).toBe(Math.round(yearFromGain(durationIndex(best) - D0) / 10) * 10);
    expect(estimatedYear(best)).toBeGreaterThan(20000);
    const worst: Metrics = { lifeExpectancy: 30, marineSurvival: 0, temperature: 6, toxicGas: 60, diseases: 90, creatures: 10, biodiversity: 0, cleanEnergy: 0, localProducts: 0 };
    expect(estimatedYear(worst)).toBeLessThan(2800);
  });

  it('interpolates a monotonic year curve and clamps its ends', () => {
    for (let i = 1; i < YEAR_CURVE.length; i++) {
      expect(YEAR_CURVE[i]![0]).toBeGreaterThan(YEAR_CURVE[i - 1]![0]);
      expect(YEAR_CURVE[i]![1]).toBeGreaterThan(YEAR_CURVE[i - 1]![1]);
    }
    expect(yearFromGain(0)).toBe(2800);
    expect(yearFromGain(2.5)).toBe((2800 + YEAR_CURVE.find(([x]) => x === 5)![1]) / 2);
    expect(yearFromGain(-100)).toBe(YEAR_CURVE[0]![1]);
    expect(yearFromGain(1000)).toBe(YEAR_CURVE.at(-1)![1]);
  });

  it('computes the quality of life around 30 at the start', () => {
    expect(qualityIndex(initialMetrics(), 0)).toBeCloseTo(30.14, 1);
    expect(qualityIndex(initialMetrics(), 10)).toBeCloseTo(40.14, 1);
    expect(qualityIndex(initialMetrics(), 50)).toBeCloseTo(40.14, 1);
  });

  it.each([
    [10, 1],
    [30, 2],
    [50, 3],
    [70, 4],
    [85, 5],
  ])('quality %d → %d stars', (q, s) => {
    expect(stars(q)).toBe(s);
  });

  it('classifies the year in 4 levels', () => {
    expect(yearLevel(2999)).toBe('critical');
    expect(yearLevel(3000)).toBe('alert');
    expect(yearLevel(4000)).toBe('normal');
    expect(yearLevel(8000)).toBe('comfortable');
  });

  it.each([
    [2700, 90, 'danger'],
    [3500, 90, 'centuries'],
    [5000, 50, 'holding'],
    [5000, 75, 'reviving'],
    [9000, 50, 'solid'],
    [9000, 80, 'superhero'],
  ] as const)('ending(%d, Q=%d) = %s', (year, q, id) => {
    const e = ending(year, q, 2540);
    expect(e.id).toBe(id);
    expect(e.title.length).toBeGreaterThan(0);
    expect(e.sentence.length).toBeGreaterThan(0);
  });

  it('mentions the remaining years', () => {
    expect(ending(5300, 80, 2540).sentence).toContain('2760');
  });
});
