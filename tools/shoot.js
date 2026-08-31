#!/usr/bin/env node
/* Capturas por scroll en Chrome headless + errores de consola.
   Los paneles de navegador integrados capturan mal las capas compuestas
   (devuelven frames negros justo en las escenas 3D); esto renderiza fiel.

   requiere:  npm i -D puppeteer-core

   uso:
     node tools/shoot.js /tmp/shots
     node tools/shoot.js /tmp/m http://localhost:4321 390 844
     STOPS=0,250,500,900 node tools/shoot.js /tmp/hero      # paradas a medida
     CHROME=/ruta/a/chrome node tools/shoot.js /tmp/shots   # binario a medida
*/
const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CANDIDATES = [
  process.env.CHROME,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
].filter(Boolean);

const CHROME = CANDIDATES.find((p) => { try { return fs.existsSync(p); } catch { return false; } });
if (!CHROME) {
  console.error('No encuentro Chrome. Pásalo con CHROME=/ruta/al/binario');
  process.exit(1);
}

const outDir = process.argv[2] || '/tmp/shots';
const url    = process.argv[3] || 'http://localhost:4321';
const W      = parseInt(process.argv[4] || '1440', 10);
const H      = parseInt(process.argv[5] || '900', 10);
const STOPS  = (process.env.STOPS || '').split(',').filter(Boolean).map(Number);
const SETTLE = Number(process.env.SETTLE || 900);   // ms de espera tras cada scroll

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--force-device-scale-factor=1'],
    defaultViewport: { width: W, height: H },
  });

  const page = await browser.newPage();
  const issues = [];
  page.on('console', (m) => { if (m.type() === 'error') issues.push('consola: ' + m.text()); });
  page.on('pageerror', (e) => issues.push('error js: ' + e.message));
  page.on('requestfailed', (r) => issues.push('petición fallida: ' + r.url()));

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });
  await sleep(2500);   // fuentes + animación de entrada

  const height = await page.evaluate(() => document.body.scrollHeight);
  const stops = STOPS.length
    ? STOPS
    : Array.from({ length: Math.ceil((height - H) / (H * 0.85)) + 1 },
                 (_, i) => Math.min(height - H, Math.round(i * H * 0.85)));

  let i = 0;
  for (const y of stops) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await sleep(SETTLE);
    await page.screenshot({ path: `${outDir}/${String(i).padStart(2, '0')}-y${y}.png` });
    i++;
  }

  console.log(`alto de página ${height} · ${i} capturas en ${outDir} · viewport ${W}x${H}`);
  if (issues.length) {
    console.log('\nINCIDENCIAS (las peticiones de vídeo abortadas al cerrar son ruido,\n' +
                'confírmalas con una petición Range manual antes de perseguirlas):\n' +
                [...new Set(issues)].join('\n'));
  } else {
    console.log('sin errores de consola ni peticiones fallidas');
  }

  await browser.close();
})();
