import { Rng } from './rng';
import type { Era } from './types';
import { ERA_INDEX } from '../data/balance';

export const ROUND_MS = 30_000;
const astroSpeed = (era: Era) => 1 + 0.15 * ERA_INDEX[era];
export const astroGoal = (era: Era) => Math.round(120 * astroSpeed(era));
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(v, b));
type Target = { kind: 'bag' | 'bottle' | 'bird'; x: number; y: number; hp: number; vx: number; touched?: boolean };
export type AstroHit = Pick<Target, 'x' | 'y' | 'kind'> & { removed: boolean; scoreDelta: number };

export class AstroRound {
  x = 640;
  y = 600;
  score = 0;
  readonly breakdown = {
    bottle: { touched: 0, points: 0 },
    bag: { touched: 0, points: 0 },
    bird: { touched: 0, points: 0 },
  };
  elapsed = 0;
  readonly targets: Target[] = [];
  readonly shots: { x: number; y: number }[] = [];
  readonly goal: number;
  private spawn = 0;
  private fire = 0;
  private readonly speed: number;
  constructor(private readonly rng: Rng, era: Era) {
    this.speed = astroSpeed(era);
    this.goal = astroGoal(era);
  }
  get finished() { return this.elapsed >= ROUND_MS; }
  private turboEnd = -5000;
  get turboActive() { return this.elapsed < this.turboEnd; }
  get turboGauge() {
    return this.turboActive ? (this.turboEnd - this.elapsed) / 2000 : Math.min(1, (this.elapsed - this.turboEnd) / 5000);
  }
  activateTurbo(): boolean {
    if (this.finished || this.turboActive || this.turboGauge < 1) return false;
    this.turboEnd = this.elapsed + 2000;
    return true;
  }
  get movementFactor() { return this.turboActive ? 1.8 : 1; }

  advance(ms: number, aimX: number, aimY: number, onHit?: (hit: AstroHit) => void, onShot?: () => void): void {
    if (!Number.isFinite(ms) || ms < 0) throw new RangeError('Durée de jeu invalide');
    let left = Math.min(ms, ROUND_MS - this.elapsed);
    const end = this.elapsed + left;
    // Small steps keep fast shots from tunnelling through a bag on a slow frame.
    while (left > 0) {
      const dt = Math.min(16, left, this.turboActive ? this.turboEnd - this.elapsed : Infinity) / 1000;
      left = Math.max(0, left - dt * 1000);
      const travel = dt * this.movementFactor;
      this.elapsed += dt * 1000;
      this.x += clamp(clamp(aimX, 32, 1248) - this.x, -620 * travel, 620 * travel);
      this.y += clamp(clamp(aimY, 410, 670) - this.y, -460 * travel, 460 * travel);
      this.fire -= dt;
      if (this.fire <= 0) { this.shots.push({ x: this.x, y: this.y - 25 }); this.fire += 0.25; onShot?.(); }
      this.spawn -= dt;
      if (this.spawn <= 0) {
        const kind = this.rng.pick(['bag', 'bag', 'bag', 'bottle', 'bird'] as const);
        this.targets.push({ kind, x: this.rng.int(45, 1235), y: 62, hp: kind === 'bottle' ? 2 : 1,
          vx: kind === 'bird' ? this.rng.pick([-105, 105]) : this.rng.int(-19, 19) });
        this.spawn += 0.65 / this.speed;
      }
      for (const t of this.targets) {
        t.y += dt * 133 * this.speed;
        t.x += dt * t.vx;
        if ((t.x < 25 && t.vx < 0) || (t.x > 1255 && t.vx > 0)) t.vx *= -1;
      }
      for (let i = this.shots.length - 1; i >= 0; i--) {
        const shot = this.shots[i]!;
        shot.y -= dt * 800;
        const hit = this.targets.findIndex(t => Math.abs(t.x - shot.x) < 25 && Math.abs(t.y - shot.y) < 24);
        if (hit >= 0) {
          const t = this.targets[hit]!;
          t.hp--;
          const previousScore = this.score;
          if (t.hp === 0) {
            this.score = Math.max(0, this.score + (t.kind === 'bird' ? -10 : t.kind === 'bottle' ? 15 : 10));
            this.targets.splice(hit, 1);
          }
          const scoreDelta = this.score - previousScore;
          const stats = this.breakdown[t.kind];
          if (!t.touched) { stats.touched++; t.touched = true; }
          stats.points += scoreDelta;
          onHit?.({ x: t.x, y: t.y, kind: t.kind, removed: t.hp === 0, scoreDelta });
        }
        if (hit >= 0 || shot.y < 50) this.shots.splice(i, 1);
      }
      for (let i = this.targets.length - 1; i >= 0; i--) if (this.targets[i]!.y > 743) this.targets.splice(i, 1);
    }
    this.elapsed = end;
  }
}
