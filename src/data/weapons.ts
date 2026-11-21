import type { CreatureId, ItemId } from '../core/types';

/** Forms a creature (or a boss phase) can take; drives weapon matchups. */
export type CreatureForm = Exclude<CreatureId, 'roiOrdures'>;

export interface WeaponDef {
  id: ItemId;
  label: string;
  /** What it does, shown in the weapon menu. */
  description: string;
  /** Base damage factor. */
  power: number;
  /** Width of the timing zones (fraction of the bar): larger = easier. */
  precision: { good: number; perfect: number };
  /** ×2 = super efficace, ×0.5 = peu efficace. Missing = ×1. */
  matchups: Partial<Record<CreatureForm, number>>;
}

/** All weapons are cleaning or anti-pollution tools (docs/12). */
export const WEAPONS: Readonly<Partial<Record<ItemId, WeaponDef>>> = {
  mop: {
    id: 'mop',
    label: 'Serpillière',
    description: 'Fidèle et facile à manier. Nettoie un peu tout… sans être spécialiste.',
    power: 1,
    precision: { good: 0.34, perfect: 0.12 },
    matchups: {},
  },
  pince: {
    id: 'pince',
    label: 'Pince à déchets',
    description: 'Attrape et arrache les emballages. Inutile contre un nuage.',
    power: 1,
    precision: { good: 0.28, perfect: 0.1 },
    matchups: { sacZombie: 2, smog: 0.5 },
  },
  cle: {
    id: 'cle',
    label: 'Clé à recycler',
    description: 'Démonte et recycle tout ce qui est mécanique. Glisse sur le pétrole.',
    power: 1.25,
    precision: { good: 0.24, perfect: 0.08 },
    matchups: { golemPneus: 2, meduse: 0.5 },
  },
  eponge: {
    id: 'eponge',
    label: 'Éponge absorbante',
    description: 'Absorbe le pétrole et les liquides. Rebondit sur le caoutchouc.',
    power: 1,
    precision: { good: 0.3, perfect: 0.1 },
    matchups: { meduse: 2, golemPneus: 0.5 },
  },
  aspirateur: {
    id: 'aspirateur',
    label: 'Aspirateur à smog',
    description: 'Aspire les fumées et les gaz. Puissant mais difficile à viser.',
    power: 1.25,
    precision: { good: 0.22, perfect: 0.07 },
    matchups: { smog: 2 },
  },
};

/** Boss phase → form used for matchups (sac → pneu → smog, docs/12). */
export const BOSS_FORMS: readonly CreatureForm[] = ['sacZombie', 'golemPneus', 'smog'];

/** Extra multiplier of the Super-Serpillière (hero era). */
export const HERO_MOP_BONUS = 1.5;
