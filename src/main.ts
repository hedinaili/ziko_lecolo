import '@fontsource/baloo-2/400.css';
import '@fontsource/baloo-2/700.css';
import * as Phaser from 'phaser';
import { exposeDebugHooks } from './app';
import { BoardScene } from './scenes/BoardScene';
import { AstroScene } from './scenes/AstroScene';
import { TriScene } from './scenes/TriScene';
import { OceanScene } from './scenes/OceanScene';
import { ForestScene } from './scenes/ForestScene';
import { SmogScene } from './scenes/SmogScene';
import { VeloScene } from './scenes/VeloScene';
import { SacScene } from './scenes/SacScene';
import { IntroScene } from './scenes/IntroScene';
import { IntroTextScene } from './scenes/IntroTextScene';
import { PreloadScene } from './scenes/PreloadScene';
import { TitleScene } from './scenes/TitleScene';
import { isTouch } from './ui/device';
import { HEIGHT, WIDTH } from './ui/theme';

/** Phones: go fullscreen in landscape on the first touch (browsers require a user gesture). */
function enableMobileFullscreen(game: Phaser.Game): void {
  if (!isTouch()) return;
  const onFirstTouch = () => {
    window.removeEventListener('pointerup', onFirstTouch);
    if (!game.scale.isFullscreen && game.device.fullscreen.available) game.scale.startFullscreen();
    const orientation = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
    orientation.lock?.('landscape').catch(() => undefined);
  };
  window.addEventListener('pointerup', onFirstTouch);
}

async function start(): Promise<void> {
  // Phaser renders text on canvas: the web font must be loaded before the first frame.
  await Promise.allSettled([document.fonts.load('32px "Baloo 2"'), document.fonts.load('bold 32px "Baloo 2"')]);
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: '#1c1a24',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    fps: { target: 60 },
    input: { activePointers: 2 },
    scene: [PreloadScene, TitleScene, IntroScene, IntroTextScene, BoardScene, AstroScene, TriScene, OceanScene, ForestScene, SmogScene, VeloScene, SacScene],
  });
  enableMobileFullscreen(game);
  exposeDebugHooks(() => game.loop.actualFps);
}

void start();
