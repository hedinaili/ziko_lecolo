import { describe, expect, it } from 'vitest';
import {
  animalPrice,
  BOARD_SIZE,
  cleanupCapacity,
  cleanupParticipants,
  cleanupTier,
  demoParticipants,
  landOn,
  moveBackward,
  moveForward,
  resolveCard,
  resolveCleanup,
  resolveDemo,
  resolveTrap,
  tileAt,
} from '../../src/core/tiles';
import { CARDS, SPECIES, TRAPS } from '../../src/data/content';
import { BALANCE } from '../../src/data/balance';
import { eventsOf, makeCtx, milestoneKeys } from './helpers';

describe('movement', () => {
  it('wraps around the 36-tile board and pays the start bonus when crossing it', () => {
    const ctx = makeCtx({ position: 33, coins: 0 });
    expect(moveForward(ctx, 5)).toEqual({ from: 33, to: 2, passedStart: true });
    expect(ctx.state.coins).toBe(BALANCE.startPassBonus);
    expect(moveForward(ctx, 3).passedStart).toBe(false);
    expect(BOARD_SIZE).toBe(36);
  });

  it('pays the bonus when landing exactly on the start', () => {
    const ctx = makeCtx({ position: 30, coins: 0 });
    expect(moveForward(ctx, 6).to).toBe(0);
    expect(ctx.state.coins).toBe(BALANCE.startPassBonus);
  });

  it('moves backward without paying', () => {
    const ctx = makeCtx({ position: 1, coins: 0 });
    moveBackward(ctx, 2);
    expect(ctx.state.position).toBe(35);
    expect(ctx.state.coins).toBe(0);
    expect(tileAt(-1).index).toBe(35);
  });
});

describe('cleanup (docs/05, docs/10)', () => {
  it('limits participants by equipment capacity', () => {
    const { state } = makeCtx({ volunteers: 140, inventory: { mop: 1, kit: 9, pince: 3, filet: 1 } });
    expect(cleanupCapacity(state)).toBe(1 + 90 + 6);
    expect(cleanupParticipants(state)).toBe(97);
    expect(cleanupParticipants({ ...state, volunteers: 5 })).toBe(5);
  });

  it.each([
    [1, 1],
    [10, 1.5],
    [50, 2],
    [200, 3],
    [1000, 4],
  ])('%d participants → ×%d', (n, mult) => {
    expect(cleanupTier(n).mult).toBe(mult);
  });

  it('cleans, pays recycling coins, recruits passers-by and boosts oceans', () => {
    const ctx = makeCtx({ volunteers: 60, inventory: { mop: 1, kit: 6 }, coins: 0 });
    resolveCleanup(ctx, 'atlantic'); // 60 participants → ×2
    expect(ctx.state.metrics.toxicGas).toBeCloseTo(40 + 2 * BALANCE.cleanup.base.toxicGas);
    expect(ctx.state.metrics.marineSurvival).toBe(300 + 2 * BALANCE.cleanup.oceanMarineBonus);
    expect(ctx.state.coins).toBe(3 + 2);
    expect(ctx.state.volunteers).toBe(62);
    expect(ctx.state.counters.cleanups).toBe(1);
    expect(ctx.state.history.at(-1)).toMatchObject({ kind: 'cleanup', region: 'atlantic' });
  });

  it('repairs the oldest catastrophe', () => {
    const ctx = makeCtx({ catastrophes: [{ kind: 'flood', region: 'asia', year: 2500 }] });
    resolveCleanup(ctx, 'asia');
    expect(ctx.state.catastrophes).toEqual([]);
    expect(eventsOf(ctx, 'catastropheRepaired')).toHaveLength(1);
  });
});

