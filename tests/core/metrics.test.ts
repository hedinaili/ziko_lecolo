import { describe, expect, it } from 'vitest';
import {
  clampMetric,
  improvement,
  initialMetrics,
  levelIndex,
  levelOf,
  METRICS,
  milestoneStep,
  normalize,
} from '../../src/core/metrics';
import { METRIC_IDS } from '../../src/core/types';

describe('metrics', () => {
  it('starts with the values of the prologue (docs/07)', () => {
    expect(initialMetrics()).toEqual({
      lifeExpectancy: 50,
      marineSurvival: 300,
      temperature: 4,
      toxicGas: 40,
      diseases: 55,
      creatures: 6,
      biodiversity: 25,
      cleanEnergy: 10,
      localProducts: 20,
    });
  });

  it('starts almost everything in critical, creatures in alert', () => {
    const m = initialMetrics();
    for (const id of METRIC_IDS) {
      expect(levelOf(id, m[id])).toBe(id === 'creatures' ? 'alert' : 'critical');
    }
  });

  it.each([
    ['lifeExpectancy', 54.9, 'critical'],
    ['lifeExpectancy', 55, 'alert'],
    ['lifeExpectancy', 65, 'normal'],
    ['lifeExpectancy', 75, 'comfortable'],
    ['temperature', 3.5, 'critical'],
    ['temperature', 3.49, 'alert'],
    ['temperature', 2.4, 'normal'],
    ['temperature', 1.49, 'comfortable'],
    ['toxicGas', 35, 'critical'],
    ['toxicGas', 19.9, 'normal'],
    ['toxicGas', 9.9, 'comfortable'],
    ['creatures', 8, 'critical'],
    ['creatures', 4.9, 'normal'],
    ['creatures', 1, 'comfortable'],
    ['marineSurvival', 1000, 'comfortable'],
    ['cleanEnergy', 39.9, 'alert'],
  ] as const)('levelOf(%s, %d) = %s', (id, value, level) => {
    expect(levelOf(id, value)).toBe(level);
  });

  it('orders levels from critical to comfortable', () => {
    expect(levelIndex('critical')).toBeLessThan(levelIndex('comfortable'));
  });

  it('normalizes between worst (0) and best (100) and clamps', () => {
    expect(normalize('temperature', 6)).toBe(0);
    expect(normalize('temperature', 1)).toBe(100);
    expect(normalize('temperature', 4)).toBeCloseTo(40);
    expect(normalize('toxicGas', 80)).toBe(0);
    expect(normalize('biodiversity', 120)).toBe(100);
  });

  it('clamps to the hard range', () => {
    expect(clampMetric('toxicGas', -3)).toBe(0);
    expect(clampMetric('creatures', 14)).toBe(10);
    expect(clampMetric('lifeExpectancy', 60)).toBe(60);
  });

  it('measures improvement according to direction', () => {
    expect(improvement('toxicGas', 40, 35)).toBe(5);
    expect(improvement('lifeExpectancy', 50, 55)).toBe(5);
    expect(improvement('temperature', 4, 4.5)).toBe(-0.5);
  });

  it('computes milestone steps relative to the start (docs/08)', () => {
    expect(milestoneStep('marineSurvival', 349)).toBe(0);
    expect(milestoneStep('marineSurvival', 350)).toBe(1);
    expect(milestoneStep('lifeExpectancy', 60)).toBe(2);
    expect(milestoneStep('toxicGas', 35)).toBe(1);
    expect(milestoneStep('toxicGas', 45)).toBe(0);
    expect(milestoneStep('temperature', 3.0)).toBe(2);
  });

  it('defines coherent ranges for every metric', () => {
    for (const id of METRIC_IDS) {
      const d = METRICS[id];
      expect(d.initial).toBeGreaterThanOrEqual(d.min);
      expect(d.initial).toBeLessThanOrEqual(d.max);
      expect(d.step).toBeGreaterThan(0);
    }
  });
});
