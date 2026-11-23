import { effectiveness } from './combat';
import type { CombatOutcome } from './combat';
import type { ItemId } from './types';

type Strike = 0|1|2|3;
type EnemyPhase = 'walk'|'windup'|'strike'|'recover'|'guard';
type EnemyMove = 'swipe'|'bottle'|'rush'|'roll';
export type ArcadeCreature = 'sacZombie'|'meduse'|'golemPneus';
export type DuelCue = 'swing'|'kick'|'tool'|'impact'|'hurt'|'parry'|'throw'|'block'|'vortex'|'growl'|'bounce';
type Box = {left:number; right:number; bottom:number; top:number};
const overlap = (a:Box,b:Box) => a.left<b.right && b.left<a.right && a.bottom<b.top && b.bottom<a.top;
const clampX = (x:number) => Math.max(65,Math.min(1215,x));
const strikes = [
  {start:0,end:0,duration:1,reach:0},
  {start:70,end:170,duration:310,reach:109},
  {start:95,end:225,duration:385,reach:127},
  {start:160,end:335,duration:540,reach:150},
] as const;
const phaseDuration = {walk:1175,windup:560,strike:245,recover:655,guard:580};
const yardDuration = {...phaseDuration,walk:820,recover:440};
const braceCooldown=2850;
const enemyMoves:readonly EnemyMove[]=['swipe','bottle','rush','roll'];
const tideMoves:readonly EnemyMove[]=['bottle','swipe','roll','rush'];
const yardMoves:readonly EnemyMove[]=['roll','rush','swipe','bottle'];
const WHEEL_SPEED=.66, REBOUND_MS=860, WHEEL_RADIUS=45;
export const DUEL_MS=40000;
export const OIL_VENTS={offsets:[-155,0,155],radius:49,height:98,fade:420} as const;

