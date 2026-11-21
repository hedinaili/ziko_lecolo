import { describe, expect, it } from 'vitest';
import { weaknessOf } from '../../src/core/combat';
import { TILES } from '../../src/data/board';
import { CHANTIERS, CREATURES, LAWS, MINIGAMES, QUESTS, SPECIES } from '../../src/data/content';
import { BOSS_LINES, CREATURE_LINES, headlineTier, TV_HEADLINES, TV_HOSTS } from '../../src/data/dialogues';
import { ITEMS } from '../../src/data/items';
import { QUIZ, quizById } from '../../src/data/quiz';
import { BOSS_FORMS, WEAPONS } from '../../src/data/weapons';
import { eraOfAge } from '../../src/data/balance';

const countKind = (kind: string) => TILES.filter((t) => t.kind === kind).length;

describe('game data consistency', () => {
  it('has the board of docs/05 and docs/18', () => {
    expect(TILES).toHaveLength(36);
    expect(TILES.map((t) => t.index)).toEqual(Array.from({ length: 36 }, (_, i) => i));
    expect({
      start: countKind('start'),
      card: countKind('card'),
      minigame: countKind('minigame'),
      cleanup: countKind('cleanup'),
      combat: countKind('combat'),
      demo: countKind('demo'),
      shop: countKind('shop'),
      trap: countKind('trap'),
      tv: countKind('tv'),
      job: countKind('job'),
      animal: countKind('animal'),
      chantier: countKind('chantier'),
    }).toEqual({ start: 1, card: 3, minigame: 6, cleanup: 4, combat: 4, demo: 3, shop: 3, trap: 3, tv: 2, job: 3, animal: 2, chantier: 2 });
    expect(new Set(TILES.filter((t) => t.kind === 'minigame').map((t) => t.minigame)).size).toBe(6);
    for (const t of TILES.filter((x) => x.kind === 'combat')) expect(t.creature).toBeDefined();
  });

  it('maps ages to eras (docs/01)', () => {
    expect([10, 17, 18, 29, 30, 41, 42, 49].map(eraOfAge)).toEqual(['child', 'child', 'young', 'young', 'adult', 'adult', 'hero', 'hero']);
  });

  it('keeps creature weak points consistent with the weapon table', () => {
    for (const id of ['sacZombie', 'golemPneus', 'meduse', 'smog'] as const) {
      expect(weaknessOf(id)).toBe(CREATURES[id].weakness);
    }
    expect(BOSS_FORMS).toEqual(['sacZombie', 'golemPneus', 'smog']);
    for (const w of Object.values(WEAPONS)) expect(ITEMS[w!.id].category).toBe('weapon');
  });

  it('has at least 4 chantiers and exactly 3 quests per era', () => {
    expect(CHANTIERS.find((c) => c.id === 'marcheLocal')?.era).toBe('young');
    for (const era of ['child', 'young', 'adult', 'hero'] as const) {
      expect(CHANTIERS.filter((c) => c.era === era).length).toBeGreaterThanOrEqual(4);
      expect(QUESTS.filter((q) => q.era === era)).toHaveLength(3);
    }
  });

  it('has 10 species, 5 laws in increasing thresholds and 6 mini-games', () => {
    expect(SPECIES).toHaveLength(10);
    expect(LAWS.map((l) => l.threshold)).toEqual([50, 200, 1000, 2500, 5000]);
    expect(Object.keys(MINIGAMES)).toHaveLength(6);
  });

  it('has a quiz bank with unique ids, distinct answers and enough questions per era (docs/19)', () => {
    expect(new Set(QUIZ.map((q) => q.id)).size).toBe(QUIZ.length);
    for (const era of ['child', 'young', 'adult', 'hero'] as const) {
      expect(QUIZ.filter((q) => q.era === era).length).toBeGreaterThanOrEqual(6);
    }
    for (const q of QUIZ) {
      expect(new Set([q.correct, q.wrong, q.absurd]).size).toBe(3);
      expect(q.question.endsWith('?')).toBe(true);
    }
    expect(quizById('verre')?.era).toBe('child');
    expect(quizById('nope')).toBeUndefined();
  });

  it('has funny lines for every creature, the boss and the TV shows', () => {
    for (const lines of Object.values(CREATURE_LINES)) {
      for (const list of Object.values(lines)) expect(list.length).toBeGreaterThan(0);
    }
    for (const line of Object.values(BOSS_LINES)) expect(line.length).toBeGreaterThan(10);
    expect(Object.keys(TV_HOSTS)).toEqual(['child', 'young', 'adult', 'hero']);
    expect([headlineTier(1), headlineTier(0.7), headlineTier(0.4), headlineTier(0)]).toEqual(['excellent', 'good', 'average', 'low']);
    expect(TV_HEADLINES.bonus.length).toBeGreaterThan(0);
  });
});
