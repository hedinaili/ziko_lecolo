import { ERA_INDEX } from '../data/balance';
import { Rng } from './rng';
import type { Era } from './types';

type Kind = 'cloud' | 'rush' | 'bird';
interface Target { kind: Kind; x: number; y: number; vx: number; vy: number; suction: number }
export const SUCTION_RADIUS = 116;
const clamp = (n:number, lo:number, hi:number) => Math.max(lo,Math.min(hi,n));

export class SmogRound {
  elapsed=0;
  x=640; y=360;
  heat=0; locked=false; sucking=false;
  score=0; clouds=0; rushes=0; birds=0; escaped=0; overheats=0;
  readonly targets:Target[]=[{kind:'cloud',x:685,y:330,vx:0,vy:32,suction:0}];
  readonly goal:number;
  private readonly speed:number;
  private spawnIn=200;
  private count=0;
  constructor(private rng:Rng, era:Era) {
    this.speed=1+.15*ERA_INDEX[era];
    this.goal=Math.round(150*this.speed);
  }
  get finished() { return this.elapsed>=30000; }
  private spawn() {
    const n=++this.count, kind:Kind=n%5===0?'bird':n%4===0?'rush':'cloud';
    const left=this.rng.chance(.5);
    this.targets.push({kind,x:kind==='bird'?(left?-35:1315):this.rng.int(65,1215),
      y:kind==='bird'?this.rng.int(150,545):88, vx:kind==='bird'?(left?230:-230)*this.speed:this.rng.int(-30,30),
      vy:(kind==='bird'?0:kind==='rush'?135:85)*this.speed,suction:0});
  }
  advance(ms:number, aimX:number, aimY:number, hold:boolean) {
    if (![ms,aimX,aimY].every(Number.isFinite) || ms<0) throw new RangeError('Commande de vol invalide');
    let left=Math.min(ms,30000-this.elapsed);
    this.elapsed+=left;
    while (left>0) {
      const step=Math.min(left,16), dt=step/1000; left-=step;
      const dx=clamp(aimX,40,1240)-this.x, dy=clamp(aimY,100,620)-this.y;
      const travel=Math.min(1,610*dt/(Math.hypot(dx,dy)||1));
      this.x+=travel*dx; this.y+=travel*dy;
      this.sucking=hold && !this.locked;
      this.heat=clamp(this.heat+dt*(this.sucking?32:-46),0,100);
      if (this.heat===100 && !this.locked) {this.locked=true;this.overheats++;this.sucking=false;}
      if (this.locked && this.heat===0) this.locked=false;
      this.spawnIn-=step;
      if (this.spawnIn<=0) {this.spawn();this.spawnIn+=920/this.speed;}
      for(let i=this.targets.length-1;i>=0;i--) {
        const t=this.targets[i]!;
        if(t.kind==='rush') t.vx=clamp((this.x-t.x)*1.1,-135,135)*this.speed;
        t.x+=t.vx*dt; t.y+=t.vy*dt;
        if(t.kind!=='bird') t.x=clamp(t.x,32,1248);
        if(this.sucking && Math.hypot(t.x-this.x,t.y-this.y)<=SUCTION_RADIUS) {
          t.suction+=step;
          t.x+=(this.x-t.x)*dt*2; t.y+=(this.y-t.y)*dt*2;
          if(t.suction>=240) {
            if(t.kind==='bird') {this.birds++;this.score=Math.max(0,this.score-10);}
            else if(t.kind==='rush') {this.rushes++;this.score+=15;}
            else {this.clouds++;this.score+=10;}
            this.targets.splice(i,1); continue;
          }
        } else t.suction=Math.max(0,t.suction-step);
        if(t.y>=655 || t.x < -60 || t.x>1340) {
          if(t.kind!=='bird') {this.escaped++;this.score=Math.max(0,this.score-5);}
          this.targets.splice(i,1);
        }
      }
    }
  }
}
