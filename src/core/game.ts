import { BALANCE } from '../data/balance';
import { DUEL_GIFTS } from '../data/weapons';
import { ITEMS } from '../data/items';
import { TILES } from '../data/board';
import { CREATURES, SPECIES } from '../data/content';
import { computeTv, medalFor, minigameBonus, type QuizAnswer, type TvResult } from './activities';
import { buildChantier as build } from './chantiers';
import type { CombatOutcome } from './combat';
import { buyItem, buyProject, type PurchaseResult } from './economy';
import { EventBus } from './events';
import { checkQuests } from './quests';
import { Rng } from './rng';
import { estimatedYear, qualityIndex } from './score';
import { ageOf, createInitialState, eraOf, itemCount, yearOf, type Ctx, type GameState, type PendingAction, type Phase } from './state';
import { landOn, moveForward, resolveCard, resolveTrap, tileAt } from './tiles';
import type { ChantierId, Era, ItemId, Medal, MinigameId, ProjectId } from './types';
import { addCoins, addItem, addVolunteers, applyDeltas, first, record, removeItem, saveSpecies } from './world';
import { runYearEnd, type YearReport } from './yearEnd';

export class GameRuleError extends Error {
  override name = 'GameRuleError';
}

export interface RollResult {
  die: number;
  steps: number;
  from: number;
  to: number;
  passedStart: boolean;
  pending: PendingAction | null;
}

export type GameAction =
  | 'roll'
  | 'plantSeed'
  | 'resolveMinigame'
  | 'resolveCombat'
  | 'resolveTv'
  | 'shopBuy'
  | 'leaveShop'
  | 'buildChantier'
  | 'skipChantier'
  | 'saveAnimal'
  | 'refuseAnimal'
  | 'chooseJob'
  | 'answerCard'
  | 'answerTrap'
  | 'endYear';

const COMBAT_DROPS: readonly ItemId[] = ['pince', 'cle', 'eponge', 'aspirateur', 'medkit'];

/** Rules engine façade. Pure TypeScript, no rendering: used by scenes, tests and the simulator. */
export class Game {
  readonly bus = new EventBus();
  readonly state: GameState;
  private readonly rng: Rng;
  private readonly ctx: Ctx;

  private constructor(state: GameState) {
    this.state = state;
    this.rng = new Rng(state.seed);
    this.rng.state = state.rngState;
    this.ctx = { state, rng: this.rng, emit: (e) => this.bus.emit(e) };
  }

  static create(seed: number = Date.now()): Game {
    return new Game(createInitialState(seed >>> 0));
  }

  static load(json: string): Game {
    let data: unknown;
    try {
      data = JSON.parse(json);
    } catch {
      throw new GameRuleError('Sauvegarde illisible');
    }
    const s = data as Partial<GameState> | null;
    if (!s || s.version !== 1 || typeof s.turn !== 'number' || typeof s.coins !== 'number' || !s.metrics) {
      throw new GameRuleError('Sauvegarde invalide');
    }
    return new Game(s as GameState);
  }

  save(): string {
    this.sync();
    return JSON.stringify(this.state);
  }

  get phase(): Phase {
    return this.state.phase;
  }
  get pending(): PendingAction | null {
    return this.state.pending;
  }
  get year(): number {
    return yearOf(this.state);
  }
  get age(): number {
    return ageOf(this.state);
  }
  get era(): Era {
    return eraOf(this.state);
  }
  get estimatedYear(): number {
    return estimatedYear(this.state.metrics);
  }
  get quality(): number {
    return qualityIndex(this.state.metrics, this.state.savedSpecies.length);
  }

  /** Actions accepted in the current phase; never empty until the game has ended. */
  availableActions(): GameAction[] {
    const { phase, pending } = this.state;
    if (phase === 'ended') return [];
    if (phase === 'awaitRoll') return itemCount(this.state, 'seeds') > 0 ? ['roll', 'plantSeed'] : ['roll'];
    if (phase === 'yearEnd') return itemCount(this.state, 'seeds') > 0 ? ['endYear', 'plantSeed'] : ['endYear'];
    switch (pending?.kind) {
      case 'minigame':
        return ['resolveMinigame'];
      case 'combat':
        return ['resolveCombat'];
      case 'tv':
        return ['resolveTv'];
      case 'shop':
        return ['shopBuy', 'leaveShop'];
      case 'chantier':
        return ['buildChantier', 'skipChantier'];
      case 'animal':
        return ['saveAnimal', 'refuseAnimal'];
      case 'job':
        return ['chooseJob'];
      case 'card':
        return ['answerCard'];
      case 'trap':
        return ['answerTrap'];
      default:
        throw new GameRuleError('Incoherent state: resolving without pending action');
    }
  }

  // --- Turn ------------------------------------------------------------------

