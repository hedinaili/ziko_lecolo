import type * as Phaser from 'phaser';

type V = [number, number, number];
type Face = { value: number; normal: V; u: V; v: V; pips: number[] };
const faces: Face[] = [
  { value: 1, normal: [0,0,1], u: [1,0,0], v: [0,1,0], pips: [4] },
  { value: 6, normal: [0,0,-1], u: [-1,0,0], v: [0,1,0], pips: [0,2,3,5,6,8] },
  { value: 2, normal: [1,0,0], u: [0,0,-1], v: [0,1,0], pips: [0,8] },
  { value: 5, normal: [-1,0,0], u: [0,0,1], v: [0,1,0], pips: [0,2,4,6,8] },
  { value: 3, normal: [0,1,0], u: [1,0,0], v: [0,0,-1], pips: [0,4,8] },
  { value: 4, normal: [0,-1,0], u: [1,0,0], v: [0,0,1], pips: [0,2,6,8] },
];
const halfPi = Math.PI / 2;
const rests: readonly [number, number][] = [[0,0], [0,-halfPi], [halfPi,0], [-halfPi,0], [0,halfPi], [0,Math.PI]];

function rotate([x,y,z]: V, pitch: number, yaw: number): V {
  const c = Math.cos(pitch), s = Math.sin(pitch), depth = y*s + z*c;
  return [x*Math.cos(yaw) + depth*Math.sin(yaw), y*c - z*s, depth*Math.cos(yaw) - x*Math.sin(yaw)];
}

export function diePose(from: number, to: number, t: number) {
  const a = rests[from - 1], b = rests[to - 1];
  if (!a || !b) throw new RangeError('Face du dé hors limites');
  const p = 1 - (1 - t)**2;
  const pitch = a[0] + (b[0] - a[0] + 2*Math.PI)*p;
  const yaw = a[1] + (b[1] - a[1] + 2*Math.PI)*p;
  const view = (v: V) => rotate(rotate(v, pitch, yaw), -0.46, 0.4);
  // Ballistic arcs between successive impacts. Shorter flights lose height.
  const arc = (s: number, h: number) => 4*h*s*(1-s);
  const lift = t < 0.6 ? arc(t/0.6, 40) : t < 0.86 ? arc((t-0.6)/0.26, 10) : arc((t-0.86)/0.14, 2.5);
  return { lift, drift: -23*Math.sin(Math.PI*t), faces: faces.map(f => ({
    value: f.value, pips: f.pips, n: view(f.normal), u: view(f.u), v: view(f.v),
  })).filter(f => f.n[2] > 0.001).sort((l,r) => l.n[2] - r.n[2]) };
}

/** One small dynamic texture; face-local coordinates project the pips and bevels together. */
export function createRollingDie(scene: Phaser.Scene, x: number, y: number) {
  const key = 'rolling-die';
  const tex = scene.textures.createCanvas(key, 256, 256);
  if (!tex) throw new Error('Texture du dé indisponible.');
  const scale = 0.6;
  const image = scene.add.image(x, y - 16 * scale, key).setDisplaySize(128 * scale, 128 * scale);
  image.once('destroy', () => scene.textures.remove(key));
  const ctx = tex.context;
  const paint = (from: number, to: number, t: number) => {
    const pose = diePose(from,to,t);
    ctx.setTransform(2,0,0,2,0,0);
    ctx.clearRect(0,0,128,128);
    const cx = 64 + pose.drift, cy = 79 - pose.lift, radius = 20;
    ctx.save();
    ctx.translate(cx+3,105); ctx.scale(1 + pose.lift/100,0.31);
    const shadow = ctx.createRadialGradient(0,0,1,0,0,26);
    shadow.addColorStop(0, `rgba(48,33,13,${0.52-pose.lift/150})`); shadow.addColorStop(1,'transparent');
    ctx.fillStyle = shadow; ctx.fillRect(-26,-26,52,52); ctx.restore();
    for (const { n,u,v,pips } of pose.faces) {
      ctx.save();
      ctx.translate(cx+n[0]*radius, cy-n[1]*radius);
      ctx.transform(u[0],-u[1],v[0],-v[1],0,0);
      const light = 0.76 + 0.2*n[1] - 0.12*n[0] + 0.08*n[2];
      const ivory = (a: number) => `rgb(${255*light*a},${244*light*a},${211*light*a})`;
      const enamel = ctx.createLinearGradient(-16,20,16,-20);
      enamel.addColorStop(0,ivory(1.13)); enamel.addColorStop(1,ivory(0.96));
      ctx.fillStyle = enamel;
      ctx.beginPath(); ctx.roundRect(-20,-20,40,40,3.5);
      ctx.lineJoin = 'round'; ctx.strokeStyle = ivory(0.85); ctx.lineWidth = 2.8; ctx.stroke(); ctx.fill();
      ctx.strokeStyle = ivory(1.16); ctx.lineWidth = 0.9; ctx.stroke();
      for (const pip of pips) {
        const px = (pip%3-1)*10.4, py = (Math.floor(pip/3)-1)*10.4;
        ctx.beginPath(); ctx.arc(px,py,3.65,0,Math.PI*2); ctx.fillStyle = '#294038'; ctx.fill();
        ctx.beginPath(); ctx.arc(px,py,3.35,Math.PI,1.85*Math.PI); ctx.strokeStyle = '#14261f'; ctx.lineWidth=1.2; ctx.stroke();
      };
      ctx.restore();
    }
    tex.refresh();
  }
  let resting = 1;
  paint(1,1,1);
  return (result: number, landed: () => void) => {
    scene.tweens.addCounter({ from: 0, to: 1, duration: 850,
      onUpdate: tween => paint(resting,result,tween.getValue() ?? 0),
      onComplete: () => { resting = result; paint(result,result,1); landed(); },
    });
  };
}
