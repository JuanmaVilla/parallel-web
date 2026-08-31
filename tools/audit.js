#!/usr/bin/env node
/* Comprobaciones que una captura no ve.
   Recorre la pagina en cuatro anchos y reporta scroll horizontal (con el
   elemento culpable), imagenes sin alt, y errores de consola. Repite la
   primera pasada con prefers-reduced-motion para verificar que la pagina
   sigue entendiendose sin movimiento.

   requiere:  npm i -D puppeteer-core
   uso:       node tools/audit.js [url]
*/
const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CANDIDATES = [
  process.env.CHROME,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

const CHROME = CANDIDATES.find((p) => { try { return fs.existsSync(p); } catch { return false; } });
if (!CHROME) {
  console.error('No encuentro Chrome. Pasalo con CHROME=/ruta/al/binario');
  process.exit(1);
}

const url = process.argv[2] || 'http://localhost:3000/es';
const SIZES = [[1440, 900], [1280, 800], [768, 1024], [390, 844]];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const probe = () => {
  const de = document.documentElement;
  const offenders = [];
  if (de.scrollWidth > de.clientWidth + 1) {
    document.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0) return;
      if (r.right > de.clientWidth + 1 || r.left < -1) {
        const cls = typeof el.className === 'string' ? el.className : el.className.baseVal || '';
        offenders.push(`<${el.tagName.toLowerCase()} class="${cls.slice(0, 70)}"> [${Math.round(r.left)}..${Math.round(r.right)}]`);
      }
    });
  }
  const noAlt = [...document.querySelectorAll('img')]
    .filter((img) => img.getAttribute('alt') === null)
    .map((img) => img.currentSrc || img.src);

  return {
    scrollWidth: de.scrollWidth,
    clientWidth: de.clientWidth,
    offenders: offenders.slice(0, 6),
    noAlt,
  };
};

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--force-device-scale-factor=1'],
  });

  let failed = false;

  for (const [w, h] of SIZES) {
    const page = await browser.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setViewport({ width: w, height: h });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });
    await sleep(1800);

    const r = await page.evaluate(probe);
    const overflow = r.scrollWidth > r.clientWidth + 1;
    if (overflow || r.noAlt.length || errors.length) failed = true;

    console.log(`\n${w}x${h}`);
    console.log(`  scroll horizontal: ${overflow ? `SI (${r.scrollWidth} > ${r.clientWidth})` : 'no'}`);
    r.offenders.forEach((o) => console.log(`    ${o}`));
    console.log(`  imagenes sin alt:  ${r.noAlt.length || 'ninguna'}`);
    r.noAlt.forEach((s) => console.log(`    ${s}`));
    console.log(`  errores:           ${errors.length || 'ninguno'}`);
    [...new Set(errors)].forEach((e) => console.log(`    ${e}`));

    await page.close();
  }

  // Movimiento reducido: la pagina tiene que seguir siendo legible y usable.
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(url, { waitUntil: 'networkidle2' });
  await sleep(1800);
  const reduced = await page.evaluate(() => {
    // Nada que dependa de JS puede quedarse invisible con el motion apagado.
    const hidden = [...document.querySelectorAll('[data-reveal], [data-reveal-stagger] > *, .pl-split__word > span')]
      .filter((el) => Number(getComputedStyle(el).opacity) < 0.9).length;
    return { hidden, height: document.documentElement.scrollHeight };
  });
  console.log(`\nprefers-reduced-motion: reduce`);
  console.log(`  bloques que quedan invisibles: ${reduced.hidden}`);
  console.log(`  alto de pagina: ${reduced.height}`);
  if (reduced.hidden) failed = true;
  await page.close();

  await browser.close();
  process.exit(failed ? 1 : 0);
})();
