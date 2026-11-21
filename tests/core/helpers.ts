import type { GameEvent } from '../../src/core/events';
import { Rng } from '../../src/core/rng';
import { createInitialState, type Ctx, type GameState } from '../../src/core/state';

export interface TestCtx extends Ctx {
  events: GameEvent[];
}

/** Builds a rules context on a fresh state, recording every emitted event. */
export function makeCtx(patch: Partial<GameState> = {}, seed = 1): TestCtx {
  const state = { ...createInitialState(seed), ...patch };
  const events: GameEvent[] = [];
  return { state, rng: new Rng(seed), emit: (e) => events.push(e), events };
}

export function eventsOf<T extends GameEvent['type']>(ctx: TestCtx, type: T): Extract<GameEvent, { type: T }>[] {
  return ctx.events.filter((e): e is Extract<GameEvent, { type: T }> => e.type === type);
}

export function milestoneKeys(ctx: TestCtx): string[] {
  return eventsOf(ctx, 'milestone').map((e) => e.key);
}
