import type * as Phaser from 'phaser';
import { OIL_VENTS } from '../core/sac-duel';
import type { Era, ItemId } from '../core/types';
import { useSmallArt } from './device';

interface DuelFrame {
  x: number; height: number; crouch: boolean; facing: number; enemyX: number; enemyFacing: number;
  move: number; attack: 0|1|2|3; progress: number; enemyPhase: 'walk'|'windup'|'strike'|'recover'|'guard';
  enemyMove:'swipe'|'bottle'|'rush'|'roll'; blockFlash:number;
  enemyProgress: number; vanish: boolean; hit: number; enemyHit: number; tool: ItemId; time: number;
  projectileX: number|null; projectileHeight: number; projectileIsTyre:boolean; parryFlash: number;
  impactHold:number; pressureGuard:boolean;
  vortexProgress:number; vortexX:number; eruptionAge:number;
  wheelX:number; wheelHeight:number; wheelStage:'idle'|'coil'|'low'|'turn'|'high';
}

const ATLAS = 'duel-puppets', GROUND = 515;
type Ink = Phaser.GameObjects.Graphics;
type Sprite = Phaser.GameObjects.Image;
type Pt = { x:number; y:number };
const pt = (x:number,y:number):Pt => ({x,y});
const sat = (n:number) => Math.max(0, Math.min(1,n));
const mix = (a:number,b:number,t:number) => a+(b-a)*t;
const smooth = (t:number) => sat(t)**2*(3-2*sat(t));
const sin = Math.sin, cos = Math.cos, PI = Math.PI;

type DuelCreature = 'sacZombie'|'meduse'|'golemPneus';
export function preloadDuelArt(scene:Phaser.Scene,creature:DuelCreature='sacZombie'):void {
  const meduse=creature==='meduse',golem=creature==='golemPneus';
  const keys=golem?['golem-fighter','golem-hub']:meduse?['meduse-fighter','meduse-bell']:['smog-puff','astro-bag','sac-fighter','astro-bottle'];
  for(const key of keys) if(!scene.textures.exists(key)) scene.load.image(key,`art/${key}.webp`);
  if(golem){
    if(!scene.textures.exists('golem-bolt'))scene.load.svg('golem-bolt','art/golem-bolt.svg');
    if(!scene.textures.exists('golem-yard'))scene.load.image('golem-yard',`art/golem-yard${useSmallArt()?'@small':''}.webp`);
    if(!scene.textures.exists('golem-crowd'))scene.load.spritesheet('golem-crowd','art/golem-crowd.webp',{frameWidth:128,frameHeight:128});
    if(!scene.textures.exists('golem-parts'))scene.load.spritesheet('golem-parts','art/golem-parts.webp',{frameWidth:192,frameHeight:192});
  }
  if(meduse){
    if(!scene.textures.exists('meduse-shore')) scene.load.image('meduse-shore',`art/meduse-shore${useSmallArt()?'@small':''}.webp`);
    if(!scene.textures.exists('meduse-cheer')) scene.load.spritesheet('meduse-cheer','art/meduse-cheer.webp',{frameWidth:128,frameHeight:128});
  }
  if (!scene.textures.exists('duel-child-combo')) scene.load.spritesheet('duel-child-combo','art/duel-child-combo.webp',{frameWidth:320,frameHeight:224});
  if (!scene.textures.exists(ATLAS)) scene.load.atlas(ATLAS,'art/duel-puppets.webp','art/duel-puppets.json');
}

function stroke(g:Ink,a:Pt,b:Pt,w:number,color:number,alpha=1) {
  g.lineStyle(w,color,alpha).lineBetween(a.x,a.y,b.x,b.y);
  g.fillStyle(color,alpha).fillCircle(a.x,a.y,w*.5).fillCircle(b.x,b.y,w*.5);
}

// Place the joint on the chosen side of the shoulder/wrist (or hip/ankle) chord.
function joint(a:Pt,b:Pt,length:number,bend:number):Pt {
  const dx=b.x-a.x,dy=b.y-a.y,d=Math.max(1,Math.hypot(dx,dy));
  const k=Math.sqrt(Math.max(0,length*length-d*d*.25))/d*bend;
  return pt((a.x+b.x)*.5-dy*k,(a.y+b.y)*.5+dx*k);
}

