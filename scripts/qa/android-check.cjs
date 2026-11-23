/* eslint-disable @typescript-eslint/no-require-imports -- samostatný QA skript v CommonJS */
/**
 * Kontrola správania na Androide (Chrome) a iPhone — Playwright, emulácia zariadení.
 *
 * Spustenie (nie je to závislosť projektu, Playwright treba mať nainštalovaný zvlášť):
 *   npm run build && npx next start -p 3100
 *   node scripts/qa/android-check.cjs /tmp/kutisko-android   # priečinok na snímky
 *
 * Overuje: systémové Späť zatvára dialógy (aj bez CloseWatcher = starší prehliadač),
 * krížik upratuje históriu, použitie filtrov, tlačidlo Nainštalovať (simulovaná
 * udalosť beforeinstallprompt), iPhone bez zmeny histórie, šírky 360 a 412 px bez pretečenia.
 */
const { chromium, devices } = require('playwright');
const B = 'http://localhost:3100';
const out = process.argv[2] || require('os').tmpdir();
const results = [];
const ok = (name, cond, extra='') => { results.push(`${cond ? 'PASS' : 'FAIL'} ${name} ${extra}`); };
async function ctx(b, dev, { noCloseWatcher = false } = {}) {
  const c = await b.newContext({ ...devices[dev] });
  if (noCloseWatcher) await c.addInitScript(() => { delete window.CloseWatcher; });
  return c;
}
const dialogOpen = (p) => p.evaluate(() => [...document.querySelectorAll('dialog')].some(d => d.open));
(async () => {
  const b = await chromium.launch();
  for (const mode of [{ noCloseWatcher: true, tag: 'fallback' }, { noCloseWatcher: false, tag: 'native' }]) {
    const c = await ctx(b, 'Pixel 7', mode); const p = await c.newPage();
    await p.goto(B + '/hladat'); await p.waitForLoadState('networkidle');
    // 1) Späť zatvorí filtre a ostane na stránke
    await p.getByRole('button', { name: /^Filtre/ }).click(); await p.waitForTimeout(300);
    ok(`[${mode.tag}] filtre otvorené`, await dialogOpen(p));
    if (mode.tag === 'fallback') {
      await p.goBack(); await p.waitForTimeout(400);
      ok(`[${mode.tag}] Späť zavrie filtre`, !(await dialogOpen(p)) && p.url().endsWith('/hladat'), p.url());
    } else {
      await p.keyboard.press('Escape'); await p.waitForTimeout(400); // Esc = CloseWatcher ako systémové Späť
      ok(`[${mode.tag}] CloseWatcher zavrie filtre`, !(await dialogOpen(p)));
      const st = await p.evaluate(() => history.state && history.state.kutiskoDialog);
      ok(`[${mode.tag}] po zatvorení nie je navrchu náš záznam`, !st);
    }
    // 2) Krížik zatvorí a odoberie záznam
    await p.getByRole('button', { name: /^Filtre/ }).click(); await p.waitForTimeout(300);
    await p.getByRole('button', { name: 'Zavrieť filtre' }).click(); await p.waitForTimeout(400);
    const st2 = await p.evaluate(() => history.state && history.state.kutiskoDialog);
    ok(`[${mode.tag}] krížik: zavreté, záznam odobratý`, !(await dialogOpen(p)) && !st2);
    // 3) Použiť filtre: URL sa zmení a Späť nevráti „prázdny“ krok
    await p.getByRole('button', { name: /^Filtre/ }).click(); await p.waitForTimeout(300);
    await p.locator('dialog[open]').getByText('Iba zadarmo').click();
    await p.locator('dialog[open]').getByRole('button', { name: /^Zobraziť|Žiadne/ }).click(); await p.waitForTimeout(800);
    ok(`[${mode.tag}] použiť filtre: zavreté, URL s filtrom`, !(await dialogOpen(p)) && p.url().includes('?'), p.url());
    ok(`[${mode.tag}] bez kutiskoDialog navrchu`, !(await p.evaluate(() => history.state && history.state.kutiskoDialog)));
    await p.waitForTimeout(300); await p.goBack(); await p.waitForTimeout(600);
    ok(`[${mode.tag}] Späť po použití filtrov odíde zo stránky jedným ťuknutím (filtre sa menia cez replace, bez prázdneho kroku)`, !p.url().includes('/hladat'), p.url());
    // 4) Detail: navigácia + galéria
    await p.goto(B + '/miesto/web-minicity-raca'); await p.waitForLoadState('networkidle');
    await p.getByRole('button', { name: 'Navigovať', exact: true }).last().click(); await p.waitForTimeout(300);
    ok(`[${mode.tag}] navigácia otvorená`, await dialogOpen(p));
    if (mode.tag === 'fallback') { await p.goBack(); } else { await p.keyboard.press('Escape'); }
    await p.waitForTimeout(500);
    ok(`[${mode.tag}] Späť zavrie navigáciu, ostáva detail`, !(await dialogOpen(p)) && p.url().includes('/miesto/'), p.url());
    // ďalšie Späť už odíde zo stránky
    await p.goBack(); await p.waitForTimeout(800);
    ok(`[${mode.tag}] ďalšie Späť odíde z detailu`, !p.url().includes('/miesto/'), p.url());
    await c.close();
  }
  // iPhone: bez zmeny histórie
  {
    const c = await b.newContext({ ...devices['iPhone 13'] }); const p = await c.newPage();
    await p.goto(B + '/hladat'); await p.waitForLoadState('networkidle');
    const h0 = await p.evaluate(() => history.length);
    await p.getByRole('button', { name: /^Filtre/ }).click(); await p.waitForTimeout(400);
    const h1 = await p.evaluate(() => history.length);
    ok('[iPhone] otvorenie dialógu nemení históriu', h0 === h1, `${h0}->${h1}`);
    await p.goto(B + '/profil'); await p.waitForLoadState('networkidle');
    ok('[iPhone] karta s návodom', await p.getByText('Pridať na plochu“').isVisible());
    await p.screenshot({ path: `${out}/iphone-profil.png`, fullPage: false });
    await c.close();
  }
  // Inštalácia (Android): simulovaná udalosť beforeinstallprompt
  for (const dev of ['Galaxy S8', 'Pixel 7']) {
    const c = await b.newContext({ ...devices[dev] }); const p = await c.newPage();
    await p.goto(B + '/profil'); await p.waitForLoadState('networkidle');
    ok(`[${dev}] bez okna: návod cez menu`, await p.getByText(/Inštalovať aplikáciu“\./).isVisible());
    await p.evaluate(() => {
      const e = new Event('beforeinstallprompt', { cancelable: true });
      e.prompt = async () => { window.__prompted = true; };
      e.userChoice = Promise.resolve({ outcome: 'accepted' });
      window.dispatchEvent(e);
    });
    await p.waitForTimeout(200);
    const btn = p.getByRole('button', { name: 'Nainštalovať aplikáciu' });
    ok(`[${dev}] tlačidlo Nainštalovať`, await btn.isVisible());
    await btn.scrollIntoViewIfNeeded();
    await p.screenshot({ path: `${out}/${dev.replace(/ /g,'')}-profil-instalacia.png` });
    await btn.click(); await p.waitForTimeout(400);
    ok(`[${dev}] okno vyvolané a karta zmizne`, (await p.evaluate(() => window.__prompted)) && !(await btn.isVisible()));
    for (const path of ['/', '/hladat', '/hladat?zobrazenie=mapa', '/miesto/web-minicity-raca', '/ulozene']) {
      await p.goto(B + path); await p.waitForLoadState('networkidle'); await p.waitForTimeout(500);
      const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      ok(`[${dev}] ${path} bez vodorovného pretečenia`, overflow <= 0, `+${overflow}px`);
      await p.screenshot({ path: `${out}/${dev.replace(/ /g,'')}${path.replace(/[/?=]/g,'_')}.png` });
    }
    await c.close();
  }
  await b.close();
  console.log(results.join('\n'));
})();
