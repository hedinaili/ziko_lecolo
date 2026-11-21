/**
 * Pure logic of a comic sequence (intro, milestones, epilogue): no Phaser, unit-tested.
 * Each panel: narration types itself, then the bubble appears; an input completes the text or moves on.
 */

export const TYPE_SPEED_CPS = 30;

/** Number of characters visible after `elapsedMs` (docs/02: ~30 characters per second). */
export function visibleChars(length: number, elapsedMs: number, cps = TYPE_SPEED_CPS): number {
  if (elapsedMs <= 0) return 0;
  return Math.min(length, Math.floor((elapsedMs * cps) / 1000));
}

export type SequenceStep = 'typing' | 'ready' | 'finished';
export type AdvanceResult = 'completed' | 'next' | 'finished' | 'ignored';

export class ComicSequence<P> {
  private i = 0;
  private stepValue: SequenceStep;

  constructor(private readonly panels: readonly P[]) {
    if (panels.length === 0) throw new RangeError('A comic sequence needs at least one panel');
    this.stepValue = 'typing';
  }

  get index(): number {
    return this.i;
  }

  get count(): number {
    return this.panels.length;
  }

  get step(): SequenceStep {
    return this.stepValue;
  }

  get panel(): P {
    return this.panels[this.i] as P;
  }

  get isLast(): boolean {
    return this.i === this.panels.length - 1;
  }

  /** Called when the typewriter reached the end of the narration by itself. */
  typingFinished(): void {
    if (this.stepValue === 'typing') this.stepValue = 'ready';
  }

  /** Player input (click, Space, Enter): first completes the text, then goes to the next panel. */
  advance(): AdvanceResult {
    if (this.stepValue === 'finished') return 'ignored';
    if (this.stepValue === 'typing') {
      this.stepValue = 'ready';
      return 'completed';
    }
    if (this.isLast) {
      this.stepValue = 'finished';
      return 'finished';
    }
    this.i++;
    this.stepValue = 'typing';
    return 'next';
  }

  skip(): void {
    this.stepValue = 'finished';
  }
}
