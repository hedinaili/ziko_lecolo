import type { BackgroundId, Emotion } from './introPanels';

/**
 * Painted illustrations available in public/art (generated with tools/prepare-art.py).
 * Anything missing or not yet loaded falls back to the procedural painting, so the game never breaks.
 */
export const PAINTED_BACKGROUNDS: Readonly<Record<BackgroundId, string>> = {
  garden: 'panel-garden',
  livingRoom: 'panel-livingRoom',
  ocean: 'panel-ocean',
  smogCity: 'panel-smogCity',
  hospital: 'panel-hospital',
  heat: 'panel-heat',
  gasStation: 'panel-gasStation',
  dumpNight: 'panel-dumpNight',
  parkAttack: 'panel-parkAttack',
  endangered: 'panel-endangered',
  disasters: 'panel-disasters',
  bedroom: 'panel-bedroom',
  sprout: 'panel-sprout',
  doorstep: 'panel-doorstep',
  earth: 'panel-earth',
};

export const TITLE_ART = 'title';
export const PAWN_ART = 'ziko-pawn';

export type ZikoArt = 'ziko-happy' | 'ziko-shocked' | 'ziko-sad' | 'ziko-back';
export const ZIKO_ARTS: readonly ZikoArt[] = ['ziko-happy', 'ziko-shocked', 'ziko-sad', 'ziko-back'];

/** Painted Ziko poses; each emotion uses the closest available pose. */
export function zikoArtFor(emotion: Emotion, back = false): ZikoArt {
  if (back) return 'ziko-back';
  switch (emotion) {
    case 'shocked':
    case 'scared':
    case 'angry':
      return 'ziko-shocked';
    case 'sad':
    case 'worried':
      return 'ziko-sad';
    default:
      return 'ziko-happy';
  }
}

/** Loaded before the title screen (small, needed immediately). */
export const CRITICAL_ART: readonly string[] = [TITLE_ART, PAWN_ART, ...ZIKO_ARTS, PAINTED_BACKGROUNDS.garden, PAINTED_BACKGROUNDS.livingRoom];

/** Loaded in the background while the title screen is shown. */
export const DEFERRED_ART: readonly string[] = Object.values(PAINTED_BACKGROUNDS).filter((n) => !CRITICAL_ART.includes(n));

export const ART_FILES: readonly string[] = [...CRITICAL_ART, ...DEFERRED_ART];

export function artUrl(name: string, small: boolean): string {
  return `art/${name}${small ? '@small' : ''}.webp`;
}
