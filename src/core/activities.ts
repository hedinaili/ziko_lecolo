import { BALANCE } from '../data/balance';
import { MINIGAMES } from '../data/content';
import { QUIZ } from '../data/quiz';
import type { Rng } from './rng';
import type { GameState } from './state';
import type { Era, Medal, MetricDeltas, MinigameId } from './types';

export type QuizAnswer = 'correct' | 'wrong' | 'absurd';

export interface TvResult {
  ratio: number;
  laughs: number;
  audience: number;
  volunteers: number;
  coins: number;
  gasDelta: number;
  localDelta: number;
  sponsorKits: number;
}

/** Each absurd answer makes the audience laugh: +5 % viewers (docs/19). */
export const LAUGH_BONUS = 0.05;

/** docs/13 — "Calculs". */
export function computeTv(era: Era, answers: readonly QuizAnswer[], hasMicro: boolean, rng: Rng): TvResult {
  const t = BALANCE.tv;
  const total = Math.max(1, answers.length);
  const correct = answers.filter((a) => a === 'correct').length;
  const laughs = answers.filter((a) => a === 'absurd').length;
  const ratio = correct / total;
  const audience = Math.round(
    t.baseAudience[era] * (0.3 + 0.9 * ratio) * (1 + LAUGH_BONUS * laughs) * (hasMicro ? t.microBonus : 1) * rng.range(0.9, 1.1),
  );
  return {
    ratio,
    laughs,
    audience,
    volunteers: Math.max(1, Math.round(audience * t.volunteersPerViewer)),
    coins: Math.round(t.coins.base + t.coins.perRatio * ratio * t.eraFactor[era]),
    gasDelta: -(t.gas.base + t.gas.perRatio * ratio),
    localDelta: t.local.base + t.local.perRatio * ratio,
    sponsorKits: ratio >= 1 ? t.sponsorKits : 0,
  };
}

/** Picks `count` questions of the era, avoiding repeats within a game when possible. */
export function pickQuestions(state: GameState, era: Era, count: number, rng: Rng): string[] {
  const used = new Set(state.usedQuestions);
  const pools = [
    QUIZ.filter((q) => q.era === era && !used.has(q.id)),
    QUIZ.filter((q) => q.era !== era && !used.has(q.id)),
    QUIZ.filter((q) => q.era === era),
    [...QUIZ],
  ];
  const picked: string[] = [];
  for (const pool of pools) {
    const candidates = pool.filter((q) => !picked.includes(q.id));
    while (picked.length < count && candidates.length > 0) {
      const index = rng.int(0, candidates.length - 1);
      const [q] = candidates.splice(index, 1);
      if (q) picked.push(q.id);
    }
    if (picked.length >= count) break;
  }
  for (const id of picked) if (!state.usedQuestions.includes(id)) state.usedQuestions.push(id);
  return picked;
}

export function medalFor(scoreRatio: number): { medal: Medal; coins: number } {
  const ratio = Math.min(1, Math.max(0, Number.isFinite(scoreRatio) ? scoreRatio : 0));
  for (const m of BALANCE.minigame.medals) if (ratio >= m.min) return { medal: m.medal, coins: m.coins };
  return { medal: 'none', coins: 2 };
}

export function minigameBonus(id: MinigameId, medal: Medal): MetricDeltas {
  if (medal === 'gold') return MINIGAMES[id].gold;
  if (medal === 'silver') return MINIGAMES[id].silver;
  return {};
}
