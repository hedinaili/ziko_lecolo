import { BALANCE, ERA_INDEX } from '../data/balance';
import { OCEAN_REGIONS, TILES, type TileDef } from '../data/board';
import { CARDS, LAWS, SPECIES, TRAPS } from '../data/content';
import { ITEMS, LENDABLE_TOOLS } from '../data/items';
import { pickQuestions } from './activities';
import { creatureHp } from './combat';
import { ageOf, eraOf, itemCount, type Ctx, type GameState, type PendingAction } from './state';
import type { CardId, ItemId, Region, TrapId } from './types';
import { addCoins, addItem, addVolunteers, applyDeltas, first, record, removeItem } from './world';

const ALL_REGIONS: readonly Region[] = [
  'northAmerica',
  'southAmerica',
  'europe',
  'africa',
  'asia',
  'oceania',
  'pacific',
  'atlantic',
  'indian',
  'poles',
];
export const BOARD_SIZE = TILES.length;

export function tileAt(index: number): TileDef {
  const tile = TILES[((index % BOARD_SIZE) + BOARD_SIZE) % BOARD_SIZE];
  if (!tile) throw new Error(`No tile at ${index}`);
  return tile;
}

/** Moves forward and pays the start bonus when crossing/landing on the start tile. */
export function moveForward(ctx: Ctx, steps: number): { from: number; to: number; passedStart: boolean } {
  const from = ctx.state.position;
  const raw = from + steps;
  const to = raw % BOARD_SIZE;
  const passedStart = raw >= BOARD_SIZE;
  ctx.state.position = to;
  ctx.emit({ type: 'moved', from, to, passedStart });
  if (passedStart) addCoins(ctx, BALANCE.startPassBonus, 'start');
  return { from, to, passedStart };
}

export function moveBackward(ctx: Ctx, steps: number): void {
  const from = ctx.state.position;
  const to = (((from - steps) % BOARD_SIZE) + BOARD_SIZE) % BOARD_SIZE;
  ctx.state.position = to;
  ctx.emit({ type: 'moved', from, to, passedStart: false });
}

// --- Cleanup (docs/05, docs/10) ---------------------------------------------

export function cleanupCapacity(state: GameState): number {
  let extraTools = 0;
  for (const id of LENDABLE_TOOLS) extraTools += Math.max(0, itemCount(state, id) - 1);
  return 1 + BALANCE.cleanup.capacityPerKit * itemCount(state, 'kit') + BALANCE.cleanup.capacityPerExtraTool * extraTools;
}

export function cleanupParticipants(state: GameState): number {
  return Math.min(state.volunteers, cleanupCapacity(state));
}

export function cleanupTier(participants: number): { mult: number; tier: number } {
  const tiers = BALANCE.cleanup.tiers;
  for (const [i, t] of tiers.entries()) if (participants >= t.min) return { mult: t.mult, tier: tiers.length - 1 - i };
  return { mult: 1, tier: 0 };
}

export function resolveCleanup(ctx: Ctx, region: Region | undefined): void {
  const { state } = ctx;
  const c = BALANCE.cleanup;
  const participants = cleanupParticipants(state);
  const { mult, tier } = cleanupTier(participants);
  const deltas: Record<string, number> = {};
  for (const [id, v] of Object.entries(c.base)) deltas[id] = v * mult;
  if (region && OCEAN_REGIONS.has(region)) deltas['marineSurvival'] = c.oceanMarineBonus * mult;
  applyDeltas(ctx, deltas, 'cleanup');
  addCoins(ctx, c.coins + tier, 'cleanup');
  addVolunteers(ctx, c.volunteers, 'cleanup');
  const catastrophe = state.catastrophes.shift();
  if (catastrophe) {
    applyDeltas(ctx, { biodiversity: c.catastropheRepairBiodiversity }, 'catastropheRepair');
    ctx.emit({ type: 'catastropheRepaired', kind: catastrophe.kind, region: catastrophe.region });
  }
  state.counters.cleanups++;
  record(ctx, 'cleanup', region, String(participants));
}

// --- Demonstration and laws ---------------------------------------------------

export function demoParticipants(state: GameState): number {
  return Math.floor(state.volunteers * (itemCount(state, 'megaphone') > 0 ? BALANCE.demo.megaphoneBonus : 1));
}

export function resolveDemo(ctx: Ctx, region: Region | undefined): void {
  const { state } = ctx;
  const participants = demoParticipants(state);
  first(ctx, 'demo');
  const growth = Math.max(BALANCE.demo.minGrowth, Math.round(state.volunteers * BALANCE.demo.growthRate));
  addVolunteers(ctx, growth, 'demo');
  applyDeltas(ctx, { toxicGas: BALANCE.demo.gas, cleanEnergy: BALANCE.demo.energy, localProducts: BALANCE.demo.local }, 'demo');
  // Every law whose threshold and era are reached is voted, in order (docs/05).
  for (const law of LAWS) {
    if (state.laws.includes(law.id)) continue;
    if (participants < law.threshold || ERA_INDEX[eraOf(state)] < ERA_INDEX[law.minEra]) break;
    state.laws.push(law.id);
    ctx.emit({ type: 'lawPassed', id: law.id });
    first(ctx, 'law');
    ctx.emit({ type: 'milestone', size: 'big', key: `law:${law.id}` });
    record(ctx, 'law', region, law.id);
  }
  state.counters.demos++;
  record(ctx, 'demo', region, String(participants));
}

// --- Landing ----------------------------------------------------------------

