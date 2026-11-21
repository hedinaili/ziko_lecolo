import type { Era, MetricDeltas } from '../core/types';

/** All tunable numbers in one place (docs/14 "valeurs de départ"). */
export const BALANCE = {
  totalYears: 40,
  startYear: 2500,
  startAge: 10,
  startCoins: 50,
  startVolunteers: 1,
  startPassBonus: 15,
  lifeCost: { child: 1, young: 2, adult: 3, hero: 4 } satisfies Record<Era, number>,
  grandmaLoan: 15,
  /**
   * Continuous yearly evolution (docs/07): each metric drifts according to the others,
   * so clean energy lowers gas and temperature, gas raises diseases, etc.
   */
  yearly: {
    temperature: { base: 0.015, perGas: 0.0006, gasRef: 30, perEnergy: -0.0008, energyRef: 10 },
    toxicGas: { base: 0.3, perEnergy: -0.01 },
    /** Diseases move 8 %/year towards gas × 1.2 (clean air heals). */
    diseases: { gasFactor: 1.2, rate: 0.08 },
    /** Life expectancy moves 8 %/year towards 85 − 0.6 × diseases. */
    lifeExpectancy: { max: 85, perDisease: 0.6, rate: 0.08 },
    marineSurvival: { base: -2, perTemp: -1, tempRef: 3 },
    biodiversity: { base: -0.05, perTemp: -0.15, tempRef: 3, perCreature: -0.05, creatureRef: 5 },
    creatures: 0.08,
    cleanEnergy: 0.3,
    /** Local consumption slowly erodes; above 20 % it cuts cargo/plane pollution. */
    localProducts: { base: -0.1, ref: 20, gasPerLocal: -0.01, marinePerLocal: 0.1, tempPerLocal: -0.0002 },
  },
  laws: {
    antiPlastic: { creatureFactor: 0.5, marine: 5 },
    cleanAir: { toxicGas: -0.5, diseases: -0.3 },
    oceans: { marine: 10 },
    cleanPower: { cleanEnergy: 1.5, toxicGas: -0.3, biodiversity: 0.1, marine: 2 },
    climate: { temperature: -0.04, cleanEnergy: 1.5 },
  },
  catastropheChance: [
    { minTemp: 3.5, chance: 0.25 },
    { minTemp: 2.5, chance: 0.15 },
    { minTemp: 1.5, chance: 0.08 },
    { minTemp: -Infinity, chance: 0.03 },
  ],
  catastropheCoinLoss: [0, 5] as const,
  catastropheBiodiversity: [1, 2] as const,
  catastropheDiseases: [0, 1] as const,
  catastropheDurationYears: 3,
  cleanup: {
    tiers: [
      { min: 1000, mult: 4 },
      { min: 200, mult: 3 },
      { min: 50, mult: 2 },
      { min: 10, mult: 1.5 },
      { min: 0, mult: 1 },
    ],
    base: { toxicGas: -1.2, biodiversity: 2, creatures: -0.5 } satisfies MetricDeltas,
    oceanMarineBonus: 15,
    coins: 3,
    volunteers: 2,
    capacityPerKit: 10,
    capacityPerExtraTool: 3,
    catastropheRepairBiodiversity: 2,
  },
  demo: { growthRate: 0.2, minGrowth: 3, gas: -1, energy: 0.5, local: 1, megaphoneBonus: 1.5 },
  animal: { price: 15, priceAdult: 20, biodiversity: 3, refusePenalty: -1, allSavedBonus: 1 },
  job: {
    classic: { child: 6, young: 10, adult: 14, hero: 18 } satisfies Record<Era, number>,
    eco: { child: 3, young: 5, adult: 7, hero: 9 } satisfies Record<Era, number>,
    ecoBonus: {
      energy: { cleanEnergy: 1 },
      biodiversity: { biodiversity: 1 },
      gas: { toxicGas: -0.3 },
      local: { localProducts: 1.5 },
    } satisfies Record<string, MetricDeltas>,
  },
  minigame: {
    medals: [
      { min: 0.9, medal: 'gold', coins: 20 },
      { min: 0.7, medal: 'silver', coins: 12 },
      { min: 0.4, medal: 'bronze', coins: 6 },
      { min: 0, medal: 'none', coins: 2 },
    ] as const,
  },
  combat: {
    hearts: 3,
    maxRounds: 5,
    winCoins: 8,
    drawCoins: 2,
    loseCoins: 5,
    winCreatures: -0.7,
    loseCreatures: 0.5,
    dropChance: 0.3,
    bossHp: 12,
    bossWinCoins: 30,
    bossWinCreatures: -3,
    bossLoseCreatures: 1,
    bossMinAge: 45,
    bossMinCreatures: 5,
  },
  tv: {
    baseAudience: { child: 10_000, young: 100_000, adult: 1_000_000, hero: 10_000_000 } satisfies Record<Era, number>,
    questions: { child: 3, young: 3, adult: 3, hero: 4 } satisfies Record<Era, number>,
    eraFactor: { child: 1, young: 1.5, adult: 2, hero: 2.5 } satisfies Record<Era, number>,
    volunteersPerViewer: 0.0005,
    microBonus: 1.5,
    sponsorKits: 2,
    gas: { base: 0.4, perRatio: 1 },
    coins: { base: 5, perRatio: 15 },
    local: { base: 1, perRatio: 3 },
  },
  shop: { kitBasePrice: 8, kitPriceStep: 3, kitMaxPrice: 15, seedsPerPack: 5 },
  seeds: { biodiversity: 0.5, toxicGas: -0.2 } satisfies MetricDeltas,
  chantierPriceGrowth: 1.2,
  /** Balancing multiplier applied to chantier effects (values in data/content.ts are the base). */
  chantierEffect: 1.5,
  passives: {
    solar: { coins: 2, deltas: { cleanEnergy: 1, toxicGas: -0.3 } satisfies MetricDeltas },
    filter: { deltas: { diseases: -0.3 } satisfies MetricDeltas },
  },
} as const;

export function eraOfAge(age: number): Era {
  if (age < 18) return 'child';
  if (age < 30) return 'young';
  if (age < 42) return 'adult';
  return 'hero';
}

export const ERA_INDEX: Record<Era, number> = { child: 0, young: 1, adult: 2, hero: 3 };