describe('demonstration and laws', () => {
  it('grows volunteers by 20 % (at least 3)', () => {
    const ctx = makeCtx({ volunteers: 1 });
    resolveDemo(ctx, 'europe');
    expect(ctx.state.volunteers).toBe(4);
    resolveDemo(ctx, 'europe');
    expect(ctx.state.volunteers).toBe(7);
    expect(milestoneKeys(ctx)).toContain('first:demo');
  });

  it('votes every law whose threshold and era are reached, in order', () => {
    const ctx = makeCtx({ volunteers: 5000 });
    resolveDemo(ctx, 'europe');
    expect(ctx.state.laws).toEqual(['antiPlastic']); // cleanAir needs the young era
    ctx.state.turn = 10;
    resolveDemo(ctx, 'europe');
    expect(ctx.state.laws).toEqual(['antiPlastic', 'cleanAir', 'oceans']); // cleanPower needs the adult era
    ctx.state.turn = 35;
    resolveDemo(ctx, 'europe');
    expect(ctx.state.laws).toEqual(['antiPlastic', 'cleanAir', 'oceans', 'cleanPower', 'climate']);
    expect(eventsOf(ctx, 'lawPassed')).toHaveLength(5);
    expect(ctx.state.metrics.localProducts).toBe(23);
  });

  it('stops at the first law whose threshold is not reached', () => {
    const ctx = makeCtx({ volunteers: 300, turn: 25 });
    resolveDemo(ctx, 'europe');
    expect(ctx.state.laws).toEqual(['antiPlastic', 'cleanAir']);
  });

  it('counts +50 % participants with the megaphone', () => {
    expect(demoParticipants(makeCtx({ volunteers: 40, inventory: { mop: 1, megaphone: 1 } }).state)).toBe(60);
  });
});

describe('landing on tiles', () => {
  it.each([
    [1, 'minigame'],
    [5, 'combat'],
    [6, 'shop'],
    [4, 'job'],
    [14, 'tv'],
    [20, 'chantier'],
    [10, 'animal'],
  ])('tile %d opens a %s interaction', (index, kind) => {
    const ctx = makeCtx();
    expect(landOn(ctx, tileAt(index))?.kind).toBe(kind);
  });

  it('resolves start, cleanup and demo tiles automatically', () => {
    const ctx = makeCtx();
    expect(landOn(ctx, tileAt(0))).toBeNull();
    expect(landOn(ctx, tileAt(3))).toBeNull();
    expect(landOn(ctx, tileAt(9))).toBeNull();
    expect(ctx.state.counters.cleanups).toBe(1);
    expect(ctx.state.counters.demos).toBe(1);
  });

  it('asks a TV quiz with the era question count', () => {
    const p = landOn(makeCtx({ turn: 35 }), tileAt(14));
    expect(p).toMatchObject({ kind: 'tv' });
    if (p?.kind === 'tv') expect(p.questionIds).toHaveLength(4);
  });

  it('summons the boss after 45 if creatures are strong, otherwise prevents it', () => {
    const strong = makeCtx({ turn: 36 });
    expect(landOn(strong, tileAt(5))).toMatchObject({ kind: 'combat', boss: true, creature: 'roiOrdures', hp: 12 });

    const weak = makeCtx({ turn: 36 });
    weak.state.metrics.creatures = 3;
    expect(landOn(weak, tileAt(5))).toMatchObject({ kind: 'combat', boss: false });
    expect(weak.state.bossDone).toBe(true);
    expect(weak.state.counters.bossPrevented).toBe(1);
    expect(eventsOf(weak, 'bossPrevented')).toHaveLength(1);
  });

  it('offers an unsaved species, preferring the local region, at an era price', () => {
    const ctx = makeCtx();
    expect(landOn(ctx, tileAt(10))).toMatchObject({ kind: 'animal', species: 'oursPolaire', price: 15 });
    expect(animalPrice(makeCtx({ turn: 25 }).state)).toBe(20);
  });

  it('gives a small bonus when all species are saved', () => {
    const ctx = makeCtx({ savedSpecies: SPECIES.map((s) => s.id) });
    expect(landOn(ctx, tileAt(10))).toBeNull();
    expect(ctx.state.metrics.biodiversity).toBe(26);
  });

  it('draws cards and traps, asking a question only when needed', () => {
    for (let seed = 1; seed < 60; seed++) {
      const ctx = makeCtx({}, seed);
      const card = landOn(ctx, tileAt(2));
      if (card) expect(card).toEqual({ kind: 'card', card: 'quizFlash' });
      const trapCtx = makeCtx({}, seed);
      const trap = landOn(trapCtx, tileAt(8));
      if (trap) expect(trap).toEqual({ kind: 'trap', trap: 'fakeNews' });
    }
  });
});

