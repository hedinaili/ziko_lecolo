import {describe,expect,it} from 'vitest';
import {DUEL_MS,SacDuel} from '../../src/core/sac-duel';

describe('Double rebond du Golem',()=>{
  it.each(['roll','bottle'] as const)('throws a bouncing tyre or a high arcing bolt (%s)',move=>{
    const d=new SacDuel(63,'cle','golemPneus');d.enemyPhase='windup';d.enemyMove=move;
    d.advance(560,0,true);
    const start=d.projectileX!;
    expect(d.projectileIsTyre).toBe(move==='roll');
    const low=d.projectileHeight;
    d.advance(260,0,true);
    const peak=d.projectileHeight;
    expect(peak).toBeGreaterThan(low+12);
    expect(d.projectileX!).toBeLessThan(start-100);
    d.advance(move==='roll'?260:780,0,true);
    expect(d.projectileHeight).toBeLessThan(peak);
    if(move==='bottle')expect(d.hp).toBe(100);
  });
  it('starts its first attack sooner than the sack',()=>{
    const yard=new SacDuel(63,'cle','golemPneus'),sack=new SacDuel(63,'mop');
    for(const d of [yard,sack]){d.enemyX=d.x+90;d.advance(830,0,false);}
    expect([yard.enemyPhase,sack.enemyPhase]).toEqual(['windup','walk']);
  });
  it.each(['jump and duck','stand','duck only','jump only','two parries'] as const)('uses the rolling body for both passes: %s',strategy=>{
    const d=new SacDuel(63,'cle','golemPneus');
    let jumped=false, low=false, high=false, bounced=false;
    while(d.wheelStage==='idle'&&d.time<4000)d.advance(8,0,true);
    expect(d.wheelStage).toBe('coil');
    const hp=d.hp;
    while(d.wheelStage!=='idle'&&d.time<11000){
      const untilLow=Math.max(0,-d.eruptionAge)+(Math.abs(d.x-d.wheelX)-65)/.66;
      if(strategy.startsWith('jump')&&!jumped&&(d.wheelStage==='coil'||d.wheelStage==='low')&&untilLow<=240){d.jump();jumped=true;}
      if(strategy==='two parries'&&d.vortexParryNow)d.parry();
      const duck=strategy==='duck only'||(strategy==='jump and duck'&&(d.wheelStage==='turn'||d.wheelStage==='high'));
      d.advance(8,0,duck);
      if(d.wheelStage==='low'){low=true;expect(d.enemyX).toBe(d.wheelX);}
      if(d.wheelStage==='high'){high=true;expect(d.enemyX).toBe(d.wheelX);}
      if(d.wheelStage==='turn')bounced=true;
    }
    expect([low,bounced,high,d.wheelStage]).toEqual([true,true,true,'idle']);
    expect(d.hp).toBe(hp-(strategy==='jump and duck'||strategy==='two parries'?0:25));
  });
  it('keeps pressure spam punishable despite the distance the Golem travels',()=>{
    const d=new SacDuel(63,'cle','golemPneus');d.enemyX=d.x+90;
    while(!d.outcome){d.punch();d.advance(120,Math.sign(d.enemyX-d.x),false);}
    expect(d.outcome).toBe('lose');
  });
  it.each([['cle',35],['eponge',49]] as const)('uses the rim weakness for the third strike with %s',(tool,remaining)=>{
    const d=new SacDuel(63,tool,'golemPneus');d.enemyX=d.x+85;
    d.punch();d.punch();d.punch();
    while(d.attack!==3&&d.time<1500)d.advance(8,0,false);
    // Measure reach against a stationary target, independently of its recovery speed.
    d.enemyX=d.x+205;d.enemyHit=200;
    d.advance(190,0,false);expect(d.enemyHp).toBe(remaining);
  });
});

describe('Méduse de pétrole',()=>{
  it.each([['eponge',35],['pince',49]] as const)('uses the current enemy’s weakness on the finisher with %s',(tool,remaining)=>{
    const d=new SacDuel(63,tool,'meduse');d.enemyX=d.x+85;
    d.punch();d.punch();d.punch();
    while(d.attack!==3 && d.time<1500)d.advance(8,0,false);
    expect(d.attack).toBe(3);
    d.enemyX=d.x+205;d.enemyPhase='recover';
    d.advance(190,0,false);
    expect(d.enemyHp).toBe(remaining);
  });
  it.each(['jump','parry','stand','crouch','early parry'] as const)('erupts from fixed ground positions and resolves once: %s',action=>{
    const d=new SacDuel(63,'eponge','meduse');
    while(d.vortexProgress<0 && d.time<4000)d.advance(8,0,false);
    expect(d.vortexX).toBe(d.x);
    if(action==='early parry')d.parry();
    while(d.eruptionAge < -330 && d.time<8000)d.advance(8,0,false);
    if(action==='jump')d.jump();
    while(!d.vortexParryNow && d.time<8000)d.advance(8,0,true);
    expect(d.vortexParryNow).toBe(true);
    const hp=d.hp;
    if(action==='parry')d.parry();
    while(d.vortexProgress>=0 && d.time<10000)d.advance(8,0,true);
    expect(d.vortexProgress).toBe(-1);expect(d.hp).toBe(hp-(action==='parry'||action==='jump'?0:25));
  });
  it('punishes repeated close-range attacks without defensive breaks',()=>{
    const d=new SacDuel(63,'eponge','meduse');d.enemyX=d.x+90;
    while(!d.outcome){d.punch();d.advance(120,Math.sign(d.enemyX-d.x),false);}
    expect(d.outcome).toBe('lose');
  });
});

