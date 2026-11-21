/** Palette and UI tokens from docs/17 (direction artistique). */
export const COLORS = {
  sky: 0x7ec8f2,
  lavender: 0xb9a7e8,
  cherry: 0xf4a6c8,
  leaf: 0x6bbf59,
  sun: 0xffd45c,
  ocean: 0x2e8fd0,
  smoke: 0x6e6e78,
  anthracite: 0x2b2b33,
  mud: 0x7a5c3e,
  oil: 0x141018,
  ochre: 0xc9a25a,
  glowYellow: 0xffe14d,
  red: 0xe5483b,
  gold: 0xf2b93b,
  cream: 0xfff6e3,
  brown: 0x4a3426,
  white: 0xffffff,
  skin: 0xf2c79b,
  hair: 0x5a3a22,
  shirt: 0x6bbf59,
  pants: 0x35507a,
  mop: 0xd9d4c7,
  stick: 0x9b6b3d,
  cape: 0xd8433a,
} as const;

export const TEXT_COLOR = '#3b2a20';
export const FONT = '"Baloo 2", "Trebuchet MS", "Arial Rounded MT Bold", sans-serif';

export const WIDTH = 1280;
export const HEIGHT = 720;

export function css(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}