describe('cards and traps (docs/05)', () => {
  it('applies every card without throwing', () => {
    for (const card of CARDS) {
      const ctx = makeCtx({ coins: 20 });
      expect(() => resolveCard(ctx, card, true)).not.toThrow();
    }
  });

  it.each([
    ['recyclingRain', { coins: 58 }],
    ['cityPrize', { coins: 60 }],
    ['neighbour', { volunteers: 6 }],
  ] as const)('%s', (card, expected) => {
    const ctx = makeCtx();
    resolveCard(ctx, card, false);
    expect(ctx.state).toMatchObject(expected);
  });

  it('quiz flash pays only for a correct answer', () => {
    const ok = makeCtx();
    resolveCard(ok, 'quizFlash', true);
    const ko = makeCtx();
    resolveCard(ko, 'quizFlash', false);
    expect(ok.state.coins - ko.state.coins).toBe(5);
  });

  it('the sponge protects from the oil spill and solar panels from the blackout', () => {
    const plain = makeCtx();
    resolveCard(plain, 'oilSpill', false);
    expect(plain.state.metrics.marineSurvival).toBe(290);
    const sponge = makeCtx({ inventory: { mop: 1, eponge: 1 } });
    resolveCard(sponge, 'oilSpill', false);
    expect(sponge.state.metrics.marineSurvival).toBe(300);
    const dark = makeCtx();
    resolveCard(dark, 'blackout', false);
    expect(dark.state.coins).toBe(47);
    const solar = makeCtx({ inventory: { mop: 1, solar: 1 } });
    resolveCard(solar, 'blackout', false);
    expect(solar.state.coins).toBe(55);
  });

  it('finding gives an affordable item and shortcut moves 3 tiles', () => {
    const ctx = makeCtx();
    resolveCard(ctx, 'finding', false);
    expect(eventsOf(ctx, 'itemChanged')).toHaveLength(1);
    resolveCard(ctx, 'shortcut', false);
    expect(ctx.state.position).toBe(3);
  });

  it('applies every trap and lets items avoid them', () => {
    for (const trap of TRAPS) expect(() => resolveTrap(makeCtx(), trap, false)).not.toThrow();
    const naive = makeCtx();
    resolveTrap(naive, 'greenwashing', false);
    expect(naive.state.coins).toBe(42);
    const smart = makeCtx({ inventory: { mop: 1, loupe: 1 } });
    resolveTrap(smart, 'solarScam', false);
    expect(smart.state.coins).toBe(50);
    const jam = makeCtx({ position: 8 });
    resolveTrap(jam, 'trafficJam', false);
    expect(jam.state.position).toBe(6);
    const bike = makeCtx({ position: 8, inventory: { mop: 1, velo: 1 } });
    resolveTrap(bike, 'trafficJam', false);
    expect(bike.state.position).toBe(8);
    const fake = makeCtx({ volunteers: 20 });
    resolveTrap(fake, 'fakeNews', true);
    expect(fake.state.volunteers).toBe(20);
    resolveTrap(fake, 'fakeNews', false);
    expect(fake.state.volunteers).toBe(15);
    const bag = makeCtx({ inventory: { mop: 1, kit: 2 } });
    resolveTrap(bag, 'tornBag', false);
    expect(bag.state.inventory.kit).toBe(1);
  });
});
