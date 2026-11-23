import * as Phaser from 'phaser';

import type { ArcadeCreature, DuelCue } from '../core/sac-duel';
type Cue = DuelCue | 'win' | 'lose';
type Layer = readonly [voice: OscillatorType | 'air', fromHz: number, toHz: number,
  seconds: number, peak: number, delay?: number];

const cues: Record<Exclude<Cue,'growl'>, readonly Layer[]> = {
  bounce:[['sine',125,46,.24,.085],['air',3100,740,.18,.07],['triangle',820,335,.11,.041]],
  vortex: [['air',380,2600,1.48,.17],['triangle',110,420,1.4,.045]],
  block: [['triangle', 960, 410, .09, .07], ['air', 3200, 1200, .05, .06]],
  swing: [['air', 800, 2500, .10, .085]],
  kick: [['sine', 168, 49, .13, .09], ['air', 900, 480, .045, .045]],
  tool: [['triangle', 660, 560, .045, .045], ['square', 960, 760, .045, .016, .06]],
  impact: [['air', 2200, 480, .09, .12], ['triangle', 111, 62, .07, .055]],
  hurt: [['sawtooth', 277, 173, .10, .026], ['triangle', 173, 98, .14, .052, .09]],
  parry: [['sine', 1319, 1308, .15, .05], ['sine', 2027, 2010, .10, .025]],
  throw: [['triangle', 260, 740, .09, .042], ['air', 2400, 650, .14, .08, .07]],
  win: [['triangle', 392, 392, .10, .055], ['triangle', 587, 587, .09, .05, .12],
    ['sine', 784, 784, .33, .065, .22]],
  lose: [['triangle', 311, 294, .16, .05], ['triangle', 247, 233, .14, .05, .16],
    ['sine', 196, 147, .35, .06, .31]],
};

const stepTime = 60 / 126 / 4;
const roots = [43, 46, 41, 38] as const;
const tideRoots = [38, 45, 41, 36] as const;
const yardRoots = [40,40,43,38] as const;
const yardCues:Partial<Record<Cue,readonly Layer[]>> = {
  throw:[['triangle',1220,690,.19,.04],['air',3100,1250,.19,.065]],
  block:[['square',430,218,.08,.032],['triangle',842,393,.14,.045]],
  vortex:[['sawtooth',54,135,.79,.035],['air',290,1280,.86,.075]],
};
const oilCues:Partial<Record<Cue,readonly Layer[]>> = {
  throw:[['sine',630,150,.13,.056],['sine',315,115,.16,.046,.10]],
  block:[['triangle',360,135,.17,.065],['air',760,390,.13,.045]],
  vortex:[['air',190,1360,1.35,.14],['sine',83,230,1.10,.056],['triangle',185,98,.33,.038,.83]],
};
const answer = [12, 19, 15, 10] as const;
const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

export class DuelAudio {
  private readonly scene: Phaser.Scene;
  private readonly manager?: Phaser.Sound.WebAudioSoundManager;
  private readonly voices = new Map<AudioScheduledSourceNode, () => void>();
  private readonly lastCue = new Map<Cue, number>();
  private air?: AudioBuffer;
  private calls = new Map<boolean,AudioBuffer>();
  private step = 0;
  private next = -1;
  private stopped = false;