function toolInk(g:Ink,id:ItemId,hand:Pt,angle:number,close:number) {
  const c=cos(angle),s=sin(angle);
  const p=(x:number,y:number)=>pt(hand.x+x*c-y*s,hand.y+x*s+y*c);
  const line=(x:number,y:number,X:number,Y:number,w:number,col:number)=>stroke(g,p(x,y),p(X,Y),w,col);
  const shaft=id==='pince'?83:id==='eponge'?33:64;
  line(-9,0,shaft,0,6,0x493e35); line(-9,-1,shaft,-1,3,0xe5c68b);
  if(id==='pince'||id==='cle'){
    const gap=id==='cle'?10:mix(16,5,close);
    for(const sign of [-1,1]){
      line(shaft,0,shaft+12,gap*sign,6,0x394d56);
      line(shaft+12,gap*sign,shaft+23,(gap-2)*sign,5,0xc0e1da);
    }
  }else if(id==='eponge'){
    line(shaft,-9,shaft,9,19,0xdd932e); line(shaft+2,-8,shaft+2,8,15,0xffdf6d);
    for(let i=0;i<5;i++)line(shaft+(i%2)*5-2,i*3-7,shaft+(i%2)*5-1,i*3-7,2,0xc48631);
  }else if(id==='aspirateur'){
    line(8,0,27,0,19,0x425e69); line(11,-4,23,-4,8,0x77d9cf);
    line(shaft,-9,shaft,9,6,0x303d50);
  }else if(id==='filet'){
    const rim=p(shaft+6,0);g.lineStyle(3,0xa7d4bc).strokeCircle(rim.x,rim.y,16);
    for(let i=-1;i<=1;i++)line(shaft-5,i*7,shaft+17,i*7,1,0x73b19d);
  }else if(id==='rateau'||id==='balayette'||id==='brosse'||id==='raclette'){
    line(shaft,-14,shaft,14,6,0x5d7777);
    if(id==='raclette')line(shaft+4,-16,shaft+4,16,5,0xa6c9c1);
    else for(let i=-2;i<=2;i++)line(shaft,i*6,shaft+(id==='rateau'?15:8),i*6,3,id==='rateau'?0xa9bcbc:0xddbd77);
  }else if(id==='aimant'){
    line(shaft,-8,shaft,8,6,0xc95345);
    for(const sign of [-1,1])line(shaft,sign*8,shaft+11,sign*8,6,0xc9d1c7);
  }else{
    for(let i=-3;i<=3;i++){
      line(shaft-3,0,shaft+8,i*2.3,5,0xb7a581);
      line(shaft+8,i*2.3,shaft+15-Math.abs(i)*2,i*3.6+3,4,i%2?0xf6ebcb:0xd8c5a1);
    }
    line(shaft-6,-4,shaft-6,4,5,0x349c9a);
  }
}

const looks = {
  child:{sleeve:0x56853b,light:0x99b953, head:53,chest:37},
  young:{sleeve:0x276964,light:0x679b82, head:46,chest:40},
  adult:{sleeve:0x686842,light:0x999366, head:43,chest:44},
  hero:{sleeve:0x204e94,light:0x4e8cca, head:42,chest:48},
};

class HeroRig {
  readonly root:Phaser.GameObjects.Container;
  private readonly legs:{ thigh:Sprite; calf:Sprite; shoe:Sprite }[];
  private readonly rear:Ink;
  private readonly fore:Ink;
  private readonly cuffs:{sleeve:Sprite; fist:Sprite}[];
  private readonly cape:Ink;
  private readonly face:Sprite;
  private readonly chest:Sprite;

  constructor(scene:Phaser.Scene,private readonly era:Era) {
    this.root=scene.add.container();
    const sprite=(name:string)=>{
      const o=scene.add.image(0,0,ATLAS,`${era}-${name}`);
      this.root.add(o);return o;
    };
    const ink=()=>{const o=scene.add.graphics();this.root.add(o);return o;};
    this.cape=ink();
    this.legs=[0,1].map(i=>{
      const thigh=sprite('thigh'),calf=sprite('calf'),shoe=sprite('shoe');
      if(!i)for(const o of [thigh,calf,shoe])o.setTint(0xa7a9ae);
      return {thigh,calf,shoe};
    });
    this.rear=ink();
    const cuff=()=>{
      const sleeve=sprite('sleeve'),fist=scene.add.image(0,0,ATLAS,'fist');
      this.root.add(fist);
      return {sleeve,fist};
    };
    this.cuffs=[cuff()];
    this.chest=sprite('chest').setOrigin(.52,.94);
    this.face=sprite('face').setOrigin(.52,.95);
    this.fore=ink();
    this.cuffs.push(cuff());
  }

  private leg(i:number,hip:Pt,ankle:Pt,kick:number) {
    const knee=joint(hip,ankle,32, -1);
    knee.y=Math.min(knee.y,-15);
    const {thigh,calf,shoe}=this.legs[i]!;
    const bone=(img:Sprite,a:Pt,b:Pt,w:number)=>{
      const dx=b.x-a.x,dy=b.y-a.y;
      img.setOrigin(.32,.12).setPosition(a.x,a.y).setDisplaySize(w,Math.hypot(dx,dy)+10)
        .setRotation(Math.atan2(dy,dx)-PI/2+.21);
    };
    bone(thigh,hip,knee,22);bone(calf,knee,ankle,20);
    shoe.setOrigin(.36,.27).setPosition(ankle.x,ankle.y).setDisplaySize(25,15).setRotation(-.34*kick);
  }

