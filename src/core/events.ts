import type {
  CatastropheKind,
  ChantierId,
  CreatureId,
  Era,
  ItemId,
  LawId,
  Level,
  MetricId,
  ProjectId,
  QuestId,
  Region,
  SpeciesId,
} from './types';

export type GameEvent =
  | { type: 'metricChanged'; id: MetricId; from: number; to: number; delta: number; source: string }
  | { type: 'levelChanged'; id: MetricId; from: Level; to: Level; improved: boolean }
  | { type: 'milestone'; size: 'small' | 'big' | 'alert'; key: string; metric?: MetricId; value?: number }
  | { type: 'coinsChanged'; from: number; to: number; delta: number; reason: string }
  | { type: 'volunteersChanged'; from: number; to: number; delta: number; reason: string }
  | { type: 'itemChanged'; id: ItemId; from: number; to: number }
  | { type: 'lawPassed'; id: LawId }
  | { type: 'projectBuilt'; id: ProjectId }
  | { type: 'chantierBuilt'; id: ChantierId; count: number }
  | { type: 'speciesSaved'; id: SpeciesId }
  | { type: 'catastrophe'; kind: CatastropheKind; region: Region }
  | { type: 'catastropheRepaired'; kind: CatastropheKind; region: Region }
  | { type: 'questCompleted'; id: QuestId }
  | { type: 'eraChanged'; from: Era; to: Era }
  | { type: 'combatEnded'; creature: CreatureId; outcome: 'win' | 'draw' | 'lose' }
  | { type: 'bossPrevented' }
  | { type: 'grandmaLoan'; amount: number }
  | { type: 'moved'; from: number; to: number; passedStart: boolean }
  | { type: 'yearEnded'; year: number }
  | { type: 'gameOver'; reason: 'time' | 'bankrupt' };

export type Listener = (event: GameEvent) => void;

export class EventBus {
  private listeners = new Set<Listener>();

  on(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(event: GameEvent): void {
    for (const l of this.listeners) l(event);
  }

  clear(): void {
    this.listeners.clear();
  }

  get size(): number {
    return this.listeners.size;
  }
}
