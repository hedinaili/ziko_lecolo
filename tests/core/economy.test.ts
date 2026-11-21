import { describe, expect, it } from 'vitest';
import {
  buyItem,
  buyProject,
  checkItemPurchase,
  checkProjectPurchase,
  eraUnlocked,
  itemPrice,
  lifeCost,
  reserveForNextYear,
  shopCatalog,
} from '../../src/core/economy';
import { eventsOf, makeCtx, milestoneKeys } from './helpers';

const ADULT_TURN = 22; // 32 years old
const YOUNG_TURN = 10; // 20 years old

describe('economy (docs/14)', () => {
  it('has a cost of living growing with the eras', () => {
    expect([lifeCost('child'), lifeCost('young'), lifeCost('adult'), lifeCost('hero')]).toEqual([1, 2, 3, 4]);
    expect(eraUnlocked('adult', 'young')).toBe(true);
    expect(eraUnlocked('child', 'young')).toBe(false);
  });

  it('reserves next year cost based on the current age', () => {
    expect(reserveForNextYear(makeCtx().state)).toBe(1);
    expect(reserveForNextYear(makeCtx({ turn: ADULT_TURN }).state)).toBe(3);
  });

  it('raises the kit price every 3 kits up to a cap', () => {
    const ctx = makeCtx({ coins: 1000 });
    const prices: number[] = [];
    for (let i = 0; i < 30; i++) {
      prices.push(itemPrice(ctx.state, 'kit') ?? -1);
      expect(buyItem(ctx, 'kit').ok).toBe(true);
    }
    expect(prices.slice(0, 4)).toEqual([8, 8, 8, 9]);
    expect(Math.max(...prices)).toBe(15);
    expect(ctx.state.inventory.kit).toBe(30);
  });

  it('locks items of later eras and refuses non-sold items', () => {
    const { state } = makeCtx({ coins: 100 });
    expect(checkItemPurchase(state, 'aspirateur')).toMatchObject({ ok: false, reason: 'locked' });
    expect(checkItemPurchase(state, 'mop')).toMatchObject({ ok: false, reason: 'notForSale' });
    expect(checkItemPurchase({ ...state, turn: YOUNG_TURN }, 'aspirateur').ok).toBe(true);
  });

  it('refuses a second unique item and respects stacks', () => {
    const ctx = makeCtx({ coins: 500, turn: YOUNG_TURN });
    expect(buyItem(ctx, 'velo').ok).toBe(true);
    expect(buyItem(ctx, 'velo')).toMatchObject({ ok: false, reason: 'owned' });
    for (let i = 0; i < 5; i++) expect(buyItem(ctx, 'solar').ok).toBe(true);
    expect(buyItem(ctx, 'solar')).toMatchObject({ ok: false, reason: 'maxed' });
  });

  it('warns when a purchase would not leave enough for next year, unless confirmed', () => {
    const ctx = makeCtx({ coins: 12 });
    expect(buyItem(ctx, 'pince')).toMatchObject({ ok: false, reason: 'lowFundsWarning' });
    expect(ctx.state.coins).toBe(12);
    expect(buyItem(ctx, 'pince', true).ok).toBe(true);
    expect(ctx.state.coins).toBe(0);
    expect(buyItem(ctx, 'medkit', true)).toMatchObject({ ok: false, reason: 'insufficient' });
  });

  it('sells seeds by packs of 5', () => {
    const ctx = makeCtx();
    buyItem(ctx, 'seeds');
    expect(ctx.state.inventory.seeds).toBe(5);
    expect(eventsOf(ctx, 'coinsChanged')[0]?.delta).toBe(-8);
  });

  it('builds a grand project once, applying its effects and a first-time milestone', () => {
    const ctx = makeCtx({ coins: 300, turn: ADULT_TURN });
    expect(checkProjectPurchase(makeCtx().state, 'forest')).toMatchObject({ ok: false, reason: 'locked' });
    expect(buyProject(ctx, 'forest').ok).toBe(true);
    expect(ctx.state.metrics.biodiversity).toBe(33);
    expect(ctx.state.projects).toEqual(['forest']);
    expect(buyProject(ctx, 'forest')).toMatchObject({ ok: false, reason: 'owned' });
    expect(milestoneKeys(ctx)).toContain('first:project');
    expect(eventsOf(ctx, 'projectBuilt')).toHaveLength(1);
  });

  it('shows a catalog that grows with the eras', () => {
    const child = shopCatalog(makeCtx().state);
    const hero = shopCatalog(makeCtx({ turn: 35 }).state);
    expect(child.items).toContain('kit');
    expect(child.items).not.toContain('micro');
    expect(child.projects).toEqual([]);
    expect(hero.items).toContain('micro');
    expect(hero.projects).toHaveLength(5);
  });
});
