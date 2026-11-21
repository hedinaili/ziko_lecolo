import { describe, expect, it } from 'vitest';
import { catastropheChance, runYearEnd, yearlyDeltas, yearlyIncome } from '../../src/core/yearEnd';
import { BALANCE } from '../../src/data/balance';
import { eventsOf, makeCtx, milestoneKeys } from './helpers';

describe('yearly evolution (docs/07)', () => {
  it('drifts continuously from the starting values when nothing is done', () => {
    const d = yearlyDeltas(makeCtx().state);
    expect(d.temperature).toBeCloseTo(0.021); // 0.015 + 0.0006 × (40 − 30)
    expect(d.toxicGas).toBeCloseTo(0.2); // 0.3 − 0.01 × 10
    expect(d.diseases).toBeCloseTo(-0.56); // 8 % towards 1.2 × 40 = 48
    expect(d.lifeExpectancy).toBeCloseTo(0.16); // 8 % towards 85 − 0.6 × 55 = 52
    expect(d.marineSurvival).toBeCloseTo(-3);
    expect(d.biodiversity).toBeCloseTo(-0.25);
    expect(d.creatures).toBeCloseTo(0.08);
    expect(d.cleanEnergy).toBeCloseTo(0.3);
    expect(d.localProducts).toBeCloseTo(-0.1);
  });

  it('cuts transport pollution when people buy local products', () => {
    const ctx = makeCtx();
    const before = yearlyDeltas(ctx.state);
    ctx.state.metrics.localProducts = 60;
    const after = yearlyDeltas(ctx.state);
    expect(after.toxicGas! - before.toxicGas!).toBeCloseTo(-0.4);
    expect(after.marineSurvival! - before.marineSurvival!).toBeCloseTo(4);
    expect(after.temperature!).toBeLessThan(before.temperature!);
  });

  it('applies the clean power law', () => {
    const plain = yearlyDeltas(makeCtx().state);
    const law = yearlyDeltas(makeCtx({ laws: ['cleanPower'] }).state);
    expect(law.cleanEnergy! - plain.cleanEnergy!).toBeCloseTo(1.5);
    expect(law.toxicGas! - plain.toxicGas!).toBeCloseTo(-0.3);
  });

  it('lets clean energy and clean air heal the planet', () => {
    const ctx = makeCtx();
    Object.assign(ctx.state.metrics, { cleanEnergy: 70, toxicGas: 10, diseases: 30, lifeExpectancy: 60, temperature: 2 });
    const d = yearlyDeltas(ctx.state);
    expect(d.temperature).toBeLessThan(0);
    expect(d.toxicGas).toBeLessThan(0);
    expect(d.diseases).toBeLessThan(0);
    expect(d.lifeExpectancy).toBeGreaterThan(0);
  });

  it('applies laws and projects', () => {
    const d = yearlyDeltas(makeCtx({ laws: ['antiPlastic', 'cleanAir', 'oceans', 'climate'], projects: ['recycling'] }).state);
    expect(d.creatures).toBeCloseTo(0.02);
    expect(d.toxicGas).toBeCloseTo(-0.3);
    expect(d.diseases).toBeCloseTo(-0.86);
    expect(d.temperature).toBeCloseTo(-0.019);
    expect(d.marineSurvival).toBeCloseTo(12);
    expect(d.cleanEnergy).toBeCloseTo(1.8);
  });

  it('rewards passive items and computes yearly income', () => {
    const ctx = makeCtx({ inventory: { mop: 1, solar: 2, filter: 1 } });
    const d = yearlyDeltas(ctx.state);
    expect(d.cleanEnergy).toBeCloseTo(2.3);
    expect(d.toxicGas).toBeCloseTo(-0.4);
    expect(d.diseases).toBeCloseTo(-0.86);
    expect(yearlyIncome(ctx.state)).toBe(4);
    expect(yearlyIncome(makeCtx({ projects: ['solarPlant'], chantiers: { borne: 1 } }).state)).toBe(5);
  });

  it('makes catastrophes more likely when it is hot', () => {
    expect(catastropheChance(4)).toBe(0.25);
    expect(catastropheChance(3)).toBe(0.15);
    expect(catastropheChance(2)).toBe(0.08);
    expect(catastropheChance(0.5)).toBe(0.03);
  });
});

describe('runYearEnd (docs/04)', () => {
  it('degrades, pays the cost of living, ages Ziko and waits for the next roll', () => {
    const ctx = makeCtx({ phase: 'yearEnd' });
    const report = runYearEnd(ctx);
    expect(report.lifeCost).toBe(1);
    expect(ctx.state.turn).toBe(1);
    expect(ctx.state.phase).toBe('awaitRoll');
    expect(eventsOf(ctx, 'yearEnded')).toHaveLength(1);
    expect(ctx.state.metrics.temperature).toBeGreaterThan(4);
  });

  it('removes catastrophes after 3 years', () => {
    const ctx = makeCtx({ turn: 5, catastrophes: [{ kind: 'storm', region: 'asia', year: 2502 }] });
    ctx.state.metrics.temperature = 0;
    runYearEnd(ctx);
    expect(ctx.state.catastrophes.filter((c) => c.year === 2502)).toEqual([]);
  });

  it('triggers catastrophes with effects over many years when it is hot', () => {
    let count = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const ctx = makeCtx({ coins: 500 }, seed);
      const report = runYearEnd(ctx);
      if (report.catastrophe) {
        count++;
        expect(eventsOf(ctx, 'catastrophe')).toHaveLength(1);
        expect(ctx.state.history.some((h) => h.kind === 'catastrophe')).toBe(true);
      }
    }
    expect(count).toBeGreaterThan(5);
  });

  it('changes era at 18 and expires child quests', () => {
    const ctx = makeCtx({ turn: 7, coins: 100 });
    runYearEnd(ctx);
    expect(eventsOf(ctx, 'eraChanged')[0]).toMatchObject({ from: 'child', to: 'young' });
    expect(milestoneKeys(ctx)).toContain('era:young');
    expect(ctx.state.quests.expired.length + ctx.state.quests.completed.length).toBe(3);
  });

  it('lends coins once (grandma), then goes bankrupt and simulates the remaining years', () => {
    const ctx = makeCtx({ coins: 0, turn: 3 });
    ctx.state.metrics.temperature = 0; // almost no catastrophe
    ctx.rng.chance = () => false;
    const first = runYearEnd(ctx);
    expect(first.loan).toBe(BALANCE.grandmaLoan);
    expect(ctx.state.coins).toBe(BALANCE.grandmaLoan - 1);
    expect(eventsOf(ctx, 'grandmaLoan')).toHaveLength(1);

    ctx.state.coins = 0;
    const second = runYearEnd(ctx);
    expect(second.bankrupt).toBe(true);
    expect(ctx.state.ended).toBe('bankrupt');
    expect(ctx.state.phase).toBe('ended');
    expect(ctx.state.turn).toBe(40);
    expect(eventsOf(ctx, 'gameOver')[0]).toEqual({ type: 'gameOver', reason: 'bankrupt' });
  });

  it('ends the game after 40 years', () => {
    const ctx = makeCtx({ turn: 39, coins: 100 });
    const report = runYearEnd(ctx);
    expect(report.ended).toBe(true);
    expect(ctx.state.ended).toBe('time');
    expect(ctx.state.turn).toBe(40);
    expect(ctx.state.quests.completed.length + ctx.state.quests.expired.length).toBe(3);
  });
});