  private arm(g:Ink,a:Pt,hand:Pt,rear:boolean) {
    const e=joint(a,hand,23,1), look=looks[this.era], w=rear?11:13;
    const cuff=pt(mix(e.x,hand.x,.75),mix(e.y,hand.y,.75));
    stroke(g,a,e,w+3,0x4d402d);stroke(g,e,hand,w,0x79472b);
    stroke(g,e,hand,w-2,this.era==='hero'?0xc53730:0xe49d64);
    stroke(g,a,e,w,look.sleeve);
    stroke(g,pt(a.x,a.y-2),pt(mix(a.x,e.x,.8),mix(a.y,e.y,.8)-2),w*.36,look.light);
    stroke(g,cuff,hand,w+2,rear?0x286362:0x347f74);
    const {sleeve,fist}=this.cuffs[rear?0:1]!;
    sleeve.setOrigin(.5,.13).setPosition(a.x,a.y).setRotation(Math.atan2(e.y-a.y,e.x-a.x)-PI/2)
      .setDisplaySize(w+3,Math.hypot(e.y-a.y,e.x-a.x)+5);
    fist.setPosition(hand.x+2,hand.y).setDisplaySize(rear?14:17,rear?14:16)
      .setRotation(Math.atan2(hand.y-e.y,hand.x-e.x)+1.15);
  }

  pose(s:DuelFrame) {
    const look=looks[this.era],p=sat(s.progress),phase=s.time*.015;
    // Anticipation, a short accented extension, then a slower return to guard.
    const extend=smooth((p-.14)/.18)*(1-smooth((p-.50)/.50));
    const coil=sin(PI*sat(p/.28))*(p<.28?1:0);
    const jab=s.attack===1?extend:0,kick=s.attack===2?extend:0,tool=s.attack===3?extend:0;
    const wind=s.attack?coil:0,duck=Number(s.crouch),air=sat(s.height/28);
    const stride=s.move*s.facing*(s.attack?.28:1)*(1-air);
    const gait=sin(phase)*stride, bob=sin(s.time*.006)*1.4+Math.abs(gait)*3;
    const hurt=sat(s.hit/160), tilt=jab*.36-kick*.34+tool*.23-wind*.22-hurt*.35+duck*.38;
    const hip=pt(15*jab+15*tool+18*kick-6*wind,-58+duck*35+bob);
    const shoulder=pt(hip.x+sin(tilt)*39,hip.y-(look.chest-4)*(1-duck*.33));
    const rearFoot=pt(-22-gait*24,-10-air*12-Math.max(0,-gait)*10);
    const chamber=s.attack===2?wind:0;
    const foot=pt(22+gait*22+kick*78-chamber*9,-10-air*28-Math.max(0,gait)*13-kick*(64-duck*36)-chamber*25);
    this.leg(0,pt(hip.x-6,hip.y),rearFoot,0);
    this.leg(1,pt(hip.x+5,hip.y),foot,kick);
    this.cape.clear();
    if(this.era==='hero'){
      const hem=pt(hip.x-29-gait*5-extend*15,hip.y+23+sin(phase*.55)*3);
      this.cape.fillStyle(0x8f2732).fillTriangle(shoulder.x-8,shoulder.y-2,hem.x,hem.y,hip.x+9,hip.y+10);
      this.cape.fillStyle(0xce3f38).fillTriangle(shoulder.x-8,shoulder.y-2,hem.x,hem.y,hem.x+10,hem.y-6);
    }
    this.chest.setPosition(hip.x,hip.y+3).setDisplaySize(this.era==='hero'?41:35,look.chest*(1-duck*.33)+4).setRotation(tilt);
    this.face.setPosition(shoulder.x+3,shoulder.y+1).setDisplaySize(look.head,look.head*(1-duck*.12))
      .setRotation(tilt*.42+wind*.12+hurt*.17);
    const back=pt(shoulder.x+20-extend*18-gait*8,shoulder.y-2+wind*7);
    const hand=pt(shoulder.x+19+jab*55+tool*35+gait*7-wind*19,shoulder.y-6+jab*21+tool*16+wind*4);
    this.rear.clear();this.fore.clear();
    this.arm(this.rear,pt(shoulder.x+6,shoulder.y+6),back,true);
    if(s.attack===3)toolInk(this.fore,s.tool,hand,-1.15-wind*.95+tool*1.17,tool);
    this.arm(this.fore,pt(shoulder.x-7,shoulder.y+8),hand,false);
  }
}

