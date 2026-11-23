import * as Phaser from 'phaser';
import { debugInfo } from '../app';
import { Rng } from '../core/rng';
import { SmogRound, SUCTION_RADIUS } from '../core/smog';
import { useSmallArt } from '../ui/device';
import { medals, resultStars, type MinigameOptions } from '../ui/minigame';
import { astroTone } from '../ui/astro-sound';
import { FONT } from '../ui/theme';
import { showTileDialog } from '../ui/tile-dialog';

export class SmogScene extends Phaser.Scene {
  constructor(){super('Smog');}
  preload():void {
    if(!this.textures.exists('smog-riverside')) this.load.image('smog-riverside',`art/smog-riverside${useSmallArt()?'@small':''}.webp`);
    if(!this.textures.exists('smog-puff')) this.load.image('smog-puff','art/smog-puff.webp');
    if(!this.textures.exists('astro-bird')) this.load.image('astro-bird','art/astro-bird.webp');
  }
  create(options:MinigameOptions):void {
    const r=new SmogRound(new Rng(options.seed),options.era);
    debugInfo.scene='Smog';
    this.add.image(640,360,'smog-riverside').setDisplaySize(1280,720);
    const pool:Phaser.GameObjects.Image[]=[];
    const effects=this.add.graphics().setDepth(2);
    const pilot=this.add.image(r.x,r.y,`ziko-avatar-${options.era}`).setDisplaySize(57,57).setDepth(3);
    const label=(x:number,y:number,size:number)=>this.add.text(x,y,'',{fontFamily:FONT,fontSize:`${size}px`,color:'#fff9e3',backgroundColor:'#243c48',padding:{x:12,y:4}}).setDepth(4);
    const hud=label(16,12,28), gauge=label(876,12,24), tip=label(16,665,22);
    tip.setText('Aspire les nuages avant qu’ils arrivent dans la rue.');
    const keys=this.input.keyboard?.createCursorKeys();
    let px=r.x,py=r.y,owner:number|undefined,result:HTMLDialogElement|undefined;
    const aim=(p:Phaser.Input.Pointer)=>{px=p.x;py=p.y;};
    this.input.on('pointerdown',(p:Phaser.Input.Pointer)=>{
      if(owner===undefined && (p.wasTouch||p.leftButtonDown())) {owner=p.id;aim(p);}
    });
    this.input.on('pointermove',(p:Phaser.Input.Pointer)=>{if(owner===p.id||(!p.wasTouch&&owner===undefined)) aim(p);});
    const release=(p:Phaser.Input.Pointer)=>{if(owner===p.id) owner=undefined;};
    this.input.on('pointerup',release).on('pointerupoutside',release);
    const cancel=()=>{owner=undefined;keys?.space.reset();};
    window.addEventListener('blur',cancel);
    const tick=(_time:number,delta:number)=>{
      if(r.finished)return;
      if(keys){
        const dx=Number(keys.right.isDown)-Number(keys.left.isDown),dy=Number(keys.down.isDown)-Number(keys.up.isDown);
        if(dx||dy){px=r.x+dx*610*delta/1000;py=r.y+dy*610*delta/1000;}
      }
      const before=r.score,birds=r.birds,miss=r.escaped,hot=r.overheats;
      r.advance(delta,px,py,owner!==undefined||!!keys?.space.isDown);
      if(r.overheats>hot)tip.setText('Surchauffe ! Laisse refroidir l’aspirateur.');
      else if(r.birds>birds||r.escaped>miss){tip.setText(r.birds>birds?'Attention aux oiseaux !':'Un nuage a atteint la rue.');astroTone(this.sound,'bird');}
      else if(r.score>before){tip.setText(`Air assaini ! +${r.score-before} pts`);astroTone(this.sound,'bag');}
      r.targets.forEach((t,i)=>{
        const key=t.kind==='bird'?'astro-bird':'smog-puff';
        const s=pool[i]??(pool[i]=this.add.image(0,0,key).setDepth(1));
        if(s.texture.key!==key)s.setTexture(key);
        const width=(t.kind==='bird'?72:t.kind==='rush'?104:85)*(1-.43*t.suction/240);
        s.setVisible(true).setDisplaySize(width,width*s.frame.height/s.frame.width).setPosition(t.x,t.y)
          .setTint(t.kind==='rush'?0xe09f76:0xffffff).setAngle(6*Math.sin(r.elapsed/430+i));
      });
      for(let i=r.targets.length;i<pool.length;i++)pool[i]!.setVisible(false);
      const {x,y}=r;effects.clear();
      if(r.sucking){
        effects.lineStyle(2,0xb9f6f1,.65).strokeCircle(x,y,SUCTION_RADIUS);
        for(let i=0;i<12;i++){
          const phase=(r.elapsed/560+i/12)%1,angle=i*2.4+phase;
          effects.fillStyle(0xe3fff4,.75).fillCircle(x+Math.cos(angle)*(1-phase)*SUCTION_RADIUS,y+Math.sin(angle)*(1-phase)*SUCTION_RADIUS,3);
        }
      }
      effects.fillStyle(0xffbd59).fillTriangle(x-20,y+27,x-6,y+27,x-15,y+46+5*Math.sin(r.elapsed/55));
      effects.fillStyle(0x355b69).fillRoundedRect(x-34,y-8,26,44,7);
      effects.fillStyle(0xabcac7).fillRoundedRect(x-32,y+10,68,17,7);
      effects.fillStyle(0x294553).fillRoundedRect(x+24,y+4,18,27,5);
      pilot.setPosition(x,y-14);
      hud.setText(`SMOG BUSTER · ${Math.ceil((30000-r.elapsed)/1000)} s · ${r.score} pts`);
      gauge.setText(r.locked?'SURCHAUFFE · refroidissement':`Chaleur : ${Math.round(r.heat)} %`);
      effects.fillStyle(0x243c48).fillRoundedRect(877,55,310,16,6).fillStyle(r.locked?0xff715a:r.heat>70?0xffbc56:0x75e7c7).fillRect(882,59,3*r.heat,8);
      if(!r.finished)return;
      const {coins,medal}=options.reward(r.score/r.goal);
      result=showTileDialog('minigame','Smog Buster · Résultat',()=>{
        this.scene.stop();this.scene.wake('Board');options.leave();
      },{description:`${r.score} points · ${medals[medal]} · +${coins} pièces écolo. Nuages aspirés : ${r.clouds+r.rushes} (dont ${r.rushes} rapides) · Nuages échappés : ${r.escaped} · Oiseaux aspirés : ${r.birds}.`,
        rating:resultStars(medal,this.sound),action:'Retour au plateau'});
    };
    this.events.on('update',tick);
    this.events.once('shutdown',()=>{this.events.off('update',tick);this.input.removeAllListeners();window.removeEventListener('blur',cancel);result?.remove();});
    tick(0,0);
  }
}
