/**
 * Single source of truth for what is displayed (docs/16 "Pas de blocage et un seul menu à la fois").
 * Pure TypeScript: scenes send commands, read `state` and `availableCommands()`, never open windows themselves.
 */

export type OverlayId = 'map' | 'inventory' | 'status' | 'journal' | 'help' | 'menu';
export type Mode = 'title' | 'cinematic' | 'introText' | 'board' | 'moving' | 'tile' | 'activity' | 'yearSummary' | 'ended';
export type NextAfterMove = 'tile' | 'activity';

/** Player inputs. */
export type UiCommand =
  | { type: 'start' }
  | { type: 'skip' }
  | { type: 'begin' }
  | { type: 'openOverlay'; id: OverlayId }
  | { type: 'closeOverlay' }
  | { type: 'escape' }
  | { type: 'roll' }
  | { type: 'fastForward' }
  | { type: 'tileAction' }
  | { type: 'activityInput' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'continue' }
  | { type: 'restart' }
  | { type: 'tutorialNext' }
  | { type: 'skipTutorial' };
export type UiCommandType = UiCommand['type'];

/** Notifications from scenes / the rules engine. */
export type UiSystemEvent =
  | { type: 'moveDone'; next: NextAfterMove }
  | { type: 'tileDone' }
  | { type: 'activityDone' }
  | { type: 'cinematicDone' }
  | { type: 'queueCinematic'; id: string }
  | { type: 'gameOver' }
  | { type: 'lock' }
  | { type: 'unlock' }
  | { type: 'tutorialExpect'; command: UiCommandType | null };

export interface UiState {
  mode: Mode;
  overlay: OverlayId | null;
  paused: boolean;
  cinematic: string | null;
  returnMode: Mode | null;
  locked: boolean;
  lockedAt: number | null;
  queue: string[];
  tutorialExpect: UiCommandType | null;
  gameOver: boolean;
}

export const INTRO_CINEMATIC = 'intro';
export const EPILOGUE_CINEMATIC = 'epilogue';
/** Watchdog: a transition can never block input longer than this (docs/16). */
export const MAX_LOCK_MS = 4000;

export function initialUiState(): UiState {
  return {
    mode: 'title',
    overlay: null,
    paused: false,
    cinematic: null,
    returnMode: null,
    locked: false,
    lockedAt: null,
    queue: [],
    tutorialExpect: null,
    gameOver: false,
  };
}

export type UiListener = (state: Readonly<UiState>) => void;

export class UiStateMachine {
  private s: UiState = initialUiState();
  private listeners = new Set<UiListener>();

  constructor(private readonly now: () => number = () => Date.now()) {}

  get state(): Readonly<UiState> {
    return this.s;
  }

