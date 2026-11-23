import {describe,expect,it} from 'vitest';
import {Rng} from '../../src/core/rng';
import {RIDER_X,VeloRound} from '../../src/core/velo';

describe('Vélo Turbo',()=>{
  it('rewards holding a jump without allowing a double jump',()=>{
    const short=new VeloRound(new Rng(1),'child',false),long=new VeloRound(new Rng(1),'child',false);
    for(const r of [short,long]){r.jump();r.advance(50,true,false);r.jump();}
    short.advance(250,false,false);long.advance(250,true,false);
    expect(long.height).toBeGreaterThan(short.height+15);expect(long.jumps).toBe(1);
  });
  it('distinguishes ducking under exhaust, collecting a can and hitting an obstacle',()=>{
    const r=new VeloRound(new Rng(5),'child',false);
    r.items.splice(0);
    r.items.push({kind:'exhaust',height:92,x:RIDER_X},{kind:'can',height:40,x:RIDER_X});
    r.advance(100,false,true);expect([r.avoided,r.hits,r.score]).toEqual([1,0,10]);
    r.items.push({kind:'tyre',height:0,x:RIDER_X});
    r.advance(100,false,true);expect([r.hits,r.score]).toEqual([1,5]);
  });
  it('applies the bicycle bonus and locks input and score at 30 seconds',()=>{
    const base=new VeloRound(new Rng(1),'child',false),boost=new VeloRound(new Rng(1),'child',true);
    for(const r of [base,boost]){r.items[0]!.x=RIDER_X;r.advance(50,false,false);}
    expect(boost.distance/base.distance).toBeCloseTo(1.1);expect(boost.score).toBe(11);
    boost.advance(33000,false,false);const before=JSON.stringify(boost);
    boost.jump();boost.advance(1000,true,false);expect(boost.elapsed).toBe(30000);expect(JSON.stringify(boost)).toBe(before);
  });
});