// A tapered strip with two banks; shared by the soft limbs and by the moving oil column.
function ribbon(g:Ink,path:Pt[],width:(u:number)=>number,color:number,alpha=1,offset=0) {
  const left:Pt[]=[],right:Pt[]=[];
  path.forEach((p,i)=>{
    const a=path[Math.max(0,i-1)]!, b=path[Math.min(path.length-1,i+1)]!;
    const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,w=width(i/(path.length-1));
    left.push(pt(p.x-dy/len*(w+offset),p.y+dx/len*(w+offset)));
    right.push(pt(p.x-dy/len*(offset-w),p.y+dx/len*(offset-w)));
  });
  g.fillStyle(color,alpha).beginPath().moveTo(left[0]!.x,left[0]!.y);
  for(let i=1;i<left.length;i++)g.lineTo(left[i]!.x,left[i]!.y);
  for(let i=right.length-1;i>=0;i--)g.lineTo(right[i]!.x,right[i]!.y);
  g.closePath().fillPath();
}

class MeduseRig {
  private readonly limbs:Ink;
  private readonly bell:Sprite;
  constructor(scene:Phaser.Scene,private readonly root:Phaser.GameObjects.Container){
    this.limbs=scene.add.graphics();
    this.bell=scene.add.image(0,0,'meduse-bell').setOrigin(.5,.76);
    root.add([this.limbs,this.bell]);
  }
  pose(s:DuelFrame,fx:Ink){
    const t=s.time*.0035,p=sat(s.enemyProgress);
    const wind=s.enemyPhase==='windup'?smooth(p):0;
    const strike=s.enemyPhase==='strike'?1-.16*smooth(p):s.enemyPhase==='recover'?.84*(1-smooth(p)):0;
    const guard=s.enemyPhase==='guard'||(s.pressureGuard&&s.enemyPhase==='walk');
    const rush=s.enemyMove==='rush'?strike:0,whip=s.enemyMove==='swipe'?strike:0;
    const low=s.enemyMove==='roll',spit=s.enemyMove==='bottle';
    const pulse=sin(t), lift=-90+pulse*4+wind*(low?27:spit?-14:7)+strike*(low?27:spit?-12:4);
    const lean=rush*25-wind*7-sat(s.enemyHit/120)*9;
    this.root.setPosition(s.enemyX,GROUND).setScale(s.enemyFacing,1);
    this.bell.setPosition(lean,lift).setDisplaySize(110+pulse*3+wind*10+rush*11,80-pulse*3-wind*8)
      .setRotation(.045*sin(t*.7)+rush*.51-.15*wind).setTint(s.enemyHit?0xffb89d:0xffffff);
    const g=this.limbs.clear();
    for(let i=0;i<7;i++){
      const anchor=(i-3)*12,active=i===6;
      const path=Array.from({length:16},(_,j)=>{
        const u=j/15, lag=sin(t*1.15+i*1.8-u*6.8), whipReach=active?whip:0;
        let x=lean+anchor+u*(.36*anchor+lag*(9+5*u)-rush*82);
        let y=lift-6+u*(75+9*cos(i*1.9)-10*lag*u);
        if(guard){
          x=mix(x,lean+anchor+(62-anchor)*u+23*sin(PI*u),.94);
          y=mix(y,lift-5+49*sin(PI*u)-35*u,.94);
        }else if(active){
          x+=u*(138*whipReach-52*wind+((spit||low)?24*strike:0));
          y+=u*((spit?-65:low?-14:0)*strike-24*whipReach)-30*sin(PI*u)*wind;
        }
        return pt(x,y);
      });
      const w=(u:number)=>(active?6:5)*(1-.90*u);
      ribbon(g,path,w,0x1e1b29);
      ribbon(g,path,u=>w(u)*.34,i%2?0x655579:0x50556a,.96,-1);
    }
    if(guard)fx.lineStyle(s.blockFlash?5:2,s.blockFlash?0xffffff:0x94d4cc,.86)
      .strokeEllipse(s.enemyX+s.enemyFacing*55,GROUND-79,24,100);
    if(spit&&wind) oilDrop(fx,s.enemyX+s.enemyFacing*48,GROUND-110,4+10*wind,5+6*wind);
    if(low&&wind) oilDrop(fx,s.enemyX+s.enemyFacing*43,GROUND-20,6+20*wind,3+5*wind);
    if(wind>.4&&!spit&&!low){
      const y=GROUND-(s.enemyMove==='swipe'?43:83);
      for(let i=0;i<3;i++)fx.lineStyle(2,0xffdb75,wind).lineBetween(s.enemyX+s.enemyFacing*52,y+i*6,
        s.enemyX+s.enemyFacing*(60+i*3),y+i*6-2);
    }
  }
}

class GolemRig {
  private readonly body:Phaser.GameObjects.Container;
  private readonly boots:Sprite[];
  private readonly core:Sprite;
  private readonly head:Sprite;
  private readonly arms:{rim:Sprite;piston:Sprite;fist:Sprite}[];
  private readonly wheel:Sprite;

