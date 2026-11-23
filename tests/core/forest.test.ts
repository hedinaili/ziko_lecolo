import { describe,expect,it } from 'vitest';
import { ForestRound } from '../../src/core/forest';
import { Rng } from '../../src/core/rng';

describe('Forêt Éclair',()=>{
  it('only rewards watering after germination, once per tree',()=>{
    const r=new ForestRound(new Rng(7),'child');
    r.act(r.fertile); r.advance(449); r.act(r.fertile);
    expect(r.watered).toBe(0);
    r.advance(1); r.act(r.fertile); r.act(r.fertile);
    expect(r.grove).toEqual([0]); expect(r.score).toBe(20);
    r.act(r.polluted);r.act(r.polluted);expect(r.score).toBe(15);
    r.advance(3000); r.act(r.fertile); r.advance(2000);
    expect(r.dried).toBe(1); expect(r.score).toBe(10);
  });
  it('closes pending seedlings and input at the 30-second boundary',()=>{
    const r=new ForestRound(new Rng(2),'hero');
    r.advance(29999);r.act(r.fertile);r.advance(300);
    r.act(r.polluted);r.act(r.fertile);
    expect([r.elapsed,r.dried,r.mistakes,r.planted,r.score]).toEqual([30000,1,0,1,0]);
  });
});
