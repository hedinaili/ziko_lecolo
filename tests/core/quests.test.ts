import { describe, expect, it } from 'vitest';
import { QUESTS } from '../../src/data/content';
import { activeQuests, checkQuests, expireQuests, questProgress, questsOfEra, startEraTracking } from '../../src/core/quests';
import { eventsOf, makeCtx } from './helpers';

const quest = (id: string) => {
  const q = QUESTS.find((x) => x.id === id);
  if (!q) throw new Error(id);
  return q;
};

describe('quêtes d\'époque (docs/18)', () => {
  it('has 3 quests per era', () => {
    for (const era of ['child', 'young', 'adult', 'hero'] as const) expect(questsOfEra(era)).toHaveLength(3);
  });

  it('measures progress since the start of the era', () => {
    const ctx = makeCtx();
    ctx.state.counters.cleanups = 3;
    startEraTracking(ctx.state);
    expect(questProgress(ctx.state, quest('premierNettoyage'))).toBe(0);
    ctx.state.counters.cleanups = 4;
    expect(questProgress(ctx.state, quest('premierNettoyage'))).toBe(1);
  });

  it.each([
    ['petitJardinier', { counters: { chantiers: 2 } }],
    ['championEnHerbe', { counters: { medals: 1 } }],
    ['roulerPropre', { chantiers: { borne: 2 } }],
    ['laLoiCestNous', { laws: ['antiPlastic'] }],
    ['caGrandit', { volunteers: 100 }],
    ['leVentTourne', { chantiers: { eolienne: 2 } }],
    ['sanctuaire', { chantiers: { reservePlantes: 1 } }],
    ['respirerEnfin', { metrics: { toxicGas: 30 } }],
    ['planeteProtegee', { chantiers: { reserveMondiale: 1 } }],
    ['tousEnsemble', { laws: ['climate'] }],
    ['dernierCombat', { counters: { bossPrevented: 1 } }],
  ] as const)('%s reaches its target', (id, patch) => {
    const ctx = makeCtx();
    const s = ctx.state as unknown as Record<string, unknown>;
    for (const [k, v] of Object.entries(patch)) {
      s[k] = Array.isArray(v) ? v : typeof v === 'object' ? { ...(s[k] as object), ...v } : v;
    }
    const q = quest(id);
    expect(questProgress(ctx.state, q)).toBeGreaterThanOrEqual(q.target);
  });

  it('completes active quests once and pays the reward', () => {
    const ctx = makeCtx({ coins: 0 });
    ctx.state.counters.cleanups = 2;
    checkQuests(ctx);
    checkQuests(ctx);
    expect(ctx.state.quests.completed).toEqual(['premierNettoyage']);
    expect(ctx.state.coins).toBe(8);
    expect(ctx.state.volunteers).toBe(4);
    expect(eventsOf(ctx, 'questCompleted')).toHaveLength(1);
  });

  it('only checks quests of the current era and expires the others', () => {
    const ctx = makeCtx({ volunteers: 500 });
    checkQuests(ctx);
    expect(ctx.state.quests.completed).not.toContain('caGrandit');
    expireQuests(ctx, 'child');
    expect(ctx.state.quests.expired).toHaveLength(3);
    expect(activeQuests(ctx.state)).toHaveLength(0);
    expireQuests(ctx, 'child');
    expect(ctx.state.quests.expired).toHaveLength(3);
  });
});
