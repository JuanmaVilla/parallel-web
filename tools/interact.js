#!/usr/bin/env node
/* Lo que una captura no comprueba: hover, menu movil, teclado y el estado
   con el movimiento apagado. Guarda una captura de cada paso.

   requiere:  npm i -D puppeteer-core
   uso:       node tools/interact.js /tmp/ux [url]
*/
const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME = [
  process.env.CHROME,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
].filter(Boolean).find((p) => { try { return fs.existsSync(p); } catch { return false; } });

if (!CHROME) {
  console.error('No encuentro Chrome. Pasalo con CHROME=/ruta/al/binario');
  process.exit(1);
}

const outDir = process.argv[2] || '/tmp/ux';
const url = process.argv[3] || 'http://localhost:3000/es';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--force-device-scale-factor=1'],
  });

  // --- hover sobre una tarjeta: el halo tiene que encenderse ---
  const desk = await browser.newPage();
  await desk.setViewport({ width: 1440, height: 900 });
  await desk.goto(url, { waitUntil: 'networkidle2' });
  await sleep(1500);
  await desk.evaluate(() => {
    document.querySelector('#capacidades')?.scrollIntoView({ block: 'center' });
  });
  await sleep(1200);

  const card = await desk.$('#capacidades .pl-spot');
  await card.hover();
  await sleep(500);
  const spot = await desk.evaluate(() => {
    const el = document.querySelector('#capacidades .pl-spot');
    return {
      opacity: getComputedStyle(el, '::before').opacity,
      mx: el.style.getPropertyValue('--mx'),
    };
  });
  console.log(`halo de puntero: opacidad ${spot.opacity}, --mx "${spot.mx || 'sin escribir'}"`);
  await desk.screenshot({ path: `${outDir}/01-hover-tarjeta.png` });

  // --- foco de teclado visible ---
  await desk.evaluate(() => window.scrollTo(0, 0));
  await sleep(600);
  await desk.keyboard.press('Tab');
  await desk.keyboard.press('Tab');
  const focus = await desk.evaluate(() => {
    const el = document.activeElement;
    const s = getComputedStyle(el);
    return { tag: el.tagName, text: (el.textContent || '').trim().slice(0, 30), outline: s.outlineWidth };
  });
  console.log(`foco: <${focus.tag}> "${focus.text}" outline ${focus.outline}`);
  await desk.screenshot({ path: `${outDir}/02-foco.png` });
  await desk.close();

  // --- menu movil: abre, cierra con Escape ---
  const mob = await browser.newPage();
  await mob.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await mob.goto(url, { waitUntil: 'networkidle2' });
  await sleep(1500);
  await mob.click('header button[aria-expanded]');
  await sleep(400);
  const opened = await mob.$eval('header button[aria-expanded]', (b) => b.getAttribute('aria-expanded'));
  await mob.screenshot({ path: `${outDir}/03-menu-abierto.png` });
  await mob.keyboard.press('Escape');
  await sleep(400);
  const closed = await mob.$eval('header button[aria-expanded]', (b) => b.getAttribute('aria-expanded'));
  console.log(`menu movil: abre=${opened} cierra con Escape=${closed === 'false'}`);
  await mob.close();

  // --- movimiento reducido ---
  const calm = await browser.newPage();
  await calm.setViewport({ width: 1440, height: 900 });
  await calm.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await calm.goto(url, { waitUntil: 'networkidle2' });
  await sleep(1800);
  await calm.screenshot({ path: `${outDir}/04-sin-movimiento.png` });
  await calm.evaluate(() => window.scrollTo(0, window.innerHeight * 1.2));
  await sleep(1000);
  await calm.screenshot({ path: `${outDir}/05-sin-movimiento-scroll.png` });
  await calm.close();

  console.log(`capturas en ${outDir}`);
  await browser.close();
})();
