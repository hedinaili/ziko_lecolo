import type { QuizAnswer } from '../core/activities';
import { availableChantiers, chantierPrice, checkChantier } from '../core/chantiers';
import { CombatSession, type Timing } from '../core/combat';
import { reserveForNextYear, shopCatalog } from '../core/economy';
import { Game } from '../core/game';
import { Rng } from '../core/rng';
import { ending, stars } from '../core/score';
import { itemCount } from '../core/state';
import type { ItemId, ProjectId } from '../core/types';

export type BotProfile = 'passive' | 'average' | 'expert' | 'random';
export const BOT_PROFILES: readonly BotProfile[] = ['passive', 'average', 'expert', 'random'];

interface Skill {
  minigame: [number, number];
  timing: { perfect: number; good: number };
  dodge: number;
  quiz: number;
  smartWeapons: boolean;
  shops: boolean;
  builds: boolean;
  savesAnimals: boolean;
  ecoJobs: boolean;
}

const SKILLS: Record<BotProfile, Skill> = {
  passive: { minigame: [0.1, 0.5], timing: { perfect: 0.05, good: 0.4 }, dodge: 0.3, quiz: 0.4, smartWeapons: false, shops: false, builds: false, savesAnimals: false, ecoJobs: false },
  average: { minigame: [0.35, 0.85], timing: { perfect: 0.2, good: 0.5 }, dodge: 0.55, quiz: 0.65, smartWeapons: true, shops: true, builds: true, savesAnimals: true, ecoJobs: false },
  expert: { minigame: [0.7, 1], timing: { perfect: 0.5, good: 0.4 }, dodge: 0.8, quiz: 0.9, smartWeapons: true, shops: true, builds: true, savesAnimals: true, ecoJobs: true },
  random: { minigame: [0, 1], timing: { perfect: 0.2, good: 0.4 }, dodge: 0.5, quiz: 0.5, smartWeapons: false, shops: true, builds: true, savesAnimals: true, ecoJobs: false },
};

const COMBAT_TOOLS: readonly ItemId[] = ['pince', 'eponge', 'cle', 'aspirateur'];

export interface GameSummary {
  seed: number;
  profile: BotProfile;
  ended: 'time' | 'bankrupt' | null;
  turns: number;
  steps: number;
  coins: number;
  estimatedYear: number;
  quality: number;
  stars: number;
  ending: string;
  laws: number;
  projects: number;
  species: number;
  volunteers: number;
  chantiers: number;
  quests: number;
  minigames: number;
  combats: number;
  tvShows: number;
  shopVisits: number;
  milestoneScenes: number;
  grandmaLoan: boolean;
}

export interface PlayOptions {
  /** Called after every engine action (used by integration tests to check invariants). */
  onStep?: (game: Game) => void;
  maxSteps?: number;
}

/** Bot decisions use their own RNG so the game RNG stays a pure function of the seed and the choices. */
export class Bot {
  private readonly rng: Rng;
  private readonly skill: Skill;

  constructor(
    readonly profile: BotProfile,
    seed: number,
  ) {
    this.rng = new Rng(seed ^ 0x5bd1e995);
    this.skill = SKILLS[profile];
  }

  /** Lets tests resume a bot exactly where it was (save/load checks). */
  get rngState(): number {
    return this.rng.state;
  }
  set rngState(value: number) {
    this.rng.state = value;
  }

  private timing(): Timing {
    const r = this.rng.next();
    if (r < this.skill.timing.perfect) return 'perfect';
    if (r < this.skill.timing.perfect + this.skill.timing.good) return 'good';
    return 'miss';
  }

  private fight(game: Game): void {
    const p = game.pending;
    if (p?.kind !== 'combat') return;
    const weapons = (Object.keys(game.state.inventory) as ItemId[]).filter((id) => itemCount(game.state, id) > 0);
    const s = new CombatSession({ creature: p.creature, hp: p.hp, boss: p.boss, era: game.era, weapons, medkits: itemCount(game.state, 'medkit') });
    while (!s.outcome) {
      if (s.hearts === 1 && s.medkits > 0) s.heal();
      else {
        const options = s.weaponOptions();
        const choice = this.skill.smartWeapons ? [...options].sort((a, b) => b.multiplier - a.multiplier)[0] : this.rng.pick(options);
        if (!choice) throw new Error('No weapon available');
        s.attack(choice.weapon, this.timing());
      }
      if (!s.outcome) s.creatureAttack(this.rng.chance(this.skill.dodge));
    }
    game.resolveCombat(s.outcome, s.medkitsUsed);
  }

