import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { Game } from '../../src/core/game';
import { METRICS } from '../../src/core/metrics';
import { METRIC_IDS } from '../../src/core/types';
import { ITEMS } from '../../src/data/items';
import { Bot, BOT_PROFILES, playGame, type BotProfile } from '../../src/sim/bot';

/** Invariants that must hold after every single engine action. */
function checkInvariants(game: Game): void {
  const s = game.state;
  expect(Number.isInteger(s.coins)).toBe(true);
  expect(s.coins).toBeGreaterThanOrEqual(0);
  expect(s.volunteers).toBeGreaterThanOrEqual(1);
  expect(s.turn).toBeGreaterThanOrEqual(0);
  expect(s.turn).toBeLessThanOrEqual(40);
  expect(s.position).toBeGreaterThanOrEqual(0);
  expect(s.position).toBeLessThan(36);
  for (const id of METRIC_IDS) {
    expect(Number.isFinite(s.metrics[id])).toBe(true);
    expect(s.metrics[id]).toBeGreaterThanOrEqual(METRICS[id].min);
    expect(s.metrics[id]).toBeLessThanOrEqual(METRICS[id].max);
  }
  for (const [id, n] of Object.entries(s.inventory)) {
    expect(n).toBeGreaterThan(0);
    expect(n).toBeLessThanOrEqual(ITEMS[id as keyof typeof ITEMS].maxStack);
  }
  expect(s.inventory.mop).toBe(1);
  // Phase coherence and "always an action" (no soft lock in the rules).
  if (s.phase === 'resolving') expect(s.pending).not.toBeNull();
  else expect(s.pending).toBeNull();
  if (s.phase === 'ended') expect(game.availableActions()).toEqual([]);
  else expect(game.availableActions().length).toBeGreaterThan(0);
  expect(new Set(s.savedSpecies).size).toBe(s.savedSpecies.length);
  expect(new Set(s.laws).size).toBe(s.laws.length);
}

describe('full games played by bots', () => {
  it.each(BOT_PROFILES)('every %s game ends (40 years or bankruptcy) with all invariants', (profile: BotProfile) => {
    for (let seed = 1; seed <= 40; seed++) {
      const { game, summary } = playGame(seed, profile, { onStep: checkInvariants });
      expect(game.phase).toBe('ended');
      expect(summary.turns).toBe(40);
      expect(['time', 'bankrupt']).toContain(summary.ended);
      expect(summary.steps).toBeLessThan(800);
    }
  });

  it('is deterministic: same seed and same bot give the same game', () => {
    const a = playGame(77, 'average').game.save();
    const b = playGame(77, 'average').game.save();
    expect(a).toEqual(b);
  });

  it('can be saved and reloaded mid-game and then ends exactly the same way', () => {
    for (const seed of [5, 11, 42]) {
      const original = Game.create(seed);
      const bot = new Bot('expert', seed);
      for (let i = 0; i < 40; i++) bot.step(original);
      const saved = original.save();
      const savedBotState = bot.rngState;
      while (original.phase !== 'ended') bot.step(original);

      const reloaded = Game.load(saved);
      const resumedBot = new Bot('expert', seed);
      resumedBot.rngState = savedBotState;
      while (reloaded.phase !== 'ended') resumedBot.step(reloaded);
      expect(reloaded.save()).toEqual(original.save());
    }
  });

  it('rewards better play with a later estimated year', () => {
    const avg = (profile: BotProfile) => {
      let sum = 0;
      for (let seed = 1; seed <= 30; seed++) sum += playGame(seed, profile).summary.estimatedYear;
      return sum / 30;
    };
    const passive = avg('passive');
    const average = avg('average');
    const expert = avg('expert');
    expect(average).toBeGreaterThan(passive);
    expect(expert).toBeGreaterThan(average);
  });
});

describe('property: any seed, any profile', () => {
  it('always terminates with valid invariants', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 2 ** 31 - 1 }), fc.constantFrom(...BOT_PROFILES), (seed, profile) => {
        const { summary } = playGame(seed, profile, { onStep: checkInvariants });
        expect(summary.turns).toBe(40);
      }),
      { numRuns: 60 },
    );
  });
});
