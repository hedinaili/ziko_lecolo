import type * as Phaser from 'phaser';
import type { Era, Medal } from '../core/types';
import { astroTone } from './astro-sound';

export interface MinigameOptions {
  era: Era;
  seed: number;
  reward: (ratio: number) => { coins: number; medal: Medal };
  leave: () => void;
}
export const medals: Record<Medal,string> = { none:'Participation', bronze:'Bronze', silver:'Argent', gold:'Or' };
export function resultStars(medal: Medal, sound: Phaser.Sound.BaseSoundManager): HTMLElement {
  const count = { none:0, bronze:1, silver:2, gold:3 }[medal];
  const row = document.createElement('div');
  row.className = 'astro-stars';
  row.setAttribute('role', 'img');
  row.setAttribute('aria-label', `${count} étoile${count > 1 ? 's' : ''} sur 3`);
  for (let i = 0; i < 3; i++) {
    const star = document.createElement('span');
    star.textContent = '☆';
    star.setAttribute('aria-hidden', 'true');
    if (i < count) {
      star.className = 'earned';
      star.addEventListener('animationstart', () => {
        if (row.closest('dialog')?.open) astroTone(sound, (['star1','star2','star3'] as const)[i]!);
      }, {once:true});
    }
    row.append(star);
  }
  if (count === 3) {
    const burst = document.createElement('i');
    burst.className = 'astro-fireworks';
    burst.setAttribute('aria-hidden', 'true');
    row.append(burst);
  }
  return row;
}
