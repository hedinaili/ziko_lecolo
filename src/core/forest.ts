import { ERA_INDEX } from '../data/balance';
import { Rng } from './rng';
import type { Era } from './types';

type Stage = 'fertile' | 'seed' | 'water' | 'tree' | 'dry';
export class ForestRound {
  elapsed = 0;
  score = 0;
  planted = 0;
  watered = 0;
  dried = 0;
  mistakes = 0;
  fertile = 0;
  polluted = 1;
  stage: Stage = 'fertile';
  readonly grove: number[] = [];
  private readyAt = 0;
  private dryAt = 0;
  private trapUsed = false;
  private wave = 0;
  private readonly period: number;
  readonly goal: number;
  constructor(private rng: Rng, era: Era) {
    this.period = 3000 - 200 * ERA_INDEX[era];
    this.goal = Math.round(150 * 3000 / this.period);
  }
  get finished() { return this.elapsed >= 30000; }
  act(index: number) {
    if (this.finished) return;
    if (index === this.polluted && !this.trapUsed) {
      this.trapUsed = true; this.mistakes++; this.score = Math.max(0,this.score-5);
      return 'pollution';
    }
    if (index !== this.fertile) return;
    if (this.stage === 'fertile') {
      this.planted++; this.stage = 'seed';
      this.readyAt = this.elapsed + 450;
      this.dryAt = this.readyAt + this.period*.47;
      return 'plant';
    }
    if (this.stage === 'water') {
      this.watered++; this.score += 20; this.stage = 'tree'; this.grove.push(index);
      return 'water';
    }
  }
  advance(ms:number) {
    if (!Number.isFinite(ms) || ms<0) throw new RangeError('Durée de jeu invalide');
    this.elapsed=Math.min(30000,this.elapsed+ms);
    while ((this.wave+1)*this.period <= this.elapsed && (this.wave+1)*this.period < 30000) {
      this.drySeed();
      this.wave++;
      this.fertile=(this.fertile+this.rng.int(1,5))%6;
      this.polluted=(this.fertile+this.rng.int(1,5))%6;
      this.stage='fertile'; this.trapUsed=false;
    }
    if (this.stage==='seed' && this.elapsed>=this.readyAt) this.stage='water';
    if (this.finished || this.elapsed>=this.dryAt) this.drySeed();
  }
  private drySeed() {
    if (this.stage==='water' || this.stage==='seed') {
      this.stage='dry'; this.dried++; this.score=Math.max(0,this.score-5);
    }
  }
}