describe('Sac-Zombie arcade',()=>{
  function closeDuel(){const d=new SacDuel(64,'mop');d.enemyX=d.x+85;return d;}
  it.each([-1,1])('kicks toward travel (%i) rather than auto-aiming at the sack, once per jump',dir=>{
    const d=new SacDuel(64,'mop');
    d.x=640;d.enemyX=d.x-dir*90;
    d.advance(8,dir,false);d.jump();d.advance(40,dir,false);d.punch();
    expect([d.attack,d.airKick,d.facing]).toEqual([2,true,dir]);
    for(let i=0;i<12;i++){d.punch();d.advance(48,0,false);}
    expect(d.height).toBeGreaterThan(0);
    expect(d.cues.filter(c=>c==='kick')).toHaveLength(1);
    expect(d.enemyHp).toBe(64);
    d.advance(400,0,false);expect(d.height).toBe(0);expect(d.attack).toBe(0);
    d.punch();expect(d.attack).toBe(1);
  });
  it('can land a descending kick without priming a ground combo',()=>{
    const d=closeDuel();d.jump();d.advance(620,0,false);d.punch();d.advance(350,0,false);
    expect(d.enemyHp).toBe(57);expect(d.height).toBe(0);
    d.punch();expect(d.attack).toBe(1);
  });
  it.each(['swipe','rush','bottle','roll'] as const)('cries once when launching %s, not during anticipation',move=>{
    const d=closeDuel();d.enemyPhase='windup';d.enemyMove=move;
    d.advance(552,0,false);expect(d.cues).not.toContain('growl');
    d.advance(180,0,false);expect(d.cues.filter(c=>c==='growl')).toHaveLength(1);
  });
  it.each(['jump','crouch','run','early parry','parry'] as const)('vortex vs %s: one impact, only an active parry avoids 25 HP',action=>{
    const d=closeDuel();
    while(d.vortexProgress<0 && d.time<4000)d.advance(8,-1,false);
    expect(d.vortexProgress).toBe(0);
    expect(d.vortexX).toBe(d.enemyX);
    d.hp=68;
    if(action==='early parry')d.parry();
    while(Math.abs(d.vortexX-d.x)>215 && !d.vortexCrossed)d.advance(8,-1,false);
    if(action==='jump')d.jump();
    while(!d.vortexParryNow && !d.vortexCrossed)d.advance(8,action==='run'?-1:0,action==='crouch');
    if(action==='parry')d.parry();
    expect(d.hp).toBe(68);
    while(!d.vortexCrossed)d.advance(8,action==='run'?-1:0,action==='crouch');
    expect(d.hp).toBe(action==='parry'?68:43);
    const crossing=d.vortexX;
    d.advance(72,0,false);
    expect(Math.abs(d.vortexX-crossing)).toBeGreaterThan(40);
    while(d.vortexProgress>=0)d.advance(8,0,false);
    expect(d.vortexProgress).toBe(-1);
    d.advance(180,-1,false);expect(d.hp).toBe(action==='parry'?68:43);
  });
  it('braces in a real duel, blocks a frontal strike only once, then leaves an opening',()=>{
    const d=closeDuel(); d.punch();d.punch();d.punch();
    for(let t=0;t<2000&&d.enemyPhase!=='guard';t+=8)d.advance(8,0,false);
    expect(d.enemyPhase).toBe('guard');
    // The finisher recovery ends while the monster is still braced.
    while(d.attack)d.advance(8,0,false);
    d.advance(304,0,false);d.punch();d.advance(105,0,false);
    expect(d.cues.filter(c=>c==='block')).toHaveLength(1);
    expect(d.enemyHp).toBe(36);
    d.advance(900,1,false);expect(d.pressureGuard).toBe(false);
    // The scheduled tornado can cover this opening: wait for its cue and parry.
    if(d.vortexProgress>=0){
      while(!d.vortexParryNow&&!d.vortexCrossed)d.advance(8,0,false);
      d.parry();while(d.vortexProgress>=0)d.advance(8,0,false);
      d.advance(180,0,false);
    }
    d.punch();
    expect(d.attack).toBe(1);d.advance(120,0,false);expect(d.enemyHp).toBe(29);
  });
  it('guard does not protect a strike from behind',()=>{
    const d=closeDuel();d.enemyPhase='guard';d.enemyFacing=1;
    d.punch();d.advance(100,0,false);expect(d.enemyHp).toBe(57);
  });
  it.each([65,150])('denies a facehugging attacker pressing every %i ms until KO',period=>{
    const d=new SacDuel(63,'pince');d.enemyX=d.x+90;
    while(!d.outcome){
      d.punch();d.advance(period,Math.sign(d.enemyX-d.x),false);
    }
    expect(d.outcome).toBe('lose');expect(d.enemyHp).toBeGreaterThan(0);
  });
  it('rushes forward and sends the rolling bottle below a crouching fighter',()=>{
    const rush=closeDuel();rush.enemyX=rush.x+185;rush.enemyMove='rush';rush.enemyPhase='windup';
    rush.advance(560,0,false);const start=rush.enemyX;
    rush.advance(240,0,false);expect(rush.enemyX).toBeLessThan(start-100);expect(rush.hp).toBe(86);
    const roll=closeDuel();roll.enemyPhase='windup';roll.enemyMove='roll';
    roll.advance(560,0,true);expect(roll.projectileHeight).toBe(20);
    roll.advance(120,0,true);expect(roll.hp).toBe(86);
  });
  it('buffers two distinct inputs, hits once per move, and doubles only the finisher',()=>{
    const d=closeDuel();for(let i=0;i<8;i++)d.punch();
    d.advance(176,0,false);expect([d.attack,d.enemyHp]).toEqual([1,57]);
    d.advance(300,0,false);expect([d.attack,d.enemyHp]).toEqual([2,50]);
    d.advance(490,0,false);expect([d.attack,d.enemyHp]).toEqual([3,36]);
    d.advance(490,0,false);expect([d.attack,d.enemyHp]).toEqual([0,36]);
  });
  it('does not count a whiff or a late input towards the chain',()=>{
    const d=new SacDuel(64,'mop');d.punch();d.advance(320,0,false);
    expect(d.enemyHp).toBe(64);
    d.enemyX=d.x+90;d.punch();expect(d.attack).toBe(1);
    d.advance(880,0,false);d.punch();expect(d.attack).toBe(1);
  });
  it('discards extra presses through the finisher and requires a new press after 300 ms',()=>{
    const d=closeDuel();d.punch();d.punch();d.punch();
    while(d.attack!==3 && d.time<1500)d.advance(1,0,false);
    expect(d.attack).toBe(3);
    d.punch();d.punch();
    while(d.attack===3 && d.time<2000)d.advance(1,0,false);
    expect(d.attack).toBe(0);
    d.punch();d.advance(299,0,false);d.punch();
    expect(d.attack).toBe(0);
    d.advance(1,0,false);expect(d.attack).toBe(0);
    d.punch();expect(d.attack).toBe(1);
  });
  it('a received hit during the kick interrupts and flushes the pending finisher',()=>{
    const d=closeDuel();d.punch();d.punch();d.punch();d.advance(365,0,false);
    expect(d.attack).toBe(2);
    d.projectileX=d.x+3;d.advance(10,0,false);
    expect([d.attack,d.hp]).toEqual([0,86]);
    d.advance(420,0,false);expect(d.attack).toBe(0);
    d.punch();expect(d.attack).toBe(1);
  });
  it('crouching and jumping physically clear different heights, and parrying has a cooldown',()=>{
    const d=closeDuel();d.projectileX=d.x+5;d.advance(70,0,true);
    expect(d.hp).toBe(100);expect(d.projectileX).not.toBeNull();
    d.parry();d.projectileX=d.x;d.advance(8,0,false);
    expect(d.hp).toBe(100);expect(d.parryFlash).toBeGreaterThan(0);
    d.advance(180,0,false);d.parry();expect(d.vanish).toBe(false);
    d.jump();d.advance(360,0,false);expect(d.height).toBeGreaterThan(145);
    d.projectileX=d.x;d.advance(8,0,false);expect(d.hp).toBe(100);
  });
  it('terminates on KO or timeout and never accepts a post-result hit',()=>{
    const d=closeDuel();d.enemyHp=7;d.punch();d.advance(200,0,false);
    expect(d.outcome).toBe('win');const before=d.time;d.advance(1000,1,false);expect(d.time).toBe(before);
    const timer=new SacDuel(64,'mop');timer.advance(DUEL_MS,0,true);expect(timer.outcome).toBeTruthy();
  });
  it('holds both fighters at contact before pushing the sack, without losing buffered input',()=>{
    const d=closeDuel();d.punch();d.advance(72,0,false);
    const x=d.enemyX,pose=d.progress;
    expect(d.impactHold).toBe(32);
    d.punch();d.advance(32,1,false);
    expect([d.enemyX,d.progress,d.enemyHp]).toEqual([x,pose,57]);
    d.advance(250,0,false);
    expect(d.enemyX).toBeGreaterThan(x);expect(d.attack).toBe(2);
  });
});
