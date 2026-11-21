import { BALANCE } from '../data/balance';
import { PROJECTS } from '../data/items';
import { chantierIncome } from './chantiers';
import { lifeCost } from './economy';
import { expireQuests, startEraTracking, checkQuests } from './quests';
import { eraOf, itemCount, yearOf, type Ctx, type GameState } from './state';
import type { CatastropheKind, MetricDeltas, Region } from './types';
import { addCoins, applyDeltas, record } from './world';

const KINDS: readonly CatastropheKind[] = ['storm', 'flood', 'eruption', 'earthquake'];
const REGIONS: readonly Region[] = ['northAmerica', 'southAmerica', 'europe', 'africa', 'asia', 'oceania', 'pacific', 'atlantic', 'indian', 'poles'];

function add(target: MetricDeltas, extra: MetricDeltas): void {
  for (const [id, v] of Object.entries(extra) as [keyof MetricDeltas, number][]) target[id] = (target[id] ?? 0) + v;
}

/** Automatic yearly evolution: continuous drift, laws, projects and passive items (docs/07). */
export function yearlyDeltas(state: GameState): MetricDeltas {
  const m = state.metrics;
  const y = BALANCE.yearly;
  const L = BALANCE.laws;
  const laws = new Set(state.laws);

  const d: MetricDeltas = {
    temperature: y.temperature.base + y.temperature.perGas * (m.toxicGas - y.temperature.gasRef) + y.temperature.perEnergy * (m.cleanEnergy - y.temperature.energyRef),
    toxicGas: y.toxicGas.base + y.toxicGas.perEnergy * m.cleanEnergy,
    diseases: y.diseases.rate * (y.diseases.gasFactor * m.toxicGas - m.diseases),
    lifeExpectancy: y.lifeExpectancy.rate * (y.lifeExpectancy.max - y.lifeExpectancy.perDisease * m.diseases - m.lifeExpectancy),
    marineSurvival: y.marineSurvival.base + y.marineSurvival.perTemp * (m.temperature - y.marineSurvival.tempRef),
    biodiversity:
      y.biodiversity.base + y.biodiversity.perTemp * (m.temperature - y.biodiversity.tempRef) + y.biodiversity.perCreature * (m.creatures - y.biodiversity.creatureRef),
    creatures: y.creatures,
    cleanEnergy: y.cleanEnergy,
    localProducts: y.localProducts.base,
  };
  const local = m.localProducts - y.localProducts.ref;
  add(d, { toxicGas: y.localProducts.gasPerLocal * local, marineSurvival: y.localProducts.marinePerLocal * local, temperature: y.localProducts.tempPerLocal * local });

  let creatureFactor = 1;
  if (laws.has('antiPlastic')) {
    creatureFactor *= L.antiPlastic.creatureFactor;
    add(d, { marineSurvival: L.antiPlastic.marine });
  }
  if (state.projects.some((p) => PROJECTS[p].halvesCreatureGrowth)) creatureFactor *= 0.5;
  d.creatures = (d.creatures ?? 0) * creatureFactor;
  if (laws.has('cleanAir')) add(d, { toxicGas: L.cleanAir.toxicGas, diseases: L.cleanAir.diseases });
  if (laws.has('oceans')) add(d, { marineSurvival: L.oceans.marine });
  if (laws.has('cleanPower'))
    add(d, { cleanEnergy: L.cleanPower.cleanEnergy, toxicGas: L.cleanPower.toxicGas, biodiversity: L.cleanPower.biodiversity, marineSurvival: L.cleanPower.marine });
  if (laws.has('climate')) add(d, { temperature: L.climate.temperature, cleanEnergy: L.climate.cleanEnergy });

  const solar = itemCount(state, 'solar');
  if (solar > 0) add(d, { cleanEnergy: BALANCE.passives.solar.deltas.cleanEnergy * solar, toxicGas: BALANCE.passives.solar.deltas.toxicGas * solar });
  const filters = itemCount(state, 'filter');
  if (filters > 0) add(d, { diseases: BALANCE.passives.filter.deltas.diseases * filters });
  return d;
}

export function yearlyIncome(state: GameState): number {
  let coins = itemCount(state, 'solar') * BALANCE.passives.solar.coins + chantierIncome(state);
  for (const p of state.projects) coins += PROJECTS[p].yearlyCoins ?? 0;
  return coins;
}