export function animalPrice(state: GameState): number {
  return ERA_INDEX[eraOf(state)] >= ERA_INDEX.adult ? BALANCE.animal.priceAdult : BALANCE.animal.price;
}

/** Returns the pending interaction, or null when the tile was resolved automatically. */
export function landOn(ctx: Ctx, tile: TileDef): PendingAction | null {
  const { state, rng } = ctx;
  switch (tile.kind) {
    case 'start':
      return null;
    case 'cleanup':
      resolveCleanup(ctx, tile.region);
      return null;
    case 'demo':
      resolveDemo(ctx, tile.region);
      return null;
    case 'minigame':
      return { kind: 'minigame', minigame: tile.minigame ?? 'astroZiko' };
    case 'combat': {
      const creature = tile.creature ?? 'sacZombie';
      if (!state.bossDone && ageOf(state) >= BALANCE.combat.bossMinAge) {
        if (state.metrics.creatures >= BALANCE.combat.bossMinCreatures) {
          return { kind: 'combat', creature: 'roiOrdures', boss: true, hp: creatureHp(eraOf(state), state.metrics.creatures, true) };
        }
        state.bossDone = true;
        state.counters.bossPrevented++;
        ctx.emit({ type: 'bossPrevented' });
        first(ctx, 'bossPrevented');
      }
      return { kind: 'combat', creature, boss: false, hp: creatureHp(eraOf(state), state.metrics.creatures, false) };
    }
    case 'tv':
      return { kind: 'tv', questionIds: pickQuestions(state, eraOf(state), BALANCE.tv.questions[eraOf(state)], rng) };
    case 'shop':
      return { kind: 'shop' };
    case 'chantier':
      return { kind: 'chantier' };
    case 'job':
      return { kind: 'job' };
    case 'animal': {
      const unsaved = SPECIES.filter((s) => !state.savedSpecies.includes(s.id));
      if (unsaved.length === 0) {
        applyDeltas(ctx, { biodiversity: BALANCE.animal.allSavedBonus }, 'animal');
        return null;
      }
      const local = unsaved.filter((s) => s.region === tile.region);
      const species = rng.pick(local.length > 0 ? local : unsaved).id;
      return { kind: 'animal', species, price: animalPrice(state) };
    }
    case 'card': {
      const card = rng.pick(CARDS);
      if (card === 'quizFlash') return { kind: 'card', card };
      resolveCard(ctx, card, false);
      return null;
    }
    case 'trap': {
      const trap = rng.pick(TRAPS);
      if (trap === 'fakeNews') return { kind: 'trap', trap };
      resolveTrap(ctx, trap, false);
      return null;
    }
  }
}

// --- Cards and traps (docs/05) ------------------------------------------------

export function resolveCard(ctx: Ctx, card: CardId, answerCorrect: boolean): void {
  const { state, rng } = ctx;
  record(ctx, 'card', undefined, card);
  switch (card) {
    case 'recyclingRain':
      addCoins(ctx, 8, 'card');
      return;
    case 'neighbour':
      addVolunteers(ctx, 5, 'card');
      return;
    case 'quizFlash':
      if (answerCorrect) addCoins(ctx, 5, 'card');
      return;
    case 'oilSpill':
      if (itemCount(state, 'eponge') === 0) {
        applyDeltas(ctx, { marineSurvival: -10 }, 'card');
        record(ctx, 'oilSpill', rng.pick(['pacific', 'atlantic', 'indian'] as const));
      }
      return;
    case 'finding': {
      const candidates = (Object.keys(ITEMS) as ItemId[]).filter((id) => {
        const def = ITEMS[id];
        return def.price !== null && def.price <= 15 && itemCount(state, id) < def.maxStack;
      });
      if (candidates.length > 0) {
        const id = rng.pick(candidates);
        addItem(ctx, id, id === 'seeds' ? BALANCE.shop.seedsPerPack : 1);
      }
      return;
    }
    case 'heatwave':
      applyDeltas(ctx, { temperature: 0.05, diseases: 1 }, 'card');
      return;
    case 'newspaper':
      addVolunteers(ctx, Math.max(1, Math.round(state.volunteers * 0.1)), 'card');
      return;
    case 'blackout':
      addCoins(ctx, itemCount(state, 'solar') > 0 ? 5 : -3, 'card');
      return;
    case 'hive':
      applyDeltas(ctx, { biodiversity: 2 }, 'card');
      return;
    case 'wanderingCreature':
      applyDeltas(ctx, { creatures: 0.5 }, 'card');
      record(ctx, 'creature', rng.pick(ALL_REGIONS));
      return;
    case 'cityPrize':
      addCoins(ctx, 10, 'card');
      return;
    case 'shortcut':
      moveForward(ctx, 3);
      return;
  }
}

export function resolveTrap(ctx: Ctx, trap: TrapId, answerCorrect: boolean): void {
  const { state } = ctx;
  record(ctx, 'trap', undefined, trap);
  const hasLoupe = itemCount(state, 'loupe') > 0;
  switch (trap) {
    case 'greenwashing':
      if (!hasLoupe) addCoins(ctx, -8, 'trap');
      return;
    case 'solarScam':
      if (!hasLoupe) addCoins(ctx, -10, 'trap');
      return;
    case 'fakeNews':
      if (!answerCorrect) addVolunteers(ctx, -5, 'trap');
      return;
    case 'tornBag':
      removeItem(ctx, 'kit', 1);
      return;
    case 'trafficJam':
      if (itemCount(state, 'velo') === 0) moveBackward(ctx, 2);
      return;
    case 'puddle':
      return;
  }
}

