import { describe, expect, it } from 'vitest';
import { INTRO_PANELS, INTRO_TEXT } from '../../src/data/introPanels';
import { ComicSequence, visibleChars } from '../../src/ui/sequence';

describe('intro panels data (docs/02)', () => {
  it('has 15 panels numbered in order, alternating sides', () => {
    expect(INTRO_PANELS).toHaveLength(15);
    INTRO_PANELS.forEach((p, i) => {
      expect(p.id).toBe(i + 1);
      expect(p.narration.length).toBeGreaterThan(10);
      if (i > 0) expect(p.side).not.toBe(INTRO_PANELS[i - 1]!.side);
    });
  });

  it('ends with Ziko seen from behind and the 40-year mission', () => {
    const last = INTRO_PANELS.at(-1)!;
    expect(last.back).toBe(true);
    expect(last.narration).toContain('40 ans');
  });

  it('keeps the prologue facts of the notes', () => {
    const all = INTRO_PANELS.map((p) => p.narration).join(' ');
    for (const fact of ['300 ans', 'moitié des humains', '50 ans', '4 °C', 'pétrole', 'créatures monstrueuses', 'extinction', 'catastrophes']) {
      expect(all).toContain(fact);
    }
    expect(INTRO_TEXT).toContain('Ziko');
  });
});

describe('visibleChars (typewriter)', () => {
  it('reveals about 30 characters per second, clamped to the text', () => {
    expect(visibleChars(100, 0)).toBe(0);
    expect(visibleChars(100, -5)).toBe(0);
    expect(visibleChars(100, 1000)).toBe(30);
    expect(visibleChars(100, 10_000)).toBe(100);
    expect(visibleChars(10, 500, 10)).toBe(5);
  });
});

describe('ComicSequence', () => {
  it('completes the text on the first input, then moves to the next panel', () => {
    const seq = new ComicSequence(['a', 'b']);
    expect(seq.step).toBe('typing');
    expect(seq.advance()).toBe('completed');
    expect(seq.step).toBe('ready');
    expect(seq.advance()).toBe('next');
    expect(seq.panel).toBe('b');
    expect(seq.index).toBe(1);
    expect(seq.isLast).toBe(true);
  });

  it('becomes ready when typing finishes by itself', () => {
    const seq = new ComicSequence(['a']);
    seq.typingFinished();
    expect(seq.step).toBe('ready');
    seq.typingFinished();
    expect(seq.advance()).toBe('finished');
    expect(seq.advance()).toBe('ignored');
  });

  it('can be skipped at any time', () => {
    const seq = new ComicSequence(INTRO_PANELS);
    seq.skip();
    expect(seq.step).toBe('finished');
    expect(seq.advance()).toBe('ignored');
    expect(seq.count).toBe(15);
  });

  it('always finishes in at most 2 inputs per panel (no soft lock)', () => {
    const seq = new ComicSequence(INTRO_PANELS);
    let inputs = 0;
    while (seq.step !== 'finished') {
      seq.advance();
      inputs++;
      expect(inputs).toBeLessThanOrEqual(30);
    }
    expect(inputs).toBe(30);
  });

  it('rejects an empty sequence', () => {
    expect(() => new ComicSequence([])).toThrow(RangeError);
  });
});
