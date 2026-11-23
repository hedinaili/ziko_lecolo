import { describe,expect,it } from 'vitest';
import { Rng } from '../../src/core/rng';
import { SmogRound } from '../../src/core/smog';

describe('Smog Buster',()=>{
  it('requires sustained suction and distinguishes fast clouds, birds and escaped pollution',()=>{
    const r=new SmogRound(new Rng(1),'child');
    r.advance(239,640,360,true);
    expect(r.score).toBe(0);
    r.advance(1,640,360,true);
    expect([r.score,r.clouds]).toEqual([10,1]);
    r.targets.splice(0);
    for(const kind of ['rush','bird','cloud'] as const){
      r.targets.push({kind,x:640,y:kind==='cloud'?654:360,vx:0,vy:kind==='cloud'?100:0,suction:0});
      r.advance(240,640,360,true);
    }
    expect([r.score,r.rushes,r.birds,r.escaped]).toEqual([10,1,1,1]);
  });
  it('locks at full heat, requires cooling, then accepts suction again; ends at 30s',()=>{
    const r=new SmogRound(new Rng(6),'adult');
    r.advance(3200,400,250,true);
    expect(r.locked).toBe(true);
    r.advance(850,500,250,true);
    expect(r.sucking).toBe(false);
    r.advance(1500,500,250,false);
    expect(r.locked).toBe(false);
    r.advance(16,500,250,true);expect(r.sucking).toBe(true);
    r.advance(40000,500,250,false);
    const score=r.score;
    r.advance(500,0,0,true);
    expect([r.elapsed,r.score,r.x]).toEqual([30000,score,500]);
  });
});