  onChange(listener: UiListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Commands accepted right now: used to enable/disable buttons. Empty only while locked (bounded by the watchdog). */
  availableCommands(): UiCommandType[] {
    this.tick();
    if (this.s.locked) return [];
    const base = this.baseCommands();
    if (this.s.tutorialExpect === null) return base;
    const allowed: UiCommandType[] = ['skipTutorial'];
    if (base.includes(this.s.tutorialExpect) || this.s.tutorialExpect === 'tutorialNext') allowed.unshift(this.s.tutorialExpect);
    return allowed;
  }

  canSend(type: UiCommandType): boolean {
    return this.availableCommands().includes(type);
  }

  /** Returns true when the command was accepted. */
  send(cmd: UiCommand): boolean {
    if (!this.canSend(cmd.type)) return false;
    const s = this.s;
    switch (cmd.type) {
      case 'start':
        this.playCinematic(INTRO_CINEMATIC, 'introText');
        break;
      case 'skip':
        this.endCinematic();
        break;
      case 'begin':
        this.goTo('board');
        break;
      case 'openOverlay':
        s.overlay = cmd.id;
        break;
      case 'closeOverlay':
        s.overlay = null;
        break;
      case 'escape':
        this.escape();
        break;
      case 'roll':
        s.overlay = null;
        s.mode = 'moving';
        break;
      case 'pause':
        s.paused = true;
        break;
      case 'resume':
        s.paused = false;
        break;
      case 'continue':
        this.goTo('board');
        break;
      case 'restart':
        this.s = initialUiState();
        break;
      case 'skipTutorial':
        s.tutorialExpect = null;
        break;
      case 'tutorialNext':
      case 'fastForward':
      case 'tileAction':
      case 'activityInput':
        break;
    }
    this.changed();
    return true;
  }

  /** System notifications are validated against the current mode; invalid ones are ignored. */
  notify(event: UiSystemEvent): boolean {
    const s = this.s;
    let ok = true;
    switch (event.type) {
      case 'moveDone':
        ok = s.mode === 'moving';
        if (ok) s.mode = event.next;
        break;
      case 'tileDone':
        ok = s.mode === 'tile';
        if (ok) this.goTo('yearSummary');
        break;
      case 'activityDone':
        ok = s.mode === 'activity';
        if (ok) {
          s.paused = false;
          this.goTo('yearSummary');
        }
        break;
      case 'cinematicDone':
        ok = s.mode === 'cinematic';
        if (ok) this.endCinematic();
        break;
      case 'queueCinematic':
        if (!s.gameOver) s.queue.push(event.id);
        break;
      case 'gameOver':
        s.gameOver = true;
        s.queue = [];
        s.overlay = null;
        s.paused = false;
        if (s.mode === 'yearSummary' || s.mode === 'board' || s.mode === 'cinematic') this.playCinematic(EPILOGUE_CINEMATIC, 'ended');
        break;
      case 'lock':
        s.locked = true;
        s.lockedAt = this.now();
        break;
      case 'unlock':
        s.locked = false;
        s.lockedAt = null;
        break;
      case 'tutorialExpect':
        s.tutorialExpect = event.command;
        break;
    }
    if (ok) this.changed();
    return ok;
  }

  /** Releases a lock that lasted too long (an animation that never finished). */
  tick(): void {
    if (this.s.locked && this.s.lockedAt !== null && this.now() - this.s.lockedAt >= MAX_LOCK_MS) {
      this.s.locked = false;
      this.s.lockedAt = null;
      this.changed();
    }
  }

  private baseCommands(): UiCommandType[] {
    const s = this.s;
    switch (s.mode) {
      case 'title':
        return ['start'];
      case 'cinematic':
        return ['skip', 'escape'];
      case 'introText':
        return ['begin'];
      case 'board':
        return s.overlay ? ['openOverlay', 'closeOverlay', 'escape', 'tutorialNext'] : ['roll', 'openOverlay', 'escape', 'tutorialNext'];
      case 'moving':
        return ['fastForward'];
      case 'tile':
        return ['tileAction'];
      case 'activity':
        return s.paused ? ['resume', 'escape'] : ['activityInput', 'pause', 'escape'];
      case 'yearSummary':
        return ['continue'];
      case 'ended':
        return ['restart'];
    }
  }

  private escape(): void {
    const s = this.s;
    if (s.mode === 'cinematic') this.endCinematic();
    else if (s.mode === 'activity') s.paused = !s.paused;
    else if (s.mode === 'board') s.overlay = s.overlay ? null : 'menu';
  }

  /** Enter a mode, playing queued cinematics first (one at a time, docs/08). */
  private goTo(target: Mode): void {
    const s = this.s;
    s.overlay = null;
    if (s.gameOver && target !== 'ended') {
      this.playCinematic(EPILOGUE_CINEMATIC, 'ended');
      return;
    }
    const next = s.queue.shift();
    if (next !== undefined) {
      this.playCinematic(next, target);
      return;
    }
    s.mode = target;
    s.cinematic = null;
    s.returnMode = null;
  }

  private playCinematic(id: string, returnMode: Mode): void {
    const s = this.s;
    s.mode = 'cinematic';
    s.cinematic = id;
    s.returnMode = returnMode;
    s.overlay = null;
  }

  private endCinematic(): void {
    const target = this.s.returnMode ?? 'board';
    this.s.cinematic = null;
    this.s.returnMode = null;
    if (target === 'ended') {
      this.s.mode = 'ended';
      return;
    }
    this.goTo(target);
  }

  private changed(): void {
    for (const l of this.listeners) l(this.s);
  }
}
