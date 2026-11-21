import { expect, test, type Page } from '@playwright/test';

const WIDTH = 1280;
const HEIGHT = 720;

type UiSnapshot = { mode: string; overlay: string | null; paused: boolean; cinematic: string | null; locked: boolean };

async function ui(page: Page): Promise<UiSnapshot> {
  return page.evaluate(() => window.__ziko!.ui() as unknown as UiSnapshot);
}
async function scene(page: Page): Promise<string> {
  return page.evaluate(() => window.__ziko!.debug().scene);
}

/** Clicks at game coordinates (the canvas is scaled to fit the window). */
async function clickGame(page: Page, x: number, y: number): Promise<void> {
  const box = await page.locator('canvas').boundingBox();
  if (!box) throw new Error('canvas not found');
  await page.mouse.click(box.x + (x / WIDTH) * box.width, box.y + (y / HEIGHT) * box.height);
}

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  return errors;
}

async function open(page: Page, query = ''): Promise<void> {
  await page.goto(`/${query}`);
  await page.waitForFunction(() => window.__ziko !== undefined && window.__ziko.debug().scene === 'Title');
}

test('plays the whole opening: title → 15 panels → intro text → board', async ({ page }) => {
  const errors = watchErrors(page);
  await open(page);
  expect((await ui(page)).mode).toBe('title');

  await page.keyboard.press('Enter');
  await expect.poll(() => scene(page)).toBe('Intro');
  expect(await ui(page)).toMatchObject({ mode: 'cinematic', cinematic: 'intro' });

  const seen = new Set<number>();
  for (let i = 0; i < 60 && (await scene(page)) === 'Intro'; i++) {
    seen.add(await page.evaluate(() => window.__ziko!.debug().introIndex));
    await page.keyboard.press('Space');
    await page.waitForTimeout(260);
  }
  expect(seen.size).toBe(15);
  await expect.poll(() => scene(page)).toBe('IntroText');
  expect((await ui(page)).mode).toBe('introText');

  await page.keyboard.press('Enter');
  await expect.poll(() => scene(page)).toBe('Board');
  expect((await ui(page)).mode).toBe('board');
  expect(errors).toEqual([]);
});

test('pressing a button waits for release and dragging away cancels', async ({ page }) => {
  await open(page);
  const box = (await page.locator('canvas').boundingBox())!;
  const x = box.x + box.width / 2, y = box.y + box.height * 420 / HEIGHT;
  await page.mouse.move(x, y);
  await page.mouse.down();
  expect((await ui(page)).mode).toBe('title');
  await page.mouse.move(x, box.y + 10);
  await page.mouse.up();
  expect((await ui(page)).mode).toBe('title');
  await page.mouse.click(x, y);
  await expect.poll(() => scene(page)).toBe('Intro');
});

test('Escape skips the comic', async ({ page }) => {
  const errors = watchErrors(page);
  await open(page);
  await page.keyboard.press('Enter');
  await expect.poll(() => scene(page)).toBe('Intro');
  await page.keyboard.press('Escape');
  await expect.poll(() => scene(page)).toBe('IntroText');
  expect((await ui(page)).mode).toBe('introText');
  expect(errors).toEqual([]);
});

test('rolls from the button below the track and unlocks after moving', async ({ page }) => {
  await open(page);
  await page.keyboard.press('Enter');
  await expect.poll(() => scene(page)).toBe('Intro');
  await page.keyboard.press('Escape');
  await expect.poll(() => scene(page)).toBe('IntroText');
  await page.keyboard.press('Enter');
  await expect.poll(() => scene(page)).toBe('Board');
  for (let i = 0; i < 2; i++) {
    await clickGame(page, 417, 655);
    expect((await ui(page)).mode).toBe('moving');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    expect((await ui(page)).mode).toBe('tile');
    await expect(dialog.getByRole('heading')).toBeVisible();
    await dialog.getByRole('button').click();
    await expect(dialog).toHaveCount(0);
    await expect.poll(async () => (await ui(page)).mode).toBe('board');
  }
});

test('the "Passer" button skips the comic and buttons work with the mouse', async ({ page }) => {
  await open(page);
  await clickGame(page, WIDTH / 2, 420); // "Jouer"
  await expect.poll(() => scene(page)).toBe('Intro');
  await page.waitForTimeout(400);
  await clickGame(page, WIDTH - 120, HEIGHT - 50); // "Passer"
  await expect.poll(() => scene(page)).toBe('IntroText');
  await clickGame(page, 470, 640); // "COMMENCER"
  await expect.poll(() => scene(page)).toBe('Board');
});

test('attract mode plays the comic by itself and any key returns to the title', async ({ page }) => {
  await open(page, '?attractMs=800');
  await expect.poll(() => page.evaluate(() => window.__ziko!.debug().attract), { timeout: 5000 }).toBe(true);
  expect((await ui(page)).mode).toBe('title');
  // Panel 1 types for ~2.5 s then stays 2.5 s before moving on by itself.
  await expect.poll(() => page.evaluate(() => window.__ziko!.debug().introIndex), { timeout: 10_000 }).toBeGreaterThanOrEqual(1);
  await page.keyboard.press('Space');
  await expect.poll(() => scene(page)).toBe('Title');
});

test('stays smooth during the comic (FPS)', async ({ page }) => {
  await open(page);
  await page.keyboard.press('Enter');
  await expect.poll(() => scene(page)).toBe('Intro');
  // Measure real frames with requestAnimationFrame over 2 seconds.
  const fps = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let frames = 0;
        const start = performance.now();
        const tick = () => {
          frames++;
          if (performance.now() - start < 2000) requestAnimationFrame(tick);
          else resolve((frames * 1000) / (performance.now() - start));
        };
        requestAnimationFrame(tick);
      }),
  );
  expect(fps).toBeGreaterThanOrEqual(30);
});

test('monkey test: random inputs never break the UI state (no soft lock, one window at a time)', async ({ page }) => {
  const errors = watchErrors(page);
  await open(page);
  const keys = ['Space', 'Enter', 'Escape'];
  let seed = 12345;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2 ** 31;
    return seed / 2 ** 31;
  };
  for (let i = 0; i < 120; i++) {
    if (rand() < 0.5) await page.keyboard.press(keys[Math.floor(rand() * keys.length)]!);
    else await clickGame(page, Math.floor(rand() * WIDTH), Math.floor(rand() * HEIGHT));
    await page.waitForTimeout(40);
    const s = await ui(page);
    if (s.overlay !== null) expect(s.mode).toBe('board');
    if (s.paused) expect(s.mode).toBe('activity');
    expect(s.cinematic !== null).toBe(s.mode === 'cinematic');
    const commands = await page.evaluate(() => window.__ziko!.commands());
    if (!s.locked) expect(commands.length).toBeGreaterThan(0);
  }
  // Whatever happened, the player can always reach the board.
  for (let i = 0; i < 40 && (await scene(page)) !== 'Board'; i++) {
    await page.keyboard.press(i % 2 === 0 ? 'Enter' : 'Escape');
    await page.waitForTimeout(150);
  }
  expect(await scene(page)).toBe('Board');
  expect(errors).toEqual([]);
});
