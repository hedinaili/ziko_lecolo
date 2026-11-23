import { describe,expect,it } from 'vitest';
import { OceanRound } from '../../src/core/ocean';
import { Rng } from '../../src/core/rng';

describe('Filet Océan',()=>{
  it.each([[false,5],[true,15]] as const)('resolves the landed net once (equipment: %s)',(equipped,score)=>{
    const r=new OceanRound(new Rng(8),'child',equipped);
    r.targets.splice(0);
    for (const [kind,x] of [['bottle',700],['dolphin',710],['bag',785]] as const)
      r.targets.push({kind,x,y:400,phase:-1170/720,speed:0,hiddenUntil:0});
    expect(r.landing(640,400).y).toBeLessThan(400);
    r.hold();r.advance(850);r.release(640,400);
    r.advance(319);expect(r.score).toBe(0);
    r.advance(1);expect(r.score).toBe(score);
    r.advance(200);expect(r.score).toBe(score);
  });
  it('does not award an unfinished cast after 30 seconds',()=>{
    const r=new OceanRound(new Rng(1),'child',false);
    r.advance(29500);r.hold();r.advance(400);r.release(640,300);r.advance(800);
    expect(r.elapsed).toBe(30000);expect(r.cast?.landed).toBe(false);
    r.hold();r.release(640,300);expect(r.casts).toBe(1);
  });
});