  roll(opts: { useBike?: boolean; forcedDie?: number } = {}): RollResult {
    this.expectPhase('awaitRoll');
    const die = opts.forcedDie ?? this.rng.int(1, 6);
    if (!Number.isInteger(die) || die < 1 || die > 6) throw new GameRuleError(`Invalid die ${die}`);
    const bike = opts.useBike && itemCount(this.state, 'velo') > 0 ? 1 : 0;
    const steps = die + bike;
    const move = moveForward(this.ctx, steps);
    const pending = landOn(this.ctx, tileAt(move.to));
    this.state.pending = pending;
    this.state.phase = pending ? 'resolving' : 'yearEnd';
    if (!pending) checkQuests(this.ctx);
    this.sync();
    return { die, steps, from: move.from, to: move.to, passedStart: move.passedStart, pending };
  }

  endYear(): YearReport {
    this.expectPhase('yearEnd');
    const report = runYearEnd(this.ctx);
    this.sync();
    return report;
  }

  plantSeed(): boolean {
    if (this.state.phase !== 'awaitRoll' && this.state.phase !== 'yearEnd') return false;
    if (removeItem(this.ctx, 'seeds', 1) === 0) return false;
    applyDeltas(this.ctx, BALANCE.seeds, 'seeds');
    record(this.ctx, 'tree');
    this.sync();
    return true;
  }

  // --- Activities ------------------------------------------------------------

  resolveMinigame(scoreRatio: number): { medal: Medal; coins: number } {
    const p = this.expectPending('minigame');
    const result = this.awardMinigame(p.minigame, scoreRatio, this.state.position);
    this.finishTile();
    return result;
  }

  awardMinigame(id: MinigameId, scoreRatio: number, position: number): { medal: Medal; coins: number } {
    const result = medalFor(scoreRatio,id);
    addCoins(this.ctx, result.coins, `minigame:${id}`);
    if (result.medal !== 'none') this.state.counters.medals++;
    if (result.medal === 'gold') {
      this.state.counters.golds++;
      addItem(this.ctx, this.rng.chance(0.5) ? 'kit' : 'seeds', 1);
    }
    applyDeltas(this.ctx, minigameBonus(id, result.medal), `minigame:${id}`);
    record(this.ctx, 'minigame', TILES[position]?.region, result.medal);
    return result;
  }

  resolveCombat(outcome: CombatOutcome, medkitsUsed = 0): void {
    const p = this.expectPending('combat');
    this.applyCombatResult(p, outcome, medkitsUsed, this.state.position);
    this.finishTile();
  }

  applyCombatResult(p: Pick<Extract<PendingAction, {kind:'combat'}>, 'creature'|'boss'>, outcome: CombatOutcome, medkitsUsed: number, position: number): ItemId|null {
    let gift:ItemId|null=null;
    const c = BALANCE.combat;
    removeItem(this.ctx, 'medkit', Math.max(0, Math.floor(medkitsUsed)));
    const region = TILES[position]?.region;
    if (p.boss) {
      this.state.bossDone = true;
      if (outcome === 'win') {
        this.state.counters.bossDefeated++;
        addCoins(this.ctx, c.bossWinCoins, 'boss');
        applyDeltas(this.ctx, { creatures: c.bossWinCreatures }, 'boss');
        first(this.ctx, 'bossDefeated');
      } else if (outcome === 'lose') {
        applyDeltas(this.ctx, { creatures: c.bossLoseCreatures }, 'boss');
      }
    } else if (outcome === 'win') {
      this.state.counters.combatsWon++;
      addCoins(this.ctx, c.winCoins, 'combat');
      applyDeltas(this.ctx, { creatures: c.winCreatures }, 'combat');
      first(this.ctx, 'combatWin');
      if(p.creature==='sacZombie'||p.creature==='meduse'||p.creature==='golemPneus'){
        if(this.rng.chance(.5)){
          const eligible=DUEL_GIFTS.filter(id=>itemCount(this.state,id)<ITEMS[id].maxStack);
          if(eligible.length){gift=this.rng.pick(eligible);addItem(this.ctx,gift,1);}
        }
      }else if (this.rng.chance(c.dropChance)) addItem(this.ctx, this.rng.pick(COMBAT_DROPS), 1);
    } else if (outcome === 'draw') {
      this.state.counters.combatsDrawn++;
      addCoins(this.ctx, c.drawCoins, 'combat');
    } else {
      this.state.counters.combatsLost++;
      addCoins(this.ctx, -c.loseCoins, 'combat');
      applyDeltas(this.ctx, { creatures: c.loseCreatures, ...CREATURES[p.creature].loseEffect }, 'combat');
      if (p.creature === 'meduse') record(this.ctx, 'oilSpill', 'atlantic');
    }
    this.bus.emit({ type: 'combatEnded', creature: p.creature, outcome });
    record(this.ctx, 'combat', region, `${p.creature}:${outcome}`);
    return gift;
  }

