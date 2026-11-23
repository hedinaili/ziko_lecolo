import * as Phaser from 'phaser';
import { debugInfo } from '../app';
import { BOAT, OceanRound } from '../core/ocean';
import { Rng } from '../core/rng';
import { astroTone } from '../ui/astro-sound';
import { medals, resultStars, type MinigameOptions } from '../ui/minigame';
import { FONT } from '../ui/theme';
import { useSmallArt } from '../ui/device';
import { showTileDialog } from '../ui/tile-dialog';

export class OceanScene extends Phaser.Scene {
  constructor() { super('Ocean'); }
  preload(): void {
    if (!this.textures.exists('filet-lagoon')) this.load.image('filet-lagoon',`art/filet-lagoon${useSmallArt() ? '@small' : ''}.webp`);
    if (!this.textures.exists('filet-crew')) this.load.image('filet-crew','art/filet-crew.webp');
    for (const key of ['astro-bag','astro-bottle']) if (!this.textures.exists(key)) this.load.image(key,`art/${key}.webp`);
  }
  create(options:MinigameOptions & {largeNet:boolean}): void {
    const r=new OceanRound(new Rng(options.seed),options.era,options.largeNet);
    debugInfo.scene='Ocean';
    const texture=this.textures.get('filet-crew');
    if (!texture.has('boat')) ['fish','dolphin','jelly','boat'].forEach((k,i)=>texture.add(k,0,i*256,0,256,256));
    this.add.image(640,360,'filet-lagoon').setDisplaySize(1280,720);
    const boat=this.add.image(BOAT.x,BOAT.y-30,'filet-crew','boat').setOrigin(.5,.59).setScale(.70);
    const bubbles=this.add.graphics();
    const sprites=r.targets.map(t=>{
      if (t.kind==='bag' || t.kind==='bottle') {
        const sprite=this.add.image(0,0,`astro-${t.kind}`);
        return sprite.setScale((t.kind==='bag'?64:56)/Math.max(sprite.width,sprite.height));
      }
      return this.add.image(0,0,'filet-crew',t.kind).setScale(t.kind==='dolphin'?.5:.37).setFlipX(t.speed<0);
    });
    const g=this.add.graphics();
    const label=(x:number,y:number,size:number)=>this.add.text(x,y,'',{fontFamily:FONT,fontSize:`${size}px`,color:'#fff9e9',
      backgroundColor:'#194e60',padding:{x:12,y:4}}).setResolution(2);
    const hud=label(20,12,28), power=label(953,12,24), feedback=label(24,662,22);
    feedback.setText('Le cercle indique où le filet va tomber.');
    let x=640,y=380, owner:number|'keyboard'|undefined;
    const aim=(p:Phaser.Input.Pointer)=>{ x=p.x; y=p.y; };
    this.input.on('pointerdown',(p:Phaser.Input.Pointer)=>{
      if (owner!==undefined || r.finished || r.cast) return;
      aim(p); owner=p.id; r.hold();
    });
    this.input.on('pointermove',(p:Phaser.Input.Pointer)=>{
      if (owner===p.id || (!p.wasTouch && owner===undefined)) aim(p);
    });
    this.input.on('pointerup',(p:Phaser.Input.Pointer)=>{
      if (owner===p.id) { aim(p); r.release(x,y); owner=undefined; }
    });
    const cancel=()=>{ owner=undefined; r.chargeStart=undefined; };
    this.input.on('pointerupoutside',cancel);
    window.addEventListener('blur',cancel);
    const keys=this.input.keyboard?.createCursorKeys();
    const down=(e:KeyboardEvent)=>{
      if (!e.repeat && owner===undefined && !r.cast && !r.finished) {owner='keyboard';r.hold();}
    };
    const up=()=>{ if (owner==='keyboard') { r.release(x,y); owner=undefined; } };
    this.input.keyboard?.on('keydown-SPACE',down).on('keyup-SPACE',up);
    let result:HTMLDialogElement|undefined;
    const tick=(_time:number,delta:number)=>{
      if (r.finished) return;
      if (keys && (owner===undefined || owner==='keyboard')) {
        x=Phaser.Math.Clamp(x+delta*.62*(Number(keys.right.isDown)-Number(keys.left.isDown)),26,1254);
        y=Phaser.Math.Clamp(y+delta*.54*(Number(keys.down.isDown)-Number(keys.up.isDown)),205,670);
      }
      const landed=r.cast?.landed, cast=r.cast;
      r.advance(delta);
      if (cast?.landed && !landed) {
        feedback.setText(r.lastDelta>0 ? `Filet remonté : +${r.lastDelta} pts` : r.lastDelta<0 ? `Attention aux animaux ! ${r.lastDelta} pts` : 'Filet remonté : 0 pt');
        astroTone(this.sound,r.lastDelta<0?'bird':'bag');
      }
      boat.setAngle(2*Math.sin(r.elapsed/590)).setY(BOAT.y-30+2*Math.sin(r.elapsed/340));
      bubbles.clear().lineStyle(1,0xd5fff5,.42);
      for (let i=0;i<35;i++) bubbles.strokeCircle((i*129+5*Math.sin(i+r.elapsed/580))%1280,705-(i*31+r.elapsed*.035)%530,2+i%4);
      r.targets.forEach((t,i)=>{
        const p=r.position(t);
        sprites[i]!.setPosition(p.x,p.y).setVisible(t.hiddenUntil<=r.elapsed).setAngle(6*Math.sin(r.elapsed/530+i));
      });
      hud.setText(`FILET OCÉAN   ·   ${Math.ceil((30000-r.elapsed)/1000)} s   ·   ${r.score} pts`);
      power.setText(`Portée : ${Math.round(r.power*100)} %`);
      g.clear();
      if (r.cast) {
        const c=r.cast, f=Math.min(1,(r.elapsed-c.start)/320);
        const nx=BOAT.x+(c.x-BOAT.x)*f, ny=BOAT.y+(c.y-BOAT.y)*f-80*Math.sin(Math.PI*f);
        const radius=10+(r.radius-10)*f;
        g.lineStyle(3,0xe8cf95).lineBetween(BOAT.x,BOAT.y,nx,ny);
        g.fillStyle(0xffe6b5,.17).fillCircle(nx,ny,radius).lineStyle(3,0xffecb8).strokeCircle(nx,ny,radius);
        for (let k=-2;k<=2;k++) {
          const d=k*radius/3,h=Math.sqrt(radius**2-d**2);
          g.lineStyle(1.5,0xffedc7,.9).lineBetween(nx+d,ny-h,nx+d,ny+h).lineBetween(nx-h,ny+d,nx+h,ny+d);
        }
      } else {
        const p=r.landing(x,y);
        g.lineStyle(2,0xdafbea,.9).strokeCircle(p.x,p.y,r.radius);
        g.lineBetween(x-9,y,x+9,y).lineBetween(x,y-9,x,y+9);
      }
      if (!r.finished) return;
      const {coins,medal}=options.reward(r.score/r.goal), c=r.catches;
      result=showTileDialog('minigame','Filet Océan · Résultat',()=>{
        this.scene.stop(); this.scene.wake('Board'); options.leave();
      },{description:`${r.score} points · ${medals[medal]} · +${coins} pièces écolo. Lancers : ${r.casts} · Sacs : ${c.bag} · Bouteilles : ${c.bottle} · Animaux pris : ${c.fish+c.dolphin+c.jelly}.`,
        rating:resultStars(medal,this.sound),action:'Retour au plateau'});
    };
    this.events.on('update',tick);
    this.events.once('shutdown',()=>{
      this.events.off('update',tick); this.input.removeAllListeners(); window.removeEventListener('blur',cancel);
      this.input.keyboard?.off('keydown-SPACE',down).off('keyup-SPACE',up); result?.remove();
    });
    tick(0,0);
  }
}
