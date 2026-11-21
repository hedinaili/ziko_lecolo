import { LEVELS, METRIC_IDS, type Level, type MetricId, type Metrics } from './types';

export interface MetricDef {
  id: MetricId;
  label: string;
  unit: string;
  initial: number;
  /** 'higher' = a higher value is better. */
  direction: 'higher' | 'lower';
  /** Level boundaries ordered from critical towards comfortable (see docs/07). */
  bounds: readonly [number, number, number];
  /** Values used for normalisation (score). */
  worst: number;
  best: number;
  /** Hard clamp range. */
  min: number;
  max: number;
  /** Milestone step size in the "better" direction (docs/08). */
  step: number;
}

export const METRICS: Readonly<Record<MetricId, MetricDef>> = {
  lifeExpectancy: { id: 'lifeExpectancy', label: 'Espérance de vie des humains', unit: 'ans', initial: 50, direction: 'higher', bounds: [55, 65, 75], worst: 30, best: 90, min: 20, max: 100, step: 5 },
  marineSurvival: { id: 'marineSurvival', label: 'Extinction des êtres marins', unit: 'ans', initial: 300, direction: 'higher', bounds: [400, 700, 1000], worst: 0, best: 1500, min: 0, max: 5000, step: 50 },
  temperature: { id: 'temperature', label: 'Température globale', unit: '°C', initial: 4, direction: 'lower', bounds: [3.5, 2.5, 1.5], worst: 6, best: 1, min: 0, max: 8, step: 0.5 },
  toxicGas: { id: 'toxicGas', label: "Gaz toxiques dans l'air", unit: '%', initial: 40, direction: 'lower', bounds: [35, 20, 10], worst: 60, best: 0, min: 0, max: 100, step: 5 },
  diseases: { id: 'diseases', label: 'Maladies liées à la pollution', unit: '%', initial: 55, direction: 'lower', bounds: [50, 30, 15], worst: 90, best: 0, min: 0, max: 100, step: 5 },
  creatures: { id: 'creatures', label: 'Niveau des créatures', unit: '/10', initial: 6, direction: 'lower', bounds: [8, 5, 2], worst: 10, best: 0, min: 0, max: 10, step: 1 },
  biodiversity: { id: 'biodiversity', label: 'Biodiversité', unit: '/100', initial: 25, direction: 'higher', bounds: [30, 50, 75], worst: 0, best: 100, min: 0, max: 100, step: 10 },
  cleanEnergy: { id: 'cleanEnergy', label: 'Énergie propre', unit: '%', initial: 10, direction: 'higher', bounds: [20, 40, 70], worst: 0, best: 100, min: 0, max: 100, step: 10 },
  localProducts: { id: 'localProducts', label: 'Consommation de produits locaux', unit: '%', initial: 20, direction: 'higher', bounds: [25, 45, 65], worst: 0, best: 100, min: 0, max: 100, step: 10 },
};

export function initialMetrics(): Metrics {
  const m = {} as Metrics;
  for (const id of METRIC_IDS) m[id] = METRICS[id].initial;
  return m;
}

export function clampMetric(id: MetricId, value: number): number {
  const d = METRICS[id];
  return Math.min(d.max, Math.max(d.min, value));
}

export function levelOf(id: MetricId, value: number): Level {
  const { direction, bounds } = METRICS[id];
  if (direction === 'higher') {
    if (value < bounds[0]) return 'critical';
    if (value < bounds[1]) return 'alert';
    if (value < bounds[2]) return 'normal';
    return 'comfortable';
  }
  if (value >= bounds[0]) return 'critical';
  if (value >= bounds[1]) return 'alert';
  if (value >= bounds[2]) return 'normal';
  return 'comfortable';
}

export function levelIndex(level: Level): number {
  return LEVELS.indexOf(level);
}

/** 0..100 where 100 is the best value. */
export function normalize(id: MetricId, value: number): number {
  const { worst, best } = METRICS[id];
  const n = (100 * (worst - value)) / (worst - best);
  return Math.min(100, Math.max(0, n));
}

/** Positive when `to` is better than `from`. */
export function improvement(id: MetricId, from: number, to: number): number {
  return METRICS[id].direction === 'higher' ? to - from : from - to;
}

/** Index of the milestone step reached relative to the initial value (0 = none). */
export function milestoneStep(id: MetricId, value: number): number {
  const gain = improvement(id, METRICS[id].initial, value);
  return Math.max(0, Math.floor(gain / METRICS[id].step + 1e-9));
}
