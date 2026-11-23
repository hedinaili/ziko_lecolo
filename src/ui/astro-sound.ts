import * as Phaser from 'phaser';

type Cue = 'shot' | 'bag' | 'bottle' | 'bird' | 'star1' | 'star2' | 'star3' | 'turbo';
let muted = false;
// Start/end frequency (Hz), duration (s), peak gain and waveform.
const cues: Record<Exclude<Cue,'turbo'>, [number, number, number, number, OscillatorType]> = {
  shot: [470, 270, .05, .015, 'sine'],
  bag: [360, 135, .08, .045, 'triangle'],
  bottle: [1060, 940, .16, .04, 'sine'],
  bird: [320, 145, .24, .045, 'triangle'],
  star1: [523, 523, .30, .06, 'sine'],
  star2: [659, 659, .32, .06, 'sine'],
  star3: [784, 784, .40, .06, 'sine'],
};

const turbineBuffers = new WeakMap<AudioContext, AudioBuffer>();
function turbineBuffer(ctx: AudioContext): AudioBuffer {
  const cached = turbineBuffers.get(ctx);
  if (cached) return cached;
  const rate = 22050, duration = 1.5;
  const buffer = ctx.createBuffer(1, rate * duration, rate);
  const samples = buffer.getChannelData(0);
  let air = 0, phase = 0;
  for (let i = 0; i < samples.length; i++) {
    const t = i/rate, spool = 1 - Math.exp(-5*t);
    air += (.09 + .13*spool) * (Math.random()*2 - 1 - air);
    phase += 2*Math.PI*(61 + 37*spool)/rate;
    const envelope = (1 - Math.exp(-16*t)) * Math.min(1, (duration-t)/.75)**2;
    samples[i] = envelope * (.13*air + .012*Math.sin(phase) + .007*Math.sin(phase*2));
  }
  turbineBuffers.set(ctx,buffer);
  return buffer;
}

export function astroTone(manager: Phaser.Sound.BaseSoundManager, cue: Cue): void {
  if (muted || !(manager instanceof Phaser.Sound.WebAudioSoundManager) || manager.context.state !== 'running') return;
  const ctx = manager.context, now = ctx.currentTime;
  if (cue === 'turbo') {
    const source = ctx.createBufferSource();
    source.buffer = turbineBuffer(ctx);
    source.connect(manager.masterMuteNode);
    source.onended = () => source.disconnect();
    source.start();
    return;
  }
  const [from, to, duration, peak, wave] = cues[cue];
  const osc = ctx.createOscillator(), gain = ctx.createGain();
  osc.type = wave;
  osc.frequency.setValueAtTime(from, now);
  osc.frequency.exponentialRampToValueAtTime(to, now + duration);
  gain.gain.setValueAtTime(.0001, now);
  gain.gain.exponentialRampToValueAtTime(peak, now + .009);
  gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
  osc.connect(gain).connect(manager.masterMuteNode);
  osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  osc.start(now); osc.stop(now + duration);
}

export function boardSoundButton(manager: Phaser.Sound.BaseSoundManager): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = 'board-sound';
  button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 9h4l5-4v14l-5-4H3z" fill="currentColor"/>
    <path class="waves" d="M16 8q4 4 0 8m3-11q7 7 0 14"/>
    <path class="slash" d="M3 3l18 18"/>
  </svg>`;
  button.onkeydown = event => event.stopPropagation();
  button.setAttribute('aria-label','Son du jeu');
  button.disabled = !(manager instanceof Phaser.Sound.WebAudioSoundManager);
  const refresh = () => {
    button.title = button.disabled ? 'Son indisponible' : muted ? 'Activer le son' : 'Couper le son';
    button.setAttribute('aria-pressed', String(!button.disabled && !muted));
  };
  button.onclick = () => {
    muted = !muted;
    manager.mute = muted;
    refresh();
    if (!muted && manager instanceof Phaser.Sound.WebAudioSoundManager) {
      void manager.context.resume().catch(error => console.warn('Reprise audio impossible', error));
    }
  };
  refresh();
  return button;
}
