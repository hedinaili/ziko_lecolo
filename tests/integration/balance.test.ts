import { beforeAll, describe, expect, it } from 'vitest';
import { simulate, type ProfileReport } from '../../src/sim/simulate';

/** Guardrails from docs/14 "Équilibrage" (with a small tolerance, bots are approximations of players). */
describe('balance guardrails (simulation)', () => {
  let reports: Record<string, ProfileReport>;

  beforeAll(() => {
    reports = Object.fromEntries(simulate(150).map((r) => [r.profile, r]));
  }, 60_000);

  it('ranks profiles: better play gives a later estimated year', () => {
    expect(reports.average!.yearMedian).toBeGreaterThan(reports.passive!.yearMedian);
    expect(reports.expert!.yearMedian).toBeGreaterThan(reports.average!.yearMedian);
  });

  it('keeps passive players in danger, average around 3 500–5 000, experts in the thousands of years', () => {
    expect(reports.passive!.yearMedian).toBeLessThan(3000);
    expect(reports.average!.yearMedian).toBeGreaterThanOrEqual(3200);
    expect(reports.average!.yearMedian).toBeLessThanOrEqual(5000);
    expect(reports.expert!.yearMedian).toBeGreaterThanOrEqual(6500);
  });

  it('rarely bankrupts reasonable players', () => {
    expect(reports.average!.bankruptRate).toBeLessThan(0.06);
    expect(reports.expert!.bankruptRate).toBeLessThan(0.06);
  });

  it('does not leave average players with too much money', () => {
    expect(reports.average!.coinsMean).toBeLessThanOrEqual(60);
  });

  it('lasts about 20–30 minutes and never more than 45', () => {
    for (const r of Object.values(reports)) {
      expect(r.minutesMean).toBeGreaterThanOrEqual(20);
      expect(r.minutesMean).toBeLessThanOrEqual(30);
      expect(r.minutesMax).toBeLessThanOrEqual(45);
    }
  });
});