  constructor(scene: Phaser.Scene, private readonly creature:ArcadeCreature='sacZombie') {
    this.scene = scene;
    if (scene.sound instanceof Phaser.Sound.WebAudioSoundManager) this.manager = scene.sound;
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.stop, this);
    scene.events.once(Phaser.Scenes.Events.DESTROY, this.stop, this);
  }

  private ready(): Phaser.Sound.WebAudioSoundManager | undefined {
    const m = this.manager;
    return !this.stopped && m && !m.mute && m.context.state === 'running' ? m : undefined;
  }

  tick(): void {
    const m = this.ready();
    if (!m) { this.next = -1; return; }
    const now = m.context.currentTime;
    // Schedule against the audio clock, but never replay missed beats after a stall.
    if (this.next < now) this.next = now + .005;
    while (this.next < now + .09) {
      const bar = this.step >> 4, beat = this.step % 16;
      const tide=this.creature==='meduse';
      const yard=this.creature==='golemPneus';
      const root = (tide?tideRoots:yard?yardRoots:roots)[bar]!, at = this.next;
      if (beat === 0 || beat === 10 || (bar === 3 && beat === 14))
        this.play(m, at, ['sine', 138, 47, .12, .067]);
      if (beat === 4 || beat === 12)
        this.play(m, at, ['air', 1850, 740, .085, .074]);
      if (beat % 4 === 2 || beat === 15)
        this.play(m, at, ['air', 5200, 3500, .039, beat === 15 ? .025 : .045]);
      if (beat === 0 || beat === 3 || beat === 8 || beat === 11) {
        const bass = hz(root + (beat === 11 ? 7 : 0));
        this.play(m, at, ['triangle', bass, bass, beat === 0 ? .25 : .14, .047]);
      }
      if (beat === 6 || beat === 13 || (bar % 2 && beat === 15)) {
        const note = hz(root + (beat === 6 ? 19 : beat === 13 ? answer[bar]! : 17));
        this.play(m, at, [tide?'sine':'square', note, note, beat === 6 ? .16 : .08, tide?.048:.013]);
      }
      if(yard && (beat===3||beat===14))this.play(m,at,['triangle',480,253,.065,.037]);
      this.next += tide ? 60/110/4 : yard ? 60/118/4 : stepTime;
      this.step = (this.step + 1) % 64;
    }
  }

  cue(name: Cue): void {
    const m = this.ready();
    if (!m) return;
    const now = m.context.currentTime;
    if (now - (this.lastCue.get(name) ?? -Infinity) < .075) return;
    this.lastCue.set(name, now);
    if(name==='growl'||name==='vortex')this.shout(m,name==='vortex');
    if(name!=='growl')for (const layer of (this.creature==='meduse'?oilCues[name]:this.creature==='golemPneus'?yardCues[name]:undefined)??cues[name]) this.play(m, now, layer);
  }

  private shout(m:Phaser.Sound.WebAudioSoundManager, special:boolean):void {
    const ctx=m.context;
    let buffer=this.calls.get(special);
    if(!buffer){
      const rate=22050;
      buffer=ctx.createBuffer(1,Math.ceil(rate*(special?.84:.34)),rate);
      const data=buffer.getChannelData(0);
      const tide=this.creature==='meduse';
      const syllables=this.creature==='golemPneus'?(special?[[0,.25,82],[.28,.48,99]]:[[0,.32,85]]):tide ? (special?[[0,.30,92],[.37,.42,184]]:[[0,.27,153]]) :
        special?[[0,.19,112],[.21,.18,138],[.43,.40,164]]:[[0,.34,123]];
      for(const [start,duration,pitch] of syllables as [number,number,number][]){
        let phase=0;
        for(let i=0;i<duration*rate;i++){
          const t=i/rate,u=t/duration;
          phase+=(pitch*(1.14-.50*u)+(tide?18:4)*Math.sin(2*Math.PI*(tide?11:32)*t))/rate;
          // Decaying formant resonances following each glottal pulse: open from "gr" to "ah".
          const period=(phase%1)/pitch, open=Math.min(1,t/.082);
          const resonance=(f:number,b:number)=>Math.sin(2*Math.PI*f*period)*Math.exp(-b*period);
          const vowel=resonance(340+420*open,150)+.56*resonance(1040+180*open,220)+.24*resonance(2380,310);
          const rasp=(Math.random()*2-1)*(.25*(1-open)+.06);
          const env=Math.min(1,t/.014)*Math.min(1,(duration-t)/.08);
          data[Math.floor(start*rate)+i]=env*(vowel*(.82+.18*Math.cos(phase*Math.PI))+rasp)*.12;
        }
      }
      this.calls.set(special,buffer);
    }
    const voice=ctx.createBufferSource();voice.buffer=buffer;voice.connect(m.masterMuteNode);
    const release=()=>{voice.onended=null;voice.disconnect();this.voices.delete(voice);};
    this.voices.set(voice,release);voice.onended=release;voice.start();
  }

  private play(m: Phaser.Sound.WebAudioSoundManager, at: number,
    [voice, from, to, duration, peak, delay = 0]: Layer): void {
    const ctx = m.context, start = at + delay, end = start + duration;
    const gain = ctx.createGain();
    let source: AudioScheduledSourceNode, pitch: AudioParam;
    let filter: BiquadFilterNode | undefined;
    if (voice === 'air') {
      if (!this.air) {
        this.air = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * .25), ctx.sampleRate);
        const data = this.air.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = this.air;
      filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      noise.connect(filter).connect(gain);
      source = noise; pitch = filter.frequency;
    } else {
      const osc = ctx.createOscillator();
      osc.type = voice;
      osc.connect(gain);
      source = osc; pitch = osc.frequency;
    }
    pitch.setValueAtTime(from, start);
    pitch.exponentialRampToValueAtTime(to, end);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(peak, start + .005);
    gain.gain.exponentialRampToValueAtTime(.0001, end);
    gain.connect(m.masterMuteNode);
    const release = () => {
      source.onended = null;
      source.disconnect(); filter?.disconnect(); gain.disconnect();
      this.voices.delete(source);
    };
    this.voices.set(source, release);
    source.onended = release;
    source.start(start); source.stop(end);
  }

  stop(): void {
    if (this.stopped) return;
    this.stopped = true;
    this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this.stop, this);
    this.scene.events.off(Phaser.Scenes.Events.DESTROY, this.stop, this);
    for (const [source, release] of this.voices) { source.stop(); release(); }
    this.air = undefined;
    this.lastCue.clear();
  }
}
