import * as Phaser from 'phaser';
import { debugInfo } from '../app';
import type { CombatSession, CombatOutcome } from '../core/combat';
import { DUEL_MS, SacDuel } from '../core/sac-duel';
import { weaponDef } from '../core/combat';
import { ITEMS } from '../data/items';
import { CREATURES } from '../data/content';
import { eraOfAge } from '../data/balance';
import { boardLook } from '../data/art';
import type { ItemId } from '../core/types';
import { DuelArt, preloadDuelArt } from '../ui/duel-art';
import { DuelAudio } from '../ui/duel-audio';
import { FONT } from '../ui/theme';
import { isTouch, useSmallArt } from '../ui/device';
import { showTileDialog } from '../ui/tile-dialog';

export interface SacOptions {
  session:CombatSession;
  age:number;
  settle:(outcome:CombatOutcome)=>{delta:number;gift:ItemId|null};
  leave:()=>void;
}

const ARENAS = {
  sacZombie:{scene:'Sac',fighter:'sac-fighter',yard:'sac-dump',crowd:'sac-crowd'},
  meduse:{scene:'Meduse',fighter:'meduse-fighter',yard:'meduse-shore',crowd:'meduse-cheer'},
  golemPneus:{scene:'Golem',fighter:'golem-fighter',yard:'golem-yard',crowd:'golem-crowd'},
} as const;

