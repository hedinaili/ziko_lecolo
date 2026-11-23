import { BALANCE, ERA_INDEX } from '../data/balance';
import { CREATURES } from '../data/content';
import { BOSS_FORMS, HERO_MOP_BONUS, WEAPONS, type CreatureForm, type WeaponDef } from '../data/weapons';
import type { CreatureId, Era, ItemId } from './types';

export type Timing = 'miss' | 'good' | 'perfect';
export type CombatOutcome = 'win' | 'draw' | 'lose';
export type Effectiveness = 'super' | 'normal' | 'weak';

const TIMING_DAMAGE: Record<Timing, number> = { miss: 0, good: 1, perfect: 2 };
/** Highest possible multiplier (power 1.25 × super efficace 2), used to scale the "Impact" gauge. */
const MAX_MULTIPLIER = 2.5;

/** docs/12: PV = 3 + era index (+1 if creatures are critical). Boss: 12. */
export function creatureHp(era: Era, creaturesLevel: number, boss: boolean): number {
  if (boss) return BALANCE.combat.bossHp;
  return 3 + ERA_INDEX[era] + (creaturesLevel >= 8 ? 1 : 0);
}

export function weaponDef(id: ItemId): WeaponDef {
  const def = WEAPONS[id];
  if (!def) throw new Error(`Not a weapon: ${id}`);
  return def;
}

export function isWeapon(id: ItemId): boolean {
  return WEAPONS[id] !== undefined;
}

export function matchup(weapon: ItemId, form: CreatureForm): number {
  return weaponDef(weapon).matchups[form] ?? 1;
}

export function effectiveness(weapon: ItemId, form: CreatureForm): Effectiveness {
  const m = matchup(weapon, form);
  if (m > 1) return 'super';
  if (m < 1) return 'weak';
  return 'normal';
}

export function weaknessOf(form: CreatureForm): ItemId | null {
  const weakness=CREATURES[form].weakness;
  return weakness==='all'?null:weakness;
}

export function weaponMultiplier(weapon: ItemId, form: CreatureForm, era: Era): number {
  const def = weaponDef(weapon);
  const heroBonus = weapon === 'mop' && era === 'hero' ? HERO_MOP_BONUS : 1;
  return def.power * matchup(weapon, form) * heroBonus;
}

/** Values shown in the weapon menu gauges (docs/12 "Choix de l'arme"). All gauges are 0..100. */
export interface WeaponStats {
  weapon: ItemId;
  label: string;
  effectiveness: Effectiveness;
  multiplier: number;
  impact: number;
  efficacy: number;
  precision: number;
  damageRange: [number, number];
}

export function weaponStats(weapon: ItemId, form: CreatureForm, era: Era): WeaponStats {
  const def = weaponDef(weapon);
  const multiplier = weaponMultiplier(weapon, form, era);
  const m = matchup(weapon, form);
  return {
    weapon,
    label: def.label,
    effectiveness: effectiveness(weapon, form),
    multiplier,
    impact: Math.round((100 * multiplier) / MAX_MULTIPLIER),
    efficacy: m > 1 ? 100 : m < 1 ? 25 : 60,
    precision: Math.round(100 * def.precision.good / 0.34),
    damageRange: [multiplier * TIMING_DAMAGE.good, multiplier * TIMING_DAMAGE.perfect],
  };
}

export interface CombatOptions {
  creature: CreatureId;
  hp: number;
  boss: boolean;
  era: Era;
  /** Weapons owned (the mop is always available). */
  weapons: ItemId[];
  medkits: number;
}

/** Pure, turn-based combat session driven by the UI or by bots (docs/12). */
export class CombatSession {
  readonly creature: CreatureId;
  readonly boss: boolean;
  readonly maxHp: number;
  readonly era: Era;
  readonly weapons: ItemId[];
  hp: number;
  hearts: number = BALANCE.combat.hearts;
  round = 0;
  medkits: number;
  medkitsUsed = 0;
  outcome: CombatOutcome | null = null;
  /** Whether the player has acted this round and the creature must now attack. */
  awaitingCreature = false;

  constructor(opts: CombatOptions) {
    this.creature = opts.creature;
    this.boss = opts.boss;
    this.maxHp = opts.hp;
    this.hp = opts.hp;
    this.era = opts.era;
    this.medkits = opts.medkits;
    this.weapons = Array.from(new Set<ItemId>(['mop', ...opts.weapons.filter(isWeapon)]));
  }

  /** Boss phases split its HP in three (docs/12). */
  get bossPhase(): number {
    if (!this.boss) return 0;
    const third = this.maxHp / 3;
    if (this.hp > 2 * third) return 0;
    if (this.hp > third) return 1;
    return 2;
  }

  /** Current form of the enemy (the boss changes form at each phase). */
  get form(): CreatureForm {
    if (this.boss) return BOSS_FORMS[this.bossPhase] ?? 'sacZombie';
    return this.creature as CreatureForm;
  }

  /** Stats of every available weapon against the current form, for the selection gauges. */
  weaponOptions(): WeaponStats[] {
    return this.weapons.map((w) => weaponStats(w, this.form, this.era));
  }

  /** Weapon that is "super efficace" against the current form. */
  get weakness(): ItemId | null {
    return weaknessOf(this.form);
  }

  attack(weapon: ItemId, timing: Timing): number {
    this.assertPlayerTurn();
    if (!this.weapons.includes(weapon)) throw new Error(`Weapon not available: ${weapon}`);
    const damage = Math.round(TIMING_DAMAGE[timing] * weaponMultiplier(weapon, this.form, this.era) * 100) / 100;
    this.hp = Math.max(0, Math.round((this.hp - damage) * 100) / 100);
    if (this.hp <= 0) this.outcome = 'win';
    else this.awaitingCreature = true;
    return damage;
  }

  heal(): boolean {
    this.assertPlayerTurn();
    if (this.medkits <= 0 || this.hearts >= BALANCE.combat.hearts) return false;
    this.medkits--;
    this.medkitsUsed++;
    this.hearts++;
    this.awaitingCreature = true;
    return true;
  }

  creatureAttack(dodged: boolean): void {
    if (this.outcome) throw new Error('Combat is over');
    if (!this.awaitingCreature) throw new Error('It is the player turn');
    this.awaitingCreature = false;
    if (!dodged) this.hearts--;
    if (this.hearts <= 0) {
      this.outcome = 'lose';
      return;
    }
    this.round++;
    if (this.round >= BALANCE.combat.maxRounds) this.outcome = 'draw';
  }

  private assertPlayerTurn(): void {
    if (this.outcome) throw new Error('Combat is over');
    if (this.awaitingCreature) throw new Error('Waiting for the creature attack');
  }
}
