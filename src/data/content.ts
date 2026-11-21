import type {
  CardId,
  ChantierId,
  CreatureId,
  Era,
  ItemId,
  LawId,
  MetricDeltas,
  MinigameId,
  QuestId,
  Region,
  SpeciesId,
  TrapId,
} from '../core/types';

export interface CreatureDef {
  id: CreatureId;
  label: string;
  region: Region | 'world';
  weakness: ItemId | 'all';
  loseEffect: MetricDeltas;
}

export const CREATURES: Readonly<Record<CreatureId, CreatureDef>> = {
  sacZombie: { id: 'sacZombie', label: 'Sac-Zombie', region: 'asia', weakness: 'pince', loseEffect: { marineSurvival: -10 } },
  golemPneus: { id: 'golemPneus', label: 'Golem de pneus', region: 'northAmerica', weakness: 'cle', loseEffect: { toxicGas: 1 } },
  meduse: { id: 'meduse', label: 'Méduse de pétrole', region: 'atlantic', weakness: 'eponge', loseEffect: { marineSurvival: -15 } },
  smog: { id: 'smog', label: 'Nuage de smog', region: 'europe', weakness: 'aspirateur', loseEffect: { diseases: 1 } },
  roiOrdures: { id: 'roiOrdures', label: 'Roi des Ordures', region: 'world', weakness: 'all', loseEffect: {} },
};

/** Boss phases and their weak point (docs/12). */
export const BOSS_PHASES: readonly ItemId[] = ['pince', 'cle', 'aspirateur'];

export interface LawDef {
  id: LawId;
  label: string;
  threshold: number;
  minEra: Era;
}

/** Laws are passed in this order (docs/05). */
export const LAWS: readonly LawDef[] = [
  { id: 'antiPlastic', label: 'Loi anti-plastique', threshold: 50, minEra: 'child' },
  { id: 'cleanAir', label: 'Loi air pur', threshold: 200, minEra: 'young' },
  { id: 'oceans', label: 'Loi protection des océans', threshold: 1000, minEra: 'young' },
  { id: 'cleanPower', label: 'Loi sur les centrales propres', threshold: 2500, minEra: 'adult' },
  { id: 'climate', label: 'Accord mondial pour le climat', threshold: 5000, minEra: 'hero' },
];

export interface SpeciesDef {
  id: SpeciesId;
  label: string;
  region: Region;
  /** Item that can replace the coin payment (consumed). */
  item?: ItemId;
  bonus?: MetricDeltas;
}

export const SPECIES: readonly SpeciesDef[] = [
  { id: 'oursPolaire', label: 'Ours polaire', region: 'poles' },
  { id: 'tortueMarine', label: 'Tortue marine', region: 'oceania', item: 'filet', bonus: { marineSurvival: 20 } },
  { id: 'abeille', label: 'Abeille', region: 'europe', item: 'seeds', bonus: { biodiversity: 2 } },
  { id: 'orangOutan', label: 'Orang-outan', region: 'asia', item: 'seeds' },
  { id: 'baleine', label: 'Baleine', region: 'pacific', item: 'filet', bonus: { marineSurvival: 10 } },
  { id: 'koala', label: 'Koala', region: 'oceania' },
  { id: 'elephant', label: 'Éléphant', region: 'africa' },
  { id: 'pandaRoux', label: 'Panda roux', region: 'asia' },
  { id: 'dauphin', label: 'Dauphin', region: 'atlantic', item: 'filet' },
  { id: 'gorille', label: 'Gorille', region: 'africa' },
];

export interface MinigameDef {
  id: MinigameId;
  label: string;
  silver: MetricDeltas;
  gold: MetricDeltas;
}

export const MINIGAMES: Readonly<Record<MinigameId, MinigameDef>> = {
  astroZiko: { id: 'astroZiko', label: 'Astro-Ziko', silver: { marineSurvival: 10 }, gold: { marineSurvival: 20 } },
  triExpress: { id: 'triExpress', label: 'Tri Express', silver: { toxicGas: -0.6 }, gold: { toxicGas: -1.2 } },
  filetOcean: { id: 'filetOcean', label: 'Filet Océan', silver: { marineSurvival: 10 }, gold: { marineSurvival: 20 } },
  foretEclair: { id: 'foretEclair', label: 'Forêt Éclair', silver: { biodiversity: 2 }, gold: { biodiversity: 4 } },
  smogBuster: { id: 'smogBuster', label: 'Smog Buster', silver: { toxicGas: -0.6, diseases: -0.6 }, gold: { toxicGas: -1.2, diseases: -1 } },
  veloTurbo: { id: 'veloTurbo', label: 'Vélo Turbo', silver: { cleanEnergy: 1 }, gold: { cleanEnergy: 2 } },
};

export interface ChantierDef {
  id: ChantierId;
  label: string;
  era: Era;
  price: number;
  minVolunteers: number;
  deltas: MetricDeltas;
  yearlyCoins?: number;
  savesSpecies?: boolean;
  isReserve?: boolean;
}

