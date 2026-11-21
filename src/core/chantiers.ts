import { BALANCE } from '../data/balance';
import { CHANTIERS, SPECIES, type ChantierDef } from '../data/content';
import { checkAfford, eraUnlocked, type PurchaseResult } from './economy';
import { eraOf, type Ctx, type GameState } from './state';
import type { ChantierId, MetricDeltas } from './types';

function scaleDeltas(deltas: MetricDeltas, factor: number): MetricDeltas {
  const out: MetricDeltas = {};
  for (const [k, v] of Object.entries(deltas) as [keyof MetricDeltas, number][]) out[k] = v * factor;
  return out;
}
import { addCoins, applyDeltas, first, record, saveSpecies } from './world';

export function chantierDef(id: ChantierId): ChantierDef {
  const def = CHANTIERS.find((c) => c.id === id);
  if (!def) throw new Error(`Unknown chantier ${id}`);
  return def;
}

/** Price grows by +20 % per copy already built (docs/18). */
export function chantierPrice(state: GameState, id: ChantierId): number {
  const built = state.chantiers[id] ?? 0;
  return Math.round(chantierDef(id).price * Math.pow(BALANCE.chantierPriceGrowth, built));
}

export function availableChantiers(state: GameState): ChantierDef[] {
  const era = eraOf(state);
  return CHANTIERS.filter((c) => eraUnlocked(era, c.era));
}

export function checkChantier(state: GameState, id: ChantierId, confirm = false): PurchaseResult {
  const def = chantierDef(id);
  const price = chantierPrice(state, id);
  if (!eraUnlocked(eraOf(state), def.era)) return { ok: false, reason: 'locked', price };
  if (state.volunteers < def.minVolunteers) return { ok: false, reason: 'volunteers', price };
  return checkAfford(state, price, confirm);
}

export function buildChantier(ctx: Ctx, id: ChantierId, confirm = false): PurchaseResult {
  const check = checkChantier(ctx.state, id, confirm);
  if (!check.ok) return check;
  const def = chantierDef(id);
  const { state } = ctx;
  addCoins(ctx, -check.price, `chantier:${id}`);
  state.chantiers[id] = (state.chantiers[id] ?? 0) + 1;
  state.counters.chantiers++;
  applyDeltas(ctx, scaleDeltas(def.deltas, BALANCE.chantierEffect), `chantier:${id}`);
  if (def.savesSpecies) {
    const unsaved = SPECIES.filter((s) => !state.savedSpecies.includes(s.id));
    if (unsaved.length > 0) saveSpecies(ctx, ctx.rng.pick(unsaved).id);
  }
  ctx.emit({ type: 'chantierBuilt', id, count: state.chantiers[id] ?? 1 });
  if (id === 'borne') first(ctx, 'borne');
  if (id === 'eolienne') first(ctx, 'eolienne');
  if (def.isReserve) first(ctx, 'reserve');
  record(ctx, 'chantier', undefined, id);
  return check;
}

export function chantierIncome(state: GameState): number {
  let total = 0;
  for (const def of CHANTIERS) total += (state.chantiers[def.id] ?? 0) * (def.yearlyCoins ?? 0);
  return total;
}
