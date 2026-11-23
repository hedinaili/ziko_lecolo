import * as Phaser from 'phaser';
import { AstroRound, ROUND_MS, type AstroHit } from '../core/astro';
import { Rng } from '../core/rng';
import { medals, resultStars, type MinigameOptions } from '../ui/minigame';
import { debugInfo } from '../app';
import { FONT } from '../ui/theme';
import { showTileDialog } from '../ui/tile-dialog';
import { isTouch, useSmallArt } from '../ui/device';
import { astroTone } from '../ui/astro-sound';


export class AstroScene extends Phaser.Scene {
  private round!: AstroRound;
  private options!: MinigameOptions;
  private art!: Phaser.GameObjects.Graphics;
  private sparks!: Phaser.GameObjects.Graphics;
  private hits: (AstroHit & { at: number })[] = [];
  private hud!: Phaser.GameObjects.Text;
  private gaugeText!: Phaser.GameObjects.Text;
  private readonly gaugeRim = new Phaser.Curves.Path(1040,10)
    .lineTo(1245,10).quadraticBezierTo(1255,20,1255,10)
    .lineTo(1255,68).quadraticBezierTo(1245,78,1255,78)
    .lineTo(1040,78).quadraticBezierTo(1030,68,1030,78)
    .lineTo(1030,20).quadraticBezierTo(1040,10,1030,10);
  private readonly chargeSpark = new Phaser.Math.Vector2();
  private arrows?: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys?: Record<'A'|'Q'|'D'|'W'|'Z'|'S', Phaser.Input.Keyboard.Key>;
  private bank = 0;
  private ship!: Phaser.GameObjects.Image;
  private sea!: Phaser.GameObjects.Image;
  private targets: Phaser.GameObjects.Image[] = [];
  private aim = { x: 640, y: 600 };
  private result?: HTMLDialogElement;
  constructor() { super('Astro'); }

