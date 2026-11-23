import type { CreatureId, Era, ItemId, MetricDeltas, ProjectId } from '../core/types';

export type ItemCategory = 'weapon' | 'tool' | 'equipment' | 'passive' | 'consumable';

export interface ItemDef {
  id: ItemId;
  label: string;
  category: ItemCategory;
  /** Shop price (kits are dynamic, see economy). `null` = not sold. */
  price: number | null;
  era: Era;
  maxStack: number;
  /** Creature this weapon is effective against. */
  weakness?: CreatureId;
}

export const ITEMS: Readonly<Record<ItemId, ItemDef>> = {
  brosse: { id:'brosse', label:'Brosse à récurer', category:'weapon', price:null, era:'child', maxStack:99 },
  raclette: { id:'raclette', label:'Raclette de voirie', category:'weapon', price:null, era:'child', maxStack:99 },
  balayette: { id:'balayette', label:'Balayette de poche', category:'weapon', price:null, era:'child', maxStack:99 },
  aimant: { id:'aimant', label:'Aimant de collecte', category:'weapon', price:null, era:'child', maxStack:99 },
  rateau: { id:'rateau', label:'Râteau de plage', category:'weapon', price:null, era:'child', maxStack:99 },
  mop: { id: 'mop', label: 'Serpillière de Ziko', category: 'weapon', price: null, era: 'child', maxStack: 1 },
  pince: { id: 'pince', label: 'Pince à déchets', category: 'weapon', price: 12, era: 'child', maxStack: 99, weakness: 'sacZombie' },
  eponge: { id: 'eponge', label: 'Éponge absorbante', category: 'weapon', price: 15, era: 'child', maxStack: 99, weakness: 'meduse' },
  cle: { id: 'cle', label: 'Clé à recycler', category: 'weapon', price: 15, era: 'young', maxStack: 99, weakness: 'golemPneus' },
  aspirateur: { id: 'aspirateur', label: 'Aspirateur à smog', category: 'weapon', price: 20, era: 'young', maxStack: 99, weakness: 'smog' },
  filet: { id: 'filet', label: 'Filet à déchets', category: 'tool', price: 12, era: 'child', maxStack: 99 },
  kit: { id: 'kit', label: 'Kit de nettoyage', category: 'equipment', price: 8, era: 'child', maxStack: 999 },
  seeds: { id: 'seeds', label: "Graines d'arbres", category: 'consumable', price: 8, era: 'child', maxStack: 999 },
  medkit: { id: 'medkit', label: 'Trousse de soin', category: 'consumable', price: 6, era: 'child', maxStack: 99 },
  loupe: { id: 'loupe', label: 'Loupe anti-greenwashing', category: 'passive', price: 10, era: 'child', maxStack: 1 },
  velo: { id: 'velo', label: 'Vélo', category: 'passive', price: 20, era: 'child', maxStack: 1 },
  megaphone: { id: 'megaphone', label: 'Mégaphone', category: 'passive', price: 15, era: 'young', maxStack: 1 },
  solar: { id: 'solar', label: 'Panneau solaire', category: 'passive', price: 30, era: 'young', maxStack: 5 },
  micro: { id: 'micro', label: 'Micro pro', category: 'passive', price: 20, era: 'adult', maxStack: 1 },
  filter: { id: 'filter', label: 'Filtre à air', category: 'passive', price: 20, era: 'adult', maxStack: 3 },
};

/** Items whose extra copies equip volunteers (docs/10). */
export const LENDABLE_TOOLS: readonly ItemId[] = ['pince', 'eponge', 'cle', 'aspirateur', 'filet'];

export interface ProjectDef {
  id: ProjectId;
  label: string;
  price: number;
  era: Era;
  deltas: MetricDeltas;
  yearlyCoins?: number;
  halvesCreatureGrowth?: boolean;
}

export const PROJECTS: Readonly<Record<ProjectId, ProjectDef>> = {
  hospital: { id: 'hospital', label: 'Hôpital écolo', price: 80, era: 'adult', deltas: { diseases: -8, lifeExpectancy: 4 } },
  forest: { id: 'forest', label: 'Forêt géante', price: 90, era: 'adult', deltas: { toxicGas: -4, temperature: -0.2, biodiversity: 8 } },
  sanctuary: { id: 'sanctuary', label: 'Sanctuaire marin', price: 120, era: 'adult', deltas: { marineSurvival: 250, biodiversity: 5 } },
  recycling: { id: 'recycling', label: 'Usine de recyclage des monstres', price: 110, era: 'hero', deltas: { creatures: -2 }, halvesCreatureGrowth: true },
  solarPlant: { id: 'solarPlant', label: 'Centrale solaire géante', price: 150, era: 'hero', deltas: { cleanEnergy: 20, toxicGas: -4, temperature: -0.2 }, yearlyCoins: 4 },
};