export class SacScene extends Phaser.Scene {
  constructor(){super('Sac');}
  private creature:keyof typeof ARENAS='sacZombie';
  init({session}:SacOptions):void {
    this.creature=session.creature==='meduse'||session.creature==='golemPneus'?session.creature:'sacZombie';
  }
  preload():void {
    preloadDuelArt(this,this.creature);
    for(const key of ['duel-hud-rpg','duel-life'])if(!this.textures.exists(key))this.load.svg(key,`art/${key}.svg`);
    if(this.creature!=='sacZombie')return;
    if(!this.textures.exists('sac-dump'))this.load.image('sac-dump',`art/sac-dump${useSmallArt()?'@small':''}.webp`);
    if(!this.textures.exists('sac-crowd'))this.load.spritesheet('sac-crowd','art/sac-crowd.webp',{frameWidth:128,frameHeight:128});
  }
  create({session,age,settle,leave}:SacOptions):void {
    const creature=this.creature, meduse=creature==='meduse', golem=creature==='golemPneus';
    const arena=ARENAS[creature], paintedCrowd=creature!=='sacZombie';
    const name=CREATURES[creature].label, fighterKey=arena.fighter;
    debugInfo.scene=arena.scene;
    const tools=session.weaponOptions().sort((a,b)=>b.multiplier-a.multiplier);
    const d=new SacDuel(session.maxHp*21,tools[0]!.weapon,creature);
    this.add.image(640,360,arena.yard).setDisplaySize(1280,720).setDepth(-10);
    const arms=this.add.graphics().setDepth(-6);
    const crowd=[{x:115,y:350,size:118},{x:282,y:359,size:96},{x:1090,y:355,size:110}].map(({x,y,size},i)=>({
      sprite:this.add.image(x,y,arena.crowd,paintedCrowd?i*8:i).setOrigin(.5,1).setDepth(-5),x,y,size,
    }));
    const art=new DuelArt(this,session.era,creature),audio=new DuelAudio(this,creature);
    this.add.image(640,56,'duel-hud-rpg').setDepth(19);
    const life=[this.add.image(103,66,'duel-life').setOrigin(0,.5),this.add.image(1177,66,'duel-life').setOrigin(0,.5).setScale(-1,1)];
    life.forEach(bar=>bar.setDepth(20));
    const text=(x:number,y:number,size:number)=>this.add.text(x,y,'',{fontFamily:FONT,fontSize:`${size}px`,fontStyle:'bold',
      color:'#fff4d7',stroke:'#282b32',strokeThickness:4,resolution:2}).setOrigin(.5).setDepth(21);
    const hero=text(111,31,25).setOrigin(0,.5), enemy=text(1169,31,25).setOrigin(1,.5),clock=text(640,60,43);
    const status=text(640,123,24);
    let toolIndex=0, settled=false, result:HTMLDialogElement|undefined, knockout:HTMLElement|undefined;
    const keys=this.input.keyboard?.createCursorKeys();
    let stick:number|undefined,axis=0,vertical=0;
    const knob=isTouch()?this.add.circle(146,618,35,0xffffff,.48).setDepth(22):undefined;
    const center=()=>{stick=undefined;axis=vertical=0;knob?.setPosition(146,618);};
    const clear=()=>{center(); if(keys) for(const k of [keys.left,keys.right,keys.down,keys.up,keys.space])k.reset();};
    const switchTool=()=>{
      const next=(toolIndex+1)%tools.length;
      d.changeTool(tools[next]!.weapon);
      if(d.tool===tools[next]!.weapon)toolIndex=next;
    };
    if(knob){
      const circle=(x:number,y:number,r:number)=>this.add.circle(x,y,r,0xffffff,.24).setStrokeStyle(3,0xffffff,.75).setDepth(20);
      const move=(p:Phaser.Input.Pointer)=>{
        if(p.id!==stick)return;
        const dx=p.x-146,dy=p.y-618,f=Math.min(1,56/(Math.hypot(dx,dy)||1));
        knob.setPosition(146+dx*f,618+dy*f);
        axis=Math.abs(dx*f)>17?Math.sign(dx):0;
        const v=Math.abs(dy*f)>24?Math.sign(dy):0;
        if(v===-1 && vertical!==-1)d.jump();
        vertical=v;
      };
      circle(146,618,77).setInteractive().on('pointerdown',(p:Phaser.Input.Pointer)=>{
        if(stick===undefined){stick=p.id;move(p);}
      });
      const release=(p:Phaser.Input.Pointer)=>{if(p.id===stick)center();};
      this.input.on('pointermove',move).on('pointerup',release).on('pointerupoutside',release);
      for(const [x,y,name,fn] of [[1025,639,'Frappe',()=>d.punch()],[1173,591,'Parade',()=>d.parry()]] as const){
        circle(x,y,55).setInteractive().on('pointerdown',fn);
        text(x,y,22).setText(name);
      }
      status.setInteractive().on('pointerup',switchTool);
    }
    const keyDown=(e:KeyboardEvent)=>{
      if(e.repeat||settled)return;
      if(e.code==='Space')d.punch();
      if(e.code==='ArrowUp')d.jump();
      if(e.code==='AltLeft'||e.code==='AltRight'){e.preventDefault();d.parry();}
      if(e.code==='KeyE')switchTool();
    };
    this.input.keyboard?.on('keydown',keyDown);
    window.addEventListener('blur',clear);
    const portraits=new Map<string,HTMLCanvasElement>();
    const tick=(_time:number,dt:number)=>{
      if(settled)return;
      const dir=axis||Number(!!keys?.right.isDown)-Number(!!keys?.left.isDown);
      d.advance(dt,dir,!!keys?.down.isDown||vertical===1);
      arms.clear();
      crowd.forEach(({sprite,x,y,size},i)=>{
        const t=d.time*.001,phase=t*5.4-i*.46;
        const beat=Math.sin(phase);
        const duck=d.vortexProgress<0?0:Math.min(1,d.vortexProgress*4);
        const cx=x+30*Math.sin(.85*t+i*2);
        const cy=y-(1-duck)*Math.max(0,beat)*(d.enemyHit>0?13:7);
        sprite.setPosition(cx,cy);
        sprite.setDisplaySize(size*(1+.07*duck),size*(1+.015*beat-.22*duck))
          .setAngle(beat*2+Math.sign((d.enemyX+d.x)/2-x)*3);
        if(paintedCrowd){
          sprite.setFrame(i*8+(duck>.5?4:Math.floor(phase*8/(2*Math.PI)+8)%8));
          return;
        }
        for(const side of [-1,1]){
          const wave=(1+Math.cos(phase+side*.30))*.5;
          const shoulderY=cy-size*(.48-.10*duck), elbowX=cx+side*size*.36;
          const handX=elbowX+side*size*(.13+.09*Math.sin(phase));
          const handY=shoulderY+size*(.24*duck-(.12+.52*wave)*(1-duck));
          const elbowY=shoulderY+size*(.13-.34*wave)*(1-duck);
          for(const [width,color] of [[5,0x422f23],[2,0xb5a38a]] as const)
            arms.lineStyle(width,color).lineBetween(cx+side*size*.15,shoulderY,elbowX,elbowY).lineBetween(elbowX,elbowY,handX,handY);
          arms.fillStyle(0x44352b).fillRoundedRect(handX-6,handY-6,12,11,3);
          for(let k=0;k<3;k++)arms.fillStyle(0xc3ab86).fillCircle(handX-3.5+k*3.5,handY-4,2);
        }
      });
      audio.tick();
      for(const cue of d.cues)audio.cue(cue);
      d.cues.length=0;
      art.draw(d);
      life[0]!.setCrop(0,0,Math.round(450*d.hp/100),24);
      life[1]!.setCrop(0,0,Math.round(450*d.enemyHp/d.enemyMax),24);
      hero.setText(`ZIKO   ${d.hp}/100`);enemy.setText(`${name.toUpperCase()}   ${d.enemyHp}/${d.enemyMax}`);
      clock.setText(String(Math.ceil((DUEL_MS-d.time)/1000)));
      status.setText(`${weaponDef(d.tool).label}   ·   ${d.cooldown?`Parade : ${(d.cooldown/1000).toFixed(1)} s`:'Parade prête'}`);
      debugInfo.combatTool=d.tool;
      debugInfo.duel={heroX:d.x,enemyX:d.enemyX,hp:d.hp,enemyHp:d.enemyHp,attack:d.attack,height:d.height,crouch:d.crouch,vanish:d.vanish,guard:d.pressureGuard,vortex:d.vortexProgress,parryNow:d.vortexParryNow};
      if(!d.outcome)return;
      settled=true;
      const outcome=d.outcome;
      const {delta,gift}=settle(outcome);
      audio.cue(outcome==='win'?'win':'lose');
      if(outcome!=='draw'){
        art.fall(this,outcome==='win'?'sack':'hero',outcome==='win'?d.enemyFacing:d.facing);
        knockout=document.createElement('div');
        knockout.className='duel-ko';
        knockout.setAttribute('role','status');
        knockout.textContent='KO!';
        (document.fullscreenElement??document.body).append(knockout);
      }
      this.time.delayedCall(knockout?1350:600,()=>{
        knockout?.remove();
        audio.stop();
        const opponent=meduse?`la ${name}`:`le ${name}`;
        const title=outcome==='draw'?`${meduse?'La':'Le'} ${name} s’enfuit`:
          creature!=='sacZombie'?`${outcome==='win'?'Victoire contre':'Défaite face à'} ${opponent}`:outcome==='win'?'Victoire !':'Défaite';
        const bilan=()=>{result=showTileDialog('combat',title,()=>{
          this.scene.stop();this.scene.wake('Board');leave();
        },{description:`${outcome==='draw'?'Le temps est écoulé. ':''}${delta>=0?'+':''}${delta} pièces écolo${gift?` · Inventaire : +1 ${ITEMS[gift].label}`:''}`,action:'Retour au plateau'});};
        if(outcome==='draw'&&creature==='sacZombie'){bilan();return;}
        const exchange=golem?golemDialogue(outcome,age,gift):meduse?meduseDialogue(outcome,age,gift):outcome==='win'?[
          ['Sac-Zombie',`À ${age} ans, tu as déjà plus de force que toute ma décharge. Même ma tornade ne t’a pas fait renoncer.`],
          ['Ziko','Ce matin, j’ai vu un oiseau qui traînait un sac accroché à sa patte. C’est pour lui que je suis resté.'],
          ['Sac-Zombie',`Ces sacs dans la rivière… c’est moi qui les ai jetés. Je vais les ramasser. Bonne chance pour ta mission, Ziko.${gift?` Tiens, prends ça : ${ITEMS[gift].label}.`:''}`],
        ]:[
          ['Sac-Zombie','Tu veux nettoyer la planète ? Commence par la poussière sur ton pantalon !'],
          ['Ziko','Ricane tant que tu veux. Je n’abandonne pas. La prochaine fois que nos chemins se croisent, je prendrai ma revanche !'],
        ];
        let index=0;
        const speak=()=>{
          const [speaker,speech]=exchange[index]!;
          result=showTileDialog('combat',speaker!,(_brief,accepted)=>{
            if(accepted&&++index<exchange.length)speak();else bilan();
          },{description:speech!,action:index===exchange.length-1?'Voir le bilan':'Suite'});
          result.classList.add('duel-dialogue');
          result.dataset.side=speaker==='Ziko'?'left':'right';
          const portrait=portraits.get(speaker!);
          if(!portrait)throw new Error(`Portrait de dialogue absent : ${speaker}`);
          result.prepend(portrait);
        };
        speak();
      });
    };
    for(const [x,key] of [[57,`ziko-avatar-${session.era}`],[1223,fighterKey]] as const){
      const roundKey=`duel-portrait-${key}`;
      if(!this.textures.exists(roundKey)){
        const portrait=this.textures.createCanvas(roundKey,144,144);
        if(!portrait)throw new Error(`Portrait indisponible : ${key}`);
        const source=this.textures.get(key).getSourceImage();
        if(!(source instanceof HTMLImageElement || source instanceof HTMLCanvasElement))
          throw new Error(`Source de portrait non prise en charge : ${key}`);
        const size=Math.min(source.width,source.height);
        const ctx=portrait.context;
        ctx.save();ctx.beginPath();ctx.arc(72,72,72,0,2*Math.PI);ctx.clip();
        ctx.fillStyle='#1a2732';ctx.fillRect(0,0,144,144);
        ctx.drawImage(source,(source.width-size)/2,(source.height-size)/2,size,size,0,0,144,144);
        ctx.restore();portrait.refresh();
      }
      this.add.image(x,60,roundKey).setDisplaySize(74,74).setDepth(22);
      const figureKey=key===fighterKey?key:boardLook(age).pawn;
      const face=this.textures.get(figureKey).getSourceImage();
      if(!(face instanceof HTMLImageElement || face instanceof HTMLCanvasElement))throw new Error(`Illustration de dialogue absente : ${figureKey}`);
      const portrait=document.createElement('canvas');
      portrait.width=face.width;portrait.height=face.height;
      const ctx=portrait.getContext('2d');
      if(!ctx)throw new Error('Contexte de portrait indisponible');
      ctx.drawImage(face,0,0);
      portrait.setAttribute('role','img');
      const speaker=key===fighterKey?name:'Ziko';
      portrait.setAttribute('aria-label',speaker==='Ziko'?`Ziko, ${age} ans`:speaker);
      portraits.set(speaker,portrait);
    }

    function meduseDialogue(outcome:CombatOutcome,age:number,gift:ItemId|null):[string,string][] {
      const name=CREATURES.meduse.label;
      const reason={
        child:'Hier, une mouette avait les ailes collées. Aujourd’hui, je veux la voir voler.',
        young:'Avec mes amis, on compte les oiseaux sur cette plage. On aimerait les compter en vol, pas dans le pétrole.',
        adult:'Les bénévoles ont passé la nuit à nettoyer les ailes des oiseaux. Je veux qu’on puisse les relâcher ici.',
        hero:'Enfant, je venais écouter les mouettes sur cette plage. J’aimerais que les enfants de demain les entendent aussi.',
      }[eraOfAge(age)];
      if(outcome==='win')return [
        [name,`À ${age} ans, tu tiens tête à la marée ! J’ai eu beau te repousser, tu es revenu. Pour qui te bats-tu ?`],
        ['Ziko',reason],
        [name,`C’est mon pétrole qui a collé les ailes des mouettes. Je vais t’aider à nettoyer le rivage. Bonne chance pour ta mission, Ziko.${gift?` Tiens, prends ça : ${ITEMS[gift].label}.`:''}`],
      ];
      if(outcome==='lose')return [
        [name,'Tes pieds sont collés au sable, Ziko. La marée est à moi !'],
        ['Ziko',`J’ai ${age} ans et je sais déjà une chose : une plage comme celle-ci, ça ne s’abandonne pas. À la prochaine marée, je prendrai ma revanche !`],
      ];
      return [
        [name,'La marée remonte. Cette fois, le courant nous sépare, Ziko !'],
        ['Ziko',`À ${age} ans, je n’ai pas fini de veiller sur cette plage. À la prochaine marée !`],
      ];
    }
    this.events.on('update',tick);
    this.events.once('shutdown',()=>{
      knockout?.remove();
      delete debugInfo.duel;delete debugInfo.combatTool;audio.stop();clear();window.removeEventListener('blur',clear);
      this.events.off('update',tick);this.input.keyboard?.off('keydown',keyDown);this.input.removeAllListeners();result?.remove();
    });
    tick(0,0);
  }
}