  constructor(scene:Phaser.Scene,private readonly root:Phaser.GameObjects.Container){
    this.body=scene.add.container();root.add(this.body);
    const piece=(frame:number,w:number,h:number,oy=.5)=>{
      const img=scene.add.image(0,0,'golem-parts',frame).setDisplaySize(w,h).setOrigin(.5,oy);
      this.body.add(img);return img;
    };
    const arm=()=>({piston:piece(5,24,43,.12),fist:piece(3,34,52,.1),rim:piece(2,44,47)});
    this.arms=[arm()];
    this.boots=[piece(4,38,52,.94).setTint(0xb7bdca),piece(4,45,56,.94)];
    this.core=piece(0,88,79,.66);
    this.head=piece(1,56,60,.85);
    this.arms.push(arm());
    this.wheel=scene.add.image(0,0,'golem-parts',2).setDisplaySize(92,92).setVisible(false);
    root.add(this.wheel);
  }

  pose(s:DuelFrame,fx:Ink){
    const p=sat(s.enemyProgress),stage=s.wheelStage;
    const coil=stage==='coil'?smooth(s.vortexProgress):0;
    const rolling=stage!=='idle'&&stage!=='coil',wheelMix=rolling?1:smooth((coil-.45)/.55);
    const cx=stage==='idle'?s.enemyX:s.wheelX,cy=GROUND-s.wheelHeight;
    this.root.setPosition(cx,GROUND).setScale(s.enemyFacing,1);
    this.body.setVisible(wheelMix<1).setAlpha(1-wheelMix);
    this.wheel.setVisible(wheelMix>0).setAlpha(wheelMix)
      .setPosition(0,-s.wheelHeight).setDisplaySize(92,92)
      .setRotation(rolling?s.time*(stage==='high'?-.014:.014):coil*.9);
    if(wheelMix>0){
      const dir=s.enemyFacing*(stage==='high'?-1:1),turn=stage==='turn';
      for(let i=0;i<8;i++){
        const u=(s.time*.0028+i*.127)%1;
        const contact=stage!=='high',x=cx-dir*((contact?7:35)+(i%3)*7+u*(turn?78:45));
        const y=(contact?GROUND-3:cy-12+(i%4)*8)-sin(PI*u)*(turn?48:13);
        fx.lineStyle(i%3===0?2:1,i%2?0xffbe66:0xffe6a1,(1-u)*wheelMix)
          .lineBetween(x,y,x-dir*(3+8*u),y+(contact?u*4:0));
      }
    }
    if(!this.body.visible)return;
    const gait=s.enemyPhase==='walk'?sin(s.time*.011):0;
    const wind=s.enemyPhase==='windup'&&!coil?smooth(p):0;
    const drive=s.enemyPhase==='strike'?1-.16*smooth(p):s.enemyPhase==='recover'?.84*(1-smooth(p)):0;
    const block=s.enemyPhase==='guard'||(s.pressureGuard&&s.enemyPhase==='walk');
    const rush=s.enemyMove==='rush',low=s.enemyMove==='roll',toss=s.enemyMove==='bottle';
    const x=drive*(rush?28:13)-wind*9-sat(s.enemyHit/120)*9;
    const bob=Math.abs(gait)*3+sin(s.time*.004)*1.3+wind*(low?21:6)+drive*(low?15:6);
    this.body.setScale(1-.13*coil,1-.48*coil);
    const tint=s.enemyHit?0xffb3a0:0xffffff;
    this.core.setPosition(x,-72+bob).setRotation(.05*gait+.19*drive-.12*wind).setTint(tint);
    this.head.setPosition(x+9+drive*6,-115+bob+coil*17).setRotation(.05*gait-.13*wind+.12*drive).setTint(tint);
    this.boots.forEach((boot,i)=>{
      const step=(i?-1:1)*gait;
      boot.setPosition((i?-23:19)+step*15+(i?-1:1)*drive*5,-1-Math.max(0,step)*12)
        .setRotation(-step*.20);
    });
    this.arms.forEach(({rim,piston,fist},i)=>{
      const sx=x+(i?-30:30),sy=-98+bob;
      const swing=(i?-1:1)*gait*.26;
      const a=block?(i?-1.08:-.91):coil?(i?-.75:.95):
        i?swing+wind*.85-drive*(rush?.8:1.55):-swing-wind*.57+drive*.46;
      const elbow=pt(sx-34*sin(a),sy+34*cos(a));
      const b=block?-2.45:coil?-2.0:i?-.47+swing*.4+wind*(toss?-2.2:.81)-drive*(low?.22:1.24):-.72-swing*.35;
      piston.setPosition(sx,sy).setRotation(a);
      fist.setPosition(elbow.x,elbow.y).setRotation(b).setTint(i?tint:0xbfc4c8);
      rim.setPosition(sx,sy).setRotation(a*.42).setTint(i?tint:0xc2c5c6);
    });
    if(block)fx.lineStyle(s.blockFlash?5:2,s.blockFlash?0xffffff:0x9be2e2,.83)
      .strokeEllipse(cx+s.enemyFacing*53,GROUND-75,24,102);
  }
}