/** Green building sites unlocked by age (docs/18). */
export const CHANTIERS: readonly ChantierDef[] = [
  { id: 'potager', label: "Potager de l'école", era: 'child', price: 5, minVolunteers: 0, deltas: { biodiversity: 1, diseases: -0.5 } },
  { id: 'hotelInsectes', label: 'Hôtel à insectes', era: 'child', price: 4, minVolunteers: 0, deltas: { biodiversity: 1.5 } },
  { id: 'nichoirs', label: 'Nichoirs à oiseaux', era: 'child', price: 4, minVolunteers: 0, deltas: { biodiversity: 1 } },
  { id: 'composteur', label: 'Composteur de quartier', era: 'child', price: 6, minVolunteers: 0, deltas: { toxicGas: -0.3, creatures: -0.25 } },
  { id: 'borne', label: 'Borne de recharge pour véhicules électriques', era: 'young', price: 15, minVolunteers: 0, deltas: { toxicGas: -0.8, cleanEnergy: 1, diseases: -0.3 }, yearlyCoins: 1 },
  { id: 'pisteCyclable', label: 'Piste cyclable', era: 'young', price: 12, minVolunteers: 10, deltas: { toxicGas: -0.6, lifeExpectancy: 0.3 } },
  { id: 'toitVegetal', label: 'Toit végétalisé', era: 'young', price: 10, minVolunteers: 0, deltas: { temperature: -0.02, biodiversity: 1 } },
  { id: 'ruches', label: 'Ruches', era: 'young', price: 8, minVolunteers: 0, deltas: { biodiversity: 2 } },
  { id: 'marcheLocal', label: 'Marché de producteurs locaux', era: 'young', price: 10, minVolunteers: 0, deltas: { localProducts: 3, toxicGas: -0.2 } },
  { id: 'eolienne', label: 'Éolienne', era: 'adult', price: 30, minVolunteers: 0, deltas: { cleanEnergy: 3, toxicGas: -1 }, yearlyCoins: 1 },
  { id: 'reservePlantes', label: 'Réserve naturelle de plantes', era: 'adult', price: 35, minVolunteers: 50, deltas: { biodiversity: 5, toxicGas: -1 }, isReserve: true },
  { id: 'reserveAnimaux', label: "Réserve naturelle d'animaux", era: 'adult', price: 40, minVolunteers: 50, deltas: { biodiversity: 4 }, savesSpecies: true, isReserve: true },
  { id: 'depollutionRiviere', label: 'Dépollution de rivière', era: 'adult', price: 30, minVolunteers: 20, deltas: { marineSurvival: 30, diseases: -1 } },
  { id: 'parcEolienMer', label: 'Parc éolien en mer', era: 'hero', price: 60, minVolunteers: 0, deltas: { cleanEnergy: 8, toxicGas: -2 }, yearlyCoins: 2 },
  { id: 'reserveMondiale', label: 'Réserve naturelle mondiale', era: 'hero', price: 70, minVolunteers: 500, deltas: { biodiversity: 8, marineSurvival: 50 }, isReserve: true },
  { id: 'reseauBornes', label: 'Réseau national de bornes de recharge', era: 'hero', price: 50, minVolunteers: 0, deltas: { toxicGas: -2.5, cleanEnergy: 3 } },
  { id: 'barriereOcean', label: 'Barrière anti-plastique océanique', era: 'hero', price: 60, minVolunteers: 200, deltas: { marineSurvival: 80, creatures: -1 } },
];

export interface QuestDef {
  id: QuestId;
  era: Era;
  label: string;
  goal: string;
  target: number;
  reward: { coins: number; volunteers: number };
}

export const QUESTS: readonly QuestDef[] = [
  { id: 'petitJardinier', era: 'child', label: 'Petit jardinier', goal: 'Construire 2 chantiers verts', target: 2, reward: { coins: 8, volunteers: 0 } },
  { id: 'premierNettoyage', era: 'child', label: 'Premier nettoyage', goal: 'Faire 2 nettoyages', target: 2, reward: { coins: 8, volunteers: 3 } },
  { id: 'championEnHerbe', era: 'child', label: 'Champion en herbe', goal: 'Gagner une médaille dans un mini-jeu', target: 1, reward: { coins: 8, volunteers: 0 } },
  { id: 'roulerPropre', era: 'young', label: 'Rouler propre', goal: 'Installer 2 bornes de recharge', target: 2, reward: { coins: 10, volunteers: 0 } },
  { id: 'laLoiCestNous', era: 'young', label: "La loi, c'est nous", goal: 'Faire voter la loi anti-plastique', target: 1, reward: { coins: 10, volunteers: 10 } },
  { id: 'caGrandit', era: 'young', label: 'Ça grandit !', goal: 'Atteindre 100 bénévoles', target: 100, reward: { coins: 10, volunteers: 0 } },
  { id: 'leVentTourne', era: 'adult', label: 'Le vent tourne', goal: 'Construire 2 éoliennes', target: 2, reward: { coins: 12, volunteers: 0 } },
  { id: 'sanctuaire', era: 'adult', label: 'Sanctuaire', goal: 'Créer une réserve naturelle', target: 1, reward: { coins: 12, volunteers: 0 } },
  { id: 'respirerEnfin', era: 'adult', label: 'Respirer enfin', goal: 'Faire passer les gaz toxiques sous 35 %', target: 1, reward: { coins: 12, volunteers: 0 } },
  { id: 'planeteProtegee', era: 'hero', label: 'Planète protégée', goal: 'Créer une réserve naturelle mondiale', target: 1, reward: { coins: 15, volunteers: 0 } },
  { id: 'tousEnsemble', era: 'hero', label: 'Tous ensemble', goal: "Faire voter l'Accord mondial pour le climat", target: 1, reward: { coins: 15, volunteers: 0 } },
  { id: 'dernierCombat', era: 'hero', label: 'Le dernier combat', goal: 'Vaincre le Roi des Ordures ou empêcher sa naissance', target: 1, reward: { coins: 15, volunteers: 0 } },
];

export const CARDS: readonly CardId[] = [
  'recyclingRain',
  'neighbour',
  'quizFlash',
  'oilSpill',
  'finding',
  'heatwave',
  'newspaper',
  'blackout',
  'hive',
  'wanderingCreature',
  'cityPrize',
  'shortcut',
];

export const TRAPS: readonly TrapId[] = ['greenwashing', 'solarScam', 'fakeNews', 'tornBag', 'trafficJam', 'puddle'];
