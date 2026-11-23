import { ERA_INDEX } from '../data/balance';
import { Rng } from './rng';
import type { Era } from './types';

export const RIDER_X = 246;
type Kind = 'coin' | 'can' | 'tyre' | 'oil' | 'hedgehog' | 'exhaust';
interface RoadItem {kind:Kind; x:number; height:number}

export class VeloRound {
  elapsed=0;
  height=0;
  crouched=false;
  distance=0;
  coins=0;
  cans=0;
  avoided=0;
  hits=0;
  jumps=0;
  readonly items:RoadItem[]=[{kind:'can',x:840,height:40}];
  readonly goal:number;
  readonly speed:number;
  private points=0;
  private velocity=0;
  private jumpAge=0;
  private untilSpawn=1120;
  private serial=0;
  constructor(private rng:Rng, era:Era, private equipped:boolean) {
    const difficulty=1+.13*ERA_INDEX[era];
    this.speed=420*difficulty*(equipped?1.1:1);
    this.goal=Math.round(120*difficulty);
  }
  get finished() { return this.elapsed>=30000; }
  get score() { return Math.round(this.points*(this.equipped?1.1:1)); }
  jump() {
    if (!this.finished && this.height===0 && !this.crouched && this.velocity===0) {
      this.velocity=575;this.jumpAge=0;this.jumps++;
    }
  }
  advance(ms:number,held:boolean, duck:boolean) {
    if(!Number.isFinite(ms)||ms<0) throw new RangeError('Durée de jeu invalide');
    let left=Math.min(ms,30000-this.elapsed);
    this.elapsed+=left;
    while(left>0){
      const step=Math.min(left,12),dt=step/1000;left-=step;
      this.crouched=duck && this.height===0 && this.velocity===0;
      if(this.velocity!==0 || this.height>0){
        this.velocity-=dt*(held && this.velocity>0 && this.jumpAge<240 ? 680 : 1700);
        this.jumpAge+=step;this.height=Math.max(0,this.height+this.velocity*dt);
        if(this.height===0)this.velocity=0;
      }
      const dx=this.speed*dt;
      this.distance+=dx;this.untilSpawn-=dx;
      if(this.untilSpawn<=0){
        const kind=this.serial++%2===0 ? this.rng.pick(['tyre','oil','hedgehog','exhaust'] as const) : this.rng.pick(['coin','can'] as const);
        this.items.push({kind,x:1310,height:kind==='exhaust'?92:kind==='can'||kind==='coin'?this.rng.pick([40,115]):0});
        this.untilSpawn+=this.rng.int(390,500);
      }
      for(let i=this.items.length-1;i>=0;i--){
        const t=this.items[i]!;t.x-=dx;
        const collectible=t.kind==='coin'||t.kind==='can';
        if(Math.abs(t.x-RIDER_X)<32){
          if(collectible && Math.abs(t.height-this.height-(this.crouched?28:48))<46){
            if(t.kind==='can'){this.cans++;this.points+=10;}else{this.coins++;this.points+=15;}
            this.items.splice(i,1);continue;
          }
          if(!collectible && (t.kind==='exhaust'?!this.crouched:this.height<(t.kind==='oil'?16:46))){
            this.hits++;this.points=Math.max(0,this.points-5);this.items.splice(i,1);continue;
          }
        }
        if(t.x<RIDER_X-32){if(!collectible)this.avoided++;this.items.splice(i,1);}
      }
    }
  }
}