export class SacDuel {
  time=0; x=378; height=0; facing=1; move=0; crouch=false;
  enemyX=870; enemyFacing=-1; enemyPhase:EnemyPhase='walk';
  enemyMove:EnemyMove='swipe';
  blockFlash=0;
  hp=100; enemyHp:number;
  attack:Strike=0;
  hit=0; enemyHit=0; parryFlash=0; cooldown=0;
  projectileX:number|null=null; projectileHeight=110;
  outcome:CombatOutcome|null=null;
  readonly cues:DuelCue[]=[];
  private vertical=0;
  private airSpent=false;
  airKick=false;
  private attackAge=0;
  private connected=false;
  private blocked=false;
  private chain=0;
  private chainUntil=0;
  private queued=0;
  private nextComboAt=0;
  private fade=0;
  private attackClock=0;
  private shotDirection=-1;
  private shotAge=0;
  projectileIsTyre=false;
  private didStrike=false;
  private enemyTurns=0;
  private braceAfterCombo=false;
  private lastBrace=-braceCooldown;
  pressureGuard=false;
  private lastPress=-10000;
  impactHold=0;
  private recoil=0;
  private nextVortex=2600;
  private vortexStarts=-1;
  private vortexOrigin=0;
  private vortexDir=1;
  private vortexPassed=false;
  private readonly surgeCharge:number;
  private readonly surgeSpeed:number;
  private wheelContact=false;
  private get wheelEdge(){return this.vortexDir>0?1260:20;}
  private get legTime(){return Math.abs(this.wheelEdge-this.vortexOrigin)/WHEEL_SPEED;}
  get wheelStage(): 'idle'|'coil'|'low'|'turn'|'high'{
    if(this.creature!=='golemPneus'||this.vortexStarts<0)return 'idle';
    const t=this.eruptionAge;
    return t<0?'coil':t<this.legTime?'low':t<this.legTime+REBOUND_MS?'turn':'high';
  }
  get wheelX(){
    const stage=this.wheelStage;
    if(stage==='low')return this.vortexOrigin+this.vortexDir*WHEEL_SPEED*this.eruptionAge;
    if(stage==='turn')return this.wheelEdge;
    if(stage==='high')return this.wheelEdge-this.vortexDir*WHEEL_SPEED*(this.eruptionAge-this.legTime-REBOUND_MS);
    return this.enemyX;
  }
  get wheelHeight(){
    if(this.wheelStage==='turn'){
      const u=Math.min(1,(this.eruptionAge-this.legTime)/REBOUND_MS);
      return WHEEL_RADIUS+90*u+34*Math.sin(Math.PI*u);
    }
    return this.wheelStage==='high'?135:WHEEL_RADIUS;
  }
  get eruptionAge(){return this.vortexStarts<0?-1:this.time-this.vortexStarts-this.surgeCharge;}
  get vortexProgress(){return this.vortexStarts<0 ? -1 : Math.min(1,(this.time-this.vortexStarts)/this.surgeCharge);}
  get vortexX(){
    if(this.creature==='meduse')return this.vortexOrigin;
    const travel=Math.max(0,this.time-this.vortexStarts-this.surgeCharge)*this.surgeSpeed;
    return this.vortexOrigin+this.vortexDir*travel;
  }
  get vortexParryNow(){
    if(this.vortexStarts<0||this.vortexPassed)return false;
    if(this.creature==='golemPneus'){
      const stage=this.wheelStage;
      if(stage==='turn'||this.wheelContact)return false;
      const dir=stage==='high'?-this.vortexDir:this.vortexDir;
      const eta=Math.max(0,-this.eruptionAge)+((this.x-this.wheelX)*dir-45)/WHEEL_SPEED;
      return eta>=0&&eta<=150;
    }
    const until=this.creature==='meduse'?-this.eruptionAge:Math.max(0,this.surgeCharge-(this.time-this.vortexStarts))+(this.x-this.vortexX)*this.vortexDir/this.surgeSpeed;
    return until>=0&&until<=150;
  }
  get vortexCrossed(){return this.vortexStarts>=0&&this.vortexPassed;}
  constructor(readonly enemyMax:number, public tool:ItemId,readonly creature:ArcadeCreature='sacZombie') {
    this.enemyHp=enemyMax;
    this.surgeCharge=creature==='meduse'?1150:creature==='golemPneus'?1000:950;
    this.surgeSpeed=creature==='meduse'?.74:.65;
  }
  get vanish(){return this.fade>0;}
  get progress(){return this.attackAge/strikes[this.attack].duration;}
  private get durations(){return this.creature==='golemPneus'?yardDuration:phaseDuration;}
  private get braceDelay(){return this.creature==='golemPneus'?2050:braceCooldown;}
  get enemyProgress(){return Math.min(1,this.attackClock/this.durations[this.enemyPhase]);}
  private startStrike(){
    this.attack=this.chain===2?3:this.chain===1?2:1;
    this.facing=this.enemyX>=this.x?1:-1;
    this.connected=false;this.blocked=false;this.attackAge=0;
    this.cues.push(this.attack===3?'tool':this.attack===2?'kick':'swing');
  }
  punch(){
    this.lastPress=this.time;
    if(this.outcome||this.hit||this.vanish||this.attack===3||this.time<this.nextComboAt)return;
    if(this.height>0||this.vertical!==0){
      if(!this.airSpent){
        this.airSpent=this.airKick=true;this.attack=2;this.attackAge=0;this.connected=this.blocked=false;
        this.facing=this.move||this.facing;this.cues.push('kick');
      }
      return;
    }
    if(this.attack){this.queued=Math.min(2,this.queued+1);return;}
    if(this.time>this.chainUntil)this.chain=0;
    this.startStrike();
  }
  jump(){
    if(!this.outcome&&!this.height&&!this.vertical&&!this.hit&&!this.attack&&!this.vanish){
      this.vertical=745;this.crouch=false;
      this.airSpent=false;this.chain=this.queued=0;
    }
  }
  parry(){
    if(this.outcome||this.cooldown||this.hit||this.attack)return;
    this.fade=175;this.cooldown=1250;this.cues.push('parry');
  }
  changeTool(tool:ItemId){
    if(!this.attack&&!this.hit&&!this.vanish&&!this.outcome){this.tool=tool;this.chain=0;this.queued=0;}
  }
  private receive(vortex=false){
    if(this.vanish){
      this.pressureGuard=false;
      this.parryFlash=300;this.enemyHit=300;
      this.enemyPhase='recover';this.attackClock=0;
      return;
    }
    if(this.hit&&!vortex)return;
    this.hp=Math.max(0,this.hp-(vortex?25:14));this.hit=320;this.cues.push('hurt');
    this.attack=0;this.attackAge=0;this.chain=0;this.queued=0;
    this.airKick=false;
    this.x=clampX(this.x+Math.sign(this.x-this.enemyX)*24);
    if(!this.hp)this.outcome='lose';
  }
  advance(ms:number, direction:number, duck:boolean){
    if(!Number.isFinite(ms)||ms<0)throw new RangeError('Durée du duel invalide');
    let left=Math.min(ms,DUEL_MS-this.time);
    while(left>0&&!this.outcome){
      if(this.impactHold>0){
        const pause=Math.min(left,this.impactHold);
        this.time+=pause;this.impactHold-=pause;left-=pause;
        continue;
      }
      const step=Math.min(8,left);left-=step;this.time+=step;
      this.step(step,Math.sign(direction),duck);
    }
    if(!this.outcome && this.time>=DUEL_MS)this.outcome=this.enemyHp===0?'win':'draw';
  }
  private step(ms:number,dir:number,duck:boolean){
    const dt=ms/1000;
    const push=Math.sign(this.recoil)*Math.min(Math.abs(this.recoil),.42*ms);
    this.enemyX=clampX(this.enemyX+push);this.recoil-=push;
    if(this.enemyHp===0){
      if(!this.recoil)this.outcome='win';
      return;
    }
    if(this.vortexStarts<0 && this.time>=this.nextVortex){
      this.vortexStarts=this.time;this.projectileX=null;this.enemyFacing=this.x>=this.enemyX?1:-1;
      this.vortexOrigin=this.creature==='meduse'?this.x:this.enemyX;this.vortexDir=this.enemyFacing;this.vortexPassed=false;
      this.wheelContact=false;
      this.enemyPhase='windup';this.attackClock=0;this.cues.push('vortex');
    }
    this.hit=Math.max(0,this.hit-ms);this.enemyHit=Math.max(0,this.enemyHit-ms);
    this.blockFlash=Math.max(0,this.blockFlash-ms);
    // Its own wheel travel is not a player disengage: continued mashing keeps the Golem braced.
    if(this.pressureGuard && ((this.creature!=='golemPneus'&&Math.abs(this.enemyX-this.x)>225) || this.time-this.lastPress>820))
      this.pressureGuard=false;
    this.fade=Math.max(0,this.fade-ms);this.cooldown=Math.max(0,this.cooldown-ms);this.parryFlash=Math.max(0,this.parryFlash-ms);
    this.crouch=duck&&!this.height&&!this.vertical;
    this.move=this.hit||this.vanish||this.crouch?0:dir;
    const previousX=this.x;
    this.x=clampX(this.x+this.move*(this.attack?115:390)*dt);
    if(this.height||this.vertical){
      this.vertical-=1720*dt;this.height=Math.max(0,this.height+this.vertical*dt);
      if(!this.height){
        this.vertical=0;
        if(this.airKick){this.attack=0;this.attackAge=0;this.airKick=false;}
      }
    }
    if(this.creature==='golemPneus' && this.vortexStarts>=0){
      const stage=this.wheelStage;
      this.enemyX=this.wheelX;
      if(stage==='turn'){
        if(this.eruptionAge-ms<this.legTime)this.cues.push('bounce');
        this.wheelContact=false;
      }
      if((stage==='low'||stage==='high')&&!this.vortexPassed&&!this.wheelContact){
        const dx=Math.max(0,Math.abs(this.x-this.enemyX)-22);
        const dy=Math.max(0,this.height-this.wheelHeight,this.wheelHeight-this.height-(this.crouch?69:142));
        if(dx*dx+dy*dy<WHEEL_RADIUS**2){
          this.wheelContact=true;this.vortexPassed=!this.vanish;this.receive(true);
          if(this.outcome)return;
        }
      }
      if(stage==='high'&&this.eruptionAge>=2*this.legTime+REBOUND_MS){
        this.enemyX=clampX(this.vortexOrigin);this.vortexStarts=-1;this.nextVortex=this.time+7000;
        this.enemyPhase='recover';this.attackClock=0;
        this.enemyFacing=this.x>=this.enemyX?1:-1;
        this.pressureGuard=this.time-this.lastPress<300;
      }
    }else if(this.vortexProgress===1 && this.creature==='meduse'){
      if(!this.vortexPassed){
        this.vortexPassed=true;
        const overVent=OIL_VENTS.offsets.some(offset=>Math.abs(this.x-this.vortexOrigin-offset)<=OIL_VENTS.radius);
        if(overVent && this.height<OIL_VENTS.height){this.receive(true);if(this.outcome)return;}
      }
      if(this.eruptionAge>=OIL_VENTS.fade){
        this.vortexStarts=-1;this.nextVortex=this.time+7000;
        this.enemyPhase='recover';this.attackClock=0;
      }
    }else if(this.vortexProgress===1){
      const previousAxis=this.vortexOrigin+this.vortexDir*this.surgeSpeed*Math.max(0,this.time-ms-this.vortexStarts-this.surgeCharge);
      if(!this.vortexPassed&&(previousX-previousAxis)*this.vortexDir>=0&&(this.vortexX-this.x)*this.vortexDir>=0){
        this.vortexPassed=true;this.receive(true);
        if(this.outcome)return;
      }
      if(this.vortexX < -120 || this.vortexX > 1400){
        this.vortexStarts=-1;this.nextVortex=this.time+7000;
        this.enemyPhase='recover';this.attackClock=0;
      }
    }
    if(!this.attack)this.facing=this.height>0?(this.move||this.facing):(this.enemyX>=this.x?1:-1);
    if(this.enemyPhase==='walk')this.enemyFacing=this.x>=this.enemyX?1:-1;
    if(this.enemyPhase==='walk'&&!this.enemyHit&&Math.abs(this.x-this.enemyX)>92){
      const glide=this.creature==='meduse'?152+85*Math.sin(this.time*.006):this.creature==='golemPneus'?155:185;
      this.enemyX=clampX(this.enemyX+this.enemyFacing*glide*dt);
    }
    if(this.enemyPhase==='strike'&&this.enemyMove==='rush'&&!this.enemyHit)
      this.enemyX=clampX(this.enemyX+this.enemyFacing*520*dt);
    if((this.wheelStage==='idle'||this.wheelStage==='coil') && this.height<116 && Math.abs(this.x-this.enemyX)<66)
      this.x=clampX(this.enemyX+(this.x===this.enemyX?-this.facing:Math.sign(this.x-this.enemyX))*66);
    if(this.attack){
      this.attackAge+=ms;
      const a=strikes[this.attack],level=this.height+(this.airKick?38:this.crouch?35:76);
      const reach=a.reach+(this.attack===3&&effectiveness(this.tool,this.creature)==='super'?32:0);
      const tip=this.x+this.facing*reach;
      const strike={left:Math.min(this.x,tip),right:Math.max(this.x,tip),bottom:level-24,top:level+24};
      if(!this.connected&&!this.blocked&&this.attackAge>=a.start&&this.attackAge<=a.end&&overlap(strike,{left:this.enemyX-35,right:this.enemyX+35,bottom:0,top:144})){
        if(this.vortexStarts>=0 || ((this.enemyPhase==='guard'||this.pressureGuard)&&(this.x-this.enemyX)*this.enemyFacing>0)){
          this.blocked=true;this.blockFlash=150;this.impactHold=26;
          if(this.enemyPhase==='guard'&&this.vortexStarts<0){
            this.pressureGuard=true;this.lastPress=this.time;this.enemyMove='swipe';
            this.enemyPhase='windup';this.attackClock=0;this.didStrike=false;
          }
          this.cues.push('block');return;
        }
        this.connected=true;const heavy=this.attack===3;
        this.enemyHp=Math.max(0,this.enemyHp-(heavy?14:7));this.enemyHit=heavy?175:90;
        if(heavy){
          this.pressureGuard=true;this.lastPress=this.time;
          if(this.enemyPhase==='walk')this.braceAfterCombo=true;
        }
        this.impactHold=heavy?72:32;this.recoil=this.facing*(heavy?26:5);
        this.cues.push('impact');return;
      }
      if(this.attackAge>=a.duration){
        if(this.attack===3){
          this.nextComboAt=this.time+300;
          this.queued=0;
        }
        this.chain=!this.airKick&&this.connected&&this.attack!==3?this.attack:0;
        this.airKick=false;
        this.chainUntil=this.time+480;this.attack=0;this.attackAge=0;
        if(this.queued){this.queued--;this.startStrike();}
      }
    }
    const body:Box={left:this.x-25,right:this.x+25,bottom:this.height,top:this.height+(this.crouch?69:142)};
    if(this.projectileX!==null){
      const yard=this.creature==='golemPneus';
      this.shotAge+=dt;
      this.projectileX+=this.shotDirection*(yard?(this.projectileIsTyre?485:675):590)*dt;
      if(yard)this.projectileHeight=this.projectileIsTyre
        ? 19+42*Math.abs(Math.sin(this.shotAge*6))*Math.exp(-this.shotAge*.8)
        : 110+26*Math.sin(Math.min(Math.PI,this.shotAge*3));
      const rx=yard?(this.projectileIsTyre?17:13):14,ry=yard?(this.projectileIsTyre?17:7):9;
      if(overlap(body,{left:this.projectileX-rx,right:this.projectileX+rx,bottom:this.projectileHeight-ry,top:this.projectileHeight+ry})){
        this.projectileX=null;this.receive();
      }else if(this.projectileX<0||this.projectileX>1280)this.projectileX=null;
    }
    if(this.outcome||this.enemyHit||this.vortexStarts>=0)return;
    this.attackClock+=ms;
    switch(this.enemyPhase){
      case 'walk':
        if(this.braceAfterCombo){
          this.braceAfterCombo=false;
          if(this.time-this.lastBrace>=this.braceDelay){
            this.enemyPhase='guard';this.attackClock=0;this.lastBrace=this.time;break;
          }
        }
        if(this.attackClock>=this.durations.walk){
          const turn=this.enemyTurns++;
          if(turn%3===1 && Math.abs(this.x-this.enemyX)<(this.creature==='golemPneus'?235:200) && this.time-this.lastBrace>=this.braceDelay){
            this.enemyPhase='guard';this.attackClock=0;this.lastBrace=this.time;break;
          }
          const pattern=this.creature==='meduse'?tideMoves:this.creature==='golemPneus'?yardMoves:enemyMoves;
          this.enemyMove=pattern[turn%pattern.length]!;
          const swipeReach=this.creature==='meduse'?185:145;
          if(this.enemyMove==='swipe'&&Math.abs(this.x-this.enemyX)>swipeReach)this.enemyMove='bottle';
          this.enemyPhase='windup';this.attackClock=0;this.didStrike=false;
        }break;
      case 'windup':
        if(this.attackClock>=phaseDuration.windup){
          this.enemyPhase='strike';this.attackClock=0;
          this.cues.push('growl');
          if(this.enemyMove==='bottle'||this.enemyMove==='roll'){
            this.shotAge=0;this.projectileIsTyre=this.creature==='golemPneus'&&this.enemyMove==='roll';
            this.projectileHeight=this.enemyMove==='roll'?20:110;
            this.shotDirection=this.enemyFacing;this.projectileX=this.enemyX+this.enemyFacing*50;
            this.cues.push('throw');
          }
        }break;
      case 'strike': {
        const edge=this.enemyX+this.enemyFacing*(this.enemyMove==='rush'?86:this.creature==='meduse'?190:150);
        if((this.enemyMove==='rush'||this.enemyMove==='swipe')&&!this.didStrike&&overlap(body,{left:Math.min(this.enemyX,edge),right:Math.max(this.enemyX,edge),bottom:10,top:this.enemyMove==='rush'?101:75})){
          this.didStrike=true;this.receive();
        }
        if(this.attackClock>=phaseDuration.strike){this.enemyPhase='recover';this.attackClock=0;}break;
      }
      case 'guard':
        if(this.attackClock>=phaseDuration.guard){this.enemyPhase='recover';this.attackClock=0;}break;
      case 'recover':
        if(this.attackClock>=this.durations.recover){this.enemyPhase='walk';this.attackClock=0;}break;
    }
  }
}
