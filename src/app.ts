import { UiStateMachine, type UiState } from './core/ui-state';

/** Application-wide singletons shared by the scenes. */
export const ui = new UiStateMachine();

export interface DebugInfo {
  scene: string;
  introIndex: number;
  introStep: string;
  attract: boolean;
}

export const debugInfo: DebugInfo = { scene: 'Boot', introIndex: -1, introStep: '', attract: false };

declare global {
  interface Window {
    __ziko?: {
      ui: () => Readonly<UiState>;
      commands: () => string[];
      debug: () => DebugInfo;
      fps: () => number;
    };
  }
}

/** Test hooks used by the Playwright end-to-end tests (read-only). */
export function exposeDebugHooks(getFps: () => number): void {
  window.__ziko = {
    ui: () => ({ ...ui.state, queue: [...ui.state.queue] }),
    commands: () => ui.availableCommands(),
    debug: () => ({ ...debugInfo }),
    fps: getFps,
  };
}
