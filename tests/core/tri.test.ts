import { describe,expect,it } from 'vitest';
import { TriRound } from '../../src/core/tri';
import { Rng } from '../../src/core/rng';

describe('Tri Express', () => {
  it('counts misplaced deposits in their actual bin and missed objects in their intended bin', () => {
    const r = new TriRound(new Rng(7),'child');
    r.sort(4);
    expect(r.bins[4]).toEqual({deposited:1,errors:1,missed:0});
    const intended=r.item.bin;
    r.advance(4100);
    expect(r.bins[intended]!.missed).toBe(1);
    r.sort(r.item.bin);
    expect(r.bins.reduce((sum,b)=>sum+b.deposited,0)).toBe(2);
  });
  it('rewards streaks, separates batteries, and resets the combo on mistakes', () => {
    const r = new TriRound(new Rng(7),'child');
    for (let i=0;i<5;i++) r.sort(r.item.bin);
    expect(r.score).toBe(120);
    expect(r.item.bin).toBe(4);
    r.sort(4);
    expect(r.score).toBe(150);
    r.sort((r.item.bin+1)%4);
    r.sort(r.item.bin);
    expect(r.score).toBe(155);
  });
  it('expires objects and stops scoring exactly at 30 seconds', () => {
    const r = new TriRound(new Rng(8),'child');
    r.sort(r.item.bin);
    r.advance(4100);
    expect([r.missed,r.streak]).toEqual([1,0]);
    r.advance(25899);
    expect(r.finished).toBe(false);
    r.advance(250);
    r.sort(r.item.bin);
    expect([r.elapsed,r.score,r.correct]).toEqual([30000,10,1]);
  });
});
