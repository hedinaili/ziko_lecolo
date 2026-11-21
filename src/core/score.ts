import { initialMetrics, normalize } from './metrics';
import type { Level, MetricId, Metrics } from './types';

/** docs/15 — indice de durée D. */
export const DURATION_WEIGHTS: Partial<Record<MetricId, number>> = {
  temperature: 0.25,
  toxicGas: 0.15,
  marineSurvival: 0.2,
  biodiversity: 0.15,
  cleanEnergy: 0.1,
  creatures: 0.1,
  localProducts: 0.05,
};

/** docs/15 — qualité de vie Q (the remaining 10 % comes from saved species). */
export const QUALITY_WEIGHTS: Partial<Record<MetricId, number>> = {
  lifeExpectancy: 0.35,
  diseases: 0.25,
  toxicGas: 0.15,
  biodiversity: 0.15,
};
export const SPECIES_WEIGHT = 0.1;
export const SPECIES_TOTAL = 10;

function weighted(metrics: Metrics, weights: Partial<Record<MetricId, number>>): number {
  let sum = 0;
  for (const [id, w] of Object.entries(weights) as [MetricId, number][]) sum += w * normalize(id, metrics[id]);
  return sum;
}

export function durationIndex(metrics: Metrics): number {
  return weighted(metrics, DURATION_WEIGHTS);
}

export const D0 = durationIndex(initialMetrics());

/**
 * Year curve: gain of the duration index since the start (ΔD) → estimated year (docs/15).
 * Linear interpolation between points, calibrated with the balance simulation.
 */
export const YEAR_CURVE: readonly (readonly [number, number])[] = [
  [-30, 2500],
  [-15, 2550],
  [-10, 2650],
  [-5, 2720],
  [0, 2800],
  [5, 3400],
  [10, 4500],
  [15, 5600],
  [20, 7300],
  [25, 9200],
  [30, 11000],
  [40, 13500],
  [60, 20000],
  [75, 25000],
];

export function yearFromGain(gain: number): number {
  const first = YEAR_CURVE[0]!;
  const last = YEAR_CURVE[YEAR_CURVE.length - 1]!;
  if (gain <= first[0]) return first[1];
  if (gain >= last[0]) return last[1];
  for (let i = 1; i < YEAR_CURVE.length; i++) {
    const [x1, y1] = YEAR_CURVE[i]!;
    const [x0, y0] = YEAR_CURVE[i - 1]!;
    if (gain <= x1) return y0 + ((gain - x0) * (y1 - y0)) / (x1 - x0);
  }
  return last[1];
}

export function estimatedYear(metrics: Metrics): number {
  return Math.round(yearFromGain(durationIndex(metrics) - D0) / 10) * 10;
}

export function qualityIndex(metrics: Metrics, savedSpecies: number): number {
  const species = Math.min(1, savedSpecies / SPECIES_TOTAL) * 100;
  return weighted(metrics, QUALITY_WEIGHTS) + SPECIES_WEIGHT * species;
}

export function stars(quality: number): number {
  if (quality >= 85) return 5;
  if (quality >= 70) return 4;
  if (quality >= 50) return 3;
  if (quality >= 30) return 2;
  return 1;
}

export function yearLevel(year: number): Level {
  if (year < 3000) return 'critical';
  if (year < 4000) return 'alert';
  if (year < 8000) return 'normal';
  return 'comfortable';
}

export type EndingId = 'danger' | 'centuries' | 'holding' | 'reviving' | 'solid' | 'superhero';

export interface Ending {
  id: EndingId;
  title: string;
  sentence: string;
}

export function ending(year: number, quality: number, finalYear: number): Ending {
  const remaining = Math.max(0, year - finalYear);
  const goodLife = quality >= 70;
  if (year < 2800)
    return { id: 'danger', title: 'La Terre en danger', sentence: 'La vie sur Terre est encore en grand danger… mais Ziko a montré le chemin. Et si tu réessayais ?' };
  if (year < 4000)
    return { id: 'centuries', title: 'Quelques siècles gagnés', sentence: `On estime que la vie sur Terre pourra durer encore quelques siècles (jusqu'en l'an ${year}). C'est un début !` };
  if (year < 8000)
    return goodLife
      ? { id: 'reviving', title: 'Une planète qui revit', sentence: `On estime que la vie sur Terre pourra durer encore quelques milliers d'années (environ ${remaining} ans), et les êtres vivants y vivent mieux !` }
      : { id: 'holding', title: 'Une planète qui tient bon', sentence: `On estime que la vie sur Terre pourra durer encore quelques milliers d'années (environ ${remaining} ans)… mais la vie y reste difficile.` };
  return goodLife
    ? { id: 'superhero', title: 'Ziko, super-héros de la Terre', sentence: `Grâce à Ziko, la vie sur Terre pourra durer encore plus de ${remaining} ans, et les êtres vivants y vivent heureux.` }
    : { id: 'solid', title: 'Une planète solide', sentence: 'La planète tiendra très longtemps… mais il reste du travail pour que tous y vivent bien.' };
}
