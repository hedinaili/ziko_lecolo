import { describe, expect, it } from 'vitest';
import { Rng } from '../../src/core/rng';

describe('Rng', () => {
  it('is deterministic for a given seed', () => {
    const a = new Rng(42);
    const b = new Rng(42);
    const seqA = Array.from({ length: 20 }, () => a.next());
    const seqB = Array.from({ length: 20 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it('produces different sequences for different seeds', () => {
    expect(new Rng(1).next()).not.toEqual(new Rng(2).next());
  });

  it('can be resumed from its saved state', () => {
    const a = new Rng(7);
    a.next();
    a.next();
    const b = new Rng(0);
    b.state = a.state;
    expect(b.next()).toEqual(a.next());
  });

  it('int() stays within inclusive bounds and covers them', () => {
    const r = new Rng(3);
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i++) {
      const v = r.int(1, 6);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(6);
      seen.add(v);
    }
    expect(seen.size).toBe(6);
  });

  it('chance() respects extreme probabilities', () => {
    const r = new Rng(9);
    for (let i = 0; i < 100; i++) {
      expect(r.chance(0)).toBe(false);
      expect(r.chance(1)).toBe(true);
    }
  });

  it('rejects invalid ranges and empty picks', () => {
    const r = new Rng(1);
    expect(() => r.int(5, 1)).toThrow(RangeError);
    expect(() => r.pick([])).toThrow(RangeError);
    expect(r.pick(['a'])).toBe('a');
  });

  it('range() returns floats within bounds', () => {
    const r = new Rng(5);
    for (let i = 0; i < 100; i++) {
      const v = r.range(0.9, 1.1);
      expect(v).toBeGreaterThanOrEqual(0.9);
      expect(v).toBeLessThan(1.1);
    }
  });
});
