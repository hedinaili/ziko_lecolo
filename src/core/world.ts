import { ITEMS } from '../data/items';
import { clampMetric, levelIndex, levelOf, milestoneStep } from './metrics';
import { estimatedYear } from './score';
import { yearOf, type Ctx } from './state';
import { METRIC_IDS, type ItemId, type MetricDeltas, type Region, type SpeciesId } from './types';

const EPS = 1e-9;
const YEAR_STEP = 500;
const BASE_YEAR = 2800;
const VOLUNTEER_STEPS = [10, 100, 1000, 10000, 100000];

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/** Apply metric deltas, emit notifications, levels and milestones (docs/06, docs/08). */
export function applyDeltas(ctx: Ctx, deltas: MetricDeltas, source: string): void {
  const { state } = ctx;
  let changed = false;
  for (const id of METRIC_IDS) {
    const delta = deltas[id];
    if (delta === undefined || Math.abs(delta) < EPS) continue;
    const from = state.metrics[id];
    const to = round(clampMetric(id, from + delta));
    if (Math.abs(to - from) < EPS) continue;
    state.metrics[id] = to;
    changed = true;
    ctx.emit({ type: 'metricChanged', id, from, to, delta: round(to - from), source });

    const prevLevel = state.levels[id];
    const nextLevel = levelOf(id, to);
    if (prevLevel !== nextLevel) {
      const improved = levelIndex(nextLevel) > levelIndex(prevLevel);
      state.levels[id] = nextLevel;
      ctx.emit({ type: 'levelChanged', id, from: prevLevel, to: nextLevel, improved });
      if (improved) {
        const best = state.milestones.bestLevel[id] ?? levelIndex(prevLevel);
        if (levelIndex(nextLevel) > best) {
          state.milestones.bestLevel[id] = levelIndex(nextLevel);
          ctx.emit({ type: 'milestone', size: 'big', key: `level:${id}:${nextLevel}`, metric: id, value: to });
        }
      } else {
        ctx.emit({ type: 'milestone', size: 'alert', key: `alert:${id}:${nextLevel}`, metric: id, value: to });
      }
    }

    const step = milestoneStep(id, to);
    const reached = state.milestones.steps[id] ?? 0;
    if (step > reached) {
      state.milestones.steps[id] = step;
      ctx.emit({ type: 'milestone', size: 'small', key: `step:${id}:${step}`, metric: id, value: to });
    }
  }
  if (changed) checkYearMilestone(ctx);
}

function checkYearMilestone(ctx: Ctx): void {
  const year = estimatedYear(ctx.state.metrics);
  const step = Math.max(0, Math.floor((year - BASE_YEAR) / YEAR_STEP));
  const reached = ctx.state.milestones.steps['estimatedYear'] ?? 0;
  if (step > reached) {
    ctx.state.milestones.steps['estimatedYear'] = step;
    ctx.emit({ type: 'milestone', size: 'small', key: `step:estimatedYear:${step}`, value: year });
  }
}

/** Coins never go below 0. Returns the applied delta. */
export function addCoins(ctx: Ctx, delta: number, reason: string): number {
  const from = ctx.state.coins;
  const to = Math.max(0, Math.round(from + delta));
  if (to === from) return 0;
  ctx.state.coins = to;
  ctx.emit({ type: 'coinsChanged', from, to, delta: to - from, reason });
  return to - from;
}

/** Ziko always counts as one volunteer. */
export function addVolunteers(ctx: Ctx, delta: number, reason: string): number {
  const from = ctx.state.volunteers;
  const to = Math.max(1, Math.round(from + delta));
  if (to === from) return 0;
  ctx.state.volunteers = to;
  ctx.emit({ type: 'volunteersChanged', from, to, delta: to - from, reason });
  const reached = ctx.state.milestones.steps['volunteers'] ?? 0;
  let step = 0;
  for (const [i, threshold] of VOLUNTEER_STEPS.entries()) if (to >= threshold) step = i + 1;
  if (step > reached) {
    ctx.state.milestones.steps['volunteers'] = step;
    ctx.emit({ type: 'milestone', size: 'small', key: `step:volunteers:${step}`, value: to });
  }
  return to - from;
}

/** Adds up to `count` items, respecting max stacks. Returns the number added. */
export function addItem(ctx: Ctx, id: ItemId, count = 1): number {
  const from = ctx.state.inventory[id] ?? 0;
  const to = Math.min(ITEMS[id].maxStack, from + count);
  if (to === from) return 0;
  ctx.state.inventory[id] = to;
  ctx.emit({ type: 'itemChanged', id, from, to });
  return to - from;
}

export function removeItem(ctx: Ctx, id: ItemId, count = 1): number {
  if (id === 'mop') return 0;
  const from = ctx.state.inventory[id] ?? 0;
  const to = Math.max(0, from - count);
  if (to === from) return 0;
  if (to === 0) delete ctx.state.inventory[id];
  else ctx.state.inventory[id] = to;
  ctx.emit({ type: 'itemChanged', id, from, to });
  return from - to;
}

/** Big milestone shown only the first time (docs/08 "Premières fois"). */
export function first(ctx: Ctx, key: string): boolean {
  if (ctx.state.milestones.firsts.includes(key)) return false;
  ctx.state.milestones.firsts.push(key);
  ctx.emit({ type: 'milestone', size: 'big', key: `first:${key}` });
  return true;
}

export function record(ctx: Ctx, kind: string, region?: Region, detail?: string): void {
  const entry: { year: number; kind: string; region?: Region; detail?: string } = { year: yearOf(ctx.state), kind };
  if (region) entry.region = region;
  if (detail) entry.detail = detail;
  ctx.state.history.push(entry);
}

export function saveSpecies(ctx: Ctx, id: SpeciesId): void {
  const { state } = ctx;
  if (state.savedSpecies.includes(id)) return;
  state.savedSpecies.push(id);
  state.refusedSpecies = state.refusedSpecies.filter((s) => s !== id);
  ctx.emit({ type: 'speciesSaved', id });
  ctx.emit({ type: 'milestone', size: 'small', key: `species:${id}` });
  first(ctx, 'species');
}