  private shop(game: Game): void {
    if (!this.skill.shops) return game.leaveShop();
    const state = game.state;
    const reserve = () => reserveForNextYear(state) + 12;
    const { items, projects } = shopCatalog(state);
    if (this.profile === 'random') {
      for (let i = 0; i < 3; i++) if (this.rng.chance(0.5)) game.shopBuyItem(this.rng.pick(items), true);
      return game.leaveShop();
    }
    const projectOrder: ProjectId[] = ['sanctuary', 'forest', 'solarPlant', 'hospital', 'recycling'];
    const projectAge = this.profile === 'expert' ? 30 : 38;
    if (game.age >= projectAge) for (const id of projectOrder) if (projects.includes(id)) game.shopBuyProject(id);
    const solarFirst: ItemId[] = this.profile === 'expert' ? ['solar', 'solar'] : [];
    const wishlist: ItemId[] = [...solarFirst, 'velo', 'loupe', 'pince', 'eponge', 'megaphone', 'solar', 'cle', 'aspirateur', 'micro', 'filter', 'medkit', 'seeds'];
    for (const id of wishlist) {
      if (!items.includes(id)) continue;
      if (COMBAT_TOOLS.includes(id) && itemCount(state, id) > 0) continue;
      if (id === 'solar' && game.age >= 36) continue;
      if (state.coins - reserve() < 25 && game.age < 42) break;
      game.shopBuyItem(id);
    }
    while (state.volunteers > 1 + 10 * itemCount(state, 'kit') && state.coins > reserve() + 15) {
      if (!game.shopBuyItem('kit').ok) break;
    }
    // Coins kept at the end are worth nothing (docs/14): spend them on trees late in the game.
    if (game.age >= 40) while (state.coins - 8 >= reserve() && game.shopBuyItem('seeds').ok);
    game.leaveShop();
  }

  private chantier(game: Game): void {
    if (!this.skill.builds) return game.skipChantier();
    const state = game.state;
    for (let i = 0; i < 6; i++) {
      const options = availableChantiers(state)
        .filter((c) => checkChantier(state, c.id).ok)
        .sort((a, b) => b.price - a.price);
      const pick =
        this.profile === 'random'
          ? options.length > 0 && this.rng.chance(0.6)
            ? this.rng.pick(options)
            : undefined
          : options.find((c) => state.coins - chantierPrice(state, c.id) > reserveForNextYear(state) + 12);
      if (!pick || !game.buildChantier(pick.id).ok) break;
    }
    game.skipChantier();
  }

  private answers(count: number): QuizAnswer[] {
    return Array.from({ length: count }, () => (this.rng.chance(this.skill.quiz) ? 'correct' : this.rng.chance(0.5) ? 'absurd' : 'wrong'));
  }

  /** Plays one engine action. */
  step(game: Game): void {
    const state = game.state;
    if (game.phase === 'awaitRoll') {
      if (itemCount(state, 'seeds') > 0 && this.profile !== 'passive') game.plantSeed();
      else game.roll({ useBike: true });
      return;
    }
    if (game.phase === 'yearEnd') {
      game.endYear();
      return;
    }
    const p = game.pending;
    switch (p?.kind) {
      case 'minigame':
        game.resolveMinigame(this.rng.range(this.skill.minigame[0], this.skill.minigame[1]));
        return;
      case 'combat':
        this.fight(game);
        return;
      case 'tv':
        game.resolveTv(this.answers(p.questionIds.length));
        return;
      case 'shop':
        this.shop(game);
        return;
      case 'chantier':
        this.chantier(game);
        return;
      case 'animal': {
        const canPay = state.coins - p.price >= reserveForNextYear(state) + 5;
        if (this.skill.savesAnimals && (game.saveAnimal('item') || (canPay && game.saveAnimal('coins')))) return;
        game.refuseAnimal();
        return;
      }
      case 'job':
        game.chooseJob(this.skill.ecoJobs ? 'eco' : 'classic', 'energy');
        return;
      case 'card':
        game.answerCard(this.rng.chance(this.skill.quiz));
        return;
      case 'trap':
        game.answerTrap(this.rng.chance(this.skill.quiz));
        return;
      default:
        throw new Error(`Bot stuck in phase ${game.phase}`);
    }
  }
}

export function playGame(seed: number, profile: BotProfile, opts: PlayOptions = {}): { game: Game; summary: GameSummary } {
  const game = Game.create(seed);
  const bot = new Bot(profile, seed);
  let scenes = 0;
  let shopVisits = 0;
  game.bus.on((e) => {
    if (e.type === 'milestone' && e.size !== 'small') scenes++;
  });
  const maxSteps = opts.maxSteps ?? 2000;
  let steps = 0;
  while (game.phase !== 'ended') {
    if (++steps > maxSteps) throw new Error(`Game ${seed} (${profile}) did not end within ${maxSteps} steps`);
    if (game.pending?.kind === 'shop') shopVisits++;
    bot.step(game);
    opts.onStep?.(game);
  }
  const s = game.state;
  return {
    game,
    summary: {
      seed,
      profile,
      ended: s.ended,
      turns: s.turn,
      steps,
      coins: s.coins,
      estimatedYear: game.estimatedYear,
      quality: Math.round(game.quality * 10) / 10,
      stars: stars(game.quality),
      ending: ending(game.estimatedYear, game.quality, 2540).id,
      laws: s.laws.length,
      projects: s.projects.length,
      species: s.savedSpecies.length,
      volunteers: s.volunteers,
      chantiers: s.counters.chantiers,
      quests: s.quests.completed.length,
      minigames: s.history.filter((h) => h.kind === 'minigame').length,
      combats: s.counters.combatsWon + s.counters.combatsLost + s.counters.combatsDrawn,
      tvShows: s.counters.tvShows,
      shopVisits,
      milestoneScenes: scenes,
      grandmaLoan: s.grandmaLoanUsed,
    },
  };
}
