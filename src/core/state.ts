import { BALANCE, eraOfAge } from '../data/balance';
import type { GameEvent } from './events';
import { initialMetrics, levelOf } from './metrics';
import type { Rng } from './rng';
import {
  METRIC_IDS,
  type CardId,
  type CatastropheKind,
  type ChantierId,
  type CreatureId,
  type Era,
  type ItemId,
  type LawId,
  type Level,
  type MetricId,
  type Metrics,
  type MinigameId,
  type ProjectId,
  type QuestId,
  type Region,
  type SpeciesId,
  type TrapId,
} from './types';

export type Phase = 'awaitRoll' | 'resolving' | 'yearEnd' | 'ended';

export type PendingAction =
  | { kind: 'minigame'; minigame: MinigameId }
  | { kind: 'combat'; creature: CreatureId; hp: number; boss: boolean }
  | { kind: 'tv'; questionIds: string[] }
  | { kind: 'shop' }
  | { kind: 'chantier' }
  | { kind: 'animal'; species: SpeciesId | null; price: number }
  | { kind: 'job' }
  | { kind: 'card'; card: CardId }
  | { kind: 'trap'; trap: TrapId };

export interface HistoryEntry {
  year: number;
  kind: string;
  region?: Region;
  detail?: string;
}

export interface Catastrophe {
  kind: CatastropheKind;
  region: Region;
  year: number;
}

export interface Counters {
  cleanups: number;
  demos: number;
  combatsWon: number;
  combatsLost: number;
  combatsDrawn: number;
  tvShows: number;
  bestAudience: number;
  medals: number;
  golds: number;
  chantiers: number;
  kitsBought: number;
  bossDefeated: number;
  bossPrevented: number;
}

export interface GameState {
  version: 1;
  seed: number;
  rngState: number;
  turn: number;
  position: number;
  coins: number;
  volunteers: number;
  metrics: Metrics;
  inventory: Partial<Record<ItemId, number>>;
  laws: LawId[];
  projects: ProjectId[];
  chantiers: Partial<Record<ChantierId, number>>;
  savedSpecies: SpeciesId[];
  refusedSpecies: SpeciesId[];
  catastrophes: Catastrophe[];
  counters: Counters;
  eraStartCounters: Counters;
  eraStartChantiers: Partial<Record<ChantierId, number>>;
  quests: { completed: QuestId[]; expired: QuestId[] };
  milestones: { steps: Partial<Record<string, number>>; bestLevel: Partial<Record<MetricId, number>>; firsts: string[] };
  levels: Record<MetricId, Level>;
  history: HistoryEntry[];
  usedQuestions: string[];
  grandmaLoanUsed: boolean;
  bossDone: boolean;
  phase: Phase;
  pending: PendingAction | null;
  ended: null | 'time' | 'bankrupt';
}

export function emptyCounters(): Counters {
  return {
    cleanups: 0,
    demos: 0,
    combatsWon: 0,
    combatsLost: 0,
    combatsDrawn: 0,
    tvShows: 0,
    bestAudience: 0,
    medals: 0,
    golds: 0,
    chantiers: 0,
    kitsBought: 0,
    bossDefeated: 0,
    bossPrevented: 0,
  };
}

export function createInitialState(seed: number): GameState {
  const metrics = initialMetrics();
  const levels = {} as Record<MetricId, Level>;
  for (const id of METRIC_IDS) levels[id] = levelOf(id, metrics[id]);
  return {
    version: 1,
    seed,
    rngState: seed >>> 0,
    turn: 0,
    position: 0,
    coins: BALANCE.startCoins,
    volunteers: BALANCE.startVolunteers,
    metrics,
    inventory: { mop: 1 },
    laws: [],
    projects: [],
    chantiers: {},
    savedSpecies: [],
    refusedSpecies: [],
    catastrophes: [],
    counters: emptyCounters(),
    eraStartCounters: emptyCounters(),
    eraStartChantiers: {},
    quests: { completed: [], expired: [] },
    milestones: { steps: {}, bestLevel: {}, firsts: [] },
    levels,
    history: [],
    usedQuestions: [],
    grandmaLoanUsed: false,
    bossDone: false,
    phase: 'awaitRoll',
    pending: null,
    ended: null,
  };
}

export function yearOf(state: GameState): number {
  return BALANCE.startYear + state.turn;
}

export function ageOf(state: GameState): number {
  return BALANCE.startAge + state.turn;
}

export function eraOf(state: GameState): Era {
  return eraOfAge(ageOf(state));
}

export function itemCount(state: GameState, id: ItemId): number {
  return state.inventory[id] ?? 0;
}

/** Shared mutable context used by every rule module. */
export interface Ctx {
  state: GameState;
  rng: Rng;
  emit: (event: GameEvent) => void;
}
