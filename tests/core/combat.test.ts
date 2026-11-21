import { describe, expect, it } from 'vitest';
import { CombatSession, creatureHp, effectiveness, isWeapon, weaponDef, weaponMultiplier, weaponStats } from '../../src/core/combat';

const session = (overrides: Partial<ConstructorParameters<typeof CombatSession>[0]> = {}) =>
  new CombatSession({ creature: 'sacZombie', hp: 3, boss: false, era: 'child', weapons: [], medkits: 0, ...overrides });

describe('combat rules (docs/12)', () => {
  it('computes creature HP from era and creature level', () => {
    expect(creatureHp('child', 6, false)).toBe(3);
    expect(creatureHp('hero', 6, false)).toBe(6);
    expect(creatureHp('adult', 8, false)).toBe(6);
    expect(creatureHp('child', 9, true)).toBe(12);
  });

  it('uses cleaning weapons with matchups (super / normal / weak)', () => {
    expect(effectiveness('pince', 'sacZombie')).toBe('super');
    expect(effectiveness('pince', 'smog')).toBe('weak');
    expect(effectiveness('mop', 'meduse')).toBe('normal');
    expect(weaponMultiplier('cle', 'golemPneus', 'young')).toBe(2.5);
    expect(weaponMultiplier('eponge', 'golemPneus', 'young')).toBe(0.5);
    expect(weaponMultiplier('mop', 'smog', 'hero')).toBe(1.5);
    expect(isWeapon('kit')).toBe(false);
    expect(() => weaponDef('kit')).toThrow();
  });

  it('exposes gauges so the best weapon has the highest impact and efficacy', () => {
    const best = weaponStats('aspirateur', 'smog', 'young');
    const weak = weaponStats('pince', 'smog', 'young');
    const mop = weaponStats('mop', 'smog', 'young');
    expect(best.impact).toBe(100);
    expect(best.efficacy).toBeGreaterThan(mop.efficacy);
    expect(mop.efficacy).toBeGreaterThan(weak.efficacy);
    expect(mop.precision).toBeGreaterThan(best.precision);
    expect(best.damageRange).toEqual([2.5, 5]);
    for (const s of [best, weak, mop]) {
      for (const g of [s.impact, s.efficacy, s.precision]) {
        expect(g).toBeGreaterThanOrEqual(0);
        expect(g).toBeLessThanOrEqual(100);
      }
    }
  });

  it('always offers the mop and ignores non-weapon items', () => {
    const s = session({ weapons: ['pince', 'kit', 'pince'] });
    expect(s.weapons).toEqual(['mop', 'pince']);
    expect(s.weaponOptions().map((o) => o.weapon)).toEqual(['mop', 'pince']);
  });

  it('wins when the creature runs out of HP', () => {
    const s = session({ weapons: ['pince'] });
    expect(s.attack('pince', 'perfect')).toBe(4);
    expect(s.outcome).toBe('win');
    expect(() => s.attack('mop', 'good')).toThrow();
  });

  it('alternates turns and loses when hearts run out', () => {
    const s = session({ hp: 50 });
    expect(() => s.creatureAttack(false)).toThrow();
    s.attack('mop', 'miss');
    expect(() => s.attack('mop', 'good')).toThrow();
    s.creatureAttack(false);
    s.attack('mop', 'good');
    s.creatureAttack(false);
    s.attack('mop', 'good');
    s.creatureAttack(false);
    expect(s.outcome).toBe('lose');
    expect(() => s.creatureAttack(true)).toThrow();
  });

  it('ends in a draw after 5 rounds', () => {
    const s = session({ hp: 50 });
    for (let i = 0; i < 5; i++) {
      s.attack('mop', 'miss');
      s.creatureAttack(true);
    }
    expect(s.outcome).toBe('draw');
  });

  it('heals with medkits, up to the maximum hearts', () => {
    const s = session({ hp: 50, medkits: 2 });
    expect(s.heal()).toBe(false);
    s.attack('mop', 'miss');
    s.creatureAttack(false);
    expect(s.heal()).toBe(true);
    expect(s.hearts).toBe(3);
    expect(s.medkitsUsed).toBe(1);
    expect(() => s.attack('pince', 'good')).toThrow();
    s.creatureAttack(true);
    expect(() => s.attack('pince', 'good')).toThrow();
  });

  it('changes the boss form and weak point at each phase', () => {
    const s = session({ creature: 'roiOrdures', boss: true, hp: 12, weapons: ['pince', 'cle', 'aspirateur'] });
    expect(s.form).toBe('sacZombie');
    expect(s.weakness).toBe('pince');
    s.attack('pince', 'perfect');
    s.creatureAttack(true);
    expect(s.form).toBe('golemPneus');
    expect(s.weakness).toBe('cle');
    s.attack('cle', 'perfect');
    s.creatureAttack(true);
    expect(s.form).toBe('smog');
    expect(s.weakness).toBe('aspirateur');
    s.attack('aspirateur', 'perfect');
    expect(s.outcome).toBe('win');
  });
});
