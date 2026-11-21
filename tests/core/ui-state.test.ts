import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  MAX_LOCK_MS,
  UiStateMachine,
  type OverlayId,
  type UiCommand,
  type UiSystemEvent,
} from '../../src/core/ui-state';

function machine() {
  let t = 0;
  const clock = { advance: (ms: number) => (t += ms) };
  const ui = new UiStateMachine(() => t);
  return { ui, clock };
}

function toBoard(ui: UiStateMachine) {
  ui.send({ type: 'start' });
  ui.send({ type: 'skip' });
  ui.send({ type: 'begin' });
}

describe('UiStateMachine — flow', () => {
  it('goes title → intro cinematic → intro text → board', () => {
    const { ui } = machine();
    expect(ui.availableCommands()).toEqual(['start']);
    ui.send({ type: 'start' });
    expect(ui.state).toMatchObject({ mode: 'cinematic', cinematic: 'intro', returnMode: 'introText' });
    ui.notify({ type: 'cinematicDone' });
    expect(ui.state.mode).toBe('introText');
    ui.send({ type: 'begin' });
    expect(ui.state.mode).toBe('board');
  });

  it('plays a full turn: roll → move → tile → year summary → board', () => {
    const { ui } = machine();
    toBoard(ui);
    expect(ui.send({ type: 'roll' })).toBe(true);
    expect(ui.state.mode).toBe('moving');
    expect(ui.send({ type: 'openOverlay', id: 'map' })).toBe(false);
    ui.notify({ type: 'moveDone', next: 'tile' });
    expect(ui.state.mode).toBe('tile');
    ui.notify({ type: 'tileDone' });
    expect(ui.state.mode).toBe('yearSummary');
    ui.send({ type: 'continue' });
    expect(ui.state.mode).toBe('board');
  });

  it('runs activities with pause/resume and escape', () => {
    const { ui } = machine();
    toBoard(ui);
    ui.send({ type: 'roll' });
    ui.notify({ type: 'moveDone', next: 'activity' });
    expect(ui.send({ type: 'openOverlay', id: 'inventory' })).toBe(false);
    ui.send({ type: 'pause' });
    expect(ui.state.paused).toBe(true);
    expect(ui.availableCommands()).toEqual(['resume', 'escape']);
    ui.send({ type: 'escape' });
    expect(ui.state.paused).toBe(false);
    ui.send({ type: 'escape' });
    ui.notify({ type: 'activityDone' });
    expect(ui.state).toMatchObject({ mode: 'yearSummary', paused: false });
  });

  it('ignores system events that do not match the current mode', () => {
    const { ui } = machine();
    expect(ui.notify({ type: 'tileDone' })).toBe(false);
    expect(ui.notify({ type: 'moveDone', next: 'tile' })).toBe(false);
    expect(ui.notify({ type: 'activityDone' })).toBe(false);
    expect(ui.notify({ type: 'cinematicDone' })).toBe(false);
    expect(ui.state.mode).toBe('title');
  });
});

describe('UiStateMachine — one window at a time', () => {
  it('replaces an open overlay instead of stacking it', () => {
    const { ui } = machine();
    toBoard(ui);
    ui.send({ type: 'openOverlay', id: 'inventory' });
    ui.send({ type: 'openOverlay', id: 'map' });
    expect(ui.state.overlay).toBe('map');
    expect(ui.send({ type: 'roll' })).toBe(false);
    ui.send({ type: 'closeOverlay' });
    expect(ui.state.overlay).toBeNull();
  });

  it('escape closes the top window, or opens the menu on the board', () => {
    const { ui } = machine();
    toBoard(ui);
    ui.send({ type: 'escape' });
    expect(ui.state.overlay).toBe('menu');
    ui.send({ type: 'escape' });
    expect(ui.state.overlay).toBeNull();
  });
});

