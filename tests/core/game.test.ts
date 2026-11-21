import { describe, expect, it } from 'vitest';
import { Game, GameRuleError } from '../../src/core/game';
import { BALANCE } from '../../src/data/balance';
import type { GameEvent } from '../../src/core/events';

function gameAt(tileIndex: number, seed = 1): Game {
  const g = Game.create(seed);
  g.state.position = (tileIndex - 1 + 36) % 36;
  g.roll({ forcedDie: 1 });
  return g;
}

describe('Game flow', () => {
  it('starts in 2500 with Ziko aged 10 and 50 coins', () => {
    const g = Game.create(1);
    expect([g.year, g.age, g.era, g.state.coins, g.estimatedYear]).toEqual([2500, 10, 'child', 50, 2800]);
    expect(g.availableActions()).toEqual(['roll']);
    expect(g.quality).toBeCloseTo(30.1, 0);
  });

  it('rolls, resolves and ends the year', () => {
    const g = Game.create(1);
    const roll = g.roll({ forcedDie: 3 });
    expect(roll).toMatchObject({ die: 3, steps: 3, to: 3, pending: null });
    expect(g.phase).toBe('yearEnd');
    expect(g.availableActions()).toEqual(['endYear']);
    g.endYear();
    expect(g.phase).toBe('awaitRoll');
    expect(g.year).toBe(2501);
  });

  it('rejects actions in the wrong phase (no impossible state)', () => {
    const g = Game.create(1);
    expect(() => g.endYear()).toThrow(GameRuleError);
    expect(() => g.leaveShop()).toThrow(GameRuleError);
    expect(() => g.roll({ forcedDie: 7 })).toThrow(GameRuleError);
    g.roll({ forcedDie: 3 });
    expect(() => g.roll()).toThrow(GameRuleError);
  });

  it('uses the bike for +1 only when owned', () => {
    const g = Game.create(1);
    expect(g.roll({ forcedDie: 2, useBike: true }).steps).toBe(2);
    const h = Game.create(1);
    h.state.inventory.velo = 1;
    expect(h.roll({ forcedDie: 2, useBike: true }).steps).toBe(3);
  });

  it('emits events through the bus', () => {
    const g = Game.create(1);
    const events: GameEvent[] = [];
    const off = g.bus.on((e) => events.push(e));
    g.roll({ forcedDie: 3 });
    expect(events.some((e) => e.type === 'metricChanged')).toBe(true);
    off();
    expect(g.bus.size).toBe(0);
  });

  it('resolves a mini-game with medal coins and gold gifts', () => {
    const g = gameAt(1);
    expect(g.availableActions()).toEqual(['resolveMinigame']);
    expect(g.resolveMinigame(0.95)).toEqual({ medal: 'gold', coins: 20 });
    expect(g.state.counters.golds).toBe(1);
    expect((g.state.inventory.kit ?? 0) + (g.state.inventory.seeds ?? 0)).toBe(1);
    expect(g.state.metrics.marineSurvival).toBe(320);
    expect(g.phase).toBe('yearEnd');
  });

  it('resolves combats: win, draw, loss, and the boss', () => {
    const win = gameAt(5);
    win.resolveCombat('win');
    expect(win.state.coins).toBe(58);
    expect(win.state.metrics.creatures).toBe(6 + BALANCE.combat.winCreatures);

    const draw = gameAt(5);
    draw.resolveCombat('draw');
    expect(draw.state.coins).toBe(52);

    const lose = gameAt(13);
    lose.state.inventory.medkit = 2;
    lose.resolveCombat('lose', 1);
    expect(lose.state.coins).toBe(45);
    expect(lose.state.metrics.marineSurvival).toBe(285);
    expect(lose.state.inventory.medkit).toBe(1);

    const boss = Game.create(1);
    boss.state.turn = 36;
    boss.state.position = 4;
    boss.roll({ forcedDie: 1 });
    expect(boss.pending).toMatchObject({ boss: true });
    boss.resolveCombat('win');
    expect(boss.state.metrics.creatures).toBe(3);
    expect(boss.state.counters.bossDefeated).toBe(1);
    expect(boss.state.bossDone).toBe(true);

    const bossLose = Game.create(1);
    bossLose.state.turn = 36;
    bossLose.state.position = 4;
    bossLose.roll({ forcedDie: 1 });
    bossLose.resolveCombat('lose');
    expect(bossLose.state.metrics.creatures).toBe(7);
  });

  it('runs a TV interview and checks the number of answers', () => {
    const g = gameAt(14);
    expect(() => g.resolveTv(['correct'])).toThrow(GameRuleError);
    const r = g.resolveTv(['correct', 'correct', 'correct']);
    expect(r.audience).toBeGreaterThan(10_000);
    expect(g.state.counters.bestAudience).toBe(r.audience);
    expect(g.state.inventory.kit).toBe(2);
  });

  it('lets the player shop several times then leave', () => {
    const g = gameAt(6);
    expect(g.shopBuyItem('pince').ok).toBe(true);
    expect(g.shopBuyItem('kit').ok).toBe(true);
    expect(g.shopBuyProject('forest')).toMatchObject({ ok: false, reason: 'locked' });
    expect(g.phase).toBe('resolving');
    g.leaveShop();
    expect(g.phase).toBe('yearEnd');
  });

  it('builds several chantiers during one visit, then leaves', () => {
    const g = gameAt(20);
    expect(g.buildChantier('borne')).toMatchObject({ ok: false, reason: 'locked' });
    expect(g.phase).toBe('resolving');
    expect(g.buildChantier('potager').ok).toBe(true);
    expect(g.buildChantier('nichoirs').ok).toBe(true);
    expect(g.phase).toBe('resolving');
    expect(g.state.counters.chantiers).toBe(2);
    g.skipChantier();
    expect(g.phase).toBe('yearEnd');
    const h = gameAt(20);
    h.skipChantier();
    expect(h.phase).toBe('yearEnd');
  });

  it('saves or refuses animals', () => {
    const g = gameAt(10);
    expect(g.saveAnimal('item')).toBe(false);
    expect(g.saveAnimal('coins')).toBe(true);
    expect(g.state.savedSpecies).toHaveLength(1);

    const poor = gameAt(10);
    poor.state.coins = 0;
    expect(poor.saveAnimal('coins')).toBe(false);
    poor.refuseAnimal();
    expect(poor.state.refusedSpecies).toHaveLength(1);

    const turtle = gameAt(25, 3);
    const p = turtle.pending;
    if (p?.kind === 'animal' && p.species === 'tortueMarine') {
      turtle.state.inventory.filet = 1;
      expect(turtle.saveAnimal('item')).toBe(true);
      expect(turtle.state.inventory.filet).toBeUndefined();
    }
  });

  it('pays jobs according to the era and the eco bonus', () => {
    const g = gameAt(4);
    expect(g.chooseJob('classic')).toBe(6);
    const h = gameAt(4);
    expect(h.chooseJob('eco', 'biodiversity')).toBe(3);
    expect(h.state.metrics.biodiversity).toBe(26);
  });

  it('answers interactive cards and traps', () => {
    for (let seed = 1; seed < 80; seed++) {
      const g = gameAt(2, seed);
      if (g.pending?.kind === 'card') {
        g.answerCard(true);
        expect(g.phase).toBe('yearEnd');
      }
      const t = gameAt(8, seed);
      if (t.pending?.kind === 'trap') {
        t.answerTrap(false);
        expect(t.phase).toBe('yearEnd');
      }
    }
  });

  it('plants seeds between turns only', () => {
    const g = Game.create(1);
    expect(g.plantSeed()).toBe(false);
    g.state.inventory.seeds = 2;
    expect(g.availableActions()).toContain('plantSeed');
    expect(g.plantSeed()).toBe(true);
    expect(g.state.inventory.seeds).toBe(1);
    g.state.position = 5;
    g.roll({ forcedDie: 1 });
    expect(g.plantSeed()).toBe(false);
  });

  it('saves and loads deterministically', () => {
    const a = Game.create(123);
    a.roll();
    if (a.phase === 'resolving') a.state.pending = null;
    a.state.phase = 'yearEnd';
    a.endYear();
    const b = Game.load(a.save());
    expect(b.save()).toEqual(a.save());
    expect(a.roll().die).toBe(b.roll().die);
  });

  it('rejects corrupted saves', () => {
    expect(() => Game.load('not json')).toThrow(GameRuleError);
    expect(() => Game.load('{"version":2}')).toThrow(GameRuleError);
    expect(() => Game.load('null')).toThrow(GameRuleError);
  });

  it('reports incoherent resolving states', () => {
    const g = Game.create(1);
    g.state.phase = 'resolving';
    expect(() => g.availableActions()).toThrow(GameRuleError);
  });

  it('lists the actions of every pending kind', () => {
    const cases: [number, string[]][] = [
      [5, ['resolveCombat']],
      [14, ['resolveTv']],
      [6, ['shopBuy', 'leaveShop']],
      [20, ['buildChantier', 'skipChantier']],
      [10, ['saveAnimal', 'refuseAnimal']],
      [4, ['chooseJob']],
    ];
    for (const [tile, actions] of cases) expect(gameAt(tile).availableActions()).toEqual(actions);
  });
});