  preload(): void {
    if (!this.textures.exists('astro-pacific')) this.load.image('astro-pacific', `art/astro-pacific${useSmallArt() ? '@small' : ''}.webp`);
    if (!this.textures.exists('astro-bank')) this.load.spritesheet('astro-bank','art/astro-bank.webp',{frameWidth:128,frameHeight:128});
    for (const kind of ['bag','bottle','bird']) if (!this.textures.exists(`astro-${kind}`)) this.load.image(`astro-${kind}`,`art/astro-${kind}.webp`);
  }
  create(options: MinigameOptions): void {
    this.options = options;
    this.round = new AstroRound(new Rng(options.seed), options.era);
    this.aim = { x: this.round.x, y: this.round.y };
    this.result = undefined;
    debugInfo.scene = 'Astro';
    this.bank = 0;
    this.targets = [];
    this.sea = this.add.image(640,360,'astro-pacific').setDisplaySize(1320,746);
    this.art = this.add.graphics();
    this.hits = [];
    this.sparks = this.add.graphics().setDepth(2);
    this.ship = this.add.image(640,600,'astro-bank',8).setDisplaySize(92,92).setDepth(2);
    this.hud = this.add.text(24,12,'', {fontFamily:FONT,fontSize:'29px',color:'#fff9e8',backgroundColor:'#23445b',padding:{x:14,y:4}});
    this.arrows = this.input.keyboard?.createCursorKeys();
    const kb = this.input.keyboard;
    this.keys = kb ? {A:kb.addKey('A'), Q:kb.addKey('Q'), D:kb.addKey('D'), W:kb.addKey('W'), Z:kb.addKey('Z'), S:kb.addKey('S')} : undefined;
    this.hud.setDepth(3);
    const aimAt = (p: Phaser.Input.Pointer) => { this.aim = { x:p.x, y:p.y }; };
    this.gaugeText = this.add.text(1043,16,'',{fontFamily:FONT,fontSize:'22px',color:'#ffffff'}).setDepth(3);
    const touchButton = isTouch() ? this.add.text(1205,490,'TURBO',{fontFamily:FONT,fontSize:'25px',
      color:'#ffffff',backgroundColor:'#224859',padding:{x:16,y:28}}).setOrigin(.5).setAlpha(.72).setDepth(3) : undefined;
    let pilot: number | undefined;
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (p.wasTouch && touchButton?.getBounds().contains(p.x,p.y)) { this.triggerTurbo(); return; }
      if (p.wasTouch && pilot !== undefined) return;
      if (p.wasTouch) pilot = p.id;
      else if (p.leftButtonDown()) this.triggerTurbo();
      aimAt(p);
    });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => { if (!p.wasTouch || (p.isDown && p.id === pilot)) aimAt(p); });
    const release = (p: Phaser.Input.Pointer) => { if (pilot === p.id) pilot = undefined; };
    this.input.on('pointerup', release).on('pointerupoutside',release);
    this.events.once('shutdown', () => { this.result?.remove(); this.input.removeAllListeners(); });
    this.draw();
  }
  private triggerTurbo(): void {
    if (this.round.activateTurbo()) astroTone(this.sound, 'turbo');
  }
  override update(_time: number, delta: number): void {
    const r = this.round;
    if (r.finished) return;
    const dx = Number(!!(this.arrows?.right.isDown || this.keys?.D.isDown)) - Number(!!(this.arrows?.left.isDown || this.keys?.A.isDown || this.keys?.Q.isDown));
    const dy = Number(!!(this.arrows?.down.isDown || this.keys?.S.isDown)) - Number(!!(this.arrows?.up.isDown || this.keys?.W.isDown || this.keys?.Z.isDown));
    if (this.arrows && Phaser.Input.Keyboard.JustDown(this.arrows.space)) this.triggerTurbo();
    if (dx || dy) this.aim = { x:r.x + dx*620*r.movementFactor*delta/1000, y:r.y + dy*460*r.movementFactor*delta/1000 };
    const previousX = r.x;
    r.advance(delta, this.aim.x, this.aim.y, hit => {
      this.hits.push({ ...hit, at: r.elapsed });
      astroTone(this.sound, hit.kind);
      if (hit.kind === 'bird' && hit.removed) this.showBirdPenalty(hit);
    }, () => astroTone(this.sound, 'shot'));
    const travelX = r.x - previousX;
    this.bank = travelX === 0 ? this.bank * Math.exp(-delta/95)
      : Phaser.Math.Clamp(this.bank + travelX / 260, -1, 1);
    this.draw();
    if (!r.finished) return;
    const {coins, medal} = this.options.reward(r.score/r.goal);
    this.result = showTileDialog('minigame', 'Astro-Ziko · Résultat', () => {
      this.scene.stop();
      this.scene.wake('Board');
      this.options.leave();
    }, {description:`${r.score} points · ${medals[medal]} · +${coins} pièces écolo`, action:'Retour au plateau', rating:resultStars(medal,this.sound), details:this.resultTable()});
  }
  private resultTable(): HTMLTableElement {
    const table = document.createElement('table');
    table.className = 'astro-breakdown';
    table.setAttribute('aria-label', 'Bilan par cible');
    const header = table.createTHead().insertRow();
    for (const title of ['Cibles', 'Touchées', 'Points']) {
      const th = document.createElement('th');
      th.scope = 'col'; th.textContent = title; header.append(th);
    }
    const body = table.createTBody();
    for (const [kind, name] of [['bottle', 'Bouteilles'], ['bag', 'Sacs'], ['bird', 'Mouettes']] as const) {
      const { touched, points } = this.round.breakdown[kind];
      const row = body.insertRow();
      const label = document.createElement('th');
      label.scope = 'row';
      const icon = document.createElement('img');
      icon.src = `art/astro-${kind}.webp`; icon.alt = '';
      label.append(icon, name); row.append(label);
      row.insertCell().textContent = String(touched);
      const value = row.insertCell();
      value.textContent = points > 0 ? `+${points}` : points < 0 ? `−${-points}` : '0';
      if (points) value.className = points > 0 ? 'gain' : 'loss';
    }
    return table;
  }
  private showBirdPenalty(hit: AstroHit): void {
    const loss = Math.abs(hit.scoreDelta);
    const caption = `${loss ? '−' : ''}${loss} ${loss > 1 ? 'pts' : 'pt'}`;
    const label = this.add.text(hit.x, Math.min(hit.y - 15, 688), caption, {
      fontFamily: FONT, fontSize: '30px', fontStyle: 'bold', color: '#ff6469', stroke: '#381722', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(4);
    label.x = Phaser.Math.Clamp(hit.x, label.width/2, 1280 - label.width/2);
    this.tweens.add({
      targets: label, y: Math.max(24, label.y - 38), duration: 680, ease: 'Sine.easeOut',
      alpha: { value: 0, delay: 330, duration: 350 },
      onComplete: () => label.destroy(),
    });
  }
  private draw(): void {
    const g = this.art, r = this.round;
    g.clear();
    for (const s of r.shots) g.fillStyle(0x164f66).fillRoundedRect(s.x-4,s.y-12,8,24,4).fillStyle(0xb9fff1).fillRoundedRect(s.x-2,s.y-11,4,20,2);
    const time = r.elapsed / 1000;
    this.sea.setPosition(640 - (r.x-640)*0.018,360+3*Math.sin(time*0.8));
    for (let i=0;i<34;i++) {
      const wave = time*1.3+i;
      g.fillStyle(0xe2fbff,0.17+0.12*Math.sin(wave)).fillEllipse((i*223+time*18)%1290,350+(i*77)%358+2*Math.cos(wave),10+9*Math.sin(wave),2);
    }
    r.targets.forEach(({x,y,kind,hp},i) => {
      const key = `astro-${kind}`;
      const sprite = this.targets[i] ?? (this.targets[i] = this.add.image(x,y,key).setDepth(1));
      if (sprite.texture.key !== key) sprite.setTexture(key);
      const width = kind === 'bird' ? 65 : kind === 'bag' ? 44 : 22;
      sprite.setVisible(true).setPosition(x,y).setAngle(Math.sin(y/50+x/120)*(kind==='bird'?5:12))
        .setDisplaySize(width, width*sprite.frame.height/sprite.frame.width)
        .setTint(kind==='bottle' && hp===1 ? 0xffca9c : 0xffffff);
    });
    for (let i=r.targets.length;i<this.targets.length;i++) this.targets[i]!.setVisible(false);
    this.sparks.clear();
    for (let i = this.hits.length - 1; i >= 0; i--) {
      const hit = this.hits[i]!;
      const t = (r.elapsed - hit.at) / 320;
      if (t >= 1) { this.hits.splice(i, 1); continue; }
      const radius = 8 + Math.sin(t * Math.PI / 2) * (hit.removed ? 26 : 13);
      const color = hit.kind === 'bird' ? 0xffb580 : 0x8affdf;
      this.sparks.lineStyle(2, color, 1 - t).strokeCircle(hit.x, hit.y, radius);
      if (hit.kind !== 'bird') {
        this.sparks.fillStyle(0xfff7bf, 1 - t);
        for (let j = 0; j < 5; j++) {
          const a = j * Math.PI * 2 / 5 + hit.x;
          this.sparks.fillCircle(hit.x + (radius+4)*Math.cos(a), hit.y + (radius+4)*Math.sin(a), 2.8 - 1.8*t);
        }
      }
    }
    const {x,y}=r;
    const roll = Math.round(8*this.bank) * Math.PI / 32;
    for (const side of [-16,16]) {
      const offset = side*Math.cos(roll) + 3*Math.sin(roll);
      const tail = x+offset - 5*this.bank + 2*Math.sin(time*39+offset);
      const length = (r.turboActive ? 39 : 17) + 4*Math.sin(time*34+offset);
      g.fillStyle(0xff731b,.85).fillTriangle(x+offset-6,y+28,x+offset+6,y+28,tail,y+32+length);
      g.fillStyle(0xffed92).fillTriangle(x+offset-3,y+29,x+offset+3,y+29,tail,y+32+length*.65);
    }
    this.ship.setPosition(x,y).setFrame(8 + Math.round(8*this.bank));
    debugInfo.shipX = x;
    debugInfo.bankFrame = Number(this.ship.frame.name);
    debugInfo.turboActive = r.turboActive;
    const ready = !r.turboActive && r.turboGauge === 1;
    this.gaugeText.setText(r.turboActive ? 'TURBO · ACTIF' : ready ? 'TURBO · PRÊT' : 'TURBO · RECHARGE');
    g.fillStyle(0x23445b).fillRoundedRect(1030,10,225,68,10);
    g.fillStyle(0x102637).fillRect(1044,52,195,12);
    g.fillStyle(r.turboActive ? 0xffa540 : 0xff922e).fillRect(1044,52,195*r.turboGauge,12);
    if (ready) {
      g.lineStyle(12,0xff771c,.13).strokeRoundedRect(1030,10,225,68,10);
      g.lineStyle(7,0xff8c22,.32).strokeRoundedRect(1030,10,225,68,10);
      g.lineStyle(2,0xffb34d,1).strokeRoundedRect(1030,10,225,68,10);
      const p = this.gaugeRim.getPoint((r.elapsed % 2200) / 2200,this.chargeSpark);
      g.fillStyle(0xff9c34,.45).fillCircle(p.x,p.y,8);
      g.fillStyle(0xfff3cc).fillCircle(p.x,p.y,4);
    }
    const line = `ASTRO-ZIKO   ·   ${Math.ceil((ROUND_MS-r.elapsed)/1000)} s   ·   ${r.score} pts`;
    if (line !== this.hud.text) this.hud.setText(line);
  }
}
