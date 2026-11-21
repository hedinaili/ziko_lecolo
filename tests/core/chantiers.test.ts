import { describe, expect, it } from 'vitest';
import { availableChantiers, buildChantier, chantierDef, chantierIncome, chantierPrice, checkChantier } from '../../src/core/chantiers';
import { BALANCE } from '../../src/data/balance';
import { eventsOf, makeCtx, milestoneKeys } from './helpers';

describe('chantiers verts (docs/18)', () => {
  it('unlocks chantiers by era', () => {
    expect(availableChantiers(makeCtx().state).map((c) => c.era)).toEqual(['child', 'child', 'child', 'child']);
    expect(availableChantiers(makeCtx({ turn: 35 }).state)).toHaveLength(17);
    expect(checkChantier(makeCtx({ coins: 100 }).state, 'borne')).toMatchObject({ ok: false, reason: 'locked' });
  });

  it('increases the price by 20 % per copy', () => {
    const ctx = makeCtx({ coins: 200, turn: 10 });
    expect(chantierPrice(ctx.state, 'borne')).toBe(15);
    buildChantier(ctx, 'borne');
    expect(chantierPrice(ctx.state, 'borne')).toBe(18);
    buildChantier(ctx, 'borne');
    expect(chantierPrice(ctx.state, 'borne')).toBe(22);
  });

  it('requires a minimum of volunteers for some chantiers', () => {
    const ctx = makeCtx({ coins: 200, turn: 25, volunteers: 10 });
    expect(buildChantier(ctx, 'reservePlantes')).toMatchObject({ ok: false, reason: 'volunteers' });
    ctx.state.volunteers = 50;
    expect(buildChantier(ctx, 'reservePlantes').ok).toBe(true);
  });

  it('applies effects, counts, emits events and first-time milestones', () => {
    const ctx = makeCtx({ coins: 100, turn: 25 });
    expect(buildChantier(ctx, 'eolienne').ok).toBe(true);
    expect(ctx.state.coins).toBe(70);
    expect(ctx.state.metrics.cleanEnergy).toBe(10 + 3 * BALANCE.chantierEffect);
    expect(ctx.state.chantiers.eolienne).toBe(1);
    expect(ctx.state.counters.chantiers).toBe(1);
    expect(eventsOf(ctx, 'chantierBuilt')[0]).toMatchObject({ id: 'eolienne', count: 1 });
    expect(milestoneKeys(ctx)).toContain('first:eolienne');
  });

  it('saves a species with the animal reserve', () => {
    const ctx = makeCtx({ coins: 100, turn: 25, volunteers: 60 });
    buildChantier(ctx, 'reserveAnimaux');
    expect(ctx.state.savedSpecies).toHaveLength(1);
    expect(milestoneKeys(ctx)).toEqual(expect.arrayContaining(['first:reserve', 'first:species']));
  });

  it('respects the low-funds warning', () => {
    const ctx = makeCtx({ coins: 5 });
    expect(buildChantier(ctx, 'potager')).toMatchObject({ ok: false, reason: 'lowFundsWarning' });
    expect(buildChantier(ctx, 'potager', true).ok).toBe(true);
  });

  it('computes yearly income from bornes and wind turbines', () => {
    const { state } = makeCtx({ chantiers: { borne: 2, eolienne: 1, parcEolienMer: 1, potager: 3 } });
    expect(chantierIncome(state)).toBe(5);
  });

  it('throws on unknown chantier ids', () => {
    expect(() => chantierDef('nope' as never)).toThrow();
  });
});
