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

for(const [demo,opponent,button,duel] of [
  ['pince','Sac-Zombie','Affronter le Sac-Zombie','Sac'],
  ['meduse','Méduse','Affronter la Méduse de pétrole','Meduse'],
  ['golem','Golem','Affronter le Golem de pneus','Golem'],
] as const) test(`${opponent} allows moving and striking together on touch`,async({page})=>{
  await page.setViewportSize({width:844,height:390});
  await page.goto(`/?defi=${demo}`);
  const point=async(x:number,y:number)=>{
    const b=(await page.locator('canvas').boundingBox())!;
    return {x:b.x+x*b.width/1280,y:b.y+y*b.height/720};
  };
  for(const [name,x,y] of [['Title',640,420],['Intro',1140,662],['IntroText',470,640],['Board',417,672]] as const){
    await expect.poll(()=>scene(page)).toBe(name);
    const p=await point(x,y);await page.touchscreen.tap(p.x,p.y);
  }
  const guide=page.getByRole('list',{name:'Commandes tactiles'});
  await expect(guide.getByRole('listitem')).toHaveCount(6);
  await expect(guide).toContainText('Joystick ↑');
  await expect(guide).toContainText('Ligne de statut');
  expect(await scene(page)).toBe('Board');
  await page.getByRole('button',{name:button}).tap();
  await expect.poll(()=>scene(page)).toBe(duel);
  const touch=await page.context().newCDPSession(page);
  const right={...await point(198,618),id:0},strike={...await point(1025,639),id:1};
  await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[right]});
  await page.waitForFunction(()=>{const d=window.__ziko!.debug().duel;return d&&Math.abs(d.heroX-d.enemyX)<115;});
  await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[right,strike]});
  await page.waitForFunction(()=>{const d=window.__ziko!.debug().duel;return d && d.attack===1 && d.enemyHp===56;});
  await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
});

test('Tri Express accepts a finger drag onto a bin', async ({ page }) => {
  await page.setViewportSize({width:844,height:390});
  await page.goto('/?defi=tri');
  const point = async (x:number,y:number) => {
    const b = (await page.locator('canvas').boundingBox())!;
    return {x:b.x+x*b.width/1280,y:b.y+y*b.height/720};
  };
  for (const [name,x,y] of [['Title',640,420],['Intro',1140,662],['IntroText',470,640],['Board',417,672]] as const) {
    await expect.poll(() => scene(page)).toBe(name);
    const p = await point(x,y); await page.touchscreen.tap(p.x,p.y);
  }
  await page.getByRole('button',{name:'Jouer à Tri Express'}).tap();
  await expect.poll(() => scene(page)).toBe('Tri');
  const touch = await page.context().newCDPSession(page);
  await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[await point(224,265)]});
  await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[await point(396,575)]});
  await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await expect.poll(() => page.evaluate(() => window.__ziko!.debug().triSorted)).toBe(1);
});

test('Astro steers and banks during one continuous touch drag', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/?defi=astro');
  await expect.poll(() => scene(page)).toBe('Title');
  const canvas = page.locator('canvas');
  const point = async (x: number, y: number) => {
    const b = (await canvas.boundingBox())!;
    return { x: b.x + x * b.width / 1280, y: b.y + y * b.height / 720 };
  };
  const tap = async (x:number,y:number) => { const p = await point(x,y); await page.touchscreen.tap(p.x,p.y); };
  await tap(640,420);
  await expect.poll(() => scene(page)).toBe('Intro');
  await tap(1140,662);
  await expect.poll(() => scene(page)).toBe('IntroText');
  await tap(470,640);
  await expect.poll(() => scene(page)).toBe('Board');
  await tap(417,672);
  const rules = page.getByRole('list',{name:'Points par cible'});
  await expect(rules.getByRole('listitem')).toHaveText(['Sac+10 pts en un tir','Bouteille+15 pts au deuxième tir','Mouette−10 pts si touchée']);
  await expect.poll(() => rules.locator('img').evaluateAll(imgs => imgs.filter(img => (img as HTMLImageElement).naturalWidth > 0).length)).toBe(3);
  await page.getByText('Étoiles et pièces · objectif : 120 pts').tap();
  await expect(page.getByText('3 étoiles dès 120 pts : 20 pièces écolo')).toBeVisible();
  await page.getByRole('button',{name:'Jouer à Astro-Ziko'}).tap();
  await expect.poll(() => scene(page)).toBe('Astro');
  const touch = await page.context().newCDPSession(page);
  await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[await point(640,600)]});
  await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[await point(1000,580)]});
  await expect.poll(() => page.evaluate(() => window.__ziko!.debug().shipX)).toBeGreaterThan(740);
  const boost = {...await point(1205,490), id:1};
  await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...await point(1000,580),id:0},boost]});
  await expect.poll(() => page.evaluate(() => window.__ziko!.debug().turboActive)).toBe(true);
  await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...await point(90,600),id:0},boost]});
  await expect.poll(() => page.evaluate(() => window.__ziko!.debug().bankFrame)).toBeLessThan(8);
  await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
});