function oilDrop(g:Ink,x:number,y:number,rx:number,ry:number){
  g.fillStyle(0x201d2b).fillEllipse(x,y,rx*2,ry*2);
  g.fillStyle(0x655073).fillEllipse(x-rx*.09,y-ry*.22,rx*1.58,ry*.85);
  g.fillStyle(0xb3d6c7).fillEllipse(x-rx*.24,y-ry*.4,rx*.72,ry*.27);
}

function oilSurge(g:Ink,s:DuelFrame){
  const p=sat(s.vortexProgress),u=sat(s.eruptionAge/OIL_VENTS.fade);
  for(const offset of OIL_VENTS.offsets){
    const cx=s.vortexX+offset,base=OIL_VENTS.radius*(.55+.45*p)*(1-u);
    oilDrop(g,cx,GROUND-2,base,8*(1-u));
    if(s.eruptionAge<0){
      g.lineStyle(2,0xffc36c,.35+.6*p).strokeEllipse(cx,GROUND-2,2*OIL_VENTS.radius,18);
      for(let i=0;i<6;i++){
        const bubble=(s.time*(.0015+.001*p)+i*.31)%1;
        oilDrop(g,cx+sin(i*13+offset)*base*.78,GROUND-5-14*p*bubble,5*(1-bubble),5*(1-bubble));
      }
    }else{
      const h=OIL_VENTS.height*(1-u*u);
      for(let i=-2;i<=2;i++){
        const foot=cx+i*7,tip=foot+i*(9+u*10);
        const y=GROUND-h*(1-.18*Math.abs(i));
        g.fillStyle(0x292534,1-u).fillTriangle(foot-10,GROUND,foot+12,GROUND,tip,y);
        g.lineStyle(3,0x9c86a8,1-u).lineBetween(foot+2,GROUND-4,tip,y+6);
        oilDrop(g,tip+i*10*u,y-14*sin(PI*u),5*(1-u),8*(1-u));
      }
    }
  }
}

export class DuelArt {
  fall(scene:Phaser.Scene, loser:'hero'|'sack', facing:number):void {
    const body=loser==='sack'?this.sack:this.cels?.visible?this.cels:this.hero.root;
    body.setAlpha(1);
    this.echo.root.setVisible(false);this.fx.clear();this.bottle?.setVisible(false);
    for(const sprite of [...this.funnel,...this.litter])sprite.setVisible(false);
    scene.tweens.add({targets:body,angle:-facing*86,x:Math.max(145,Math.min(1135,body.x-facing*28)),y:GROUND-15,
      duration:510,ease:'Quad.easeIn'});
  }
  private readonly cels?:Sprite;
  private readonly ground:Ink;
  private readonly fx:Ink;
  private readonly hero:HeroRig;
  private readonly echo:HeroRig;
  private readonly sack:Phaser.GameObjects.Container;
  private readonly sackParts?:{ core:Sprite; claw:Sprite; club:Sprite; feet:Sprite[] };
  private readonly meduse?:MeduseRig;
  private readonly golem?:GolemRig;
  private readonly bottle?:Sprite;
  private readonly funnel:Sprite[];
  private readonly litter:Sprite[];
  constructor(scene:Phaser.Scene,era:Era,creature:DuelCreature='sacZombie') {
    this.ground=scene.add.graphics();
    this.echo=new HeroRig(scene,era);this.echo.root.setVisible(false);
    this.sack=scene.add.container();
    const enemy=(name:string,ox:number,oy:number)=>{
      const o=scene.add.image(0,0,ATLAS,name).setOrigin(ox,oy);
      this.sack.add(o);return o;
    };
    if(creature==='meduse')this.meduse=new MeduseRig(scene,this.sack);
    else if(creature==='golemPneus')this.golem=new GolemRig(scene,this.sack);
    else this.sackParts={feet:[enemy('rear-foot',.82,.14),enemy('front-foot',.23,.14)],
      claw:enemy('claw',.91,.10),core:enemy('sack',.5,.94),club:enemy('bottle-arm',.05,.17)};
    this.hero=new HeroRig(scene,era);
    this.funnel=!this.sackParts?[]:Array.from({length:22},()=>scene.add.image(0,0,'smog-puff').setVisible(false));
    this.litter=!this.sackParts?[]:Array.from({length:10},(_,i)=>scene.add.image(0,0,i%3?'astro-bottle':'astro-bag').setVisible(false));
    if(era==='child')this.cels=scene.add.image(0,0,'duel-child-combo').setOrigin(60/320,217/224).setVisible(false);
    this.fx=scene.add.graphics();
    if(this.golem)this.bottle=scene.add.image(0,0,'golem-hub').setVisible(false);
    else if(!this.meduse)this.bottle=scene.add.image(0,0,'astro-bottle').setDisplaySize(17,38).setVisible(false);
  }

