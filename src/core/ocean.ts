import { ERA_INDEX } from '../data/balance';
import { Rng } from './rng';
import type { Era } from './types';

export const SEA_POINTS = { bag:10, bottle:15, fish:-10, dolphin:-10, jelly:-10 } as const;
export const BOAT = {x:640,y:150};
type Kind = keyof typeof SEA_POINTS;
interface Drifter { kind:Kind; x:number; y:number; speed:number; phase:number; hiddenUntil:number }
interface Cast { x:number; y:number; start:number; landed:boolean }
export class OceanRound {
  readonly targets: Drifter[] = [];
  readonly catches = { bag:0,bottle:0,fish:0,dolphin:0,jelly:0 };
  readonly radius:number;
  readonly goal:number;
  elapsed=0; score=0; casts=0; lastDelta=0;
  chargeStart:number | undefined;
  cast:Cast | undefined;
  constructor(rng:Rng, era:Era, largeNet:boolean) {
    const speed=1+.15*ERA_INDEX[era];
    this.goal=Math.round(145*speed);
    this.radius=largeNet ? 72*1.3 : 72;
    const kinds:Kind[]=['bag','fish','bottle','bag','dolphin','bottle','jelly','bag','bottle','fish','bag','bottle'];
    kinds.forEach((kind,i)=>this.targets.push({kind,x:(i%4)*305+rng.int(50,200),y:225+Math.floor(i/4)*153+rng.int(0,65),
      speed:rng.int(39,82)*(i%2 ? -1 : 1)*speed,phase:rng.range(0,6),hiddenUntil:0}));
  }
  get finished() { return this.elapsed>=30000; }
  get power() { return this.chargeStart===undefined ? 0 : Math.min(1,(this.elapsed-this.chargeStart)/850); }
  position(t:Drifter, at=this.elapsed) {
    return {x:((t.x+t.speed*at/1000)%1400+1400)%1400-60,y:t.y+12*Math.sin(t.phase+at/720)};
  }
  landing(x:number,y:number) {
    const dx=Math.max(26,Math.min(1254,x))-BOAT.x, dy=Math.max(205,Math.min(670,y))-BOAT.y;
    const reach=Math.min(1,(190+660*this.power)/Math.hypot(dx,dy));
    return {x:BOAT.x+dx*reach,y:BOAT.y+dy*reach};
  }
  hold() { if (!this.finished && !this.cast && this.chargeStart===undefined) this.chargeStart=this.elapsed; }
  release(x:number,y:number) {
    if (this.finished || this.chargeStart===undefined) return;
    this.cast={...this.landing(x,y),start:this.elapsed,landed:false};
    this.casts++; this.chargeStart=undefined;
  }
  advance(ms:number) {
    if (!Number.isFinite(ms)||ms<0) throw new RangeError('Durée de jeu invalide');
    this.elapsed=Math.min(30000,this.elapsed+ms);
    const c=this.cast;
    if (!c) return;
    const hitAt=c.start+320;
    if (!c.landed && this.elapsed>=hitAt) {
      c.landed=true;
      let delta=0;
      for (const t of this.targets) {
        const p=this.position(t,hitAt);
        if (t.hiddenUntil>hitAt || Math.hypot(p.x-c.x,p.y-c.y)>this.radius) continue;
        this.catches[t.kind]++; delta+=SEA_POINTS[t.kind]; t.hiddenUntil=hitAt+2600;
      }
      this.lastDelta=Math.max(-this.score,delta); this.score+=this.lastDelta;
    }
    if (this.elapsed>=c.start+900) this.cast=undefined;
  }
}
