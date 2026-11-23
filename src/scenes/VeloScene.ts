import * as Phaser from 'phaser';
import { debugInfo } from '../app';
import { Rng } from '../core/rng';
import { RIDER_X, VeloRound } from '../core/velo';
import { astroTone } from '../ui/astro-sound';
import { medals, resultStars, type MinigameOptions } from '../ui/minigame';
import { FONT } from '../ui/theme';
import { showTileDialog } from '../ui/tile-dialog';
import { useSmallArt } from '../ui/device';

const ground=586;
const icons={coin:'🪙',can:'🥫',hedgehog:'🦔',oil:'',tyre:'',exhaust:'🚙'};
export class VeloScene extends Phaser.Scene {
  constructor(){super('Velo');}
  private riderKey='';
  init(options:MinigameOptions):void { this.riderKey=`velo-rider-${options.era}`; }
  preload():void {
    if(!this.textures.exists('velo-andes')) this.load.image('velo-andes',`art/velo-andes${useSmallArt()?'@small':''}.webp`);
    if(!this.textures.exists(this.riderKey)) this.load.spritesheet(this.riderKey,`art/${this.riderKey}.webp`,{frameWidth:256,frameHeight:256});
  }
  create(options:MinigameOptions & {equipped:boolean}):void {
    const r=new VeloRound(new Rng(options.seed),options.era,options.equipped);
    debugInfo.scene='Velo';
    this.add.image(640,360,'velo-andes').setDisplaySize(1280,720);
    const g=this.add.graphics();
    const rider=this.add.image(RIDER_X,ground,this.riderKey,0).setOrigin(.5,254/256).setDisplaySize(132,132);
    const label=(x:number,y:number,size:number)=>this.add.text(x,y,'',{fontFamily:FONT,fontSize:`${size}px`,color:'#fff8df',backgroundColor:'#214c53',padding:{x:12,y:5}});
    const hud=label(16,14,29), feedback=label(16,664,22);
    feedback.setText('Ramasse les canettes et les pièces !');
    const duckButton=label(1025,638,26).setText('↓  Se baisser').setAlpha(.86).setPadding(18,12);
    const pool:Phaser.GameObjects.Text[]=[];
    const keys=this.input.keyboard?.createCursorKeys();
    let jumpFinger:number|undefined,duckFinger:number|undefined,result:HTMLDialogElement|undefined;
    const jump=(e:KeyboardEvent)=>{if(!e.repeat)r.jump();};
    this.input.keyboard?.on('keydown-SPACE',jump).on('keydown-UP',jump);
    this.input.on('pointerdown',(p:Phaser.Input.Pointer)=>{
      if(duckButton.getBounds().contains(p.x,p.y)) duckFinger=p.id;
      else if(jumpFinger===undefined){jumpFinger=p.id;r.jump();}
    });
    const release=(p:Phaser.Input.Pointer)=>{if(p.id===jumpFinger)jumpFinger=undefined;if(p.id===duckFinger)duckFinger=undefined;};
    this.input.on('pointerup',release).on('pointerupoutside',release);
    const cancel=()=>{jumpFinger=duckFinger=undefined;};
    window.addEventListener('blur',cancel);
    const tick=(_time:number,delta:number)=>{
      if(r.finished)return;
      const score=r.score,hits=r.hits;
      r.advance(delta,!!(keys?.up.isDown||keys?.space.isDown||jumpFinger!==undefined),!!(keys?.down.isDown||duckFinger!==undefined));
      if(hits!==r.hits){feedback.setText('Obstacle touché !');astroTone(this.sound,'bird');}
      else if(score<r.score){feedback.setText(`Bien joué ! +${r.score-score} pts`);astroTone(this.sound,'bottle');}
      g.clear().fillStyle(0xf3dd9f);
      for(let x=-(r.distance%160);x<1280;x+=160) g.fillRoundedRect(x,613,76,6,2);
      const y=ground-r.height,x=RIDER_X;
      g.fillStyle(0x25392e,.23).fillEllipse(x,ground+4,95-r.height*.18,10);
      rider.setFrame(r.crouched?2:r.height>0?1:Math.floor(r.distance/100)%2)
        .setPosition(x,y).setAngle(-Math.min(6,r.height/18));
      r.items.forEach((t,i)=>{
        const txt=pool[i]??(pool[i]=this.add.text(0,0,'',{fontSize:'44px'}).setOrigin(.5,.5));
        txt.setText(icons[t.kind]).setVisible(true).setPosition(t.x,ground-(t.height||21));
        if(t.kind==='oil') g.fillStyle(0x263334).fillEllipse(t.x,ground-2,68,12).fillStyle(0x756c8c).fillEllipse(t.x+4,ground-4,36,4);
        if(t.kind==='tyre') g.lineStyle(10,0x293035).strokeCircle(t.x,ground-20,15);
        if(t.kind==='exhaust'){
          txt.setPosition(t.x+76,ground-106);
          for(let k=0;k<4;k++)g.fillStyle(0x4b5055,.76).fillCircle(t.x+k*12-18,ground-91+4*Math.sin(k+r.elapsed/220),12+k*2);
        }
      });
      for(let i=r.items.length;i<pool.length;i++)pool[i]!.setVisible(false);
      hud.setText(`VÉLO TURBO   ·   ${Math.ceil((30000-r.elapsed)/1000)} s   ·   ${r.score} pts`);
      if(!r.finished)return;
      const {coins,medal}=options.reward(r.score/r.goal);
      result=showTileDialog('minigame','Vélo Turbo · Résultat',()=>{
        this.scene.stop();this.scene.wake('Board');options.leave();
      },{description:`${r.score} points · ${medals[medal]} · +${coins} pièces écolo. Canettes : ${r.cans} · Pièces ramassées : ${r.coins} · Obstacles évités : ${r.avoided} · Contacts : ${r.hits} · Sauts : ${r.jumps}.`,
        rating:resultStars(medal,this.sound),action:'Retour au plateau'});
    };
    this.events.on('update',tick);
    this.events.once('shutdown',()=>{
      this.events.off('update',tick);this.input.removeAllListeners();window.removeEventListener('blur',cancel);
      this.input.keyboard?.off('keydown-SPACE',jump).off('keydown-UP',jump);result?.remove();
    });
    tick(0,0);
  }
}
