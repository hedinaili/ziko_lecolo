export const METRIC_IDS = [
  'lifeExpectancy',
  'marineSurvival',
  'temperature',
  'toxicGas',
  'diseases',
  'creatures',
  'biodiversity',
  'cleanEnergy',
  'localProducts',
] as const;
export type MetricId = (typeof METRIC_IDS)[number];
export type Metrics = Record<MetricId, number>;
export type MetricDeltas = Partial<Record<MetricId, number>>;

export const LEVELS = ['critical', 'alert', 'normal', 'comfortable'] as const;
export type Level = (typeof LEVELS)[number];

export const ERAS = ['child', 'young', 'adult', 'hero'] as const;
export type Era = (typeof ERAS)[number];

export type Region =
  | 'northAmerica'
  | 'southAmerica'
  | 'europe'
  | 'africa'
  | 'asia'
  | 'oceania'
  | 'pacific'
  | 'atlantic'
  | 'indian'
  | 'poles';

export type TileKind =
  | 'start'
  | 'card'
  | 'minigame'
  | 'cleanup'
  | 'combat'
  | 'demo'
  | 'shop'
  | 'trap'
  | 'tv'
  | 'job'
  | 'animal'
  | 'chantier';

export type MinigameId = 'astroZiko' | 'triExpress' | 'filetOcean' | 'foretEclair' | 'smogBuster' | 'veloTurbo';
export type CreatureId = 'sacZombie' | 'golemPneus' | 'meduse' | 'smog' | 'roiOrdures';

export type ItemId =
  | 'mop'
  | 'pince'
  | 'cle'
  | 'eponge'
  | 'aspirateur'
  | 'filet'
  | 'kit'
  | 'velo'
  | 'megaphone'
  | 'micro'
  | 'loupe'
  | 'solar'
  | 'filter'
  | 'seeds'
  | 'medkit';

export type LawId = 'antiPlastic' | 'cleanAir' | 'oceans' | 'cleanPower' | 'climate';
export type ProjectId = 'hospital' | 'forest' | 'sanctuary' | 'recycling' | 'solarPlant';
export type ChantierId =
  | 'potager'
  | 'hotelInsectes'
  | 'nichoirs'
  | 'composteur'
  | 'borne'
  | 'pisteCyclable'
  | 'toitVegetal'
  | 'ruches'
  | 'marcheLocal'
  | 'eolienne'
  | 'reservePlantes'
  | 'reserveAnimaux'
  | 'depollutionRiviere'
  | 'parcEolienMer'
  | 'reserveMondiale'
  | 'reseauBornes'
  | 'barriereOcean';
export type SpeciesId =
  | 'oursPolaire'
  | 'tortueMarine'
  | 'abeille'
  | 'orangOutan'
  | 'baleine'
  | 'koala'
  | 'elephant'
  | 'pandaRoux'
  | 'dauphin'
  | 'gorille';
export type CardId =
  | 'recyclingRain'
  | 'neighbour'
  | 'quizFlash'
  | 'oilSpill'
  | 'finding'
  | 'heatwave'
  | 'newspaper'
  | 'blackout'
  | 'hive'
  | 'wanderingCreature'
  | 'cityPrize'
  | 'shortcut';
export type TrapId = 'greenwashing' | 'solarScam' | 'fakeNews' | 'tornBag' | 'trafficJam' | 'puddle';
export type CatastropheKind = 'storm' | 'flood' | 'eruption' | 'earthquake';
export type Medal = 'none' | 'bronze' | 'silver' | 'gold';
export type QuestId =
  | 'petitJardinier'
  | 'premierNettoyage'
  | 'championEnHerbe'
  | 'roulerPropre'
  | 'laLoiCestNous'
  | 'caGrandit'
  | 'leVentTourne'
  | 'sanctuaire'
  | 'respirerEnfin'
  | 'planeteProtegee'
  | 'tousEnsemble'
  | 'dernierCombat';