  private enemy(s:DuelFrame) {
    if(this.meduse)return this.meduse.pose(s,this.fx);
    if(this.golem)return this.golem.pose(s,this.fx);
    const {feet,core,claw,club}=this.sackParts!;
    const p=sat(s.enemyProgress),walk=s.enemyPhase==='walk';
    const stride=walk?sin(s.time*.012):0;
    const wind=s.enemyPhase==='windup'?smooth(p):0;
    const swipe=s.enemyPhase==='strike'?1-smooth((p-.35)/.9):s.enemyPhase==='recover'?(1-smooth(p))*0.18:0;
    const hurt=sat(s.enemyHit/100),sway=stride*2+swipe*24-wind*12-hurt*10;
    const bob=Math.abs(stride)*4+wind*8+swipe*6+sin(s.time*.006)*1.6;
    const squeeze=s.impactHold>0?(s.attack===3?.20:.09):0;
    this.sack.setPosition(s.enemyX,GROUND).setScale(s.enemyFacing*.65*(1-squeeze),.65*(1+squeeze*.5));
    feet.forEach((foot,i)=>{
      const step=(i?1:-1)*stride;
      foot.setPosition((i?39:-40)+step*12,-46-Math.max(0,step)*14).setRotation(step*.22);
    });
    core.setPosition(sway,-38+bob).setScale(1+wind*.08,1-wind*.09).setRotation(.055*stride-wind*.16+swipe*.2-hurt*.14);
    claw.setPosition(sway-45,-129+bob).setRotation(.19*stride+wind*.75-swipe*.75);
    club.setPosition(sway+48,-121+bob).setRotation(-.22*stride-2.55*wind-.94*swipe)
      .setScale(1+swipe*.47,1+swipe*.18);
    if(s.enemyPhase==='guard'||(s.pressureGuard&&s.enemyPhase==='walk')){
      claw.setRotation(-1.05);club.setRotation(-1.35);
      const gx=s.enemyX+s.enemyFacing*49;
      this.fx.lineStyle(s.blockFlash?6:2,s.blockFlash?0xffffff:0x93d9e6,.9)
        .strokeEllipse(gx,GROUND-80,26,108);
    }else if(wind||swipe){
      if(s.enemyMove==='rush')core.setRotation(.45*swipe-.30*wind);
      if(s.enemyMove==='roll')club.y+=52*(wind||swipe);
    }
    const tint=s.enemyHit>0?0xffb89d:0xffffff;
    core.setTint(tint);club.setTint(tint);
    if(wind>.45){
      const x=s.enemyX+s.enemyFacing*26,y=GROUND-158,flash=smooth((wind-.45)/.55);
      for(let i=0;i<3;i++){
        const a=-2.15+i*.53;
        this.fx.lineStyle(3,0xffdb75,flash).lineBetween(x+cos(a)*10,y+sin(a)*10,x+cos(a)*21,y+sin(a)*21);
      }
    }
  }

  private burst(x:number,y:number,life:number,cool:boolean) {
    const a=sat(life),r=10+36*(1-a),g=this.fx;
    const light=cool?0xcbfffa:0xfff2ad, color=cool?0x32cdbc:0xff8a42;
    for(let i=0;i<9;i++){
      const ang=i*PI*2/9+.23,c=cos(ang),s=sin(ang),reach=r*(i%2?.76:1.22);
      const bx=x+c*r*.48,by=y+s*r*.48;
      g.fillStyle(i%3?color:light,a).fillTriangle(bx-3*s,by+3*c,bx+3*s,by-3*c,x+c*reach,y+s*reach);
    }
    g.fillStyle(light,a).fillCircle(x,y,3+6*a);
  }

