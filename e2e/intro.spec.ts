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
    if (await dialog.getByRole('button', {name: 'Jouer à Astro-Ziko'}).count()) await page.keyboard.press('Escape');
    else await dialog.getByRole('button').click();
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

test('Astro-Ziko pays the displayed reward once and returns to a playable board', async ({ page }) => {
  test.setTimeout(100_000);
  await page.addInitScript(() => {
    const start = OscillatorNode.prototype.start;
    const startBuffer = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (...args) {
      if (this.buffer?.duration === 1.5) document.documentElement.dataset.turbines = String(Number(document.documentElement.dataset.turbines ?? 0) + 1);
      startBuffer.apply(this,args);
    };
    OscillatorNode.prototype.start = function (when?: number) {
      document.documentElement.dataset.tones = String(Number(document.documentElement.dataset.tones ?? 0) + 1);
      start.call(this, when);
    };
  });
  await open(page, '?defi=astro');
  await page.keyboard.press('Enter');
  await expect.poll(() => scene(page)).toBe('Intro');
  await page.keyboard.press('Escape');
  await expect.poll(() => scene(page)).toBe('IntroText');
  await page.keyboard.press('Enter');
  await expect.poll(() => scene(page)).toBe('Board');
  const coins = () => page.evaluate(() => window.__ziko!.debug().boardCoins!);
  const before = await coins();
  const sound = page.getByRole('button', {name:'Son du jeu'});
  await expect(sound.locator('.waves')).toBeVisible();
  await sound.click();
  await expect(sound.locator('.slash')).toBeVisible();
  await expect(sound.locator('.waves')).toBeHidden();
  await sound.click();
  await expect(sound).toHaveAttribute('aria-pressed','true');
  await clickGame(page, 417, 672);
  await page.getByRole('button', {name:'Jouer à Astro-Ziko'}).click();
  await expect.poll(() => scene(page)).toBe('Astro');
  await expect(sound).toBeHidden();
  await page.keyboard.press('Space');
  await expect.poll(() => page.evaluate(() => window.__ziko!.debug().turboActive)).toBe(true);
  const tones = () => page.evaluate(() => Number(document.documentElement.dataset.tones ?? 0));
  await expect.poll(tones).toBeGreaterThan(0);
  await page.keyboard.down('ArrowRight');
  await expect.poll(() => page.evaluate(() => window.__ziko!.debug().bankFrame), {intervals:[30]}).toBe(16);
  await page.keyboard.up('ArrowRight');
  await page.keyboard.down('q');
  await expect.poll(() => page.evaluate(() => window.__ziko!.debug().bankFrame), {intervals:[30]}).toBe(0);
  await page.keyboard.up('q');
  await expect.poll(() => page.evaluate(() => window.__ziko!.debug().bankFrame)).toBe(8);
  await expect.poll(() => page.evaluate(() => window.__ziko!.debug().turboActive)).toBe(false);
  await page.keyboard.press('Space');
  await expect(page.locator('html')).toHaveAttribute('data-turbines','1');
  await page.waitForTimeout(5100);
  await clickGame(page, 640, 580);
  await expect(page.locator('html')).toHaveAttribute('data-turbines','2');
  await expect.poll(() => page.evaluate(() => window.__ziko!.debug().turboActive)).toBe(true);
  const result = page.getByRole('dialog', {name:'Astro-Ziko · Résultat'});
  await expect(result).toBeVisible({timeout:75_000});
  await expect(result.getByRole('button')).toHaveCount(1);
  const table = result.getByRole('table', {name:'Bilan par cible'});
  let sum = 0;
  for (const label of ['Bouteilles','Sacs','Mouettes']) {
    const row = table.getByRole('row').filter({has: page.getByRole('rowheader', {name:label})});
    const icon = row.locator('img');
    await expect(icon).toBeVisible();
    await expect.poll(() => icon.evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await expect(row.getByRole('cell').first()).toHaveText(/^\d+$/);
    const points = await row.getByRole('cell').last().innerText();
    expect(points).toMatch(label === 'Mouettes' ? /^(0|−\d+)$/ : /^(0|\+\d+)$/);
    sum += Number(points.replace('−','-'));
  }
  await expect(result.locator('p')).toHaveText(new RegExp(`^${sum} points`));
  const received = Number((await result.innerText()).match(/\+(\d+) pièces/)?.[1]);
  expect([2,6,12,20]).toContain(received);
  const earned = [2,6,12,20].indexOf(received);
  const rating = result.getByRole('img', {name:`${earned} étoile${earned > 1 ? 's' : ''} sur 3`});
  await expect(rating.locator('span')).toHaveCount(3);
  await expect(rating.locator('.earned')).toHaveCount(earned);
  await expect(rating.locator('.astro-fireworks')).toHaveCount(earned === 3 ? 1 : 0);
  const centers = await rating.locator('span').evaluateAll(stars => stars.map(star => {
    const box = star.getBoundingClientRect();
    return box.y + box.height / 2;
  }));
  expect(centers[1]!).toBeLessThan(Math.min(centers[0]!, centers[2]!) - 4);
  await result.getByRole('button', {name:'Retour au plateau'}).click();
  await expect.poll(coins).toBe(before + received);
  await expect(sound).toBeVisible();
  await expect.poll(() => scene(page)).toBe('Board');
  await clickGame(page, 417, 672);
  expect((await ui(page)).mode).toBe('moving');
  expect(await coins()).toBe(before + received);
});

test('Tri Express sorts, pays once and returns to the board', async ({page}) => {
  test.setTimeout(90000);
  await open(page,'?defi=tri');
  await page.keyboard.press('Enter');
  await expect.poll(() => scene(page)).toBe('Intro');
  await page.keyboard.press('Escape');
  await expect.poll(() => scene(page)).toBe('IntroText');
  await page.keyboard.press('Enter');
  await expect.poll(() => scene(page)).toBe('Board');
  const coins = () => page.evaluate(() => window.__ziko!.debug().boardCoins!);
  const before = await coins();
  await clickGame(page,417,672);
  await page.getByRole('button',{name:'Jouer à Tri Express'}).click();
  await expect.poll(() => scene(page)).toBe('Tri');
  await page.keyboard.press('1');
  await page.keyboard.press('5');
  await clickGame(page,396,574);
  await expect.poll(() => page.evaluate(() => window.__ziko!.debug().triSorted)).toBe(3);
  const result = page.getByRole('dialog',{name:'Tri Express · Résultat'});
  await expect(result).toBeVisible({timeout:65000});
  const report=result.getByRole('table',{name:'Bilan par poubelle'});
  await expect(report.getByRole('rowheader')).toHaveText(['Emballages','Verre','Compost','Reste','Piles']);
  await expect(report.getByRole('row',{name:/Piles/}).getByRole('cell').first()).toHaveText('1');
  const award = Number((await result.innerText()).match(/\+(\d+) pièces/)?.[1]);
  expect([2,6,12,20]).toContain(award);
  await result.getByRole('button',{name:'Retour au plateau'}).click();
  await expect.poll(coins).toBe(before+award);
  await clickGame(page,417,672);
  expect((await ui(page)).mode).toBe('moving');
});

test('Filet Océan accepts charged casts and returns the displayed reward',async({page})=>{
  test.setTimeout(90000);
  await open(page,'?defi=filet');
  await page.keyboard.press('Enter'); await expect.poll(()=>scene(page)).toBe('Intro');
  await page.keyboard.press('Escape'); await expect.poll(()=>scene(page)).toBe('IntroText');
  await page.keyboard.press('Enter'); await expect.poll(()=>scene(page)).toBe('Board');
  const coins=()=>page.evaluate(()=>window.__ziko!.debug().boardCoins!);
  const before=await coins();
  await clickGame(page,417,672);
  await page.getByRole('button',{name:'Jouer à Filet Océan'}).click();
  await expect.poll(()=>scene(page)).toBe('Ocean');
  await page.keyboard.down('Space'); await page.waitForTimeout(500); await page.keyboard.up('Space');
  await page.waitForTimeout(1200); await clickGame(page,630,310);
  const result=page.getByRole('dialog',{name:'Filet Océan · Résultat'});
  await expect(result).toBeVisible({timeout:65000}); await expect(result).toContainText('Lancers : 2');
  const reward=Number((await result.innerText()).match(/\+(\d+) pièces/)?.[1]);
  expect([2,6,12,20]).toContain(reward);
  await result.getByRole('button',{name:'Retour au plateau'}).click();
  await expect.poll(coins).toBe(before+reward);
  await clickGame(page,417,672); expect((await ui(page)).mode).toBe('moving');
});

test('Forêt Éclair grows a planted tree and pays the displayed reward',async({page})=>{
  test.setTimeout(90000);
  await open(page,'?defi=foret');
  await page.keyboard.press('Enter'); await expect.poll(()=>scene(page)).toBe('Intro');
  await page.keyboard.press('Escape'); await expect.poll(()=>scene(page)).toBe('IntroText');
  await page.keyboard.press('Enter'); await expect.poll(()=>scene(page)).toBe('Board');
  const coins=()=>page.evaluate(()=>window.__ziko!.debug().boardCoins!);
  const before=await coins();
  await clickGame(page,417,672);
  await page.getByRole('button',{name:'Jouer à Forêt Éclair'}).click();
  await expect.poll(()=>scene(page)).toBe('Forest');
  await clickGame(page,288,340); await page.waitForTimeout(650); await page.keyboard.press('Space');
  const result=page.getByRole('dialog',{name:'Forêt Éclair · Résultat'});
  await expect(result).toBeVisible({timeout:65000}); await expect(result).toContainText('Arbres sauvés : 1');
  await expect(result).toContainText('20 points · Participation · +2 pièces écolo');
  await result.getByRole('button',{name:'Retour au plateau'}).click();
  await expect.poll(coins).toBe(before+2);
  await clickGame(page,417,672); expect((await ui(page)).mode).toBe('moving');
});

test('Smog Buster vacuums a cloud and pays the displayed reward once',async({page})=>{
  test.setTimeout(90000);
  await open(page,'?defi=smog');
  await page.keyboard.press('Enter'); await expect.poll(()=>scene(page)).toBe('Intro');
  await page.keyboard.press('Escape'); await expect.poll(()=>scene(page)).toBe('IntroText');
  await page.keyboard.press('Enter'); await expect.poll(()=>scene(page)).toBe('Board');
  const coins=()=>page.evaluate(()=>window.__ziko!.debug().boardCoins!);
  const before=await coins();
  await clickGame(page,417,672);
  await page.getByRole('button',{name:'Jouer à Smog Buster'}).click();
  await expect.poll(()=>scene(page)).toBe('Smog');
  await page.keyboard.down('Space');await page.waitForTimeout(650);await page.keyboard.up('Space');
  const result=page.getByRole('dialog',{name:'Smog Buster · Résultat'});
  await expect(result).toBeVisible({timeout:65000});await expect(result).toContainText(/Nuages aspirés : [1-9]/);
  const reward=Number((await result.innerText()).match(/\+(\d+) pièces/)?.[1]);
  expect([2,6,12,20]).toContain(reward);
  await result.getByRole('button',{name:'Retour au plateau'}).click();
  await expect.poll(coins).toBe(before+reward);
  await clickGame(page,417,672);expect((await ui(page)).mode).toBe('moving');
});

test('Vélo Turbo counts jumps and awards its prize on returning to the board',async({page})=>{
  test.setTimeout(90000);
  await open(page,'?defi=velo');
  await page.keyboard.press('Enter'); await expect.poll(()=>scene(page)).toBe('Intro');
  await page.keyboard.press('Escape'); await expect.poll(()=>scene(page)).toBe('IntroText');
  await page.keyboard.press('Enter'); await expect.poll(()=>scene(page)).toBe('Board');
  const coins=()=>page.evaluate(()=>window.__ziko!.debug().boardCoins!);
  const before=await coins();
  await clickGame(page,417,672);
  await page.getByRole('button',{name:'Jouer à Vélo Turbo'}).click();
  await expect.poll(()=>scene(page)).toBe('Velo');
  await page.keyboard.down('Space');await page.waitForTimeout(180);await page.keyboard.up('Space');
  const result=page.getByRole('dialog',{name:'Vélo Turbo · Résultat'});
  await expect(result).toBeVisible({timeout:65000});await expect(result).toContainText('Sauts : 1');
  const reward=Number((await result.innerText()).match(/\+(\d+) pièces/)?.[1]);
  expect([2,6,12,20]).toContain(reward);
  await result.getByRole('button',{name:'Retour au plateau'}).click();
  await expect.poll(coins).toBe(before+reward);
  await clickGame(page,417,672);expect((await ui(page)).mode).toBe('moving');
});

for(const [demo,opponent,button,duel,tool] of [
  ['pince','Sac-Zombie','Affronter le Sac-Zombie','Sac','pince'],
  ['meduse','Méduse de pétrole','Affronter la Méduse de pétrole','Meduse','eponge'],
  ['golem','Golem de pneus','Affronter le Golem de pneus','Golem','cle'],
] as const) test(`${demo} demo lends and equips the weakness against ${opponent}`,async({page})=>{
  test.setTimeout(100_000);
  page.on('pageerror',error=>console.error(error.message));
  await open(page,`?defi=${demo}`);
  await page.keyboard.press('Enter'); await expect.poll(()=>scene(page)).toBe('Intro');
  await page.keyboard.press('Escape'); await expect.poll(()=>scene(page)).toBe('IntroText');
  await page.keyboard.press('Enter'); await expect.poll(()=>scene(page)).toBe('Board');
  const coins=()=>page.evaluate(()=>window.__ziko!.debug().boardCoins!);
  const before=await coins();
  await clickGame(page,417,672);
  await page.getByRole('button',{name:button}).click();
  await expect.poll(()=>scene(page)).toBe(duel);
  await expect.poll(()=>page.evaluate(()=>window.__ziko!.debug().combatTool)).toBe(tool);
  await expect.poll(()=>page.evaluate(()=>window.__ziko!.debug().duel?.enemyHp)).toBe(63);
  await page.keyboard.press('Alt');
  await expect.poll(()=>page.evaluate(()=>window.__ziko!.debug().duel?.vanish),{intervals:[15]}).toBe(true);
  await page.waitForFunction(()=>window.__ziko!.debug().duel?.vanish===false);
  await page.keyboard.press('ArrowUp');
  await page.waitForFunction(()=>(window.__ziko!.debug().duel?.height??0)>20);
  // Parry an actual crossing before going on the offensive.
  await page.waitForFunction(()=>window.__ziko!.debug().duel?.parryNow);
  const hpAtCrossing=await page.evaluate(()=>window.__ziko!.debug().duel!.hp);
  await page.keyboard.press('Alt');
  if(demo==='golem')await page.keyboard.down('ArrowDown');
  await page.waitForFunction(()=>window.__ziko!.debug().duel?.vortex===-1);
  if(demo==='golem')await page.keyboard.up('ArrowDown');
  expect(await page.evaluate(()=>window.__ziko!.debug().duel!.hp)).toBe(hpAtCrossing);
  await page.keyboard.down('ArrowRight');
  await page.waitForFunction(()=>{const d=window.__ziko!.debug().duel;return d && Math.abs(d.heroX-d.enemyX)<105 && d.height===0;});
  for(let i=0;i<3;i++)await page.keyboard.press('Space');
  await page.keyboard.up('ArrowRight');
  // The sack's counter can interrupt the chain. Close the distance again after knockback.
  let sawFinisher=false;
  for(let i=0;i<280;i++){
    const d=await page.evaluate(()=>window.__ziko!.debug().duel);
    if(d?.attack===3)sawFinisher=true;
    if(!d || !d.enemyHp)break;
    if(d.vortex>=0 || d.guard){
      if(d.parryNow)await page.keyboard.press('Alt');
      await page.waitForTimeout(45);
      continue;
    }
    const approach=d.heroX<d.enemyX?'ArrowRight':'ArrowLeft';
    await page.keyboard.down(approach);
    await page.keyboard.press('Space');
    await page.waitForTimeout(150);
    await page.keyboard.up(approach);
  }
  const result=page.getByRole('dialog',{name:demo==='meduse'?'Victoire contre la Méduse de pétrole':demo==='golem'?'Victoire contre le Golem de pneus':'Victoire !'});
  const ko=page.getByRole('status').filter({hasText:'KO!'});
  await expect(ko).toBeVisible();
  await expect(result).toBeHidden();
  await expect(page.getByRole('dialog',{name:opponent})).toContainText('10 ans',{timeout:15000});
  await page.getByRole('button',{name:'Suite'}).click();
  await expect(page.getByRole('dialog',{name:'Ziko'})).toBeVisible();
  await page.getByRole('button',{name:'Suite'}).click();
  await page.getByRole('button',{name:'Voir le bilan'}).click();
  await expect(result).toContainText('+8 pièces écolo');
  await expect(ko).toHaveCount(0);
  expect(sawFinisher).toBe(true);
  await result.getByRole('button',{name:'Retour au plateau'}).click();
  await expect.poll(coins).toBe(before+8);
});

test('Sac-Zombie loss leaves Ziko promising a rematch without a gift',async({page})=>{
  test.setTimeout(90000);
  await open(page,'?defi=pince');
  await page.keyboard.press('Enter'); await expect.poll(()=>scene(page)).toBe('Intro');
  await page.keyboard.press('Escape'); await expect.poll(()=>scene(page)).toBe('IntroText');
  await page.keyboard.press('Enter'); await expect.poll(()=>scene(page)).toBe('Board');
  await clickGame(page,417,672);
  const guide=page.getByRole('list',{name:'Commandes clavier'});
  await expect(guide.locator('kbd')).toHaveText(['← →','↑','↓','Espace','Alt','E']);
  await page.getByRole('button',{name:'Affronter le Sac-Zombie'}).click();
  const first=page.getByRole('dialog',{name:'Sac-Zombie',exact:true});
  await expect(first).toContainText('poussière',{timeout:70000});
  const portrait=first.getByRole('img',{name:'Sac-Zombie'});
  await expect(portrait).toBeVisible();
  const enemyBox=(await portrait.boundingBox())!, enemyName=(await first.getByRole('heading').boundingBox())!;
  expect(enemyBox.x).toBeGreaterThanOrEqual(enemyName.x+enemyName.width);
  expect(Math.abs(enemyBox.y-enemyName.y)).toBeLessThan(3);
  const face=await portrait.evaluate(el=>el instanceof HTMLCanvasElement && el.toDataURL());
  expect(face).toBeTruthy();
  await first.getByRole('button',{name:'Suite'}).click();
  const reply=page.getByRole('dialog',{name:'Ziko'});
  await expect(reply).toContainText('je prendrai ma revanche');
  const ziko=reply.getByRole('img',{name:'Ziko, 10 ans'});
  await expect(ziko).toBeVisible();
  const heroBox=(await ziko.boundingBox())!, heroName=(await reply.getByRole('heading').boundingBox())!;
  expect(heroBox.x+heroBox.width).toBeLessThanOrEqual(heroName.x);
  expect(Math.abs(heroBox.y-heroName.y)).toBeLessThan(3);
  expect(await ziko.evaluate(el=>el instanceof HTMLCanvasElement && el.toDataURL())).not.toBe(face);
  await page.getByRole('button',{name:'Voir le bilan'}).click();
  await expect(page.getByRole('dialog',{name:'Défaite'})).not.toContainText('Inventaire');
  await page.getByRole('button',{name:'Retour au plateau'}).click();
  await expect.poll(()=>scene(page)).toBe('Board');
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
