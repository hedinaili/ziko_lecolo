import type * as Phaser from 'phaser';

/**
 * Devices whose main pointer is a finger (phones, tablets) get touch wording and fullscreen
 * (docs/06 "Téléphones et petits écrans"). A laptop with a touch screen keeps the mouse wording.
 */
export function isTouch(_scene?: Phaser.Scene): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
}

export function continueHint(scene: Phaser.Scene): string {
  return isTouch(scene) ? "Touche l'écran pour continuer" : 'Clic ou Espace pour continuer';
}

/** Minimum on-screen size of a touch target in CSS pixels (Apple/Google guidelines). */
export const MIN_TOUCH_CSS_PX = 44;

/**
 * Phones and tablets load half-size illustrations: the game canvas is 1280×720 anyway and is shown
 * smaller on these screens, so bigger textures would only cost memory and bandwidth.
 * Decided on CSS pixels and pointer type, not on device pixel ratio. `?art=small|full` forces it (tests).
 */
export function useSmallArt(): boolean {
  const forced = new URLSearchParams(window.location.search).get('art');
  if (forced === 'small') return true;
  if (forced === 'full') return false;
  return isTouch() || Math.max(window.innerWidth, window.innerHeight) < 1100;
}
