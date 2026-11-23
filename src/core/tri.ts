import { ERA_INDEX } from '../data/balance';
import { Rng } from './rng';
import type { Era } from './types';

export const BINS = ['Emballages', 'Verre', 'Compost', 'Reste', 'Piles'] as const;
const ITEMS = [
  { name:'Boîte en carton', frame:0, bin:0 }, { name:'Pot de yaourt vide', frame:1, bin:0 },
  { name:'Bocal en verre', frame:2, bin:1 }, { name:'Bouteille en verre', frame:3, bin:1 },
  { name:'Trognon de pomme', frame:4, bin:2 }, { name:'Peau de banane', frame:5, bin:2 },
  { name:'Tasse cassée', frame:6, bin:3 }, { name:'Éponge usée', frame:7, bin:3 },
] as const;
const BATTERY = { name:'Pile usagée', frame:8, bin:4 } as const;

export class TriRound {
  elapsed = 0;
  score = 0;
  streak = 0;
  correct = 0;
  errors = 0;
  missed = 0;
  readonly bins = BINS.map(() => ({ deposited:0, errors:0, missed:0 }));
  serial = 0;
  item: typeof ITEMS[number] | typeof BATTERY = ITEMS[0];
  private since = 0;
  private window = 0;
  private readonly difficulty: number;
  readonly goal: number;
  constructor(private rng: Rng, era: Era) {
    this.difficulty = 1 + .15 * ERA_INDEX[era];
    this.goal = Math.round(200 * this.difficulty);
    this.next();
  }
  get finished() { return this.elapsed >= 30_000; }
  get progress() { return (this.elapsed - this.since) / this.window; }
  private next() {
    this.serial++;
    this.item = this.serial % 6 === 0 ? BATTERY : this.rng.pick(ITEMS);
    this.since = this.elapsed;
    this.window = (4100 - 1000*this.elapsed/30_000) / this.difficulty;
  }
  sort(bin: number): void {
    if (this.finished || !this.bins[bin]) return;
    this.bins[bin].deposited++;
    if (bin === this.item.bin) {
      this.correct++; this.streak++;
      this.score += 10 * Math.min(this.streak, 3);
    } else {
      this.bins[bin].errors++; this.errors++; this.streak = 0; this.score = Math.max(0,this.score - 5);
    }
    this.next();
  }
  advance(ms: number): void {
    if (!Number.isFinite(ms) || ms < 0) throw new RangeError('Durée de jeu invalide');
    const end = Math.min(30_000, this.elapsed + ms);
    while (this.since + this.window <= end && this.since + this.window < 30_000) {
      this.elapsed = this.since + this.window;
      this.bins[this.item.bin]!.missed++; this.missed++; this.streak = 0;
      this.next();
    }
    this.elapsed = end;
  }
}
