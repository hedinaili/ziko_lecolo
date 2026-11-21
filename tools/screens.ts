import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
/** Visual check of the intro: npm run screens (images in screenshots/, or in SHOT_DIR). */
const dir = process.env.SHOT_DIR ?? 'screenshots';
mkdirSync(dir, { recursive: true });
const server = spawn('npx', ['vite', 'preview', '--port', '4174', '--strictPort'], { shell: true });
await new Promise((r) => setTimeout(r, 2500));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto('http://localhost:4174/');
await page.waitForTimeout(3000);
await page.waitForFunction(() => (window as any).__ziko?.debug().scene === 'Title');
await page.waitForTimeout(500);
await page.screenshot({ path: `${dir}/01-title.png` });
await page.keyboard.press('Enter');
await page.waitForFunction(() => (window as any).__ziko.debug().scene === 'Intro');
const want = new Set(Array.from({ length: 15 }, (_, i) => i));
let last = -1;
for (let i = 0; i < 80; i++) {
  const d = await page.evaluate(() => (window as any).__ziko.debug());
  if (d.scene !== 'Intro') break;
  if (d.introIndex !== last) {
    last = d.introIndex;
    await page.waitForTimeout(150);
    await page.keyboard.press('Space');
    await page.waitForTimeout(450);
    if (want.has(last)) await page.screenshot({ path: `${dir}/panel-${String(last + 1).padStart(2, '0')}.png` });
  }
  await page.keyboard.press('Space');
  await page.waitForTimeout(350);
}
await page.waitForTimeout(400);
await page.screenshot({ path: `${dir}/99-introtext.png` });
await browser.close();
server.kill();
process.exit(0);