export function catastropheChance(temperature: number): number {
  for (const c of BALANCE.catastropheChance) if (temperature >= c.minTemp) return c.chance;
  return 0;
}

export interface YearReport {
  year: number;
  income: number;
  lifeCost: number;
  loan: number;
  catastrophe: { kind: CatastropheKind; region: Region } | null;
  bankrupt: boolean;
  ended: boolean;
}

function maybeCatastrophe(ctx: Ctx): YearReport['catastrophe'] {
  const { state, rng } = ctx;
  const year = yearOf(state);
  state.catastrophes = state.catastrophes.filter((c) => year - c.year < BALANCE.catastropheDurationYears);
  if (!rng.chance(catastropheChance(state.metrics.temperature))) return null;
  const kind = rng.pick(KINDS);
  const region = rng.pick(REGIONS);
  state.catastrophes.push({ kind, region, year });
  ctx.emit({ type: 'catastrophe', kind, region });
  const [bMin, bMax] = BALANCE.catastropheBiodiversity;
  const [dMin, dMax] = BALANCE.catastropheDiseases;
  applyDeltas(ctx, { biodiversity: -rng.int(bMin, bMax), diseases: rng.int(dMin, dMax) }, 'catastrophe');
  addCoins(ctx, -rng.int(BALANCE.catastropheCoinLoss[0], BALANCE.catastropheCoinLoss[1]), 'catastrophe');
  record(ctx, 'catastrophe', region, kind);
  return { kind, region };
}

function advanceTurn(ctx: Ctx): void {
  const { state } = ctx;
  const before = eraOf(state);
  ctx.emit({ type: 'yearEnded', year: yearOf(state) });
  state.turn++;
  const after = eraOf(state);
  if (before !== after && state.turn < BALANCE.totalYears) {
    expireQuests(ctx, before);
    startEraTracking(state);
    ctx.emit({ type: 'eraChanged', from: before, to: after });
    ctx.emit({ type: 'milestone', size: 'big', key: `era:${after}` });
    checkQuests(ctx);
  }
}

/** After bankruptcy the remaining years only degrade (docs/15). */
function simulateRemainingYears(ctx: Ctx): void {
  while (ctx.state.turn < BALANCE.totalYears) {
    applyDeltas(ctx, yearlyDeltas(ctx.state), 'yearEnd');
    ctx.state.turn++;
  }
}

/** docs/04 — "Fin de l'année", in order. */
export function runYearEnd(ctx: Ctx): YearReport {
  const { state } = ctx;
  const report: YearReport = { year: yearOf(state), income: 0, lifeCost: 0, loan: 0, catastrophe: null, bankrupt: false, ended: false };

  applyDeltas(ctx, yearlyDeltas(state), 'yearEnd');
  report.income = addCoins(ctx, yearlyIncome(state), 'income');
  report.catastrophe = maybeCatastrophe(ctx);

  const cost = lifeCost(eraOf(state));
  if (state.coins < cost && !state.grandmaLoanUsed) {
    state.grandmaLoanUsed = true;
    report.loan = addCoins(ctx, BALANCE.grandmaLoan, 'grandma');
    ctx.emit({ type: 'grandmaLoan', amount: BALANCE.grandmaLoan });
  }
  if (state.coins < cost) {
    report.bankrupt = true;
    addCoins(ctx, -state.coins, 'lifeCost');
    ctx.emit({ type: 'yearEnded', year: yearOf(state) });
    state.turn++;
    simulateRemainingYears(ctx);
    state.ended = 'bankrupt';
    state.phase = 'ended';
    report.ended = true;
    ctx.emit({ type: 'gameOver', reason: 'bankrupt' });
    return report;
  }
  report.lifeCost = -addCoins(ctx, -cost, 'lifeCost');

  checkQuests(ctx);
  advanceTurn(ctx);

  if (state.turn >= BALANCE.totalYears) {
    expireQuests(ctx, eraOf({ ...state, turn: BALANCE.totalYears - 1 }));
    state.ended = 'time';
    state.phase = 'ended';
    report.ended = true;
    ctx.emit({ type: 'gameOver', reason: 'time' });
  } else {
    state.phase = 'awaitRoll';
  }
  return report;
}