describe('UiStateMachine — cinematics queue', () => {
  it('plays queued milestone scenes one by one before the year summary', () => {
    const { ui } = machine();
    toBoard(ui);
    ui.send({ type: 'roll' });
    ui.notify({ type: 'moveDone', next: 'tile' });
    ui.notify({ type: 'queueCinematic', id: 'level:toxicGas:alert' });
    ui.notify({ type: 'queueCinematic', id: 'first:tv' });
    ui.notify({ type: 'tileDone' });
    expect(ui.state).toMatchObject({ mode: 'cinematic', cinematic: 'level:toxicGas:alert', returnMode: 'yearSummary' });
    ui.send({ type: 'skip' });
    expect(ui.state.cinematic).toBe('first:tv');
    ui.notify({ type: 'cinematicDone' });
    expect(ui.state.mode).toBe('yearSummary');
  });

  it('plays the epilogue on game over then offers restart', () => {
    const { ui } = machine();
    toBoard(ui);
    ui.send({ type: 'roll' });
    ui.notify({ type: 'moveDone', next: 'tile' });
    ui.notify({ type: 'gameOver' });
    ui.notify({ type: 'queueCinematic', id: 'ignored' });
    ui.notify({ type: 'tileDone' });
    expect(ui.state).toMatchObject({ mode: 'cinematic', cinematic: 'epilogue' });
    ui.send({ type: 'skip' });
    expect(ui.state.mode).toBe('ended');
    expect(ui.availableCommands()).toEqual(['restart']);
    ui.send({ type: 'restart' });
    expect(ui.state.mode).toBe('title');
  });

  it('starts the epilogue immediately when the game ends during the year summary', () => {
    const { ui } = machine();
    toBoard(ui);
    ui.send({ type: 'roll' });
    ui.notify({ type: 'moveDone', next: 'tile' });
    ui.notify({ type: 'tileDone' });
    ui.notify({ type: 'gameOver' });
    expect(ui.state.cinematic).toBe('epilogue');
  });
});

describe('UiStateMachine — locks and tutorial', () => {
  it('blocks input during transitions, then releases it with the watchdog', () => {
    const { ui, clock } = machine();
    toBoard(ui);
    ui.notify({ type: 'lock' });
    expect(ui.availableCommands()).toEqual([]);
    expect(ui.send({ type: 'roll' })).toBe(false);
    clock.advance(MAX_LOCK_MS);
    expect(ui.send({ type: 'roll' })).toBe(true);
  });

  it('unlocks explicitly', () => {
    const { ui } = machine();
    ui.notify({ type: 'lock' });
    ui.notify({ type: 'unlock' });
    expect(ui.availableCommands()).toEqual(['start']);
  });

  it('only allows the expected tutorial action (plus skip)', () => {
    const { ui } = machine();
    toBoard(ui);
    ui.notify({ type: 'tutorialExpect', command: 'openOverlay' });
    expect(ui.availableCommands()).toEqual(['openOverlay', 'skipTutorial']);
    expect(ui.send({ type: 'roll' })).toBe(false);
    ui.notify({ type: 'tutorialExpect', command: 'tutorialNext' });
    expect(ui.send({ type: 'tutorialNext' })).toBe(true);
    ui.notify({ type: 'tutorialExpect', command: 'continue' });
    expect(ui.availableCommands()).toEqual(['skipTutorial']);
    ui.send({ type: 'skipTutorial' });
    expect(ui.state.tutorialExpect).toBeNull();
    expect(ui.send({ type: 'roll' })).toBe(true);
  });

  it('notifies listeners and supports unsubscribing', () => {
    const { ui } = machine();
    let calls = 0;
    const off = ui.onChange(() => calls++);
    ui.send({ type: 'start' });
    off();
    ui.send({ type: 'skip' });
    expect(calls).toBe(1);
  });
});

// --- Property-based tests (docs/16: no soft lock, never two windows) -------------

