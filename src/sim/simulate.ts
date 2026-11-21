/**
 * Balance simulation (docs/14 "Équilibrage", docs/16 "Simulation d'équilibrage").
 * Usage: npm run simulate -- [gamesPerProfile]
 */
import { BOT_PROFILES, playGame, type BotProfile, type GameSummary } from './bot';

/** Average durations in seconds (docs/04 "Budget temps"). */
const DURATION = {
  intro: 120 + 90,
  turn: 12,
  minigame: 45,
  combat: 40,
  tv: 45,
  shop: 30,
  scene: 6,
  epilogue: 60,
};

export function estimateMinutes(s: GameSummary): number {
  const seconds =
    DURATION.intro +
    s.turns * DURATION.turn +
    s.minigames * DURATION.minigame +
    s.combats * DURATION.combat +
    s.tvShows * DURATION.tv +
    s.shopVisits * DURATION.shop +
    s.milestoneScenes * DURATION.scene +
    DURATION.epilogue;
  return seconds / 60;
}

function quantile(values: number[], q: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))] ?? 0;
}

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / Math.max(1, values.length);
}

export interface ProfileReport {
  profile: BotProfile;
  games: number;
  coinsMean: number;
  coinsP10: number;
  coinsP90: number;
  bankruptRate: number;
  yearMedian: number;
  yearP10: number;
  yearP90: number;
  qualityMean: number;
  minutesMean: number;
  minutesMax: number;
  scenesMean: number;
  endings: Record<string, number>;
}

export function simulate(gamesPerProfile: number, profiles: readonly BotProfile[] = BOT_PROFILES): ProfileReport[] {
  return profiles.map((profile) => {
    const summaries = Array.from({ length: gamesPerProfile }, (_, i) => playGame(1000 + i, profile).summary);
    const endings: Record<string, number> = {};
    for (const s of summaries) endings[s.ending] = (endings[s.ending] ?? 0) + 1;
    const coins = summaries.map((s) => s.coins);
    const years = summaries.map((s) => s.estimatedYear);
    const minutes = summaries.map(estimateMinutes);
    return {
      profile,
      games: summaries.length,
      coinsMean: Math.round(mean(coins)),
      coinsP10: quantile(coins, 0.1),
      coinsP90: quantile(coins, 0.9),
      bankruptRate: summaries.filter((s) => s.ended === 'bankrupt').length / summaries.length,
      yearMedian: quantile(years, 0.5),
      yearP10: quantile(years, 0.1),
      yearP90: quantile(years, 0.9),
      qualityMean: Math.round(mean(summaries.map((s) => s.quality))),
      minutesMean: Math.round(mean(minutes) * 10) / 10,
      minutesMax: Math.round(Math.max(...minutes) * 10) / 10,
      scenesMean: Math.round(mean(summaries.map((s) => s.milestoneScenes)) * 10) / 10,
      endings,
    };
  });
}
