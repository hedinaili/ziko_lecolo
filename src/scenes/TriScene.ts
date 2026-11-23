import * as Phaser from 'phaser';
import { debugInfo } from '../app';
import { Rng } from '../core/rng';
import { BINS, TriRound } from '../core/tri';
import { medals, resultStars, type MinigameOptions } from '../ui/minigame';
import { astroTone } from '../ui/astro-sound';
import { showTileDialog } from '../ui/tile-dialog';
import { FONT } from '../ui/theme';

const colors = [0xedb52c,0x459267,0xa36a46,0x75868e,0xaa78aa];
const binX = (i: number) => 152 + 244*i;

export class TriScene extends Phaser.Scene {
  constructor() { super('Tri'); }
  preload(): void {
    if (!this.textures.exists('tri-items')) this.load.svg('tri-items','art/tri-objects.svg');
    if (!this.textures.exists('tri-shop')) this.load.svg('tri-shop','art/tri-workshop.svg');
  }
  create(options: MinigameOptions): void {
    const r = new TriRound(new Rng(options.seed),options.era);
    debugInfo.scene = 'Tri';
    this.cameras.main.setBackgroundColor('#e8eedf');
    const label = (x:number,y:number,value:string,size:number,color='#193f40') =>
      this.add.text(x,y,value,{fontFamily:FONT,fontSize:`${size}px`,fontStyle:'bold',color,resolution:2}).setOrigin(.5);
    const items = this.textures.get('tri-items');
    if (!items.has('0')) for (let i=0;i<9;i++) items.add(String(i),0,128*i,0,128,128);
    this.add.image(640,360,'tri-shop');
    const fan = this.add.graphics().setPosition(104,171);
    this.add.circle(104,171,42,0x73918c).setStrokeStyle(5,0xcddacf);
    fan.setDepth(1).fillStyle(0x526e68);
    for (let i=0;i<4;i++) {
      const a=i*Math.PI/2;
      fan.fillTriangle(0,0,36*Math.cos(a),36*Math.sin(a),26*Math.cos(a+.69),26*Math.sin(a+.69));
    }
    const lamp = this.add.circle(1190,169,14,0x86c789).setStrokeStyle(4,0x516760);
    const belt = this.add.graphics();
    label(181,56,'♻  TRI EXPRESS',40);
    const hud = label(896,55,'',32);
    const feedback = label(640,452,'Envoie chaque objet dans le bon bac.',27);
    const bins = BINS.map((name,i) => {
      const g = this.add.graphics();
      g.fillStyle(0x33413a,.24).fillEllipse(5,88,173,18);
      for (const x of [-58,58]) g.fillStyle(0x263738).fillCircle(x,76,14).fillStyle(0x859294).fillCircle(x,76,6);
      const point = (x:number,y:number) => new Phaser.Math.Vector2(x,y);
      const shape = [point(-81,-48),point(82,-48),point(68,74),point(-65,74)];
      g.fillStyle(colors[i]!).fillPoints(shape,true).lineStyle(3,0x3d5050).strokePoints(shape,true);
      g.fillStyle(0x172a30,.24).fillPoints([point(58,-48),point(82,-48),point(68,74),point(49,74)],true);
      g.lineStyle(4,0xffffff,.33).lineBetween(-71,-35,-58,62);
      g.fillStyle(0x435451).fillRoundedRect(-90,-60,180,20,6);
      g.fillStyle(colors[i]!).fillPoints([point(-89,-59),point(-73,-78),point(75,-78),point(90,-59)],true);
      g.fillStyle(0x293b39).fillEllipse(0,-64,120,14);
      const title = label(0,41,name,24,'#fff').setStroke('#233637',3);
      const hint = label(-64,-30,String(i+1),18,'#fff').setStroke('#334843',2);
      const mark = this.add.image(0,-5,'tri-items',String(i*2)).setDisplaySize(65,65);
      return this.add.container(binX(i),565,[g,mark,title,hint]);
    });
    const shadow = this.add.ellipse(135,310,95,16,0x152927,.34);
    const card = this.add.image(135,265,'tri-items','0');
    let signalUntil = 0;
    let drag: number | undefined, selected = 0;
    const draw = () => {
      if (drag === undefined) card.setPosition(135+1010*r.progress,265);
      card.setFrame(String(r.item.frame));
      shadow.setPosition(135+1010*r.progress,310).setAlpha(drag === undefined ? .34 : .12);
      hud.setText(`${Math.ceil((30000-r.elapsed)/1000)} s   ·   ${r.score} pts   ·   Série : ${r.streak}`);
      bins.forEach((b,i) => b.setScale(i === selected ? 1.04 : 1));
      belt.clear().lineStyle(3,0x293e3d,.5);
      for (let x=48+(r.elapsed*.09)%46;x<1230;x+=46) belt.lineBetween(x+7,301,x-9,332);
      const a=r.elapsed*.004;
      for (let x=44;x<1245;x+=93) {
        belt.fillStyle(0x9cab9e).fillCircle(x,357,12).lineStyle(3,0x50635e)
          .lineBetween(x-8*Math.cos(a),357-8*Math.sin(a),x+8*Math.cos(a),357+8*Math.sin(a));
      }
      fan.setRotation(r.elapsed*.0015);
      if (r.elapsed >= signalUntil) lamp.setFillStyle(0x86c789);
      debugInfo.triSorted = r.correct + r.errors;
    };
    const submit = (i:number) => {
      if (r.finished || !bins[i]?.visible) return;
      const item = r.item, score = r.score;
      r.sort(i); drag = undefined; selected = i;
      const good = i === item.bin;
      lamp.setFillStyle(good ? 0x79ff80 : 0xff7763); signalUntil=r.elapsed+650;
      feedback.setText(good ? `Bien trié !  +${r.score-score} pts` : `${item.name} → ${BINS[item.bin]}  ·  ${r.score-score} pts`);
      astroTone(this.sound,good ? 'bottle' : 'bird');
      draw();
    };
    const key = (e: KeyboardEvent) => {
      if (e.repeat || r.finished) return;
      const digit = /^(?:Digit|Numpad)([1-5])$/.exec(e.code);
      if (digit) submit(Number(digit[1])-1);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        selected = Phaser.Math.Clamp(selected + (e.key === 'ArrowLeft' ? -1 : 1),0,BINS.length-1);
        draw();
      } else if (e.key === 'Enter' || e.code === 'Space') submit(selected);
    };
    this.input.keyboard?.on('keydown',key);
    const binAt = (p:Phaser.Input.Pointer) => bins.findIndex((b,i) => b.visible && Math.abs(binX(i)-p.x)<=103 && p.y>=495 && p.y<=655);
    this.input.on('pointerdown',(p:Phaser.Input.Pointer) => {
      if (drag !== undefined || r.finished) return;
      if (Math.abs(p.x-card.x)<=110 && Math.abs(p.y-card.y)<=78) drag=p.id;
      else if (binAt(p)>=0) submit(binAt(p));
    });
    this.input.on('pointermove',(p:Phaser.Input.Pointer) => { if (drag===p.id) card.setPosition(p.x,p.y); });
    this.input.on('pointerup',(p:Phaser.Input.Pointer) => {
      if (drag!==p.id) return;
      drag=undefined;
      const bin=binAt(p); if (bin>=0) submit(bin); else draw();
    });
    this.input.on('pointerupoutside',() => { drag=undefined; });
    let result: HTMLDialogElement | undefined;
    const tick = (_time:number,delta:number) => {
      if (r.finished) return;
      const serial = r.serial;
      r.advance(delta);
      if (r.serial !== serial) { drag=undefined; lamp.setFillStyle(0xffbb55); signalUntil=r.elapsed+650; feedback.setText('Objet passé ! La série repart à zéro.'); }
      draw();
      if (!r.finished) return;
      const {coins,medal} = options.reward(r.score/r.goal);
      result = showTileDialog('minigame','Tri Express · Résultat',() => {
        this.scene.stop(); this.scene.wake('Board'); options.leave();
      }, {description:`${r.score} points · ${medals[medal]} · +${coins} pièces écolo. Bons tris : ${r.correct} · Erreurs : ${r.errors} · Objets passés : ${r.missed}.`,
        action:'Retour au plateau',rating:resultStars(medal,this.sound),details:this.binReport(r)});
    };
    this.events.on('update',tick);
    this.events.once('shutdown',() => {
      this.events.off('update',tick); this.input.keyboard?.off('keydown',key); this.input.removeAllListeners(); result?.remove();
    });
    draw();
  }

  private binReport(r:TriRound): HTMLTableElement {
    const table=document.createElement('table');
    table.className='astro-breakdown';
    table.setAttribute('aria-label','Bilan par poubelle');
    const head=table.createTHead().insertRow();
    for (const text of ['Poubelle','Jetés','Dont erreurs','Ratés']) {
      const th=document.createElement('th'); th.scope='col'; th.textContent=text; head.append(th);
    }
    const body=table.createTBody();
    r.bins.forEach(({deposited,errors,missed},i) => {
      const row=body.insertRow(), th=document.createElement('th');
      th.scope='row'; th.textContent=BINS[i]!; row.append(th);
      for (const n of [deposited,errors,missed]) row.insertCell().textContent=String(n);
    });
    return table;
  }
}
