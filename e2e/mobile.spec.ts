import { devices, expect, test } from '@playwright/test';

/** Phones and small screens (docs/06 "Téléphones et petits écrans"). */
test.use({ ...devices['iPhone 13'], defaultBrowserType: 'chromium' });

async function scene(page: import('@playwright/test').Page): Promise<string> {
  return page.evaluate(() => window.__ziko?.debug().scene ?? 'Boot');
}

test('landscape phone: loads small art, plays the intro with taps', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const requested: string[] = [];
  page.on('request', (r) => {
    if (r.url().includes('/art/')) requested.push(r.url());
  });
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/');
  await expect.poll(() => scene(page), { timeout: 20_000 }).toBe('Title');

  // Phones download the half-size illustrations only.
  expect(requested.length).toBeGreaterThan(0);
  expect(requested.every((u) => u.includes('@small'))).toBe(true);
  await expect(page.locator('#rotate')).toBeHidden();

  const box = (await page.locator('canvas').boundingBox())!;
  // The whole 16:9 game fits in the screen.
  expect(box.width).toBeLessThanOrEqual(844);
  expect(box.height).toBeLessThanOrEqual(390);
  // "Jouer" button (game coords 640, 420) is at least 44 CSS px tall: 100 game px × scale.
  expect((100 * box.height) / 720).toBeGreaterThanOrEqual(44);

  await page.touchscreen.tap(box.x + box.width / 2, box.y + (420 / 720) * box.height);
  await expect.poll(() => scene(page)).toBe('Intro');
  for (let i = 0; i < 6; i++) {
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(250);
  }
  expect(await page.evaluate(() => window.__ziko!.debug().introIndex)).toBeGreaterThanOrEqual(2);
  expect(errors).toEqual([]);
});

test('portrait phone: asks to rotate the device', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('#rotate')).toBeVisible();
  await expect(page.locator('#rotate')).toContainText('Tourne ton téléphone');
});