const overlays: OverlayId[] = ['map', 'inventory', 'status', 'journal', 'help', 'menu'];
const commandArb: fc.Arbitrary<UiCommand> = fc.oneof(
  fc.constantFrom<UiCommand>(
    { type: 'start' },
    { type: 'skip' },
    { type: 'begin' },
    { type: 'closeOverlay' },
    { type: 'escape' },
    { type: 'roll' },
    { type: 'fastForward' },
    { type: 'tileAction' },
    { type: 'activityInput' },
    { type: 'pause' },
    { type: 'resume' },
    { type: 'continue' },
    { type: 'restart' },
    { type: 'tutorialNext' },
    { type: 'skipTutorial' },
  ),
  fc.constantFrom(...overlays).map((id): UiCommand => ({ type: 'openOverlay', id })),
);
const eventArb: fc.Arbitrary<UiSystemEvent> = fc.oneof(
  fc.constantFrom<UiSystemEvent>(
    { type: 'moveDone', next: 'tile' },
    { type: 'moveDone', next: 'activity' },
    { type: 'tileDone' },
    { type: 'activityDone' },
    { type: 'cinematicDone' },
    { type: 'queueCinematic', id: 'milestone' },
    { type: 'gameOver' },
    { type: 'lock' },
    { type: 'unlock' },
    { type: 'tutorialExpect', command: null },
    { type: 'tutorialExpect', command: 'roll' },
    { type: 'tutorialExpect', command: 'tutorialNext' },
  ),
);
const stepArb = fc.oneof(
  commandArb.map((c) => ({ kind: 'cmd' as const, c })),
  eventArb.map((e) => ({ kind: 'evt' as const, e })),
  fc.integer({ min: 0, max: 5000 }).map((ms) => ({ kind: 'time' as const, ms })),
);

describe('UiStateMachine — properties', () => {
  it('keeps invariants for any sequence of inputs and events', () => {
    fc.assert(
      fc.property(fc.array(stepArb, { maxLength: 200 }), (steps) => {
        const { ui, clock } = machine();
        for (const step of steps) {
          if (step.kind === 'cmd') ui.send(step.c);
          else if (step.kind === 'evt') ui.notify(step.e);
          else clock.advance(step.ms);

          const s = ui.state;
          // Never more than one window: an overlay only exists on the board.
          if (s.overlay !== null) expect(s.mode).toBe('board');
          // Pause only makes sense inside an activity.
          if (s.paused) expect(s.mode).toBe('activity');
          // A cinematic id exists exactly in cinematic mode.
          expect(s.cinematic !== null).toBe(s.mode === 'cinematic');
          // No soft lock: there is always something to do (a lock is released by the watchdog).
          if (!s.locked) expect(ui.availableCommands().length).toBeGreaterThan(0);
        }
        clock.advance(MAX_LOCK_MS);
        expect(ui.availableCommands().length).toBeGreaterThan(0);
      }),
      { numRuns: 500 },
    );
  });

  it('can always reach the board or the end from any reachable state', () => {
    fc.assert(
      fc.property(fc.array(stepArb, { maxLength: 100 }), (steps) => {
        const { ui, clock } = machine();
        for (const step of steps) {
          if (step.kind === 'cmd') ui.send(step.c);
          else if (step.kind === 'evt') ui.notify(step.e);
          else clock.advance(step.ms);
        }
        clock.advance(MAX_LOCK_MS);
        // Greedy escape plan using only accepted inputs and legitimate completion events.
        for (let i = 0; i < 50 && ui.state.mode !== 'board' && ui.state.mode !== 'ended'; i++) {
          const mode = ui.state.mode;
          if (ui.canSend('skipTutorial')) ui.send({ type: 'skipTutorial' });
          if (mode === 'title') ui.send({ type: 'start' });
          else if (mode === 'cinematic') ui.send({ type: 'skip' });
          else if (mode === 'introText') ui.send({ type: 'begin' });
          else if (mode === 'moving') ui.notify({ type: 'moveDone', next: 'tile' });
          else if (mode === 'tile') ui.notify({ type: 'tileDone' });
          else if (mode === 'activity') ui.notify({ type: 'activityDone' });
          else if (mode === 'yearSummary') ui.send({ type: 'continue' });
        }
        expect(['board', 'ended']).toContain(ui.state.mode);
      }),
      { numRuns: 500 },
    );
  });
});
