import { describe, expect, it } from 'vitest';
import { addCoins, addItem, addVolunteers, applyDeltas, first, record, removeItem, saveSpecies } from '../../src/core/world';
import { eventsOf, makeCtx, milestoneKeys } from './helpers';

describe('applyDeltas', () => {
  it('changes metrics and emits a notification per changed metric', () => {
    const ctx = makeCtx();
    applyDeltas(ctx, { toxicGas: -1, biodiversity: 2 }, 'test');
    expect(ctx.state.metrics.toxicGas).toBe(39);
    expect(ctx.state.metrics.biodiversity).toBe(27);
    const changes = eventsOf(ctx, 'metricChanged');
    expect(changes.map((e) => [e.id, e.delta, e.source])).toEqual([
      ['toxicGas', -1, 'test'],
      ['biodiversity', 2, 'test'],
    ]);
  });

  it('ignores zero deltas and clamps to the metric range', () => {
    const ctx = makeCtx();
    applyDeltas(ctx, { toxicGas: 0, creatures: 50 }, 'test');
    expect(ctx.state.metrics.creatures).toBe(10);
    expect(eventsOf(ctx, 'metricChanged')).toHaveLength(1);
    ctx.events.length = 0;
    applyDeltas(ctx, { creatures: 1 }, 'test');
    expect(ctx.events).toHaveLength(0);
  });

  it('emits a level change and a big milestone only the first time a better level is reached', () => {
    const ctx = makeCtx();
    applyDeltas(ctx, { toxicGas: -6 }, 'test'); // 34 → alert
    expect(eventsOf(ctx, 'levelChanged')[0]).toMatchObject({ id: 'toxicGas', from: 'critical', to: 'alert', improved: true });
    expect(milestoneKeys(ctx)).toContain('level:toxicGas:alert');

    applyDeltas(ctx, { toxicGas: 2 }, 'test'); // back to critical
    expect(milestoneKeys(ctx)).toContain('alert:toxicGas:critical');

    ctx.events.length = 0;
    applyDeltas(ctx, { toxicGas: -2 }, 'test'); // alert again: no replay
    expect(eventsOf(ctx, 'levelChanged')).toHaveLength(1);
    expect(milestoneKeys(ctx)).not.toContain('level:toxicGas:alert');
  });

  it('emits step milestones relative to the start, without replays (docs/08)', () => {
    const ctx = makeCtx();
    applyDeltas(ctx, { marineSurvival: 60 }, 'test');
    expect(milestoneKeys(ctx)).toContain('step:marineSurvival:1');
    applyDeltas(ctx, { marineSurvival: -20 }, 'test');
    ctx.events.length = 0;
    applyDeltas(ctx, { marineSurvival: 20 }, 'test');
    expect(milestoneKeys(ctx)).not.toContain('step:marineSurvival:1');
    applyDeltas(ctx, { lifeExpectancy: 5 }, 'test');
    expect(milestoneKeys(ctx)).toContain('step:lifeExpectancy:1');
  });

  it('emits estimated-year milestones every +500 years', () => {
    const ctx = makeCtx();
    applyDeltas(ctx, { temperature: -2, toxicGas: -20, biodiversity: 30 }, 'test');
    expect(milestoneKeys(ctx).some((k) => k.startsWith('step:estimatedYear:'))).toBe(true);
  });
});

describe('coins, volunteers and items', () => {
  it('never lets coins go below zero', () => {
    const ctx = makeCtx({ coins: 5 });
    expect(addCoins(ctx, -12, 'trap')).toBe(-5);
    expect(ctx.state.coins).toBe(0);
    expect(addCoins(ctx, -1, 'trap')).toBe(0);
  });

  it('keeps at least Ziko as volunteer and fires ×10 milestones', () => {
    const ctx = makeCtx();
    addVolunteers(ctx, -10, 'trap');
    expect(ctx.state.volunteers).toBe(1);
    addVolunteers(ctx, 120, 'tv');
    expect(milestoneKeys(ctx)).toEqual(['step:volunteers:2']);
    addVolunteers(ctx, 5, 'tv');
    expect(milestoneKeys(ctx)).toEqual(['step:volunteers:2']);
  });

  it('stacks items up to their maximum and never removes the mop', () => {
    const ctx = makeCtx();
    expect(addItem(ctx, 'solar', 9)).toBe(5);
    expect(addItem(ctx, 'velo')).toBe(1);
    expect(addItem(ctx, 'velo')).toBe(0);
    expect(removeItem(ctx, 'mop')).toBe(0);
    expect(removeItem(ctx, 'solar', 2)).toBe(2);
    expect(removeItem(ctx, 'solar', 10)).toBe(3);
    expect(ctx.state.inventory.solar).toBeUndefined();
    expect(eventsOf(ctx, 'itemChanged').length).toBeGreaterThan(0);
  });

  it('fires "first time" milestones once', () => {
    const ctx = makeCtx();
    expect(first(ctx, 'tv')).toBe(true);
    expect(first(ctx, 'tv')).toBe(false);
    expect(milestoneKeys(ctx)).toEqual(['first:tv']);
  });

  it('records history with the current year and saves species once', () => {
    const ctx = makeCtx({ refusedSpecies: ['koala'] });
    record(ctx, 'cleanup', 'asia', '12');
    expect(ctx.state.history[0]).toEqual({ year: 2500, kind: 'cleanup', region: 'asia', detail: '12' });
    saveSpecies(ctx, 'koala');
    saveSpecies(ctx, 'koala');
    expect(ctx.state.savedSpecies).toEqual(['koala']);
    expect(ctx.state.refusedSpecies).toEqual([]);
    expect(eventsOf(ctx, 'speciesSaved')).toHaveLength(1);
  });
});