  resolveTv(answers: readonly QuizAnswer[]): TvResult {
    const p = this.expectPending('tv');
    if (answers.length !== p.questionIds.length) {
      throw new GameRuleError(`Expected ${p.questionIds.length} answers, got ${answers.length}`);
    }
    const result = computeTv(this.era, answers, itemCount(this.state, 'micro') > 0, this.rng);
    addVolunteers(this.ctx, result.volunteers, 'tv');
    addCoins(this.ctx, result.coins, 'tv');
    applyDeltas(this.ctx, { toxicGas: result.gasDelta, localProducts: result.localDelta }, 'tv');
    if (result.sponsorKits > 0) addItem(this.ctx, 'kit', result.sponsorKits);
    this.state.counters.tvShows++;
    this.state.counters.bestAudience = Math.max(this.state.counters.bestAudience, result.audience);
    first(this.ctx, 'tv');
    record(this.ctx, 'tv', undefined, String(result.audience));
    this.finishTile();
    return result;
  }

  // --- Shop & chantiers ----------------------------------------------------------

  shopBuyItem(id: ItemId, confirm = false): PurchaseResult {
    this.expectPending('shop');
    const result = buyItem(this.ctx, id, confirm);
    checkQuests(this.ctx);
    this.sync();
    return result;
  }

  shopBuyProject(id: ProjectId, confirm = false): PurchaseResult {
    this.expectPending('shop');
    const result = buyProject(this.ctx, id, confirm);
    checkQuests(this.ctx);
    this.sync();
    return result;
  }

  leaveShop(): void {
    this.expectPending('shop');
    this.finishTile();
  }

  /** Several chantiers can be built during one visit (docs/18); leave with skipChantier(). */
  buildChantier(id: ChantierId, confirm = false): PurchaseResult {
    this.expectPending('chantier');
    const result = build(this.ctx, id, confirm);
    checkQuests(this.ctx);
    this.sync();
    return result;
  }

  skipChantier(): void {
    this.expectPending('chantier');
    this.finishTile();
  }

  // --- Animals, job, cards, traps ------------------------------------------------

  saveAnimal(method: 'coins' | 'item'): boolean {
    const p = this.expectPending('animal');
    const def = SPECIES.find((s) => s.id === p.species);
    if (!def) throw new GameRuleError('No species to save');
    if (method === 'coins') {
      if (this.state.coins < p.price) return false;
      addCoins(this.ctx, -p.price, 'animal');
    } else {
      if (!def.item || removeItem(this.ctx, def.item, 1) === 0) return false;
    }
    applyDeltas(this.ctx, { biodiversity: BALANCE.animal.biodiversity }, 'animal');
    if (def.bonus) applyDeltas(this.ctx, def.bonus, 'animal');
    saveSpecies(this.ctx, def.id);
    record(this.ctx, 'animal', def.region, def.id);
    this.finishTile();
    return true;
  }

  refuseAnimal(): void {
    const p = this.expectPending('animal');
    applyDeltas(this.ctx, { biodiversity: BALANCE.animal.refusePenalty }, 'animal');
    if (p.species && !this.state.refusedSpecies.includes(p.species)) this.state.refusedSpecies.push(p.species);
    record(this.ctx, 'animalRefused', SPECIES.find((s) => s.id === p.species)?.region, p.species ?? undefined);
    this.finishTile();
  }

  chooseJob(kind: 'classic' | 'eco', bonus: keyof typeof BALANCE.job.ecoBonus = 'energy'): number {
    this.expectPending('job');
    const era = this.era;
    const coins = kind === 'classic' ? BALANCE.job.classic[era] : BALANCE.job.eco[era];
    addCoins(this.ctx, coins, `job:${kind}`);
    if (kind === 'eco') applyDeltas(this.ctx, BALANCE.job.ecoBonus[bonus], 'job');
    this.finishTile();
    return coins;
  }

  answerCard(correct: boolean): void {
    const p = this.expectPending('card');
    resolveCard(this.ctx, p.card, correct);
    this.finishTile();
  }

  answerTrap(correct: boolean): void {
    const p = this.expectPending('trap');
    resolveTrap(this.ctx, p.trap, correct);
    this.finishTile();
  }

  // --- Internals -------------------------------------------------------------------

  private sync(): void {
    this.state.rngState = this.rng.state;
  }

  private finishTile(): void {
    this.state.pending = null;
    this.state.phase = 'yearEnd';
    checkQuests(this.ctx);
    this.sync();
  }

  private expectPhase(phase: Phase): void {
    if (this.state.phase !== phase) throw new GameRuleError(`Expected phase ${phase}, got ${this.state.phase}`);
  }

  private expectPending<K extends PendingAction['kind']>(kind: K): Extract<PendingAction, { kind: K }> {
    const p = this.state.pending;
    if (this.state.phase !== 'resolving' || !p || p.kind !== kind) {
      throw new GameRuleError(`Expected pending ${kind}, got ${p?.kind ?? this.state.phase}`);
    }
    return p as Extract<PendingAction, { kind: K }>;
  }
}
