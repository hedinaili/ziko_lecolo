import { BALANCE, ERA_INDEX, eraOfAge } from '../data/balance';
import { ITEMS, PROJECTS } from '../data/items';
import { ageOf, eraOf, itemCount, type Ctx, type GameState } from './state';
import type { Era, ItemId, ProjectId } from './types';
import { addCoins, addItem, applyDeltas, first, record } from './world';

export type PurchaseFailure = 'locked' | 'maxed' | 'notForSale' | 'insufficient' | 'lowFundsWarning' | 'owned' | 'volunteers';
export type PurchaseResult = { ok: true; price: number } | { ok: false; reason: PurchaseFailure; price: number };

export function eraUnlocked(current: Era, required: Era): boolean {
  return ERA_INDEX[current] >= ERA_INDEX[required];
}

export function lifeCost(era: Era): number {
  return BALANCE.lifeCost[era];
}

/** Coins the player should keep to pay next year's cost of living (docs/14 "Achat protégé"). */
export function reserveForNextYear(state: GameState): number {
  return lifeCost(eraOfAge(ageOf(state)));
}

export function itemPrice(state: GameState, id: ItemId): number | null {
  const def = ITEMS[id];
  if (def.price === null) return null;
  if (id === 'kit') {
    const { kitBasePrice, kitPriceStep, kitMaxPrice } = BALANCE.shop;
    return Math.min(kitMaxPrice, kitBasePrice + Math.floor(state.counters.kitsBought / kitPriceStep));
  }
  return def.price;
}

/** Shared affordability check, including the low-funds confirmation. */
export function checkAfford(state: GameState, price: number, confirm: boolean): PurchaseResult {
  if (price > state.coins) return { ok: false, reason: 'insufficient', price };
  if (!confirm && state.coins - price < reserveForNextYear(state)) return { ok: false, reason: 'lowFundsWarning', price };
  return { ok: true, price };
}

export function checkItemPurchase(state: GameState, id: ItemId, confirm = false): PurchaseResult {
  const price = itemPrice(state, id);
  if (price === null) return { ok: false, reason: 'notForSale', price: 0 };
  const def = ITEMS[id];
  if (!eraUnlocked(eraOf(state), def.era)) return { ok: false, reason: 'locked', price };
  const stackGain = id === 'seeds' ? BALANCE.shop.seedsPerPack : 1;
  if (itemCount(state, id) + (def.maxStack === 1 ? 1 : stackGain) > def.maxStack) {
    return { ok: false, reason: def.maxStack === 1 ? 'owned' : 'maxed', price };
  }
  return checkAfford(state, price, confirm);
}

export function buyItem(ctx: Ctx, id: ItemId, confirm = false): PurchaseResult {
  const check = checkItemPurchase(ctx.state, id, confirm);
  if (!check.ok) return check;
  addCoins(ctx, -check.price, `shop:${id}`);
  addItem(ctx, id, id === 'seeds' ? BALANCE.shop.seedsPerPack : 1);
  if (id === 'kit') ctx.state.counters.kitsBought++;
  return check;
}

export function checkProjectPurchase(state: GameState, id: ProjectId, confirm = false): PurchaseResult {
  const def = PROJECTS[id];
  if (state.projects.includes(id)) return { ok: false, reason: 'owned', price: def.price };
  if (!eraUnlocked(eraOf(state), def.era)) return { ok: false, reason: 'locked', price: def.price };
  return checkAfford(state, def.price, confirm);
}

export function buyProject(ctx: Ctx, id: ProjectId, confirm = false): PurchaseResult {
  const check = checkProjectPurchase(ctx.state, id, confirm);
  if (!check.ok) return check;
  const def = PROJECTS[id];
  addCoins(ctx, -check.price, `project:${id}`);
  ctx.state.projects.push(id);
  applyDeltas(ctx, def.deltas, `project:${id}`);
  ctx.emit({ type: 'projectBuilt', id });
  first(ctx, 'project');
  record(ctx, 'project', undefined, id);
  return check;
}

export function shopCatalog(state: GameState): { items: ItemId[]; projects: ProjectId[] } {
  const era = eraOf(state);
  const items = (Object.keys(ITEMS) as ItemId[]).filter((id) => ITEMS[id].price !== null && eraUnlocked(era, ITEMS[id].era));
  const projects = (Object.keys(PROJECTS) as ProjectId[]).filter((id) => eraUnlocked(era, PROJECTS[id].era));
  return { items, projects };
}
