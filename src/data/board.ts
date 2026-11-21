import type { CreatureId, MinigameId, Region, TileKind } from '../core/types';

export interface TileDef {
  index: number;
  kind: TileKind;
  region?: Region;
  minigame?: MinigameId;
  creature?: CreatureId;
}

const T = (kind: TileKind, extra: Omit<TileDef, 'index' | 'kind'> = {}) => ({ kind, ...extra });

/** Board of 36 tiles (docs/05 "Ordre des cases sur le plateau"). */
export const TILES: readonly TileDef[] = [
  T('start'),
  T('minigame', { minigame: 'astroZiko', region: 'pacific' }),
  T('card'),
  T('cleanup', { region: 'atlantic' }),
  T('job'),
  T('combat', { creature: 'sacZombie', region: 'asia' }),
  T('shop'),
  T('minigame', { minigame: 'triExpress', region: 'europe' }),
  T('trap'),
  T('demo', { region: 'northAmerica' }),
  T('animal', { region: 'poles' }),
  T('card'),
  T('minigame', { minigame: 'filetOcean', region: 'indian' }),
  T('combat', { creature: 'meduse', region: 'atlantic' }),
  T('tv'),
  T('cleanup', { region: 'southAmerica' }),
  T('job'),
  T('trap'),
  T('minigame', { minigame: 'foretEclair', region: 'africa' }),
  T('shop'),
  T('chantier'),
  T('combat', { creature: 'golemPneus', region: 'northAmerica' }),
  T('demo', { region: 'europe' }),
  T('cleanup', { region: 'asia' }),
  T('minigame', { minigame: 'smogBuster', region: 'asia' }),
  T('animal', { region: 'oceania' }),
  T('job'),
  T('trap'),
  T('card'),
  T('combat', { creature: 'smog', region: 'europe' }),
  T('minigame', { minigame: 'veloTurbo', region: 'southAmerica' }),
  T('tv'),
  T('shop'),
  T('demo', { region: 'africa' }),
  T('cleanup', { region: 'poles' }),
  T('chantier'),
].map((t, index) => ({ index, ...t }));

export const OCEAN_REGIONS: ReadonlySet<Region> = new Set<Region>(['pacific', 'atlantic', 'indian', 'poles']);
