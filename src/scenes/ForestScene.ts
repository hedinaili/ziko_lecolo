import * as Phaser from 'phaser';
import { debugInfo } from '../app';
import { ForestRound } from '../core/forest';
import { Rng } from '../core/rng';
import { astroTone } from '../ui/astro-sound';
import { medals, resultStars, type MinigameOptions } from '../ui/minigame';
import { FONT } from '../ui/theme';
import { showTileDialog } from '../ui/tile-dialog';
import { useSmallArt } from '../ui/device';

export class ForestScene extends Phaser.Scene {
  constructor() { super('Forest'); }
  preload(): void {
    if (!this.textures.exists('foret-valley')) this.load.image('foret-valley',`art/foret-valley${useSmallArt() ? '@small' : ''}.webp`);
    if (!this.textures.exists('foret-acacia')) this.load.image('foret-acacia','art/foret-acacia.webp');
  }
  create(options:MinigameOptions): void {
    const r=new ForestRound(new Rng(options.seed),options.era);
    debugInfo.scene='Forest';
    this.add.image(640,360,'foret-valley').setDisplaySize(1280,720);
    const label=(x:number,y:number,size:number)=>this.add.text(x,y,'',{fontFamily:FONT,fontSize:`${size}px`,fontStyle:'bold',
      color:'#fff8de',stroke:'#443f2b',strokeThickness:4,resolution:2}).setOrigin(.5);
    const hud=label(640,46,34), hint=label(640,672,26);
    hint.setText('Repère le sol vert et plante une graine.');
    const plots=Array.from({length:6},(_,i)=>{
      const x=288+(i%3)*352,y=340+Math.floor(i/3)*182;
      const soil=this.add.ellipse(x,y,232,96,0x76543d);
      const plant=this.add.image(x,y-3,'foret-acacia').setOrigin(.5,1).setVisible(false);
      const caption=label(x,y+18,24);
      soil.setInteractive().on('pointerup',()=>act(i));
      return {soil,plant,caption};
    });
    let selected=0, keyboard=false;
    const act=(i:number)=>{
      const action=r.act(i);
      if (!action) return;
      hint.setText(action==='plant'?'Graine plantée ! Attends la goutte.':action==='water'?'Arbre sauvé ! +20 pts':'Sol pollué ! −5 pts (minimum zéro).');
      astroTone(this.sound,action==='pollution'?'bird':action==='water'?'bottle':'bag');
    };
    const key=(e:KeyboardEvent)=>{
      if (e.repeat || r.finished) return;
      keyboard=true;
      if (e.key==='ArrowLeft') selected=Math.max(selected-selected%3,selected-1);
      else if (e.key==='ArrowRight') selected=Math.min(selected-selected%3+2,selected+1);
      else if (e.key==='ArrowUp') selected%=3;
      else if (e.key==='ArrowDown') selected=selected%3+3;
      else if (e.code==='Space'||e.key==='Enter') act(selected);
    };
    this.input.keyboard?.on('keydown',key);
    const draw=()=>{
      hud.setText(`FORÊT ÉCLAIR    ·    ${Math.ceil((30000-r.elapsed)/1000)} s    ·    ${r.score} pts`);
      plots.forEach(({soil,plant,caption},i)=>{
        const stage=i===r.polluted?'polluted':i===r.fertile?r.stage:'idle';
        soil.setFillStyle(stage==='polluted'?0x302927:stage==='fertile'?0x54712d:stage==='water'?0x395f58:0x553a28,stage==='idle'?.25:.7)
          .setStrokeStyle(keyboard&&selected===i?6:3,keyboard&&selected===i?0xffffff:stage==='fertile'?0xd9ea81:0xad8b61,stage==='idle'&&!(keyboard&&selected===i)?.55:1);
        caption.setText({polluted:'✕  Pollué',fertile:'✦  Planter',water:'💧 Arroser',seed:'Germination…',dry:'Desséché',tree:'Sauvé !',idle:'·'}[stage]);
        plant.setVisible(stage==='tree'||stage==='water'||stage==='seed').setScale(stage==='tree'?.26:.085);
      });
    };
    let result:HTMLDialogElement|undefined;
    const tick=(_time:number,delta:number)=>{
      if (r.finished) return;
      const dried=r.dried;
      r.advance(delta);
      if (r.dried>dried) hint.setText('Une pousse a séché. Guette la prochaine goutte !');
      draw();
      if (!r.finished) return;
      plots.forEach(({soil,caption,plant})=>{soil.setVisible(false);caption.setVisible(false);plant.setVisible(false);});
      hint.setText(r.watered?'Ta forêt grandit…':'La prochaine pluie apportera une nouvelle chance.');
      r.grove.forEach((plot,i)=>{
        const x=100+(i*139+plot*33)%1080, y=325+i*19;
        const tree=this.add.image(x,y,'foret-acacia').setOrigin(.5,1).setFlipX(i%2===1).setScale(.025);
        this.tweens.add({targets:tree,scale:.29+i*.019,duration:650,delay:i*45,ease:'Back.easeOut'});
      });
      this.time.delayedCall(1450,()=>{
        const {coins,medal}=options.reward(r.score/r.goal);
        result=showTileDialog('minigame','Forêt Éclair · Résultat',()=>{
          this.scene.stop(); this.scene.wake('Board'); options.leave();
        },{description:`${r.score} points · ${medals[medal]} · +${coins} pièces écolo. Graines plantées : ${r.planted} · Arbres sauvés : ${r.watered} · Pousses séchées : ${r.dried} · Sols pollués touchés : ${r.mistakes}.`,
          action:'Retour au plateau',rating:resultStars(medal,this.sound)});
      });
    };
    this.events.on('update',tick);
    this.events.once('shutdown',()=>{this.events.off('update',tick);this.input.keyboard?.off('keydown',key);result?.remove();});
    draw();
  }
}