  draw(s:DuelFrame):void {
    const g=this.fx.clear(), floor=this.ground.clear(),y=GROUND-s.height, f=s.facing;
    const shadow=(x:number,w:number,alpha:number)=>{
      floor.fillStyle(0x24352b,alpha*.48).fillEllipse(x,GROUND+2,w+12,14);
      floor.fillStyle(0x162925,alpha).fillEllipse(x,GROUND+1,w,8);
    };
    const lift=this.golem&&s.wheelStage!=='idle'?sat((s.wheelHeight-45)/95):0;
    shadow(s.enemyX,100-44*lift,.32-.16*lift);shadow(s.x,71-24*sat(s.height/165),.36-.22*sat(s.height/165));
    this.enemy(s);
    for(const sprite of this.funnel)sprite.setVisible(s.vortexProgress>=0);
    for(const sprite of this.litter)sprite.setVisible(s.vortexProgress>=0);
    if(s.vortexProgress>=0 && this.meduse)oilSurge(g,s);
    else if(s.vortexProgress>=0 && this.sackParts){
      const p=s.vortexProgress, cx=s.vortexX, h=60+260*p;
      this.funnel.forEach((v,i)=>{
        const z=i/(this.funnel.length-1), a=s.time*.007+z*9,r=9+(18+68*p)*z*z;
        v.setPosition(cx+r*.43*cos(a)+15*z*sin(a*.48),GROUND-6-h*z+5*sin(a))
          .setDisplaySize(28+r*1.95,20+r*.68).setRotation(.24*sin(a)-.14)
          .setAlpha((.46+.28*cos(a))*Math.min(1,p*9)).setTint(cos(a)>0?0xe3dece:0x9aa6a1);
      });
      this.litter.forEach((v,i)=>{
        const z=(i/10+s.time*.00055)%1,a=s.time*.009+i*2.4,r=11+(20+68*p)*z;
        v.setPosition(cx+r*cos(a),GROUND-8-h*z+12*sin(a)).setRotation(a*.8)
          .setScale((i%3?22:29)/Math.max(v.frame.width,v.frame.height)*(1+.22*sin(a)))
          .setAlpha((.65+.32*sin(a))*Math.min(1,p*8));
      });
    }
    const painted=!!this.cels && !s.vanish && !s.hit && !s.crouch && s.height===0 &&
      (s.attack===1 || s.attack===2 || (s.attack===3 && s.tool==='pince') || (!s.attack && !s.move));
    this.hero.root.setVisible(!painted);
    if(!painted){
      this.hero.pose(s);
      this.hero.root.setPosition(s.x,y).setScale(f,1).setAlpha(s.vanish?.13:1);
    }
    if(this.cels){
      this.cels.setVisible(painted);
      if(painted){
        const p=s.progress,heavy=s.attack===3;
        const col=!s.attack?0:heavy?(p<.16?0:p<.29?1:p<.71?2:3):(p<.21?0:p<.46?1:p<.68?2:3);
        const thrust=s.attack?smooth(p/.24)*(1-smooth((p-.57)/.43)):0;
        this.cels.setFrame(Math.max(0,s.attack-1)*4+col).setPosition(s.x+f*(-21+thrust*(heavy?19:13)),y)
          .setScale(f*.76,.76);
      }
    }
    this.echo.root.setVisible(s.vanish);
    if(s.vanish){
      this.echo.pose(s);this.echo.root.setPosition(s.x-f*22,y-2).setScale(f,1).setAlpha(.24);
      for(let i=0;i<8;i++){
        const t=(s.time*.004+i*.137)%1;
        const X=s.x+f*(22-i*4-t*29),Y=y-15-i*14-t*8;
        g.fillStyle(i%2?0x98ffe1:0xe3ffbc,sin(t*PI)*.9)
          .fillTriangle(X,Y-2,X+f*(14+9*t),Y,X-f*14,Y+3);
      }
    }
    if(s.attack && s.progress>.19 && s.progress<.64){
      const k=sin(PI*sat((s.progress-.19)/.45)),high=y-(s.crouch?37:76);
      const reach=s.attack===1?107:s.attack===2?126:s.tool==='pince'?180:148;
      for(let i=0;i<3;i++){
        const X=s.x+f*(reach-i*8-8*(1-k)),Y=high+(i-1)*7;
        g.fillStyle(s.attack===3?0x9ff9dc:0xffe7a0,k*.84)
          .fillTriangle(X,Y,X-f*(16+i*7)*k,Y+2,X-f*(24+i*6)*k,Y+3+i);
      }
    }
    if(s.enemyHit>0)this.burst(s.enemyX+s.enemyFacing*32,GROUND-(s.crouch?43:78),sat(s.enemyHit/(s.attack===3?175:90)),false);
    if(s.hit>0)this.burst(s.x+f*12,y-84,s.hit/320,false);
    if(s.parryFlash>0){
      const a=sat(s.parryFlash/300);
      g.lineStyle(1+3*a,0xacffe1,a).strokeEllipse(s.x,y-69,85+46*(1-a),139+28*(1-a));
      this.burst(s.x+f*27,y-81,a,true);
    }
    this.bottle?.setVisible(s.projectileX!==null);
    if(s.projectileX!==null){
      const Y=GROUND-s.projectileHeight;
      if(this.golem){
        const tyre=s.projectileIsTyre;
        this.bottle?.setTexture(tyre?'golem-parts':'golem-bolt',tyre?2:undefined)
          .setDisplaySize(tyre?38:31,tyre?38:18);
      }
      if(this.meduse){
        const low=s.projectileHeight<50,rx=low?32:16,ry=low?7:12;
        oilDrop(g,s.projectileX,Y,rx,ry);
        for(let i=1;i<=3;i++)oilDrop(g,s.projectileX-s.enemyFacing*(rx+i*5),
          Y+sin(s.time*.015+i)*ry*.42,5-i,4-i*.7);
        return;
      }
      this.bottle?.setPosition(s.projectileX,Y).setRotation(s.time*.016*s.enemyFacing);
      for(let i=0;i<3;i++)g.lineStyle(2,0xe0fbff,.68-i*.13)
        .lineBetween(s.projectileX-s.enemyFacing*13,Y-6+i*6,s.projectileX-s.enemyFacing*(29+i*4),Y-6+i*6);
    }
  }
}