function golemDialogue(outcome:CombatOutcome,age:number,gift:ItemId|null):[string,string][] {
  const name=CREATURES.golemPneus.label;
  if(outcome==='lose')return [
    [name,'Tu cherches tes lacets ? Regarde sous mes traces de pneus !'],
    ['Ziko','Tu rigoleras moins la prochaine fois. Maintenant que je connais ton double rebond, je prendrai ma revanche !'],
  ];
  if(outcome==='draw')return [
    [name,'Temps écoulé ! On reprendra au prochain virage, Ziko.'],
    ['Ziko','File, Golem. Moi, je reste pour dégager le ruisseau.'],
  ];
  const reason={
    child:'À la sortie de l’école, on passait voir les têtards. Depuis que tes pneus bouchent le ruisseau, leur mare est à sec.',
    young:'Avec mes amis, on a retiré trois pneus du ruisseau samedi. Dimanche, tu en avais déjà fait rouler quatre autres.',
    adult:'Les bénévoles peuvent dégager le ruisseau. Mais pour que l’eau revienne au jardin, il faut que tu arrêtes d’y jeter tes pneus.',
    hero:'Petit, je trempais mes pieds dans ce ruisseau. Je veux que les enfants d’ici y entendent autre chose que le bruit de tes roues.',
  }[eraOfAge(age)];
  return [
    [name,`À ${age} ans, tu m’as fait plier les deux essieux ! Même après mon rebond, tu n’as pas lâché prise. Pourquoi es-tu resté ?`],
    ['Ziko',reason],
    [name,`J’ai vu l’eau baisser et j’ai continué. Pardon, Ziko. Je vais sortir mes pneus de là et les apporter au recyclage. Bonne chance pour ta mission !${gift?` Tiens, prends ça : ${ITEMS[gift].label}.`:''}`],
  ];
}
