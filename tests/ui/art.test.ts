import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ART_FILES, artUrl, boardLook, CRITICAL_ART, DEFERRED_ART, PAINTED_BACKGROUNDS, zikoArtFor } from '../../src/data/art';
import { INTRO_PANELS } from '../../src/data/introPanels';

describe('painted art manifest', () => {
  it('switches both board illustrations together at each age boundary', () => {
    const looks = [10, 18, 30, 42].map(boardLook);
    expect([17, 29, 41, 50].map(boardLook)).toEqual(looks);
    for (const part of ['avatar', 'pawn'] as const) {
      expect(new Set(looks.map(look => look[part])).size).toBe(4);
      for (const look of looks) expect(ART_FILES).toContain(look[part]);
    }
  });
  it('ships every listed illustration in both sizes', () => {
    for (const name of ART_FILES) {
      for (const small of [false, true]) {
        expect(existsSync(resolve('public', artUrl(name, small))), artUrl(name, small)).toBe(true);
      }
    }
  });

  it('has a painted background for every intro panel', () => {
    for (const p of INTRO_PANELS) expect(ART_FILES).toContain(PAINTED_BACKGROUNDS[p.background]);
  });

  it('loads the first panels before the title and the rest in the background, without duplicates', () => {
    expect(CRITICAL_ART).toContain('title');
    expect(CRITICAL_ART).toContain(PAINTED_BACKGROUNDS[INTRO_PANELS[0]!.background]);
    expect(new Set(ART_FILES).size).toBe(ART_FILES.length);
    for (const name of DEFERRED_ART) expect(CRITICAL_ART).not.toContain(name);
  });

  it('maps every emotion to a painted Ziko pose', () => {
    expect(zikoArtFor('joyful')).toBe('ziko-happy');
    expect(zikoArtFor('determined')).toBe('ziko-happy');
    expect(zikoArtFor('shocked')).toBe('ziko-shocked');
    expect(zikoArtFor('sad')).toBe('ziko-sad');
    expect(zikoArtFor('determined', true)).toBe('ziko-back');
    for (const p of INTRO_PANELS) expect(ART_FILES).toContain(zikoArtFor(p.emotion, p.back));
  });

  it('builds small-screen URLs', () => {
    expect(artUrl('title', false)).toBe('art/title.webp');
    expect(artUrl('title', true)).toBe('art/title@small.webp');
  });

  it('keeps Ziko serious from the TV alert through the sleepless night', () => {
    for (const panel of INTRO_PANELS.filter(p => p.id >= 2 && p.id <= 12)) {
      expect(['ziko-shocked', 'ziko-sad'], panel.background).toContain(zikoArtFor(panel.emotion, panel.back));
    }
  });
});
